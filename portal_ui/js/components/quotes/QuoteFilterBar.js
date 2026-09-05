/**
 * DealFlow360 - QuoteFilterBar Component
 * Search bar, status pill tabs with counts, and sort selectors.
 */
(function(root) {
  'use strict';

  const STATUS_TABS = [
    { id: 'all', label: 'All Quotations' },
    { id: 'sent', label: 'Pending Review' },
    { id: 'in_negotiation', label: 'In Negotiation' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Declined' },
    { id: 'expired', label: 'Expired' }
  ];

  function QuoteFilterBar(props) {
    const currentStatus = (props && props.currentStatus) || 'all';
    const statusCounts = (props && props.statusCounts) || {};
    const searchQuery = (props && props.searchQuery) || '';
    const sortBy = (props && props.sortBy) || 'date';
    const sortDir = (props && props.sortDir) || 'desc';

    const tabsHtml = STATUS_TABS.map(tab => {
      const isActive = tab.id === currentStatus;
      const count = statusCounts[tab.id] !== undefined ? ` (${statusCounts[tab.id]})` : '';
      const activeClasses = isActive
        ? 'bg-indigo-600 text-white shadow-xs font-semibold'
        : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200';

      return `
        <button type="button" class="px-3 py-1.5 rounded-lg text-xs transition-colors ${activeClasses}" data-action="filter-status" data-status="${tab.id}">
          ${tab.label}${count}
        </button>
      `;
    }).join('');

    return `
      <div class="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-xs" data-component="QuoteFilterBar">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <!-- Search Input -->
          <div class="relative flex-1 max-w-md">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <input type="text" value="${searchQuery}" placeholder="Search by quote #, title, or account rep..." class="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" data-action="search-input">
          </div>

          <!-- Sort Select -->
          <div class="flex items-center space-x-2">
            <label class="text-xs text-slate-500 whitespace-nowrap">Sort by:</label>
            <select class="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700" data-action="sort-select">
              <option value="date:desc" ${sortBy === 'date' && sortDir === 'desc' ? 'selected' : ''}>Newest First</option>
              <option value="date:asc" ${sortBy === 'date' && sortDir === 'asc' ? 'selected' : ''}>Oldest First</option>
              <option value="total_amount:desc" ${sortBy === 'total_amount' && sortDir === 'desc' ? 'selected' : ''}>Highest Amount</option>
              <option value="total_amount:asc" ${sortBy === 'total_amount' && sortDir === 'asc' ? 'selected' : ''}>Lowest Amount</option>
              <option value="quote_number:asc" ${sortBy === 'quote_number' && sortDir === 'asc' ? 'selected' : ''}>Quote Number (A-Z)</option>
            </select>
          </div>
        </div>

        <!-- Status Filter Tabs -->
        <div class="flex items-center space-x-2 mt-4 pt-3 border-t border-slate-100 overflow-x-auto pb-1">
          ${tabsHtml}
        </div>
      </div>
    `.trim();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuoteFilterBar, STATUS_TABS };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.QuoteFilterBar = QuoteFilterBar;
  }
})(typeof window !== 'undefined' ? window : this);
