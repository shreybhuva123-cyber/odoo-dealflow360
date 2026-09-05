import React from 'react';

interface InvoiceFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  dateRange: string;
  onDateRangeChange: (val: string) => void;
  onReset: () => void;
}

export function InvoiceFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  dateRange,
  onDateRangeChange,
  onReset,
}: InvoiceFiltersProps) {
  const hasActiveFilters = search.trim() !== '' || status !== 'all' || dateRange !== 'all';

  return (
    <div
      className="card p-3 flex flex-wrap items-center gap-3"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* Search Bar */}
      <div className="flex-1 min-w-[220px] relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          style={{ fontSize: '13px' }}
        >
          🔍
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by invoice #, client, deal, or product..."
          className="input input-sm w-full pl-8 text-xs"
          style={{ background: 'var(--surface2)' }}
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-1 text-xs">
        <span className="text-muted-foreground text-[11px] whitespace-nowrap">Status:</span>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="select select-sm text-xs py-1 px-2 rounded"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
        >
          <option value="all">All Invoices</option>
          <option value="pending">Pending Payment</option>
          <option value="overdue">Overdue ⚠</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="paid">Paid ✓</option>
          <option value="draft">Draft</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-1 text-xs">
        <span className="text-muted-foreground text-[11px] whitespace-nowrap">Due Date:</span>
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          className="select select-sm text-xs py-1 px-2 rounded"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
        >
          <option value="all">All Dates</option>
          <option value="today">Due Today</option>
          <option value="this_week">Due This Week</option>
          <option value="this_month">Due This Month</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="btn btn-ghost btn-xs text-xs text-muted-foreground hover:text-foreground"
        >
          ↺ Clear
        </button>
      )}
    </div>
  );
}
