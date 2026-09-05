/**
 * DealFlow360 - NotificationService
 * Service managing user alerts, unread counts, and safe optimistic read-receipts.
 */
(function(root) {
  'use strict';

  class NotificationService {
    constructor(client) {
      this.client = client;
    }

    /**
     * Fetch user notifications list
     */
    async fetchNotifications(options) {
      const opts = Object.assign({
        ttlMs: 10000,
        cacheKey: ['notifications']
      }, options || {});

      return await this.client.get('/notifications', opts);
    }

    /**
     * Mark single notification read with optimistic cache update
     */
    async markNotificationRead(notificationId) {
      if (!notificationId) throw new Error('notificationId is required');

      // Optimistic update
      const rollback = this.client.cache.optimisticUpdate(['notifications'], current => {
        if (!current || !Array.isArray(current.data)) return current;
        return Object.assign({}, current, {
          data: current.data.map(n => n.notification_id === notificationId ? Object.assign({}, n, { is_read: true }) : n)
        });
      });

      try {
        const res = await this.client.patch(`/notifications/${notificationId}/read`, {});
        this.client.cache.invalidate(['notifications']);
        return res;
      } catch (err) {
        if (rollback) rollback();
        throw err;
      }
    }

    /**
     * Mark all notifications read with optimistic cache update
     */
    async markAllNotificationsRead() {
      // Optimistic update
      const rollback = this.client.cache.optimisticUpdate(['notifications'], current => {
        if (!current || !Array.isArray(current.data)) return current;
        return Object.assign({}, current, {
          data: current.data.map(n => Object.assign({}, n, { is_read: true }))
        });
      });

      try {
        const res = await this.client.patch('/notifications/read-all', {});
        this.client.cache.invalidate(['notifications']);
        return res;
      } catch (err) {
        if (rollback) rollback();
        throw err;
      }
    }
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NotificationService };
  } else {
    root.DFServices = root.DFServices || {};
    root.DFServices.NotificationService = NotificationService;
  }
})(typeof window !== 'undefined' ? window : this);
