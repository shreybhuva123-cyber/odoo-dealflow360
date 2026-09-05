/**
 * DealFlow360 - PortalHeader Component
 * Pure presentation header shell rendering branding, environment tag, notification bell trigger, and identity area.
 */
(function(root) {
  'use strict';

  function PortalHeader(props) {
    const tenantName = (props && props.tenantName) || 'Workspace';
    const env = (props && props.portalEnvironment) || 'production';
    const unreadCount = (props && props.unreadNotificationCount) || 0;
    const identityHtml = (props && props.identityHtml) || '';

    const envBadge = env !== 'production'
      ? `<span class="ml-2 text-[10px] uppercase px-1.5 py-0.5 rounded font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">${env}</span>`
      : '';

    const notifBadge = unreadCount > 0
      ? `<span class="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
           <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
           <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600 border-2 border-white"></span>
         </span>`
      : '';

    return `
      <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs" data-component="PortalHeader">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div class="flex items-center space-x-6">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">DF</div>
              <span class="font-semibold text-slate-900 tracking-tight text-lg">DealFlow<span class="text-indigo-600">360</span></span>
              <span class="ml-2 text-xs uppercase px-2 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Customer Portal</span>
              ${envBadge}
            </div>
            <div class="hidden md:flex items-center text-xs text-slate-400 space-x-2 pl-4 border-l border-slate-200">
              <span class="font-medium text-slate-700">${tenantName}</span>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <button type="button" class="relative p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 focus:outline-none transition-colors" data-action="toggle-notifications" aria-label="Notifications" title="${unreadCount} unread notifications">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              ${notifBadge}
            </button>
            <div class="pl-3 border-l border-slate-200 flex items-center space-x-3">
              ${identityHtml}
              <button type="button" class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-md font-medium border border-slate-200 transition-colors" data-action="logout" title="Sign out of portal">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>
    `.trim();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PortalHeader };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.PortalHeader = PortalHeader;
  }
})(typeof window !== 'undefined' ? window : this);
