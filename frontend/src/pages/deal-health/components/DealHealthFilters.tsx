import React from 'react';
import { DealHealthFilterOptions, DealHealthStatus, RiskLevel } from '@/types';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface DealHealthFiltersProps {
  filters: DealHealthFilterOptions;
  onChange: (filters: DealHealthFilterOptions) => void;
  onReset: () => void;
}

export function DealHealthFilters({ filters, onChange, onReset }: DealHealthFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value });
  };

  const handleHealthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, health: e.target.value as DealHealthStatus | 'ALL' });
  };

  const handleRiskChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, riskLevel: e.target.value as RiskLevel | 'ALL' });
  };

  const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, stage: e.target.value });
  };

  const handleOwnerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, ownerId: e.target.value });
  };

  const isFiltered =
    !!filters.search ||
    filters.health !== 'ALL' ||
    filters.riskLevel !== 'ALL' ||
    filters.stage !== 'ALL' ||
    filters.ownerId !== 'ALL';

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm backdrop-blur space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="text"
            value={filters.search || ''}
            onChange={handleSearchChange}
            placeholder="Search deals by name, customer, or owner..."
            className="pl-9 h-9 bg-slate-950 border-slate-700 text-xs text-white placeholder:text-slate-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Health status */}
          <select
            value={filters.health || 'ALL'}
            onChange={handleHealthChange}
            className="h-9 rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Health: All</option>
            <option value="HEALTHY">🟢 Healthy</option>
            <option value="AT_RISK">🟡 At Risk</option>
            <option value="CRITICAL">🔴 Critical</option>
          </select>

          {/* Risk Level */}
          <select
            value={filters.riskLevel || 'ALL'}
            onChange={handleRiskChange}
            className="h-9 rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Risk: All</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>

          {/* Stage */}
          <select
            value={filters.stage || 'ALL'}
            onChange={handleStageChange}
            className="h-9 rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Stage: All</option>
            <option value="lead">Lead</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="negotiation">Negotiation</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>

          {/* Owner */}
          <select
            value={filters.ownerId || 'ALL'}
            onChange={handleOwnerChange}
            className="h-9 rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Owner: All</option>
            <option value="usr_rep_rahul">Rahul Sharma</option>
            <option value="usr_rep_alex">Alex Morgan</option>
            <option value="usr_rep_sarah">Sarah Jenkins</option>
            <option value="usr_rep_patel">S. Patel</option>
            <option value="usr_rep_liu">J. Liu</option>
          </select>

          {isFiltered && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReset}
              className="h-9 border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
