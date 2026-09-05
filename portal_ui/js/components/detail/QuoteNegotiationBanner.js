/**
 * DealFlow360 - QuoteNegotiationBanner Component
 * Contextual alert and status tracker rendering multi-stage approval indicators,
 * active negotiation ETAs, contract execution order links, or expiration warnings.
 */
(function(root) {
  'use strict';

  function formatDate(isoStr) {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return isoStr.substring(0, 10);
    }
  }

  function formatDateTime(isoStr) {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return isoStr;
    }
  }

  function QuoteNegotiationBanner(props) {
    const quote = (props && props.quote) || {};
    const negotiation = (props && props.negotiation) || null;
    const status = (quote && quote.status) || 'sent';
    const hasNeg = quote.negotiation_status && quote.negotiation_status !== 'none';

    // 1. IN NEGOTIATION STATE (Active Seller / Deal Desk Review)
    if (status === 'in_negotiation' || hasNeg) {
      const approval = (negotiation && negotiation.approval_status) || {
        public_stage_name: 'Commercial Management Review',
        stage_number: 1,
        total_stages: 2,
        estimated_resolution: '2026-09-06T12:00:00Z'
      };
      const stageName = approval.public_stage_name || 'Commercial Review';
      const stageNum = approval.stage_number || 1;
      const totalStages = approval.total_stages || 2;
      const etaStr = approval.estimated_resolution ? formatDateTime(approval.estimated_resolution) : 'Within 24 business hours';
      const requestType = (negotiation && negotiation.active_negotiation_type === 'counter_discount')
        ? 'Counter-Discount Proposal'
        : 'Commercial Scope Change Request';

      return `
        <section class="w-full mb-6 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 shadow-xs" data-component="QuoteNegotiationBanner" data-banner-type="negotiating">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <!-- Left: Status & Stage Explanation -->
            <div class="space-y-1.5">
              <div class="flex items-center space-x-2">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5 animate-pulse"></span>
                  Negotiation In Progress
                </span>
                <span class="text-xs font-mono font-medium text-amber-800">${requestType}</span>
              </div>
              <p class="text-sm font-medium text-amber-950">
                Your proposed adjustments are currently in <strong class="font-bold underline decoration-amber-400">${stageName}</strong>.
              </p>
              <div class="flex flex-wrap items-center gap-3 text-xs text-amber-800/80">
                <span class="flex items-center">
                  <svg class="w-3.5 h-3.5 mr-1 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Est. Resolution: <strong class="ml-1 text-amber-900 font-semibold">${etaStr}</strong>
                </span>
              </div>
            </div>

            <!-- Right: Visual Stage Tracker & Action -->
            <div class="flex flex-col sm:flex-row sm:items-center gap-4">
              <!-- Stage Progress Indicators -->
              <div class="flex items-center space-x-2 bg-white/80 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-amber-200/80" data-component="ApprovalStageTracker">
                <div class="flex items-center space-x-1.5 text-xs font-medium">
                  <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${stageNum >= 1 ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'}">1</span>
                  <span class="${stageNum === 1 ? 'text-amber-900 font-bold' : 'text-slate-500'}">Review</span>
                </div>
                <svg class="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
                <div class="flex items-center space-x-1.5 text-xs font-medium">
                  <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${stageNum >= 2 ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'}">2</span>
                  <span class="${stageNum === 2 ? 'text-amber-900 font-bold' : 'text-slate-500'}">Deal Desk</span>
                </div>
              </div>

              <!-- Action Link -->
              <a href="#/quotes/${quote.quote_id || 'quo_8819ab2'}/negotiate" class="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors whitespace-nowrap" data-action="view-negotiation">
                View Workspace
                <svg class="w-3.5 h-3.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </section>
      `.trim();
    }

    // 2. APPROVED & EXECUTED STATE
    if (status === 'approved') {
      const orderRef = quote.reference_order_number || 'SO-2026-1184';
      const confirmedDate = quote.confirmed_at ? formatDate(quote.confirmed_at) : 'Recently Executed';

      return `
        <section class="w-full mb-6 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 shadow-xs" data-component="QuoteNegotiationBanner" data-banner-type="approved">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-start space-x-3">
              <div class="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <span class="text-xs font-bold uppercase tracking-wider text-emerald-800">Order Executed</span>
                  <span class="font-mono text-xs font-bold text-emerald-950 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200">${orderRef}</span>
                </div>
                <p class="text-sm font-medium text-emerald-900 mt-0.5">
                  This proposal was approved and legally executed on <strong class="font-semibold">${confirmedDate}</strong>.
                </p>
              </div>
            </div>
            <button type="button" class="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors whitespace-nowrap" data-action="download-executed-contract">
              <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              Download Signed Contract
            </button>
          </div>
        </section>
      `.trim();
    }

    // 3. EXPIRED STATE
    if (status === 'expired') {
      const expDate = quote.expiration_date ? formatDate(quote.expiration_date) : 'Recently';

      return `
        <section class="w-full mb-6 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 shadow-xs" data-component="QuoteNegotiationBanner" data-banner-type="expired">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-start space-x-3">
              <div class="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div>
                <span class="text-xs font-bold uppercase tracking-wider text-rose-800">Quotation Expired</span>
                <p class="text-sm font-medium text-rose-950 mt-0.5">
                  The validity window for this proposal ended on <strong class="font-semibold">${expDate}</strong>. Pricing and delivery schedules require revalidation.
                </p>
              </div>
            </div>
            <button type="button" class="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors whitespace-nowrap" data-action="request-extension">
              Request Extension
            </button>
          </div>
        </section>
      `.trim();
    }

    // 4. REJECTED STATE
    if (status === 'rejected') {
      return `
        <section class="w-full mb-6 p-4 md:p-5 rounded-2xl bg-slate-100 border border-slate-200 shadow-xs" data-component="QuoteNegotiationBanner" data-banner-type="rejected">
          <div class="flex items-center space-x-3 text-slate-700">
            <svg class="w-5 h-5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
            <p class="text-xs font-medium">
              This proposal was marked as declined. To re-open discussions, contact your dedicated account executive.
            </p>
          </div>
        </section>
      `.trim();
    }

    // Default sent / normal state (No persistent alert needed)
    return '';
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuoteNegotiationBanner };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.QuoteNegotiationBanner = QuoteNegotiationBanner;
  }
})(typeof window !== 'undefined' ? window : this);
