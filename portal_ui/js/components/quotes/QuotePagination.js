/**
 * DealFlow360 - QuotePagination Component
 * Responsive pagination controls with page indicators, boundaries, and per-page limits.
 */
(function(root) {
  'use strict';

  function QuotePagination(props) {
    const p = (props && props.pagination) || {
      current_page: 1,
      per_page: 10,
      total_items: 0,
      total_pages: 1,
      has_next_page: false,
      has_prev_page: false
    };

    if (p.total_items === 0) return '';

    const startItem = (p.current_page - 1) * p.per_page + 1;
    const endItem = Math.min(p.current_page * p.per_page, p.total_items);

    const prevDisabled = !p.has_prev_page;
    const nextDisabled = !p.has_next_page;

    return `
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 px-2 text-xs text-slate-500" data-component="QuotePagination">
        <div>
          Showing <span class="font-semibold text-slate-800 font-mono">${startItem}</span> to <span class="font-semibold text-slate-800 font-mono">${endItem}</span> of <span class="font-semibold text-slate-800 font-mono">${p.total_items}</span> proposals
        </div>

        <div class="flex items-center space-x-2">
          <!-- Page Stepper -->
          <div class="inline-flex rounded-lg shadow-xs border border-slate-200 bg-white overflow-hidden">
            <button type="button" class="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed border-r border-slate-200 transition-colors" data-action="prev-page" ${prevDisabled ? 'disabled' : ''}>
              Previous
            </button>
            <span class="px-3 py-1.5 text-xs font-mono font-semibold text-slate-800 bg-slate-50">
              Page ${p.current_page} of ${p.total_pages}
            </span>
            <button type="button" class="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors" data-action="next-page" ${nextDisabled ? 'disabled' : ''}>
              Next
            </button>
          </div>

          <!-- Per-Page Selector -->
          <select class="border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500" data-action="per-page-select">
            <option value="5" ${p.per_page === 5 ? 'selected' : ''}>5 per page</option>
            <option value="10" ${p.per_page === 10 ? 'selected' : ''}>10 per page</option>
            <option value="25" ${p.per_page === 25 ? 'selected' : ''}>25 per page</option>
          </select>
        </div>
      </div>
    `.trim();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuotePagination };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.QuotePagination = QuotePagination;
  }
})(typeof window !== 'undefined' ? window : this);
