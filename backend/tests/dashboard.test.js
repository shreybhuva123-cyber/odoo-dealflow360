import test from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { generateAccessToken } from '../src/utils/jwt.js';
import { OrderStatus, QuoteStatus, InvoiceStatus, PaymentStatus } from '@prisma/client';

test('Phase 10: Dashboard & Analytics Engine Comprehensive Test Suite', async (t) => {
  let server;
  const port = 5110;
  const baseUrl = `http://localhost:${port}`;

  let adminToken, sales1Token, sales2Token, managerToken, financeToken, opsToken, customerToken;
  let adminUser, salesUser1, salesUser2, managerUser, financeUser, opsUser;
  let testCustomer1, testCustomer2;
  let testProduct1, testProduct2;
  let rep1Order, rep2Order;
  let rep1Quote, rep2Quote;
  let testInvoice;

  await t.test('Bootstrap: Test server, users, seed entities', async () => {
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
    const deactivatedUser = await prisma.user.upsert({
      where: { email: 'deactivated-dashboard-test@dealflow360.com' },
      update: { isActive: false },
      create: {
        name: 'Deactivated User',
        email: 'deactivated-dashboard-test@dealflow360.com',
        passwordHash: '$2b$10$dummyhashformockingtestusers1234567890',
        role: 'SALES_REP',
        isActive: false,
      },
    });
    customerToken = generateAccessToken(deactivatedUser);

    testCustomer1 = await prisma.customer.findFirst({ where: { isActive: true } });
    testCustomer2 = await prisma.customer.findFirst({
      where: { isActive: true, id: { not: testCustomer1.id } },
    }) || testCustomer1;

    testProduct1 = await prisma.product.findFirst({ where: { isActive: true } });
    testProduct2 = await prisma.product.findFirst({
      where: { isActive: true, id: { not: testProduct1.id } },
    }) || testProduct1;

    // Seed dedicated quotes and orders for rep isolation verification
    rep1Quote = await prisma.quotation.create({
      data: {
        quoteNumber: `DASH-Q1-${Date.now()}`,
        customerId: testCustomer1.id,
        salesRepId: salesUser1.id,
        status: QuoteStatus.CONFIRMED,
        subtotal: 1000.0,
        totalAmount: 1100.0,
        marginAmount: 300.0,
        marginPercentage: 30.0,
      },
    });

    rep2Quote = await prisma.quotation.create({
      data: {
        quoteNumber: `DASH-Q2-${Date.now()}`,
        customerId: testCustomer2.id,
        salesRepId: (salesUser2 ? salesUser2.id : managerUser.id),
        status: QuoteStatus.UNDER_REVIEW,
        subtotal: 2000.0,
        totalAmount: 2200.0,
        marginAmount: 600.0,
        marginPercentage: 30.0,
        riskScore: 75.0,
        riskLevel: 'HIGH',
      },
    });

    rep1Order = await prisma.order.create({
      data: {
        orderNumber: `DASH-ORD1-${Date.now()}`,
        customerId: testCustomer1.id,
        salesRepId: salesUser1.id,
        status: OrderStatus.FULFILLED,
        subtotal: 1000.0,
        totalAmount: 1100.0,
        items: {
          create: [
            {
              productId: testProduct1.id,
              quantity: 2,
              unitPrice: 500.0,
              lineTotal: 1000.0,
              costPrice: 300.0,
            },
          ],
        },
      },
      include: { items: true },
    });

    rep2Order = await prisma.order.create({
      data: {
        orderNumber: `DASH-ORD2-${Date.now()}`,
        customerId: testCustomer2.id,
        salesRepId: (salesUser2 ? salesUser2.id : managerUser.id),
        status: OrderStatus.CONFIRMED,
        subtotal: 2000.0,
        totalAmount: 2200.0,
        items: {
          create: [
            {
              productId: testProduct2.id,
              quantity: 1,
              unitPrice: 2000.0,
              lineTotal: 2000.0,
              costPrice: 1200.0,
            },
          ],
        },
      },
      include: { items: true },
    });

    testInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `DASH-INV-${Date.now()}`,
        orderId: rep1Order.id,
        customerId: testCustomer1.id,
        subtotal: 1000.0,
        totalAmount: 1100.0,
        paidAmount: 500.0,
        outstandingAmount: 600.0,
        dueDate: new Date(Date.now() + 15 * 86400000),
        status: InvoiceStatus.PARTIALLY_PAID,
      },
    });
  });

  // 1. Executive dashboard (ADMIN)
  await t.test('1. Executive dashboard (ADMIN) returns all required sections', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.role, 'ADMIN');
    assert.ok(body.data.summary);
    assert.ok(body.data.salesOverview);
    assert.ok(body.data.revenueAnalytics);
    assert.ok(body.data.quotationFunnel);
    assert.ok(Array.isArray(body.data.topSalesReps));
    assert.ok(Array.isArray(body.data.topCustomers));
    assert.ok(Array.isArray(body.data.topProducts));
    assert.ok(Array.isArray(body.data.categoryPerformance));
    assert.ok(body.data.alerts);
    assert.ok(body.data.financeSummary);
    assert.ok(body.data.operationsSummary);
  });

  // 2. Sales Manager dashboard
  await t.test('2. Sales Manager dashboard returns team summary, pipeline, and leaderboard', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.role, 'SALES_MANAGER');
    assert.ok(body.data.summary);
    assert.ok(body.data.salesOverview);
    assert.ok(body.data.quotationFunnel);
    assert.ok(Array.isArray(body.data.salesRepPerformance));
    assert.ok(Array.isArray(body.data.topCustomers));
    assert.ok(Array.isArray(body.data.topProducts));
    assert.ok(body.data.alerts);
  });

  // 3. Sales Rep dashboard (strictly isolated)
  await t.test('3. Sales Rep dashboard (SALES_REP) returns ONLY their own data', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard`, {
      headers: { Authorization: `Bearer ${sales1Token}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.role, 'SALES_REP');
    assert.strictEqual(body.data.salesRepId, salesUser1.id);
    assert.ok(body.data.summary);
    assert.ok(body.data.salesOverview);
    assert.ok(body.data.quotationAnalytics);
    assert.ok(Array.isArray(body.data.topCustomers));
    assert.ok(Array.isArray(body.data.recentOrders));
    // Verify recent orders only contain salesUser1 orders
    body.data.recentOrders.forEach((order) => {
      assert.notStrictEqual(order.id, rep2Order.id);
    });
  });

  // 4. Sales Rep attempting to view another sales rep data via query param
  await t.test('4. Sales Rep query param tampering is restricted strictly to own data', async () => {
    const otherRepId = salesUser2 ? salesUser2.id : managerUser.id;
    const res = await fetch(`${baseUrl}/api/dashboard?salesRepId=${otherRepId}`, {
      headers: { Authorization: `Bearer ${sales1Token}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.role, 'SALES_REP');
    assert.strictEqual(body.data.salesRepId, salesUser1.id);
    // Recent orders still only contain salesUser1 orders
    body.data.recentOrders.forEach((order) => {
      assert.notStrictEqual(order.id, rep2Order.id);
    });
  });

  // 5. Finance dashboard (FINANCE)
  await t.test('5. Finance dashboard (FINANCE) returns invoiced, paid, and aging buckets', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard`, {
      headers: { Authorization: `Bearer ${financeToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(typeof body.data.totalInvoiced === 'number');
    assert.ok(typeof body.data.totalPaid === 'number');
    assert.ok(typeof body.data.totalOutstanding === 'number');
    assert.ok(body.data.accountsReceivableAging);
    assert.ok(body.data.accountsReceivableAging.current);
    assert.ok(body.data.accountsReceivableAging.overdue_31_60);
    assert.ok(body.data.accountsReceivableAging.overdue_61_90);
    assert.ok(body.data.accountsReceivableAging.overdue_90_plus);
    assert.ok(Array.isArray(body.data.paymentMethodDistribution));
  });

  // 6. Operations dashboard (OPERATIONS)
  await t.test('6. Operations dashboard (OPERATIONS) returns fulfillment status and backlog', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard`, {
      headers: { Authorization: `Bearer ${opsToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.role, 'OPERATIONS');
    assert.ok(typeof body.data.ordersAwaitingFulfillment === 'number');
    assert.ok(typeof body.data.fulfillmentRate === 'number');
    assert.ok(Array.isArray(body.data.statusBreakdown));
    assert.ok(Array.isArray(body.data.orderStatusDistribution));
  });

  // 7. SALES_REP accessing /api/dashboard/sales-reps returns 403 Forbidden
  await t.test('7. SALES_REP accessing /api/dashboard/sales-reps returns 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/sales-reps`, {
      headers: { Authorization: `Bearer ${sales1Token}` },
    });
    assert.strictEqual(res.status, 403);
  });

  // 8. SALES_REP accessing /api/dashboard/finance returns 403 Forbidden
  await t.test('8. SALES_REP accessing /api/dashboard/finance returns 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/finance`, {
      headers: { Authorization: `Bearer ${sales1Token}` },
    });
    assert.strictEqual(res.status, 403);
  });

  // 9. OPERATIONS accessing /api/dashboard/finance returns 403 Forbidden
  await t.test('9. OPERATIONS accessing /api/dashboard/finance returns 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/finance`, {
      headers: { Authorization: `Bearer ${opsToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  // 10. SALES_REP accessing /api/dashboard/operations returns 403 Forbidden
  await t.test('10. SALES_REP accessing /api/dashboard/operations returns 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/operations`, {
      headers: { Authorization: `Bearer ${sales1Token}` },
    });
    assert.strictEqual(res.status, 403);
  });

  // 11. Unauthenticated request returns 401 Unauthorized
  await t.test('11. Unauthenticated request returns 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard`);
    assert.strictEqual(res.status, 401);
  });

  // 12. Customer token attempting to access /api/dashboard returns 403 Forbidden
  await t.test('12. Customer token accessing /api/dashboard returns 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  // 13. Dashboard summary endpoint
  await t.test('13. Dashboard summary endpoint returns KPI metrics and comparison percentages', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/summary`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.metrics);
    assert.ok(typeof body.data.metrics.revenue === 'number');
    assert.ok(typeof body.data.metrics.ordersCount === 'number');
    assert.ok(typeof body.data.metrics.conversionRate === 'number');
    assert.ok(body.data.comparison);
    assert.ok(typeof body.data.comparison.revenueChange === 'number');
    assert.ok(typeof body.data.comparison.ordersChange === 'number');
  });

  // 14. Date range filter: today
  await t.test('14. Date range filter: today returns metrics for today', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/summary?period=today`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.period, 'today');
    assert.ok(body.data.metrics);
  });

  // 15. Date range filter: yesterday
  await t.test('15. Date range filter: yesterday returns metrics for yesterday', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/summary?period=yesterday`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.period, 'yesterday');
    assert.ok(body.data.metrics);
  });

  // 16. Date range filter: this_week
  await t.test('16. Date range filter: this_week returns metrics for current week', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/summary?period=this_week`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.period, 'this_week');
  });

  // 17. Date range filter: this_month
  await t.test('17. Date range filter: this_month returns metrics for current month', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/summary?period=this_month`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.period, 'this_month');
  });

  // 18. Date range filter: this_quarter
  await t.test('18. Date range filter: this_quarter returns metrics for current quarter', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/summary?period=this_quarter`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.period, 'this_quarter');
  });

  // 19. Date range filter: this_year
  await t.test('19. Date range filter: this_year returns metrics for current year', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/summary?period=this_year`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.period, 'this_year');
  });

  // 20. Date range filter: last_7_days
  await t.test('20. Date range filter: last_7_days returns metrics for last 7 days', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/summary?period=last_7_days`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.period, 'last_7_days');
  });

  // 21. Date range filter: last_30_days
  await t.test('21. Date range filter: last_30_days returns metrics for last 30 days', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/summary?period=last_30_days`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.period, 'last_30_days');
  });

  // 22. Date range filter: last_90_days
  await t.test('22. Date range filter: last_90_days returns metrics for last 90 days', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/summary?period=last_90_days`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.period, 'last_90_days');
  });

  // 23. Date range filter: custom with valid dates
  await t.test('23. Date range filter: custom with valid startDate and endDate', async () => {
    const res = await fetch(
      `${baseUrl}/api/dashboard/summary?period=custom&startDate=2026-01-01&endDate=2026-12-31`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.period, 'custom');
    assert.ok(body.data.currentPeriod.startDate);
  });

  // 24. Date range filter: custom without dates throws 400
  await t.test('24. Date range filter: custom without startDate throws 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/summary?period=custom`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 400);
  });

  // 25. Invalid date range: startDate after endDate throws 400
  await t.test('25. Invalid date range: startDate after endDate throws 400 Bad Request', async () => {
    const res = await fetch(
      `${baseUrl}/api/dashboard/summary?period=custom&startDate=2026-12-31&endDate=2026-01-01`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    assert.strictEqual(res.status, 400);
  });

  // 26. Invalid period name throws 400
  await t.test('26. Invalid period name throws 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/summary?period=future_decade`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 400);
  });

  // 27. Limit parameter: valid limit returns at most N items
  await t.test('27. Limit parameter: limit=2 returns at most 2 items', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/products?limit=2`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length <= 2);
  });

  // 28. Limit parameter: limit > 100 or limit < 1 throws 400
  await t.test('28. Limit parameter: limit > 100 or limit < 1 throws 400 Bad Request', async () => {
    const res1 = await fetch(`${baseUrl}/api/dashboard/products?limit=150`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res1.status, 400);

    const res2 = await fetch(`${baseUrl}/api/dashboard/products?limit=0`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res2.status, 400);
  });

  // 29. Revenue analytics endpoint
  await t.test('29. Revenue analytics endpoint returns time series and gross margin', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/revenue?period=this_month&groupBy=day`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(typeof body.data.totalRevenue === 'number');
    assert.ok(typeof body.data.grossProfit === 'number');
    assert.ok(typeof body.data.grossMarginPercentage === 'number');
    assert.ok(Array.isArray(body.data.timeSeries));
  });

  // 30. Sales pipeline overview endpoint
  await t.test('30. Sales pipeline overview returns pipeline value and win rate', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/sales?period=this_month`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(typeof body.data.pipelineValue === 'number');
    assert.ok(typeof body.data.winRate === 'number');
    assert.ok(Array.isArray(body.data.statusDistribution));
  });

  // 31. Actionable alerts endpoint
  await t.test('31. Actionable alerts endpoint returns structured alerts', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/alerts`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.highRiskPendingQuotes);
    assert.ok(typeof body.data.highRiskPendingQuotes.count === 'number');
    assert.ok(Array.isArray(body.data.highRiskPendingQuotes.items));
    assert.ok(body.data.overdueInvoices);
    assert.ok(body.data.pendingApprovals);
    assert.ok(body.data.unfulfilledOrders);
  });

  // 32. Orders dashboard
  await t.test('32. Orders dashboard returns total volume and status distribution', async () => {
    const res = await fetch(`${baseUrl}/api/dashboard/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(typeof body.data.totalOrdersCount === 'number');
    assert.ok(typeof body.data.totalOrdersAmount === 'number');
    assert.ok(typeof body.data.averageOrderValue === 'number');
    assert.ok(Array.isArray(body.data.statusDistribution));
  });

  // 33. Empty / zero results safety test (querying a future date range)
  await t.test('33. Querying empty period returns safe defaults without division by zero or crashes', async () => {
    const res = await fetch(
      `${baseUrl}/api/dashboard?period=custom&startDate=2099-01-01&endDate=2099-01-02`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.summary.metrics.revenue, 0);
    assert.strictEqual(body.data.summary.metrics.conversionRate, 0);
    assert.strictEqual(body.data.summary.comparison.revenueChange, 0);
    assert.strictEqual(body.data.salesOverview.winRate, 0);
    assert.strictEqual(body.data.salesOverview.averageDealSize, 0);
    assert.strictEqual(body.data.revenueAnalytics.grossMarginPercentage, 0);
    assert.deepStrictEqual(body.data.topSalesReps.filter(r => r.totalRevenue > 0), []);
    assert.deepStrictEqual(body.data.topCustomers, []);
    assert.deepStrictEqual(body.data.topProducts, []);
  });

  await t.test('Teardown: Close test server', async () => {
    await new Promise((resolve) => server.close(() => resolve()));
    assert.ok(true);
  });
});
