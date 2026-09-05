/**
 * DealFlow360 - EmptyStateView Component
 * Contextual zero-data illustration and message for empty queues, tables, and comment streams.
 */
(function(root) {
  'use strict';

  function EmptyStateView(props) {
    const title = (props && props.title) || 'No records found';
    const description = (props && props.description) || 'There is no data to display in this view at the moment.';
    const iconType = (props && props.iconType) || 'quotes';
    const actionLabel = props && props.actionLabel;

    let iconSvg = '';
    if (iconType === 'quotes') {
      iconSvg = '<svg class="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>';
    } else if (iconType === 'comments') {
      iconSvg = '<svg class="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>';
    } else if (iconType === 'notifications') {
      iconSvg = '<svg class="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>';
    } else {
      iconSvg = '<svg class="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>';
    }

    return `
      <div class="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-xs my-4" data-component="EmptyStateView" data-icon-type="${iconType}">
        <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 border border-slate-200/60">
          ${iconSvg}
        </div>
        <h3 class="text-base font-bold text-slate-900 mb-1">${title}</h3>
        <p class="text-xs text-slate-500 max-w-sm mx-auto mb-4 leading-relaxed">${description}</p>
        ${actionLabel ? `
          <button type="button" class="inline-flex items-center px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors" data-action="empty-state-action">
            ${actionLabel}
          </button>
        ` : ''}
      </div>
    `.trim();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EmptyStateView };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.EmptyStateView = EmptyStateView;
  }
})(typeof window !== 'undefined' ? window : this);
