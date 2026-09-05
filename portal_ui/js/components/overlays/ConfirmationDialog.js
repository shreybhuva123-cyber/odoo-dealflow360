/**
 * DealFlow360 - ConfirmationDialog Component
 * High-friction confirmation modal for destructive or legally binding operations.
 */
(function(root) {
  'use strict';

  const VARIANT_CONFIGS = {
    danger: {
      iconBg: 'bg-rose-100 text-rose-600',
      iconSvg: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
      confirmButtonClass: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500'
    },
    warning: {
      iconBg: 'bg-amber-100 text-amber-600',
      iconSvg: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
      confirmButtonClass: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500'
    },
    primary: {
      iconBg: 'bg-indigo-100 text-indigo-600',
      iconSvg: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      confirmButtonClass: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500'
    }
  };

  function ConfirmationDialog(props) {
    const id = (props && props.id) || 'df-confirm-dialog';
    const isOpen = props && props.isOpen;
    const variant = (props && props.variant) || 'danger';
    const title = (props && props.title) || 'Confirm Action';
    const message = (props && props.message) || 'Are you sure you wish to proceed?';
    const confirmLabel = (props && props.confirmLabel) || 'Confirm';
    const cancelLabel = (props && props.cancelLabel) || 'Cancel';
    const requireCheckbox = props && props.requireCheckbox;
    const checkboxLabel = (props && props.checkboxLabel) || 'I acknowledge this action cannot be undone.';

    const config = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.danger;
    const hiddenClass = isOpen ? '' : 'hidden';

    const checkboxHtml = requireCheckbox
      ? `
        <div class="mt-4 pt-3 border-t border-slate-100">
          <label class="flex items-start space-x-2 text-xs text-slate-600 cursor-pointer select-none">
            <input type="checkbox" id="${id}-checkbox" class="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" data-role="confirm-check">
            <span>${checkboxLabel}</span>
          </label>
        </div>
      `
      : '';

    return `
      <div id="${id}" class="fixed inset-0 z-50 overflow-y-auto ${hiddenClass}" role="alertdialog" aria-modal="true" aria-labelledby="${id}-title" data-component="ConfirmationDialog" data-variant="${variant}">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" data-action="cancel-confirm" data-target="${id}"></div>

        <div class="flex min-h-screen items-center justify-center p-4 text-center">
          <div class="relative transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${config.iconBg} sm:mx-0 sm:h-10 sm:w-10">
                ${config.iconSvg}
              </div>
              <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                <h3 id="${id}-title" class="text-base font-bold leading-6 text-slate-900">${title}</h3>
                <div class="mt-2">
                  <p class="text-sm text-slate-600 leading-relaxed">${message}</p>
                </div>
                ${checkboxHtml}
              </div>
            </div>
            <div class="mt-6 sm:flex sm:flex-row-reverse gap-3">
              <button type="button" class="inline-flex w-full justify-center rounded-lg px-4 py-2.5 text-sm font-semibold shadow-xs sm:w-auto transition-colors focus:ring-2 focus:ring-offset-2 ${config.confirmButtonClass}" data-action="execute-confirm" data-target="${id}">
                ${confirmLabel}
              </button>
              <button type="button" class="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:w-auto transition-colors" data-action="cancel-confirm" data-target="${id}">
                ${cancelLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    `.trim();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ConfirmationDialog };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.ConfirmationDialog = ConfirmationDialog;
  }
})(typeof window !== 'undefined' ? window : this);
