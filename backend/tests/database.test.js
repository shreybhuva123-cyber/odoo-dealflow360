import test from 'node:test';
import assert from 'node:assert';
import { prisma } from '../src/config/prisma.js';
import { CustomerTier, QuoteStatus, OrderStatus, RuleType } from '@prisma/client';

test('Database Architecture & Relationship Verification Suite', async (t) => {
  // 1. Verify User seeding and roles
  await t.test('Internal users exist across all 5 required roles', async () => {
    const users = await prisma.user.findMany();
    assert.ok(users.length >= 5);
    const roles = users.map((u) => u.role);
    assert.ok(roles.includes('ADMIN'));
    assert.ok(roles.includes('SALES_REP'));
    assert.ok(roles.includes('SALES_MANAGER'));
    assert.ok(roles.includes('FINANCE'));
    assert.ok(roles.includes('OPERATIONS'));
  });

  // 2. Verify Customers and Tiers
  await t.test('Customers exist across Bronze, Silver, and Gold tiers', async () => {
    const customers = await prisma.customer.findMany();
    assert.ok(customers.length >= 3);
    const tiers = customers.map((c) => c.customerTier);
    assert.ok(tiers.includes(CustomerTier.BRONZE));
    assert.ok(tiers.includes(CustomerTier.SILVER));
    assert.ok(tiers.includes(CustomerTier.GOLD));
  });

  // 3. Verify Product Categories & Products & Cost Prices
  await t.test('Products contain costPrice, basePrice, and category relations', async () => {
    const products = await prisma.product.findMany({
      include: { category: true, variants: true },
    });
    assert.ok(products.length >= 7);
    for (const p of products) {
      assert.ok(p.category);
      assert.ok(Number(p.basePrice) > 0);
      assert.ok(Number(p.costPrice) >= 0);
    }
  });

  // 4. Verify Price Lists
  await t.test('Price lists exist for all tiers with custom item pricing', async () => {
    const priceLists = await prisma.priceList.findMany({
      include: { items: true },
    });
    assert.ok(priceLists.length >= 3);
    const tiers = new Set(priceLists.map((p) => p.customerTier));
    assert.ok(tiers.has(CustomerTier.BRONZE));
    assert.ok(tiers.has(CustomerTier.SILVER));
    assert.ok(tiers.has(CustomerTier.GOLD));
    for (const pl of priceLists) {
      if (['BRONZE Price List', 'SILVER Price List', 'GOLD Price List'].includes(pl.name)) {
        assert.ok(pl.items.length > 0);
      }
    }
  });

  // 5. Verify Tiered Discount Rules
  await t.test('Tiered discount rules enforce category-specific maximums and thresholds', async () => {
    const rules = await prisma.discountRule.findMany({
      include: { category: true },
    });
    assert.ok(rules.length >= 9); // 3 tiers * 3 categories
    const goldHardware = rules.find(
      (r) => r.customerTier === CustomerTier.GOLD && r.category.name === 'Hardware'
    );
    assert.ok(goldHardware);
    assert.strictEqual(Number(goldHardware.maxDiscountPercentage), 15.0);
    assert.strictEqual(Number(goldHardware.managerApprovalRequiredAbove), 10.0);
    assert.strictEqual(Number(goldHardware.financeApprovalRequiredAbove), 15.0);
  });

  // 6. Verify Multi-Warehouse Inventory
  await t.test('Inventory supports multiple warehouses for the same product', async () => {
    const inventory = await prisma.inventory.findMany({
      include: { warehouse: true, product: true },
    });
    assert.ok(inventory.length > 0);

    const laptopInventory = inventory.filter(
      (i) => i.product.sku === 'HW-LAPTOP-15'
    );
    const uniqueWarehouses = new Set(laptopInventory.map((i) => i.warehouseId));
    assert.ok(uniqueWarehouses.size >= 2, 'Laptop is stocked in at least 2 distinct warehouses');
  });

  // 7. Verify Quotation with multiple products and margins
  await t.test('One quotation contains multiple products (hardware, service, subscription)', async () => {
    const quote = await prisma.quotation.findFirst({
      where: { quoteNumber: 'DF-2026-0001' },
      include: {
        items: { include: { product: true } },
        customer: true,
        salesRep: true,
        dealHealth: true,
      },
    });

    assert.ok(quote);
    assert.ok(quote.items.length >= 3);
    assert.strictEqual(quote.customer.customerTier, CustomerTier.GOLD);
    assert.ok(Number(quote.marginAmount) > 0);
    assert.ok(Number(quote.marginPercentage) > 0);
    assert.ok(quote.dealHealth);
  });

  // 8. Verify Approval Requests & Action History
  await t.test('Quotation has traceable approval request and approval action history', async () => {
    const quote = await prisma.quotation.findFirst({
      where: { quoteNumber: 'DF-2026-0001' },
      include: {
        approvalRequests: true,
        approvalActions: { include: { reviewer: true } },
      },
    });

    assert.ok(quote.approvalRequests.length > 0);
    assert.ok(quote.approvalActions.length > 0);
    assert.strictEqual(quote.approvalActions[0].action, 'APPROVED');
    assert.ok(quote.approvalActions[0].reviewer);
    assert.ok(quote.approvalActions[0].reason);
  });

  // 9. Verify Order with one-time and recurring items
  await t.test('Order contains both one-time and recurring line items', async () => {
    const order = await prisma.order.findFirst({
      where: { orderNumber: 'ORD-2026-0001' },
      include: { items: true },
    });

    assert.ok(order);
    const hasOneTime = order.items.some((item) => item.isRecurring === false);
    const hasRecurring = order.items.some((item) => item.isRecurring === true);
    assert.ok(hasOneTime, 'Order has one-time items');
    assert.ok(hasRecurring, 'Order has recurring subscription items');
  });

  // 10. Verify Fulfillment Splits across warehouses and Backorders
  await t.test('Order has multi-warehouse fulfillment splits and backorder tracking', async () => {
    const fulfillment = await prisma.fulfillment.findFirst({
      where: { splits: { some: {} } },
      include: {
        splits: {
          include: { warehouse: true, backorders: true },
        },
      },
    });

    assert.ok(fulfillment);
    assert.ok(fulfillment.splits.length >= 2, 'Fulfillment is split across multiple warehouses');

    const backorderedSplit = fulfillment.splits.find((s) => s.status === 'BACKORDERED');
    assert.ok(backorderedSplit, 'At least one split is in BACKORDERED status');
    assert.ok(backorderedSplit.backorders.length > 0, 'Backorder record exists for split');
    assert.strictEqual(backorderedSplit.backorders[0].status, 'OPEN');
  });

  // 11. Verify Subscriptions and Billing Schedules
  await t.test('Subscriptions have recurring billing schedules', async () => {
    const subscription = await prisma.subscription.findFirst({
      include: { plan: true, billingSchedules: true },
    });

    assert.ok(subscription);
    assert.ok(subscription.billingSchedules.length >= 2);
    const paidSchedule = subscription.billingSchedules.find((s) => s.status === 'PAID');
    const upcomingSchedule = subscription.billingSchedules.find((s) => s.status === 'UPCOMING');
    assert.ok(paidSchedule);
    assert.ok(upcomingSchedule);
  });

  // 12. Verify Invoices and Payments
  await t.test('Invoice has line items and simulated payment record', async () => {
    const invoice = await prisma.invoice.findFirst({
      where: { invoiceNumber: 'INV-2026-0001' },
      include: { items: true, payments: true },
    });

    assert.ok(invoice);
    assert.ok(invoice.items.length > 0);
    assert.ok(invoice.payments.length > 0);
    assert.strictEqual(invoice.payments[0].status, 'SUCCESSFUL');
  });

  // 13. Verify Customer Quotation Negotiations & Messages
  await t.test('Quotation has negotiation thread and line-level messages', async () => {
    const negotiation = await prisma.negotiation.findFirst({
      include: { messages: true, quotation: true },
    });

    assert.ok(negotiation);
    assert.ok(negotiation.messages.length >= 2);
    const customerMsg = negotiation.messages.find((m) => m.senderType === 'CUSTOMER');
    const salesRepMsg = negotiation.messages.find((m) => m.senderType === 'SALES_REP');
    assert.ok(customerMsg);
    assert.ok(salesRepMsg);
  });

  // 14. Verify Upsell and Cross-Sell Rules
  await t.test('Upsell and Cross-sell recommendation rules exist', async () => {
    const rules = await prisma.upsellCrossSellRule.findMany({
      include: { product: true, recommendedProduct: true },
    });

    assert.ok(rules.length >= 3);
    const crossSell = rules.find((r) => r.ruleType === RuleType.CROSS_SELL);
    const upsell = rules.find((r) => r.ruleType === RuleType.UPSELL);
    assert.ok(crossSell);
    assert.ok(upsell);
  });

  // 15. Verify Audit Logs
  await t.test('Audit log exists with entity tracking, user reference, and timestamps', async () => {
    const auditLogs = await prisma.auditLog.findMany({
      include: { user: true },
    });

    assert.ok(auditLogs.length > 0);
    const quoteAudit = auditLogs.find((a) => a.entityType === 'QUOTATION');
    assert.ok(quoteAudit);
    assert.ok(quoteAudit.oldValue);
    assert.ok(quoteAudit.newValue);
    assert.ok(quoteAudit.user);
  });
});
