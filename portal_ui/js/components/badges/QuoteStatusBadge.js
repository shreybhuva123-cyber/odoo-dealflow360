/**
 * DealFlow360 - QuoteStatusBadge Component
 * Pure presentational status badge with color coding, icons, and pulse states.
 */
(function(root) {
  'use strict';

  const STATUS_CONFIGS = {
    draft: {
      label: 'Draft',
      bgClass: 'bg-slate-100 text-slate-700 border-slate-200',
      iconSvg: '<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>'
    },
    sent: {
      label: 'Pending Review',
      bgClass: 'bg-blue-50 text-blue-700 border-blue-200',
      iconSvg: '<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
    },
    in_negotiation: {
      label: 'In Negotiation',
      bgClass: 'bg-amber-50 text-amber-800 border-amber-300',
      pulse: true,
      iconSvg: '<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>'
    },
    approved: {
      label: 'Approved & Signed',
      bgClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      iconSvg: '<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
    },
    rejected: {
      label: 'Declined',
      bgClass: 'bg-rose-50 text-rose-800 border-rose-300',
      iconSvg: '<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
    },
    expired: {
      label: 'Expired',
      bgClass: 'bg-zinc-100 text-zinc-500 border-zinc-300',
      iconSvg: '<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>'
    }
  };

  const SIZE_CONFIGS = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  function QuoteStatusBadge(props) {
    const status = (props && props.status) || 'draft';
    const size = (props && props.size) || 'md';
    const showIcon = props && typeof props.showIcon === 'boolean' ? props.showIcon : true;
    const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.draft;
    const sizeClass = SIZE_CONFIGS[size] || SIZE_CONFIGS.md;
    const pulseAttr = config.pulse || (props && props.pulse) ? ' data-pulse="true"' : '';
    const pulseDot = config.pulse || (props && props.pulse)
      ? '<span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping mr-1.5"></span>'
      : '';

    return `
      <span class="inline-flex items-center font-medium rounded-full border ${sizeClass} ${config.bgClass}" data-component="QuoteStatusBadge" data-status="${status}"${pulseAttr}>
        ${pulseDot}
        ${showIcon ? config.iconSvg : ''}
        <span>${config.label}</span>
      </span>
    `.trim();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuoteStatusBadge, STATUS_CONFIGS };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.QuoteStatusBadge = QuoteStatusBadge;
  }
})(typeof window !== 'undefined' ? window : this);
