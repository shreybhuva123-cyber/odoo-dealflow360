import React from 'react';
import { ProductFilterOptions } from '@/types';

interface ProductFiltersProps {
  filters: ProductFilterOptions;
  onChange: (filters: ProductFilterOptions) => void;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  categories: string[];
}

export function ProductFilters({
  filters,
  onChange,
  viewMode,
  onViewModeChange,
  categories,
}: ProductFiltersProps) {
  return (
    <div className="card p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <input
            type="text"
            className="field-input w-full pl-9"
            placeholder="Search products by SKU, name, tags..."
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
          />
          <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">
            🔍
          </span>
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: '' })}
              className="absolute right-3 top-2 text-muted-foreground hover:text-foreground text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category */}
          <select
            className="field-input py-1.5 px-3 text-sm h-9 min-w-[130px]"
            value={filters.category || 'ALL'}
            onChange={(e) =>
              onChange({
                ...filters,
                category: e.target.value === 'ALL' ? undefined : e.target.value,
              })
            }
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Product Type */}
          <select
            className="field-input py-1.5 px-3 text-sm h-9 min-w-[130px]"
            value={filters.type || 'ALL'}
            onChange={(e) =>
              onChange({
                ...filters,
                type: e.target.value === 'ALL' ? undefined : e.target.value,
              })
            }
          >
            <option value="ALL">All Types</option>
            <option value="PHYSICAL">Physical / Hardware</option>
            <option value="SUBSCRIPTION">Subscription / SaaS</option>
            <option value="SERVICE">Service</option>
          </select>

          {/* Status */}
          <select
            className="field-input py-1.5 px-3 text-sm h-9 min-w-[110px]"
            value={filters.status || 'ALL'}
            onChange={(e) =>
              onChange({
                ...filters,
                status: e.target.value === 'ALL' ? undefined : e.target.value,
              })
            }
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>

          {/* Reset Filters button if any active */}
          {(filters.search || filters.category || filters.type || filters.status) && (
            <button
              className="btn btn-ghost btn-sm h-9 text-xs"
              onClick={() => onChange({})}
            >
              Reset
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center rounded border border-border overflow-hidden ml-auto md:ml-2">
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-muted text-muted-foreground'
              }`}
              onClick={() => onViewModeChange('table')}
              title="Table View"
            >
              ☰ Table
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-muted text-muted-foreground'
              }`}
              onClick={() => onViewModeChange('grid')}
              title="Grid View"
            >
              ☵ Grid
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
