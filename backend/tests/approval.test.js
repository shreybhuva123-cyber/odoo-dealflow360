import test from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { generateAccessToken } from '../src/utils/jwt.js';
import { QuoteStatus, UserRole, CustomerTier, ApprovalStatus } from '@prisma/client';
import { quotationService } from '../src/services/quotationService.js';
import { approvalService } from '../src/services/approvalService.js';

test('Phase 7: Approval Workflow Engine Comprehensive Test Suite', async (t) => {
  let server;
  const port = 5080;
  const baseUrl = `http://localhost:${port}`;

  let adminToken, sales1Token, sales2Token, managerToken, financeToken, opsToken;
  let adminUser, salesUser1, salesUser2, managerUser, financeUser, opsUser;
  let goldCustomer, silverCustomer, bronzeCustomer;
  let hardwareCategory;
  let laptopProduct;

  await t.test('Bootstrap: Test server, users, customers, categories, products', async () => {
    await new Promise((resolve) => {
      server = app.listen(port, () => resolve());
    });
    assert.ok(server);

    // Fetch users
    adminUser = await prisma.user.findUnique({ where: { email: 'admin@dealflow360.com' } });
    salesUser1 = await prisma.user.findUnique({ where: { email: 'sales.rep@dealflow360.com' } });
    salesUser2 = await prisma.user.findUnique({ where: { email: 'sales.rep2@dealflow360.com' } });
    managerUser = await prisma.user.findUnique({ where: { email: 'sales.manager@dealflow360.com' } });
    financeUser = await prisma.user.findUnique({ where: { email: 'finance@dealflow360.com' } });
    opsUser = await prisma.user.findUnique({ where: { email: 'operations@dealflow360.com' } });

    assert.ok(adminUser && salesUser1 && managerUser && financeUser && opsUser);

    adminToken = generateAccessToken(adminUser);
    sales1Token = generateAccessToken(salesUser1);
    sales2Token = generateAccessToken(salesUser2 || salesUser1);
    managerToken = generateAccessToken(managerUser);
    financeToken = generateAccessToken(financeUser);
    opsToken = generateAccessToken(opsUser);

    // Fetch customers
    goldCustomer = await prisma.customer.findFirst({
      where: { customerTier: CustomerTier.GOLD, isActive: true },
    });
    silverCustomer = await prisma.customer.findFirst({
      where: { customerTier: CustomerTier.SILVER, isActive: true },
    });
    bronzeCustomer = await prisma.customer.findFirst({
      where: { customerTier: CustomerTier.BRONZE, isActive: true },
    });
    assert.ok(goldCustomer && silverCustomer && bronzeCustomer);

    // Fetch category and product
    hardwareCategory = await prisma.productCategory.findUnique({ where: { name: 'Hardware' } });
    laptopProduct = await prisma.product.findUnique({ where: { sku: 'HW-LAPTOP-15' } });
    assert.ok(hardwareCategory && laptopProduct);
  });

  // ==========================================
  // Helper to create & submit quote
  // ==========================================
  async function createAndSubmitQuote({
    salesUser = salesUser1,
    customer = bronzeCustomer,
    product = laptopProduct,
    quantity = 1,
    discountPercentage = 4, // 4% triggers 1 step: SALES_MANAGER
  } = {}) {
    const quote = await quotationService.createQuotation(salesUser.id, {
      customerId: customer.id,
    });

    await quotationService.addQuotationItem(quote.id, salesUser, {
      productId: product.id,
      quantity,
      discountPercentage,
    });

    const submitted = await quotationService.submitQuotation(quote.id, salesUser);
    const approvals = await prisma.approval.findMany({
      where: { quotationId: quote.id },
      orderBy: { stepOrder: 'asc' },
    });

    return { quote: submitted, approvals };
  }

  // ==========================================
  // AUTHORIZATION TESTS (1–6)
  // ==========================================

  let testQuoteAuth, testApprovalAuth;

  await t.test('1. Sales rep cannot approve (403 Forbidden)', async () => {
    const setup = await createAndSubmitQuote();
    testQuoteAuth = setup.quote;
    testApprovalAuth = setup.approvals[0];
    assert.ok(testApprovalAuth);

    const res = await fetch(`${baseUrl}/api/approvals/${testApprovalAuth.id}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sales1Token}`,
      },
    });

    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.match(body.message, /forbidden|permission|denied|prohibited/i);
  });

  await t.test('2. Sales manager can approve manager approval', async () => {
    assert.strictEqual(testApprovalAuth.approvalRole, UserRole.SALES_MANAGER);

    const res = await fetch(`${baseUrl}/api/approvals/${testApprovalAuth.id}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${managerToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.approval.status, ApprovalStatus.APPROVED);
    assert.strictEqual(body.data.approval.approverId, managerUser.id);
  });

  await t.test('3. Finance can approve finance approval', async () => {
    const quote = await quotationService.createQuotation(salesUser1.id, {
      customerId: bronzeCustomer.id,
    });
    await quotationService.addQuotationItem(quote.id, salesUser1, {
      productId: laptopProduct.id,
      quantity: 1,
      discountPercentage: 25,
    });
    await quotationService.submitQuotation(quote.id, salesUser1);

    const managerStep = await prisma.approval.findFirst({
      where: { quotationId: quote.id, approvalRole: UserRole.SALES_MANAGER },
    });
    assert.ok(managerStep);
    await approvalService.approveQuotation(managerStep.id, managerUser);

    const financeApproval = await prisma.approval.findFirst({
      where: { quotationId: quote.id, approvalRole: UserRole.FINANCE },
    });
    assert.ok(financeApproval);

    const res = await fetch(`${baseUrl}/api/approvals/${financeApproval.id}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${financeToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.approval.status, ApprovalStatus.APPROVED);
    assert.strictEqual(body.data.approval.approverId, financeUser.id);
  });

  await t.test('4. Unauthorized role is rejected (OPERATIONS -> 403)', async () => {
    const setup = await createAndSubmitQuote();
    const app = setup.approvals[0];

    const res = await fetch(`${baseUrl}/api/approvals/${app.id}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${opsToken}`,
      },
    });

    assert.strictEqual(res.status, 403);
  });

  await t.test("5. User cannot approve another role's approval (Finance -> Sales Manager step)", async () => {
    const setup = await createAndSubmitQuote();
    const managerApp = setup.approvals.find((a) => a.approvalRole === UserRole.SALES_MANAGER);
    assert.ok(managerApp);

    const res = await fetch(`${baseUrl}/api/approvals/${managerApp.id}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${financeToken}`,
      },
    });

    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.match(body.message, /Finance users can only|permission/i);
  });

  await t.test('6. Sales rep cannot approve own quotation (Self-approval prevention)', async () => {
    // Create quote owned by managerUser acting as salesRep
    const quote = await quotationService.createQuotation(managerUser.id, {
      customerId: bronzeCustomer.id,
    });
    await quotationService.addQuotationItem(quote.id, managerUser, {
      productId: laptopProduct.id,
      quantity: 1,
      discountPercentage: 4,
    });
    await quotationService.submitQuotation(quote.id, managerUser);

    const app = await prisma.approval.findFirst({
      where: { quotationId: quote.id, approvalRole: UserRole.SALES_MANAGER },
    });
    assert.ok(app);

    const res = await fetch(`${baseUrl}/api/approvals/${app.id}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${managerToken}`,
      },
    });

    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.match(body.message, /prohibited from approving their own/i);
  });

  // ==========================================
  // APPROVAL CREATION TESTS (7–10)
  // ==========================================

  await t.test('7. Correct approval request created for single-role trigger', async () => {
    const setup = await createAndSubmitQuote({ discountPercentage: 4 });
    const apps = setup.approvals;
    assert.strictEqual(apps.length, 1);
    assert.strictEqual(apps[0].approvalRole, UserRole.SALES_MANAGER);
    assert.strictEqual(apps[0].stepOrder, 1);
    assert.strictEqual(apps[0].status, ApprovalStatus.PENDING);
  });

  await t.test('8. Multiple approval requests created correctly for compounding risk', async () => {
    const quote = await quotationService.createQuotation(salesUser1.id, {
      customerId: bronzeCustomer.id,
    });
    await quotationService.addQuotationItem(quote.id, salesUser1, {
      productId: laptopProduct.id,
      quantity: 1,
      discountPercentage: 25,
    });
    await quotationService.submitQuotation(quote.id, salesUser1);

    const apps = await prisma.approval.findMany({
      where: { quotationId: quote.id },
      orderBy: { stepOrder: 'asc' },
    });

    assert.strictEqual(apps.length, 2);
    assert.strictEqual(apps[0].approvalRole, UserRole.SALES_MANAGER);
    assert.strictEqual(apps[0].stepOrder, 1);
    assert.strictEqual(apps[1].approvalRole, UserRole.FINANCE);
    assert.strictEqual(apps[1].stepOrder, 2);
  });

  await t.test('9. Duplicate requests are prevented on re-evaluation/re-submit', async () => {
    const setup = await createAndSubmitQuote();
    const countBefore = await prisma.approval.count({ where: { quotationId: setup.quote.id } });

    // Calling createApprovalRequests again returns existing without creating new rows
    const evalData = { approvalRequired: true, approvalRequirements: [UserRole.SALES_MANAGER] };
    const res = await approvalService.createApprovalRequests(setup.quote.id, evalData);

    const countAfter = await prisma.approval.count({ where: { quotationId: setup.quote.id } });
    assert.strictEqual(countBefore, countAfter);
    assert.strictEqual(res.length, countBefore);
  });

  await t.test('10. Correct approval order is created (SALES_MANAGER=1, FINANCE=2)', async () => {
    const quote = await quotationService.createQuotation(salesUser1.id, {
      customerId: bronzeCustomer.id,
    });
    await quotationService.addQuotationItem(quote.id, salesUser1, {
      productId: laptopProduct.id,
      quantity: 1,
      discountPercentage: 25,
    });
    await quotationService.submitQuotation(quote.id, salesUser1);

    const apps = await prisma.approval.findMany({
      where: { quotationId: quote.id },
      orderBy: { stepOrder: 'asc' },
    });

    assert.strictEqual(apps[0].stepOrder, 1);
    assert.strictEqual(apps[0].approvalRole, UserRole.SALES_MANAGER);
    assert.strictEqual(apps[1].stepOrder, 2);
    assert.strictEqual(apps[1].approvalRole, UserRole.FINANCE);
  });

  // ==========================================
  // APPROVAL FLOW TESTS (11–15)
  // ==========================================

  let testApprovalFlowQuote, testApprovalStep1, testApprovalStep2;

  await t.test('11. Pending approval can be approved', async () => {
    const quote = await quotationService.createQuotation(salesUser1.id, {
      customerId: bronzeCustomer.id,
    });
    await quotationService.addQuotationItem(quote.id, salesUser1, {
      productId: laptopProduct.id,
      quantity: 1,
      discountPercentage: 25,
    });
    await quotationService.submitQuotation(quote.id, salesUser1);

    const apps = await prisma.approval.findMany({
      where: { quotationId: quote.id },
      orderBy: { stepOrder: 'asc' },
    });
    testApprovalFlowQuote = quote;
    testApprovalStep1 = apps[0];
    testApprovalStep2 = apps[1];

    const res = await fetch(`${baseUrl}/api/approvals/${testApprovalStep1.id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.approval.status, ApprovalStatus.APPROVED);
    assert.ok(body.data.approval.decidedAt);
  });

  await t.test('12. Already approved approval cannot be approved again (400 Bad Request)', async () => {
    const res = await fetch(`${baseUrl}/api/approvals/${testApprovalStep1.id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.match(body.message, /already been approved/i);
  });

  await t.test('13. Approved approval cannot be rejected (400 Bad Request)', async () => {
    const res = await fetch(`${baseUrl}/api/approvals/${testApprovalStep1.id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({ rejectionReason: 'Changed my mind' }),
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.match(body.message, /already been approved/i);
  });

  await t.test('14. Invalid approver rejected (non-existent approval ID -> 404)', async () => {
    const res = await fetch(`${baseUrl}/api/approvals/00000000-0000-0000-0000-000000000000/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.strictEqual(res.status, 404);
  });

  await t.test('15. Prerequisite approval enforced (Step 2 blocked if Step 1 pending)', async () => {
    const quote = await quotationService.createQuotation(salesUser1.id, {
      customerId: bronzeCustomer.id,
    });
    await quotationService.addQuotationItem(quote.id, salesUser1, {
      productId: laptopProduct.id,
      quantity: 1,
      discountPercentage: 25,
    });
    await quotationService.submitQuotation(quote.id, salesUser1);

    const apps = await prisma.approval.findMany({
      where: { quotationId: quote.id },
      orderBy: { stepOrder: 'asc' },
    });

    const step2 = apps[1];
    const res = await fetch(`${baseUrl}/api/approvals/${step2.id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${financeToken}` },
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.match(body.message, /Prerequisite approval step 1 .* must be approved/i);
  });

  // ==========================================
  // REJECTION TESTS (16–20)
  // ==========================================

  let testRejectQuote, testRejectStep1, testRejectStep2;

  await t.test('16. Pending approval can be rejected', async () => {
    const quote = await quotationService.createQuotation(salesUser1.id, {
      customerId: bronzeCustomer.id,
    });
    await quotationService.addQuotationItem(quote.id, salesUser1, {
      productId: laptopProduct.id,
      quantity: 1,
      discountPercentage: 25,
    });
    await quotationService.submitQuotation(quote.id, salesUser1);

    const apps = await prisma.approval.findMany({
      where: { quotationId: quote.id },
      orderBy: { stepOrder: 'asc' },
    });
    testRejectQuote = quote;
    testRejectStep1 = apps[0];
    testRejectStep2 = apps[1];

    const res = await fetch(`${baseUrl}/api/approvals/${testRejectStep1.id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({ rejectionReason: 'Margin is completely unacceptable for this deal' }),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.approval.status, ApprovalStatus.REJECTED);
    assert.strictEqual(body.data.approval.rejectionReason, 'Margin is completely unacceptable for this deal');
  });

  await t.test('17. Rejection reason required (missing or too short -> 400)', async () => {
    const setup = await createAndSubmitQuote();
    const app = setup.approvals[0];

    // Missing rejection reason
    const resMissing = await fetch(`${baseUrl}/api/approvals/${app.id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({}),
    });
    assert.strictEqual(resMissing.status, 400);

    // Too short (< 3 chars)
    const resShort = await fetch(`${baseUrl}/api/approvals/${app.id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({ rejectionReason: 'no' }),
    });
    assert.strictEqual(resShort.status, 400);
  });

  await t.test('18. Rejected approval cannot be approved (400 Bad Request)', async () => {
    const res = await fetch(`${baseUrl}/api/approvals/${testRejectStep1.id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.match(body.message, /already been rejected/i);
  });

  await t.test('19. Remaining approvals handled correctly (marked CANCELLED)', async () => {
    const step2After = await prisma.approval.findUnique({
      where: { id: testRejectStep2.id },
    });
    assert.strictEqual(step2After.status, ApprovalStatus.CANCELLED);
  });

  await t.test('20. Rejection history preserved in ActionHistory and AuditLogs', async () => {
    const actions = await prisma.approvalActionHistory.findMany({
      where: { quotationId: testRejectQuote.id },
    });
    assert.ok(actions.length > 0);
    const rejectAction = actions.find((a) => a.action === 'REJECTED');
    assert.ok(rejectAction);
    assert.strictEqual(rejectAction.reason, 'Margin is completely unacceptable for this deal');
    assert.strictEqual(rejectAction.reviewerId, managerUser.id);
  });

  // ==========================================
  // QUOTATION STATUS MANAGEMENT (21–24)
  // ==========================================

  await t.test('21. Quote becomes PENDING_APPROVAL after submission', async () => {
    const setup = await createAndSubmitQuote();
    assert.strictEqual(setup.quote.status, QuoteStatus.PENDING_APPROVAL);
  });

  await t.test('22. Quote becomes APPROVED after all approvals completed', async () => {
    const setup = await createAndSubmitQuote({ discountPercentage: 4 });
    const app = setup.approvals[0];

    const res = await fetch(`${baseUrl}/api/approvals/${app.id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.strictEqual(res.status, 200);

    const quoteAfter = await prisma.quotation.findUnique({ where: { id: setup.quote.id } });
    assert.strictEqual(quoteAfter.status, QuoteStatus.APPROVED);
  });

  await t.test('23. Quote becomes REJECTED after rejection', async () => {
    const quote = await prisma.quotation.findUnique({ where: { id: testRejectQuote.id } });
    assert.strictEqual(quote.status, QuoteStatus.REJECTED);
  });

  await t.test('24. Invalid status transitions blocked', async () => {
    // Cannot approve an approval for a quote that is already REJECTED
    const cancelledStep = await prisma.approval.findUnique({ where: { id: testRejectStep2.id } });
    const res = await fetch(`${baseUrl}/api/approvals/${cancelledStep.id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${financeToken}` },
    });
    assert.strictEqual(res.status, 400);
  });

  // ==========================================
  // SECURITY & ANTI-TAMPERING (25–29)
  // ==========================================

  let secQuote, secApproval;

  await t.test('25. Frontend cannot change approverId', async () => {
    const setup = await createAndSubmitQuote();
    secQuote = setup.quote;
    secApproval = setup.approvals[0];

    const res = await fetch(`${baseUrl}/api/approvals/${secApproval.id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({ approverId: adminUser.id }),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.approval.approverId, managerUser.id);
    assert.notStrictEqual(body.data.approval.approverId, adminUser.id);
  });

  await t.test('26. Frontend cannot change approvalRole', async () => {
    const setup = await createAndSubmitQuote();
    const app = setup.approvals[0];

    const res = await fetch(`${baseUrl}/api/approvals/${app.id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({ approvalRole: 'ADMIN' }),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.approval.approvalRole, UserRole.SALES_MANAGER);
  });

  await t.test('27. Frontend cannot change approvalStatus directly', async () => {
    const setup = await createAndSubmitQuote();
    const app = setup.approvals[0];

    // Attempting to send custom status
    const res = await fetch(`${baseUrl}/api/approvals/${app.id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({ status: 'CANCELLED' }),
    });

    assert.strictEqual(res.status, 200);
    const updated = await prisma.approval.findUnique({ where: { id: app.id } });
    assert.strictEqual(updated.status, ApprovalStatus.APPROVED);
  });

  await t.test('28. Frontend cannot change quotation status directly', async () => {
    const setup = await createAndSubmitQuote();
    const res = await fetch(`${baseUrl}/api/quotations/${setup.quote.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({ status: 'APPROVED' }),
    });

    // Quotation update endpoint is strictly for metadata and doesn't accept status
    const quote = await prisma.quotation.findUnique({ where: { id: setup.quote.id } });
    assert.strictEqual(quote.status, QuoteStatus.PENDING_APPROVAL);
  });

  await t.test('29. Frontend cannot bypass approval requirements', async () => {
    const setup = await createAndSubmitQuote();
    const quote = await prisma.quotation.findUnique({ where: { id: setup.quote.id } });
    assert.strictEqual(quote.approvalRequired, true);
    assert.strictEqual(quote.status, QuoteStatus.PENDING_APPROVAL);
  });

  // ==========================================
  // CONCURRENCY & RACE CONDITIONS (30–31)
  // ==========================================

  await t.test('30. Two simultaneous approvals do not corrupt state', async () => {
    const setup = await createAndSubmitQuote();
    const app = setup.approvals[0];

    // Fire two approvals concurrently
    const [res1, res2] = await Promise.all([
      fetch(`${baseUrl}/api/approvals/${app.id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${managerToken}` },
      }),
      fetch(`${baseUrl}/api/approvals/${app.id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${managerToken}` },
      }),
    ]);

    const statuses = [res1.status, res2.status].sort();
    // Exactly one should succeed (200), and the second should be rejected (400)
    assert.strictEqual(statuses[0], 200);
    assert.strictEqual(statuses[1], 400);

    const check = await prisma.approval.findUnique({ where: { id: app.id } });
    assert.strictEqual(check.status, ApprovalStatus.APPROVED);
  });

  await t.test('31. Same approval cannot be approved twice', async () => {
    const setup = await createAndSubmitQuote();
    const app = setup.approvals[0];

    const first = await fetch(`${baseUrl}/api/approvals/${app.id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.strictEqual(first.status, 200);

    const second = await fetch(`${baseUrl}/api/approvals/${app.id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.strictEqual(second.status, 400);
  });

  // ==========================================
  // REST API COVERAGE (32–38)
  // ==========================================

  let apiQuote, apiApproval;

  await t.test('32. GET /api/quotations/:id/approvals returns complete approval chain', async () => {
    const setup = await createAndSubmitQuote({ discountPercentage: 4 });
    apiQuote = setup.quote;
    apiApproval = setup.approvals[0];

    const res = await fetch(`${baseUrl}/api/quotations/${apiQuote.id}/approvals`, {
      headers: { Authorization: `Bearer ${sales1Token}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.quotation);
    assert.ok(Array.isArray(body.data.approvals));
    assert.strictEqual(body.data.approvals.length, 1);
    assert.strictEqual(body.data.approvals[0].id, apiApproval.id);
  });

  await t.test('33. GET /api/approvals/pending returns actionable pending dashboard', async () => {
    const res = await fetch(`${baseUrl}/api/approvals/pending`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data.pendingApprovals));
    assert.ok(body.data.pagination);
    assert.strictEqual(typeof body.data.pagination.total, 'number');
  });

  await t.test('34. POST /api/approvals/:id/approve endpoint structure', async () => {
    const setup = await createAndSubmitQuote();
    const app = setup.approvals[0];

    const res = await fetch(`${baseUrl}/api/approvals/${app.id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${managerToken}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.approval);
    assert.ok(body.data.quotation);
    assert.ok(body.data.workflow);
    assert.strictEqual(body.data.approval.status, ApprovalStatus.APPROVED);
  });

  await t.test('35. POST /api/approvals/:id/reject endpoint structure', async () => {
    const setup = await createAndSubmitQuote();
    const app = setup.approvals[0];

    const res = await fetch(`${baseUrl}/api/approvals/${app.id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({ rejectionReason: 'Discount is excessive for Bronze customer' }),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.approval);
    assert.ok(body.data.quotation);
    assert.strictEqual(body.data.approval.status, ApprovalStatus.REJECTED);
    assert.strictEqual(body.data.quotation.status, QuoteStatus.REJECTED);
  });

  await t.test('36. GET /api/quotations/:id/approval-history returns chronological events', async () => {
    const res = await fetch(`${baseUrl}/api/quotations/${apiQuote.id}/approval-history`, {
      headers: { Authorization: `Bearer ${sales1Token}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.quotationId, apiQuote.id);
    assert.ok(Array.isArray(body.data.approvals));
    assert.ok(Array.isArray(body.data.actions));
    assert.ok(Array.isArray(body.data.auditLogs));
  });

  await t.test('37. Validation errors return structured 400 Bad Request', async () => {
    const setup = await createAndSubmitQuote();
    const app = setup.approvals[0];

    // Invalid rejection payload: missing reason
    const res = await fetch(`${baseUrl}/api/approvals/${app.id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({}),
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.message);
  });

  await t.test('38. Authorization errors return structured 401 & 403', async () => {
    const setup = await createAndSubmitQuote();
    const app = setup.approvals[0];

    // No token -> 401
    const resNoAuth = await fetch(`${baseUrl}/api/approvals/${app.id}/approve`, {
      method: 'POST',
    });
    assert.strictEqual(resNoAuth.status, 401);

    // Sales rep accessing pending approvals dashboard -> 403
    const resForbidden = await fetch(`${baseUrl}/api/approvals/pending`, {
      headers: { Authorization: `Bearer ${sales1Token}` },
    });
    assert.strictEqual(resForbidden.status, 403);
  });

  // ==========================================
  // Teardown
  // ==========================================
  await t.test('Teardown: Close test server & cleanup', async () => {
    await new Promise((resolve) => {
      server.close(() => resolve());
    });
  });
});
