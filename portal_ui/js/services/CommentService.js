/**
 * DealFlow360 - CommentService
 * Headless service for line-level threaded discussions, unread tracking, and safe optimistic messaging.
 */
(function(root) {
  'use strict';

  class CommentService {
    constructor(client) {
      this.client = client;
    }

    /**
     * Fetch line comments stream
     */
    async fetchLineComments(quoteId, lineId, options) {
      if (!quoteId || !lineId) throw new Error('quoteId and lineId are required');
      const opts = Object.assign({
        ttlMs: 15000,
        cacheKey: ['comments', quoteId, lineId]
      }, options || {});

      const res = await this.client.get(`/quotes/${quoteId}/lines/${lineId}/comments`, opts);
      if (res && res.data && !res.comments) {
        res.comments = res.data;
      }
      return res;
    }

    /**
     * Fetch per-line unread comment summary
     */
    async fetchCommentsSummary(quoteId, options) {
      if (!quoteId) throw new Error('quoteId is required');
      const opts = Object.assign({
        ttlMs: 10000,
        cacheKey: ['comments_summary', quoteId]
      }, options || {});

      return await this.client.get(`/quotes/${quoteId}/comments/summary`, opts);
    }

    /**
     * Fetch all quote comments (customer-visible only)
     */
    async fetchAllQuoteComments(quoteId, options) {
      if (!quoteId) throw new Error('quoteId is required');
      const opts = Object.assign({
        ttlMs: 15000,
        cacheKey: ['all_comments', quoteId]
      }, options || {});

      return await this.client.get(`/quotes/${quoteId}/comments`, opts);
    }

    /**
     * Post a new line-level comment with safe optimistic cache update
     */
    async postLineComment(quoteId, lineId, payload, options) {
      if (!quoteId || !lineId) throw new Error('quoteId and lineId are required');
      const cacheKey = ['comments', quoteId, lineId];

      // Safe Optimistic Update
      let rollback = null;
      if (options && options.optimistic !== false) {
        const user = this.client.tokenStore.getUser() || { name: 'You', type: 'customer' };
        const tempComment = {
          comment_id: `temp_${Date.now()}`,
          quote_id: quoteId,
          line_id: lineId,
          author: {
            id: user.id || 'usr_temp',
            name: user.name || 'You',
            type: 'customer',
            email: user.email || ''
          },
          message: payload.message || '',
          created_at: new Date().toISOString(),
          is_read: true,
          is_optimistic: true
        };

        rollback = this.client.cache.optimisticUpdate(cacheKey, current => {
          const prevData = (current && current.data) ? current.data : [];
          return {
            data: [...prevData, tempComment],
            meta: Object.assign({}, (current && current.meta) || {}, {
              total_comments: prevData.length + 1
            })
          };
        });
      }

      try {
        const serverComment = await this.client.post(`/quotes/${quoteId}/lines/${lineId}/comments`, payload);

        // Invalidate summary and refresh cache
        this.client.cache.invalidate(['comments_summary', quoteId]);
        this.client.cache.invalidate(['comments', quoteId, lineId]);

        return serverComment;
      } catch (err) {
        if (rollback) rollback();
        throw err;
      }
    }

    /**
     * Mark line comments read with safe optimistic badge update
     */
    async markLineCommentsRead(quoteId, lineId) {
      if (!quoteId || !lineId) throw new Error('quoteId and lineId are required');

      // Optimistically clear unread in summary
      const summaryKey = ['comments_summary', quoteId];
      const rollback = this.client.cache.optimisticUpdate(summaryKey, current => {
        if (!current || !Array.isArray(current.lines_summary)) return current;
        return Object.assign({}, current, {
          lines_summary: current.lines_summary.map(s => {
            if (s.line_id === lineId) {
              return Object.assign({}, s, { unread_count: 0 });
            }
            return s;
          })
        });
      });

      try {
        const res = await this.client.patch(`/quotes/${quoteId}/lines/${lineId}/comments/read`, {});
        this.client.cache.invalidate(['comments_summary', quoteId]);
        this.client.cache.invalidate(['comments', quoteId, lineId]);
        return res;
      } catch (err) {
        if (rollback) rollback();
        throw err;
      }
    }
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CommentService };
  } else {
    root.DFServices = root.DFServices || {};
    root.DFServices.CommentService = CommentService;
  }
})(typeof window !== 'undefined' ? window : this);
