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
import { GitPullRequest, Plus, Loader2 } from 'lucide-react';
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
    <div className="space-y-5 animate-fade-in">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <GitPullRequest className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              Sales Pipeline & Deal Flow
            </h1>
            <p className="text-xs text-muted-foreground">
              Real-time visual deal orchestration, probability weighting, and margin health monitoring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all active:scale-95"
            onClick={() => setIsNewDealOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            New Deal
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
        <div className="bg-card border border-border rounded-xl text-center py-20 flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
          <div className="text-sm font-semibold text-foreground">Loading Pipeline Deals...</div>
          <div className="text-xs text-muted-foreground">
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
