import React from 'react';
import { useApprovals, useApprovalKpis } from '@/hooks/useApprovals';
import { ApprovalTable } from '@/components/approvals';
import { showToast } from '@/stores/toast.store';

export function ApprovalsPage() {
  const { data: approvals = [], isLoading, refetch } = useApprovals();
  const { data: kpis } = useApprovalKpis();

  const handleRefresh = () => {
    refetch();
    showToast('Approvals queue refreshed', 'blue');
  };

  const pendingCount = kpis?.pendingCount ?? approvals.filter((a) => a.status === 'PENDING').length ?? 12;
  const highRiskCount = kpis?.highRiskCount ?? approvals.filter((a) => a.riskLevel === 'HIGH' && a.status === 'PENDING').length ?? 4;
  const avgHours = kpis?.avgApprovalHours ?? 2.4;
  const approvedToday = kpis?.approvedTodayCount ?? approvals.filter((a) => a.status === 'APPROVED').length ?? 8;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Approval Center
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review quotations exceeding discount ceilings, margin thresholds, or credit risk limits
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost btn-sm text-xs"
            onClick={handleRefresh}
            title="Refresh queue"
          >
            ↻ Refresh Queue
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="stat-card" style={{ borderLeft: '3px solid var(--amber)' }}>
          <div className="stat-label flex items-center justify-between">
            <span>Pending Approvals</span>
            <span>⏳</span>
          </div>
          <div className="stat-value text-amber">{pendingCount}</div>
          <div className="stat-meta">Requiring manager / finance sign-off</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '3px solid var(--red)' }}>
          <div className="stat-label flex items-center justify-between">
            <span>High Risk Deals</span>
            <span>🔴</span>
          </div>
          <div className="stat-value text-red">{highRiskCount}</div>
          <div className="stat-meta">Discounts {'>'}15% or Margin {'<'}20%</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '3px solid var(--accent)' }}>
          <div className="stat-label flex items-center justify-between">
            <span>Avg Approval Time</span>
            <span>⚡</span>
          </div>
          <div className="stat-value text-accent">{avgHours}h</div>
          <div className="stat-meta">Turnaround time across stages</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '3px solid var(--green)' }}>
          <div className="stat-label flex items-center justify-between">
            <span>Approved Today</span>
            <span>✓</span>
          </div>
          <div className="stat-value text-green">{approvedToday}</div>
          <div className="stat-meta">Processed and moved to fulfillment</div>
        </div>
      </div>

      {/* Main Approvals Table with Filters */}
      <ApprovalTable approvals={approvals} isLoading={isLoading} />
    </div>
  );
}
