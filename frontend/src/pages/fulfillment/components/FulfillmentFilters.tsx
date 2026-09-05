import React from 'react';
import { Warehouse } from '@/types';

interface FulfillmentFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (status: string) => void;
  warehouseId: string;
  onWarehouseChange: (whId: string) => void;
  priority: string;
  onPriorityChange: (priority: string) => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  warehouses?: Warehouse[];
  onReset: () => void;
}

export function FulfillmentFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  warehouseId,
  onWarehouseChange,
  priority,
  onPriorityChange,
  dateRange,
  onDateRangeChange,
  warehouses = [],
  onReset,
}: FulfillmentFiltersProps) {
  const hasActiveFilters =
    search.trim() !== '' ||
    status !== 'all' ||
    warehouseId !== 'all' ||
    priority !== 'all' ||
    dateRange !== 'all';

  return (
    <div
      className="card p-3 flex flex-wrap items-center gap-3"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* Search Field */}
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
          placeholder="Search by ID, customer, deal, or SKU..."
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
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="allocated">Allocated</option>
          <option value="processing">Processing</option>
          <option value="ready">Ready to Ship</option>
          <option value="shipped">Shipped</option>
          <option value="partially_delivered">Partially Fulfilled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Warehouse Filter */}
      <div className="flex items-center gap-1 text-xs">
        <span className="text-muted-foreground text-[11px] whitespace-nowrap">Warehouse:</span>
        <select
          value={warehouseId}
          onChange={(e) => onWarehouseChange(e.target.value)}
          className="select select-sm text-xs py-1 px-2 rounded"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
        >
          <option value="all">All Hubs</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.city} ({w.code})
            </option>
          ))}
        </select>
      </div>

      {/* Priority Filter */}
      <div className="flex items-center gap-1 text-xs">
        <span className="text-muted-foreground text-[11px] whitespace-nowrap">Priority:</span>
        <select
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="select select-sm text-xs py-1 px-2 rounded"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-1 text-xs">
        <span className="text-muted-foreground text-[11px] whitespace-nowrap">Date:</span>
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          className="select select-sm text-xs py-1 px-2 rounded"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="this_week">This Week</option>
          <option value="this_month">This Month</option>
        </select>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="btn btn-ghost btn-xs text-xs text-muted-foreground hover:text-foreground"
          title="Reset all filters"
        >
          ↺ Clear
        </button>
      )}
    </div>
  );
}
