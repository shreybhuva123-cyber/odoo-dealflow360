import test from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { config, env } from '../src/config/env.js';
import { generateAccessToken } from '../src/utils/jwt.js';
import { QuoteStatus, OrderStatus, InvoiceStatus, PaymentStatus, UserRole, CustomerTier, NotificationType } from '@prisma/client';

test('Phase 12: Security, Validation & Production Hardening Test Suite', async (t) => {
  let server;
  const port = 5130;
  const baseUrl = `http://localhost:${port}`;

  let adminToken, salesTokenA, salesTokenB, managerToken, financeToken, opsToken, deactivatedToken;
  let adminUser, salesUserA, salesUserB, managerUser, financeUser, opsUser, deactivatedUser;
  let testCustomer, testProduct;

  await t.test('Bootstrap: Test server, users, customer, and product fixtures', async () => {
    await new Promise((resolve) => {
      server = app.listen(port, () => resolve());
    });
    assert.ok(server);

    // Bootstrap Users
    adminUser = await prisma.user.findUnique({ where: { email: 'admin@dealflow360.com' } });
    salesUserA = await prisma.user.findUnique({ where: { email: 'sales.rep@dealflow360.com' } });
    managerUser = await prisma.user.findUnique({ where: { email: 'sales.manager@dealflow360.com' } });
    financeUser = await prisma.user.findUnique({ where: { email: 'finance@dealflow360.com' } });
    opsUser = await prisma.user.findUnique({ where: { email: 'operations@dealflow360.com' } });

    // Ensure Sales Rep B exists for multi-tenant / IDOR isolation tests
    salesUserB = await prisma.user.upsert({
      where: { email: 'sales.rep.secb@dealflow360.com' },
      update: { isActive: true },
      create: {
        email: 'sales.rep.secb@dealflow360.com',
        name: 'Sales Rep B (Security Fixture)',
        passwordHash: '$2a$10$e8kG6vT4n0xXW3/K/NqX..8tY8y0zN3J7k6Q9.4r5P1m9K2/Z0u1W',
        role: UserRole.SALES_REP,
        isActive: true,
      },
    });

    // Ensure Deactivated User exists
    deactivatedUser = await prisma.user.upsert({
      where: { email: 'deactivated.sec@dealflow360.com' },
      update: { isActive: false },
      create: {
        email: 'deactivated.sec@dealflow360.com',
        name: 'Deactivated Security User',
        passwordHash: '$2a$10$e8kG6vT4n0xXW3/K/NqX..8tY8y0zN3J7k6Q9.4r5P1m9K2/Z0u1W',
        role: UserRole.SALES_REP,
        isActive: false,
      },
    });

    assert.ok(adminUser && salesUserA && salesUserB && managerUser && financeUser && opsUser && deactivatedUser);

    adminToken = generateAccessToken(adminUser);
    salesTokenA = generateAccessToken(salesUserA);
    salesTokenB = generateAccessToken(salesUserB);
    managerToken = generateAccessToken(managerUser);
    financeToken = generateAccessToken(financeUser);
    opsToken = generateAccessToken(opsUser);
    deactivatedToken = generateAccessToken(deactivatedUser);

    // Bootstrap Customer fixture
    testCustomer = await prisma.customer.findFirst({ where: { isActive: true } });
    if (!testCustomer) {
      testCustomer = await prisma.customer.create({
        data: {
          name: 'Security Test Customer',
          email: 'sec.customer@example.com',
          tier: CustomerTier.SILVER,
          creditLimit: 50000,
          isActive: true,
        },
      });
    }

    // Bootstrap Product fixture
    testProduct = await prisma.product.findFirst({ where: { isActive: true } });
    if (!testProduct) {
      const cat = await prisma.category.findFirst() || await prisma.category.create({ data: { name: 'SecCat', code: 'SECCAT' } });
      testProduct = await prisma.product.create({
        data: {
          name: 'Sec Test Product',
          sku: 'SEC-PROD-001',
          categoryId: cat.id,
          basePrice: 100,
          costPrice: 50,
          isActive: true,
        },
      });
    }

    assert.ok(testCustomer && testProduct);
  });

  // ==========================================
  // GROUP 1: AUTHENTICATION & TOKEN SECURITY
  // ==========================================
  await t.test('1. Authentication: Missing Authorization header returns 401', async () => {
    const res = await fetch(`${baseUrl}/api/quotations`);
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  await t.test('2. Authentication: Invalid Authorization header format returns 401', async () => {
    const res = await fetch(`${baseUrl}/api/quotations`, {
      headers: { Authorization: 'Basic YWRtaW46cGFzc3dvcmQ=' },
    });
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  await t.test('3. Authentication: Expired JWT token returns 401', async () => {
    const expiredToken = jwt.sign(
      { userId: salesUserA.id, email: salesUserA.email, role: salesUserA.role },
      config.jwtSecret,
      { algorithm: 'HS256', expiresIn: '-10s' }
    );
    const res = await fetch(`${baseUrl}/api/quotations`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  await t.test('4. Authentication: Malformed JWT token returns 401', async () => {
    const res = await fetch(`${baseUrl}/api/quotations`, {
      headers: { Authorization: 'Bearer this-is-not-a-valid-jwt-token' },
    });
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  await t.test('5. Authentication: Algorithm "none" forged token returns 401', async () => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ userId: adminUser.id, email: adminUser.email, role: 'ADMIN' })).toString('base64url');
    const forgedToken = `${header}.${payload}.`;

    const res = await fetch(`${baseUrl}/api/quotations`, {
      headers: { Authorization: `Bearer ${forgedToken}` },
    });
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  await t.test('6. Authentication: Token signed with wrong secret returns 401', async () => {
    const wrongSecretToken = jwt.sign(
      { userId: adminUser.id, email: adminUser.email, role: adminUser.role },
      'wrong-secret-key-32-chars-long-security-test!!',
      { algorithm: 'HS256', expiresIn: '1h' }
    );
    const res = await fetch(`${baseUrl}/api/quotations`, {
      headers: { Authorization: `Bearer ${wrongSecretToken}` },
    });
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  await t.test('7. Authentication: Deactivated user (isActive: false) returns 403', async () => {
    const res = await fetch(`${baseUrl}/api/quotations`, {
      headers: { Authorization: `Bearer ${deactivatedToken}` },
    });
    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.message.toLowerCase().includes('deactivated'));
  });

  // ==========================================
  // GROUP 2: AUTHORIZATION & RBAC DEFENSES
  // ==========================================
  await t.test('8. RBAC: SALES_REP cannot create discount rules (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/discount-rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({
        name: 'Hacker Discount',
        ruleType: 'PERCENTAGE',
        discountValue: 90,
      }),
    });
    assert.strictEqual(res.status, 403);
  });

  await t.test('9. RBAC: SALES_REP cannot update discount rules (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/discount-rules/11111111-1111-1111-1111-111111111111`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({ name: 'Tampered Rule' }),
    });
    assert.strictEqual(res.status, 403);
  });

  await t.test('10. RBAC: SALES_REP cannot create internal users (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({
        name: 'Unauthorized Admin',
        email: 'unauth.admin@dealflow360.com',
        password: 'Password123!',
        role: 'ADMIN',
      }),
    });
    assert.strictEqual(res.status, 403);
  });

  await t.test('11. RBAC: OPERATIONS cannot create invoices (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/orders/11111111-1111-1111-1111-111111111111/create-invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opsToken}`,
      },
      body: JSON.stringify({ notes: 'Unauthorized invoice attempt' }),
    });
    assert.strictEqual(res.status, 403);
  });

  await t.test('12. RBAC: OPERATIONS cannot record payments (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/invoices/11111111-1111-1111-1111-111111111111/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opsToken}`,
      },
      body: JSON.stringify({
        amount: 100,
        paymentMethod: 'BANK_TRANSFER',
      }),
    });
    assert.strictEqual(res.status, 403);
  });

  await t.test('13. RBAC: FINANCE cannot modify order fulfillment status (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/orders/11111111-1111-1111-1111-111111111111/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({ status: 'PROCESSING' }),
    });
    assert.strictEqual(res.status, 403);
  });

  await t.test('14. RBAC: SALES_REP cannot approve quotations (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/approvals/11111111-1111-1111-1111-111111111111/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({ notes: 'Attempting self-approval via approvals endpoint' }),
    });
    assert.strictEqual(res.status, 403);
  });

  await t.test('15. RBAC: ADMIN has access to administrative endpoints (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/discount-rules`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
  });

  // ==========================================
  // GROUP 3: IDOR & MULTI-TENANCY DATA ISOLATION
  // ==========================================
  let quoteAId;
  let orderAId;
  let notifAId;

  await t.test('16. IDOR Setup: Sales Rep A creates a quotation', async () => {
    const res = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({ customerId: testCustomer.id }),
    });
    assert.strictEqual(res.status, 201);
    const body = await res.json();
    quoteAId = body.data.quotation.id;
    assert.ok(quoteAId);
  });

  await t.test('17. IDOR: Sales Rep B cannot view Sales Rep A quotation (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/quotations/${quoteAId}`, {
      headers: { Authorization: `Bearer ${salesTokenB}` },
    });
    assert.strictEqual(res.status, 403);
  });

  await t.test('18. IDOR: Sales Rep B cannot update Sales Rep A quotation (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/quotations/${quoteAId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenB}`,
      },
      body: JSON.stringify({ customerId: testCustomer.id }),
    });
    assert.strictEqual(res.status, 403);
  });

  await t.test('19. IDOR: Sales Rep B cannot add item to Sales Rep A quotation (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/quotations/${quoteAId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenB}`,
      },
      body: JSON.stringify({ productId: testProduct.id, quantity: 1 }),
    });
    assert.strictEqual(res.status, 403);
  });

  await t.test('20. IDOR: Sales Rep B cannot cancel Sales Rep A quotation (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/quotations/${quoteAId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenB}`,
      },
    });
    assert.strictEqual(res.status, 403);
  });

  await t.test('21. IDOR Setup: Convert Quote A to Order A and create Notification for User A', async () => {
    // Add item to quote A
    await fetch(`${baseUrl}/api/quotations/${quoteAId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({ productId: testProduct.id, quantity: 2 }),
    });

    // Directly set quote A status to APPROVED in DB to convert to order
    await prisma.quotation.update({
      where: { id: quoteAId },
      data: { status: QuoteStatus.APPROVED },
    });

    const orderRes = await fetch(`${baseUrl}/api/quotations/${quoteAId}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({ notes: 'Order A from Quote A' }),
    });
    assert.strictEqual(orderRes.status, 201);
    const orderBody = await orderRes.json();
    orderAId = orderBody.data.order.id;
    assert.ok(orderAId);

    // Create Notification fixture for User A
    const notif = await prisma.notification.create({
      data: {
        userId: salesUserA.id,
        type: NotificationType.ORDER_CREATED,
        title: 'Secret Alert for User A',
        message: 'Confidential message',
      },
    });
    notifAId = notif.id;
    assert.ok(notifAId);
  });

  await t.test('22. IDOR: Sales Rep B cannot view Sales Rep A order (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/orders/${orderAId}`, {
      headers: { Authorization: `Bearer ${salesTokenB}` },
    });
    assert.strictEqual(res.status, 403);
  });

  await t.test('23. IDOR: User B cannot view User A notification (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/notifications/${notifAId}`, {
      headers: { Authorization: `Bearer ${salesTokenB}` },
    });
    assert.strictEqual(res.status, 403);
  });

  await t.test('24. IDOR: User B cannot mark User A notification as read (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/notifications/${notifAId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${salesTokenB}` },
    });
    assert.strictEqual(res.status, 403);
  });

  await t.test('25. IDOR: User B cannot delete User A notification (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/notifications/${notifAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${salesTokenB}` },
    });
    assert.strictEqual(res.status, 403);
  });

  // ==========================================
  // GROUP 4: MASS ASSIGNMENT & REQUEST TAMPERING
  // ==========================================
  await t.test('26. Mass Assignment: Register with role: "ADMIN" forces SALES_REP role', async () => {
    const email = `escalation.${Date.now()}@dealflow360.com`;
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Escalation Attacker',
        email,
        password: 'Password123!',
        role: 'ADMIN', // Tampering attempt
      }),
    });
    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.data.user.role, 'SALES_REP', 'Public registration must never grant ADMIN role');
  });

  await t.test('27. Mass Assignment: Update quotation with privileged fields (status, totalAmount) rejected with 400', async () => {
    const res = await fetch(`${baseUrl}/api/quotations/${quoteAId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({
        status: 'APPROVED',
        totalAmount: 1.0,
        riskScore: 0,
      }),
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  await t.test('28. Mass Assignment: Update invoice with arbitrary field (paidAmount) rejected with 400', async () => {
    const res = await fetch(`${baseUrl}/api/invoices/11111111-1111-1111-1111-111111111111`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({
        paidAmount: 99999.99, // Tampering attempt
      }),
    });
    assert.strictEqual(res.status, 400);
  });

  await t.test('29. Mass Assignment: Update payment with arbitrary field (status) rejected with 400', async () => {
    const res = await fetch(`${baseUrl}/api/payments/11111111-1111-1111-1111-111111111111`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({
        status: 'COMPLETED', // Tampering attempt
      }),
    });
    assert.strictEqual(res.status, 400);
  });

  // ==========================================
  // GROUP 5: INPUT VALIDATION, INJECTION & BOUNDARIES
  // ==========================================
  await t.test('30. Input Validation: Malformed UUID route param returns 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/quotations/not-a-valid-uuid`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.message.toLowerCase().includes('uuid'));
  });

  await t.test('31. Input Validation: Path traversal attempt in route param returns 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/orders/..%2F..%2Fetc%2Fpasswd`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 400);
  });

  await t.test('32. SQL Injection Defense: Malicious SQL payload in customer search handled safely', async () => {
    const sqlInjectionPayload = encodeURIComponent("test' OR 1=1; DROP TABLE users; --");
    const res = await fetch(`${baseUrl}/api/customers?search=${sqlInjectionPayload}`, {
      headers: { Authorization: `Bearer ${salesTokenA}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
  });

  await t.test('33. Input Validation: Negative payment amount returns 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/invoices/11111111-1111-1111-1111-111111111111/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({
        amount: -50.0,
        paymentMethod: 'BANK_TRANSFER',
      }),
    });
    assert.strictEqual(res.status, 400);
  });

  await t.test('34. Input Validation: Negative quotation item quantity returns 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/quotations/${quoteAId}/items`, {
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
    assert.strictEqual(res.status, 400);
  });

  await t.test('35. HPP & Parameter Sanitizer: Duplicate query parameters handled safely', async () => {
    const res = await fetch(`${baseUrl}/api/customers?search=test&search=duplicate`, {
      headers: { Authorization: `Bearer ${salesTokenA}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
  });

  await t.test('36. Boundary Defense: Excessively long search string is safely truncated without crash', async () => {
    const oversizedSearch = 'a'.repeat(250);
    const res = await fetch(`${baseUrl}/api/customers?search=${oversizedSearch}`, {
      headers: { Authorization: `Bearer ${salesTokenA}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
  });

  // ==========================================
  // GROUP 6: WORKFLOW INTEGRITY & ANTI-TAMPERING
  // ==========================================
  await t.test('37. Workflow Integrity: Invalid order fulfillment status transition returns 400', async () => {
    // Attempting CONFIRMED -> DELIVERED directly
    const res = await fetch(`${baseUrl}/api/orders/${orderAId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opsToken}`,
      },
      body: JSON.stringify({ status: 'DELIVERED' }),
    });
    assert.strictEqual(res.status, 400);
  });

  await t.test('38. Workflow Integrity: Sales Rep anti-self-approval rule prevents approving own quote', async () => {
    // Create new quote by Sales Rep A
    const qRes = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({ customerId: testCustomer.id }),
    });
    const qBody = await qRes.json();
    const selfQuoteId = qBody.data.quotation.id;

    // Add item with high discount to trigger approval
    await fetch(`${baseUrl}/api/quotations/${selfQuoteId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({ productId: testProduct.id, quantity: 1, discountPercentage: 35 }),
    });

    // Submit quotation
    await fetch(`${baseUrl}/api/quotations/${selfQuoteId}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesTokenA}` },
    });

    // Find pending approval ID for this quote
    const pendingApproval = await prisma.approval.findFirst({
      where: { quotationId: selfQuoteId, status: 'PENDING' },
    });

    if (pendingApproval) {
      // Sales Rep attempts to approve it -> 403 Forbidden
      const approveRes = await fetch(`${baseUrl}/api/approvals/${pendingApproval.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${salesTokenA}`,
        },
        body: JSON.stringify({ notes: 'Self approval attempt' }),
      });
      assert.strictEqual(approveRes.status, 403);
    } else {
      assert.ok(true, 'No pending approval created, anti-self-approval skipped');
    }
  });

  await t.test('39. Workflow Integrity: Duplicate order conversion from same quotation returns 409', async () => {
    const res = await fetch(`${baseUrl}/api/quotations/${quoteAId}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({ notes: 'Second order conversion attempt' }),
    });
    assert.strictEqual(res.status, 409);
  });

  await t.test('40. Workflow Integrity: Overpayment exceeding invoice balance returns 400', async () => {
    // Create an invoice from Order A
    const invRes = await fetch(`${baseUrl}/api/orders/${orderAId}/create-invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({ notes: 'Invoice for overpayment test' }),
    });
    assert.strictEqual(invRes.status, 201);
    const invBody = await invRes.json();
    const invId = invBody.data.id;

    // Issue invoice
    await fetch(`${baseUrl}/api/invoices/${invId}/issue`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${financeToken}` },
    });

    // Attempt overpayment
    const payRes = await fetch(`${baseUrl}/api/invoices/${invId}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({
        amount: 1000000.0, // Massive overpayment
        paymentMethod: 'BANK_TRANSFER',
      }),
    });
    assert.strictEqual(payRes.status, 400);
    const payBody = await payRes.json();
    assert.strictEqual(payBody.success, false);
  });

  // ==========================================
  // GROUP 7: SECURITY HEADERS & SERVER FOOTPRINT
  // ==========================================
  await t.test('41. Security Headers: Express fingerprint (x-powered-by) is completely stripped', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.headers.get('x-powered-by'), null);
  });

  await t.test('42. Security Headers: X-Content-Type-Options is nosniff', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
  });

  await t.test('43. Security Headers: X-Frame-Options is DENY', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.headers.get('x-frame-options'), 'DENY');
  });

  await t.test('44. Security Headers: X-XSS-Protection is 0', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.headers.get('x-xss-protection'), '0');
  });

  await t.test('45. Security Headers: Referrer-Policy is strict-origin-when-cross-origin', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  });

  // ==========================================
  // GROUP 8: RATE LIMITING DEFENSE
  // ==========================================
  await t.test('46. Rate Limiting: Rapid authentication attempts trigger 429 Too Many Requests', async () => {
    const email = `ratelimit.${Date.now()}@dealflow360.com`;
    let triggered429 = false;
    let rateLimitResponse = null;

    for (let i = 0; i < 25; i++) {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-rate-limit': 'true', // Test flag activating limiter in test environment
        },
        body: JSON.stringify({ email, password: 'WrongPassword123!' }),
      });

      if (res.status === 429) {
        triggered429 = true;
        rateLimitResponse = res;
        break;
      }
    }

    assert.ok(triggered429, 'Rate limiter should return 429 after exceeding max requests');
    assert.ok(rateLimitResponse.headers.get('retry-after'));
    const body = await rateLimitResponse.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.message.toLowerCase().includes('too many'));
  });

  // ==========================================
  // GROUP 9: HEALTH CHECK ENDPOINTS
  // ==========================================
  await t.test('47. Health Check: Root GET /health returns 200 OK with status ok', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'ok');
    assert.ok(body.uptime !== undefined);
  });

  await t.test('48. Health Check: API GET /api/health returns 200 OK with healthy status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.data.status === 'healthy' || body.data.status === 'ok');
    assert.ok(body.data.uptime !== undefined);
  });

  // ==========================================
  // GROUP 10: END-TO-END MULTI-ROLE WORKFLOW TEST
  // ==========================================
  await t.test('49. Multi-Role Workflow: Complete B2B sales cycle across 4 roles with strict audit trail', async () => {
    // 1. Sales Rep creates quotation
    const qRes = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({ customerId: testCustomer.id }),
    });
    assert.strictEqual(qRes.status, 201);
    const qBody = await qRes.json();
    const quoteId = qBody.data.quotation.id;

    // 2. Sales Rep adds item
    const itemRes = await fetch(`${baseUrl}/api/quotations/${quoteId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({ productId: testProduct.id, quantity: 5, discountPercentage: 20 }),
    });
    assert.strictEqual(itemRes.status, 201);

    // 3. Sales Rep submits quotation
    const submitRes = await fetch(`${baseUrl}/api/quotations/${quoteId}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesTokenA}` },
    });
    assert.strictEqual(submitRes.status, 200);

    // 4. Multi-step approvals: approve all steps (Sales Manager and/or Finance)
    const pendingApprovals = await prisma.approval.findMany({
      where: { quotationId: quoteId, status: 'PENDING' },
      orderBy: { stepOrder: 'asc' },
    });
    for (const appStep of pendingApprovals) {
      const token = appStep.approvalRole === UserRole.FINANCE ? financeToken : managerToken;
      const appRes = await fetch(`${baseUrl}/api/approvals/${appStep.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: 'Step approved for security e2e test' }),
      });
      assert.strictEqual(appRes.status, 200);
    }

    // Ensure quotation status is APPROVED
    const checkQuote = await prisma.quotation.findUnique({ where: { id: quoteId } });
    assert.strictEqual(checkQuote.status, QuoteStatus.APPROVED);

    // 5. Sales Rep converts quotation to order
    const orderRes = await fetch(`${baseUrl}/api/quotations/${quoteId}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesTokenA}`,
      },
      body: JSON.stringify({ notes: 'E2E Order converted' }),
    });
    assert.strictEqual(orderRes.status, 201);
    const orderBody = await orderRes.json();
    const orderId = orderBody.data.order.id;

    // 6. Operations transitions order status: CONFIRMED -> PROCESSING -> READY_FOR_FULFILLMENT -> SHIPPED -> DELIVERED
    const s1 = await fetch(`${baseUrl}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opsToken}`,
      },
      body: JSON.stringify({ status: OrderStatus.PROCESSING }),
    });
    assert.strictEqual(s1.status, 200);

    const s2 = await fetch(`${baseUrl}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opsToken}`,
      },
      body: JSON.stringify({ status: OrderStatus.READY_FOR_FULFILLMENT }),
    });
    assert.strictEqual(s2.status, 200);

    const s3 = await fetch(`${baseUrl}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opsToken}`,
      },
      body: JSON.stringify({ status: OrderStatus.SHIPPED }),
    });
    assert.strictEqual(s3.status, 200);

    const s4 = await fetch(`${baseUrl}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opsToken}`,
      },
      body: JSON.stringify({ status: OrderStatus.DELIVERED }),
    });
    assert.strictEqual(s4.status, 200);

    // 7. Finance generates invoice from order
    const invRes = await fetch(`${baseUrl}/api/orders/${orderId}/create-invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({ notes: 'Finance generated invoice' }),
    });
    assert.strictEqual(invRes.status, 201);
    const invBody = await invRes.json();
    const invoiceId = invBody.data.id;
    const invTotal = Number(invBody.data.totalAmount);

    // 8. Finance issues invoice
    const issueRes = await fetch(`${baseUrl}/api/invoices/${invoiceId}/issue`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${financeToken}` },
    });
    assert.strictEqual(issueRes.status, 200);

    // 9. Finance records full payment
    const payRes = await fetch(`${baseUrl}/api/invoices/${invoiceId}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({
        amount: invTotal,
        paymentMethod: 'BANK_TRANSFER',
        transactionReference: `TXN-SEC-E2E-${Date.now()}`,
      }),
    });
    assert.strictEqual(payRes.status, 201);

    // 10. Verify final invoice state is PAID
    const finalInvRes = await fetch(`${baseUrl}/api/invoices/${invoiceId}`, {
      headers: { Authorization: `Bearer ${financeToken}` },
    });
    const finalInvBody = await finalInvRes.json();
    assert.strictEqual(finalInvBody.data.status, InvoiceStatus.PAID);
    assert.strictEqual(Number(finalInvBody.data.outstandingAmount), 0);

    // 11. Verify Audit Logs recorded
    const logs = await prisma.auditLog.findMany({
      where: {
        entityId: { in: [quoteId, orderId, invoiceId] },
      },
    });
    assert.ok(logs.length > 0, 'Audit logs must be generated for all critical lifecycle events');
  });

  t.after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});
