/**
 * DealFlow360 - TokenStore
 * Manages JWT access tokens, refresh tokens, and session lifecycle events.
 */
(function(root) {
  'use strict';

  class TokenStore {
    constructor(options) {
      const opts = options || {};
      this.storageKey = opts.storageKey || 'df_portal_access_token';
      this.refreshKey = opts.refreshKey || 'df_portal_refresh_token';
      this.userKey = opts.userKey || 'df_portal_user_profile';
      this._inMemoryAccessToken = null;
      this._inMemoryRefreshToken = null;
      this._inMemoryUser = null;
      this._subscribers = [];

      // Hydrate from storage if available
      this._hydrate();
    }

    _hydrate() {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          this._inMemoryAccessToken = localStorage.getItem(this.storageKey) || null;
          this._inMemoryRefreshToken = localStorage.getItem(this.refreshKey) || null;
          const userStr = localStorage.getItem(this.userKey);
          if (userStr) this._inMemoryUser = JSON.parse(userStr);
        }
      } catch (e) {
        // Fallback to pure in-memory mode if localStorage disabled/blocked
      }
    }

    getAccessToken() {
      return this._inMemoryAccessToken;
    }

    setAccessToken(token) {
      this._inMemoryAccessToken = token || null;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          if (token) localStorage.setItem(this.storageKey, token);
          else localStorage.removeItem(this.storageKey);
        }
      } catch (e) {}
      this._notify('token_changed', { token });
    }

    getRefreshToken() {
      return this._inMemoryRefreshToken;
    }

    setRefreshToken(refreshToken) {
      this._inMemoryRefreshToken = refreshToken || null;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          if (refreshToken) localStorage.setItem(this.refreshKey, refreshToken);
          else localStorage.removeItem(this.refreshKey);
        }
      } catch (e) {}
    }

    getUser() {
      return this._inMemoryUser;
    }

    setUser(user) {
      this._inMemoryUser = user || null;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          if (user) localStorage.setItem(this.userKey, JSON.stringify(user));
          else localStorage.removeItem(this.userKey);
        }
      } catch (e) {}
      this._notify('user_changed', { user });
    }

    hasToken() {
      return Boolean(this._inMemoryAccessToken);
    }

    clear() {
      this._inMemoryAccessToken = null;
      this._inMemoryRefreshToken = null;
      this._inMemoryUser = null;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem(this.storageKey);
          localStorage.removeItem(this.refreshKey);
          localStorage.removeItem(this.userKey);
        }
      } catch (e) {}
      this._notify('session_cleared');
    }

    subscribe(listener) {
      if (typeof listener === 'function') {
        this._subscribers.push(listener);
      }
      return () => {
        this._subscribers = this._subscribers.filter(l => l !== listener);
      };
    }

    _notify(event, payload) {
      for (const listener of this._subscribers) {
        try {
          listener(event, payload);
        } catch (e) {}
      }
    }
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TokenStore };
  } else {
    root.DFApi = root.DFApi || {};
    root.DFApi.TokenStore = TokenStore;
  }
})(typeof window !== 'undefined' ? window : this);
