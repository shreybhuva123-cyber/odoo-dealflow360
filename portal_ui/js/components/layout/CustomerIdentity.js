/**
 * DealFlow360 - CustomerIdentity Component
 * Pure presentation component showing user details, tenant organization, and signatory authorization tag.
 */
(function(root) {
  'use strict';

  function CustomerIdentity(props) {
    const user = (props && props.user) || {
      name: 'Guest User',
      email: 'guest@example.com',
      commercialPartnerName: 'Organization',
      canSignQuotes: false,
      partnerId: 0
    };

    const initials = user.name
      ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : 'DF';

    const signatoryBadge = user.canSignQuotes
      ? `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200" title="Authorized Legal Signatory">
           <svg class="w-2.5 h-2.5 mr-0.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
           Signatory
         </span>`
      : `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200" title="Review & Comment Only">
           Viewer
         </span>`;

    return `
      <div class="flex items-center space-x-3" data-component="CustomerIdentity" data-partner-id="${user.partnerId || ''}">
        <div class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-xs shadow-sm ring-2 ring-indigo-50">
          ${initials}
        </div>
        <div class="text-right hidden sm:block">
          <div class="flex items-center justify-end space-x-1.5">
            <span class="text-sm font-semibold text-slate-900 leading-tight">${user.name}</span>
            ${signatoryBadge}
          </div>
          <div class="text-xs text-slate-500 truncate max-w-[180px]">${user.commercialPartnerName}</div>
        </div>
      </div>
    `.trim();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CustomerIdentity };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.CustomerIdentity = CustomerIdentity;
  }
})(typeof window !== 'undefined' ? window : this);
