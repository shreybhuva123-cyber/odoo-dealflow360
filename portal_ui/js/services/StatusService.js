/**
 * DealFlow360 - StatusService
 * Background polling coordinator and state change broadcaster for live negotiations.
 */
(function(root) {
  'use strict';

  class StatusService {
    constructor(client, negotiationService) {
      this.client = client;
      this.negotiationService = negotiationService;
      this._activePollers = new Map();
      this._eventListeners = new Map();
    }

    /**
     * Start polling negotiation status for an active quote
     */
    pollNegotiationStatus(quoteId, onUpdate, intervalMs) {
      if (!quoteId) throw new Error('quoteId is required');
      this.stopPolling(quoteId);

      const interval = intervalMs || 10000;
      let isRunning = true;

      const poll = async () => {
        if (!isRunning) return;
        try {
          const statusData = await this.negotiationService.fetchNegotiationStatus(quoteId, { skipCache: true });
          if (typeof onUpdate === 'function') {
            onUpdate(statusData);
          }
          this.emit(`status:${quoteId}`, statusData);
        } catch (e) {
          // Suppress transient poll error
        }
      };

      // Run initial check and schedule interval
      poll();
      const timerId = setInterval(poll, interval);
      this._activePollers.set(quoteId, {
        stop: () => {
          isRunning = false;
          clearInterval(timerId);
        }
      });

      return () => this.stopPolling(quoteId);
    }

    /**
     * Stop polling for a quote
     */
    stopPolling(quoteId) {
      const poller = this._activePollers.get(quoteId);
      if (poller) {
        poller.stop();
        this._activePollers.delete(quoteId);
      }
    }

    /**
     * Stop all active pollers
     */
    stopAll() {
      for (const [quoteId, poller] of this._activePollers.entries()) {
        poller.stop();
      }
      this._activePollers.clear();
    }

    /**
     * Subscribe to status events
     */
    on(event, listener) {
      if (!this._eventListeners.has(event)) {
        this._eventListeners.set(event, []);
      }
      this._eventListeners.get(event).push(listener);
      return () => {
        const listeners = this._eventListeners.get(event) || [];
        this._eventListeners.set(event, listeners.filter(l => l !== listener));
      };
    }

    /**
     * Emit status event
     */
    emit(event, data) {
      const listeners = this._eventListeners.get(event) || [];
      for (const listener of listeners) {
        try {
          listener(data);
        } catch (e) {}
      }
    }
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StatusService };
  } else {
    root.DFServices = root.DFServices || {};
    root.DFServices.StatusService = StatusService;
  }
})(typeof window !== 'undefined' ? window : this);
