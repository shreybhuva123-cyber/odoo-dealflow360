import React from 'react';
import { NotificationFilterOptions, NotificationPriority } from '@/types';

interface NotificationFiltersProps {
  filters: NotificationFilterOptions;
  onChange: (filters: NotificationFilterOptions) => void;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  totalCount: number;
  unreadCount: number;
}

export function NotificationFilters({
  filters,
  onChange,
  activeCategory,
  onCategoryChange,
  totalCount,
  unreadCount,
}: NotificationFiltersProps) {
  const categories = [
    { id: 'ALL', label: 'All', count: totalCount },
    { id: 'UNREAD', label: 'Unread', count: unreadCount },
    { id: 'APPROVALS', label: 'Approvals' },
    { id: 'RISK', label: 'Risk & Health' },
    { id: 'FINANCE', label: 'Billing & Invoices' },
    { id: 'PORTAL', label: 'Customer Portal' },
    { id: 'FULFILLMENT', label: 'Fulfillment' },
  ];

  return (
    <div className="space-y-3">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/60">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'bg-accent text-accent-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface2'
              }`}
            >
              <span>{cat.label}</span>
              {typeof cat.count === 'number' && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-accent-foreground/20 text-accent-foreground'
                      : 'bg-surface3 text-muted-foreground'
                  }`}
                >
                  {cat.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search & Priority Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <input
            type="text"
            placeholder="Search alerts by title, keyword, deal, or user..."
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="input input-sm w-full pl-8 text-xs bg-surface border-border/80"
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

        <div className="flex items-center gap-2">
          {/* Priority dropdown */}
          <select
            value={filters.priority || ''}
            onChange={(e) =>
              onChange({
                ...filters,
                priority: (e.target.value as NotificationPriority) || undefined,
              })
            }
            className="input input-sm text-xs bg-surface border-border/80 min-w-[120px]"
          >
            <option value="">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          {/* Reset Filters */}
          {(filters.search || filters.priority || activeCategory !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                onChange({});
                onCategoryChange('ALL');
              }}
              className="btn btn-ghost btn-sm text-xs text-muted-foreground hover:text-foreground"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
