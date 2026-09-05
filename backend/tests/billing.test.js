import test from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { generateAccessToken } from '../src/utils/jwt.js';
import { QuoteStatus, OrderStatus, InvoiceStatus, PaymentStatus, CustomerTier, UserRole } from '@prisma/client';
import { invoiceService } from '../src/services/invoiceService.js';
import { paymentService } from '../src/services/paymentService.js';

test('Phase 9: Billing & Payment Engine Comprehensive Test Suite', async (t) => {
  let server;
  const port = 5100;
  const baseUrl = `http://localhost:${port}`;

  let adminToken, sales1Token, sales2Token, managerToken, financeToken, opsToken;
  let adminUser, salesUser1, salesUser2, managerUser, financeUser, opsUser;
  let goldCustomer, silverCustomer;
  let laptopProduct, serviceProduct;

  await t.test('Bootstrap: Test server, users, customers, and products', async () => {
    await new Promise((resolve) => {
      server = app.listen(port, () => resolve());
    });
    assert.ok(server);

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

    goldCustomer = await prisma.customer.findFirst({
      where: { customerTier: CustomerTier.GOLD, isActive: true },
    });
    silverCustomer = await prisma.customer.findFirst({
      where: { customerTier: CustomerTier.SILVER, isActive: true },
    });
    assert.ok(goldCustomer && silverCustomer);

    laptopProduct = await prisma.product.findUnique({ where: { sku: 'HW-LAPTOP-15' } });
    serviceProduct = await prisma.product.findFirst({ where: { sku: { not: 'HW-LAPTOP-15' } } });
    assert.ok(laptopProduct);
  });

  // Helper to create a test order with line items
  async function createTestOrder({ customerId, salesRepId, status = OrderStatus.CONFIRMED, cancelled = false }) {
    const orderNumber = `TEST-ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    return await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        salesRepId,
        status: cancelled ? OrderStatus.CANCELLED : status,
        subtotal: 3000.0,
        discountAmount: 300.0,
        taxAmount: 216.0,
        totalAmount: 2916.0,
        items: {
          create: [
            {
              productId: laptopProduct.id,
              productNameSnapshot: 'Enterprise Laptop Pro 15',
              skuSnapshot: 'HW-LAPTOP-15',
              quantity: 2,
              unitPrice: 1500.0,
              discountPercentage: 10.0,
              discountAmount: 300.0,
              taxAmount: 216.0,
              lineTotal: 2916.0,
              costPrice: 1000.0,
            },
          ],
        },
      },
      include: { items: true },
    });
  }

  let activeOrder;
  let activeInvoice;
  let partialPayment;

  // 1. Create invoice from valid order
  await t.test('1. Create invoice from valid order', async () => {
    activeOrder = await createTestOrder({ customerId: goldCustomer.id, salesRepId: salesUser1.id });

    const res = await fetch(`${baseUrl}/api/orders/${activeOrder.id}/create-invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({ notes: 'First invoice for active order' }),
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data);
    activeInvoice = body.data;

    assert.strictEqual(activeInvoice.orderId, activeOrder.id);
    assert.strictEqual(activeInvoice.customerId, goldCustomer.id);
    assert.strictEqual(activeInvoice.status, InvoiceStatus.DRAFT);
    assert.strictEqual(Number(activeInvoice.subtotal), 3000.0);
    assert.strictEqual(Number(activeInvoice.discountAmount), 300.0);
    assert.strictEqual(Number(activeInvoice.taxAmount), 216.0);
    assert.strictEqual(Number(activeInvoice.totalAmount), 2916.0);
    assert.strictEqual(Number(activeInvoice.paidAmount), 0.0);
    assert.strictEqual(Number(activeInvoice.outstandingAmount), 2916.0);
    assert.strictEqual(activeInvoice.items.length, 1);
    assert.strictEqual(activeInvoice.items[0].productNameSnapshot, 'Enterprise Laptop Pro 15');
    assert.strictEqual(activeInvoice.items[0].skuSnapshot, 'HW-LAPTOP-15');
  });

  // 2. Reject invoice creation from cancelled order
  await t.test('2. Reject invoice creation from cancelled order', async () => {
    const cancelledOrder = await createTestOrder({
      customerId: goldCustomer.id,
      salesRepId: salesUser1.id,
      cancelled: true,
    });

    const res = await fetch(`${baseUrl}/api/orders/${cancelledOrder.id}/create-invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({}),
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.message, /not eligible for invoicing/i);
  });

  // 3. Reject duplicate invoice creation
  await t.test('3. Reject duplicate invoice creation', async () => {
    const res = await fetch(`${baseUrl}/api/orders/${activeOrder.id}/create-invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({}),
    });

    assert.strictEqual(res.status, 409);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.message, /Invoice already exists/i);
  });

  // 4. Generate unique invoice numbers
  await t.test('4. Generate unique invoice numbers', async () => {
    const num1 = await invoiceService.generateInvoiceNumber();
    const tempInv = await prisma.invoice.create({
      data: {
        invoiceNumber: num1,
        customerId: goldCustomer.id,
        subtotal: 100.0,
        totalAmount: 100.0,
        dueDate: new Date(),
      },
    });

    const num2 = await invoiceService.generateInvoiceNumber();
    assert.ok(num1.startsWith('INV-'));
    assert.ok(num2.startsWith('INV-'));
    assert.notStrictEqual(num1, num2);

    await prisma.invoice.delete({ where: { id: tempInv.id } });
  });

  // 5. Issue invoice
  await t.test('5. Issue invoice (DRAFT -> ISSUED)', async () => {
    const res = await fetch(`${baseUrl}/api/invoices/${activeInvoice.id}/issue`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${financeToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.status, InvoiceStatus.ISSUED);
    assert.ok(body.data.invoiceDate);
    activeInvoice = body.data;
  });

  // 6. Reject issuing empty invoice
  await t.test('6. Reject issuing empty invoice', async () => {
    const emptyInvoiceNum = `INV-TEST-EMPTY-${Date.now()}`;
    const emptyInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber: emptyInvoiceNum,
        customerId: goldCustomer.id,
        subtotal: 0,
        totalAmount: 0,
        status: InvoiceStatus.DRAFT,
        dueDate: new Date(Date.now() + 86400000),
      },
    });

    const res = await fetch(`${baseUrl}/api/invoices/${emptyInvoice.id}/issue`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${financeToken}`,
      },
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.message, /no items/i);
  });

  // 7-10. Invoice calculation functions
  await t.test('7. Calculate subtotal correctly', () => {
    const items = [
      { quantity: 2, unitPrice: 500 },
      { quantity: 3, unitPrice: 200 },
    ];
    const subtotal = invoiceService.calculateInvoiceSubtotal(items);
    assert.strictEqual(subtotal, 1600.0);
  });

  await t.test('8. Calculate discount correctly', () => {
    const items = [
      { discountAmount: 100 },
      { discountAmount: 50.5 },
    ];
    const discount = invoiceService.calculateInvoiceDiscount(items);
    assert.strictEqual(discount, 150.5);
  });

  await t.test('9. Calculate tax correctly', () => {
    const items = [
      { taxAmount: 45.25 },
      { taxAmount: 30.75 },
    ];
    const tax = invoiceService.calculateInvoiceTax(items);
    assert.strictEqual(tax, 76.0);
  });

  await t.test('10. Calculate total correctly (subtotal - discount + tax)', () => {
    const total = invoiceService.calculateInvoiceTotal(1600, 150.5, 76.0);
    assert.strictEqual(total, 1525.5);
  });

  // 11. Record valid payment
  await t.test('11. Record valid payment', async () => {
    const paymentData = {
      amount: 1000.0,
      paymentMethod: 'BANK_TRANSFER',
      transactionReference: `TXN-${Date.now()}-1`,
      notes: 'Initial partial payment',
    };

    const res = await fetch(`${baseUrl}/api/invoices/${activeInvoice.id}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify(paymentData),
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.payment);
    assert.ok(body.data.invoice);

    partialPayment = body.data.payment;
    assert.strictEqual(Number(partialPayment.amount), 1000.0);
    assert.strictEqual(partialPayment.status, PaymentStatus.COMPLETED);
  });

  // 12. Reject zero payment
  await t.test('12. Reject zero payment', async () => {
    const res = await fetch(`${baseUrl}/api/invoices/${activeInvoice.id}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({ amount: 0, paymentMethod: 'CASH' }),
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  // 13. Reject negative payment
  await t.test('13. Reject negative payment', async () => {
    const res = await fetch(`${baseUrl}/api/invoices/${activeInvoice.id}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({ amount: -250, paymentMethod: 'CASH' }),
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  // 14. Reject payment greater than outstanding amount
  await t.test('14. Reject payment greater than outstanding amount', async () => {
    const res = await fetch(`${baseUrl}/api/invoices/${activeInvoice.id}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({ amount: 50000.0, paymentMethod: 'BANK_TRANSFER' }),
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.message, /exceeds outstanding amount/i);
  });

  // 15. Correctly mark invoice PARTIALLY_PAID
  await t.test('15. Correctly mark invoice PARTIALLY_PAID', async () => {
    const res = await fetch(`${baseUrl}/api/invoices/${activeInvoice.id}`, {
      headers: {
        Authorization: `Bearer ${financeToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.status, InvoiceStatus.PARTIALLY_PAID);
    assert.strictEqual(Number(body.data.paidAmount), 1000.0);
    assert.strictEqual(Number(body.data.outstandingAmount), 1916.0);
  });

  let finalPayment;

  // 16. Correctly mark invoice PAID
  await t.test('16. Correctly mark invoice PAID', async () => {
    const remainingAmount = 1916.0;
    const res = await fetch(`${baseUrl}/api/invoices/${activeInvoice.id}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({
        amount: remainingAmount,
        paymentMethod: 'ACH_TRANSFER',
        transactionReference: `TXN-${Date.now()}-2`,
        notes: 'Final settlement',
      }),
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    finalPayment = body.data.payment;

    assert.strictEqual(body.data.invoice.status, InvoiceStatus.PAID);
    assert.strictEqual(Number(body.data.invoice.paidAmount), 2916.0);
    assert.strictEqual(Number(body.data.invoice.outstandingAmount), 0.0);
    assert.ok(body.data.invoice.paidAt);
  });

  // 17. Correctly mark invoice OVERDUE
  await t.test('17. Correctly mark invoice OVERDUE', async () => {
    const overdueOrder = await createTestOrder({ customerId: goldCustomer.id, salesRepId: salesUser1.id });
    const overdueInvoiceNum = `INV-TEST-OVD-${Date.now()}`;

    // Create an invoice with due date in the past
    const pastDueDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const inv = await prisma.invoice.create({
      data: {
        invoiceNumber: overdueInvoiceNum,
        orderId: overdueOrder.id,
        customerId: goldCustomer.id,
        subtotal: 1000.0,
        totalAmount: 1000.0,
        paidAmount: 0.0,
        outstandingAmount: 1000.0,
        status: InvoiceStatus.ISSUED,
        dueDate: pastDueDate,
      },
    });

    // Run overdue updater API
    const res = await fetch(`${baseUrl}/api/invoices/update-overdue`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${financeToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.updatedCount >= 1);

    const checked = await prisma.invoice.findUnique({ where: { id: inv.id } });
    assert.strictEqual(checked.status, InvoiceStatus.OVERDUE);
  });

  // 18. Cancel payment and recalculate balance
  await t.test('18. Cancel payment and recalculate balance', async () => {
    const res = await fetch(`${baseUrl}/api/payments/${finalPayment.id}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({ reason: 'Customer requested charge reversal' }),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.payment.status, PaymentStatus.CANCELLED);
    assert.strictEqual(body.data.invoice.status, InvoiceStatus.PARTIALLY_PAID);
    assert.strictEqual(Number(body.data.invoice.paidAmount), 1000.0);
    assert.strictEqual(Number(body.data.invoice.outstandingAmount), 1916.0);
  });

  // 19. Prevent unauthorized payment creation (SALES_REP 403)
  await t.test('19. Prevent unauthorized payment creation', async () => {
    const res = await fetch(`${baseUrl}/api/invoices/${activeInvoice.id}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({ amount: 100, paymentMethod: 'CASH' }),
    });

    assert.strictEqual(res.status, 403);
  });

  // 20. Prevent unauthorized invoice access (SALES_REP cannot view another rep's invoice)
  await t.test('20. Prevent unauthorized invoice access', async () => {
    if (salesUser2 && salesUser2.id !== salesUser1.id) {
      const res = await fetch(`${baseUrl}/api/invoices/${activeInvoice.id}`, {
        headers: {
          Authorization: `Bearer ${sales2Token}`,
        },
      });

      assert.strictEqual(res.status, 403);
      const body = await res.json();
      assert.strictEqual(body.success, false);
      assert.match(body.message, /not authorized/i);
    } else {
      // If only 1 sales rep exists, test that unauthenticated user is 401
      const res = await fetch(`${baseUrl}/api/invoices/${activeInvoice.id}`);
      assert.strictEqual(res.status, 401);
    }
  });

  // 21. Prevent unauthorized invoice modification
  await t.test('21. Prevent unauthorized invoice modification (issued/paid invoice)', async () => {
    const res = await fetch(`${baseUrl}/api/invoices/${activeInvoice.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({ notes: 'Trying to modify issued invoice' }),
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.message, /cannot be modified after issuance/i);
  });

  // 22. Test concurrent payment safety
  await t.test('22. Test concurrent payment safety', async () => {
    const testOrder = await createTestOrder({ customerId: goldCustomer.id, salesRepId: salesUser1.id });
    const inv = await invoiceService.createInvoiceFromOrder(testOrder.id, financeUser.id);
    await invoiceService.issueInvoice(inv.id, financeUser.id);

    // Initial outstanding is 2916.0
    // Try sending two 2000.0 payments concurrently. Total is 4000 > 2916.
    const [p1, p2] = await Promise.allSettled([
      paymentService.recordPayment(inv.id, financeUser.id, {
        amount: 2000.0,
        paymentMethod: 'CARD',
        transactionReference: `TXN-CONC-${Date.now()}-1`,
      }),
      paymentService.recordPayment(inv.id, financeUser.id, {
        amount: 2000.0,
        paymentMethod: 'CARD',
        transactionReference: `TXN-CONC-${Date.now()}-2`,
      }),
    ]);

    // One must succeed, and one must be rejected for exceeding outstanding balance
    const fulfilled = [p1, p2].filter((p) => p.status === 'fulfilled');
    const rejected = [p1, p2].filter((p) => p.status === 'rejected');

    assert.strictEqual(fulfilled.length, 1);
    assert.strictEqual(rejected.length, 1);

    const checked = await prisma.invoice.findUnique({ where: { id: inv.id } });
    assert.ok(Number(checked.outstandingAmount) >= 0);
    assert.strictEqual(Number(checked.paidAmount), 2000.0);
    assert.strictEqual(Number(checked.outstandingAmount), 916.0);
  });

  // 23. Test Decimal precision
  await t.test('23. Test Decimal precision without floating point errors', () => {
    const item1 = invoiceService.calculateInvoiceItem({
      quantity: 3,
      unitPrice: 19.99,
      discountPercentage: 12.5,
      taxAmount: 4.87,
    });

    assert.strictEqual(item1.grossAmount, 59.97);
    assert.strictEqual(item1.discountAmount, 7.5);
    assert.strictEqual(item1.lineTotal, 57.34);

    const outstanding = invoiceService.calculateInvoiceOutstandingAmount(57.34, 57.34);
    assert.strictEqual(outstanding, 0);
  });

  // 24. Test invoice cancellation
  await t.test('24. Test invoice cancellation', async () => {
    const testOrder = await createTestOrder({ customerId: goldCustomer.id, salesRepId: salesUser1.id });
    const inv = await invoiceService.createInvoiceFromOrder(testOrder.id, financeUser.id);

    const res = await fetch(`${baseUrl}/api/invoices/${inv.id}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({ reason: 'Duplicate order entered by mistake' }),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.status, InvoiceStatus.CANCELLED);

    // Cannot issue or pay cancelled invoice
    const issueRes = await fetch(`${baseUrl}/api/invoices/${inv.id}/issue`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${financeToken}` },
    });
    assert.strictEqual(issueRes.status, 400);
  });

  // 25. Test audit log creation
  await t.test('25. Test audit log creation', async () => {
    const res = await fetch(`${baseUrl}/api/invoices/${activeInvoice.id}/history`, {
      headers: {
        Authorization: `Bearer ${financeToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 2);

    const actions = body.data.map((l) => l.action);
    assert.ok(actions.includes('CREATE') || actions.includes('ISSUE') || actions.includes('PAYMENT_RECEIVED'));
  });

  // 26. End-to-end integration flow
  await t.test('26. End-to-end integration flow (Quotation -> Order -> Invoice -> Payment -> Paid)', async () => {
    // 1. Create quote
    const quote = await prisma.quotation.create({
      data: {
        quoteNumber: `TEST-E2E-Q-${Date.now()}`,
        customerId: silverCustomer.id,
        salesRepId: salesUser1.id,
        status: QuoteStatus.APPROVED,
        subtotal: 2000.0,
        totalAmount: 2000.0,
        items: {
          create: [
            {
              productId: laptopProduct.id,
              quantity: 1,
              unitPrice: 2000.0,
              lineTotal: 2000.0,
              costPrice: 1500.0,
              marginAmount: 500.0,
              marginPercentage: 25.0,
            },
          ],
        },
      },
    });

    // 2. Create order from quote
    const order = await prisma.order.create({
      data: {
        orderNumber: `TEST-E2E-ORD-${Date.now()}`,
        quotationId: quote.id,
        customerId: silverCustomer.id,
        salesRepId: salesUser1.id,
        status: OrderStatus.CONFIRMED,
        subtotal: 2000.0,
        totalAmount: 2000.0,
        items: {
          create: [
            {
              productId: laptopProduct.id,
              productNameSnapshot: 'Enterprise Laptop Pro 15',
              skuSnapshot: 'HW-LAPTOP-15',
              quantity: 1,
              unitPrice: 2000.0,
              lineTotal: 2000.0,
              costPrice: 1500.0,
            },
          ],
        },
      },
      include: { items: true },
    });

    // 3. Create invoice from order
    const invoiceRes = await fetch(`${baseUrl}/api/orders/${order.id}/create-invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({ notes: 'E2E Full Order Invoicing' }),
    });
    assert.strictEqual(invoiceRes.status, 201);
    const invoice = (await invoiceRes.json()).data;
    assert.strictEqual(invoice.status, InvoiceStatus.DRAFT);

    // 4. Issue invoice
    const issueRes = await fetch(`${baseUrl}/api/invoices/${invoice.id}/issue`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${financeToken}` },
    });
    assert.strictEqual(issueRes.status, 200);

    // 5. Partial payment 1
    const p1Res = await fetch(`${baseUrl}/api/invoices/${invoice.id}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({ amount: 800.0, paymentMethod: 'UPI' }),
    });
    assert.strictEqual(p1Res.status, 201);
    const p1Data = await p1Res.json();
    assert.strictEqual(p1Data.data.invoice.status, InvoiceStatus.PARTIALLY_PAID);

    // 6. Remaining payment 2
    const p2Res = await fetch(`${baseUrl}/api/invoices/${invoice.id}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({ amount: 1200.0, paymentMethod: 'BANK_TRANSFER' }),
    });
    assert.strictEqual(p2Res.status, 201);
    const p2Data = await p2Res.json();
    assert.strictEqual(p2Data.data.invoice.status, InvoiceStatus.PAID);
    assert.strictEqual(Number(p2Data.data.invoice.outstandingAmount), 0.0);
  });

  // 27. Customer Billing Summary API
  await t.test('27. Customer Billing Summary API', async () => {
    const res = await fetch(`${baseUrl}/api/customers/${goldCustomer.id}/billing-summary`, {
      headers: {
        Authorization: `Bearer ${financeToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.customer);
    assert.ok(body.data.totalInvoices >= 1);
    assert.ok(typeof body.data.totalInvoicedAmount === 'number');
    assert.ok(typeof body.data.totalPaidAmount === 'number');
    assert.ok(typeof body.data.totalOutstandingAmount === 'number');
  });

  // 28. Invoice Payment Summary API
  await t.test('28. Invoice Payment Summary API', async () => {
    const res = await fetch(`${baseUrl}/api/invoices/${activeInvoice.id}/payment-summary`, {
      headers: {
        Authorization: `Bearer ${financeToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.invoiceId, activeInvoice.id);
    assert.ok(body.data.paymentCount >= 1);
    assert.ok(Array.isArray(body.data.paymentHistory));
  });

  await t.test('Teardown: Close test server & cleanup', async () => {
    await new Promise((resolve) => server.close(() => resolve()));
    assert.ok(true);
  });
});
