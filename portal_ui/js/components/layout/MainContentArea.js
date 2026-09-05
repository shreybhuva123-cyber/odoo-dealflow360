/**
 * DealFlow360 - MainContentArea Component
 * Pure presentation container enforcing standard page width, responsive padding, title slot, and action button cluster.
 */
(function(root) {
  'use strict';

  function MainContentArea(props) {
    const title = (props && props.title) || '';
    const subtitle = (props && props.subtitle) || '';
    const statusBadgeHtml = (props && props.statusBadgeHtml) || '';
    const actionsHtml = (props && props.actionsHtml) || '';
    const contentHtml = (props && props.contentHtml) || '';

    const headerSection = title
      ? `
        <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div class="flex items-center space-x-3 flex-wrap gap-y-2">
              <h1 class="text-2xl font-bold tracking-tight text-slate-900">${title}</h1>
              ${statusBadgeHtml}
            </div>
            ${subtitle ? `<p class="mt-1 text-sm text-slate-500">${subtitle}</p>` : ''}
          </div>
          ${actionsHtml ? `<div class="flex items-center space-x-3 flex-wrap gap-y-2">${actionsHtml}</div>` : ''}
        </div>
      `
      : '';

    return `
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full" data-component="MainContentArea">
        ${headerSection}
        <div class="w-full">
          ${contentHtml}
        </div>
      </section>
    `.trim();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MainContentArea };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.MainContentArea = MainContentArea;
  }
})(typeof window !== 'undefined' ? window : this);
