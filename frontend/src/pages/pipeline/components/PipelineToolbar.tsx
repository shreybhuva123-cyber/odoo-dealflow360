import React from 'react';
import { PipelineFilterOptions, PIPELINE_STAGES } from '@/types';

interface PipelineToolbarProps {
  filters: PipelineFilterOptions;
  onFilterChange: (filters: PipelineFilterOptions) => void;
  viewMode: 'kanban' | 'table';
  onViewModeChange: (mode: 'kanban' | 'table') => void;
  onOpenNewDeal: () => void;
  owners: string[];
}

export const PipelineToolbar: React.FC<PipelineToolbarProps> = ({
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  onOpenNewDeal,
  owners = [],
}) => {
  const hasActiveFilters =
    !!filters.search ||
    (filters.owner && filters.owner !== 'ALL') ||
    (filters.stage && filters.stage !== 'ALL') ||
    (filters.health && filters.health !== 'ALL');

  const handleClear = () => {
    onFilterChange({
      search: '',
      owner: 'ALL',
      stage: 'ALL',
      health: 'ALL',
    });
  };

  return (
    <div className="card mb-6">
      <div className="card-body p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Side: Search */}
        <div className="flex-1 max-w-sm">
          <input
            type="text"
            className="field-input w-full text-xs"
            placeholder="Search deals, customers, deal ID..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          />
        </div>

        {/* Middle: Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Owner Filter */}
          <select
            className="field-input text-xs py-1"
            value={filters.owner || 'ALL'}
            onChange={(e) => onFilterChange({ ...filters, owner: e.target.value })}
          >
            <option value="ALL">All Owners</option>
            {owners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>

          {/* Stage Filter */}
          <select
            className="field-input text-xs py-1"
            value={filters.stage || 'ALL'}
            onChange={(e) => onFilterChange({ ...filters, stage: e.target.value })}
          >
            <option value="ALL">All Stages</option>
            {PIPELINE_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Health Filter */}
          <select
            className="field-input text-xs py-1"
            value={filters.health || 'ALL'}
            onChange={(e) => onFilterChange({ ...filters, health: e.target.value })}
          >
            <option value="ALL">All Health</option>
            <option value="healthy">Healthy 🟢</option>
            <option value="at_risk">At Risk 🟡</option>
            <option value="critical">Critical 🔴</option>
          </select>

          {hasActiveFilters && (
            <button
              className="btn btn-ghost btn-xs text-xs"
              onClick={handleClear}
              title="Reset all filters"
            >
              Reset
            </button>
          )}
        </div>

        {/* Right Side: View Switcher & Action */}
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div
            style={{
              display: 'flex',
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '2px',
            }}
          >
            <button
              className={`btn btn-xs ${viewMode === 'kanban' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => onViewModeChange('kanban')}
              style={{ padding: '3px 8px', fontSize: '11px' }}
              title="Kanban Board View"
            >
              🗂️ Kanban
            </button>
            <button
              className={`btn btn-xs ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => onViewModeChange('table')}
              style={{ padding: '3px 8px', fontSize: '11px' }}
              title="Table List View"
            >
              📋 Table
            </button>
          </div>

          <button
            className="btn btn-primary btn-sm text-xs font-semibold"
            onClick={onOpenNewDeal}
          >
            + New Deal
          </button>
        </div>
      </div>
    </div>
  );
};
