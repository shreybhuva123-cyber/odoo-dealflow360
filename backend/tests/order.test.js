import test from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { generateAccessToken } from '../src/utils/jwt.js';
import { QuoteStatus, OrderStatus, FulfillmentStatus, CustomerTier, UserRole } from '@prisma/client';

test('Phase 8: Order Management + Fulfillment Engine Comprehensive Test Suite', async (t) => {
  let server;
  const port = 5090;
  const baseUrl = `http://localhost:${port}`;

  let adminToken, sales1Token, sales2Token, managerToken, financeToken, opsToken;
  let adminUser, salesUser1, salesUser2, managerUser, financeUser, opsUser;
  let goldCustomer, silverCustomer;
  let laptopProduct, monitorProduct;

  await t.test('Bootstrap: Test server, users, customers, and products', async () => {
    await new Promise((resolve) => {
      server = app.listen(port, () => resolve());
    });
    assert.ok(server);

    adminUser = await prisma.user.findUnique({ where: { email: 'admin@dealflow360.com' } });
    salesUser1 = await prisma.user.findUnique({ where: { email: 'sales.rep@dealflow360.com' } });
    salesUser2 = await prisma.user.upsert({
      where: { email: 'sales.rep2@dealflow360.com' },
      update: { isActive: true },
      create: {
        name: 'Bob Martinez (Sales Rep 2)',
        email: 'sales.rep2@dealflow360.com',
        passwordHash: salesUser1 ? salesUser1.passwordHash : '$2b$10$dummyhashformockingtestusers1234567890',
        role: UserRole.SALES_REP,
        isActive: true,
      },
    });
    managerUser = await prisma.user.findUnique({ where: { email: 'sales.manager@dealflow360.com' } });
    financeUser = await prisma.user.findUnique({ where: { email: 'finance@dealflow360.com' } });
    opsUser = await prisma.user.findUnique({ where: { email: 'operations@dealflow360.com' } });

    assert.ok(adminUser && salesUser1 && salesUser2 && managerUser && financeUser && opsUser);

    adminToken = generateAccessToken(adminUser);
    sales1Token = generateAccessToken(salesUser1);
    sales2Token = generateAccessToken(salesUser2);
    managerToken = generateAccessToken(managerUser);
    financeToken = generateAccessToken(financeUser);
    opsToken = generateAccessToken(opsUser);

    goldCustomer = await prisma.customer.findFirst({
      where: { customerTier: CustomerTier.GOLD, isActive: true },
    });
    silverCustomer = await prisma.customer.findFirst({
      where: { customerTier: CustomerTier.SILVER, isActive: true },
    });
    assert.ok(goldCustomer && silverCustomer);

    laptopProduct = await prisma.product.findUnique({ where: { sku: 'HW-LAPTOP-15' } });
    monitorProduct = await prisma.product.findFirst({ where: { sku: { not: 'HW-LAPTOP-15' } } });
    assert.ok(laptopProduct);
  });

  // Helper to create test quotation
  async function createTestQuote({ salesRepId, customerId, status = QuoteStatus.APPROVED, withItems = true }) {
    const quoteNumber = `TEST-Q-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    return prisma.quotation.create({
      data: {
        quoteNumber,
        customerId,
        salesRepId,
        status,
        subtotal: withItems ? 2400.0 : 0.0,
        discountAmount: withItems ? 240.0 : 0.0,
        taxAmount: withItems ? 172.8 : 0.0,
        totalAmount: withItems ? 2332.8 : 0.0,
        marginAmount: withItems ? 600.0 : 0.0,
        marginPercentage: withItems ? 25.0 : 0.0,
        items: withItems
          ? {
              create: [
                {
                  productId: laptopProduct.id,
                  quantity: 2,
                  unitPrice: 1200.0,
                  discountPercentage: 10.0,
                  discountAmount: 240.0,
                  taxAmount: 172.8,
                  lineTotal: 2332.8,
                  costPrice: 900.0,
                  marginAmount: 600.0,
                  marginPercentage: 25.0,
                },
              ],
            }
          : undefined,
      },
      include: { items: true },
    });
  }

  // ==========================================
  // PART 28: ORDER CREATION SUITE (1-10)
  // ==========================================

  let createdOrder1;

  await t.test('1. Approved quotation creates order successfully (201 Created)', async () => {
    const quote = await createTestQuote({
      salesRepId: salesUser1.id,
      customerId: goldCustomer.id,
      status: QuoteStatus.APPROVED,
    });

    const res = await fetch(`${baseUrl}/api/quotations/${quote.id}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({ notes: 'Rush delivery requested' }),
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.order);
    assert.strictEqual(body.data.order.quotationId, quote.id);
    assert.strictEqual(body.data.order.customerId, goldCustomer.id);
    assert.strictEqual(body.data.order.status, OrderStatus.CONFIRMED);
    assert.strictEqual(Number(body.data.order.totalAmount), 2332.8);
    assert.strictEqual(body.data.order.notes, 'Rush delivery requested');

    createdOrder1 = body.data.order;
  });

  await t.test('2. Draft quotation cannot create order (400 Bad Request)', async () => {
    const draftQuote = await createTestQuote({
      salesRepId: salesUser1.id,
      customerId: goldCustomer.id,
      status: QuoteStatus.DRAFT,
    });

    const res = await fetch(`${baseUrl}/api/quotations/${draftQuote.id}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({}),
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.message, /DRAFT/);
  });

  await t.test('3. Pending quotation cannot create order (400 Bad Request)', async () => {
    const pendingQuote = await createTestQuote({
      salesRepId: salesUser1.id,
      customerId: goldCustomer.id,
      status: QuoteStatus.PENDING_APPROVAL,
    });

    const res = await fetch(`${baseUrl}/api/quotations/${pendingQuote.id}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({}),
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.message, /PENDING_APPROVAL/);
  });

  await t.test('4. Rejected quotation cannot create order (400 Bad Request)', async () => {
    const rejectedQuote = await createTestQuote({
      salesRepId: salesUser1.id,
      customerId: goldCustomer.id,
      status: QuoteStatus.REJECTED,
    });

    const res = await fetch(`${baseUrl}/api/quotations/${rejectedQuote.id}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({}),
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.message, /Rejected/i);
  });

  await t.test('5. Cancelled quotation cannot create order (400 Bad Request)', async () => {
    const cancelledQuote = await createTestQuote({
      salesRepId: salesUser1.id,
      customerId: goldCustomer.id,
      status: QuoteStatus.CANCELLED,
    });

    const res = await fetch(`${baseUrl}/api/quotations/${cancelledQuote.id}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({}),
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.message, /Cancelled/i);
  });

  await t.test('6. Quotation with no items is rejected (400 Bad Request)', async () => {
    const emptyQuote = await createTestQuote({
      salesRepId: salesUser1.id,
      customerId: goldCustomer.id,
      status: QuoteStatus.APPROVED,
      withItems: false,
    });

    const res = await fetch(`${baseUrl}/api/quotations/${emptyQuote.id}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({}),
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.message, /at least one line item/i);
  });

  await t.test('7. Order number is generated correctly (ORD-YYYY-XXXXXX)', async () => {
    assert.ok(createdOrder1.orderNumber);
    const year = new Date().getFullYear();
    const regex = new RegExp(`^ORD-${year}-\\d{6}$`);
    assert.match(createdOrder1.orderNumber, regex);
  });

  await t.test('8. Order number is unique across multiple orders', async () => {
    const quote2 = await createTestQuote({
      salesRepId: salesUser1.id,
      customerId: silverCustomer.id,
      status: QuoteStatus.APPROVED,
    });

    const res = await fetch(`${baseUrl}/api/quotations/${quote2.id}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({}),
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.notStrictEqual(body.data.order.orderNumber, createdOrder1.orderNumber);
  });

  await t.test('9. Order items copied correctly from quotation', async () => {
    const res = await fetch(`${baseUrl}/api/orders/${createdOrder1.id}/items`, {
      headers: { Authorization: `Bearer ${sales1Token}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.data.items));
    assert.strictEqual(body.data.items.length, 1);
    assert.strictEqual(body.data.items[0].productId, laptopProduct.id);
    assert.strictEqual(body.data.items[0].quantity, 2);
  });

  await t.test('10. Financial snapshot values are preserved accurately', async () => {
    const res = await fetch(`${baseUrl}/api/orders/${createdOrder1.id}`, {
      headers: { Authorization: `Bearer ${sales1Token}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    const item = body.data.order.items[0];

    assert.strictEqual(Number(item.unitPrice), 1200.0);
    assert.strictEqual(Number(item.discountPercentage), 10.0);
    assert.strictEqual(Number(item.discountAmount), 240.0);
    assert.strictEqual(Number(item.taxAmount), 172.8);
    assert.strictEqual(Number(item.lineTotal), 2332.8);
    assert.strictEqual(Number(item.costPrice), 900.0);
    assert.strictEqual(item.productNameSnapshot, laptopProduct.name);
    assert.strictEqual(item.skuSnapshot, laptopProduct.sku);
  });

  // ==========================================
  // PART 28: SECURITY SUITE (11-16)
  // ==========================================

  await t.test('11. Security: Frontend cannot override totalAmount', async () => {
    const quote = await createTestQuote({
      salesRepId: salesUser1.id,
      customerId: goldCustomer.id,
      status: QuoteStatus.APPROVED,
    });

    const res = await fetch(`${baseUrl}/api/quotations/${quote.id}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({ totalAmount: 1.0, subtotal: 1.0 }),
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    // Must remain 2332.8, not overridden to 1.0
    assert.strictEqual(Number(body.data.order.totalAmount), 2332.8);
  });

  await t.test('12. Security: Frontend cannot override unit price', async () => {
    const quote = await createTestQuote({
      salesRepId: salesUser1.id,
      customerId: goldCustomer.id,
      status: QuoteStatus.APPROVED,
    });

    const res = await fetch(`${baseUrl}/api/quotations/${quote.id}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({ unitPrice: 5.0 }),
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(Number(body.data.order.items[0].unitPrice), 1200.0);
  });

  await t.test('13. Security: Frontend cannot override discount', async () => {
    const quote = await createTestQuote({
      salesRepId: salesUser1.id,
      customerId: goldCustomer.id,
      status: QuoteStatus.APPROVED,
    });

    const res = await fetch(`${baseUrl}/api/quotations/${quote.id}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({ discountAmount: 9999.0 }),
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(Number(body.data.order.discountAmount), 240.0);
  });

  await t.test('14. Security: Frontend cannot override order status on creation', async () => {
    const quote = await createTestQuote({
      salesRepId: salesUser1.id,
      customerId: goldCustomer.id,
      status: QuoteStatus.APPROVED,
    });

    const res = await fetch(`${baseUrl}/api/quotations/${quote.id}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({ status: OrderStatus.DELIVERED }),
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.data.order.status, OrderStatus.CONFIRMED);
  });

  await t.test('15. Security: Unauthorized unauthenticated user cannot create order (401)', async () => {
    const quote = await createTestQuote({
      salesRepId: salesUser1.id,
      customerId: goldCustomer.id,
      status: QuoteStatus.APPROVED,
    });

    const res = await fetch(`${baseUrl}/api/quotations/${quote.id}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    assert.strictEqual(res.status, 401);
  });

  await t.test('16. Security: Sales rep cannot create order from another sales rep quotation (403)', async () => {
    const otherRepQuote = await createTestQuote({
      salesRepId: salesUser2.id,
      customerId: goldCustomer.id,
      status: QuoteStatus.APPROVED,
    });

    const res = await fetch(`${baseUrl}/api/quotations/${otherRepQuote.id}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`, // Rep 1 calling Rep 2's quote
      },
      body: JSON.stringify({}),
    });

    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.message, /permission/i);
  });

  // ==========================================
  // PART 28: DUPLICATE PROTECTION SUITE (17-18)
  // ==========================================

  await t.test('17. Duplicate Protection: Same quotation cannot create duplicate order (409 Conflict)', async () => {
    const quote = await createTestQuote({
      salesRepId: salesUser1.id,
      customerId: goldCustomer.id,
      status: QuoteStatus.APPROVED,
    });

    // First conversion: succeeds
    const res1 = await fetch(`${baseUrl}/api/quotations/${quote.id}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({}),
    });
    assert.strictEqual(res1.status, 201);

    // Second conversion: fails with 409 Conflict
    const res2 = await fetch(`${baseUrl}/api/quotations/${quote.id}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({}),
    });
    assert.strictEqual(res2.status, 409);
    const body2 = await res2.json();
    assert.strictEqual(body2.success, false);
    assert.match(body2.message, /already been created/i);
  });

  await t.test('18. Duplicate Protection: Concurrent order creation handled safely', async () => {
    const quote = await createTestQuote({
      salesRepId: salesUser1.id,
      customerId: goldCustomer.id,
      status: QuoteStatus.APPROVED,
    });

    // Run parallel conversion requests
    const [resA, resB] = await Promise.all([
      fetch(`${baseUrl}/api/quotations/${quote.id}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sales1Token}` },
        body: JSON.stringify({}),
      }),
      fetch(`${baseUrl}/api/quotations/${quote.id}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sales1Token}` },
        body: JSON.stringify({}),
      }),
    ]);

    const statuses = [resA.status, resB.status];
    assert.ok(statuses.includes(201), 'One request must succeed with 201');
    assert.ok(statuses.includes(409) || statuses.includes(400), 'Competing request must be rejected');

    const ordersForQuote = await prisma.order.findMany({ where: { quotationId: quote.id } });
    assert.strictEqual(ordersForQuote.length, 1, 'Exactly one order must exist for quotation');
  });

  // ==========================================
  // PART 28: ORDER STATUS SUITE (19-22)
  // ==========================================

  let stateOrder;

  await t.test('19. Order Status: Valid status transition works (CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED)', async () => {
    const quote = await createTestQuote({
      salesRepId: salesUser1.id,
      customerId: goldCustomer.id,
      status: QuoteStatus.APPROVED,
    });

    const createRes = await fetch(`${baseUrl}/api/quotations/${quote.id}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sales1Token}` },
      body: JSON.stringify({}),
    });
    const createBody = await createRes.json();
    stateOrder = createBody.data.order;

    // CONFIRMED -> PROCESSING
    const resProcessing = await fetch(`${baseUrl}/api/orders/${stateOrder.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${opsToken}` },
      body: JSON.stringify({ status: OrderStatus.PROCESSING }),
    });
    assert.strictEqual(resProcessing.status, 200);
    const bodyP = await resProcessing.json();
    assert.strictEqual(bodyP.data.order.status, OrderStatus.PROCESSING);

    // PROCESSING -> SHIPPED
    const resShipped = await fetch(`${baseUrl}/api/orders/${stateOrder.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${opsToken}` },
      body: JSON.stringify({ status: OrderStatus.SHIPPED }),
    });
    assert.strictEqual(resShipped.status, 200);
    const bodyS = await resShipped.json();
    assert.strictEqual(bodyS.data.order.status, OrderStatus.SHIPPED);

    // SHIPPED -> DELIVERED
    const resDelivered = await fetch(`${baseUrl}/api/orders/${stateOrder.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${opsToken}` },
      body: JSON.stringify({ status: OrderStatus.DELIVERED }),
    });
    assert.strictEqual(resDelivered.status, 200);
    const bodyD = await resDelivered.json();
    assert.strictEqual(bodyD.data.order.status, OrderStatus.DELIVERED);
  });

  await t.test('20. Order Status: Invalid status transition rejected (400 Bad Request)', async () => {
    const quote = await createTestQuote({
      salesRepId: salesUser1.id,
      customerId: goldCustomer.id,
      status: QuoteStatus.APPROVED,
    });

    const createRes = await fetch(`${baseUrl}/api/quotations/${quote.id}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sales1Token}` },
      body: JSON.stringify({}),
    });
    const order = (await createRes.json()).data.order;

    // Direct CONFIRMED -> DELIVERED is invalid
    const res = await fetch(`${baseUrl}/api/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${opsToken}` },
      body: JSON.stringify({ status: OrderStatus.DELIVERED }),
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.match(body.message, /Invalid order status transition/i);
  });

  await t.test('21. Order Status: Delivered order cannot return to processing (400 Bad Request)', async () => {
    const res = await fetch(`${baseUrl}/api/orders/${stateOrder.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${opsToken}` },
      body: JSON.stringify({ status: OrderStatus.PROCESSING }),
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.match(body.message, /Delivered orders cannot transition/i);
  });

  await t.test('22. Order Status: Cancelled order cannot resume or transition (400 Bad Request)', async () => {
    const quote = await createTestQuote({
      salesRepId: salesUser1.id,
      customerId: goldCustomer.id,
      status: QuoteStatus.APPROVED,
    });

    const createRes = await fetch(`${baseUrl}/api/quotations/${quote.id}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sales1Token}` },
      body: JSON.stringify({}),
    });
    const order = (await createRes.json()).data.order;

    // Cancel the order
    await fetch(`${baseUrl}/api/orders/${order.id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
      body: JSON.stringify({ reason: 'Customer changed mind' }),
    });

    // Attempt to transition cancelled order to PROCESSING
    const res = await fetch(`${baseUrl}/api/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${opsToken}` },
      body: JSON.stringify({ status: OrderStatus.PROCESSING }),
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.match(body.message, /Cancelled orders cannot be reopened/i);
  });

  // ==========================================
  // PART 28: FULFILLMENT SUITE (23-28)
  // ==========================================

  let fulfillmentOrder, testFulfillment;

  await t.test('23. Fulfillment: Fulfillment creation works (201 Created)', async () => {
    const quote = await createTestQuote({
      salesRepId: salesUser1.id,
      customerId: goldCustomer.id,
      status: QuoteStatus.APPROVED,
    });

    const createRes = await fetch(`${baseUrl}/api/quotations/${quote.id}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sales1Token}` },
      body: JSON.stringify({}),
    });
    fulfillmentOrder = (await createRes.json()).data.order;

    const res = await fetch(`${baseUrl}/api/orders/${fulfillmentOrder.id}/fulfillment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${opsToken}` },
      body: JSON.stringify({
        estimatedShipmentCount: 2,
        estimatedShippingCost: 45.0,
        notes: 'Warehouse split delivery',
      }),
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.fulfillment.orderId, fulfillmentOrder.id);
    assert.strictEqual(body.data.fulfillment.status, FulfillmentStatus.PENDING);
    testFulfillment = body.data.fulfillment;
  });

  await t.test('24. Fulfillment: Unauthorized user (sales rep) cannot update fulfillment (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/fulfillments/${testFulfillment.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sales1Token}` },
      body: JSON.stringify({ status: FulfillmentStatus.PROCESSING }),
    });

    assert.strictEqual(res.status, 403);
  });

  await t.test('25. Fulfillment: Valid fulfillment transition works (PENDING -> PROCESSING)', async () => {
    const res = await fetch(`${baseUrl}/api/fulfillments/${testFulfillment.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${opsToken}` },
      body: JSON.stringify({ status: FulfillmentStatus.PROCESSING, notes: 'Package being prepped' }),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.fulfillment.status, FulfillmentStatus.PROCESSING);
  });

  await t.test('26. Fulfillment: Invalid fulfillment transition rejected (400 Bad Request)', async () => {
    // Cannot jump direct from PENDING/PROCESSING to DELIVERED without SHIPPED
    const newQuote = await createTestQuote({
      salesRepId: salesUser1.id,
      customerId: goldCustomer.id,
      status: QuoteStatus.APPROVED,
    });
    const oRes = await fetch(`${baseUrl}/api/quotations/${newQuote.id}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sales1Token}` },
      body: JSON.stringify({}),
    });
    const orderData = (await oRes.json()).data.order;
    const initialFulfillment = orderData.fulfillments[0];

    const res = await fetch(`${baseUrl}/api/fulfillments/${initialFulfillment.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${opsToken}` },
      body: JSON.stringify({ status: FulfillmentStatus.DELIVERED }),
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.match(body.message, /Invalid fulfillment status transition/i);
  });

  await t.test('27. Fulfillment: Shipping updates order status correctly to SHIPPED', async () => {
    // Add tracking number first
    await fetch(`${baseUrl}/api/fulfillments/${testFulfillment.id}/tracking`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${opsToken}` },
      body: JSON.stringify({ trackingNumber: 'TRK-987654321', carrier: 'FedEx Express' }),
    });

    // Transition fulfillment to SHIPPED
    const res = await fetch(`${baseUrl}/api/fulfillments/${testFulfillment.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${opsToken}` },
      body: JSON.stringify({ status: FulfillmentStatus.SHIPPED }),
    });

    assert.strictEqual(res.status, 200);

    // Verify linked order is automatically marked SHIPPED
    const orderRes = await fetch(`${baseUrl}/api/orders/${fulfillmentOrder.id}`, {
      headers: { Authorization: `Bearer ${opsToken}` },
    });
    const orderBody = await orderRes.json();
    assert.strictEqual(orderBody.data.order.status, OrderStatus.SHIPPED);
  });

  await t.test('28. Fulfillment: Delivery updates order status correctly to DELIVERED', async () => {
    // Transition fulfillment to DELIVERED
    const res = await fetch(`${baseUrl}/api/fulfillments/${testFulfillment.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${opsToken}` },
      body: JSON.stringify({ status: FulfillmentStatus.DELIVERED }),
    });

    assert.strictEqual(res.status, 200);

    // Verify linked order is automatically marked DELIVERED
    const orderRes = await fetch(`${baseUrl}/api/orders/${fulfillmentOrder.id}`, {
      headers: { Authorization: `Bearer ${opsToken}` },
    });
    const orderBody = await orderRes.json();
    assert.strictEqual(orderBody.data.order.status, OrderStatus.DELIVERED);
  });

  // ==========================================
  // PART 28: CANCELLATION SUITE (29-31)
  // ==========================================

  let cancelledOrder;

  await t.test('29. Cancellation: Valid cancellation works and sets status to CANCELLED', async () => {
    const quote = await createTestQuote({
      salesRepId: salesUser1.id,
      customerId: goldCustomer.id,
      status: QuoteStatus.APPROVED,
    });

    const oRes = await fetch(`${baseUrl}/api/quotations/${quote.id}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sales1Token}` },
      body: JSON.stringify({}),
    });
    const order = (await oRes.json()).data.order;

    const res = await fetch(`${baseUrl}/api/orders/${order.id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
      body: JSON.stringify({ reason: 'Commercial dispute regarding payment terms' }),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.order.status, OrderStatus.CANCELLED);
    cancelledOrder = body.data.order;

    // Verify associated fulfillments are also marked CANCELLED
    const fulfillments = await prisma.fulfillment.findMany({ where: { orderId: order.id } });
    assert.strictEqual(fulfillments[0].status, FulfillmentStatus.CANCELLED);
  });

  await t.test('30. Cancellation: Invalid cancellation rejected (shipped/delivered cannot be cancelled)', async () => {
    // Try to cancel the previously delivered order
    const res = await fetch(`${baseUrl}/api/orders/${fulfillmentOrder.id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
      body: JSON.stringify({ reason: 'Try to cancel delivered order' }),
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.match(body.message, /Delivered orders cannot be cancelled/i);
  });

  await t.test('31. Cancellation: Cancellation reason recorded in order notes and audit history', async () => {
    assert.match(cancelledOrder.notes, /Commercial dispute/);

    const historyRes = await fetch(`${baseUrl}/api/orders/${cancelledOrder.id}/history`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.strictEqual(historyRes.status, 200);
    const historyBody = await historyRes.json();
    const cancelLog = historyBody.data.history.find((l) => l.action === 'ORDER_CANCELLED');
    assert.ok(cancelLog);
    assert.strictEqual(cancelLog.reason, 'Commercial dispute regarding payment terms');
  });

  // ==========================================
  // PART 28: ACCESS, PAGINATION & SEARCH (32-35)
  // ==========================================

  await t.test('32. Access: Customer and order access rules enforced (Sales Rep scoping)', async () => {
    // Rep 2 should not be able to view Rep 1's order details
    const res = await fetch(`${baseUrl}/api/orders/${createdOrder1.id}`, {
      headers: { Authorization: `Bearer ${sales2Token}` },
    });

    assert.strictEqual(res.status, 403);
  });

  await t.test('33. Access: Order list pagination works (page, limit, total)', async () => {
    const res = await fetch(`${baseUrl}/api/orders?page=1&limit=2`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.orders.length, 2);
    assert.ok(body.data.pagination.total >= 2);
    assert.strictEqual(body.data.pagination.page, 1);
    assert.strictEqual(body.data.pagination.limit, 2);
  });

  await t.test('34. Access: Filtering by status works', async () => {
    const res = await fetch(`${baseUrl}/api/orders?status=CANCELLED`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.data.orders.length > 0);
    for (const o of body.data.orders) {
      assert.strictEqual(o.status, OrderStatus.CANCELLED);
    }
  });

  await t.test('35. Access: Search by order number works', async () => {
    const res = await fetch(`${baseUrl}/api/orders?search=${createdOrder1.orderNumber}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.data.orders.length >= 1);
    assert.strictEqual(body.data.orders[0].orderNumber, createdOrder1.orderNumber);
  });

  // Operator assignment check
  await t.test('36. Fulfillment: Operator assignment works with OPERATIONS role check', async () => {
    const assignRes = await fetch(`${baseUrl}/api/fulfillments/${testFulfillment.id}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ operationsUserId: opsUser.id }),
    });

    assert.strictEqual(assignRes.status, 200);
    const body = await assignRes.json();
    assert.strictEqual(body.data.fulfillment.assignedToId, opsUser.id);
  });

  // Customer orders check
  await t.test('37. Customer Orders: GET /api/customers/:customerId/orders returns customer orders', async () => {
    const res = await fetch(`${baseUrl}/api/customers/${goldCustomer.id}/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.data.orders));
    assert.ok(body.data.orders.length > 0);
  });

  await t.test('Teardown: Close test server & cleanup test records', async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }

    try {
      const testQuotes = await prisma.quotation.findMany({
        where: { quoteNumber: { startsWith: 'TEST-Q-' } },
        select: { id: true },
      });
      const testQuoteIds = testQuotes.map((q) => q.id);

      if (testQuoteIds.length > 0) {
        const testOrders = await prisma.order.findMany({
          where: { quotationId: { in: testQuoteIds } },
          select: { id: true },
        });
        const testOrderIds = testOrders.map((o) => o.id);

        if (testOrderIds.length > 0) {
          await prisma.fulfillment.deleteMany({ where: { orderId: { in: testOrderIds } } });
          await prisma.orderItem.deleteMany({ where: { orderId: { in: testOrderIds } } });
          await prisma.order.deleteMany({ where: { id: { in: testOrderIds } } });
        }

        await prisma.quotationItem.deleteMany({ where: { quotationId: { in: testQuoteIds } } });
        await prisma.quotation.deleteMany({ where: { id: { in: testQuoteIds } } });
      }
    } catch (e) {
      // ignore
    }
  });
});
