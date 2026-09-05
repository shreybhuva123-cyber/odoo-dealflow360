import test from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { generateAccessToken } from '../src/utils/jwt.js';
import { orderService } from '../src/services/orderService.js';
import { invoiceService } from '../src/services/invoiceService.js';
import { customerService } from '../src/services/customerService.js';
import { dashboardService } from '../src/services/dashboardService.js';
import { UserRole } from '@prisma/client';

test('Phase 16: Backend & PostgreSQL Performance Optimization Suite', { concurrency: 1 }, async (t) => {
  let server;
  const port = 5160;
  const baseUrl = `http://127.0.0.1:${port}`;
  let adminUser, adminToken;

  await t.test('Setup: Start server & obtain test credentials', async () => {
    await new Promise((resolve) => {
      server = app.listen(port, () => resolve());
    });
    assert.ok(server);

    adminUser = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } });
    assert.ok(adminUser, 'Admin user must exist in database');
    adminToken = generateAccessToken(adminUser);
  });

  await t.test('Section 1: Database Index Audit — Verify PostgreSQL Schema Indexes', async () => {
    const rawIndexes = await prisma.$queryRawUnsafe(
      `SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public'`
    );
    const indexNames = new Set(rawIndexes.map((i) => i.indexname));

    // 1. User indexes
    assert.ok(indexNames.has('users_role_idx'), 'users_role_idx must exist');
    assert.ok(indexNames.has('users_isActive_idx'), 'users_isActive_idx must exist');
    assert.ok(indexNames.has('users_role_isActive_idx'), 'users_role_isActive_idx must exist');

    // 2. Customer indexes
    assert.ok(indexNames.has('customers_isActive_idx'), 'customers_isActive_idx must exist');
    assert.ok(indexNames.has('customers_customerTier_isActive_idx'), 'customers_customerTier_isActive_idx must exist');

    // 3. Product indexes
    assert.ok(indexNames.has('products_isActive_idx'), 'products_isActive_idx must exist');
    assert.ok(indexNames.has('products_categoryId_isActive_idx'), 'products_categoryId_isActive_idx must exist');

    // 4. Quotation composite indexes
    assert.ok(indexNames.has('quotations_salesRepId_status_idx'), 'quotations_salesRepId_status_idx must exist');
    assert.ok(indexNames.has('quotations_customerId_status_idx'), 'quotations_customerId_status_idx must exist');
    assert.ok(indexNames.has('quotations_status_createdAt_idx'), 'quotations_status_createdAt_idx must exist');
    assert.ok(indexNames.has('quotations_salesRepId_createdAt_idx'), 'quotations_salesRepId_createdAt_idx must exist');

    // 5. Order composite indexes
    assert.ok(indexNames.has('orders_salesRepId_status_idx'), 'orders_salesRepId_status_idx must exist');
    assert.ok(indexNames.has('orders_customerId_status_idx'), 'orders_customerId_status_idx must exist');
    assert.ok(indexNames.has('orders_status_createdAt_idx'), 'orders_status_createdAt_idx must exist');
    assert.ok(indexNames.has('orders_salesRepId_createdAt_idx'), 'orders_salesRepId_createdAt_idx must exist');

    // 6. Invoice composite indexes
    assert.ok(indexNames.has('invoices_customerId_status_idx'), 'invoices_customerId_status_idx must exist');
    assert.ok(indexNames.has('invoices_status_dueDate_idx'), 'invoices_status_dueDate_idx must exist');
    assert.ok(indexNames.has('invoices_status_createdAt_idx'), 'invoices_status_createdAt_idx must exist');

    // 7. Approval & Fulfillment & Audit composite indexes
    assert.ok(indexNames.has('approvals_status_approvalRole_idx'), 'approvals_status_approvalRole_idx must exist');
    assert.ok(indexNames.has('fulfillments_status_assignedToId_idx'), 'fulfillments_status_assignedToId_idx must exist');
    assert.ok(indexNames.has('audit_logs_entityType_entityId_createdAt_idx'), 'audit_logs_entityType_entityId_createdAt_idx must exist');
  });

  await t.test('Section 2: Safe Pagination & Boundary Enforcement', async () => {
    // Test 1: Order service pagination clamping
    const hugeLimitOrder = await orderService.getOrders({}, { page: 1, limit: 1000 }, adminUser);
    assert.strictEqual(hugeLimitOrder.pagination.limit, 100, 'Order pagination limit must be clamped to 100 max');
    assert.ok(hugeLimitOrder.orders.length <= 100);

    const negativePageOrder = await orderService.getOrders({}, { page: -5, limit: -20 }, adminUser);
    assert.strictEqual(negativePageOrder.pagination.page, 1, 'Negative page must be normalized to 1');
    assert.strictEqual(negativePageOrder.pagination.limit, 1, 'Negative limit must be clamped to safe minimum of 1');

    // Test 2: Invoice service pagination clamping
    const hugeLimitInvoice = await invoiceService.getInvoices({}, { page: 1, limit: 500 }, adminUser);
    assert.strictEqual(hugeLimitInvoice.meta.limit, 100, 'Invoice pagination limit must be clamped to 100 max');

    const invalidParamInvoice = await invoiceService.getInvoices({}, { page: 'abc', limit: 'xyz' }, adminUser);
    assert.strictEqual(invalidParamInvoice.meta.page, 1);
    assert.strictEqual(invalidParamInvoice.meta.limit, 10);

    // Test 3: Customer service pagination clamping
    const hugeLimitCustomer = await customerService.getCustomers({}, { page: 1, limit: 999 });
    assert.strictEqual(hugeLimitCustomer.pagination.limit, 100, 'Customer pagination limit must clamp to 100');
  });

  await t.test('Section 3: Response Payload Hygiene & Sensitive Data Prevention', async () => {
    // 1. Verify GET /api/auth/me NEVER exposes passwordHash
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(meRes.status, 200);
    const meBody = await meRes.json();
    assert.ok(meBody.data?.user);
    assert.strictEqual(meBody.data.user.passwordHash, undefined, 'passwordHash must never be exposed');

    // 2. Verify List Endpoints return clean structures without unbounded nesting
    const ordersRes = await fetch(`${baseUrl}/api/orders?limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(ordersRes.status, 200);
    const ordersBody = await ordersRes.json();
    assert.ok(ordersBody.data?.orders);
    assert.ok(ordersBody.data?.pagination);
    assert.strictEqual(ordersBody.data.pagination.limit, 10);

    // Verify each order item does not leak internal hashes
    for (const ord of ordersBody.data.orders) {
      if (ord.salesRep) {
        assert.strictEqual(ord.salesRep.passwordHash, undefined);
      }
    }
  });

  await t.test('Section 4: Dashboard Aggregation & Performance Verification', async () => {
    const filters = { period: 'this_year' };

    // 1. Summary KPIs
    const summary = await dashboardService.getDashboardSummary(adminUser, filters);
    assert.ok(typeof summary.metrics === 'object', 'Summary must have metrics object');
    assert.ok(typeof summary.metrics.revenue === 'number', 'Revenue must be a number');
    assert.ok(typeof summary.metrics.ordersCount === 'number', 'Orders count must be a number');
    assert.ok(typeof summary.comparison === 'object', 'Summary must have comparison object');

    // 2. Revenue time series with selective fields
    const revenue = await dashboardService.getRevenueAnalytics(adminUser, filters);
    assert.ok(Array.isArray(revenue.timeSeries));
    assert.ok(typeof revenue.totalRevenue === 'number');
    assert.ok(typeof revenue.grossProfit === 'number');

    // 3. Sales trend
    const salesTrend = await dashboardService.getSalesTrend(adminUser, filters);
    assert.ok(Array.isArray(salesTrend.trend), 'Sales trend must contain trend array');

    // 4. Sales rep performance (utilizes index on users role + isActive)
    const repPerf = await dashboardService.getSalesRepPerformance(adminUser, filters);
    assert.ok(Array.isArray(repPerf));
  });

  await t.test('Section 5: Transaction Atomicity & Rollback Safety', async () => {
    const testSku = `PERF-ROLLBACK-${Date.now()}`;
    let rolledBack = false;

    try {
      await prisma.$transaction(async (tx) => {
        // Step 1: Create category
        const cat = await tx.productCategory.create({
          data: { name: `TempCat-${Date.now()}` },
        });

        // Step 2: Create product
        await tx.product.create({
          data: {
            name: 'Temp Product',
            sku: testSku,
            categoryId: cat.id,
            basePrice: 100,
            costPrice: 50,
          },
        });

        // Step 3: Simulate mid-transaction business rule failure
        throw new Error('SIMULATED_TRANSACTION_FAILURE');
      });
    } catch (err) {
      if (err.message === 'SIMULATED_TRANSACTION_FAILURE') {
        rolledBack = true;
      }
    }

    assert.ok(rolledBack, 'Transaction must throw expected simulation error');

    // Verify product was not persisted
    const leakedProduct = await prisma.product.findUnique({ where: { sku: testSku } });
    assert.strictEqual(leakedProduct, null, 'Rolled back transaction must leave no orphaned product record');
  });

  await t.test('Teardown: Close test server & disconnect', async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});
