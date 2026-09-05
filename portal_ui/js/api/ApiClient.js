/**
 * DealFlow360 - ApiClient
 * Universal HTTP transport, authentication interceptor, 401 silent refresh,
 * exponential backoff retry, and RFC 7807 error normalization.
 */
(function(root) {
  'use strict';

  let PortalApiError = (root && root.DFApi && root.DFApi.PortalApiError);
  let TokenStore = (root && root.DFApi && root.DFApi.TokenStore);
  let QueryCache = (root && root.DFApi && root.DFApi.QueryCache);

  if (typeof require !== 'undefined') {
    PortalApiError = PortalApiError || require('./PortalApiError').PortalApiError;
    TokenStore = TokenStore || require('./TokenStore').TokenStore;
    QueryCache = QueryCache || require('./QueryCache').QueryCache;
  }

  class ApiClient {
    constructor(options) {
      const opts = options || {};
      this.baseUrl = opts.baseUrl || '/api/v1/portal';
      this.timeoutMs = opts.timeoutMs || 15000;
      this.clientVersion = opts.clientVersion || '2026.1';
      this.tokenStore = opts.tokenStore || new TokenStore();
      this.cache = opts.cache || new QueryCache();
      this.onAuthExpired = opts.onAuthExpired || (() => {});
      this.maxRetries = opts.maxRetries !== undefined ? opts.maxRetries : 2;
      this._isRefreshing = false;
      this._refreshSubscribers = [];
    }

    /**
     * Subscribe callbacks waiting for token refresh completion
     */
    _subscribeTokenRefresh(cb) {
      this._refreshSubscribers.push(cb);
    }

    /**
     * Notify queued requests with new token
     */
    _onRefreshed(newToken) {
      this._refreshSubscribers.forEach(cb => cb(newToken));
      this._refreshSubscribers = [];
    }

    /**
     * Build URL with query params
     */
    buildUrl(endpoint, params) {
      const base = this.baseUrl.startsWith('http')
        ? this.baseUrl
        : `${(typeof window !== 'undefined' && window.location ? window.location.origin : 'http://127.0.0.1')}${this.baseUrl}`;

      const fullUrl = new URL(`${base.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`);
      if (params && typeof params === 'object') {
        for (const [key, value] of Object.entries(params)) {
          if (value !== undefined && value !== null && value !== '') {
            fullUrl.searchParams.set(key, String(value));
          }
        }
      }
      return fullUrl.toString();
    }

    /**
     * Core request wrapper
     */
    async request(method, endpoint, options) {
      const opts = options || {};
      const httpMethod = (method || 'GET').toUpperCase();
      const isGet = httpMethod === 'GET' || httpMethod === 'HEAD';

      // 1. Query Cache Check (GET only)
      const cacheKey = opts.cacheKey || (isGet ? [endpoint, opts.params || {}] : null);
      if (isGet && !opts.skipCache && cacheKey) {
        const cached = this.cache.get(cacheKey);
        if (cached !== null) {
          return cached;
        }
      }

      // 2. Prepare Headers
      const headers = Object.assign({
        'Accept': 'application/json',
        'X-Portal-Client-Version': this.clientVersion
      }, opts.headers || {});

      // Content-Type for JSON payloads
      if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof (typeof FormData !== 'undefined' ? FormData : Object))) {
        headers['Content-Type'] = 'application/json';
      }

      // Idempotency Key binding
      if (opts.idempotencyKey) {
        headers['Idempotency-Key'] = opts.idempotencyKey;
      }

      // Token Injection
      const token = opts.token || this.tokenStore.getAccessToken();
      if (token) {
        if (!headers['Authorization'] || opts._isRetryAfterRefresh) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const url = this.buildUrl(endpoint, opts.params);
      let bodyData = opts.body;
      if (bodyData && headers['Content-Type'] === 'application/json' && typeof bodyData !== 'string') {
        bodyData = JSON.stringify(bodyData);
      }

      // 3. Execution with Retry Engine
      const attempts = (isGet || opts.idempotencyKey) ? this.maxRetries + 1 : 1;
      let lastError = null;

      for (let attempt = 0; attempt < attempts; attempt++) {
        try {
          const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
          const timeoutId = controller
            ? setTimeout(() => controller.abort(), opts.timeoutMs || this.timeoutMs)
            : null;

          const fetchOpts = {
            method: httpMethod,
            headers,
            body: isGet ? undefined : bodyData,
            signal: controller ? controller.signal : undefined
          };

          const fetchFn = (typeof fetch !== 'undefined')
            ? fetch
            : (typeof global !== 'undefined' && global.fetch ? global.fetch : null);

          if (!fetchFn) {
            throw new Error("No fetch implementation available in current environment");
          }

          const response = await fetchFn(url, fetchOpts);
          if (timeoutId) clearTimeout(timeoutId);

          // 4. Handle 401 Unauthorized (Silent Refresh Interceptor)
          const isAuthBypass = endpoint.includes('/auth/login') ||
                               endpoint.includes('/auth/refresh') ||
                               endpoint.includes('/auth/magic');
          if (response.status === 401 && !opts._isRetryAfterRefresh && !isAuthBypass) {
            const refreshed = await this._handle401Refresh();
            if (refreshed) {
              const retryOpts = Object.assign({}, opts, { _isRetryAfterRefresh: true });
              return await this.request(method, endpoint, retryOpts);
            }
          }

          // 5. Parse Success / Error
          let responseData = null;
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            responseData = await response.json();
          } else if (contentType.includes('text/')) {
            responseData = await response.text();
          } else {
            // e.g. blob or buffer
            responseData = (typeof response.blob === 'function') ? await response.blob() : await response.text();
          }

          if (!response.ok) {
            throw PortalApiError.fromProblemDetails(responseData, response.status, endpoint);
          }

          // 6. Cache on Success
          if (isGet && cacheKey && opts.ttlMs !== false) {
            this.cache.set(cacheKey, responseData, opts.ttlMs);
          }

          return responseData;

        } catch (err) {
          lastError = (err instanceof PortalApiError) ? err : PortalApiError.networkError(err, endpoint);

          // Only retry if network error or 502/503/504 on idempotent requests
          const canRetry = (lastError.isNetworkError || [502, 503, 504].includes(lastError.status)) && attempt < attempts - 1;
          if (!canRetry) {
            throw lastError;
          }

          // Exponential backoff wait (2^k * 200ms)
          const delay = Math.pow(2, attempt) * 200 + Math.random() * 100;
          await new Promise(r => setTimeout(r, delay));
        }
      }

      throw lastError;
    }

    /**
     * Handle 401 silent token refresh
     */
    async _handle401Refresh() {
      const refreshToken = this.tokenStore.getRefreshToken();
      if (!refreshToken) {
        this.tokenStore.clear();
        this.onAuthExpired();
        return false;
      }

      if (this._isRefreshing) {
        return new Promise(resolve => {
          this._subscribeTokenRefresh(token => resolve(Boolean(token)));
        });
      }

      this._isRefreshing = true;

      try {
        const refreshUrl = this.buildUrl('/auth/refresh');
        const fetchFn = (typeof fetch !== 'undefined') ? fetch : global.fetch;
        const res = await fetchFn(refreshUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.access_token) {
            this.tokenStore.setAccessToken(data.access_token);
            if (data.refresh_token) {
              this.tokenStore.setRefreshToken(data.refresh_token);
            }
            this._isRefreshing = false;
            this._onRefreshed(data.access_token);
            return true;
          }
        }
      } catch (e) {}

      // Refresh failed
      this._isRefreshing = false;
      this.tokenStore.clear();
      this._onRefreshed(null);
      this.onAuthExpired();
      return false;
    }

    // Convenience Shortcuts
    get(endpoint, options) {
      return this.request('GET', endpoint, options);
    }

    post(endpoint, body, options) {
      return this.request('POST', endpoint, Object.assign({}, options, { body }));
    }

    patch(endpoint, body, options) {
      return this.request('PATCH', endpoint, Object.assign({}, options, { body }));
    }

    put(endpoint, body, options) {
      return this.request('PUT', endpoint, Object.assign({}, options, { body }));
    }

    delete(endpoint, options) {
      return this.request('DELETE', endpoint, options);
    }
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ApiClient };
  } else {
    root.DFApi = root.DFApi || {};
    root.DFApi.ApiClient = ApiClient;
  }
})(typeof window !== 'undefined' ? window : this);
