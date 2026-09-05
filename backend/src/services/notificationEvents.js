import { prisma } from '../config/prisma.js';
import { notificationService } from './notificationService.js';
import { activityService } from './activityService.js';
import { logger } from '../utils/logger.js';

export const notificationEvents = {
  /**
   * Helper to find active user IDs by roles
   */
  async findUserIdsByRoles(roles = [], tx = prisma) {
    const users = await tx.user.findMany({
      where: {
        role: { in: roles },
        isActive: true,
      },
      select: { id: true },
    });
    return users.map((u) => u.id);
  },

  /**
   * 1. Quotation submitted
   */
  async handleQuotationSubmitted(quotation, submittedBy, tx = prisma) {
    try {
      await activityService.createActivity(
        {
          actorUserId: submittedBy?.id || quotation.salesRepId,
          entityType: 'QUOTATION',
          entityId: quotation.id,
          action: 'QUOTATION_SUBMITTED',
          description: `Quotation ${quotation.quoteNumber} submitted for evaluation`,
          metadata: {
            quoteNumber: quotation.quoteNumber,
            totalAmount: Number(quotation.totalAmount),
            approvalRequired: quotation.approvalRequired,
          },
        },
        tx
      );

      if (quotation.approvalRequired) {
        const approverIds = await this.findUserIdsByRoles(['SALES_MANAGER', 'FINANCE', 'ADMIN'], tx);
        await notificationService.sendNotificationsToUsers(
          approverIds,
          {
            type: 'QUOTATION_APPROVAL_REQUIRED',
            priority: 'HIGH',
            title: 'Quotation requires approval',
            message: `Quotation ${quotation.quoteNumber} requires your approval.`,
            entityType: 'QUOTATION',
            entityId: quotation.id,
            actionUrl: `/quotations/${quotation.id}`,
            idempotencyKey: `QUOTATION_APPROVAL_REQUIRED:${quotation.id}`,
          },
          tx
        );
      }
    } catch (err) {
      logger.error('Error in handleQuotationSubmitted:', err);
    }
  },

  /**
   * 2. Quotation approved
   */
  async handleQuotationApproved(quotation, approver, tx = prisma) {
    try {
      await activityService.createActivity(
        {
          actorUserId: approver?.id,
          entityType: 'QUOTATION',
          entityId: quotation.id,
          action: 'QUOTATION_APPROVED',
          description: `Quotation ${quotation.quoteNumber} was approved by ${approver?.name || 'Authorized User'}`,
          metadata: {
            quoteNumber: quotation.quoteNumber,
            approverId: approver?.id,
          },
        },
        tx
      );

      if (quotation.salesRepId) {
        await notificationService.sendNotificationToUser(
          quotation.salesRepId,
          {
            type: 'QUOTATION_APPROVED',
            priority: 'NORMAL',
            title: 'Quotation approved',
            message: `Quotation ${quotation.quoteNumber} has been approved.`,
            entityType: 'QUOTATION',
            entityId: quotation.id,
            actionUrl: `/quotations/${quotation.id}`,
            idempotencyKey: `QUOTATION_APPROVED:${quotation.id}`,
          },
          tx
        );
      }
    } catch (err) {
      logger.error('Error in handleQuotationApproved:', err);
    }
  },

  /**
   * 3. Quotation rejected
   */
  async handleQuotationRejected(quotation, reason, rejectedBy, tx = prisma) {
    try {
      await activityService.createActivity(
        {
          actorUserId: rejectedBy?.id,
          entityType: 'QUOTATION',
          entityId: quotation.id,
          action: 'QUOTATION_REJECTED',
          description: `Quotation ${quotation.quoteNumber} was rejected: ${reason || 'No reason provided'}`,
          metadata: {
            quoteNumber: quotation.quoteNumber,
            reason,
            rejectedById: rejectedBy?.id,
          },
        },
        tx
      );

      if (quotation.salesRepId) {
        await notificationService.sendNotificationToUser(
          quotation.salesRepId,
          {
            type: 'QUOTATION_REJECTED',
            priority: 'HIGH',
            title: 'Quotation rejected',
            message: `Quotation ${quotation.quoteNumber} was rejected.${reason ? ` Reason: ${reason}` : ''}`,
            entityType: 'QUOTATION',
            entityId: quotation.id,
            actionUrl: `/quotations/${quotation.id}`,
            idempotencyKey: `QUOTATION_REJECTED:${quotation.id}`,
          },
          tx
        );
      }
    } catch (err) {
      logger.error('Error in handleQuotationRejected:', err);
    }
  },

  /**
   * 4. High-risk quotation detected
   */
  async handleHighRiskQuotation(quotation, tx = prisma) {
    try {
      await activityService.createActivity(
        {
          actorUserId: null,
          entityType: 'QUOTATION',
          entityId: quotation.id,
          action: 'HIGH_RISK_QUOTATION',
          description: `High risk detected for quotation ${quotation.quoteNumber} (Score: ${quotation.riskScore})`,
          metadata: {
            quoteNumber: quotation.quoteNumber,
            riskScore: Number(quotation.riskScore),
            riskLevel: quotation.riskLevel,
          },
        },
        tx
      );

      const managerIds = await this.findUserIdsByRoles(['SALES_MANAGER', 'ADMIN', 'FINANCE'], tx);
      await notificationService.sendNotificationsToUsers(
        managerIds,
        {
          type: 'HIGH_RISK_QUOTATION',
          priority: 'HIGH',
          title: 'High-risk quotation detected',
          message: `Quotation ${quotation.quoteNumber} has high risk score (${quotation.riskScore}).`,
          entityType: 'QUOTATION',
          entityId: quotation.id,
          actionUrl: `/quotations/${quotation.id}`,
          idempotencyKey: `HIGH_RISK_QUOTATION:${quotation.id}`,
        },
        tx
      );
    } catch (err) {
      logger.error('Error in handleHighRiskQuotation:', err);
    }
  },

  /**
   * 5. Order created
   */
  async handleOrderCreated(order, createdBy, tx = prisma) {
    try {
      await activityService.createActivity(
        {
          actorUserId: createdBy?.id || order.salesRepId,
          entityType: 'ORDER',
          entityId: order.id,
          action: 'ORDER_CREATED',
          description: `Order ${order.orderNumber} created with total $${Number(order.totalAmount).toFixed(2)}`,
          metadata: {
            orderNumber: order.orderNumber,
            totalAmount: Number(order.totalAmount),
            customerId: order.customerId,
          },
        },
        tx
      );

      const recipientIds = [];
      if (order.salesRepId) recipientIds.push(order.salesRepId);
      const opsIds = await this.findUserIdsByRoles(['OPERATIONS', 'ADMIN'], tx);
      recipientIds.push(...opsIds);

      await notificationService.sendNotificationsToUsers(
        recipientIds,
        {
          type: 'ORDER_CREATED',
          priority: 'NORMAL',
          title: 'Order created',
          message: `Order ${order.orderNumber} has been created.`,
          entityType: 'ORDER',
          entityId: order.id,
          actionUrl: `/orders/${order.id}`,
          idempotencyKey: `ORDER_CREATED:${order.id}`,
        },
        tx
      );
    } catch (err) {
      logger.error('Error in handleOrderCreated:', err);
    }
  },

  /**
   * 6. Order status changed
   */
  async handleOrderStatusChanged(order, oldStatus, newStatus, updatedBy, tx = prisma) {
    if (oldStatus === newStatus) return;

    try {
      await activityService.createActivity(
        {
          actorUserId: updatedBy?.id,
          entityType: 'ORDER',
          entityId: order.id,
          action: 'ORDER_STATUS_CHANGED',
          description: `Order ${order.orderNumber} status changed from ${oldStatus} to ${newStatus}`,
          metadata: {
            orderNumber: order.orderNumber,
            oldStatus,
            newStatus,
          },
        },
        tx
      );

      const recipientIds = [];
      if (order.salesRepId) recipientIds.push(order.salesRepId);

      await notificationService.sendNotificationsToUsers(
        recipientIds,
        {
          type: 'ORDER_STATUS_CHANGED',
          priority: 'NORMAL',
          title: 'Order status updated',
          message: `Order ${order.orderNumber} status updated to ${newStatus}.`,
          entityType: 'ORDER',
          entityId: order.id,
          actionUrl: `/orders/${order.id}`,
          idempotencyKey: `ORDER_STATUS_CHANGED:${order.id}:${newStatus}`,
        },
        tx
      );
    } catch (err) {
      logger.error('Error in handleOrderStatusChanged:', err);
    }
  },

  /**
   * 7. Fulfillment assigned
   */
  async handleFulfillmentAssigned(fulfillment, assignedToUser, orderNumber, assignedBy, tx = prisma) {
    try {
      await activityService.createActivity(
        {
          actorUserId: assignedBy?.id,
          entityType: 'FULFILLMENT',
          entityId: fulfillment.id,
          action: 'FULFILLMENT_ASSIGNED',
          description: `Fulfillment for order ${orderNumber} assigned to ${assignedToUser.name}`,
          metadata: {
            fulfillmentId: fulfillment.id,
            assignedToId: assignedToUser.id,
            orderNumber,
          },
        },
        tx
      );

      await notificationService.sendNotificationToUser(
        assignedToUser.id,
        {
          type: 'FULFILLMENT_ASSIGNED',
          priority: 'NORMAL',
          title: 'Fulfillment assigned',
          message: `You have been assigned fulfillment for order ${orderNumber}.`,
          entityType: 'FULFILLMENT',
          entityId: fulfillment.id,
          actionUrl: `/fulfillments/${fulfillment.id}`,
          idempotencyKey: `FULFILLMENT_ASSIGNED:${fulfillment.id}:${assignedToUser.id}`,
        },
        tx
      );
    } catch (err) {
      logger.error('Error in handleFulfillmentAssigned:', err);
    }
  },

  /**
   * 8. Order shipped
   */
  async handleOrderShipped(order, fulfillment, shippedBy, tx = prisma) {
    try {
      await activityService.createActivity(
        {
          actorUserId: shippedBy?.id,
          entityType: 'ORDER',
          entityId: order.id,
          action: 'ORDER_SHIPPED',
          description: `Order ${order.orderNumber} has been shipped via ${fulfillment.carrier || 'Standard Carrier'}`,
          metadata: {
            orderNumber: order.orderNumber,
            trackingNumber: fulfillment.trackingNumber,
            carrier: fulfillment.carrier,
          },
        },
        tx
      );

      const recipientIds = [];
      if (order.salesRepId) recipientIds.push(order.salesRepId);

      await notificationService.sendNotificationsToUsers(
        recipientIds,
        {
          type: 'ORDER_SHIPPED',
          priority: 'NORMAL',
          title: 'Order shipped',
          message: `Order ${order.orderNumber} has been shipped.${fulfillment.trackingNumber ? ` Tracking: ${fulfillment.trackingNumber}` : ''}`,
          entityType: 'ORDER',
          entityId: order.id,
          actionUrl: `/orders/${order.id}`,
          idempotencyKey: `ORDER_SHIPPED:${order.id}`,
        },
        tx
      );
    } catch (err) {
      logger.error('Error in handleOrderShipped:', err);
    }
  },

  /**
   * 9. Order delivered
   */
  async handleOrderDelivered(order, fulfillment, deliveredBy, tx = prisma) {
    try {
      await activityService.createActivity(
        {
          actorUserId: deliveredBy?.id,
          entityType: 'ORDER',
          entityId: order.id,
          action: 'ORDER_DELIVERED',
          description: `Order ${order.orderNumber} was marked as delivered`,
          metadata: {
            orderNumber: order.orderNumber,
            deliveredAt: fulfillment.deliveredAt,
          },
        },
        tx
      );

      const recipientIds = [];
      if (order.salesRepId) recipientIds.push(order.salesRepId);

      await notificationService.sendNotificationsToUsers(
        recipientIds,
        {
          type: 'ORDER_DELIVERED',
          priority: 'NORMAL',
          title: 'Order delivered',
          message: `Order ${order.orderNumber} has been delivered.`,
          entityType: 'ORDER',
          entityId: order.id,
          actionUrl: `/orders/${order.id}`,
          idempotencyKey: `ORDER_DELIVERED:${order.id}`,
        },
        tx
      );
    } catch (err) {
      logger.error('Error in handleOrderDelivered:', err);
    }
  },

  /**
   * 10. Invoice issued
   */
  async handleInvoiceIssued(invoice, issuedBy, tx = prisma) {
    try {
      await activityService.createActivity(
        {
          actorUserId: issuedBy?.id,
          entityType: 'INVOICE',
          entityId: invoice.id,
          action: 'INVOICE_ISSUED',
          description: `Invoice ${invoice.invoiceNumber} issued for $${Number(invoice.totalAmount).toFixed(2)}`,
          metadata: {
            invoiceNumber: invoice.invoiceNumber,
            totalAmount: Number(invoice.totalAmount),
            dueDate: invoice.dueDate,
          },
        },
        tx
      );

      const financeIds = await this.findUserIdsByRoles(['FINANCE', 'ADMIN'], tx);
      const recipientIds = [...financeIds];
      let repId = invoice.order?.salesRepId;
      if (!repId && invoice.orderId) {
        const ord = await tx.order.findUnique({
          where: { id: invoice.orderId },
          select: { salesRepId: true },
        });
        repId = ord?.salesRepId;
      }
      if (repId) {
        recipientIds.push(repId);
      }

      await notificationService.sendNotificationsToUsers(
        recipientIds,
        {
          type: 'INVOICE_ISSUED',
          priority: 'NORMAL',
          title: 'Invoice issued',
          message: `Invoice ${invoice.invoiceNumber} has been issued.`,
          entityType: 'INVOICE',
          entityId: invoice.id,
          actionUrl: `/invoices/${invoice.id}`,
          idempotencyKey: `INVOICE_ISSUED:${invoice.id}`,
        },
        tx
      );
    } catch (err) {
      logger.error('Error in handleInvoiceIssued:', err);
    }
  },

  /**
   * 11. Invoice overdue
   */
  async handleInvoiceOverdue(invoice, tx = prisma) {
    try {
      await activityService.createActivity(
        {
          actorUserId: null,
          entityType: 'INVOICE',
          entityId: invoice.id,
          action: 'INVOICE_OVERDUE',
          description: `Invoice ${invoice.invoiceNumber} is overdue (Outstanding: $${Number(invoice.outstandingAmount).toFixed(2)})`,
          metadata: {
            invoiceNumber: invoice.invoiceNumber,
            outstandingAmount: Number(invoice.outstandingAmount),
            dueDate: invoice.dueDate,
          },
        },
        tx
      );

      const financeIds = await this.findUserIdsByRoles(['FINANCE', 'ADMIN'], tx);
      const todayDate = new Date().toISOString().slice(0, 10);

      await notificationService.sendNotificationsToUsers(
        financeIds,
        {
          type: 'INVOICE_OVERDUE',
          priority: 'HIGH',
          title: 'Invoice overdue',
          message: `Invoice ${invoice.invoiceNumber} is overdue with balance $${Number(invoice.outstandingAmount).toFixed(2)}.`,
          entityType: 'INVOICE',
          entityId: invoice.id,
          actionUrl: `/invoices/${invoice.id}`,
          idempotencyKey: `INVOICE_OVERDUE:${invoice.id}:${todayDate}`,
        },
        tx
      );
    } catch (err) {
      logger.error('Error in handleInvoiceOverdue:', err);
    }
  },

  /**
   * 12. Payment received
   */
  async handlePaymentReceived(payment, invoice, recordedBy, tx = prisma) {
    try {
      await activityService.createActivity(
        {
          actorUserId: recordedBy?.id,
          entityType: 'PAYMENT',
          entityId: payment.id,
          action: 'PAYMENT_RECEIVED',
          description: `Payment of $${Number(payment.amount).toFixed(2)} received for invoice ${invoice.invoiceNumber}`,
          metadata: {
            paymentNumber: payment.paymentNumber,
            invoiceNumber: invoice.invoiceNumber,
            amount: Number(payment.amount),
            paymentMethod: payment.paymentMethod,
          },
        },
        tx
      );

      const financeIds = await this.findUserIdsByRoles(['FINANCE', 'ADMIN'], tx);
      const recipientIds = [...financeIds];
      let repId = invoice.order?.salesRepId;
      if (!repId && invoice.orderId) {
        const ord = await tx.order.findUnique({
          where: { id: invoice.orderId },
          select: { salesRepId: true },
        });
        repId = ord?.salesRepId;
      }
      if (repId) {
        recipientIds.push(repId);
      }

      await notificationService.sendNotificationsToUsers(
        recipientIds,
        {
          type: 'PAYMENT_RECEIVED',
          priority: 'NORMAL',
          title: 'Payment received',
          message: `Payment of $${Number(payment.amount).toFixed(2)} received for invoice ${invoice.invoiceNumber}.`,
          entityType: 'INVOICE',
          entityId: invoice.id,
          actionUrl: `/invoices/${invoice.id}`,
          idempotencyKey: `PAYMENT_RECEIVED:${payment.id}`,
        },
        tx
      );
    } catch (err) {
      logger.error('Error in handlePaymentReceived:', err);
    }
  },

  /**
   * 13. Payment failed
   */
  async handlePaymentFailed(payment, invoice, recordedBy, tx = prisma) {
    try {
      await activityService.createActivity(
        {
          actorUserId: recordedBy?.id,
          entityType: 'PAYMENT',
          entityId: payment.id,
          action: 'PAYMENT_FAILED',
          description: `Payment failed for invoice ${invoice.invoiceNumber}`,
          metadata: {
            paymentNumber: payment.paymentNumber,
            invoiceNumber: invoice.invoiceNumber,
          },
        },
        tx
      );

      const financeIds = await this.findUserIdsByRoles(['FINANCE', 'ADMIN'], tx);
      await notificationService.sendNotificationsToUsers(
        financeIds,
        {
          type: 'PAYMENT_FAILED',
          priority: 'HIGH',
          title: 'Payment failed',
          message: `Payment failed for invoice ${invoice.invoiceNumber}.`,
          entityType: 'INVOICE',
          entityId: invoice.id,
          actionUrl: `/invoices/${invoice.id}`,
          idempotencyKey: `PAYMENT_FAILED:${payment.id}`,
        },
        tx
      );
    } catch (err) {
      logger.error('Error in handlePaymentFailed:', err);
    }
  },

  /**
   * 14. Invoice fully paid
   */
  async handleInvoicePaid(invoice, recordedBy, tx = prisma) {
    try {
      await activityService.createActivity(
        {
          actorUserId: recordedBy?.id,
          entityType: 'INVOICE',
          entityId: invoice.id,
          action: 'INVOICE_PAID',
          description: `Invoice ${invoice.invoiceNumber} is fully paid`,
          metadata: {
            invoiceNumber: invoice.invoiceNumber,
            totalAmount: Number(invoice.totalAmount),
          },
        },
        tx
      );

      const financeIds = await this.findUserIdsByRoles(['FINANCE', 'ADMIN'], tx);
      const recipientIds = [...financeIds];
      let repId = invoice.order?.salesRepId;
      if (!repId && invoice.orderId) {
        const ord = await tx.order.findUnique({
          where: { id: invoice.orderId },
          select: { salesRepId: true },
        });
        repId = ord?.salesRepId;
      }
      if (repId) {
        recipientIds.push(repId);
      }

      await notificationService.sendNotificationsToUsers(
        recipientIds,
        {
          type: 'INVOICE_PAID',
          priority: 'NORMAL',
          title: 'Invoice fully paid',
          message: `Invoice ${invoice.invoiceNumber} has been paid in full.`,
          entityType: 'INVOICE',
          entityId: invoice.id,
          actionUrl: `/invoices/${invoice.id}`,
          idempotencyKey: `INVOICE_PAID:${invoice.id}`,
        },
        tx
      );
    } catch (err) {
      logger.error('Error in handleInvoicePaid:', err);
    }
  },

  /**
   * 15. Periodic/batch generator for overdue invoices
   */
  async generateOverdueInvoiceNotifications() {
    const now = new Date();
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        dueDate: { lt: now },
        status: { in: ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'] },
        outstandingAmount: { gt: 0 },
      },
      include: {
        order: { select: { salesRepId: true } },
      },
    });

    let notifiedCount = 0;
    for (const invoice of overdueInvoices) {
      await this.handleInvoiceOverdue(invoice);
      notifiedCount++;
    }

    return {
      processedCount: overdueInvoices.length,
      notifiedCount,
    };
  },
};
