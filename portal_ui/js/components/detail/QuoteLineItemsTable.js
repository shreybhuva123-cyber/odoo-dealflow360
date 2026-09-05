/**
 * DealFlow360 - QuoteLineItemsTable Component
 * Renders deliverables and line items with product descriptions, recurring vs one-time
 * badges, transparent customer discounts, applicable tax, and line-level comment triggers.
 */
(function(root) {
  'use strict';

  function formatCurrency(amount, currency) {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount);
    } catch (e) {
      return `$${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }
  }

  function QuoteLineItemsTable(props) {
    const lines = (props && Array.isArray(props.lines)) ? props.lines : [];
    const currency = (props && props.currency) || 'USD';
    const canNegotiate = (props && props.canNegotiate) !== false;
    const lineCommentsSummary = (props && props.lineCommentsSummary) || {};

    let LineCommentBadge = (props && props.LineCommentBadge) || (root && root.DFComponents && root.DFComponents.LineCommentBadge);
    if (!LineCommentBadge && typeof require !== 'undefined') {
      try {
        LineCommentBadge = require('../comments/LineCommentBadge').LineCommentBadge;
      } catch (e) {}
    }

    if (lines.length === 0) {
      return `
        <div class="w-full bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 shadow-xs" data-component="QuoteLineItemsTable" data-state="empty">
          <p class="text-sm">No line items configured for this quotation.</p>
        </div>
      `.trim();
    }

    const rowsHtml = lines.map((item, idx) => {
      const isRecurring = item.charge_type === 'recurring';
      const interval = item.recurring_interval ? ` (${item.recurring_interval})` : '';
      const chargeTypeBadge = isRecurring
        ? `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
            <svg class="w-2.5 h-2.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Recurring${interval}
          </span>`
        : `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
            One-Time
          </span>`;

      const discountHtml = (item.discount_percent && item.discount_percent > 0)
        ? `<span class="text-emerald-600 font-semibold font-mono tabular-nums">-${item.discount_percent}%</span>`
        : `<span class="text-slate-400 font-mono">—</span>`;

      const taxHtml = (item.tax_amount && item.tax_amount > 0)
        ? `<div class="font-mono tabular-nums text-slate-700 font-medium">${formatCurrency(item.tax_amount, currency)}</div>
           ${item.tax_rate_percent ? `<div class="text-[10px] text-slate-400 font-mono">${item.tax_rate_percent}%</div>` : ''}`
        : `<span class="text-slate-400 font-mono text-xs">$0.00</span>`;

      return `
        <tr class="hover:bg-slate-50/70 transition-colors border-b border-slate-100 last:border-0" data-component="QuoteLineItemRow" data-line-id="${item.line_id || idx}">
          <!-- Item & Description -->
          <td class="py-4 px-5">
            <div class="flex items-center space-x-2">
              <span class="font-semibold text-slate-900 text-sm">${item.name || 'Deliverable'}</span>
              ${chargeTypeBadge}
            </div>
            ${item.description ? `<p class="text-xs text-slate-500 mt-1 max-w-md leading-relaxed">${item.description}</p>` : ''}
          </td>

          <!-- Quantity & UoM -->
          <td class="py-4 px-4 text-center whitespace-nowrap">
            <span class="font-mono font-bold text-xs text-slate-800 tabular-nums">${item.quantity || 1}</span>
            <span class="text-[11px] text-slate-500 ml-1">${item.uom || 'Units'}</span>
          </td>

          <!-- Unit Price -->
          <td class="py-4 px-4 text-right whitespace-nowrap font-mono text-xs font-medium text-slate-700 tabular-nums">
            ${formatCurrency(item.unit_price, currency)}
          </td>

          <!-- Customer Discount -->
          <td class="py-4 px-4 text-right whitespace-nowrap text-xs">
            ${discountHtml}
          </td>

          <!-- Applicable Tax -->
          <td class="py-4 px-4 text-right whitespace-nowrap text-xs">
            ${taxHtml}
          </td>

          <!-- Line Total -->
          <td class="py-4 px-5 text-right whitespace-nowrap font-mono text-sm font-bold text-slate-900 tabular-nums">
            ${formatCurrency(item.total_amount, currency)}
          </td>

          <!-- Discussion Action -->
          <td class="py-4 px-3 text-right whitespace-nowrap">
            ${LineCommentBadge ? LineCommentBadge({
              lineId: item.line_id || idx,
              lineName: item.name || '',
              totalComments: (lineCommentsSummary[item.line_id] && lineCommentsSummary[item.line_id].total_comments) || 0,
              unreadCount: (lineCommentsSummary[item.line_id] && lineCommentsSummary[item.line_id].unread_count) || 0
            }) : `
              <button type="button" class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Discuss or question this line item" data-action="comment-line" data-line-id="${item.line_id || idx}" data-line-name="${item.name || ''}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
              </button>
            `}
          </td>
        </tr>
      `;
    }).join('');

    return `
      <section class="w-full bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-6" data-component="QuoteLineItemsTable">
        <!-- Card Header -->
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 class="text-base font-bold text-slate-900">Deliverables & Line Items</h2>
            <p class="text-xs text-slate-500 mt-0.5">Itemized scope of software licenses, infrastructure, and engineering services.</p>
          </div>
          ${canNegotiate ? `
            <button type="button" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center" data-action="request-scope-change">
              <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              Request Scope Changes
            </button>
          ` : ''}
        </div>

        <!-- Table View -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                <th scope="col" class="py-3 px-5">Deliverable Specification</th>
                <th scope="col" class="py-3 px-4 text-center">Qty / UoM</th>
                <th scope="col" class="py-3 px-4 text-right">Unit Price</th>
                <th scope="col" class="py-3 px-4 text-right">Discount</th>
                <th scope="col" class="py-3 px-4 text-right">Tax</th>
                <th scope="col" class="py-3 px-5 text-right">Total (${currency})</th>
                <th scope="col" class="py-3 px-3 text-right"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </section>
    `.trim();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuoteLineItemsTable };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.QuoteLineItemsTable = QuoteLineItemsTable;
  }
})(typeof window !== 'undefined' ? window : this);
