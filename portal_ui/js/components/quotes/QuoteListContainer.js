/**
 * DealFlow360 - QuoteListContainer Component
 * Orchestrator managing filter state, loading skeletons, empty states, error boundaries,
 * and responsive table / card rendering.
 */
(function(root) {
  'use strict';

  function QuoteListContainer(props) {
    const isLoading = props && props.isLoading;
    const error = props && props.error;
    const quotes = (props && Array.isArray(props.quotes)) ? props.quotes : [];
    const pagination = (props && props.pagination) || { total_items: quotes.length };
    const currentStatus = (props && props.currentStatus) || 'all';
    const statusCounts = (props && props.statusCounts) || {};
    const searchQuery = (props && props.searchQuery) || '';
    const sortBy = (props && props.sortBy) || 'date';
    const sortDir = (props && props.sortDir) || 'desc';

    // Primitives from registry
    let components = (root && root.DFComponents) || {};
    if (typeof require !== 'undefined' && (!components.ErrorView || !components.QuoteFilterBar)) {
      try {
        const idx = require('../index');
        components = Object.assign({}, idx, components);
      } catch (e) {
        try {
          components.ErrorView = components.ErrorView || require('../feedback/ErrorView').ErrorView;
          components.EmptyStateView = components.EmptyStateView || require('../feedback/EmptyStateView').EmptyStateView;
          components.LoadingSkeleton = components.LoadingSkeleton || require('../feedback/LoadingSkeleton');
          components.QuoteFilterBar = components.QuoteFilterBar || require('./QuoteFilterBar').QuoteFilterBar;
          components.QuoteTable = components.QuoteTable || require('./QuoteTable').QuoteTable;
          components.QuoteCard = components.QuoteCard || require('./QuoteCard').QuoteCard;
          components.QuotePagination = components.QuotePagination || require('./QuotePagination').QuotePagination;
        } catch (e2) {}
      }
    }
    const QuoteFilterBar = (props && props.QuoteFilterBar) || components.QuoteFilterBar;
    const QuoteTable = (props && props.QuoteTable) || components.QuoteTable;
    const QuoteCard = (props && props.QuoteCard) || components.QuoteCard;
    const QuotePagination = (props && props.QuotePagination) || components.QuotePagination;
    const LoadingSkeleton = (props && props.LoadingSkeleton) || components.LoadingSkeleton;
    const ErrorView = (props && props.ErrorView) || components.ErrorView;
    const EmptyStateView = (props && props.EmptyStateView) || components.EmptyStateView;

    // Filter bar is always visible at the top (unless fatal initial error)
    const filterBarHtml = QuoteFilterBar
      ? QuoteFilterBar({ currentStatus, statusCounts, searchQuery, sortBy, sortDir })
      : '';

    // Error State
    if (error) {
      const errorHtml = ErrorView
        ? ErrorView({
            title: error.title || 'Unable to load quotations',
            errorCode: error.code || 'QUOTATION_LIST_ERROR',
            message: error.message || 'A network error occurred while communicating with the server.',
            primaryActionLabel: 'Retry Loading',
            secondaryActionLabel: 'Contact Support'
          })
        : `<div class="p-6 bg-red-50 text-red-700 rounded-xl text-center">${error.message || 'Error'}</div>`;

      return `
        <div class="w-full" data-component="QuoteListContainer" data-state="error">
          ${filterBarHtml}
          ${errorHtml}
        </div>
      `.trim();
    }

    // Loading State
    if (isLoading) {
      const skeletonHtml = (LoadingSkeleton && LoadingSkeleton.SkeletonTable)
        ? LoadingSkeleton.SkeletonTable({ rows: 5 })
        : '<div class="py-12 text-center text-slate-400">Loading quotations...</div>';

      return `
        <div class="w-full" data-component="QuoteListContainer" data-state="loading">
          ${filterBarHtml}
          ${skeletonHtml}
        </div>
      `.trim();
    }

    // Empty State (Zero quotations match search/filter criteria)
    if (quotes.length === 0) {
      const isFiltered = currentStatus !== 'all' || Boolean(searchQuery);
      const emptyTitle = isFiltered ? 'No matching proposals found' : 'No proposals published yet';
      const emptyDesc = isFiltered
        ? `No quotations match your filter "${currentStatus}" or search term "${searchQuery}".`
        : 'Your account executive has not published any commercial proposals to your portal yet.';

      const emptyHtml = EmptyStateView
        ? EmptyStateView({
            title: emptyTitle,
            description: emptyDesc,
            iconType: 'quotes',
            actionLabel: isFiltered ? 'Reset All Filters' : null
          })
        : `<div class="p-8 text-center text-slate-500">${emptyTitle}</div>`;

      return `
        <div class="w-full" data-component="QuoteListContainer" data-state="empty">
          ${filterBarHtml}
          ${emptyHtml}
        </div>
      `.trim();
    }

    // Data State (Render Desktop Table & Mobile Cards)
    const tableHtml = QuoteTable
      ? QuoteTable({ quotes })
      : '';

    const cardsHtml = QuoteCard
      ? quotes.map(q => QuoteCard({ quote: q })).join('')
      : '';

    const paginationHtml = QuotePagination
      ? QuotePagination({ pagination })
      : '';

    return `
      <div class="w-full" data-component="QuoteListContainer" data-state="ready" data-count="${quotes.length}">
        ${filterBarHtml}
        ${tableHtml}
        <div class="md:hidden">
          ${cardsHtml}
        </div>
        ${paginationHtml}
      </div>
    `.trim();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuoteListContainer };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.QuoteListContainer = QuoteListContainer;
  }
})(typeof window !== 'undefined' ? window : this);
