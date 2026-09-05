import test from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { generateAccessToken } from '../src/utils/jwt.js';
import {
  QuoteStatus,
  OrderStatus,
  InvoiceStatus,
  PaymentStatus,
  CustomerTier,
  UserRole,
  NotificationType,
  NotificationPriority,
} from '@prisma/client';
import { notificationService } from '../src/services/notificationService.js';
import { activityService } from '../src/services/activityService.js';
import { notificationEvents } from '../src/services/notificationEvents.js';

test('Phase 11: Notification & Activity / Communication Engine Comprehensive Test Suite', async (t) => {
  let server;
  const port = 5120;
  const baseUrl = `http://localhost:${port}`;

  let adminToken, sales1Token, sales2Token, managerToken, financeToken, opsToken;
  let adminUser, salesUser1, salesUser2, managerUser, financeUser, opsUser;
  let goldCustomer;
  let sampleProduct;

  await t.test('Bootstrap: Test server, users, customer, and tokens', async () => {
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
    assert.ok(goldCustomer);

    sampleProduct = await prisma.product.findFirst({ where: { isActive: true } });
    assert.ok(sampleProduct);
  });

  // =========================================================================
  // 1. NOTIFICATION SERVICE & MODEL
  // =========================================================================
  let createdNotif1;

  await t.test('1. Create notification directly via service', async () => {
    createdNotif1 = await notificationService.createNotification({
      userId: salesUser1.id,
      type: NotificationType.QUOTATION_APPROVED,
      priority: NotificationPriority.NORMAL,
      title: 'Quotation Q-TEST-001 Approved',
      message: 'Your quotation has been approved by sales manager.',
      entityType: 'QUOTATION',
      entityId: '00000000-0000-0000-0000-000000000001',
      actionUrl: '/quotations/00000000-0000-0000-0000-000000000001',
      idempotencyKey: `test_notif_1_${Date.now()}`,
    });

    assert.ok(createdNotif1);
    assert.strictEqual(createdNotif1.userId, salesUser1.id);
    assert.strictEqual(createdNotif1.isRead, false);
    assert.strictEqual(createdNotif1.type, NotificationType.QUOTATION_APPROVED);
  });

  await t.test('2. Idempotency key prevents duplicate notification creation', async () => {
    const key = `idemp_key_${Date.now()}`;
    const first = await notificationService.createNotification({
      userId: salesUser1.id,
      type: NotificationType.ORDER_CREATED,
      priority: NotificationPriority.HIGH,
      title: 'Order Created',
      message: 'New order has been created.',
      idempotencyKey: key,
    });

    const duplicate = await notificationService.createNotification({
      userId: salesUser1.id,
      type: NotificationType.ORDER_CREATED,
      priority: NotificationPriority.HIGH,
      title: 'Order Created (Duplicate Attempt)',
      message: 'Should return existing without error.',
      idempotencyKey: key,
    });

    assert.ok(first && duplicate);
    assert.strictEqual(first.id, duplicate.id);

    const count = await prisma.notification.count({
      where: { idempotencyKey: key },
    });
    assert.strictEqual(count, 1);
  });

  // =========================================================================
  // 2. USER PREFERENCES
  // =========================================================================
  await t.test('3. User notification preferences toggle and suppression', async () => {
    // Check default is enabled
    const defaultEnabled = await notificationService.checkNotificationPreference(
      salesUser1.id,
      NotificationType.ORDER_STATUS_CHANGED
    );
    assert.strictEqual(defaultEnabled, true);

    // Disable ORDER_STATUS_CHANGED for salesUser1
    await notificationService.updateNotificationPreference(
      salesUser1.id,
      NotificationType.ORDER_STATUS_CHANGED,
      false
    );

    const isEnabledNow = await notificationService.checkNotificationPreference(
      salesUser1.id,
      NotificationType.ORDER_STATUS_CHANGED
    );
    assert.strictEqual(isEnabledNow, false);

    // Attempt to send suppressed notification
    const suppressed = await notificationService.createNotification({
      userId: salesUser1.id,
      type: NotificationType.ORDER_STATUS_CHANGED,
      title: 'Status changed',
      message: 'This should be suppressed by preference.',
    });
    assert.strictEqual(suppressed, null);

    // Re-enable preference
    await notificationService.updateNotificationPreference(
      salesUser1.id,
      NotificationType.ORDER_STATUS_CHANGED,
      true
    );

    const reEnabled = await notificationService.checkNotificationPreference(
      salesUser1.id,
      NotificationType.ORDER_STATUS_CHANGED
    );
    assert.strictEqual(reEnabled, true);
  });

  // =========================================================================
  // 3. NOTIFICATION API ENDPOINTS
  // =========================================================================
  await t.test('4. GET /api/notifications returns user notifications with pagination', async () => {
    const res = await fetch(`${baseUrl}/api/notifications?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${sales1Token}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.meta);
    assert.ok(body.data.length > 0);
    // Ensure all returned notifications belong to salesUser1
    body.data.forEach((n) => {
      assert.strictEqual(n.userId, salesUser1.id);
    });
  });

  await t.test('5. GET /api/notifications/unread-count returns accurate count', async () => {
    const res = await fetch(`${baseUrl}/api/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${sales1Token}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(typeof body.data.count === 'number');
    assert.ok(body.data.count >= 1);
  });

  await t.test('6. GET /api/notifications/:id returns specific notification', async () => {
    const res = await fetch(`${baseUrl}/api/notifications/${createdNotif1.id}`, {
      headers: { Authorization: `Bearer ${sales1Token}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.id, createdNotif1.id);
    assert.strictEqual(body.data.title, createdNotif1.title);
  });

  await t.test('7. PATCH /api/notifications/:id/read marks notification as read', async () => {
    const res = await fetch(`${baseUrl}/api/notifications/${createdNotif1.id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${sales1Token}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.isRead, true);
    assert.ok(body.data.readAt !== null);
  });

  await t.test('8. PATCH /api/notifications/read-all marks all unread notifications as read', async () => {
    // Create 2 unread notifications
    await notificationService.createNotification({
      userId: salesUser1.id,
      type: NotificationType.INVOICE_ISSUED,
      title: 'Invoice 1',
      message: 'Message 1',
    });
    await notificationService.createNotification({
      userId: salesUser1.id,
      type: NotificationType.INVOICE_ISSUED,
      title: 'Invoice 2',
      message: 'Message 2',
    });

    const res = await fetch(`${baseUrl}/api/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${sales1Token}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.count >= 2);

    // Verify unread count is now 0
    const countRes = await fetch(`${baseUrl}/api/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${sales1Token}` },
    });
    const countBody = await countRes.json();
    assert.strictEqual(countBody.data.count, 0);
  });

  await t.test('9. DELETE /api/notifications/:id deletes notification', async () => {
    const toDelete = await notificationService.createNotification({
      userId: salesUser1.id,
      type: NotificationType.PAYMENT_RECEIVED,
      title: 'Payment to delete',
      message: 'Delete me',
    });

    const res = await fetch(`${baseUrl}/api/notifications/${toDelete.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${sales1Token}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);

    const verify = await prisma.notification.findUnique({ where: { id: toDelete.id } });
    assert.strictEqual(verify, null);
  });

  await t.test('10. GET & PUT /api/notifications/preferences API', async () => {
    const putRes = await fetch(`${baseUrl}/api/notifications/preferences`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${sales1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationType: NotificationType.HIGH_RISK_QUOTATION,
        enabled: false,
      }),
    });

    assert.strictEqual(putRes.status, 200);
    const putBody = await putRes.json();
    assert.strictEqual(putBody.success, true);
    assert.strictEqual(putBody.data.enabled, false);

    const getRes = await fetch(`${baseUrl}/api/notifications/preferences`, {
      headers: { Authorization: `Bearer ${sales1Token}` },
    });

    assert.strictEqual(getRes.status, 200);
    const getBody = await getRes.json();
    assert.strictEqual(getBody.success, true);
    assert.ok(Array.isArray(getBody.data));
    const matched = getBody.data.find((p) => p.notificationType === NotificationType.HIGH_RISK_QUOTATION);
    assert.ok(matched);
    assert.strictEqual(matched.enabled, false);
  });

  // =========================================================================
  // 4. DATA ISOLATION & SECURITY
  // =========================================================================
  await t.test('11. Security: Sales Rep 1 cannot access Sales Rep 2 notification (403)', async () => {
    const notifUser2 = await notificationService.createNotification({
      userId: salesUser2.id,
      type: NotificationType.ORDER_CREATED,
      title: 'User 2 Secret Notification',
      message: 'Private to user 2',
    });

    const res = await fetch(`${baseUrl}/api/notifications/${notifUser2.id}`, {
      headers: { Authorization: `Bearer ${sales1Token}` },
    });

    assert.strictEqual(res.status, 403);
  });

  await t.test('12. Security: Sales Rep 1 cannot mark Sales Rep 2 notification as read (403)', async () => {
    const notifUser2 = await notificationService.createNotification({
      userId: salesUser2.id,
      type: NotificationType.ORDER_CREATED,
      title: 'User 2 Unread',
      message: 'Cannot touch',
    });

    const res = await fetch(`${baseUrl}/api/notifications/${notifUser2.id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${sales1Token}` },
    });

    assert.strictEqual(res.status, 403);
  });

  await t.test('13. Security: Sales Rep 1 cannot delete Sales Rep 2 notification (403)', async () => {
    const notifUser2 = await notificationService.createNotification({
      userId: salesUser2.id,
      type: NotificationType.ORDER_CREATED,
      title: 'User 2 Do Not Delete',
      message: 'Cannot delete',
    });

    const res = await fetch(`${baseUrl}/api/notifications/${notifUser2.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${sales1Token}` },
    });

    assert.strictEqual(res.status, 403);
  });

  await t.test('14. Security: Query tampering with ?userId= does not leak other user notifications', async () => {
    const res = await fetch(`${baseUrl}/api/notifications?userId=${salesUser2.id}`, {
      headers: { Authorization: `Bearer ${sales1Token}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    // Must ONLY return salesUser1 notifications
    body.data.forEach((n) => {
      assert.strictEqual(n.userId, salesUser1.id);
    });
  });

  await t.test('15. Security: Unauthenticated requests return 401', async () => {
    const res = await fetch(`${baseUrl}/api/notifications`);
    assert.strictEqual(res.status, 401);
  });

  // =========================================================================
  // 5. ACTIVITY STREAM & AUDIT
  // =========================================================================
  let sampleActivity;

  await t.test('16. Activity creation and rapid deduplication', async () => {
    const entityId = '11111111-1111-1111-1111-111111111111';
    sampleActivity = await activityService.createActivity({
      actorUserId: adminUser.id,
      entityType: 'QUOTATION',
      entityId,
      action: 'QUOTATION_CREATED',
      description: 'Quotation Q-TEST-002 created',
      metadata: { quoteNumber: 'Q-TEST-002' },
    });

    assert.ok(sampleActivity);
    assert.strictEqual(sampleActivity.entityType, 'QUOTATION');

    // Duplicate call within 2 seconds returns existing
    const dup = await activityService.createActivity({
      actorUserId: adminUser.id,
      entityType: 'QUOTATION',
      entityId,
      action: 'QUOTATION_CREATED',
      description: 'Quotation Q-TEST-002 created',
    });

    assert.strictEqual(dup.id, sampleActivity.id);
  });

  await t.test('17. GET /api/activity returns recent activities feed', async () => {
    const res = await fetch(`${baseUrl}/api/activity?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.meta);
  });

  await t.test('18. GET /api/activity/:id returns single activity entry', async () => {
    const res = await fetch(`${baseUrl}/api/activity/${sampleActivity.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.id, sampleActivity.id);
    assert.strictEqual(body.data.action, 'QUOTATION_CREATED');
  });

  await t.test('19. Security: Operations role cannot query invoice or payment activities (403)', async () => {
    const res = await fetch(`${baseUrl}/api/activity?entityType=INVOICE`, {
      headers: { Authorization: `Bearer ${opsToken}` },
    });

    assert.strictEqual(res.status, 403);
  });

  await t.test('20. GET /api/activity/entities/:entityType/:entityId returns timeline', async () => {
    const res = await fetch(
      `${baseUrl}/api/activity/entities/QUOTATION/${sampleActivity.entityId}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 1);
  });

  await t.test('21. Entity activity shortcuts (quotations, orders, invoices, customers)', async () => {
    // Quotations shortcut
    const qRes = await fetch(`${baseUrl}/api/quotations/${sampleActivity.entityId}/activity`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(qRes.status, 200);

    // Customers shortcut
    const cRes = await fetch(`${baseUrl}/api/customers/${goldCustomer.id}/activity`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(cRes.status, 200);
  });

  // =========================================================================
  // 6. END-TO-END DOMAIN EVENT DISPATCHER VERIFICATION
  // =========================================================================
  let testQuotation, testOrder, testInvoice;

  await t.test('22. Quotation submitted event notifies approvers & records activity', async () => {
    // Create quotation
    const quoteRes = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sales1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId: goldCustomer.id }),
    });
    assert.strictEqual(quoteRes.status, 201);
    const quoteBody = await quoteRes.json();
    testQuotation = quoteBody.data.quotation;

    // Add item with discount to trigger approval
    await fetch(`${baseUrl}/api/quotations/${testQuotation.id}/items`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sales1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: sampleProduct.id,
        quantity: 5,
        discountPercentage: 50,
      }),
    });

    // Submit quotation
    const submitRes = await fetch(`${baseUrl}/api/quotations/${testQuotation.id}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${sales1Token}` },
    });
    assert.strictEqual(submitRes.status, 200);

    // Verify activity created
    const activities = await prisma.activity.findMany({
      where: { entityType: 'QUOTATION', entityId: testQuotation.id, action: 'QUOTATION_SUBMITTED' },
    });
    assert.ok(activities.length >= 1);

    // Verify manager received notification
    const managerNotifs = await prisma.notification.findMany({
      where: {
        userId: managerUser.id,
        entityType: 'QUOTATION',
        entityId: testQuotation.id,
      },
    });
    assert.ok(managerNotifs.length >= 1);
  });

  await t.test('23. Quotation approval event notifies sales rep', async () => {
    // Find pending approval step
    const pendingApproval = await prisma.approval.findFirst({
      where: { quotationId: testQuotation.id, status: 'PENDING' },
    });

    if (pendingApproval) {
      // Approve as admin
      const approveRes = await fetch(`${baseUrl}/api/approvals/${pendingApproval.id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.strictEqual(approveRes.status, 200);

      // Check if another step is pending
      const nextStep = await prisma.approval.findFirst({
        where: { quotationId: testQuotation.id, status: 'PENDING' },
      });
      if (nextStep) {
        await fetch(`${baseUrl}/api/approvals/${nextStep.id}/approve`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      }

      // Verify salesUser1 received QUOTATION_APPROVED notification
      const repNotifs = await prisma.notification.findMany({
        where: {
          userId: salesUser1.id,
          entityType: 'QUOTATION',
          entityId: testQuotation.id,
          type: NotificationType.QUOTATION_APPROVED,
        },
      });
      assert.ok(repNotifs.length >= 1);
    }
  });

  await t.test('24. Order created & status change events notify sales rep & ops', async () => {
    // Create order from approved quotation
    const orderRes = await fetch(`${baseUrl}/api/quotations/${testQuotation.id}/create-order`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${sales1Token}` },
    });
    assert.strictEqual(orderRes.status, 201);
    const orderBody = await orderRes.json();
    testOrder = orderBody.data.order;

    // Verify ORDER_CREATED notification sent to opsUser
    const opsNotifs = await prisma.notification.findMany({
      where: {
        userId: opsUser.id,
        entityType: 'ORDER',
        entityId: testOrder.id,
        type: NotificationType.ORDER_CREATED,
      },
    });
    assert.ok(opsNotifs.length >= 1);

    // Update order status: CONFIRMED -> PROCESSING
    const statusRes = await fetch(`${baseUrl}/api/orders/${testOrder.id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${opsToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: OrderStatus.PROCESSING, notes: 'Processing batch' }),
    });
    assert.strictEqual(statusRes.status, 200);

    // Verify ORDER_STATUS_CHANGED notification sent to salesUser1
    const repNotifs = await prisma.notification.findMany({
      where: {
        userId: salesUser1.id,
        entityType: 'ORDER',
        entityId: testOrder.id,
        type: NotificationType.ORDER_STATUS_CHANGED,
      },
    });
    assert.ok(repNotifs.length >= 1);
  });

  await t.test('25. Fulfillment assignment & shipping events notify operators & sales', async () => {
    const fulfillment = await prisma.fulfillment.findFirst({
      where: { orderId: testOrder.id },
    });
    assert.ok(fulfillment);

    // Assign fulfillment
    const assignRes = await fetch(`${baseUrl}/api/fulfillments/${fulfillment.id}/assign`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${opsToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ operationsUserId: opsUser.id }),
    });
    assert.strictEqual(assignRes.status, 200);

    // Verify FULFILLMENT_ASSIGNED notification to opsUser
    const assignNotifs = await prisma.notification.findMany({
      where: {
        userId: opsUser.id,
        entityType: 'FULFILLMENT',
        entityId: fulfillment.id,
        type: NotificationType.FULFILLMENT_ASSIGNED,
      },
    });
    assert.ok(assignNotifs.length >= 1);

    // Update fulfillment to PROCESSING then SHIPPED
    await fetch(`${baseUrl}/api/fulfillments/${fulfillment.id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${opsToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'PROCESSING', notes: 'Packing order' }),
    });

    const shipRes = await fetch(`${baseUrl}/api/fulfillments/${fulfillment.id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${opsToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'SHIPPED', notes: 'Dispatched with FedEx' }),
    });
    assert.strictEqual(shipRes.status, 200);

    // Verify ORDER_SHIPPED notification to salesUser1
    const shipNotifs = await prisma.notification.findMany({
      where: {
        userId: salesUser1.id,
        entityType: 'ORDER',
        entityId: testOrder.id,
        type: NotificationType.ORDER_SHIPPED,
      },
    });
    assert.ok(shipNotifs.length >= 1);
  });

  await t.test('26. Invoice issuance & payment events notify finance and sales rep', async () => {
    // Create invoice from order
    const invRes = await fetch(`${baseUrl}/api/orders/${testOrder.id}/create-invoice`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${financeToken}` },
    });
    assert.strictEqual(invRes.status, 201);
    const invBody = await invRes.json();
    testInvoice = invBody.data;

    // Issue invoice
    const issueRes = await fetch(`${baseUrl}/api/invoices/${testInvoice.id}/issue`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${financeToken}` },
    });
    assert.strictEqual(issueRes.status, 200);

    // Verify INVOICE_ISSUED notification to financeUser
    const financeNotifs = await prisma.notification.findMany({
      where: {
        userId: financeUser.id,
        entityType: 'INVOICE',
        entityId: testInvoice.id,
        type: NotificationType.INVOICE_ISSUED,
      },
    });
    assert.ok(financeNotifs.length >= 1);

    // Record partial payment
    const payRes = await fetch(`${baseUrl}/api/invoices/${testInvoice.id}/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${financeToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 50.0,
        paymentMethod: 'CREDIT_CARD',
        notes: 'Partial deposit',
      }),
    });
    assert.strictEqual(payRes.status, 201);

    // Verify PAYMENT_RECEIVED notification to financeUser
    const payNotifs = await prisma.notification.findMany({
      where: {
        userId: financeUser.id,
        entityType: 'INVOICE',
        entityId: testInvoice.id,
        type: NotificationType.PAYMENT_RECEIVED,
      },
    });
    assert.ok(payNotifs.length >= 1);

    // Record remaining balance to trigger INVOICE_PAID
    const remainingBalance = Number(testInvoice.totalAmount) - 50.0;
    if (remainingBalance > 0) {
      await fetch(`${baseUrl}/api/invoices/${testInvoice.id}/payments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${financeToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: remainingBalance,
          paymentMethod: 'BANK_TRANSFER',
          notes: 'Final settlement',
        }),
      });

      // Verify INVOICE_PAID notification to salesUser1
      const paidNotifs = await prisma.notification.findMany({
        where: {
          userId: salesUser1.id,
          entityType: 'INVOICE',
          entityId: testInvoice.id,
          type: NotificationType.INVOICE_PAID,
        },
      });
      assert.ok(paidNotifs.length >= 1);
    }
  });

  await t.test('27. Batch overdue invoice notification generator', async () => {
    // Create an overdue draft invoice directly in database
    const pastDueDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const overdueInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `TEST-INV-OVERDUE-${Date.now()}`,
        customerId: goldCustomer.id,
        orderId: testOrder.id,
        status: InvoiceStatus.ISSUED,
        subtotal: 1000,
        taxAmount: 100,
        totalAmount: 1100,
        paidAmount: 0,
        outstandingAmount: 1100,
        dueDate: pastDueDate,
        items: {
          create: [
            {
              productId: sampleProduct.id,
              quantity: 1,
              unitPrice: 1000,
              lineTotal: 1100,
            },
          ],
        },
      },
    });

    // Run batch overdue generator
    const batchSummary = await notificationEvents.generateOverdueInvoiceNotifications();
    assert.ok(batchSummary.processedCount >= 1);
    assert.ok(batchSummary.notifiedCount >= 1);

    // Verify financeUser received INVOICE_OVERDUE notification
    const overdueNotifs = await prisma.notification.findMany({
      where: {
        userId: financeUser.id,
        entityType: 'INVOICE',
        entityId: overdueInvoice.id,
        type: NotificationType.INVOICE_OVERDUE,
      },
    });
    assert.ok(overdueNotifs.length >= 1);
  });

  await t.test('28. POST /api/notifications/trigger-overdue endpoint works for admin', async () => {
    const res = await fetch(`${baseUrl}/api/notifications/trigger-overdue`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(typeof body.data.processedCount === 'number');
  });

  await t.test('Teardown: Close test server & cleanup', async () => {
    await new Promise((resolve) => server.close(() => resolve()));
    assert.ok(true);
  });
});
