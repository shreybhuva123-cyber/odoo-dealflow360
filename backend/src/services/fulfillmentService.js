import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';
import { recordAuditLog } from '../utils/auditLogger.js';
import { FulfillmentStatus, OrderStatus, UserRole } from '@prisma/client';
import { notificationEvents } from './notificationEvents.js';

export class FulfillmentService {
  /**
   * Validate that actor has permission to perform fulfillment operations (ADMIN, OPERATIONS)
   */
  validateFulfillmentActor(user) {
    if (!user) {
      throw new AppError('Authentication required', 401);
    }
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.OPERATIONS) {
      throw new AppError('Only OPERATIONS and ADMIN users can manage fulfillments', 403);
    }
  }

  // ==========================================
  // 1. CREATE FULFILLMENT
  // ==========================================

  /**
   * Create a new fulfillment record for an order
   */
  async createFulfillment(orderId, user, data = {}) {
    this.validateFulfillmentActor(user);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new AppError('Cannot create fulfillment for a cancelled order', 400);
    }

    const fulfillment = await prisma.fulfillment.create({
      data: {
        orderId,
        status: FulfillmentStatus.PENDING,
        estimatedShipmentCount: data.estimatedShipmentCount || 1,
        estimatedShippingCost: data.estimatedShippingCost || 0.0,
        carrier: data.carrier || null,
        trackingNumber: data.trackingNumber || null,
        notes: data.notes || null,
      },
    });

    await recordAuditLog({
      userId: user.id,
      entityType: 'FULFILLMENT',
      entityId: fulfillment.id,
      action: 'FULFILLMENT_CREATED',
      newValue: {
        orderId,
        status: fulfillment.status,
      },
      reason: `Fulfillment initialized for order ${order.orderNumber}`,
    });

    return fulfillment;
  }

  // ==========================================
  // 2. GET FULFILLMENTS
  // ==========================================

  /**
   * Retrieve fulfillment records for an order
   */
  async getFulfillment(orderId, user) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Role check: sales rep can only view fulfillments for their own orders
    if (user.role === UserRole.SALES_REP && (!order.salesRepId || order.salesRepId !== user.id)) {
      throw new AppError('You do not have permission to view fulfillments for this order', 403);
    }

    return prisma.fulfillment.findMany({
      where: { orderId },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        splits: {
          include: {
            warehouse: true,
            backorders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==========================================
  // 3. UPDATE FULFILLMENT STATUS
  // ==========================================

  /**
   * Pure state machine validator for Fulfillment transitions
   */
  validateFulfillmentTransition(currentStatus, newStatus) {
    if (currentStatus === newStatus) return true;

    if (currentStatus === FulfillmentStatus.DELIVERED) {
      throw new AppError('Delivered fulfillments cannot transition to any other status', 400);
    }

    if (currentStatus === FulfillmentStatus.CANCELLED) {
      throw new AppError('Cancelled fulfillments cannot transition to any other status', 400);
    }

    const ALLOWED_TRANSITIONS = {
      [FulfillmentStatus.PENDING]: [FulfillmentStatus.PROCESSING, FulfillmentStatus.CANCELLED],
      [FulfillmentStatus.PROCESSING]: [
        FulfillmentStatus.SHIPPED,
        FulfillmentStatus.CANCELLED,
        FulfillmentStatus.PARTIALLY_FULFILLED,
      ],
      [FulfillmentStatus.PARTIALLY_FULFILLED]: [
        FulfillmentStatus.FULFILLED,
        FulfillmentStatus.SHIPPED,
        FulfillmentStatus.DELIVERED,
      ],
      [FulfillmentStatus.FULFILLED]: [
        FulfillmentStatus.DELIVERED,
        FulfillmentStatus.SHIPPED,
      ],
      [FulfillmentStatus.SHIPPED]: [FulfillmentStatus.DELIVERED],
      [FulfillmentStatus.DELIVERED]: [],
      [FulfillmentStatus.CANCELLED]: [],
    };

    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new AppError(`Invalid fulfillment status transition from ${currentStatus} to ${newStatus}`, 400);
    }

    return true;
  }

  /**
   * Update fulfillment status and synchronize linked order status
   */
  async updateFulfillmentStatus(fulfillmentId, user, newStatus, notes = null) {
    this.validateFulfillmentActor(user);

    const fulfillment = await prisma.fulfillment.findUnique({
      where: { id: fulfillmentId },
      include: { order: true },
    });

    if (!fulfillment) {
      throw new AppError('Fulfillment not found', 404);
    }

    this.validateFulfillmentTransition(fulfillment.status, newStatus);

    const updated = await prisma.$transaction(async (tx) => {
      const updateData = { status: newStatus };
      if (notes) {
        updateData.notes = fulfillment.notes ? `${fulfillment.notes} | ${notes}` : notes;
      }

      if (newStatus === FulfillmentStatus.SHIPPED) {
        updateData.shippedAt = new Date();
      } else if (newStatus === FulfillmentStatus.DELIVERED) {
        updateData.deliveredAt = new Date();
      }

      const updatedFulfillment = await tx.fulfillment.update({
        where: { id: fulfillmentId },
        data: updateData,
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
        },
      });

      // Synchronize linked Order status atomically
      if (newStatus === FulfillmentStatus.SHIPPED) {
        await tx.order.update({
          where: { id: fulfillment.orderId },
          data: { status: OrderStatus.SHIPPED },
        });
      } else if (newStatus === FulfillmentStatus.DELIVERED) {
        await tx.order.update({
          where: { id: fulfillment.orderId },
          data: { status: OrderStatus.DELIVERED },
        });
      }

      return updatedFulfillment;
    });

    await recordAuditLog({
      userId: user.id,
      entityType: 'FULFILLMENT',
      entityId: fulfillmentId,
      action: 'FULFILLMENT_STATUS_UPDATED',
      oldValue: { status: fulfillment.status },
      newValue: { status: newStatus },
      reason: notes || `Fulfillment status changed from ${fulfillment.status} to ${newStatus}`,
    });

    if (newStatus === FulfillmentStatus.SHIPPED) {
      await recordAuditLog({
        userId: user.id,
        entityType: 'ORDER',
        entityId: fulfillment.orderId,
        action: 'ORDER_SHIPPED',
        oldValue: { status: fulfillment.order.status },
        newValue: { status: OrderStatus.SHIPPED },
        reason: 'Order automatically marked SHIPPED via fulfillment shipment event',
      });
      try {
        await notificationEvents.handleOrderShipped(fulfillment.order, updated, user);
      } catch (err) {
        // Non-fatal
      }
    } else if (newStatus === FulfillmentStatus.DELIVERED) {
      await recordAuditLog({
        userId: user.id,
        entityType: 'ORDER',
        entityId: fulfillment.orderId,
        action: 'ORDER_DELIVERED',
        oldValue: { status: fulfillment.order.status },
        newValue: { status: OrderStatus.DELIVERED },
        reason: 'Order automatically marked DELIVERED via fulfillment delivery event',
      });
      try {
        await notificationEvents.handleOrderDelivered(fulfillment.order, updated, user);
      } catch (err) {
        // Non-fatal
      }
    }

    return updated;
  }

  // ==========================================
  // 4. ASSIGN OPERATOR
  // ==========================================

  /**
   * Assign fulfillment to an operations user
   */
  async assignFulfillment(fulfillmentId, operationsUserId, actorUser) {
    this.validateFulfillmentActor(actorUser);

    const fulfillment = await prisma.fulfillment.findUnique({
      where: { id: fulfillmentId },
    });

    if (!fulfillment) {
      throw new AppError('Fulfillment not found', 404);
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: operationsUserId },
    });

    if (!targetUser) {
      throw new AppError('Operations user not found', 404);
    }

    if (targetUser.role !== UserRole.OPERATIONS && targetUser.role !== UserRole.ADMIN) {
      throw new AppError('Fulfillments can only be assigned to users with OPERATIONS or ADMIN role', 400);
    }

    const updated = await prisma.fulfillment.update({
      where: { id: fulfillmentId },
      data: { assignedToId: operationsUserId },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    await recordAuditLog({
      userId: actorUser.id,
      entityType: 'FULFILLMENT',
      entityId: fulfillmentId,
      action: 'FULFILLMENT_ASSIGNED',
      newValue: { assignedToId: operationsUserId, assignedToName: targetUser.name },
      reason: `Assigned to ${targetUser.name} (${targetUser.role})`,
    });

    try {
      const order = await prisma.order.findUnique({
        where: { id: fulfillment.orderId },
        select: { orderNumber: true },
      });
      await notificationEvents.handleFulfillmentAssigned(
        updated,
        targetUser,
        order?.orderNumber || 'N/A',
        actorUser
      );
    } catch (err) {
      // Non-fatal
    }

    return updated;
  }

  // ==========================================
  // 5. TRACKING INFORMATION
  // ==========================================

  /**
   * Add or update tracking number and carrier on fulfillment
   */
  async addTrackingInformation(fulfillmentId, user, data) {
    this.validateFulfillmentActor(user);

    const fulfillment = await prisma.fulfillment.findUnique({
      where: { id: fulfillmentId },
    });

    if (!fulfillment) {
      throw new AppError('Fulfillment not found', 404);
    }

    const updated = await prisma.fulfillment.update({
      where: { id: fulfillmentId },
      data: {
        trackingNumber: data.trackingNumber,
        carrier: data.carrier,
        notes: data.notes ? (fulfillment.notes ? `${fulfillment.notes} | ${data.notes}` : data.notes) : fulfillment.notes,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    await recordAuditLog({
      userId: user.id,
      entityType: 'FULFILLMENT',
      entityId: fulfillmentId,
      action: 'FULFILLMENT_TRACKING_UPDATED',
      newValue: {
        trackingNumber: data.trackingNumber,
        carrier: data.carrier,
      },
      reason: 'Tracking information updated',
    });

    return updated;
  }

  // ==========================================
  // 6. SHIPPING AND DELIVERY SHORTCUTS
  // ==========================================

  /**
   * Mark order and linked fulfillment as SHIPPED
   */
  async markOrderShipped(orderId, user, data = {}) {
    this.validateFulfillmentActor(user);

    let fulfillment = await prisma.fulfillment.findFirst({
      where: {
        orderId,
        status: { in: [FulfillmentStatus.PENDING, FulfillmentStatus.PROCESSING] },
      },
    });

    if (!fulfillment) {
      fulfillment = await prisma.fulfillment.findFirst({
        where: { orderId },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!fulfillment) {
      fulfillment = await this.createFulfillment(orderId, user, data);
    }

    if (data.trackingNumber && data.carrier) {
      await this.addTrackingInformation(fulfillment.id, user, data);
    }

    return this.updateFulfillmentStatus(fulfillment.id, user, FulfillmentStatus.SHIPPED, data.notes);
  }

  /**
   * Mark order and linked fulfillment as DELIVERED
   */
  async markOrderDelivered(orderId, user) {
    this.validateFulfillmentActor(user);

    let fulfillment = await prisma.fulfillment.findFirst({
      where: {
        orderId,
        status: { in: [FulfillmentStatus.SHIPPED, FulfillmentStatus.PROCESSING, FulfillmentStatus.PENDING] },
      },
    });

    if (!fulfillment) {
      fulfillment = await prisma.fulfillment.findFirst({
        where: { orderId },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!fulfillment) {
      throw new AppError('No fulfillment found for this order', 404);
    }

    return this.updateFulfillmentStatus(fulfillment.id, user, FulfillmentStatus.DELIVERED);
  }
}

export const fulfillmentService = new FulfillmentService();
