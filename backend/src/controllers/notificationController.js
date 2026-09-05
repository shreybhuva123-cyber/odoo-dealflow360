import { notificationService } from '../services/notificationService.js';
import { notificationEvents } from '../services/notificationEvents.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const notificationController = {
  /**
   * GET /api/notifications
   * List notifications for authenticated user
   */
  async getNotifications(req, res, next) {
    try {
      const { page, limit, unreadOnly, type, startDate, endDate } = req.query;
      const pagination = {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
      };
      const filters = {
        unreadOnly: unreadOnly === 'true' || unreadOnly === true,
        type,
        startDate,
        endDate,
      };

      const result = await notificationService.getUserNotifications(req.user, filters, pagination);
      return sendSuccess(res, 'Notifications retrieved successfully', result.notifications, 200, {
        meta: result.meta,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/notifications/unread-count
   * Get unread notification count
   */
  async getUnreadCount(req, res, next) {
    try {
      const countData = await notificationService.getUnreadNotificationCount(req.user.id);
      return sendSuccess(res, 'Unread notification count retrieved successfully', countData);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/notifications/:id
   * Get single notification with ownership check
   */
  async getNotificationById(req, res, next) {
    try {
      const notification = await notificationService.getNotificationById(req.params.id, req.user);
      return sendSuccess(res, 'Notification retrieved successfully', notification);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/notifications/:id/read
   * Mark single notification as read
   */
  async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markNotificationAsRead(req.params.id, req.user.id);
      return sendSuccess(res, 'Notification marked as read', notification);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/notifications/read-all
   * Mark all notifications as read for current user
   */
  async markAllAsRead(req, res, next) {
    try {
      const result = await notificationService.markAllNotificationsAsRead(req.user.id);
      return sendSuccess(res, 'All notifications marked as read', result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/notifications/:id
   * Delete a notification
   */
  async deleteNotification(req, res, next) {
    try {
      const result = await notificationService.deleteNotification(req.params.id, req.user.id);
      return sendSuccess(res, 'Notification deleted successfully', result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/notifications/preferences
   * Get user notification preferences
   */
  async getPreferences(req, res, next) {
    try {
      const preferences = await notificationService.getUserNotificationPreferences(req.user.id);
      return sendSuccess(res, 'Notification preferences retrieved successfully', preferences);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/notifications/preferences
   * Update a notification preference
   */
  async updatePreference(req, res, next) {
    try {
      const { notificationType, enabled } = req.body;
      const updated = await notificationService.updateNotificationPreference(
        req.user.id,
        notificationType,
        enabled
      );
      return sendSuccess(res, 'Notification preference updated successfully', updated);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/notifications/trigger-overdue
   * Trigger batch check for overdue invoices
   */
  async triggerOverdueInvoices(req, res, next) {
    try {
      const summary = await notificationEvents.generateOverdueInvoiceNotifications();
      return sendSuccess(res, 'Overdue invoice notifications processed', summary);
    } catch (err) {
      next(err);
    }
  },
};
