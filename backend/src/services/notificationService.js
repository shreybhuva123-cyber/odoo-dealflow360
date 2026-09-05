import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';
import { calculatePagination } from '../utils/pagination.js';

export const notificationService = {
  /**
   * Check if a user has enabled a particular notification type
   */
  async checkNotificationPreference(userId, notificationType) {
    try {
      const pref = await prisma.notificationPreference.findUnique({
        where: {
          userId_notificationType: {
            userId,
            notificationType,
          },
        },
      });
      return pref ? pref.enabled : true;
    } catch (err) {
      logger.error('Error checking notification preference:', err);
      return true;
    }
  },

  /**
   * Update or create a user's notification preference
   */
  async updateNotificationPreference(userId, notificationType, enabled) {
    const pref = await prisma.notificationPreference.upsert({
      where: {
        userId_notificationType: {
          userId,
          notificationType,
        },
      },
      update: { enabled },
      create: {
        userId,
        notificationType,
        enabled,
      },
    });
    return pref;
  },

  /**
   * Get all custom notification preferences for a user
   */
  async getUserNotificationPreferences(userId) {
    return prisma.notificationPreference.findMany({
      where: { userId },
      orderBy: { notificationType: 'asc' },
    });
  },

  /**
   * Create a single notification with preference & idempotency checks
   */
  async createNotification(data, tx = prisma) {
    const {
      userId,
      type,
      priority = 'NORMAL',
      title,
      message,
      entityType,
      entityId,
      actionUrl,
      idempotencyKey,
    } = data;

    if (!userId) {
      throw new AppError('userId is required to create a notification', 400);
    }

    // Check user preference
    const isEnabled = await this.checkNotificationPreference(userId, type);
    if (!isEnabled) {
      logger.info(`Notification ${type} suppressed for user ${userId} due to user preferences`);
      return null;
    }

    // Check idempotency if key provided
    if (idempotencyKey) {
      const existing = await tx.notification.findUnique({
        where: { idempotencyKey },
      });
      if (existing) {
        logger.info(`Duplicate notification prevented by idempotencyKey: ${idempotencyKey}`);
        return existing;
      }
    }

    try {
      return await tx.notification.create({
        data: {
          userId,
          type,
          priority,
          title,
          message,
          entityType: entityType || null,
          entityId: entityId || null,
          actionUrl: actionUrl || null,
          idempotencyKey: idempotencyKey || null,
        },
      });
    } catch (err) {
      // If unique constraint violated on idempotencyKey concurrently
      if (err.code === 'P2002' && idempotencyKey) {
        return await tx.notification.findUnique({
          where: { idempotencyKey },
        });
      }
      throw err;
    }
  },

  /**
   * Wrapper to send notification to a single user
   */
  async sendNotificationToUser(userId, data, tx = prisma) {
    return this.createNotification({ ...data, userId }, tx);
  },

  /**
   * Send notifications to multiple users (e.g. role-based broadcast)
   */
  async sendNotificationsToUsers(userIds = [], data, tx = prisma) {
    if (!userIds || !userIds.length) return [];
    const uniqueUserIds = [...new Set(userIds)];

    const results = [];
    for (const userId of uniqueUserIds) {
      const key = data.idempotencyKey ? `${data.idempotencyKey}:${userId}` : undefined;
      const notification = await this.createNotification(
        {
          ...data,
          userId,
          idempotencyKey: key,
        },
        tx
      );
      if (notification) {
        results.push(notification);
      }
    }
    return results;
  },

  /**
   * Create notification if user preference is enabled
   */
  async createNotificationIfEnabled(userId, data, tx = prisma) {
    return this.sendNotificationToUser(userId, data, tx);
  },

  /**
   * Get notification by ID with strict ownership validation
   */
  async getNotificationById(notificationId, user) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.userId !== user.id) {
      throw new AppError('Forbidden: You can only access your own notifications', 403);
    }

    return notification;
  },

  /**
   * Get paginated notifications for the authenticated user
   */
  async getUserNotifications(user, filters = {}, pagination = {}) {
    const where = {
      userId: user.id, // Strictly scoped to authenticated user
    };

    if (filters.unreadOnly === true) {
      where.isRead = false;
    }

    if (filters.type) {
      where.type = filters.type;
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

    const [total, notifications] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      notifications,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  },

  /**
   * Mark a single notification as read
   */
  async markNotificationAsRead(notificationId, userId) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.userId !== userId) {
      throw new AppError('Forbidden: You can only update your own notifications', 403);
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  },

  /**
   * Mark all unread notifications for a user as read
   */
  async markAllNotificationsAsRead(userId) {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { count: result.count };
  },

  /**
   * Delete a notification ensuring ownership
   */
  async deleteNotification(notificationId, userId) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.userId !== userId) {
      throw new AppError('Forbidden: You can only delete your own notifications', 403);
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return { success: true, message: 'Notification deleted successfully' };
  },

  /**
   * Get unread notification count for a user
   */
  async getUnreadNotificationCount(userId) {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return { count };
  },
};
