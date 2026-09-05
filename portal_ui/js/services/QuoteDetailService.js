/**
 * DealFlow360 - QuoteDetailService
 * Service for fetching granular quotation details, itemized deliverables, and PDF export.
 */
(function(root) {
  'use strict';

  class QuoteDetailService {
    constructor(client) {
      this.client = client;
    }

    /**
     * Fetch complete quotation details by quote ID
     */
    async fetchQuoteDetail(quoteId, options) {
      if (!quoteId) throw new Error('quoteId is required');
      const opts = Object.assign({
        ttlMs: 30000,
        cacheKey: ['quote', quoteId]
      }, options || {});

      return await this.client.get(`/quotes/${quoteId}`, opts);
    }

    /**
     * Fetch contract PDF stream / blob URL
     */
    async downloadQuotePdf(quoteId) {
      if (!quoteId) throw new Error('quoteId is required');
      return await this.client.get(`/quotes/${quoteId}/pdf`, {
        skipCache: true,
        headers: { 'Accept': 'application/pdf' }
      });
    }

    /**
     * Invalidate quote detail in cache
     */
    invalidateQuote(quoteId) {
      this.client.cache.invalidate(['quote', quoteId]);
      this.client.cache.invalidate(['quotes']);
    }
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuoteDetailService };
  } else {
    root.DFServices = root.DFServices || {};
    root.DFServices.QuoteDetailService = QuoteDetailService;
  }
})(typeof window !== 'undefined' ? window : this);
