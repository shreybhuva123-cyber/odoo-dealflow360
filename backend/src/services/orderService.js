import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';
import { recordAuditLog } from '../utils/auditLogger.js';
import { formatPagination, getPaginationParams } from '../utils/pagination.js';
import { QuoteStatus, OrderStatus, FulfillmentStatus, UserRole } from '@prisma/client';
import { notificationEvents } from './notificationEvents.js';

export class OrderService {
  // ==========================================
  // 1. ORDER NUMBER GENERATION
  // ==========================================

  /**
   * Generate unique, human-readable, database-safe order number (e.g. ORD-2026-000001)
   * @param {object} [tx] Optional Prisma transaction client
   * @returns {Promise<string>}
   */
  async generateOrderNumber(tx) {
    const db = tx || prisma;
    const year = new Date().getFullYear();
    const prefix = `ORD-${year}-`;

    const latest = await db.order.findFirst({
      where: { orderNumber: { startsWith: prefix } },
      orderBy: { orderNumber: 'desc' },
      select: { orderNumber: true },
    });

    let nextSeq = 1;
    if (latest && latest.orderNumber) {
      const parts = latest.orderNumber.split('-');
      if (parts.length === 3) {
        const parsed = parseInt(parts[2], 10);
        if (!isNaN(parsed)) {
          nextSeq = parsed + 1;
        }
      }
    }

    let candidate = `${prefix}${String(nextSeq).padStart(6, '0')}`;
    let exists = await db.order.findUnique({ where: { orderNumber: candidate }, select: { id: true } });
    while (exists) {
      nextSeq += 1;
      candidate = `${prefix}${String(nextSeq).padStart(6, '0')}`;
      exists = await db.order.findUnique({ where: { orderNumber: candidate }, select: { id: true } });
    }

    return candidate;
  }

  // ==========================================
  // 2. CREATE ORDER FROM QUOTATION
  // ==========================================

  /**
   * Convert an APPROVED quotation into an immutable order snapshot inside a transaction
   * @param {string} quotationId
   * @param {object} user Authenticated user
   * @param {object} [payload] Optional non-financial client data (e.g. notes)
   */
  async createOrderFromQuotation(quotationId, user, payload = {}) {
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        customer: true,
        order: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!quotation) {
      throw new AppError('Quotation not found', 404);
    }

    // RBAC: Sales Reps can only convert their own quotations
    if (user.role === UserRole.SALES_REP && quotation.salesRepId !== user.id) {
      throw new AppError('You do not have permission to create an order from this quotation', 403);
    }

    // Duplicate protection check #1
    if (quotation.order || quotation.status === QuoteStatus.CONFIRMED) {
      throw new AppError('An order has already been created for this quotation', 409);
    }

    // Status check: only APPROVED quotations can become orders
    if (quotation.status !== QuoteStatus.APPROVED) {
      if (quotation.status === QuoteStatus.DRAFT) {
        throw new AppError('Only APPROVED quotations can be converted to an order. Quotation is in DRAFT status', 400);
      }
      if (quotation.status === QuoteStatus.PENDING_APPROVAL) {
        throw new AppError('Only APPROVED quotations can be converted to an order. Quotation is currently PENDING_APPROVAL', 400);
      }
      if (quotation.status === QuoteStatus.REJECTED) {
        throw new AppError('Rejected quotations cannot be converted to an order', 400);
      }
      if (quotation.status === QuoteStatus.CANCELLED) {
        throw new AppError('Cancelled quotations cannot be converted to an order', 400);
      }
      throw new AppError(`Only APPROVED quotations can be converted to an order. Current status is ${quotation.status}`, 400);
    }

    // Must have items
    if (!quotation.items || quotation.items.length === 0) {
      throw new AppError('Quotation must contain at least one line item to generate an order', 400);
    }

    // Execute atomic creation transaction
    const order = await prisma.$transaction(async (tx) => {
      // Concurrency check #2 inside transaction
      const duplicateCheck = await tx.order.findUnique({
        where: { quotationId },
      });
      if (duplicateCheck) {
        throw new AppError('An order has already been created for this quotation', 409);
      }

      const orderNumber = await this.generateOrderNumber(tx);

      // Financial values strictly copied from approved quotation (never from client payload)
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          quotationId: quotation.id,
          customerId: quotation.customerId,
          salesRepId: quotation.salesRepId,
          status: OrderStatus.CONFIRMED,
          subtotal: quotation.subtotal,
          discountAmount: quotation.discountAmount,
          taxAmount: quotation.taxAmount,
          totalAmount: quotation.totalAmount,
          currency: 'USD',
          notes: payload.notes || null,
        },
      });

      // Snapshot line items with historical values
      const itemsData = quotation.items.map((item) => ({
        orderId: newOrder.id,
        productId: item.productId,
        variantId: item.variantId || null,
        productNameSnapshot: item.product ? item.product.name : 'Quoted Product',
        skuSnapshot: item.product ? item.product.sku : null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercentage: item.discountPercentage,
        discountAmount: item.discountAmount,
        taxAmount: item.taxAmount,
        lineTotal: item.lineTotal,
        costPrice: item.costPrice,
        isRecurring: false,
      }));

      await tx.orderItem.createMany({
        data: itemsData,
      });

      // Update quotation status to CONFIRMED
      await tx.quotation.update({
        where: { id: quotation.id },
        data: { status: QuoteStatus.CONFIRMED },
      });

      // Initialize default Fulfillment record for the order
      const fulfillment = await tx.fulfillment.create({
        data: {
          orderId: newOrder.id,
          status: FulfillmentStatus.PENDING,
          estimatedShipmentCount: 1,
          estimatedShippingCost: 0,
        },
      });

      return {
        ...newOrder,
        fulfillments: [fulfillment],
      };
    });

    // Write audit log entry
    await recordAuditLog({
      userId: user.id,
      entityType: 'ORDER',
      entityId: order.id,
      action: 'ORDER_CREATED',
      newValue: {
        orderNumber: order.orderNumber,
        quotationId,
        totalAmount: order.totalAmount,
        status: order.status,
      },
      reason: `Order created from approved quotation ${quotation.quoteNumber || quotationId}`,
    });

    try {
      await notificationEvents.handleOrderCreated(order, user);
    } catch (notifErr) {
      // Non-fatal
    }

    return this.getOrderById(order.id, user);
  }

  // ==========================================
  // 3. RETRIEVAL & FILTERING
  // ==========================================

  /**
   * Retrieve paginated orders with filters and RBAC
   */
  async getOrders(filters = {}, pagination = {}, user) {
    const { page, limit, skip } = getPaginationParams(pagination, 10, 100);

    const where = {};

    // RBAC: Sales Reps only see orders assigned to them
    if (user.role === UserRole.SALES_REP) {
      where.salesRepId = user.id;
    } else if (filters.salesRepId) {
      where.salesRepId = filters.salesRepId;
    }

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search && filters.search.trim()) {
      const term = filters.search.trim();
      where.OR = [
        { orderNumber: { contains: term, mode: 'insensitive' } },
        { customer: { companyName: { contains: term, mode: 'insensitive' } } },
        { quotation: { quoteNumber: { contains: term, mode: 'insensitive' } } },
      ];
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const orderBy = {};
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';
    orderBy[sortBy] = sortOrder;

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          customer: {
            select: {
              id: true,
              companyName: true,
              contactName: true,
              email: true,
              customerTier: true,
            },
          },
          salesRep: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          quotation: {
            select: {
              id: true,
              quoteNumber: true,
            },
          },
          items: true,
          fulfillments: true,
        },
      }),
    ]);

    return {
      orders,
      pagination: formatPagination(total, page, limit),
    };
  }

  /**
   * Retrieve order by ID with RBAC check
   */
  async getOrderById(orderId, user) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            email: true,
            phone: true,
            customerTier: true,
          },
        },
        salesRep: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        quotation: {
          select: {
            id: true,
            quoteNumber: true,
            status: true,
            salesRepId: true,
            createdAt: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
            variant: {
              select: {
                id: true,
                attribute: true,
                value: true,
              },
            },
          },
        },
        fulfillments: {
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    this.validateOrderAccess(order, user);

    return order;
  }

  /**
   * Retrieve order by human-readable order number with RBAC check
   */
  async getOrderByNumber(orderNumber, user) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        customer: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            email: true,
            customerTier: true,
          },
        },
        salesRep: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        quotation: {
          select: {
            id: true,
            quoteNumber: true,
          },
        },
        items: true,
        fulfillments: true,
      },
    });

    if (!order) {
      throw new AppError(`Order ${orderNumber} not found`, 404);
    }

    this.validateOrderAccess(order, user);

    return order;
  }

  /**
   * Update non-financial order metadata (e.g. notes)
   */
  async updateOrder(orderId, userId, data) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const updateData = {};
    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return updated;
  }

  // ==========================================
  // 4. STATUS MANAGEMENT & STATE TRANSITIONS
  // ==========================================

  /**
   * Pure state machine validator for Order transitions
   */
  validateOrderStatusTransition(currentStatus, newStatus) {
    if (currentStatus === newStatus) return true;

    if (currentStatus === OrderStatus.DELIVERED) {
      throw new AppError('Delivered orders cannot transition to any other status', 400);
    }

    if (currentStatus === OrderStatus.CANCELLED) {
      throw new AppError('Cancelled orders cannot be reopened or transitioned to any other status', 400);
    }

    const ALLOWED_TRANSITIONS = {
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [
        OrderStatus.READY_FOR_FULFILLMENT,
        OrderStatus.SHIPPED,
        OrderStatus.CANCELLED,
        OrderStatus.FULFILLING,
      ],
      [OrderStatus.READY_FOR_FULFILLMENT]: [
        OrderStatus.SHIPPED,
        OrderStatus.CANCELLED,
        OrderStatus.FULFILLING,
      ],
      [OrderStatus.FULFILLING]: [
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
        OrderStatus.PARTIALLY_FULFILLED,
        OrderStatus.FULFILLED,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.PARTIALLY_FULFILLED]: [
        OrderStatus.FULFILLED,
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
      ],
      [OrderStatus.FULFILLED]: [OrderStatus.DELIVERED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new AppError(`Invalid order status transition from ${currentStatus} to ${newStatus}`, 400);
    }

    return true;
  }

  /**
   * Update order status with state machine checks and audit logging
   */
  async updateOrderStatus(orderId, user, newStatus, notes = null) {
    // RBAC: Operations and Admin manage status transitions
    if (user.role === UserRole.SALES_REP) {
      throw new AppError('Sales representatives cannot change order fulfillment status', 403);
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    this.validateOrderStatusTransition(order.status, newStatus);

    const updateData = { status: newStatus };
    if (notes) {
      updateData.notes = order.notes ? `${order.notes} | ${notes}` : notes;
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    await recordAuditLog({
      userId: user.id,
      entityType: 'ORDER',
      entityId: orderId,
      action: 'ORDER_STATUS_UPDATED',
      oldValue: { status: order.status },
      newValue: { status: newStatus },
      reason: notes || `Status changed from ${order.status} to ${newStatus}`,
    });

    try {
      await notificationEvents.handleOrderStatusChanged(updated, order.status, newStatus, user);
    } catch (notifErr) {
      // Non-fatal
    }

    return updated;
  }

  /**
   * Cancel an order with required reason, cancelling pending fulfillments
   */
  async cancelOrder(orderId, user, reason) {
    if (!reason || reason.trim().length < 3) {
      throw new AppError('Cancellation reason must be at least 3 characters', 400);
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { fulfillments: true },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    this.validateOrderAccess(order, user);

    if (order.status === OrderStatus.DELIVERED) {
      throw new AppError('Delivered orders cannot be cancelled', 400);
    }
    if (order.status === OrderStatus.SHIPPED) {
      throw new AppError('Shipped orders cannot be cancelled', 400);
    }
    if (order.status === OrderStatus.CANCELLED) {
      throw new AppError('Order is already cancelled', 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const cancelledOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          notes: order.notes ? `${order.notes} | Cancellation Reason: ${reason}` : `Cancellation Reason: ${reason}`,
        },
      });

      // Mark any active fulfillments as CANCELLED
      await tx.fulfillment.updateMany({
        where: {
          orderId,
          status: { in: [FulfillmentStatus.PENDING, FulfillmentStatus.PROCESSING] },
        },
        data: {
          status: FulfillmentStatus.CANCELLED,
          notes: `Order cancelled: ${reason}`,
        },
      });

      return cancelledOrder;
    });

    await recordAuditLog({
      userId: user.id,
      entityType: 'ORDER',
      entityId: orderId,
      action: 'ORDER_CANCELLED',
      oldValue: { status: order.status },
      newValue: { status: OrderStatus.CANCELLED },
      reason,
    });

    try {
      await notificationEvents.handleOrderStatusChanged(updated, order.status, OrderStatus.CANCELLED, user);
    } catch (notifErr) {
      // Non-fatal
    }

    return updated;
  }

  // ==========================================
  // 5. ACCESS CONTROL & UTILITIES
  // ==========================================

  /**
   * Validate user access to an order based on role and ownership
   */
  validateOrderAccess(order, user) {
    if (!user) {
      throw new AppError('Authentication required', 401);
    }

    if (
      user.role === UserRole.ADMIN ||
      user.role === UserRole.SALES_MANAGER ||
      user.role === UserRole.FINANCE ||
      user.role === UserRole.OPERATIONS
    ) {
      return true;
    }

    if (user.role === UserRole.SALES_REP) {
      const repId = order.salesRepId || (order.quotation && order.quotation.salesRepId);
      if (!repId || repId !== user.id) {
        throw new AppError('You do not have permission to view this order', 403);
      }
      return true;
    }

    throw new AppError('You do not have permission to view this order', 403);
  }

  /**
   * Get order items for an order
   */
  async getOrderItems(orderId, user) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    this.validateOrderAccess(order, user);

    return prisma.orderItem.findMany({
      where: { orderId },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        variant: { select: { id: true, attribute: true, value: true } },
      },
    });
  }

  /**
   * Get all orders for a specific customer with RBAC
   */
  async getCustomerOrders(customerId, user) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const where = { customerId };
    if (user.role === UserRole.SALES_REP) {
      where.salesRepId = user.id;
    }

    return prisma.order.findMany({
      where,
      include: {
        items: true,
        fulfillments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Helper to recalculate order totals
   */
  calculateOrderTotals(orderItems) {
    let subtotal = 0;
    let discountAmount = 0;
    let taxAmount = 0;

    for (const item of orderItems) {
      subtotal += Number(item.lineTotal || 0);
      discountAmount += Number(item.discountAmount || 0);
      taxAmount += Number(item.taxAmount || 0);
    }

    const totalAmount = subtotal - discountAmount + taxAmount;

    return {
      subtotal: subtotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    };
  }

  /**
   * Get audit log history for an order
   */
  async getOrderHistory(orderId, user) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    this.validateOrderAccess(order, user);

    return prisma.auditLog.findMany({
      where: {
        entityType: 'ORDER',
        entityId: orderId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}

export const orderService = new OrderService();
