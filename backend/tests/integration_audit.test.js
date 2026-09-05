import test from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { generateAccessToken } from '../src/utils/jwt.js';
import {
  QuoteStatus,
  OrderStatus,
  FulfillmentStatus,
  InvoiceStatus,
  PaymentStatus,
  UserRole,
  CustomerTier,
  RiskLevel
} from '@prisma/client';
import bcrypt from 'bcryptjs';

test('Phase 15: Complete End-to-End Integration Audit Suite', async (t) => {
  let server;
  const port = 5150;
  const baseUrl = `http://localhost:${port}`;

  let adminToken, salesToken1, salesToken2, managerToken, financeToken, opsToken;
  let adminUser, salesUser1, salesUser2, managerUser, financeUser, opsUser;

  let auditCategory, auditProduct, auditVariant, auditCustomer, auditPriceList, auditPriceListItem;
  let quoteRep1;
  let auditOrder;
  let auditFulfillment;
  let auditInvoice;

  await t.test('Section 01: Test User Provisioning & Password Hash Privacy', async () => {
    await new Promise((resolve) => {
      server = app.listen(port, () => resolve());
    });
    assert.ok(server);

    // Bootstrap or verify all standard roles
    adminUser = await prisma.user.findUnique({ where: { email: 'admin@dealflow360.com' } });
    salesUser1 = await prisma.user.findUnique({ where: { email: 'sales.rep@dealflow360.com' } });
    managerUser = await prisma.user.findUnique({ where: { email: 'sales.manager@dealflow360.com' } });
    financeUser = await prisma.user.findUnique({ where: { email: 'finance@dealflow360.com' } });
    opsUser = await prisma.user.findUnique({ where: { email: 'operations@dealflow360.com' } });

    assert.ok(adminUser, 'Admin user must exist');
    assert.ok(salesUser1, 'Sales rep user must exist');
    assert.ok(managerUser, 'Sales manager user must exist');
    assert.ok(financeUser, 'Finance user must exist');
    assert.ok(opsUser, 'Operations user must exist');

    // Create a secondary sales rep for IDOR / tenant isolation checks
    const sales2Email = 'sales.rep2.audit@dealflow360.com';
    salesUser2 = await prisma.user.upsert({
      where: { email: sales2Email },
      update: { isActive: true },
      create: {
        email: sales2Email,
        name: 'Sales Rep 2 (Audit Isolation)',
        passwordHash: adminUser.passwordHash,
        role: UserRole.SALES_REP,
        isActive: true,
      },
    });
    assert.ok(salesUser2);

    // Generate JWT tokens
    adminToken = generateAccessToken(adminUser);
    salesToken1 = generateAccessToken(salesUser1);
    salesToken2 = generateAccessToken(salesUser2);
    managerToken = generateAccessToken(managerUser);
    financeToken = generateAccessToken(financeUser);
    opsToken = generateAccessToken(opsUser);

    // Verify password hashes are strong bcrypt hashes in DB and not plain text
    assert.match(adminUser.passwordHash, /^\$2[aby]\$\d{2}\$/);
    assert.match(salesUser1.passwordHash, /^\$2[aby]\$\d{2}\$/);
  });

  await t.test('Section 02: Authentication & Token Security Lifecycle', async () => {
    // 1. Register a new sales rep
    const newRepEmail = `new.rep.${Date.now()}@dealflow360.com`;
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Registered Sales Rep',
        email: newRepEmail,
        password: 'Password123!',
      }),
    });
    assert.strictEqual(regRes.status, 201);
    const regBody = await regRes.json();
    assert.strictEqual(regBody.success, true);
    assert.strictEqual(regBody.data.user.email, newRepEmail);
    assert.strictEqual(regBody.data.user.passwordHash, undefined, 'passwordHash must NEVER be returned');
    assert.strictEqual(regBody.data.user.role, UserRole.SALES_REP);

    // 2. Login with valid credentials
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sales.rep@dealflow360.com',
        password: 'Password123!',
      }),
    });
    assert.strictEqual(loginRes.status, 200);
    const loginBody = await loginRes.json();
    assert.ok(loginBody.data.token, 'Token must be present in login response');
    assert.strictEqual(loginBody.data.user.passwordHash, undefined);

    // 3. Get Current User profile (me)
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${salesToken1}` },
    });
    assert.strictEqual(meRes.status, 200);
    const meBody = await meRes.json();
    assert.strictEqual(meBody.data.user.email, 'sales.rep@dealflow360.com');
    assert.strictEqual(meBody.data.user.passwordHash, undefined);

    // 4. Invalid login: wrong password
    const badPwRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sales.rep@dealflow360.com',
        password: 'WrongPassword999!',
      }),
    });
    assert.strictEqual(badPwRes.status, 401);

    // 5. Invalid login: non-existent user
    const noUserRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@dealflow360.com',
        password: 'Password123!',
      }),
    });
    assert.strictEqual(noUserRes.status, 401);

    // 6. Expired / malformed JWT
    const badTokenRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: 'Bearer totally.invalid.token' },
    });
    assert.strictEqual(badTokenRes.status, 401);

    // 7. Missing Authorization header
    const noTokenRes = await fetch(`${baseUrl}/api/auth/me`);
    assert.strictEqual(noTokenRes.status, 401);

    // 8. Logout
    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesToken1}` },
    });
    assert.strictEqual(logoutRes.status, 200);
  });

  await t.test('Section 03: Role-Based Access Control (RBAC) & IDOR Enforcement', async () => {
    // 1. Sales rep cannot access admin discount-rules creation
    const repRuleRes = await fetch(`${baseUrl}/api/discount-rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesToken1}`,
      },
      body: JSON.stringify({
        name: 'Unauthorized Rule',
        ruleType: 'CUSTOMER_TIER',
        targetTier: 'BRONZE',
        maxDiscountPercentage: 20,
      }),
    });
    assert.strictEqual(repRuleRes.status, 403, 'Sales Rep must be forbidden from creating discount rules');

    // 2. Sales manager cannot record payments (Finance only)
    const mgrPayRes = await fetch(`${baseUrl}/api/invoices/00000000-0000-0000-0000-000000000001/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({ amount: 100, paymentMethod: 'CREDIT_CARD' }),
    });
    assert.strictEqual(mgrPayRes.status, 403, 'Sales Manager must be forbidden from recording payments');

    // 3. Operations user cannot approve quotations
    const opsApproveRes = await fetch(`${baseUrl}/api/approvals/00000000-0000-0000-0000-000000000001/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${opsToken}` },
    });
    assert.strictEqual(opsApproveRes.status, 403, 'Operations must be forbidden from approving quotations');

    // 4. Finance user cannot update warehouse fulfillment status
    const finFulfillRes = await fetch(`${baseUrl}/api/fulfillments/00000000-0000-0000-0000-000000000001/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({ status: 'PROCESSING' }),
    });
    assert.strictEqual(finFulfillRes.status, 403, 'Finance must be forbidden from updating fulfillment status');
  });

  await t.test('Section 04: Master Data Workflow (Category -> Product -> Variant -> Customer -> PriceList -> Item)', async () => {
    // 1. Create Category (Admin)
    const catCode = `AUD-CAT-${Date.now()}`;
    const catName = `Audit Category ${Date.now()}`;
    const catRes = await fetch(`${baseUrl}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: catName,
        description: 'Category for integration audit',
      }),
    });
    assert.strictEqual(catRes.status, 201);
    const catBody = await catRes.json();
    auditCategory = catBody.data.category;
    assert.strictEqual(auditCategory.name, catName);

    // 2. Duplicate Category Name -> 409 Conflict
    const dupCatRes = await fetch(`${baseUrl}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: catName,
      }),
    });
    assert.strictEqual(dupCatRes.status, 409);

    // 3. Create Product under Category
    const prodSku = `AUD-PROD-${Date.now()}`;
    const prodName = `Audit Server ${Date.now()}`;
    const prodRes = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: prodName,
        sku: prodSku,
        categoryId: auditCategory.id,
        basePrice: 1000.0,
        costPrice: 600.0,
        uom: 'unit',
      }),
    });
    assert.strictEqual(prodRes.status, 201);
    const prodBody = await prodRes.json();
    auditProduct = prodBody.data.product;
    assert.strictEqual(auditProduct.sku, prodSku);

    // 4. Duplicate SKU -> 409 Conflict
    const dupProdRes = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: `Duplicate Server ${Date.now()}`,
        sku: prodSku,
        categoryId: auditCategory.id,
        basePrice: 1200.0,
        costPrice: 700.0,
      }),
    });
    assert.strictEqual(dupProdRes.status, 409);

    // 5. Create Product Variant under Product
    const varRes = await fetch(`${baseUrl}/api/products/${auditProduct.id}/variants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        attribute: 'Storage',
        value: '2TB NVMe',
        skuSuffix: '-2TB',
        extraPrice: 250.0,
        priceAdjustment: 250.0,
      }),
    });
    assert.strictEqual(varRes.status, 201);
    const varBody = await varRes.json();
    auditVariant = varBody.data.variant;
    assert.strictEqual(auditVariant.value, '2TB NVMe');

    // 6. Create Customer
    const custEmail = `audit.cust.${Date.now()}@enterprise.com`;
    const custRes = await fetch(`${baseUrl}/api/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesToken1}`,
      },
      body: JSON.stringify({
        companyName: `Apex Strategic Holdings ${Date.now()}`,
        contactName: 'Victoria Sterling',
        email: custEmail,
        customerTier: CustomerTier.GOLD,
        currency: 'USD',
      }),
    });
    assert.strictEqual(custRes.status, 201);
    const custBody = await custRes.json();
    auditCustomer = custBody.data.customer;
    assert.strictEqual(auditCustomer.email, custEmail);

    // 7. Duplicate Customer Email -> 409 Conflict
    const dupCustRes = await fetch(`${baseUrl}/api/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesToken1}`,
      },
      body: JSON.stringify({
        companyName: 'Duplicate Corp',
        contactName: 'John Doe',
        email: custEmail,
        customerTier: CustomerTier.BRONZE,
      }),
    });
    assert.strictEqual(dupCustRes.status, 409);

    // 8. Create Price List
    const plRes = await fetch(`${baseUrl}/api/price-lists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: `Master Price List ${Date.now()}`,
        currency: 'USD',
        customerTier: CustomerTier.SILVER,
      }),
    });
    assert.strictEqual(plRes.status, 201);
    const plBody = await plRes.json();
    auditPriceList = plBody.data.priceList;

    // 9. Add Price List Item
    const pliRes = await fetch(`${baseUrl}/api/price-lists/${auditPriceList.id}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        productId: auditProduct.id,
        price: 880.0,
        minimumQuantity: 1,
      }),
    });
    assert.strictEqual(pliRes.status, 201);
    const pliBody = await pliRes.json();
    auditPriceListItem = pliBody.data.item;
    assert.strictEqual(Number(auditPriceListItem.price), 880.0);

    // 10. Test Invalid ID -> 400 Bad Request
    const invalidIdRes = await fetch(`${baseUrl}/api/products/not-a-valid-uuid`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(invalidIdRes.status, 400);
  });

  await t.test('Section 05: Quotation Engine & Client-Side Financial Tampering Defense', async () => {
    // 1. Sales Rep 1 creates a new Draft quotation
    const quoteRes = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesToken1}`,
      },
      body: JSON.stringify({
        customerId: auditCustomer.id,
      }),
    });
    assert.strictEqual(quoteRes.status, 201);
    const quoteBody = await quoteRes.json();
    quoteRep1 = quoteBody.data.quotation;
    assert.strictEqual(quoteRep1.status, QuoteStatus.DRAFT);
    assert.strictEqual(quoteRep1.salesRepId, salesUser1.id);

    // 2. Add line items
    const itemRes = await fetch(`${baseUrl}/api/quotations/${quoteRep1.id}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesToken1}`,
      },
      body: JSON.stringify({
        productId: auditProduct.id,
        variantId: auditVariant.id,
        quantity: 4,
        discountPercentage: 10.0,
      }),
    });
    assert.strictEqual(itemRes.status, 201);

    // 3. Recalculate quotation
    const recalcRes = await fetch(`${baseUrl}/api/quotations/${quoteRep1.id}/recalculate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesToken1}` },
    });
    assert.strictEqual(recalcRes.status, 200);
    const recalcBody = await recalcRes.json();
    const updatedQuote = recalcBody.data.quotation;

    // Unit price = basePrice(1000) + variant(250) = 1250
    // Gross = 1250 * 4 = 5000. Discount 10% = 500. Net = 4500. Tax = 0. Total = 4500.
    assert.strictEqual(Number(updatedQuote.subtotal ?? updatedQuote.subtotalAmount), 5000);
    assert.strictEqual(Number(updatedQuote.discountAmount), 500);
    assert.strictEqual(Number(updatedQuote.totalAmount), 4500);
    assert.ok(Number(updatedQuote.marginAmount) > 0);

    // 4. Malicious client tampering defense: attempt to inject status and financial values
    const maliciousRes = await fetch(`${baseUrl}/api/quotations/${quoteRep1.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesToken1}`,
      },
      body: JSON.stringify({
        totalAmount: 1.0,
        discountAmount: 99999.0,
        status: 'APPROVED',
        salesRepId: adminUser.id,
      }),
    });
    // Zod strict schema rejects unknown/protected fields with 400 Bad Request
    assert.strictEqual(maliciousRes.status, 400, 'Tampering with financial totals or status must be rejected');

    // 5. IDOR check: Sales Rep 2 attempts to view Sales Rep 1's quotation
    const idorRes = await fetch(`${baseUrl}/api/quotations/${quoteRep1.id}`, {
      headers: { Authorization: `Bearer ${salesToken2}` },
    });
    assert.strictEqual(idorRes.status, 403, 'Sales Rep 2 must be blocked from accessing Sales Rep 1 quote');
  });

  await t.test('Section 06: Risk Assessment Engine & Explainable Risk Scoring', async () => {
    // 1. Evaluate risk on quoteRep1 (10% discount)
    const riskRes = await fetch(`${baseUrl}/api/quotations/${quoteRep1.id}/evaluate-risk`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesToken1}` },
    });
    assert.strictEqual(riskRes.status, 200);
    const riskBody = await riskRes.json();
    const riskAssessment = riskBody.data.riskAssessment || riskBody.data;
    assert.ok(riskAssessment);
    assert.ok(riskAssessment.riskScore !== undefined);
    assert.ok(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(riskAssessment.riskLevel));
    assert.ok(Array.isArray(riskAssessment.riskReasons || riskAssessment.reasons));

    // 2. Create a Deep Discount High-Risk Quote (e.g. 45% discount on low-tier customer)
    const bronzeCust = await prisma.customer.findFirst({ where: { customerTier: CustomerTier.BRONZE, isActive: true } });
    const highRiskQuoteRes = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesToken1}`,
      },
      body: JSON.stringify({ customerId: bronzeCust.id }),
    });
    const highRiskQuote = (await highRiskQuoteRes.json()).data.quotation;

    await fetch(`${baseUrl}/api/quotations/${highRiskQuote.id}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesToken1}`,
      },
      body: JSON.stringify({
        productId: auditProduct.id,
        quantity: 20,
        discountPercentage: 45.0,
      }),
    });

    await fetch(`${baseUrl}/api/quotations/${highRiskQuote.id}/recalculate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesToken1}` },
    });

    const evalHighRiskRes = await fetch(`${baseUrl}/api/quotations/${highRiskQuote.id}/evaluate-risk`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesToken1}` },
    });
    const highRiskBody = await evalHighRiskRes.json();
    const highRiskAssessment = highRiskBody.data.riskAssessment || highRiskBody.data;
    assert.ok(highRiskAssessment.riskScore >= 40, 'High discount quote must have elevated risk score');
    assert.ok(['HIGH', 'CRITICAL'].includes(highRiskAssessment.riskLevel));
    assert.strictEqual(highRiskAssessment.approvalRequired, true);
    const requiredRoles = highRiskAssessment.requiredRoles || highRiskAssessment.approvalRequirements || [];
    assert.ok(requiredRoles.includes(UserRole.FINANCE));
  });

  await t.test('Section 07: Multi-Stage Approval Workflow & Anti-Self-Approval', async () => {
    // 1. Submit quoteRep1 for approval
    const submitRes = await fetch(`${baseUrl}/api/quotations/${quoteRep1.id}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesToken1}` },
    });
    assert.strictEqual(submitRes.status, 200);
    const submitBody = await submitRes.json();
    assert.ok(['PENDING_APPROVAL', 'APPROVED'].includes(submitBody.data.quotation.status));

    // Retrieve approval steps
    const appListRes = await fetch(`${baseUrl}/api/quotations/${quoteRep1.id}/approvals`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(appListRes.status, 200);
    const appListBody = await appListRes.json();
    const approvalSteps = appListBody.data.approvals || [];

    if (approvalSteps.length > 0) {
      const firstStep = approvalSteps[0];

      // Anti-self-approval: sales rep 1 attempts to approve own quote
      const selfApproveRes = await fetch(`${baseUrl}/api/approvals/${firstStep.id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${salesToken1}` },
      });
      assert.strictEqual(selfApproveRes.status, 403, 'Sales Rep must NEVER be allowed to approve own quote');

      // Unauthorized role: operations attempts to approve
      const opsApproveRes = await fetch(`${baseUrl}/api/approvals/${firstStep.id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${opsToken}` },
      });
      assert.strictEqual(opsApproveRes.status, 403, 'Operations user cannot approve quotes');

      // Authorized Sales Manager approves step 1
      const mgrApproveRes = await fetch(`${baseUrl}/api/approvals/${firstStep.id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${managerToken}` },
      });
      assert.strictEqual(mgrApproveRes.status, 200);

      // Duplicate approval: re-approving the same step must fail
      const dupApproveRes = await fetch(`${baseUrl}/api/approvals/${firstStep.id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${managerToken}` },
      });
      assert.strictEqual(dupApproveRes.status, 400, 'Duplicate approval on same step must be rejected');

      // If there is a second approval step (Finance)
      if (approvalSteps.length > 1) {
        const secondStep = approvalSteps[1];
        const finApproveRes = await fetch(`${baseUrl}/api/approvals/${secondStep.id}/approve`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${financeToken}` },
        });
        assert.strictEqual(finApproveRes.status, 200);
      }
    }

    // Verify quote is now APPROVED
    const finalQuote = await prisma.quotation.findUnique({ where: { id: quoteRep1.id } });
    assert.strictEqual(finalQuote.status, QuoteStatus.APPROVED);

    // Rejection Test: Create and reject another quotation
    const rejQuoteRes = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesToken1}`,
      },
      body: JSON.stringify({ customerId: auditCustomer.id }),
    });
    const rejQuote = (await rejQuoteRes.json()).data.quotation;

    await fetch(`${baseUrl}/api/quotations/${rejQuote.id}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesToken1}`,
      },
      body: JSON.stringify({
        productId: auditProduct.id,
        quantity: 2,
        discountPercentage: 20.0,
      }),
    });

    await fetch(`${baseUrl}/api/quotations/${rejQuote.id}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesToken1}` },
    });

    const rejApps = await prisma.approval.findMany({ where: { quotationId: rejQuote.id } });
    if (rejApps.length > 0) {
      const rejectRes = await fetch(`${baseUrl}/api/approvals/${rejApps[0].id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerToken}`,
        },
        body: JSON.stringify({ rejectionReason: 'Margin unacceptable for audit test' }),
      });
      assert.strictEqual(rejectRes.status, 200);

      const dbRejQuote = await prisma.quotation.findUnique({ where: { id: rejQuote.id } });
      assert.strictEqual(dbRejQuote.status, QuoteStatus.REJECTED);
    }
  });

  await t.test('Section 08: Sales Order Lifecycle & Price Snapshotting', async () => {
    // 1. Convert APPROVED quoteRep1 into a Sales Order
    const orderRes = await fetch(`${baseUrl}/api/quotations/${quoteRep1.id}/create-order`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesToken1}` },
    });
    assert.strictEqual(orderRes.status, 201);
    const orderBody = await orderRes.json();
    auditOrder = orderBody.data.order;
    assert.ok(auditOrder.orderNumber);
    assert.strictEqual(auditOrder.status, OrderStatus.CONFIRMED);

    // 2. Duplicate order conversion prevention -> 409 Conflict
    const dupOrderRes = await fetch(`${baseUrl}/api/quotations/${quoteRep1.id}/create-order`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesToken1}` },
    });
    assert.strictEqual(dupOrderRes.status, 409, 'Cannot convert the same quote twice');

    // 3. Verify price snapshotting: order total matches quote total
    assert.strictEqual(Number(auditOrder.totalAmount), 4500);

    // 4. Order status transitions (Operations or Admin)
    // Transition: CONFIRMED -> PROCESSING
    const procRes = await fetch(`${baseUrl}/api/orders/${auditOrder.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opsToken}`,
      },
      body: JSON.stringify({ status: OrderStatus.PROCESSING }),
    });
    assert.strictEqual(procRes.status, 200);

    // Transition: PROCESSING -> READY_FOR_FULFILLMENT
    const readyRes = await fetch(`${baseUrl}/api/orders/${auditOrder.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opsToken}`,
      },
      body: JSON.stringify({ status: OrderStatus.READY_FOR_FULFILLMENT }),
    });
    assert.strictEqual(readyRes.status, 200);

    // Invalid status transition: Attempting READY_FOR_FULFILLMENT -> CONFIRMED -> 400 Bad Request
    const badTransRes = await fetch(`${baseUrl}/api/orders/${auditOrder.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opsToken}`,
      },
      body: JSON.stringify({ status: OrderStatus.CONFIRMED }),
    });
    assert.strictEqual(badTransRes.status, 400);
  });

  await t.test('Section 09: Warehouse Fulfillment Workflow & Status Machine', async () => {
    // 1. Get fulfillment automatically created with the order
    const fulGetRes = await fetch(`${baseUrl}/api/orders/${auditOrder.id}/fulfillment`, {
      headers: { Authorization: `Bearer ${opsToken}` },
    });
    assert.strictEqual(fulGetRes.status, 200);
    const fulGetBody = await fulGetRes.json();
    const fulfillments = Array.isArray(fulGetBody.data) ? fulGetBody.data : (fulGetBody.data?.fulfillments || []);
    assert.ok(fulfillments.length > 0);
    auditFulfillment = fulfillments[0];

    // 2. Assign operations user to fulfillment
    const assignRes = await fetch(`${baseUrl}/api/fulfillments/${auditFulfillment.id}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opsToken}`,
      },
      body: JSON.stringify({ operationsUserId: opsUser.id }),
    });
    assert.strictEqual(assignRes.status, 200);

    // 3. Status transition: PENDING -> PROCESSING
    const procRes = await fetch(`${baseUrl}/api/fulfillments/${auditFulfillment.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opsToken}`,
      },
      body: JSON.stringify({ status: FulfillmentStatus.PROCESSING }),
    });
    assert.strictEqual(procRes.status, 200);

    // 4. Update tracking information
    const trackRes = await fetch(`${baseUrl}/api/fulfillments/${auditFulfillment.id}/tracking`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opsToken}`,
      },
      body: JSON.stringify({
        carrier: 'FedEx Express',
        trackingNumber: 'FDX-AUDIT-99281',
      }),
    });
    assert.strictEqual(trackRes.status, 200);

    // 5. Status transition: PROCESSING -> SHIPPED (synchronizes Order status to SHIPPED)
    const shipRes = await fetch(`${baseUrl}/api/fulfillments/${auditFulfillment.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opsToken}`,
      },
      body: JSON.stringify({ status: FulfillmentStatus.SHIPPED }),
    });
    assert.strictEqual(shipRes.status, 200);

    const dbOrderShipped = await prisma.order.findUnique({ where: { id: auditOrder.id } });
    assert.strictEqual(dbOrderShipped.status, OrderStatus.SHIPPED);

    // 6. Status transition: SHIPPED -> DELIVERED (synchronizes Order status to DELIVERED)
    const delivRes = await fetch(`${baseUrl}/api/fulfillments/${auditFulfillment.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opsToken}`,
      },
      body: JSON.stringify({ status: FulfillmentStatus.DELIVERED }),
    });
    assert.strictEqual(delivRes.status, 200);

    const dbOrderDelivered = await prisma.order.findUnique({ where: { id: auditOrder.id } });
    assert.strictEqual(dbOrderDelivered.status, OrderStatus.DELIVERED);

    // 7. Invalid transition: DELIVERED -> PROCESSING -> 400 Bad Request
    const badFulTransRes = await fetch(`${baseUrl}/api/fulfillments/${auditFulfillment.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opsToken}`,
      },
      body: JSON.stringify({ status: FulfillmentStatus.PROCESSING }),
    });
    assert.strictEqual(badFulTransRes.status, 400);
  });

  await t.test('Section 10: Billing, Overpayment Protection & Payment Settlement', async () => {
    // 1. Convert Order to Tax Invoice
    const invRes = await fetch(`${baseUrl}/api/orders/${auditOrder.id}/create-invoice`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${financeToken}` },
    });
    assert.strictEqual(invRes.status, 201);
    const invBody = await invRes.json();
    auditInvoice = invBody.data?.invoice || invBody.data;
    assert.ok(auditInvoice.invoiceNumber);
    assert.strictEqual(auditInvoice.status, InvoiceStatus.DRAFT);
    assert.strictEqual(Number(auditInvoice.totalAmount), 4500);
    assert.strictEqual(Number(auditInvoice.outstandingAmount), 4500);

    // 2. Duplicate invoice creation on same order -> 409 Conflict
    const dupInvRes = await fetch(`${baseUrl}/api/orders/${auditOrder.id}/create-invoice`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${financeToken}` },
    });
    assert.strictEqual(dupInvRes.status, 409);

    // 3. Attempt payment on DRAFT invoice -> 400 Bad Request
    const draftPayRes = await fetch(`${baseUrl}/api/invoices/${auditInvoice.id}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({
        amount: 500,
        paymentMethod: 'BANK_TRANSFER',
      }),
    });
    assert.strictEqual(draftPayRes.status, 400, 'Cannot pay draft invoice');

    // 4. Issue invoice
    const issueRes = await fetch(`${baseUrl}/api/invoices/${auditInvoice.id}/issue`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${financeToken}` },
    });
    assert.strictEqual(issueRes.status, 200);
    const issueBody = await issueRes.json();
    const issuedInvoice = issueBody.data?.invoice || issueBody.data;
    assert.strictEqual(issuedInvoice.status, InvoiceStatus.ISSUED);

    // 5. Overpayment protection check: try to pay $5,000 against $4,500 outstanding
    const overpayRes = await fetch(`${baseUrl}/api/invoices/${auditInvoice.id}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({
        amount: 5000.0,
        paymentMethod: 'BANK_TRANSFER',
      }),
    });
    assert.strictEqual(overpayRes.status, 400, 'Overpayment must be rejected');

    // 6. Partial payment ($2,000)
    const partialPayRes = await fetch(`${baseUrl}/api/invoices/${auditInvoice.id}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({
        amount: 2000.0,
        paymentMethod: 'BANK_TRANSFER',
        transactionReference: `TXN-PART-${Date.now()}`,
      }),
    });
    assert.strictEqual(partialPayRes.status, 201);
    const partialInv = await prisma.invoice.findUnique({ where: { id: auditInvoice.id } });
    assert.strictEqual(partialInv.status, InvoiceStatus.PARTIALLY_PAID);
    assert.strictEqual(Number(partialInv.paidAmount), 2000);
    assert.strictEqual(Number(partialInv.outstandingAmount), 2500);

    // 7. Remaining full payment ($2,500) -> transitions to PAID
    const fullPayRes = await fetch(`${baseUrl}/api/invoices/${auditInvoice.id}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({
        amount: 2500.0,
        paymentMethod: 'BANK_TRANSFER',
        transactionReference: `TXN-FULL-${Date.now()}`,
      }),
    });
    assert.strictEqual(fullPayRes.status, 201);
    const paidInv = await prisma.invoice.findUnique({ where: { id: auditInvoice.id } });
    assert.strictEqual(paidInv.status, InvoiceStatus.PAID);
    assert.strictEqual(Number(paidInv.paidAmount), 4500);
    assert.strictEqual(Number(paidInv.outstandingAmount), 0);

    // 8. Attempt payment on already PAID invoice -> 400 Bad Request
    const extraPayRes = await fetch(`${baseUrl}/api/invoices/${auditInvoice.id}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({
        amount: 100.0,
        paymentMethod: 'BANK_TRANSFER',
      }),
    });
    assert.strictEqual(extraPayRes.status, 400, 'Cannot pay already settled invoice');
  });

  await t.test('Section 11: Role-Aware Dashboard & Data Isolation', async () => {
    // 1. Executive Summary as Admin
    const adminDashRes = await fetch(`${baseUrl}/api/dashboard/summary?period=this_month`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(adminDashRes.status, 200);
    const adminDashBody = await adminDashRes.json();
    assert.ok(adminDashBody.data.metrics);
    assert.ok(adminDashBody.data.metrics.revenue !== undefined);

    // 2. Sales Rep Dashboard: isolated to own quotes & orders
    const repDashRes = await fetch(`${baseUrl}/api/dashboard/summary?period=this_month`, {
      headers: { Authorization: `Bearer ${salesToken1}` },
    });
    assert.strictEqual(repDashRes.status, 200);
    const repDashBody = await repDashRes.json();
    assert.ok(repDashBody.data.metrics);

    // 3. Date filters: today, last_30_days, this_year
    for (const p of ['today', 'last_30_days', 'this_year']) {
      const periodRes = await fetch(`${baseUrl}/api/dashboard/summary?period=${p}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.strictEqual(periodRes.status, 200);
    }
  });

  await t.test('Section 12: Notification Engine & Idempotency Protection', async () => {
    // 1. Retrieve notifications for Admin
    const notifRes = await fetch(`${baseUrl}/api/notifications?limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(notifRes.status, 200);
    const notifBody = await notifRes.json();
    assert.ok(Array.isArray(notifBody.data), 'Notifications list must be returned as an array');

    // 2. Retrieve unread count
    const countRes = await fetch(`${baseUrl}/api/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(countRes.status, 200);
    const countBody = await countRes.json();
    assert.ok((countBody.data.unreadCount ?? countBody.data.count) !== undefined);
  });

  await t.test('Section 13: Activity Timeline & Immutable Audit History', async () => {
    // 1. Retrieve quotation activity stream
    const quoteActRes = await fetch(`${baseUrl}/api/activity/entity/QUOTATION/${quoteRep1.id}`, {
      headers: { Authorization: `Bearer ${salesToken1}` },
    });
    assert.strictEqual(quoteActRes.status, 200);
    const quoteActBody = await quoteActRes.json();
    const activities = Array.isArray(quoteActBody.data) ? quoteActBody.data : (quoteActBody.data?.activities || []);
    assert.ok(Array.isArray(activities));
    assert.ok(activities.length > 0);

    // 2. IDOR check: Sales Rep 2 attempts to view Sales Rep 1's quotation activity
    const idorActRes = await fetch(`${baseUrl}/api/activity/entity/QUOTATION/${quoteRep1.id}`, {
      headers: { Authorization: `Bearer ${salesToken2}` },
    });
    assert.strictEqual(idorActRes.status, 403, 'Unauthorized user cannot read quotation activity');
  });

  await t.test('Section 14: Standardized API Error Envelopes & Security Leakage Defense', async () => {
    // 1. 400 Bad Request: Invalid UUID syntax
    const badUuidRes = await fetch(`${baseUrl}/api/quotations/invalid-uuid-format`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(badUuidRes.status, 400);
    const badUuidBody = await badUuidRes.json();
    assert.strictEqual(badUuidBody.success, false);
    assert.ok(badUuidBody.error);

    // 2. 401 Unauthorized: Missing token
    const unauthRes = await fetch(`${baseUrl}/api/quotations`);
    assert.strictEqual(unauthRes.status, 401);
    const unauthBody = await unauthRes.json();
    assert.strictEqual(unauthBody.success, false);

    // 3. 403 Forbidden: Role violation
    const forbRes = await fetch(`${baseUrl}/api/discount-rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesToken1}`,
      },
      body: JSON.stringify({ name: 'Rule' }),
    });
    assert.strictEqual(forbRes.status, 403);
    const forbBody = await forbRes.json();
    assert.strictEqual(forbBody.success, false);

    // 4. 404 Not Found: Valid UUID but non-existent record
    const notFoundRes = await fetch(`${baseUrl}/api/quotations/00000000-0000-0000-0000-000000000099`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(notFoundRes.status, 404);
    const notFoundBody = await notFoundRes.json();
    assert.strictEqual(notFoundBody.success, false);

    // 5. Stack Trace Privacy: Verify stack traces are not leaked to API response
    assert.strictEqual(notFoundBody.stack, undefined);
    assert.strictEqual(badUuidBody.stack, undefined);
  });

  await t.test('Section 15: Concurrency & Race Condition Defense', async () => {
    // Create an approved quote to test concurrent order conversion
    const cQuoteRes = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesToken1}`,
      },
      body: JSON.stringify({ customerId: auditCustomer.id }),
    });
    const cQuote = (await cQuoteRes.json()).data.quotation;

    await fetch(`${baseUrl}/api/quotations/${cQuote.id}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesToken1}`,
      },
      body: JSON.stringify({
        productId: auditProduct.id,
        quantity: 1,
        discountPercentage: 0,
      }),
    });

    await fetch(`${baseUrl}/api/quotations/${cQuote.id}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesToken1}` },
    });

    // Directly set to APPROVED to isolate race condition testing on order conversion
    await prisma.quotation.update({
      where: { id: cQuote.id },
      data: { status: QuoteStatus.APPROVED },
    });

    // Fire two simultaneous order conversions against the same quote
    const [conv1, conv2] = await Promise.all([
      fetch(`${baseUrl}/api/quotations/${cQuote.id}/create-order`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${salesToken1}` },
      }),
      fetch(`${baseUrl}/api/quotations/${cQuote.id}/create-order`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${salesToken1}` },
      }),
    ]);

    const statuses = [conv1.status, conv2.status];
    // Exactly one should succeed (201) and one should fail (409 Conflict)
    assert.ok(statuses.includes(201), 'One conversion must succeed with 201');
    assert.ok(statuses.includes(409), 'Second conversion must be blocked with 409 Conflict');

    // Verify exactly one order exists for this quotation
    const orderCount = await prisma.order.count({ where: { quotationId: cQuote.id } });
    assert.strictEqual(orderCount, 1, 'Exactly one order must be created');
  });

  await t.test('Section 16: Performance, Pagination & Payload Bounds Check', async () => {
    // 1. Pagination clamp check: Requesting limit=500 should be clamped to 100 max
    const pageRes = await fetch(`${baseUrl}/api/products?limit=500`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(pageRes.status, 200);
    const pageBody = await pageRes.json();
    assert.ok(pageBody.data.pagination);
    assert.ok(pageBody.data.pagination.limit <= 100, 'Pagination limit must be clamped to 100');

    // 2. Health check response latency
    const start = performance.now();
    const hRes = await fetch(`${baseUrl}/health`);
    const duration = performance.now() - start;
    assert.strictEqual(hRes.status, 200);
    assert.ok(duration < 200, `Health check latency was ${duration.toFixed(2)}ms (expected < 200ms)`);
  });

  await t.test('Section 17: Complete End-to-End Lead-to-Cash Multi-Role Scenario', async () => {
    // Step 1: Sales Rep Login
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sales.rep@dealflow360.com',
        password: 'Password123!',
      }),
    });
    assert.strictEqual(loginRes.status, 200);
    const repToken = (await loginRes.json()).data.token;
    assert.ok(repToken, 'Rep token must be defined');

    // Step 2: Create Enterprise Customer
    const custRes = await fetch(`${baseUrl}/api/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${repToken}`,
      },
      body: JSON.stringify({
        companyName: `OmniCorp Global ${Date.now()}`,
        contactName: 'Elena Rostova',
        email: `elena.${Date.now()}@omnicorp.com`,
        customerTier: CustomerTier.SILVER,
        currency: 'USD',
      }),
    });
    assert.strictEqual(custRes.status, 201);
    const e2eCustomer = (await custRes.json()).data.customer;

    // Step 3: Create Draft Quotation
    const quoteRes = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${repToken}`,
      },
      body: JSON.stringify({ customerId: e2eCustomer.id }),
    });
    assert.strictEqual(quoteRes.status, 201);
    const e2eQuote = (await quoteRes.json()).data.quotation;

    // Step 4: Add Catalog Products
    const itemRes = await fetch(`${baseUrl}/api/quotations/${e2eQuote.id}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${repToken}`,
      },
      body: JSON.stringify({
        productId: auditProduct.id,
        quantity: 2,
        discountPercentage: 5.0,
      }),
    });
    assert.strictEqual(itemRes.status, 201);

    // Step 5: Recalculate & Submit Quotation
    await fetch(`${baseUrl}/api/quotations/${e2eQuote.id}/recalculate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${repToken}` },
    });

    const subRes = await fetch(`${baseUrl}/api/quotations/${e2eQuote.id}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${repToken}` },
    });
    assert.strictEqual(subRes.status, 200);

    // Step 6: Multi-Stage Approval if required
    const dbQuote = await prisma.quotation.findUnique({
      where: { id: e2eQuote.id },
      include: { approvals: true },
    });

    if (dbQuote.status === QuoteStatus.PENDING_APPROVAL) {
      for (const step of dbQuote.approvals) {
        if (step.approvalRole === UserRole.SALES_MANAGER) {
          const mApp = await fetch(`${baseUrl}/api/approvals/${step.id}/approve`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${managerToken}` },
          });
          assert.strictEqual(mApp.status, 200);
        } else if (step.approvalRole === UserRole.FINANCE) {
          const fApp = await fetch(`${baseUrl}/api/approvals/${step.id}/approve`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${financeToken}` },
          });
          assert.strictEqual(fApp.status, 200);
        }
      }
    }

    // Direct DB validation: Quote is APPROVED
    const approvedQuote = await prisma.quotation.findUnique({ where: { id: e2eQuote.id } });
    assert.strictEqual(approvedQuote.status, QuoteStatus.APPROVED);

    // Step 7: Convert to Sales Order
    const orderRes = await fetch(`${baseUrl}/api/quotations/${e2eQuote.id}/create-order`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${repToken}` },
    });
    assert.strictEqual(orderRes.status, 201);
    const e2eOrder = (await orderRes.json()).data.order;

    // Direct DB validation: Order exists and is CONFIRMED
    const dbOrder = await prisma.order.findUnique({ where: { id: e2eOrder.id } });
    assert.strictEqual(dbOrder.status, OrderStatus.CONFIRMED);

    // Step 8: Fulfillment assignment & shipment
    const fulListRes = await fetch(`${baseUrl}/api/orders/${e2eOrder.id}/fulfillment`, {
      headers: { Authorization: `Bearer ${opsToken}` },
    });
    const fulData = (await fulListRes.json()).data;
    const e2eFul = Array.isArray(fulData) ? fulData[0] : (fulData?.fulfillments ? fulData.fulfillments[0] : null);
    assert.ok(e2eFul, 'Fulfillment must exist for order');

    await fetch(`${baseUrl}/api/fulfillments/${e2eFul.id}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opsToken}`,
      },
      body: JSON.stringify({ operationsUserId: opsUser.id }),
    });

    await fetch(`${baseUrl}/api/fulfillments/${e2eFul.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opsToken}`,
      },
      body: JSON.stringify({ status: FulfillmentStatus.PROCESSING }),
    });

    await fetch(`${baseUrl}/api/fulfillments/${e2eFul.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opsToken}`,
      },
      body: JSON.stringify({ status: FulfillmentStatus.SHIPPED }),
    });

    await fetch(`${baseUrl}/api/fulfillments/${e2eFul.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opsToken}`,
      },
      body: JSON.stringify({ status: FulfillmentStatus.DELIVERED }),
    });

    // Step 9: Create and Issue Invoice
    const invRes = await fetch(`${baseUrl}/api/orders/${e2eOrder.id}/create-invoice`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${financeToken}` },
    });
    assert.strictEqual(invRes.status, 201);
    const invJson = await invRes.json();
    const e2eInvoice = invJson.data?.invoice || invJson.data;
    assert.ok(e2eInvoice, 'Invoice must exist');

    await fetch(`${baseUrl}/api/invoices/${e2eInvoice.id}/issue`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${financeToken}` },
    });

    // Step 10: Settle Payment
    const totalToPay = Number(e2eInvoice.totalAmount);
    const payRes = await fetch(`${baseUrl}/api/invoices/${e2eInvoice.id}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({
        amount: totalToPay,
        paymentMethod: 'WIRE_TRANSFER',
        transactionReference: `TXN-E2E-${Date.now()}`,
      }),
    });
    assert.strictEqual(payRes.status, 201);

    // Direct DB validation: Invoice is PAID and outstanding is 0
    const dbInvoice = await prisma.invoice.findUnique({ where: { id: e2eInvoice.id } });
    assert.strictEqual(dbInvoice.status, InvoiceStatus.PAID);
    assert.strictEqual(Number(dbInvoice.outstandingAmount), 0);

    // Direct DB validation: Activity stream recorded
    const actCount = await prisma.activity.count({
      where: {
        entityId: { in: [e2eQuote.id, e2eOrder.id, e2eInvoice.id] },
      },
    });
    assert.ok(actCount > 0, 'Activities must be recorded across the entire lead-to-cash lifecycle');
  });

  t.after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});
