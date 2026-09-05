/**
 * DealFlow360 - QuoteService
 * Headless API service for fetching and querying quotations.
 * Encapsulates network requests, JWT header binding, parameter serialization, caching, and error normalization.
 */
(function(root) {
  'use strict';

  let ApiClient = (root && root.DFApi && root.DFApi.ApiClient);
  if (typeof require !== 'undefined') {
    ApiClient = ApiClient || require('../api/ApiClient').ApiClient;
  }

  class QuoteService {
    constructor(optionsOrClient) {
      if (optionsOrClient && typeof optionsOrClient.request === 'function') {
        this.client = optionsOrClient;
        this.baseUrl = this.client.baseUrl;
      } else {
        const opts = optionsOrClient || {};
        this.baseUrl = opts.baseUrl || '/api/v1/portal';
        this.getToken = opts.getToken || (() => (typeof localStorage !== 'undefined' ? localStorage.getItem('df_portal_token') : '') || '');
        if (ApiClient) {
          this.client = new ApiClient({
            baseUrl: this.baseUrl,
            tokenStore: { getAccessToken: this.getToken }
          });
        }
      }
    }

    /**
     * Build URL with serialized query parameters (preserves backwards compatibility)
     */
    buildQuotesUrl(params) {
      const origin = (typeof window !== 'undefined' && window.location ? window.location.origin : 'http://127.0.0.1');
      const url = new URL(`${this.baseUrl}/quotes`, origin);
      if (params) {
        if (params.search) url.searchParams.set('search', params.search);
        if (params.status && params.status !== 'all') url.searchParams.set('status', params.status);
        if (params.has_negotiation !== undefined && params.has_negotiation !== null) {
          url.searchParams.set('has_negotiation', String(params.has_negotiation));
        }
        if (params.sort_by) url.searchParams.set('sort_by', params.sort_by);
        if (params.sort_dir) url.searchParams.set('sort_dir', params.sort_dir);
        if (params.page) url.searchParams.set('page', String(params.page));
        if (params.per_page) url.searchParams.set('per_page', String(params.per_page));
      }
      return url.toString();
    }

    /**
     * Fetch quotations list with query parameters
     */
    async fetchQuotes(params, options) {
      if (this.client) {
        const opts = Object.assign({ params, ttlMs: 30000 }, options || {});
        const res = await this.client.get('/quotes', opts);
        if (res && res.data && !res.quotes) {
          res.quotes = res.data;
        }
        return res;
      }

      // Fallback if no ApiClient
      const token = this.getToken ? this.getToken() : '';
      const headers = {
        'Accept': 'application/json',
        'X-Portal-Client-Version': '2026.1'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = this.buildQuotesUrl(params);
      const res = await fetch(url, { method: 'GET', headers });

      if (!res.ok) {
        let errorData = null;
        try {
          errorData = await res.json();
        } catch (e) {
          errorData = { title: 'Network Error', detail: res.statusText };
        }
        const error = new Error(errorData.detail || errorData.title || `HTTP ${res.status}`);
        error.status = res.status;
        error.code = errorData.code || `HTTP_${res.status}`;
        error.problemDetails = errorData;
        throw error;
      }

      return await res.json();
    }

    /**
     * Fetch KPI summary metrics from quotations dataset
     */
    async fetchSummary(options) {
      const res = await this.fetchQuotes({ per_page: 100 }, options);
      const quotes = (res && (res.data || res.quotes)) || [];
      return {
        total_quotes: quotes.length,
        action_required: quotes.filter(q => q.status === 'sent').length,
        in_negotiation: quotes.filter(q => q.status === 'in_negotiation').length,
        active_pipeline_value: quotes.reduce((acc, q) => acc + (q.total_amount || 0), 0),
        executed_orders: quotes.filter(q => q.status === 'approved').length
      };
    }
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuoteService };
  } else {
    root.DFServices = root.DFServices || {};
    root.DFServices.QuoteService = QuoteService;
  }
})(typeof window !== 'undefined' ? window : this);
