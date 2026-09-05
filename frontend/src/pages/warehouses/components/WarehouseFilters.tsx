import React from 'react';

interface WarehouseFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
  stockStatus: string;
  onStockStatusChange: (val: any) => void;
  onReset: () => void;
}

export function WarehouseFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  stockStatus,
  onStockStatusChange,
  onReset,
}: WarehouseFiltersProps) {
  const hasActiveFilters = search.trim() !== '' || category !== 'all' || stockStatus !== 'all';

  return (
    <div
      className="card p-3 flex flex-wrap items-center gap-3"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* Search */}
      <div className="flex-1 min-w-[200px] relative">
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
          placeholder="Search products, SKUs, or categories..."
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

      {/* Category */}
      <div className="flex items-center gap-1 text-xs">
        <span className="text-muted-foreground text-[11px] whitespace-nowrap">Category:</span>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="select select-sm text-xs py-1 px-2 rounded"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
        >
          <option value="all">All Categories</option>
          <option value="Computing">Computing</option>
          <option value="Displays">Displays</option>
          <option value="Hardware">Hardware</option>
          <option value="Accessories">Accessories</option>
          <option value="Software">Software</option>
        </select>
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-1 text-xs">
        <span className="text-muted-foreground text-[11px] whitespace-nowrap">Stock Level:</span>
        <select
          value={stockStatus}
          onChange={(e) => onStockStatusChange(e.target.value)}
          className="select select-sm text-xs py-1 px-2 rounded"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
        >
          <option value="all">All Stock Statuses</option>
          <option value="normal">Normal Stock</option>
          <option value="low">Low Stock (Reorder)</option>
          <option value="out_of_stock">Out of Stock (Depleted)</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="btn btn-ghost btn-xs text-xs text-muted-foreground hover:text-foreground"
        >
          ↺ Reset
        </button>
      )}
    </div>
  );
}
