/**
 * DealFlow360 - QuoteTable Component
 * Responsive desktop table displaying quotations with tabular values, status badges, and action triggers.
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

  function formatDate(isoStr) {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return isoStr.substring(0, 10);
    }
  }

  function QuoteTable(props) {
    const quotes = (props && Array.isArray(props.quotes)) ? props.quotes : [];
    const QuoteStatusBadge = (props && props.QuoteStatusBadge) || (root.DFComponents && root.DFComponents.QuoteStatusBadge);
    const NegotiationStatusBadge = (props && props.NegotiationStatusBadge) || (root.DFComponents && root.DFComponents.NegotiationStatusBadge);

    const rowsHtml = quotes.map(q => {
      const badgeHtml = QuoteStatusBadge
        ? QuoteStatusBadge({ status: q.status, size: 'sm' })
        : `<span class="px-2 py-0.5 rounded text-xs">${q.status}</span>`;

      const negBadgeHtml = (q.has_active_negotiation && NegotiationStatusBadge)
        ? `<div class="mt-1">${NegotiationStatusBadge({ status: q.negotiation_status, size: 'sm' })}</div>`
        : '';

      const expirationHtml = q.expiration_date
        ? `<span class="text-slate-600 font-mono text-xs tabular-nums">${formatDate(q.expiration_date)}</span>`
        : '<span class="text-slate-400 text-xs">—</span>';

      return `
        <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0" data-component="QuoteTableRow" data-quote-id="${q.quote_id}">
          <!-- Quote Number & Scope -->
          <td class="py-4 px-4">
            <div class="flex items-center space-x-2">
              <span class="font-mono text-xs font-bold text-indigo-600 tabular-nums">${q.quote_number}</span>
              ${q.revision_number > 1 ? `<span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200">v${q.revision_number}</span>` : ''}
            </div>
            <div class="text-xs font-medium text-slate-800 mt-0.5 truncate max-w-xs" title="${q.title}">${q.title}</div>
          </td>

          <!-- Date & Activity -->
          <td class="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
            <div class="font-mono tabular-nums text-slate-700">${formatDate(q.created_at)}</div>
            <div class="text-[11px] text-slate-400">Updated ${formatDate(q.updated_at)}</div>
          </td>

          <!-- Account Rep -->
          <td class="py-4 px-4 text-xs whitespace-nowrap">
            <div class="font-medium text-slate-800">${q.sales_rep ? q.sales_rep.name : 'DealFlow360 Team'}</div>
            <div class="text-[11px] text-slate-400 truncate max-w-[140px]">${q.sales_rep ? q.sales_rep.email : ''}</div>
          </td>

          <!-- Total Amount -->
          <td class="py-4 px-4 text-xs text-right whitespace-nowrap font-mono font-bold text-slate-900 tabular-nums">
            ${formatCurrency(q.total_amount, q.currency)}
          </td>

          <!-- Status & Negotiation -->
          <td class="py-4 px-4 whitespace-nowrap">
            ${badgeHtml}
            ${negBadgeHtml}
          </td>

          <!-- Expiration -->
          <td class="py-4 px-4 whitespace-nowrap">
            ${expirationHtml}
          </td>

          <!-- Action -->
          <td class="py-4 px-4 text-right whitespace-nowrap">
            <a href="#/quotes/${q.quote_id}" class="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors" data-action="view-quote" data-quote-id="${q.quote_id}">
              Review
              <svg class="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </a>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="hidden md:block overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-xs" data-component="QuoteTable">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider font-semibold text-slate-500">
              <th scope="col" class="py-3 px-4">Quotation & Scope</th>
              <th scope="col" class="py-3 px-4">Created / Updated</th>
              <th scope="col" class="py-3 px-4">Account Executive</th>
              <th scope="col" class="py-3 px-4 text-right">Total (USD)</th>
              <th scope="col" class="py-3 px-4">Status & Review</th>
              <th scope="col" class="py-3 px-4">Expires</th>
              <th scope="col" class="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `.trim();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuoteTable, formatCurrency, formatDate };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.QuoteTable = QuoteTable;
  }
})(typeof window !== 'undefined' ? window : this);
