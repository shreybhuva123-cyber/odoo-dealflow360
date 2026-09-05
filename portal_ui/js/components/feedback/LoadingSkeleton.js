/**
 * DealFlow360 - LoadingSkeleton Component Family
 * Non-disruptive skeleton loaders to eliminate Cumulative Layout Shift (CLS).
 */
(function(root) {
  'use strict';

  function SkeletonText(props) {
    const lines = (props && props.lines) || 3;
    const items = [];
    for (let i = 0; i < lines; i++) {
      const width = i === lines - 1 ? 'w-3/5' : 'w-full';
      items.push(`<div class="h-3.5 bg-slate-200 rounded-md df-shimmer ${width} mb-2"></div>`);
    }
    return `
      <div class="w-full space-y-1" data-component="SkeletonText">
        ${items.join('')}
      </div>
    `.trim();
  }

  function SkeletonCard(props) {
    const height = (props && props.height) || 'h-32';
    return `
      <div class="w-full ${height} bg-slate-100 border border-slate-200 rounded-2xl p-6 df-shimmer" data-component="SkeletonCard">
        <div class="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div class="h-3 bg-slate-200 rounded w-2/3 mb-2"></div>
        <div class="h-3 bg-slate-200 rounded w-1/2"></div>
      </div>
    `.trim();
  }

  function SkeletonTable(props) {
    const rows = (props && props.rows) || 4;
    const rowItems = [];
    for (let i = 0; i < rows; i++) {
      rowItems.push(`
        <tr class="border-b border-slate-100">
          <td class="py-3 px-4"><div class="h-3.5 bg-slate-200 rounded w-24 df-shimmer"></div></td>
          <td class="py-3 px-4"><div class="h-3.5 bg-slate-200 rounded w-48 df-shimmer"></div></td>
          <td class="py-3 px-4"><div class="h-3.5 bg-slate-200 rounded w-16 df-shimmer"></div></td>
          <td class="py-3 px-4"><div class="h-3.5 bg-slate-200 rounded w-20 df-shimmer"></div></td>
          <td class="py-3 px-4 text-right"><div class="h-3.5 bg-slate-200 rounded w-16 ml-auto df-shimmer"></div></td>
        </tr>
      `);
    }

    return `
      <div class="w-full overflow-hidden border border-slate-200 rounded-xl bg-white" data-component="SkeletonTable">
        <div class="h-10 bg-slate-50 border-b border-slate-200 px-4 flex items-center">
          <div class="h-3.5 bg-slate-200 rounded w-32 df-shimmer"></div>
        </div>
        <table class="w-full text-left text-xs">
          <tbody>
            ${rowItems.join('')}
          </tbody>
        </table>
      </div>
    `.trim();
  }

  function SkeletonQuoteHeader() {
    return `
      <div class="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-xs" data-component="SkeletonQuoteHeader">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="space-y-2">
            <div class="flex items-center space-x-3">
              <div class="h-6 bg-slate-200 rounded-md w-40 df-shimmer"></div>
              <div class="h-5 bg-slate-200 rounded-full w-24 df-shimmer"></div>
            </div>
            <div class="h-4 bg-slate-200 rounded w-64 df-shimmer"></div>
          </div>
          <div class="flex items-center space-x-3">
            <div class="h-9 bg-slate-200 rounded-lg w-28 df-shimmer"></div>
            <div class="h-9 bg-slate-200 rounded-lg w-32 df-shimmer"></div>
          </div>
        </div>
      </div>
    `.trim();
  }

  // Export
  const LoadingSkeleton = {
    SkeletonText,
    SkeletonCard,
    SkeletonTable,
    SkeletonQuoteHeader
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingSkeleton;
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.LoadingSkeleton = LoadingSkeleton;
  }
})(typeof window !== 'undefined' ? window : this);
