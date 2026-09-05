import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';
import { calculatePagination } from '../utils/pagination.js';

export const activityService = {
  /**
   * Create an activity entry with duplicate protection
   */
  async createActivity(data, tx = prisma) {
    const {
      actorUserId,
      entityType,
      entityId,
      action,
      description,
      metadata = null,
    } = data;

    if (!entityType || !entityId || !action || !description) {
      throw new AppError('entityType, entityId, action, and description are required for activity', 400);
    }

    try {
      // Check duplicate within the last 2 seconds
      const twoSecondsAgo = new Date(Date.now() - 2000);
      const duplicate = await tx.activity.findFirst({
        where: {
          entityType,
          entityId,
          action,
          actorUserId: actorUserId || null,
          createdAt: { gte: twoSecondsAgo },
        },
      });

      if (duplicate) {
        return duplicate;
      }

      return await tx.activity.create({
        data: {
          actorUserId: actorUserId || null,
          entityType,
          entityId,
          action,
          description,
          metadata: metadata ? metadata : undefined,
        },
      });
    } catch (err) {
      logger.error('Failed to create activity log entry:', err);
      // Activity logging failure should not crash business transactions
      return null;
    }
  },

  /**
   * Verify if a user is authorized to view an entity's activity
   */
  async validateEntityAccess(entityType, entityId, user) {
    if (user.role === 'ADMIN' || user.role === 'SALES_MANAGER') {
      return true;
    }

    if (entityType === 'QUOTATION') {
      const quotation = await prisma.quotation.findUnique({
        where: { id: entityId },
        select: { salesRepId: true },
      });
      if (!quotation) throw new AppError('Quotation not found', 404);
      if (user.role === 'SALES_REP' && quotation.salesRepId !== user.id) {
        throw new AppError('Forbidden: Access denied to this quotation activity', 403);
      }
      return true;
    }

    if (entityType === 'ORDER') {
      const order = await prisma.order.findUnique({
        where: { id: entityId },
        select: { salesRepId: true },
      });
      if (!order) throw new AppError('Order not found', 404);
      if (user.role === 'SALES_REP' && order.salesRepId !== user.id) {
        throw new AppError('Forbidden: Access denied to this order activity', 403);
      }
      return true;
    }

    if (entityType === 'INVOICE' || entityType === 'PAYMENT') {
      if (user.role === 'OPERATIONS') {
        throw new AppError('Forbidden: Operations role cannot access financial activity', 403);
      }
      if (user.role === 'SALES_REP') {
        if (entityType === 'INVOICE') {
          const invoice = await prisma.invoice.findUnique({
            where: { id: entityId },
            include: { order: { select: { salesRepId: true } } },
          });
          if (!invoice) throw new AppError('Invoice not found', 404);
          if (invoice.order?.salesRepId !== user.id) {
            throw new AppError('Forbidden: Access denied to this invoice activity', 403);
          }
        } else {
          const payment = await prisma.payment.findUnique({
            where: { id: entityId },
            include: { invoice: { include: { order: { select: { salesRepId: true } } } } },
          });
          if (!payment) throw new AppError('Payment not found', 404);
          if (payment.invoice?.order?.salesRepId !== user.id) {
            throw new AppError('Forbidden: Access denied to this payment activity', 403);
          }
        }
      }
      return true;
    }

    if (entityType === 'CUSTOMER') {
      if (user.role === 'SALES_REP') {
        const hasRelationship = await prisma.order.findFirst({
          where: { customerId: entityId, salesRepId: user.id },
        });
        const hasQuote = await prisma.quotation.findFirst({
          where: { customerId: entityId, salesRepId: user.id },
        });
        if (!hasRelationship && !hasQuote) {
          throw new AppError('Forbidden: Access denied to this customer activity', 403);
        }
      }
      return true;
    }

    return true;
  },

  /**
   * Get single activity by ID with RBAC
   */
  async getActivityById(activityId, user) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        actor: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (!activity) {
      throw new AppError('Activity not found', 404);
    }

    await this.validateEntityAccess(activity.entityType, activity.entityId, user);
    return activity;
  },

  /**
   * Get paginated activities for a specific entity
   */
  async getEntityActivity(entityType, entityId, user, pagination = {}) {
    await this.validateEntityAccess(entityType, entityId, user);

    const where = {
      entityType,
      entityId,
    };

    const { page, limit, skip } = calculatePagination(pagination);

    const [total, activities] = await Promise.all([
      prisma.activity.count({ where }),
      prisma.activity.findMany({
        where,
        include: {
          actor: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      activities,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  },

  /**
   * Get activities performed by a specific user
   */
  async getUserActivity(userId, requestingUser, pagination = {}) {
    if (requestingUser.role === 'SALES_REP' && requestingUser.id !== userId) {
      throw new AppError('Forbidden: You can only view your own user activities', 403);
    }

    const where = {
      actorUserId: userId,
    };

    const { page, limit, skip } = calculatePagination(pagination);

    const [total, activities] = await Promise.all([
      prisma.activity.count({ where }),
      prisma.activity.findMany({
        where,
        include: {
          actor: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      activities,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  },

  /**
   * Get recent activity feed scoped to user role
   */
  async getRecentActivity(user, filters = {}, pagination = {}) {
    const where = {};

    // Role-based activity restrictions
    if (user.role === 'SALES_REP') {
      const [repQuotes, repOrders] = await Promise.all([
        prisma.quotation.findMany({
          where: { salesRepId: user.id },
          select: { id: true },
        }),
        prisma.order.findMany({
          where: { salesRepId: user.id },
          select: { id: true },
        }),
      ]);

      const quoteIds = repQuotes.map((q) => q.id);
      const orderIds = repOrders.map((o) => o.id);

      where.OR = [
        { actorUserId: user.id },
        { entityType: 'QUOTATION', entityId: { in: quoteIds } },
        { entityType: 'ORDER', entityId: { in: orderIds } },
      ];
    } else if (user.role === 'OPERATIONS') {
      // Operations cannot view invoice or payment activities
      where.entityType = { notIn: ['INVOICE', 'PAYMENT'] };
    }

    if (filters.entityType) {
      if (user.role === 'OPERATIONS' && (filters.entityType === 'INVOICE' || filters.entityType === 'PAYMENT')) {
        throw new AppError('Forbidden: Operations role cannot access financial activity', 403);
      }
      where.entityType = filters.entityType;
    }

    if (filters.entityId) {
      where.entityId = filters.entityId;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.actorUserId) {
      if (user.role === 'SALES_REP' && filters.actorUserId !== user.id) {
        throw new AppError('Forbidden: Cannot filter by another actor ID', 403);
      }
      where.actorUserId = filters.actorUserId;
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

    const { page, limit, skip } = calculatePagination(pagination);

    const [total, activities] = await Promise.all([
      prisma.activity.count({ where }),
      prisma.activity.findMany({
        where,
        include: {
          actor: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      activities,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  },

  // Dedicated entity shortcuts
  async getQuotationActivity(quotationId, user, pagination = {}) {
    return this.getEntityActivity('QUOTATION', quotationId, user, pagination);
  },

  async getOrderActivity(orderId, user, pagination = {}) {
    return this.getEntityActivity('ORDER', orderId, user, pagination);
  },

  async getInvoiceActivity(invoiceId, user, pagination = {}) {
    return this.getEntityActivity('INVOICE', invoiceId, user, pagination);
  },

  async getCustomerActivity(customerId, user, pagination = {}) {
    return this.getEntityActivity('CUSTOMER', customerId, user, pagination);
  },
};
