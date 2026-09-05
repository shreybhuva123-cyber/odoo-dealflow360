/**
 * DealFlow360 - ModalDialog Component
 * Accessible modal primitive with backdrop blur, focus handling, and sizing variants.
 */
(function(root) {
  'use strict';

  const MODAL_SIZES = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl'
  };

  function ModalDialog(props) {
    const id = (props && props.id) || 'df-modal';
    const isOpen = props && props.isOpen;
    const title = (props && props.title) || 'Dialog';
    const description = (props && props.description) || '';
    const size = (props && props.size) || 'lg';
    const bodyHtml = (props && props.bodyHtml) || '';
    const footerHtml = (props && props.footerHtml) || '';
    const sizeClass = MODAL_SIZES[size] || MODAL_SIZES.lg;

    const hiddenClass = isOpen ? '' : 'hidden';

    return `
      <div id="${id}" class="fixed inset-0 z-50 overflow-y-auto ${hiddenClass}" role="dialog" aria-modal="true" aria-labelledby="${id}-title" data-component="ModalDialog">
        <!-- Backdrop -->
        <div class="fixed inset-0 df-modal-backdrop transition-opacity" data-action="close-modal" data-target="${id}"></div>

        <!-- Dialog Positioning -->
        <div class="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full ${sizeClass} border border-slate-200">
            <!-- Modal Header -->
            <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/50">
              <div>
                <h3 id="${id}-title" class="text-lg font-bold text-slate-900">${title}</h3>
                ${description ? `<p class="mt-0.5 text-xs text-slate-500">${description}</p>` : ''}
              </div>
              <button type="button" class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none transition-colors" data-action="close-modal" data-target="${id}" aria-label="Close modal">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="px-6 py-5">
              ${bodyHtml}
            </div>

            <!-- Modal Footer -->
            ${footerHtml ? `
              <div class="border-t border-slate-100 bg-slate-50 px-6 py-3 flex items-center justify-end space-x-3">
                ${footerHtml}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `.trim();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModalDialog };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.ModalDialog = ModalDialog;
  }
})(typeof window !== 'undefined' ? window : this);
