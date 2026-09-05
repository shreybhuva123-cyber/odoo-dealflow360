/**
 * DealFlow360 Design Tokens & Theme Constants
 * Centralized semantic definitions for consistent UI across all 12 modules.
 */

export const THEME_CONFIG = {
  layout: {
    sidebarWidth: '240px',
    topbarHeight: '52px',
    maxContainerWidth: '1280px',
    cardRadius: '12px',
    buttonRadius: '8px',
  },

  // Deal Health Semantic States
  health: {
    healthy: {
      label: 'Healthy',
      badgeClass: 'badge-green',
      icon: '🟢',
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.3)',
    },
    at_risk: {
      label: 'At Risk',
      badgeClass: 'badge-amber',
      icon: '🟡',
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.3)',
    },
    critical: {
      label: 'Critical',
      badgeClass: 'badge-red',
      icon: '🔴',
      color: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)',
    },
  },

  // Multi-Level Accessible Risk Classifications (Symbol + Color + Text)
  riskLevels: {
    CRITICAL: {
      label: 'Critical Risk',
      symbol: '🔴',
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      description: 'Severe margin erosion below threshold (<15%) or deep policy violation.',
    },
    HIGH: {
      label: 'High Risk',
      symbol: '🟠',
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      description: 'Significant discount requires multi-tier management signoff.',
    },
    MEDIUM: {
      label: 'Medium Risk',
      symbol: '🟡',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      description: 'Standard discount within manager approval authority.',
    },
    LOW: {
      label: 'Low Risk',
      symbol: '🟢',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      description: 'Automated policy compliant. Zero manual review required.',
    },
  },

  // Quotation Lifecycle Status Badges
  quotationStatus: {
    DRAFT: { label: 'Draft', badgeClass: 'badge-gray', color: '#94A3B8' },
    PENDING_APPROVAL: { label: 'Pending Approval', badgeClass: 'badge-amber', color: '#F59E0B' },
    APPROVED: { label: 'Approved', badgeClass: 'badge-green', color: '#10B981' },
    REJECTED: { label: 'Rejected', badgeClass: 'badge-red', color: '#EF4444' },
    NEGOTIATION: { label: 'Negotiation', badgeClass: 'badge-blue', color: '#3B82F6' },
    CONFIRMED: { label: 'Confirmed', badgeClass: 'badge-green', color: '#10B981' },
    EXPIRED: { label: 'Expired', badgeClass: 'badge-gray', color: '#64748B' },
  },

  // Commercial Invoice Status Badges
  invoiceStatus: {
    draft: { label: 'Draft', color: 'text-slate-400', bg: 'bg-slate-500/10' },
    pending: { label: 'Pending Payment', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    partially_paid: { label: 'Partially Paid', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    paid: { label: 'Paid & Settled', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    overdue: { label: 'Overdue', color: 'text-rose-400', bg: 'bg-rose-500/10' },
    cancelled: { label: 'Cancelled', color: 'text-slate-500', bg: 'bg-slate-500/10' },
  },

  // Responsive Breakpoint Queries
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;
