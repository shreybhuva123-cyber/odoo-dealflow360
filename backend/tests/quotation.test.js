import test from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { generateAccessToken } from '../src/utils/jwt.js';
import { QuoteStatus, UserRole, CustomerTier } from '@prisma/client';
import bcrypt from 'bcryptjs';

test('Phase 5: Quotation Engine Comprehensive Test Suite', async (t) => {
  let server;
  const port = 5078;
  const baseUrl = `http://localhost:${port}`;

  let adminToken, sales1Token, sales2Token, managerToken;
  let adminUser, salesUser1, salesUser2, managerUser;
  let goldCustomer, inactiveCustomer;
  let laptopProduct, laptopVariant;
  let monitorProduct;

  await t.test('Bootstrap: Start test server, users, customers & products', async () => {
    await new Promise((resolve) => {
      server = app.listen(port, () => resolve());
    });
    assert.ok(server);

    // Fetch or create users
    adminUser = await prisma.user.findUnique({ where: { email: 'admin@dealflow360.com' } });
    salesUser1 = await prisma.user.findUnique({ where: { email: 'sales.rep@dealflow360.com' } });
    managerUser = await prisma.user.findUnique({ where: { email: 'sales.manager@dealflow360.com' } });

    // Create salesUser2 if not exists for ownership tests
    const sales2Email = 'sales.rep2@dealflow360.com';
    let s2 = await prisma.user.findUnique({ where: { email: sales2Email } });
    if (!s2) {
      const passwordHash = await bcrypt.hash('Password123!', 10);
      s2 = await prisma.user.create({
        data: {
          name: 'Bob Martinez (Sales Rep 2)',
          email: sales2Email,
          passwordHash,
          role: UserRole.SALES_REP,
          isActive: true,
        },
      });
    }
    salesUser2 = s2;

    adminToken = generateAccessToken(adminUser);
    sales1Token = generateAccessToken(salesUser1);
    sales2Token = generateAccessToken(salesUser2);
    managerToken = generateAccessToken(managerUser);

    // Fetch Gold customer (e.g. Initech)
    goldCustomer = await prisma.customer.findFirst({
      where: { customerTier: CustomerTier.GOLD, isActive: true },
    });
    assert.ok(goldCustomer, 'Gold customer must exist from seed');

    // Create an inactive customer for negative test
    const inactiveEmail = `inactive.${Date.now()}@example.com`;
    inactiveCustomer = await prisma.customer.create({
      data: {
        companyName: 'Defunct Industries Ltd',
        contactName: 'Jane Gone',
        email: inactiveEmail,
        customerTier: CustomerTier.BRONZE,
        isActive: false,
      },
    });

    // Fetch Laptop product and its variant (HW-LAPTOP-15)
    laptopProduct = await prisma.product.findUnique({
      where: { sku: 'HW-LAPTOP-15' },
      include: { variants: true },
    });
    assert.ok(laptopProduct, 'Laptop product HW-LAPTOP-15 must exist');
    laptopVariant = laptopProduct.variants.find((v) => Number(v.extraPrice) > 0) || laptopProduct.variants[0];

    // Fetch monitor product (HW-MONITOR-27)
    monitorProduct = await prisma.product.findUnique({
      where: { sku: 'HW-MONITOR-27' },
    });
    assert.ok(monitorProduct, 'Monitor product HW-MONITOR-27 must exist');
  });

  // =============================================================
  // PART 1: QUOTATION CREATION & VALIDATION
  // =============================================================
  let quoteId1;
  let quoteNumber1;

  await t.test('1. Create draft quotation (SALES_REP)', async () => {
    const res = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({
        customerId: goldCustomer.id,
        expiresAt: '2026-12-31T23:59:59Z',
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.quotation.status, QuoteStatus.DRAFT);
    assert.strictEqual(data.data.quotation.salesRepId, salesUser1.id);
    assert.strictEqual(Number(data.data.quotation.subtotal), 0);
    assert.strictEqual(Number(data.data.quotation.totalAmount), 0);
    assert.match(data.data.quotation.quoteNumber, /^DFQ-\d{4}-\d{6}$/);

    quoteId1 = data.data.quotation.id;
    quoteNumber1 = data.data.quotation.quoteNumber;
  });

  await t.test('2. Security: Frontend cannot override salesRepId', async () => {
    const res = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({
        customerId: goldCustomer.id,
        salesRepId: adminUser.id, // Frontend attempts to impersonate Admin
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    // Must be assigned to salesUser1 (from token), not adminUser
    assert.strictEqual(data.data.quotation.salesRepId, salesUser1.id);
  });

  await t.test('3. Reject creation with non-existent customer (404)', async () => {
    const res = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({
        customerId: 'a0000000-0000-0000-0000-000000000000',
      }),
    });

    assert.strictEqual(res.status, 404);
  });

  await t.test('4. Reject creation with inactive customer (400)', async () => {
    const res = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({
        customerId: inactiveCustomer.id,
      }),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /inactive/i);
  });

  // =============================================================
  // PART 2: ADDING ITEMS & CALCULATION ENGINE
  // =============================================================
  let itemId1;

  await t.test('5. Add product item with tier price lookup and margin calculation', async () => {
    // Gold tier gets custom price (1584 instead of base 1800)
    // Quantity: 2, Discount: 10%
    const res = await fetch(`${baseUrl}/api/quotations/${quoteId1}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({
        productId: laptopProduct.id,
        quantity: 2,
        discountPercentage: 10,
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);

    const item = data.data.item;
    assert.strictEqual(Number(item.unitPrice), 1584.0);
    assert.strictEqual(item.quantity, 2);
    assert.strictEqual(Number(item.discountPercentage), 10.0);
    assert.strictEqual(Number(item.discountAmount), 316.8);
    assert.strictEqual(Number(item.costPrice), 1200.0);
    assert.strictEqual(Number(item.marginAmount), 451.2);
    assert.strictEqual(Number(item.marginPercentage), 15.82);

    // Quotation should be updated
    const quote = data.data.quotation;
    assert.strictEqual(Number(quote.subtotal), 3168.0);
    assert.strictEqual(Number(quote.discountAmount), 316.8);
    assert.strictEqual(Number(quote.totalAmount), 3093.55);
    assert.strictEqual(Number(quote.marginAmount), 451.2);

    itemId1 = item.id;
  });

  await t.test('6. Add product with variant (extraPrice added to unit price)', async () => {
    assert.ok(laptopVariant, 'Laptop variant required');
    const variantExtra = Number(laptopVariant.extraPrice);

    const res = await fetch(`${baseUrl}/api/quotations/${quoteId1}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({
        productId: laptopProduct.id,
        variantId: laptopVariant.id,
        quantity: 1,
        discountPercentage: 0,
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    const item = data.data.item;
    assert.strictEqual(Number(item.unitPrice), 1584.0 + variantExtra);
  });

  await t.test('7. Validation: Reject invalid quantity <= 0 with 400', async () => {
    const res = await fetch(`${baseUrl}/api/quotations/${quoteId1}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({
        productId: laptopProduct.id,
        quantity: 0,
      }),
    });

    assert.strictEqual(res.status, 400);
  });

  await t.test('8. Validation: Reject invalid discount > 100 with 400', async () => {
    const res = await fetch(`${baseUrl}/api/quotations/${quoteId1}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({
        productId: laptopProduct.id,
        quantity: 1,
        discountPercentage: 105,
      }),
    });

    assert.strictEqual(res.status, 400);
  });

  await t.test('9. Validation: Reject variant belonging to another product with 400', async () => {
    // Attempt to use laptop variant with monitor product
    const res = await fetch(`${baseUrl}/api/quotations/${quoteId1}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({
        productId: monitorProduct.id,
        variantId: laptopVariant.id, // Does not belong to monitor
        quantity: 1,
      }),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.match(data.message, /does not belong/i);
  });

  await t.test('10. Security: Frontend cannot override unitPrice or margin', async () => {
    const res = await fetch(`${baseUrl}/api/quotations/${quoteId1}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({
        productId: monitorProduct.id,
        quantity: 1,
        unitPrice: 10.0, // Frontend tries to give it away for 10
        marginAmount: 999.0,
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    // Must be authoritative monitor price for Gold tier (572.00)
    assert.strictEqual(Number(data.data.item.unitPrice), 572.0);
  });

  // =============================================================
  // PART 3: ITEM UPDATES, REMOVAL & RECALCULATION
  // =============================================================

  await t.test('11. Update item quantity and discount (auto recalculates quote)', async () => {
    // Update itemId1: quantity from 2 -> 5, discount 10% -> 5%
    const res = await fetch(`${baseUrl}/api/quotation-items/${itemId1}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({
        quantity: 5,
        discountPercentage: 5,
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    const item = data.data.item;
    assert.strictEqual(item.quantity, 5);
    assert.strictEqual(Number(item.discountPercentage), 5.0);
    assert.strictEqual(Number(item.discountAmount), 396.0);
    assert.strictEqual(Number(item.lineTotal), 8163.54);
    assert.strictEqual(Number(item.marginAmount), 1524.0);
    assert.strictEqual(Number(item.marginPercentage), 20.26);
  });

  await t.test('12. Explicit recalculate endpoint (POST /api/quotations/:id/recalculate)', async () => {
    const res = await fetch(`${baseUrl}/api/quotations/${quoteId1}/recalculate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sales1Token}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Number(data.data.quotation.totalAmount) > 0);
  });

  await t.test('13. Remove item from quotation (auto recalculates totals)', async () => {
    const res = await fetch(`${baseUrl}/api/quotation-items/${itemId1}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${sales1Token}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
  });

  // =============================================================
  // PART 4: RESOURCE-LEVEL OWNERSHIP & RBAC
  // =============================================================
  let rep2QuoteId;

  await t.test('14. Sales Rep 2 creates their own quotation', async () => {
    const res = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales2Token}`,
      },
      body: JSON.stringify({
        customerId: goldCustomer.id,
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.data.quotation.salesRepId, salesUser2.id);
    rep2QuoteId = data.data.quotation.id;
  });

  await t.test('15. Sales Rep 1 cannot edit Sales Rep 2 quotation returns 403', async () => {
    const res = await fetch(`${baseUrl}/api/quotations/${rep2QuoteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({
        expiresAt: '2026-11-11',
      }),
    });

    assert.strictEqual(res.status, 403);
  });

  await t.test('16. Sales Rep 1 cannot add item to Sales Rep 2 quotation returns 403', async () => {
    const res = await fetch(`${baseUrl}/api/quotations/${rep2QuoteId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({
        productId: monitorProduct.id,
        quantity: 1,
      }),
    });

    assert.strictEqual(res.status, 403);
  });

  await t.test('17. Sales Rep 1 cannot view Sales Rep 2 quotation details returns 403', async () => {
    const res = await fetch(`${baseUrl}/api/quotations/${rep2QuoteId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${sales1Token}`,
      },
    });

    assert.strictEqual(res.status, 403);
  });

  await t.test('18. Sales Rep 1 quote list only contains their own quotations', async () => {
    const res = await fetch(`${baseUrl}/api/quotations`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${sales1Token}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    const quotations = data.data.quotations;
    assert.ok(quotations.length > 0);
    for (const q of quotations) {
      assert.strictEqual(q.salesRepId, salesUser1.id);
    }
  });

  await t.test('19. Sales Manager can view any quotation', async () => {
    const res = await fetch(`${baseUrl}/api/quotations/${rep2QuoteId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${managerToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.data.quotation.id, rep2QuoteId);
  });

  await t.test('20. Admin can view and manage any quotation', async () => {
    const res = await fetch(`${baseUrl}/api/quotations/${rep2QuoteId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.data.quotation.id, rep2QuoteId);
  });

  // =============================================================
  // PART 5: STATUS TRANSITIONS, SUBMISSION & CANCELLATION
  // =============================================================
  let submitQuoteId;

  await t.test('21. Cannot submit quotation with zero items (400)', async () => {
    // Create new empty draft
    const resCreate = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({
        customerId: goldCustomer.id,
      }),
    });
    const dataCreate = await resCreate.json();
    submitQuoteId = dataCreate.data.quotation.id;

    // Try submit with 0 items
    const res = await fetch(`${baseUrl}/api/quotations/${submitQuoteId}/submit`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sales1Token}`,
      },
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.match(data.message, /zero items/i);
  });

  await t.test('22. Submit quotation transitions to PENDING_APPROVAL', async () => {
    // Add item first
    await fetch(`${baseUrl}/api/quotations/${submitQuoteId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({
        productId: monitorProduct.id,
        quantity: 2,
      }),
    });

    // Now submit
    const res = await fetch(`${baseUrl}/api/quotations/${submitQuoteId}/submit`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sales1Token}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.data.quotation.status, QuoteStatus.PENDING_APPROVAL);
    assert.strictEqual(typeof data.data.quotation.approvalRequired, 'boolean');
  });

  await t.test('23. Cannot modify items on quotation in PENDING_APPROVAL status (422)', async () => {
    const res = await fetch(`${baseUrl}/api/quotations/${submitQuoteId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({
        productId: monitorProduct.id,
        quantity: 1,
      }),
    });

    assert.strictEqual(res.status, 422);
    const data = await res.json();
    assert.match(data.message, /Only DRAFT quotations can be edited/i);
  });

  await t.test('24. Cancel quotation transitions status to CANCELLED', async () => {
    const res = await fetch(`${baseUrl}/api/quotations/${submitQuoteId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${sales1Token}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.data.quotation.status, QuoteStatus.CANCELLED);
  });

  await t.test('25. Cannot edit CANCELLED quotation (422)', async () => {
    const res = await fetch(`${baseUrl}/api/quotations/${submitQuoteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({
        expiresAt: '2026-12-31',
      }),
    });

    assert.strictEqual(res.status, 422);
  });

  // =============================================================
  // PART 6: AUDIT TRAIL VERIFICATION
  // =============================================================

  await t.test('26. Audit log verifies quotation lifecycle events recorded', async () => {
    const logs = await prisma.auditLog.findMany({
      where: {
        entityType: 'QUOTATION',
        entityId: submitQuoteId,
      },
      orderBy: { createdAt: 'asc' },
    });

    assert.ok(logs.length >= 3, 'Should have multiple audit logs for quotation lifecycle');
    const actions = logs.map((l) => l.action);
    assert.ok(actions.includes('QUOTE_CREATED'));
    assert.ok(actions.includes('QUOTE_ITEM_ADDED'));
    assert.ok(actions.includes('QUOTE_SUBMITTED'));
    assert.ok(actions.includes('QUOTE_CANCELLED'));
  });

  // Close server
  await t.test('Teardown: Close test server & cleanup', async () => {
    if (server) {
      server.close();
    }
    // Clean up temporary inactive customer
    if (inactiveCustomer) {
      await prisma.customer.delete({ where: { id: inactiveCustomer.id } }).catch(() => {});
    }
  });
});
