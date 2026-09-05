/**
 * DealFlow360 - QuoteCard Component
 * Mobile-first card representation of a quotation for responsive viewports (< 768px).
 */
(function(root) {
  'use strict';

  function QuoteCard(props) {
    const q = (props && props.quote) || {};
    const QuoteStatusBadge = (props && props.QuoteStatusBadge) || (root.DFComponents && root.DFComponents.QuoteStatusBadge);
    const NegotiationStatusBadge = (props && props.NegotiationStatusBadge) || (root.DFComponents && root.DFComponents.NegotiationStatusBadge);

    const formatCurrency = (root.DFComponents && root.DFComponents.QuoteTable && root.DFComponents.QuoteTable.formatCurrency) ||
      function(amount, currency) {
        return `$${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      };

    const formatDate = (root.DFComponents && root.DFComponents.QuoteTable && root.DFComponents.QuoteTable.formatDate) ||
      function(isoStr) { return isoStr ? isoStr.substring(0, 10) : '—'; };

    const badgeHtml = QuoteStatusBadge
      ? QuoteStatusBadge({ status: q.status, size: 'sm' })
      : `<span class="px-2 py-0.5 rounded text-xs">${q.status}</span>`;

    const negBadgeHtml = (q.has_active_negotiation && NegotiationStatusBadge)
      ? `<div class="mt-1">${NegotiationStatusBadge({ status: q.negotiation_status, size: 'sm' })}</div>`
      : '';

    return `
      <div class="md:hidden bg-white border border-slate-200 rounded-2xl p-4 shadow-xs mb-3 space-y-3" data-component="QuoteCard" data-quote-id="${q.quote_id}">
        <div class="flex items-center justify-between">
          <span class="font-mono text-xs font-bold text-indigo-600">${q.quote_number}</span>
          ${badgeHtml}
        </div>

        <div>
          <h4 class="text-sm font-semibold text-slate-900 leading-snug line-clamp-1">${q.title}</h4>
          <p class="text-xs text-slate-500 mt-0.5">Created ${formatDate(q.created_at)} • Rep: ${q.sales_rep ? q.sales_rep.name : 'DealFlow360'}</p>
        </div>

        ${negBadgeHtml}

        <div class="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <div class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total Amount</div>
            <div class="text-sm font-bold font-mono text-slate-900 tabular-nums">${formatCurrency(q.total_amount, q.currency)}</div>
          </div>
          <a href="#/quotes/${q.quote_id}" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors" data-action="view-quote-mobile">
            Review Quote
          </a>
        </div>
      </div>
    `.trim();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuoteCard };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.QuoteCard = QuoteCard;
  }
})(typeof window !== 'undefined' ? window : this);
