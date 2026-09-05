/**
 * DealFlow360 - QueryCache
 * In-memory TTL cache with selective query invalidation and optimistic updates.
 */
(function(root) {
  'use strict';

  class QueryCache {
    constructor(options) {
      const opts = options || {};
      this.defaultTtlMs = opts.defaultTtlMs || 30000; // 30s default TTL
      this._store = new Map();
    }

    /**
     * Normalize key into stable string
     */
    generateKey(key) {
      if (typeof key === 'string') return key;
      if (Array.isArray(key)) {
        return key.map(k => (typeof k === 'object' && k !== null ? JSON.stringify(k) : String(k))).join('::');
      }
      if (typeof key === 'object' && key !== null) {
        return JSON.stringify(key);
      }
      return String(key);
    }

    get(key) {
      const k = this.generateKey(key);
      const entry = this._store.get(k);
      if (!entry) return null;

      const now = Date.now();
      if (now - entry.timestamp > entry.ttlMs) {
        this._store.delete(k);
        return null;
      }

      return entry.data;
    }

    set(key, data, ttlMs) {
      const k = this.generateKey(key);
      this._store.set(k, {
        data,
        timestamp: Date.now(),
        ttlMs: ttlMs !== undefined ? ttlMs : this.defaultTtlMs
      });
    }

    has(key) {
      return this.get(key) !== null;
    }

    delete(key) {
      const k = this.generateKey(key);
      return this._store.delete(k);
    }

    clear() {
      this._store.clear();
    }

    /**
     * Invalidate specific keys or keys matching a prefix prefixArray / string
     * e.g. invalidate(['quotes']) clears 'quotes::{"page":1}', 'quotes::{"status":"sent"}'
     */
    invalidate(prefixOrKey) {
      const prefix = Array.isArray(prefixOrKey) ? prefixOrKey.join('::') : String(prefixOrKey);
      let count = 0;
      for (const k of this._store.keys()) {
        if (k === prefix || k.startsWith(`${prefix}::`) || k.startsWith(prefix)) {
          this._store.delete(k);
          count++;
        }
      }
      return count;
    }

    /**
     * Apply optimistic update to cache, returning a rollback function
     */
    optimisticUpdate(key, updaterFn) {
      const k = this.generateKey(key);
      const current = this.get(key);
      const updated = updaterFn(current);
      this.set(key, updated);

      return () => {
        if (current === null) {
          this.delete(key);
        } else {
          this.set(key, current);
        }
      };
    }
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QueryCache };
  } else {
    root.DFApi = root.DFApi || {};
    root.DFApi.QueryCache = QueryCache;
  }
})(typeof window !== 'undefined' ? window : this);
