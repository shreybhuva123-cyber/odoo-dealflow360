/**
 * DealFlow360 - BreadcrumbTrail Component
 * Accessible hierarchical breadcrumb trail with chevron separators and active item styling.
 */
(function(root) {
  'use strict';

  function BreadcrumbTrail(props) {
    const items = (props && Array.isArray(props.items)) ? props.items : [];

    const itemsHtml = items.map((item, idx) => {
      const isLast = idx === items.length - 1 || item.active;
      const chevron = idx > 0
        ? `<svg class="w-4 h-4 text-slate-400 mx-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>`
        : '';

      const content = isLast
        ? `<span class="text-slate-900 font-semibold truncate" aria-current="page">${item.label}</span>`
        : `<a href="${item.href || '#'}" class="text-slate-500 hover:text-slate-800 transition-colors font-medium truncate">${item.label}</a>`;

      return `
        <li class="inline-flex items-center">
          ${chevron}
          ${content}
        </li>
      `;
    }).join('');

    return `
      <nav class="flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-xs" aria-label="Breadcrumb" data-component="BreadcrumbTrail">
        <ol class="inline-flex items-center space-x-0 list-none p-0 m-0">
          ${itemsHtml}
        </ol>
      </nav>
    `.trim();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BreadcrumbTrail };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.BreadcrumbTrail = BreadcrumbTrail;
  }
})(typeof window !== 'undefined' ? window : this);
