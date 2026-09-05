/**
 * DealFlow360 - QuotePricingSummary Component
 * Sticky commercial financial card summarizing subtotal, transparent discounts,
 * one-time vs recurring charges breakdown, total contract value, and role-governed actions.
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

  function QuotePricingSummary(props) {
    const quote = (props && props.quote) || {};
    const pricing = (quote && quote.pricing_summary) || {};
    const user = (props && props.user) || {};
    const currency = quote.currency || 'USD';

    const subtotal = pricing.subtotal || 0;
    const discountTotal = pricing.discount_total || 0;
    const taxTotal = pricing.tax_total || 0;
    const totalAmount = pricing.total_amount || 0;
    const oneTimeTotal = pricing.one_time_total !== undefined ? pricing.one_time_total : 0;
    const recurringTotal = pricing.recurring_total !== undefined ? pricing.recurring_total : 0;
    const recurringInterval = pricing.recurring_interval || 'annual';

    const status = quote.status || 'sent';
    const canAccept = quote.can_accept !== false && status === 'sent';
    const canNegotiate = quote.can_negotiate !== false && (status === 'sent' || status === 'in_negotiation');
    const isSignatory = user.can_sign_quotes !== false;

    // Primary Action Button Computation
    let acceptBtnHtml = '';
    if (status === 'approved') {
      acceptBtnHtml = `
        <div class="w-full py-3 px-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold text-center flex items-center justify-center space-x-1.5" data-action="already-executed">
          <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
          <span>Contract Formally Executed</span>
        </div>
      `;
    } else if (status === 'expired') {
      acceptBtnHtml = `
        <button type="button" disabled class="w-full py-3 px-4 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed text-center border border-slate-200" data-action="quote-expired">
          Quotation Validity Expired
        </button>
      `;
    } else if (status === 'in_negotiation') {
      acceptBtnHtml = `
        <button type="button" disabled class="w-full py-3 px-4 rounded-xl bg-amber-50 text-amber-700 text-xs font-semibold cursor-not-allowed text-center border border-amber-200" data-action="under-negotiation">
          Awaiting Seller Counter-Approval
        </button>
      `;
    } else if (!isSignatory) {
      acceptBtnHtml = `
        <div>
          <button type="button" disabled class="w-full py-3 px-4 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed flex items-center justify-center space-x-1.5 border border-slate-200" data-action="accept-quote-disabled" title="Only authorized corporate signatories can legally execute agreements.">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            <span>Accept & Sign Quote</span>
          </button>
          <p class="text-[11px] text-amber-700 bg-amber-50 rounded-lg p-2 mt-2 border border-amber-200 leading-snug">
            <strong>Viewer Role:</strong> Legal signatory privileges required to execute contracts.
          </p>
        </div>
      `;
    } else {
      acceptBtnHtml = `
        <button type="button" class="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2" data-action="accept-quote" data-quote-id="${quote.quote_id || ''}">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          <span>Accept & Sign Quote</span>
        </button>
      `;
    }

    const negotiateBtnHtml = canNegotiate
      ? `
        <a href="#/quotes/${quote.quote_id || 'quo_8819ab2'}/negotiate" class="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5" data-action="open-negotiate">
          <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
          <span>Propose Counter-Offer</span>
        </a>
      `
      : '';

    const declineBtnHtml = (status === 'sent' || status === 'in_negotiation')
      ? `
        <button type="button" class="w-full py-2 px-3 text-xs font-medium text-slate-500 hover:text-red-600 transition-colors text-center" data-action="reject-quote" data-quote-id="${quote.quote_id || ''}">
          Decline this quotation
        </button>
      `
      : '';

    return `
      <section class="w-full bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sticky top-24" data-component="QuotePricingSummary">
        <h3 class="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 pb-3 border-b border-slate-100">Commercial Summary</h3>

        <!-- Financial Itemized List -->
        <div class="space-y-3 text-xs mb-6">
          <div class="flex justify-between items-center text-slate-600">
            <span>Gross Subtotal</span>
            <span class="font-mono tabular-nums font-semibold text-slate-800">${formatCurrency(subtotal, currency)}</span>
          </div>

          <div class="flex justify-between items-center text-slate-600">
            <span>Customer Discounts</span>
            <span class="font-mono tabular-nums font-semibold ${discountTotal > 0 ? 'text-emerald-600' : 'text-slate-500'}">
              ${discountTotal > 0 ? `-${formatCurrency(discountTotal, currency)}` : '$0.00'}
            </span>
          </div>

          <div class="flex justify-between items-center text-slate-600">
            <span>Taxes & Duties</span>
            <span class="font-mono tabular-nums font-semibold text-slate-800">${formatCurrency(taxTotal, currency)}</span>
          </div>

          <!-- One-Time vs Recurring Charges Breakdown -->
          <div class="pt-3 border-t border-slate-100 space-y-2">
            <div class="flex justify-between items-center text-[11px] text-slate-500">
              <span class="flex items-center">
                <span class="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
                One-Time Charges
              </span>
              <span class="font-mono tabular-nums text-slate-700 font-medium">${formatCurrency(oneTimeTotal, currency)}</span>
            </div>
            <div class="flex justify-between items-center text-[11px] text-slate-500">
              <span class="flex items-center">
                <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5"></span>
                Recurring Charges (${recurringInterval})
              </span>
              <span class="font-mono tabular-nums text-slate-700 font-medium">${formatCurrency(recurringTotal, currency)}</span>
            </div>
          </div>

          <!-- Binding Total Amount -->
          <div class="pt-4 border-t-2 border-slate-900/10 flex justify-between items-baseline">
            <div>
              <span class="text-sm font-bold text-slate-900 block">Total Contract Value</span>
              <span class="text-[10px] text-slate-400 uppercase font-mono">${currency} • Binding</span>
            </div>
            <span class="text-2xl font-black font-mono tracking-tight text-slate-900 tabular-nums">${formatCurrency(totalAmount, currency)}</span>
          </div>
        </div>

        <!-- Action Triggers -->
        <div class="space-y-2.5 pt-2">
          ${acceptBtnHtml}
          ${negotiateBtnHtml}
          ${declineBtnHtml}
        </div>
      </section>
    `.trim();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuotePricingSummary };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.QuotePricingSummary = QuotePricingSummary;
  }
})(typeof window !== 'undefined' ? window : this);
