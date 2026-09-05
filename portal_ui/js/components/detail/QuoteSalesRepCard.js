/**
 * DealFlow360 - QuoteSalesRepCard Component
 * Displays dedicated account executive contact card with communication trigger.
 */
(function(root) {
  'use strict';

  function QuoteSalesRepCard(props) {
    const quote = (props && props.quote) || {};
    const salesRep = quote.sales_rep || {};
    const name = salesRep.name || 'DealFlow360 Sales Team';
    const email = salesRep.email || 'sales@dealflow360.com';
    const phone = salesRep.phone || '+1 (555) 302-8811';
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'DF';

    return `
      <section class="w-full bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-6" data-component="QuoteSalesRepCard">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 pb-3 border-b border-slate-100">Dedicated Account Executive</h3>

        <div class="flex items-center space-x-3 mb-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            ${initials}
          </div>
          <div>
            <div class="font-bold text-sm text-slate-900">${name}</div>
            <div class="text-xs text-slate-500">Enterprise Solutions Architect</div>
          </div>
        </div>

        <div class="space-y-2 text-xs text-slate-600 mb-4 pt-1">
          <div class="flex items-center">
            <svg class="w-3.5 h-3.5 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            <a href="mailto:${email}" class="hover:text-indigo-600 truncate transition-colors">${email}</a>
          </div>
          ${phone ? `
            <div class="flex items-center">
              <svg class="w-3.5 h-3.5 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              <span class="font-mono text-slate-700">${phone}</span>
            </div>
          ` : ''}
          <div class="flex items-center text-emerald-600 font-medium text-[11px] pt-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
            Typically responds within 1 hour
          </div>
        </div>

        <button type="button" class="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-xs" data-action="open-discussion" data-quote-id="${quote.quote_id || ''}">
          <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
          <span>Message Account Team</span>
        </button>
      </section>
    `.trim();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuoteSalesRepCard };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.QuoteSalesRepCard = QuoteSalesRepCard;
  }
})(typeof window !== 'undefined' ? window : this);
