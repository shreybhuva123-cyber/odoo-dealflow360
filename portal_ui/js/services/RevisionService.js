/**
 * DealFlow360 - RevisionService
 * Service managing quotation revision timelines, immutable snapshots, and semantic diffs.
 */
(function(root) {
  'use strict';

  class RevisionService {
    constructor(client) {
      this.client = client;
    }

    /**
     * Fetch chronological revision history list
     */
    async fetchRevisions(quoteId, options) {
      if (!quoteId) throw new Error('quoteId is required');
      const opts = Object.assign({
        ttlMs: 30000,
        cacheKey: ['revisions', quoteId]
      }, options || {});

      return await this.client.get(`/quotes/${quoteId}/revisions`, opts);
    }

    /**
     * Fetch frozen historical revision snapshot
     */
    async fetchRevisionSnapshot(quoteId, revisionId, options) {
      if (!quoteId || !revisionId) throw new Error('quoteId and revisionId are required');
      const opts = Object.assign({
        ttlMs: 60000, // Frozen revisions are immutable
        cacheKey: ['revision_snapshot', quoteId, revisionId]
      }, options || {});

      return await this.client.get(`/quotes/${quoteId}/revisions/${revisionId}`, opts);
    }

    /**
     * Fetch semantic diff between target and base revisions
     */
    async fetchRevisionDiff(quoteId, targetRevisionId, baseRevisionId, options) {
      if (!quoteId || !targetRevisionId) throw new Error('quoteId and targetRevisionId are required');
      const params = {};
      if (baseRevisionId) params.base_revision_id = baseRevisionId;

      const opts = Object.assign({
        params,
        ttlMs: 60000,
        cacheKey: ['revision_diff', quoteId, targetRevisionId, baseRevisionId || 'default']
      }, options || {});

      return await this.client.get(`/quotes/${quoteId}/revisions/${targetRevisionId}/diff`, opts);
    }
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RevisionService };
  } else {
    root.DFServices = root.DFServices || {};
    root.DFServices.RevisionService = RevisionService;
  }
})(typeof window !== 'undefined' ? window : this);
