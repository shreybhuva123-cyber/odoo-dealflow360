/**
 * DealFlow360 - ToastSystem Component
 * Renders stackable, accessible toast notifications with RFC 7807 problem details support.
 */
(function(root) {
  'use strict';

  const TOAST_TYPES = {
    success: {
      border: 'border-emerald-200',
      bg: 'bg-white',
      badge: 'bg-emerald-100 text-emerald-800',
      iconSvg: '<svg class="w-5 h-5 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>'
    },
    error: {
      border: 'border-rose-200',
      bg: 'bg-white',
      badge: 'bg-rose-100 text-rose-800 font-mono text-[10px]',
      iconSvg: '<svg class="w-5 h-5 text-rose-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>'
    },
    warning: {
      border: 'border-amber-200',
      bg: 'bg-white',
      badge: 'bg-amber-100 text-amber-800',
      iconSvg: '<svg class="w-5 h-5 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>'
    },
    info: {
      border: 'border-indigo-200',
      bg: 'bg-white',
      badge: 'bg-indigo-100 text-indigo-800',
      iconSvg: '<svg class="w-5 h-5 text-indigo-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>'
    }
  };

  function ToastItem(props) {
    const id = (props && props.id) || `df-toast-${Date.now()}`;
    const type = (props && props.type) || 'info';
    const title = (props && props.title) || '';
    const message = (props && props.message) || '';
    const errorCode = props && props.errorCode;
    const actionLabel = props && props.actionLabel;
    const duration = (props && props.duration) || 5000;

    const config = TOAST_TYPES[type] || TOAST_TYPES.info;

    const errorCodeBadge = errorCode
      ? `<span class="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 ml-1.5">${errorCode}</span>`
      : '';

    const actionButton = actionLabel
      ? `<button type="button" class="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline transition-colors" data-action="toast-action" data-toast-id="${id}">${actionLabel}</button>`
      : '';

    return `
      <div id="${id}" class="df-toast-item flex items-start p-4 rounded-xl shadow-lg border ${config.border} ${config.bg} relative overflow-hidden" role="alert" data-component="ToastItem" data-type="${type}" data-duration="${duration}">
        <div class="mr-3 pt-0.5">
          ${config.iconSvg}
        </div>
        <div class="flex-1 pr-2">
          <div class="flex items-center">
            <h4 class="text-sm font-semibold text-slate-900 leading-tight">${title}</h4>
            ${errorCodeBadge}
          </div>
          <p class="text-xs text-slate-600 mt-1 leading-relaxed">${message}</p>
          ${actionButton}
        </div>
        <button type="button" class="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors" data-action="dismiss-toast" data-toast-id="${id}" aria-label="Dismiss">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    `.trim();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ToastItem, TOAST_TYPES };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.ToastItem = ToastItem;
  }
})(typeof window !== 'undefined' ? window : this);
