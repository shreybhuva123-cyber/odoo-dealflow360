import React, { useState, useMemo } from 'react';
import {
  usePipeline,
  usePipelineStats,
  useUpdateDealStage,
  useCreateDeal,
} from '@/hooks/usePipeline';
import {
  PipelineStats,
  PipelineToolbar,
  PipelineBoard,
  PipelineTable,
  PipelineEmptyState,
  NewDealDialog,
} from './components';
import { DealStage, PipelineFilterOptions, Deal } from '@/types';
import { useAuthStore } from '@/stores/auth.store';

export function PipelinePage() {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [filters, setFilters] = useState<PipelineFilterOptions>({
    search: '',
    owner: 'ALL',
    stage: 'ALL',
    health: 'ALL',
  });
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);

  const { data: deals = [], isLoading: isDealsLoading } = usePipeline(filters);
  const { data: stats, isLoading: isStatsLoading } = usePipelineStats();

  const updateStageMutation = useUpdateDealStage();
  const createDealMutation = useCreateDeal();

  // Extract unique owners for dropdown
  const uniqueOwners = useMemo(() => {
    const set = new Set<string>();
    deals.forEach((d) => {
      if (d.ownerName) set.add(d.ownerName);
    });
    return Array.from(set).sort();
  }, [deals]);

  const handleMoveDeal = (dealId: string, targetStage: DealStage) => {
    updateStageMutation.mutate({
      dealId,
      stage: targetStage,
      authorName: user?.name || 'Alex Morgan',
      authorRole: role?.replace('_', ' ') || 'Sales Representative',
    });
  };

  const handleCreateDeal = (dealData: Partial<Deal>) => {
    setIsNewDealOpen(false);
    createDealMutation.mutate(dealData);
  };

  const hasActiveFilters = Boolean(
    filters.search ||
      (filters.owner && filters.owner !== 'ALL') ||
      (filters.stage && filters.stage !== 'ALL') ||
      (filters.health && filters.health !== 'ALL')
  );

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <span>Sales Pipeline & Deal Flow</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time visual deal orchestration, probability weighting, and margin health monitoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn btn-primary btn-sm font-semibold text-xs"
            onClick={() => setIsNewDealOpen(true)}
          >
            + New Deal
          </button>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <PipelineStats stats={stats} isLoading={isStatsLoading} />

      {/* Search & Filter Toolbar */}
      <PipelineToolbar
        filters={filters}
        onFilterChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenNewDeal={() => setIsNewDealOpen(true)}
        owners={uniqueOwners}
      />

      {/* Main Content Area (Kanban vs Table) */}
      {isDealsLoading ? (
        <div className="card text-center py-24">
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
          <div className="text-base font-semibold text-foreground">Loading Pipeline Deals...</div>
          <div className="text-xs text-muted-foreground mt-1">
            Analyzing opportunity stages, velocity, and health indicators
          </div>
        </div>
      ) : deals.length === 0 ? (
        <PipelineEmptyState
          hasFilters={hasActiveFilters}
          onClearFilters={() =>
            setFilters({ search: '', owner: 'ALL', stage: 'ALL', health: 'ALL' })
          }
          onOpenNewDeal={() => setIsNewDealOpen(true)}
        />
      ) : viewMode === 'kanban' ? (
        <PipelineBoard deals={deals} onMoveDeal={handleMoveDeal} />
      ) : (
        <PipelineTable deals={deals} isLoading={isDealsLoading} />
      )}

      {/* New Deal Creation Modal */}
      <NewDealDialog
        isOpen={isNewDealOpen}
        onClose={() => setIsNewDealOpen(false)}
        onConfirm={handleCreateDeal}
        isLoading={createDealMutation.isPending}
      />
    </div>
  );
}
