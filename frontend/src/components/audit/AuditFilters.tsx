import React from 'react';
import { AuditLogFilterOptions } from '@/types';

interface AuditFiltersProps {
  filters: AuditLogFilterOptions;
  onChange: (filters: AuditLogFilterOptions) => void;
  onExportLogs?: () => void;
}

export function AuditFilters({ filters, onChange, onExportLogs }: AuditFiltersProps) {
  const entityTypes = [
    { value: 'ALL', label: 'All Entities' },
    { value: 'Quotation', label: 'Quotations' },
    { value: 'Deal', label: 'Deals & Pipeline' },
    { value: 'Approval', label: 'Approvals' },
    { value: 'PricingRule', label: 'Pricing Rules' },
    { value: 'Fulfillment', label: 'Fulfillment & Stock' },
    { value: 'Invoice', label: 'Invoices & Billing' },
    { value: 'SystemSettings', label: 'Governance & Settings' },
  ];

  const actions = [
    { value: 'ALL', label: 'All Actions' },
    { value: 'QUOTE_SUBMITTED', label: 'Quote Submitted' },
    { value: 'QUOTE_APPROVED', label: 'Quote Approved' },
    { value: 'QUOTE_REJECTED', label: 'Quote Rejected' },
    { value: 'DEAL_STAGE_CHANGED', label: 'Deal Stage Changed' },
    { value: 'STOCK_ALLOCATED', label: 'Stock Allocated' },
    { value: 'PAYMENT_RECORDED', label: 'Payment Recorded' },
    { value: 'RULE_UPDATED', label: 'Pricing Rule Updated' },
    { value: 'SETTINGS_UPDATED', label: 'Settings Updated' },
  ];

  const hasActiveFilters = Boolean(
    filters.search ||
      (filters.entityType && filters.entityType !== 'ALL') ||
      (filters.action && filters.action !== 'ALL')
  );

  return (
    <div className="bg-surface border border-border/70 rounded-xl p-4 space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search audit trail by actor, action, record name, or reference ID..."
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="input input-sm w-full pl-8 text-xs bg-surface2/40 border-border/70"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
            🔍
          </span>
          {filters.search && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onExportLogs && (
            <button
              type="button"
              onClick={onExportLogs}
              className="btn btn-secondary btn-sm text-xs flex items-center gap-1.5"
              title="Export audit logs as JSON file for compliance review"
            >
              <span>📥</span>
              <span>Export Audit Trail</span>
            </button>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => onChange({ search: '', entityType: 'ALL', action: 'ALL' })}
              className="btn btn-ghost btn-sm text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
        <div>
          <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
            Target Entity
          </label>
          <select
            value={filters.entityType || 'ALL'}
            onChange={(e) => onChange({ ...filters, entityType: e.target.value })}
            className="input input-sm w-full text-xs bg-surface2/30 border-border/70"
          >
            {entityTypes.map((et) => (
              <option key={et.value} value={et.value}>
                {et.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
            Audit Action
          </label>
          <select
            value={filters.action || 'ALL'}
            onChange={(e) => onChange({ ...filters, action: e.target.value })}
            className="input input-sm w-full text-xs bg-surface2/30 border-border/70"
          >
            {actions.map((act) => (
              <option key={act.value} value={act.value}>
                {act.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
            Security Guarantee
          </label>
          <div className="h-8 rounded-lg bg-emerald-500/5 border border-emerald-500/20 px-2.5 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <span>🛡️</span>
            <span>Append-Only Tamper-Evident</span>
          </div>
        </div>
      </div>
    </div>
  );
}
