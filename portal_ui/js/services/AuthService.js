/**
 * DealFlow360 - AuthService
 * Headless service managing customer authentication, token lifecycle, and signatory rights.
 */
(function(root) {
  'use strict';

  class AuthService {
    constructor(client) {
      this.client = client;
    }

    /**
     * Authenticate via email and password
     */
    async login(email, password) {
      const payload = { email, password };
      const res = await this.client.post('/auth/login', payload, { skipCache: true });
      const accessToken = (res && res.access_token) || (res && res.tokens && res.tokens.access_token);
      const refreshToken = (res && res.refresh_token) || (res && res.tokens && res.tokens.refresh_token);
      if (accessToken) {
        this.client.tokenStore.setAccessToken(accessToken);
      }
      if (refreshToken) {
        this.client.tokenStore.setRefreshToken(refreshToken);
      }
      if (res && res.user) {
        this.client.tokenStore.setUser(res.user);
      }
      return res;
    }

    loginWithPassword(email, password) {
      return this.login(email, password);
    }

    /**
     * Authenticate via 1-click magic link token
     */
    async loginWithMagicLink(magicToken) {
      const payload = { token: magicToken };
      let res;
      try {
        res = await this.client.post('/auth/magic-verify', payload, { skipCache: true });
      } catch (err) {
        if (err.status === 404) {
          res = await this.client.post('/auth/magic-link/verify', payload, { skipCache: true });
        } else {
          throw err;
        }
      }
      const accessToken = (res && res.access_token) || (res && res.tokens && res.tokens.access_token);
      const refreshToken = (res && res.refresh_token) || (res && res.tokens && res.tokens.refresh_token);
      if (accessToken) {
        this.client.tokenStore.setAccessToken(accessToken);
      }
      if (refreshToken) {
        this.client.tokenStore.setRefreshToken(refreshToken);
      }
      if (res && res.user) {
        this.client.tokenStore.setUser(res.user);
      }
      return res;
    }

    /**
     * Manually refresh token
     */
    async refreshToken(refreshTokenOverride) {
      const refreshToken = refreshTokenOverride || this.client.tokenStore.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      const res = await this.client.post('/auth/refresh', { refresh_token: refreshToken }, { skipCache: true });
      const accessToken = (res && res.access_token) || (res && res.tokens && res.tokens.access_token);
      if (accessToken) {
        this.client.tokenStore.setAccessToken(accessToken);
      }
      return res;
    }

    /**
     * Terminate active session
     */
    async logout() {
      try {
        const res = await this.client.post('/auth/logout', {}, { skipCache: true });
        this.client.tokenStore.clear();
        this.client.cache.clear();
        return res;
      } catch (e) {
        this.client.tokenStore.clear();
        this.client.cache.clear();
        return { success: true };
      }
    }

    /**
     * Get authenticated customer profile
     */
    async getCurrentUser(forceRefresh) {
      if (!forceRefresh) {
        const cached = this.client.tokenStore.getUser();
        if (cached) return cached;
      }
      const user = await this.client.get('/auth/me', { ttlMs: 60000, skipCache: Boolean(forceRefresh) });
      this.client.tokenStore.setUser(user);
      return user;
    }

    /**
     * Check whether active user holds legal signatory privilege
     */
    canSignQuotes() {
      const user = this.client.tokenStore.getUser();
      return Boolean(user && user.can_sign_quotes);
    }
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthService };
  } else {
    root.DFServices = root.DFServices || {};
    root.DFServices.AuthService = AuthService;
  }
})(typeof window !== 'undefined' ? window : this);
