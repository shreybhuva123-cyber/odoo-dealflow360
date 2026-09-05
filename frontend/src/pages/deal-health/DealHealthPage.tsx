import React, { useState } from 'react';
import { DealHealthFilterOptions, DealHealthStatus } from '@/types';
import { useDealHealthDashboard } from '@/hooks/useDealHealth';
import { showToast } from '@/stores/toast.store';
import {
  HealthOverviewCards,
  HealthDistributionChart,
  HealthTrendChart,
  PipelineHealthChart,
  MarginErosionChart,
  DiscountRiskCard,
  StalledDealsCard,
  ApprovalBottleneckCard,
  HighRiskDealsTable,
  DealHealthFilters,
  DealHealthDashboardSkeleton,
} from './components';
import { Button } from '@/components/ui/button';
import { HeartPulse, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

export function DealHealthPage() {
  const [filters, setFilters] = useState<DealHealthFilterOptions>({
    search: '',
    health: 'ALL',
    riskLevel: 'ALL',
    stage: 'ALL',
    ownerId: 'ALL',
    timeRange: '30d',
  });

  const { data, isLoading, refetch, isFetching } = useDealHealthDashboard(filters);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      health: 'ALL',
      riskLevel: 'ALL',
      stage: 'ALL',
      ownerId: 'ALL',
      timeRange: '30d',
    });
  };

  const handleStatusFilter = (status: DealHealthStatus | 'ALL') => {
    setFilters((prev) => ({
      ...prev,
      health: status,
    }));
  };

  const handleRefresh = async () => {
    await refetch();
    showToast('Deal health telemetry refreshed with latest signals', 'blue');
  };

  if (isLoading || !data) {
    return <DealHealthDashboardSkeleton />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-600/20 border border-rose-500/30 text-rose-400">
              <HeartPulse className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Deal Health & Risk Intelligence Dashboard
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time anomaly detection, margin erosion surveillance, and discount compliance telemetry
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
            className="border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? 'Refreshing...' : 'Run Health Check'}</span>
          </Button>
        </div>
      </div>

      {/* Intelligent AI Alert Banner */}
      <div className="rounded-xl border border-amber-800/40 bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-rose-950/20 p-4 text-xs text-amber-300 backdrop-blur flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <span className="font-semibold text-white">
              Intelligent Pipeline Summary: {data.kpis.criticalDealsCount + data.kpis.atRiskDealsCount} deals require attention
            </span>
            <p className="text-amber-300/80 text-[11px] mt-0.5">
              Pipeline health index sits at <strong className="text-white font-mono">{data.kpis.averageHealthScore}/100</strong>. Primary risk factors stem from discount-heavy bundles and prolonged dormant activity (&ge; 7 days).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <span className="rounded-full bg-slate-900 border border-slate-700 px-2.5 py-1 text-[11px] font-mono text-slate-300 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Backend Authoritative Score
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <DealHealthFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* 8 KPI Cards (with click-to-filter capability) */}
      <HealthOverviewCards
        kpis={data.kpis}
        activeStatusFilter={filters.health}
        onSelectStatus={handleStatusFilter}
      />

      {/* Charts Grid 1: Health Distribution & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthDistributionChart
          distribution={data.distribution}
          avgScore={data.kpis.averageHealthScore}
        />
        <HealthTrendChart trends={data.healthTrends} />
      </div>

      {/* Charts Grid 2: Pipeline Health & Margin Erosion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PipelineHealthChart stages={data.pipelineHealth} />
        <MarginErosionChart data={data.marginErosion} />
      </div>

      {/* Operational Risk Triplet: Discount Risk, Stalled Deals, Approval Bottlenecks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DiscountRiskCard data={data.discountRisk} />
        <StalledDealsCard deals={data.stalledDeals} />
        <ApprovalBottleneckCard data={data.approvalBottlenecks} />
      </div>

      {/* Dedicated High-Risk Deals Table */}
      <HighRiskDealsTable deals={data.highRiskDeals} />
    </div>
  );
}
