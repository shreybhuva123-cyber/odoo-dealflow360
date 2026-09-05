/**
 * DealFlow360 - NegotiationStatusBadge Component
 * Pure presentational badge indicating active review ownership during negotiation.
 */
(function(root) {
  'use strict';

  const NEG_STATUS_CONFIGS = {
    pending_seller_review: {
      label: 'Awaiting Seller Review',
      bgClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconSvg: '<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
    },
    pending_buyer_review: {
      label: 'Action Required: Your Review',
      bgClass: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold',
      attentionDot: true,
      iconSvg: '<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>'
    },
    approved_by_seller: {
      label: 'Revised Terms Approved',
      bgClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      iconSvg: '<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>'
    },
    declined_by_seller: {
      label: 'Counter-Offer Declined',
      bgClass: 'bg-rose-50 text-rose-800 border-rose-300',
      iconSvg: '<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>'
    }
  };

  function NegotiationStatusBadge(props) {
    const status = (props && props.status) || 'pending_seller_review';
    const config = NEG_STATUS_CONFIGS[status] || NEG_STATUS_CONFIGS.pending_seller_review;
    const size = (props && props.size) === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';
    const attentionDot = config.attentionDot
      ? '<span class="relative flex h-2 w-2 mr-1.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span></span>'
      : '';

    return `
      <span class="inline-flex items-center rounded-full border ${size} ${config.bgClass}" data-component="NegotiationStatusBadge" data-status="${status}">
        ${attentionDot}
        ${config.iconSvg}
        <span>${config.label}</span>
      </span>
    `.trim();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NegotiationStatusBadge, NEG_STATUS_CONFIGS };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.NegotiationStatusBadge = NegotiationStatusBadge;
  }
})(typeof window !== 'undefined' ? window : this);
