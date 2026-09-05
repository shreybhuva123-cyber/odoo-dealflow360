/**
 * DealFlow360 - ErrorView Component
 * Standardized RFC 7807 error visualizer with status code, actionable resolution, and retry/back triggers.
 */
(function(root) {
  'use strict';

  function ErrorView(props) {
    const title = (props && props.title) || 'An error occurred';
    const errorCode = (props && props.errorCode) || 'INTERNAL_ERROR';
    const message = (props && props.message) || 'We were unable to process your request. Please try again.';
    const details = props && props.details;
    const illustration = (props && props.illustration) || 'server_error';
    const primaryActionLabel = (props && props.primaryActionLabel) || 'Try Again';
    const secondaryActionLabel = (props && props.secondaryActionLabel) || 'Return to Dashboard';

    let iconSvg = '';
    if (illustration === '404') {
      iconSvg = '<svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    } else if (illustration === '403') {
      iconSvg = '<svg class="w-12 h-12 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m0 0v2m0-2h2m-2 0H10m11-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    } else if (illustration === 'expired') {
      iconSvg = '<svg class="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    } else {
      iconSvg = '<svg class="w-12 h-12 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>';
    }

    return `
      <div class="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-xs max-w-xl mx-auto my-8" data-component="ErrorView" data-error-code="${errorCode}">
        <div class="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-5 border border-slate-100 shadow-inner">
          ${iconSvg}
        </div>
        <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 mb-3">
          ${errorCode}
        </div>
        <h2 class="text-xl font-bold text-slate-900 mb-2">${title}</h2>
        <p class="text-sm text-slate-600 max-w-md mb-6 leading-relaxed">${message}</p>
        ${details ? `<pre class="text-[11px] font-mono bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-500 max-w-md w-full mb-6 overflow-x-auto text-left">${details}</pre>` : ''}
        <div class="flex items-center space-x-3">
          ${primaryActionLabel ? `<button type="button" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors" data-action="error-primary">${primaryActionLabel}</button>` : ''}
          ${secondaryActionLabel ? `<button type="button" class="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-sm font-semibold shadow-xs transition-colors" data-action="error-secondary">${secondaryActionLabel}</button>` : ''}
        </div>
      </div>
    `.trim();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ErrorView };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.ErrorView = ErrorView;
  }
})(typeof window !== 'undefined' ? window : this);
