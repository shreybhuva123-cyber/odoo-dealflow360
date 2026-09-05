/**
 * DealFlow360 - SlideOverDrawer Component
 * Right-aligned slide-out drawer for deep workflows without leaving quotation context.
 */
(function(root) {
  'use strict';

  const DRAWER_WIDTHS = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  function SlideOverDrawer(props) {
    const id = (props && props.id) || 'df-drawer';
    const isOpen = props && props.isOpen;
    const title = (props && props.title) || 'Drawer';
    const subtitle = (props && props.subtitle) || '';
    const width = (props && props.width) || 'xl';
    const bodyHtml = (props && props.bodyHtml) || '';
    const footerHtml = (props && props.footerHtml) || '';
    const widthClass = DRAWER_WIDTHS[width] || DRAWER_WIDTHS.xl;

    const hiddenClass = isOpen ? '' : 'hidden';

    return `
      <div id="${id}" class="fixed inset-0 z-50 overflow-hidden ${hiddenClass}" role="dialog" aria-modal="true" aria-labelledby="${id}-title" data-component="SlideOverDrawer">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" data-action="close-drawer" data-target="${id}"></div>

        <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div class="w-screen ${widthClass} bg-white shadow-2xl flex flex-col border-l border-slate-200">
            <!-- Drawer Header -->
            <div class="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 id="${id}-title" class="text-lg font-bold text-slate-900">${title}</h3>
                ${subtitle ? `<p class="text-xs text-slate-500 mt-0.5">${subtitle}</p>` : ''}
              </div>
              <button type="button" class="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors" data-action="close-drawer" data-target="${id}" aria-label="Close drawer">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <!-- Drawer Body -->
            <div class="flex-1 overflow-y-auto p-6 space-y-4">
              ${bodyHtml}
            </div>

            <!-- Drawer Footer -->
            ${footerHtml ? `
              <div class="border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-end space-x-3">
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
    module.exports = { SlideOverDrawer };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.SlideOverDrawer = SlideOverDrawer;
  }
})(typeof window !== 'undefined' ? window : this);
