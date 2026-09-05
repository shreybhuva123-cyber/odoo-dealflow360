/**
 * DealFlow360 - PortalApiError
 * Normalized RFC 7807 Problem Details Error model for Customer Portal.
 */
(function(root) {
  'use strict';

  class PortalApiError extends Error {
    constructor(options) {
      const opts = options || {};
      const message = opts.detail || opts.title || opts.message || `API Error (${opts.status || 500})`;
      super(message);

      this.name = 'PortalApiError';
      this.status = (opts.status !== undefined && opts.status !== null) ? opts.status : 500;
      this.code = opts.code || `HTTP_${this.status}`;
      this.title = opts.title || 'Error';
      this.detail = opts.detail || message;
      this.instance = opts.instance || '';
      this.type = opts.type || `https://errors.dealflow360.com/${this.code.toLowerCase().replace(/_/g, '-')}`;
      this.invalidParams = opts.invalid_params || opts.invalidParams || [];
      this.timestamp = opts.timestamp || new Date().toISOString();
      this.isNetworkError = Boolean(opts.isNetworkError);
      this.rawResponse = opts.rawResponse || null;
    }

    /**
     * Parse raw JSON problem details or HTTP response into PortalApiError
     */
    static fromProblemDetails(json, status, instance) {
      const data = json || {};
      const finalStatus = (data.status !== undefined && data.status !== null)
        ? data.status
        : ((status !== undefined && status !== null) ? status : 500);
      return new PortalApiError({
        status: finalStatus,
        code: data.code || `HTTP_${finalStatus}`,
        title: data.title || (status === 404 ? 'Not Found' : 'API Error'),
        detail: data.detail || data.message || 'An unexpected error occurred.',
        instance: data.instance || instance || '',
        type: data.type || '',
        invalid_params: data.invalid_params || [],
        timestamp: data.timestamp || new Date().toISOString(),
        rawResponse: data
      });
    }

    /**
     * Create representation of client network drop / timeout
     */
    static networkError(originalError, instance) {
      return new PortalApiError({
        status: 0,
        code: 'NETWORK_DISCONNECTED',
        title: 'Network Connectivity Error',
        detail: (originalError && originalError.message) || 'Unable to connect to DealFlow360 server. Please check your internet connection.',
        instance: instance || '',
        isNetworkError: true,
        rawResponse: null
      });
    }

    /**
     * Format into user-friendly toast or alert text
     */
    getUserMessage() {
      if (this.status === 404) return 'The requested quotation or resource was not found.';
      if (this.status === 401) return 'Your session has expired. Please sign in again.';
      if (this.status === 403) return 'You do not have permission to perform this commercial action.';
      if (this.status === 409) return this.detail || 'This quote is currently locked or has been updated.';
      if (this.isNetworkError) return 'Network failure. Retrying connection...';
      return this.detail || this.title;
    }
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PortalApiError };
  } else {
    root.DFApi = root.DFApi || {};
    root.DFApi.PortalApiError = PortalApiError;
  }
})(typeof window !== 'undefined' ? window : this);
