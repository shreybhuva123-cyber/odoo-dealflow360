import React, { useState, useEffect } from 'react';

export function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showRestoredNotice, setShowRestoredNotice] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestoredNotice(true);
      const timer = setTimeout(() => {
        setShowRestoredNotice(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestoredNotice(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showRestoredNotice) {
    return null;
  }

  if (!isOnline) {
    return (
      <div className="bg-amber-500/90 text-amber-950 px-4 py-1.5 text-xs font-medium flex items-center justify-between shadow-md sticky top-0 z-50 animate-in slide-in-from-top-1 duration-200">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <span className="text-sm">⚠️</span>
          <span>
            <strong>You're currently offline.</strong> DealFlow360 is operating in local cached mode. Actions will be queued until connection is restored.
          </span>
        </div>
      </div>
    );
  }

  if (showRestoredNotice) {
    return (
      <div className="bg-emerald-600 text-white px-4 py-1.5 text-xs font-medium flex items-center justify-between shadow-md sticky top-0 z-50 animate-in slide-in-from-top-1 duration-200">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <span className="text-sm">✓</span>
          <span>
            <strong>Connection restored.</strong> All local changes and quote states are synchronized with Odoo ERP.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowRestoredNotice(false)}
          className="text-white/80 hover:text-white text-xs px-2"
        >
          ✕
        </button>
      </div>
    );
  }

  return null;
}
