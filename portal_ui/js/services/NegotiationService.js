/**
 * DealFlow360 - NegotiationService
 * Headless service managing live negotiation status, counter-discounts, and change requests.
 */
(function(root) {
  'use strict';

  function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  class NegotiationService {
    constructor(client) {
      this.client = client;
    }

    /**
     * Fetch active negotiation and approval progress status
     */
    async fetchNegotiationStatus(quoteId, options) {
      if (!quoteId) throw new Error('quoteId is required');
      const opts = Object.assign({
        ttlMs: 10000,
        cacheKey: ['negotiation_status', quoteId]
      }, options || {});

      return await this.client.get(`/quotes/${quoteId}/negotiation/status`, opts);
    }

    /**
     * Submit counter-discount proposal
     */
    async submitCounterDiscount(quoteId, payload, options) {
      if (!quoteId) throw new Error('quoteId is required');
      const idempotencyKey = (options && options.idempotencyKey) || generateUUID();
      const opts = Object.assign({}, options || {}, { idempotencyKey });

      const res = await this.client.post(`/quotes/${quoteId}/negotiation/counter-discount`, payload, opts);

      // Invalidate quote detail, listings, and negotiation cache
      this.client.cache.invalidate(['quote', quoteId]);
      this.client.cache.invalidate(['quotes']);
      this.client.cache.invalidate(['negotiation_status', quoteId]);

      return res;
    }

    /**
     * Submit deliverables line change request
     */
    async submitChangeRequest(quoteId, payload, options) {
      if (!quoteId) throw new Error('quoteId is required');
      const idempotencyKey = (options && options.idempotencyKey) || generateUUID();
      const opts = Object.assign({}, options || {}, { idempotencyKey });

      const res = await this.client.post(`/quotes/${quoteId}/negotiation/change-request`, payload, opts);

      // Invalidate quote detail, listings, and negotiation cache
      this.client.cache.invalidate(['quote', quoteId]);
      this.client.cache.invalidate(['quotes']);
      this.client.cache.invalidate(['negotiation_status', quoteId]);

      return res;
    }
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NegotiationService };
  } else {
    root.DFServices = root.DFServices || {};
    root.DFServices.NegotiationService = NegotiationService;
  }
})(typeof window !== 'undefined' ? window : this);
