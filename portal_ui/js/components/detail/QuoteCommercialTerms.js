/**
 * DealFlow360 - QuoteCommercialTerms Component
 * Renders verified customer billing/shipping details, agreed payment terms,
 * and contractual SLA terms and conditions.
 */
(function(root) {
  'use strict';

  function QuoteCommercialTerms(props) {
    const quote = (props && props.quote) || {};
    const customer = quote.customer || {};
    const paymentTerms = quote.payment_terms || 'Net 30';
    const termsAndConditions = quote.terms_and_conditions || 'Payment due Net 30 days from invoice date.';
    const companyName = customer.company_name || 'Client Organization';
    const contactName = customer.contact_name || 'Authorized Representative';
    const billingAddress = customer.billing_address || 'Same as registered address';
    const shippingAddress = customer.shipping_address || 'Digital Delivery';

    return `
      <section class="w-full bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-6" data-component="QuoteCommercialTerms">
        <h2 class="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center">
          <svg class="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          Billing & Commercial Terms
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-6">
          <!-- Billing Entity -->
          <div class="space-y-1.5 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
            <span class="text-slate-400 uppercase font-semibold text-[10px] tracking-wider block">Billing Entity & Destination</span>
            <div class="font-bold text-slate-800 text-sm">${companyName}</div>
            <div class="text-slate-600 font-medium">Attn: ${contactName}</div>
            <div class="text-slate-500 leading-relaxed pt-1">${billingAddress}</div>
            ${shippingAddress !== billingAddress ? `<div class="text-[11px] text-slate-400 pt-1">Delivery: ${shippingAddress}</div>` : ''}
          </div>

          <!-- Payment Schedule -->
          <div class="space-y-1.5 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
            <span class="text-slate-400 uppercase font-semibold text-[10px] tracking-wider block">Payment Terms & Schedule</span>
            <div class="font-bold text-indigo-600 font-mono text-sm">${paymentTerms}</div>
            <p class="text-slate-600 leading-relaxed pt-1">Invoicing is generated immediately upon mutual contract signature or order confirmation.</p>
            <div class="text-[11px] text-slate-400 pt-1 font-mono">Currency: ${quote.currency || 'USD'} • Wire / ACH / Corporate Card</div>
          </div>
        </div>

        <!-- Contractual Terms & SLA Stipulations -->
        <div class="border-t border-slate-100 pt-4">
          <span class="text-slate-400 uppercase font-semibold text-[10px] tracking-wider block mb-2">Important Terms & Service Level Commitments</span>
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed text-xs space-y-2">
            <p>${termsAndConditions}</p>
            <div class="text-[11px] text-slate-500 pt-2 border-t border-slate-200 flex flex-wrap gap-4">
              <span>● Governing Law: State of California</span>
              <span>● Enterprise Level-2 SLA (24/7 Severity 1 Response)</span>
              <span>● SOC2 Type II Certified Data Protection</span>
            </div>
          </div>
        </div>
      </section>
    `.trim();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuoteCommercialTerms };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.QuoteCommercialTerms = QuoteCommercialTerms;
  }
})(typeof window !== 'undefined' ? window : this);
