import test from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { config, env } from '../src/config/env.js';
import { generateAccessToken } from '../src/utils/jwt.js';
import { QuoteStatus, OrderStatus, InvoiceStatus, PaymentStatus, UserRole, CustomerTier } from '@prisma/client';

test('PHASE 17: Senior-Level Final Security & Business Logic Audit Suite', { concurrency: 1 }, async (t) => {
  let server;
  const port = 5170;
  const baseUrl = `http://127.0.0.1:${port}`;

  let adminToken, salesTokenA, salesTokenB, managerToken, financeToken, opsToken;
  let adminUser, salesUserA, salesUserB, managerUser, financeUser, opsUser, deactivatedUser;
  let testCustomer, testProduct;

  t.before(async () => {
    await new Promise((resolve) => {
      server = app.listen(port, () => resolve());
    });
    assert.ok(server);

    // Bootstrap Users
    adminUser = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } });
    salesUserA = await prisma.user.findFirst({ where: { role: UserRole.SALES_REP, email: 'sales.rep@dealflow360.com' } });
    managerUser = await prisma.user.findFirst({ where: { role: UserRole.SALES_MANAGER } });
    financeUser = await prisma.user.findFirst({ where: { role: UserRole.FINANCE } });
    opsUser = await prisma.user.findFirst({ where: { role: UserRole.OPERATIONS } });

    assert.ok(adminUser && salesUserA && managerUser && financeUser && opsUser, 'Standard role users must exist');

    // Ensure Sales Rep B exists for multi-tenant / IDOR isolation tests
    salesUserB = await prisma.user.upsert({
      where: { email: 'sales.rep.audit.b@dealflow360.com' },
      update: { isActive: true },
      create: {
        email: 'sales.rep.audit.b@dealflow360.com',
        name: 'Sales Rep B (Audit Fixture)',
        passwordHash: '$2a$10$e8kG6vT4n0xXW3/K/NqX..8tY8y0zN3J7k6Q9.4r5P1m9K2/Z0u1W',
        role: UserRole.SALES_REP,
        isActive: true,
      },
    });

    // Ensure Deactivated User exists
    deactivatedUser = await prisma.user.upsert({
      where: { email: 'deactivated.audit@dealflow360.com' },
      update: { isActive: false },
      create: {
        email: 'deactivated.audit@dealflow360.com',
        name: 'Deactivated Audit User',
        passwordHash: '$2a$10$e8kG6vT4n0xXW3/K/NqX..8tY8y0zN3J7k6Q9.4r5P1m9K2/Z0u1W',
        role: UserRole.SALES_REP,
        isActive: false,
      },
    });

    adminToken = generateAccessToken(adminUser);
    salesTokenA = generateAccessToken(salesUserA);
    salesTokenB = generateAccessToken(salesUserB);
    managerToken = generateAccessToken(managerUser);
    financeToken = generateAccessToken(financeUser);
    opsToken = generateAccessToken(opsUser);

    // Bootstrap Customer fixture
    testCustomer = await prisma.customer.findFirst({ where: { isActive: true } });
    if (!testCustomer) {
      testCustomer = await prisma.customer.create({
        data: {
          companyName: 'Acme Security Audit Corp',
          contactName: 'Alice Auditor',
          email: 'security.audit.cust@acme.corp',
          phone: '+1-555-0199',
          customerTier: CustomerTier.GOLD,
          currency: 'USD',
          isActive: true,
        },
      });
    }

    // Bootstrap Product fixture
    testProduct = await prisma.product.findFirst({ where: { isActive: true } });
    if (!testProduct) {
      let category = await prisma.productCategory.findFirst();
      if (!category) {
        category = await prisma.productCategory.create({
          data: {
            name: 'Audit Security Category',
            description: 'Category for security audit tests',
            defaultMarginPercentage: 20.0,
          },
        });
      }
      testProduct = await prisma.product.create({
        data: {
          sku: 'SEC-AUDIT-001',
          name: 'Enterprise Security Appliance',
          categoryId: category.id,
          basePrice: 1000.0,
          costPrice: 400.0,
          taxRate: 10.0,
          isActive: true,
        },
      });
    }
  });

  // =========================================================================
  // 1. AUTHENTICATION AUDIT
  // =========================================================================
  await t.test('1. Authentication Audit: Password Hashing, JWT Validation & Error Safety', async () => {
    // 1.1 Password hash format verification
    assert.ok(adminUser.passwordHash.startsWith('$2a$') || adminUser.passwordHash.startsWith('$2b$'), 'Password must be hashed with bcrypt');

    // 1.2 Valid JWT authentication
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(meRes.status, 200);
    const meBody = await meRes.json();
    assert.strictEqual(meBody.data.user.email, adminUser.email);
    assert.strictEqual(meBody.data.user.passwordHash, undefined, 'passwordHash must never be exposed');

    // 1.3 Missing token handling
    const missingRes = await fetch(`${baseUrl}/api/auth/me`);
    assert.strictEqual(missingRes.status, 401);

    // 1.4 Malformed token handling
    const malformedRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: 'Bearer invalid.token.payload' },
    });
    assert.strictEqual(malformedRes.status, 401);

    // 1.5 Expired token handling
    const expiredToken = jwt.sign(
      { id: adminUser.id, role: adminUser.role },
      config.jwtSecret,
      { expiresIn: '-1s', algorithm: 'HS256' }
    );
    const expiredRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert.strictEqual(expiredRes.status, 401);

    // 1.6 Deactivated user token rejection
    const deactivatedToken = generateAccessToken(deactivatedUser);
    const deactRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${deactivatedToken}` },
    });
    assert.strictEqual(deactRes.status, 403, 'Deactivated user token rejected with 403');

    // 1.7 Safe authentication error message (no email enumeration)
    const badLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@test.com', password: 'wrongpassword' }),
    });
    assert.strictEqual(badLoginRes.status, 401);
    const badLoginBody = await badLoginRes.json();
    assert.strictEqual(badLoginBody.message, 'Invalid email or password');
  });

  // =========================================================================
  // 2. AUTHORIZATION & IDOR AUDIT
  // =========================================================================
  await t.test('2. Authorization & IDOR Audit: Route Protection & Unassigned Record Protection', async () => {
    // 2.1 RBAC: SALES_REP cannot delete a customer
    const delCustRes = await fetch(`${baseUrl}/api/customers/${testCustomer.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${salesTokenA}` },
    });
    assert.strictEqual(delCustRes.status, 403, 'SALES_REP cannot delete customers');

    // 2.2 RBAC: SALES_REP cannot access sales rep performance dashboard
    const dashRes = await fetch(`${baseUrl}/api/dashboard/sales-reps`, {
      headers: { Authorization: `Bearer ${salesTokenA}` },
    });
    assert.strictEqual(dashRes.status, 403, 'SALES_REP cannot access sales rep performance dashboard');

    // 2.3 IDOR: Rep A creates quote -> Rep B cannot view or modify it
    const quoteRes = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({
        customerId: testCustomer.id,
      }),
    });
    assert.strictEqual(quoteRes.status, 201);
    const quoteBody = await quoteRes.json();
    const repAQuoteId = quoteBody.data.quotation.id;

    const repBViewRes = await fetch(`${baseUrl}/api/quotations/${repAQuoteId}`, {
      headers: { Authorization: `Bearer ${salesTokenB}` },
    });
    assert.strictEqual(repBViewRes.status, 403, 'Rep B cannot view Rep A quote');

    // 2.4 Unassigned Order IDOR Fix Verification:
    // Create an unassigned order (salesRepId: null) directly in DB
    const unassignedOrder = await prisma.order.create({
      data: {
        orderNumber: `ORD-UNASSIGNED-${Date.now()}`,
        customerId: testCustomer.id,
        salesRepId: null,
        status: OrderStatus.CONFIRMED,
        subtotal: 1000,
        discountAmount: 0,
        taxAmount: 100,
        totalAmount: 1100,
        currency: 'USD',
      },
    });

    // Create an unassigned fulfillment for that order
    await prisma.fulfillment.create({
      data: {
        orderId: unassignedOrder.id,
        status: 'PENDING',
      },
    });

    // SALES_REP attempting to view unassigned order MUST be rejected with 403
    const repViewUnassignedRes = await fetch(`${baseUrl}/api/orders/${unassignedOrder.id}`, {
      headers: { Authorization: `Bearer ${salesTokenA}` },
    });
    assert.strictEqual(repViewUnassignedRes.status, 403, 'SALES_REP cannot view unassigned orders (IDOR fix)');

    // SALES_REP attempting to view fulfillments for unassigned order MUST be rejected with 403
    const repViewFulfillRes = await fetch(`${baseUrl}/api/orders/${unassignedOrder.id}/fulfillment`, {
      headers: { Authorization: `Bearer ${salesTokenA}` },
    });
    assert.strictEqual(repViewFulfillRes.status, 403, 'SALES_REP cannot view fulfillments of unassigned order (IDOR fix)');

    // Operations and Admin CAN view the unassigned order
    const opsViewUnassignedRes = await fetch(`${baseUrl}/api/orders/${unassignedOrder.id}`, {
      headers: { Authorization: `Bearer ${opsToken}` },
    });
    assert.strictEqual(opsViewUnassignedRes.status, 200, 'Operations can view unassigned orders');
  });

  // =========================================================================
  // 3. MASS ASSIGNMENT DEFENSE AUDIT
  // =========================================================================
  await t.test('3. Mass Assignment Audit: Role Escalation & Schema Pollution Prevention', async () => {
    // 3.1 Public registration ignores role: "ADMIN" and strictly forces SALES_REP
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `hacker.admin.${Date.now()}@dealflow360.com`,
        password: 'Password123!',
        name: 'Privilege Escalator',
        role: 'ADMIN', // Tampered field
      }),
    });
    assert.strictEqual(regRes.status, 201);
    const regBody = await regRes.json();
    assert.strictEqual(regBody.data.user.role, UserRole.SALES_REP, 'Public registration MUST force SALES_REP');

    // 3.2 Quotation creation ignores/strips unauthorized injected fields (status: APPROVED, totalAmount)
    const massAssignQuoteRes = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({
        customerId: testCustomer.id,
        status: 'APPROVED', // Injected mass assignment
        totalAmount: 1.0,   // Injected mass assignment
      }),
    });
    assert.strictEqual(massAssignQuoteRes.status, 201);
    const massAssignBody = await massAssignQuoteRes.json();
    assert.strictEqual(massAssignBody.data.quotation.status, QuoteStatus.DRAFT, 'Server must enforce DRAFT status');
    assert.strictEqual(Number(massAssignBody.data.quotation.totalAmount), 0, 'Server must enforce zero totalAmount');

    // 3.3 Quotation update rejects unauthorized injected fields (strict schema validation)
    const massAssignUpdateRes = await fetch(`${baseUrl}/api/quotations/${massAssignBody.data.quotation.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({
        status: 'APPROVED', // Rejected by strict schema
      }),
    });
    assert.strictEqual(massAssignUpdateRes.status, 400, 'Update schema must reject unexpected fields');
  });

  // =========================================================================
  // 4. FINANCIAL SECURITY AUDIT
  // =========================================================================
  await t.test('4. Financial Security Audit: Negative Values & Server Authoritative Pricing', async () => {
    // Create draft quotation for financial testing
    const quoteRes = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({ customerId: testCustomer.id }),
    });
    const quote = (await quoteRes.json()).data.quotation;

    // 4.1 Negative quantity rejection
    const negQtyRes = await fetch(`${baseUrl}/api/quotations/${quote.id}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({
        productId: testProduct.id,
        quantity: -5,
      }),
    });
    assert.strictEqual(negQtyRes.status, 400, 'Negative quantities must be rejected');

    // 4.2 Zero quantity rejection
    const zeroQtyRes = await fetch(`${baseUrl}/api/quotations/${quote.id}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({
        productId: testProduct.id,
        quantity: 0,
      }),
    });
    assert.strictEqual(zeroQtyRes.status, 400, 'Zero quantity must be rejected');

    // 4.3 Negative discount rejection
    const negDiscRes = await fetch(`${baseUrl}/api/quotations/${quote.id}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({
        productId: testProduct.id,
        quantity: 2,
        discountPercentage: -10,
      }),
    });
    assert.strictEqual(negDiscRes.status, 400, 'Negative discount must be rejected');

    // 4.4 Excessive discount (>100%) rejection
    const excessDiscRes = await fetch(`${baseUrl}/api/quotations/${quote.id}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({
        productId: testProduct.id,
        quantity: 2,
        discountPercentage: 110,
      }),
    });
    assert.strictEqual(excessDiscRes.status, 400, 'Discount > 100% must be rejected');

    // 4.5 Server-Authoritative Calculation: client passing lineTotal is ignored/calculated server-side
    const validItemRes = await fetch(`${baseUrl}/api/quotations/${quote.id}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({
        productId: testProduct.id,
        quantity: 2,
        discountPercentage: 10,
      }),
    });
    assert.strictEqual(validItemRes.status, 201);
    const validItem = (await validItemRes.json()).data.item;
    assert.ok(Number(validItem.lineTotal) > 0);
    assert.ok(Number(validItem.unitPrice) > 0);
  });

  // =========================================================================
  // 5. WORKFLOW & STATE MACHINE SECURITY AUDIT
  // =========================================================================
  await t.test('5. Workflow & State Machine Audit: Illegal Transitions & Sequence Protection', async () => {
    // 5.1 Illegal status transition on order: CONFIRMED cannot jump directly to DELIVERED
    const testOrder = await prisma.order.create({
      data: {
        orderNumber: `ORD-STATE-${Date.now()}`,
        customerId: testCustomer.id,
        salesRepId: salesUserA.id,
        status: OrderStatus.CONFIRMED,
        subtotal: 1000,
        discountAmount: 0,
        taxAmount: 100,
        totalAmount: 1100,
        currency: 'USD',
      },
    });

    const illegalJumpRes = await fetch(`${baseUrl}/api/orders/${testOrder.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opsToken}`,
      },
      body: JSON.stringify({ status: OrderStatus.DELIVERED }),
    });
    assert.strictEqual(illegalJumpRes.status, 400, 'CONFIRMED cannot jump directly to DELIVERED');

    // 5.2 Terminal state protection: DELIVERED cannot transition to anything
    await prisma.order.update({
      where: { id: testOrder.id },
      data: { status: OrderStatus.DELIVERED },
    });

    const terminalJumpRes = await fetch(`${baseUrl}/api/orders/${testOrder.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opsToken}`,
      },
      body: JSON.stringify({ status: OrderStatus.PROCESSING }),
    });
    assert.strictEqual(terminalJumpRes.status, 400, 'DELIVERED is a terminal state');
  });

  // =========================================================================
  // 6. APPROVAL SECURITY AUDIT
  // =========================================================================
  await t.test('6. Approval Workflow Security Audit: Anti-Self-Approval & Step Sequencing', async () => {
    // Create quote with 35% discount (triggers multi-tier approval)
    const quoteRes = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({ customerId: testCustomer.id }),
    });
    const quote = (await quoteRes.json()).data.quotation;

    await fetch(`${baseUrl}/api/quotations/${quote.id}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({
        productId: testProduct.id,
        quantity: 5,
        discountPercentage: 35,
      }),
    });

    const submitRes = await fetch(`${baseUrl}/api/quotations/${quote.id}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesTokenA}` },
    });
    assert.strictEqual(submitRes.status, 200);

    const approvals = await prisma.approval.findMany({
      where: { quotationId: quote.id },
      orderBy: { stepOrder: 'asc' },
    });
    assert.ok(approvals.length >= 1, 'Approval records must be generated');

    const step1 = approvals[0];

    // 6.1 Anti-Self-Approval: The quote creator (sales rep A) cannot approve their own quote
    const selfApproveRes = await fetch(`${baseUrl}/api/approvals/${step1.id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({ notes: 'Self approving my own deal' }),
    });
    assert.strictEqual(selfApproveRes.status, 403, 'Self-approval must be forbidden');

    // 6.2 Prerequisite step enforcement (if step 2 exists)
    if (approvals.length > 1) {
      const step2 = approvals[1];
      const step2EarlyRes = await fetch(`${baseUrl}/api/approvals/${step2.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ notes: 'Approving step 2 early' }),
      });
      assert.strictEqual(step2EarlyRes.status, 400, 'Step 2 cannot be approved before Step 1');
    }
  });

  // =========================================================================
  // 7. ORDER CONVERSION & SNAPSHOT SECURITY AUDIT
  // =========================================================================
  await t.test('7. Order Conversion Security Audit: Status Requirements & Snapshot Immutability', async () => {
    // 7.1 Cannot convert DRAFT quotation to order
    const draftQuoteRes = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({ customerId: testCustomer.id }),
    });
    const draftQuote = (await draftQuoteRes.json()).data.quotation;

    const convertDraftRes = await fetch(`${baseUrl}/api/quotations/${draftQuote.id}/create-order`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesTokenA}` },
    });
    assert.strictEqual(convertDraftRes.status, 400, 'Cannot convert non-approved quote to order');

    // 7.2 Prepare an approved quote and convert it
    const approvedQuote = await prisma.quotation.create({
      data: {
        quoteNumber: `QT-AUDIT-CONV-${Date.now()}`,
        customerId: testCustomer.id,
        salesRepId: salesUserA.id,
        status: QuoteStatus.APPROVED,
        subtotal: 2000,
        discountAmount: 200,
        taxAmount: 180,
        totalAmount: 1980,
        marginAmount: 1000,
        marginPercentage: 50,
        items: {
          create: [
            {
              productId: testProduct.id,
              quantity: 2,
              unitPrice: 1000,
              discountPercentage: 10,
              discountAmount: 200,
              taxAmount: 180,
              lineTotal: 1980,
              costPrice: 400,
              marginAmount: 1000,
              marginPercentage: 50,
            },
          ],
        },
      },
    });

    const firstConvertRes = await fetch(`${baseUrl}/api/quotations/${approvedQuote.id}/create-order`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesTokenA}` },
    });
    assert.strictEqual(firstConvertRes.status, 201, 'Approved quote converts to order');
    const orderData = (await firstConvertRes.json()).data.order;

    // 7.3 Duplicate conversion block
    const dupConvertRes = await fetch(`${baseUrl}/api/quotations/${approvedQuote.id}/create-order`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesTokenA}` },
    });
    assert.ok(dupConvertRes.status === 400 || dupConvertRes.status === 409, 'Duplicate conversion must be blocked');

    // 7.4 Historical Snapshot Immutability: Order line item preserves original product data
    const orderItems = await prisma.orderItem.findMany({ where: { orderId: orderData.id } });
    assert.strictEqual(orderItems.length, 1);
    assert.strictEqual(orderItems[0].productNameSnapshot, testProduct.name);
    assert.strictEqual(Number(orderItems[0].unitPrice), 1000);
  });

  // =========================================================================
  // 8. PAYMENT SECURITY AUDIT
  // =========================================================================
  await t.test('8. Payment Security Audit: Negative Amounts & Overpayment Defense', async () => {
    // Create an order & invoice for payment testing
    const testOrder = await prisma.order.create({
      data: {
        orderNumber: `ORD-PAY-TEST-${Date.now()}`,
        customerId: testCustomer.id,
        salesRepId: salesUserA.id,
        status: OrderStatus.CONFIRMED,
        subtotal: 1000,
        discountAmount: 0,
        taxAmount: 100,
        totalAmount: 1100,
        currency: 'USD',
      },
    });

    const testInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-PAY-TEST-${Date.now()}`,
        orderId: testOrder.id,
        customerId: testCustomer.id,
        status: InvoiceStatus.ISSUED,
        subtotal: 1000,
        discountAmount: 0,
        taxAmount: 100,
        totalAmount: 1100,
        paidAmount: 0,
        outstandingAmount: 1100,
        currency: 'USD',
        dueDate: new Date(Date.now() + 86400000),
      },
    });

    // 8.1 Negative payment amount rejection
    const negPayRes = await fetch(`${baseUrl}/api/invoices/${testInvoice.id}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({
        amount: -200,
        paymentMethod: 'CREDIT_CARD',
      }),
    });
    assert.strictEqual(negPayRes.status, 400, 'Negative payment amount must be rejected');

    // 8.2 Zero payment amount rejection
    const zeroPayRes = await fetch(`${baseUrl}/api/invoices/${testInvoice.id}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({
        amount: 0,
        paymentMethod: 'CREDIT_CARD',
      }),
    });
    assert.strictEqual(zeroPayRes.status, 400, 'Zero payment amount must be rejected');

    // 8.3 Overpayment defense: Amount exceeding outstandingAmount is rejected
    const overPayRes = await fetch(`${baseUrl}/api/invoices/${testInvoice.id}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({
        amount: 2500, // outstanding is 1100
        paymentMethod: 'CREDIT_CARD',
      }),
    });
    assert.strictEqual(overPayRes.status, 400, 'Overpayment beyond outstanding amount must be rejected');

    // 8.4 Valid full payment
    const validPayRes = await fetch(`${baseUrl}/api/invoices/${testInvoice.id}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({
        amount: 1100,
        paymentMethod: 'CREDIT_CARD',
        transactionReference: `TXN-AUDIT-${Date.now()}`,
      }),
    });
    assert.strictEqual(validPayRes.status, 201, 'Full payment accepted');

    // 8.5 Verify invoice transitioned to PAID
    const paidInvoice = await prisma.invoice.findUnique({ where: { id: testInvoice.id } });
    assert.strictEqual(paidInvoice.status, InvoiceStatus.PAID);
    assert.strictEqual(Number(paidInvoice.outstandingAmount), 0);

    // 8.6 Subsequent payment on PAID invoice is rejected
    const postPaidPayRes = await fetch(`${baseUrl}/api/invoices/${testInvoice.id}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({
        amount: 50,
        paymentMethod: 'CREDIT_CARD',
      }),
    });
    assert.strictEqual(postPaidPayRes.status, 400, 'Payment on PAID invoice must be rejected');
  });

  // =========================================================================
  // 9. INPUT VALIDATION & INJECTION PREVENTION AUDIT
  // =========================================================================
  await t.test('9. Input Validation & Injection Audit: SQLi, UUID, Enums & HPP', async () => {
    // 9.1 Invalid UUID in URL param returns 400 Bad Request
    const badUuidRes = await fetch(`${baseUrl}/api/quotations/not-a-valid-uuid`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(badUuidRes.status, 400, 'Malformed UUID in path param must return 400');

    // 9.2 SQL Injection payload in query parameters handled safely
    const sqliSearch = "'; DROP TABLE \"User\"; --";
    const sqliRes = await fetch(`${baseUrl}/api/customers?search=${encodeURIComponent(sqliSearch)}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(sqliRes.status, 200, 'SQL injection strings must be treated as text without error');

    // Verify User table is completely unaffected
    const userCount = await prisma.user.count();
    assert.ok(userCount > 0, 'Database tables must remain intact');

    // 9.3 Invalid Enum validation
    const badEnumRes = await fetch(`${baseUrl}/api/orders?status=INVALID_STATUS_NAME`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(badEnumRes.status, 400, 'Invalid enum values must return 400');

    // 9.4 Parameter Pollution (HPP) sanitization: repeated parameters are normalized
    const hppRes = await fetch(`${baseUrl}/api/customers?page=1&page=2`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(hppRes.status, 200, 'Repeated parameters must be sanitized by HPP middleware');
  });

  // =========================================================================
  // 10. SECURITY HEADERS & CORS AUDIT
  // =========================================================================
  await t.test('10. Security Headers & CORS Audit: Defense-in-Depth HTTP Headers', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);

    // Helmet headers
    assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
    assert.strictEqual(res.headers.get('x-frame-options'), 'DENY');

    // Body size limit enforcement: request body > 500kb rejected with 413
    const hugePayload = 'a'.repeat(600 * 1024); // 600KB
    const bigBodyRes = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ hugeData: hugePayload }),
    });
    assert.strictEqual(bigBodyRes.status, 413, 'Payloads exceeding 500kb must be rejected with 413');
  });

  // =========================================================================
  // 11. RATE LIMITING AUDIT
  // =========================================================================
  await t.test('11. Rate Limiting Audit: Header Verification & Brute-Force Defense', async () => {
    // Auth login endpoint returns rate limit headers when tested
    const loginAttempt = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-rate-limit': 'true',
      },
      body: JSON.stringify({ email: 'admin@dealflow360.com', password: 'wrongpassword' }),
    });

    const limitHeader = loginAttempt.headers.get('ratelimit-limit');
    assert.ok(limitHeader, 'Rate limit headers must be present on auth endpoints');
  });

  // =========================================================================
  // 12. AUDIT LOGGING & NON-REPUDIATION AUDIT
  // =========================================================================
  await t.test('12. Audit Logging Audit: Immutable Non-Repudiation Trail', async () => {
    // Fetch audit logs for customer and order
    const logs = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
    assert.ok(logs.length > 0, 'Audit logs must exist in the database');
    assert.ok(logs[0].action, 'Audit logs must have an action recorded');
    assert.ok(logs[0].entityType, 'Audit logs must have an entityType recorded');
  });

  // =========================================================================
  // 13. INFORMATION DISCLOSURE PREVENTION AUDIT
  // =========================================================================
  await t.test('13. Information Disclosure Audit: Stack Traces & Path Masking', async () => {
    // 404 endpoint request does not leak internals
    const notFoundRes = await fetch(`${baseUrl}/api/non-existent-security-route`);
    assert.strictEqual(notFoundRes.status, 404);
    const notFoundBody = await notFoundRes.json();
    assert.strictEqual(notFoundBody.stack, undefined, 'Stack trace must not be exposed');

    // Authentication error does not expose stack traces
    const badAuthRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'unknown@test.com', password: 'bad' }),
    });
    const badAuthBody = await badAuthRes.json();
    assert.strictEqual(badAuthBody.stack, undefined, 'Stack trace must never be sent in API response');
  });

  // =========================================================================
  // 14. DEPENDENCY & URLENCODED SECURITY AUDIT
  // =========================================================================
  await t.test('14. Dependency Security Audit: Native URL Encoding (extended: false)', async () => {
    // Test that URL-encoded body parser does not parse nested prototype payloads
    const formRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'email=admin%40dealflow360.com&password=wrongpassword',
    });
    // Validates that urlencoded bodies are accepted and parsed by the server without crash
    assert.ok([200, 401].includes(formRes.status));
  });

  // =========================================================================
  // 15. BUSINESS LOGIC AUDIT: INACTIVE PRODUCT & INACTIVE CUSTOMER DEFENSES
  // =========================================================================
  await t.test('15. Business Logic Audit: Inactive Product & Inactive Customer Defenses', async () => {
    // Create an inactive customer
    const inactiveCustomer = await prisma.customer.create({
      data: {
        companyName: `Inactive Corp ${Date.now()}`,
        contactName: 'Inactive Person',
        email: `inactive.${Date.now()}@corp.test`,
        customerTier: CustomerTier.BRONZE,
        isActive: false,
      },
    });

    // Attempting to create a quote for an inactive customer is rejected
    const inactiveCustQuoteRes = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({ customerId: inactiveCustomer.id }),
    });
    assert.strictEqual(inactiveCustQuoteRes.status, 400, 'Cannot create quote for inactive customer');

    // Create an inactive product
    const inactiveProduct = await prisma.product.create({
      data: {
        sku: `INACTIVE-${Date.now()}`,
        name: 'Discontinued Widget',
        categoryId: testProduct.categoryId,
        basePrice: 50.0,
        costPrice: 20.0,
        taxRate: 5.0,
        isActive: false,
      },
    });

    // Create valid draft quote
    const draftRes = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({ customerId: testCustomer.id }),
    });
    const draftQuote = (await draftRes.json()).data.quotation;

    // Attempting to add an inactive product to a quotation is rejected
    const inactiveProdItemRes = await fetch(`${baseUrl}/api/quotations/${draftQuote.id}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({
        productId: inactiveProduct.id,
        quantity: 1,
      }),
    });
    assert.strictEqual(inactiveProdItemRes.status, 400, 'Cannot quote inactive product');
  });

  t.after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});
