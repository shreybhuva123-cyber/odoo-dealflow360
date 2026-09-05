import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useApproval,
  useApproveApproval,
  useRejectApproval,
  useReturnApproval,
} from '@/hooks/useApprovals';
import { useAuthStore } from '@/stores/auth.store';
import {
  PriorityRiskBadge,
  ApprovalStatusBadge,
  RiskBreakdown,
  DiscountAnalysisTable,
  ApprovalTimeline,
  FinanceReviewSection,
  AuditTimeline,
  ApprovalActions,
} from '@/components/approvals';
import { ROUTES } from '@/constants/routes';

export function ApprovalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: approval, isLoading, error } = useApproval(id);
  const approveMutation = useApproveApproval();
  const rejectMutation = useRejectApproval();
  const returnMutation = useReturnApproval();

  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center py-24">
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
        <div className="text-base font-semibold text-foreground">Loading Approval Workspace...</div>
        <div className="text-xs text-muted-foreground mt-1">
          Evaluating policy rules, discount ceilings, and risk factors
        </div>
      </div>
    );
  }

  if (error || !approval) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center py-24">
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
        <div className="text-base font-semibold text-foreground">Approval Request Not Found</div>
        <div className="text-xs text-muted-foreground mt-1 mb-6">
          Could not locate approval request for identifier "{id}".
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate(ROUTES.APP.APPROVALS)}
        >
          ← Return to Approvals Queue
        </button>
      </div>
    );
  }

  const handleApprove = (comment?: string) => {
    approveMutation.mutate({
      id: approval.id,
      comment,
      approverName: user?.name || 'Maria Chen',
      role: role || 'SALES_MANAGER',
    });
  };

  const handleReject = (reason: string) => {
    rejectMutation.mutate({
      id: approval.id,
      reason,
      approverName: user?.name || 'Maria Chen',
      role: role || 'SALES_MANAGER',
    });
  };

  const handleReturn = (feedback: string) => {
    returnMutation.mutate({
      id: approval.id,
      feedback,
      approverName: user?.name || 'Maria Chen',
      role: role || 'SALES_MANAGER',
    });
  };

  const isActionLoading =
    approveMutation.isPending || rejectMutation.isPending || returnMutation.isPending;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link
              to={ROUTES.APP.APPROVALS}
              className="hover:text-accent transition-colors flex items-center gap-1"
            >
              <span>← Approvals Queue</span>
            </Link>
            <span>/</span>
            <span className="text-foreground font-mono font-bold">{approval.quoteNumber}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              {approval.quoteNumber} · {approval.customerName}
            </h1>
            <PriorityRiskBadge level={approval.riskLevel} size="md" />
            <ApprovalStatusBadge status={approval.status} size="md" />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Submitted by <strong style={{ color: 'var(--text)' }}>{approval.requestedByRepName}</strong> · Queue Age: {approval.timeInQueue} · Review Stage: <strong style={{ color: 'var(--accent)' }}>{approval.approvalStage}</strong>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost btn-sm text-xs"
            onClick={() => navigate(ROUTES.APP.QUOTATION_DETAIL(approval.quotationId))}
          >
            View Original Quote ↗
          </button>
        </div>
      </div>

      {/* Financial KPI Summary Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="stat-card">
          <div className="stat-label">Total Quotation Value</div>
          <div className="stat-value text-accent">${approval.dealValue.toLocaleString()}</div>
          <div className="stat-meta">Enterprise Contract</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Blended Margin</div>
          <div
            className="stat-value"
            style={{
              color:
                approval.marginPct >= 25
                  ? 'var(--green)'
                  : approval.marginPct >= 18
                  ? 'var(--amber)'
                  : 'var(--red)',
            }}
          >
            {approval.marginPct}%
          </div>
          <div className="stat-meta">
            Target: 25.0% {approval.marginPct < 25 ? `(${25 - approval.marginPct}% below)` : '✓ Safe'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Discount Applied</div>
          <div
            className="stat-value"
            style={{
              color: approval.discountAppliedPct > 15 ? 'var(--red)' : 'var(--amber)',
            }}
          >
            {approval.discountAppliedPct}%
          </div>
          <div className="stat-meta">Tier Max: 15.0%</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Calculated Risk Index</div>
          <div
            className="stat-value"
            style={{
              color:
                approval.riskLevel === 'HIGH'
                  ? 'var(--red)'
                  : approval.riskLevel === 'MEDIUM'
                  ? 'var(--amber)'
                  : 'var(--green)',
            }}
          >
            {approval.riskScore} <span style={{ fontSize: '14px', fontWeight: 500 }}>/100</span>
          </div>
          <div className="stat-meta">{approval.riskLevel} Commercial Risk</div>
        </div>
      </div>

      {/* 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Risk, Analysis, Finance, and Actions (7 cols) */}
        <div className="lg:col-span-7">
          {/* 1. Risk Breakdown ("Why Does This Need Approval?") */}
          <RiskBreakdown
            riskScore={approval.riskScore}
            riskLevel={approval.riskLevel}
            riskFactors={approval.riskFactors}
            triggerReason={approval.triggerReason}
            approvalStage={approval.approvalStage}
          />

          {/* 2. Line Level Discount Compliance */}
          <DiscountAnalysisTable
            items={approval.discountAnalysis}
            customerTier={approval.customerTier}
          />

          {/* 3. Finance Review Metrics */}
          <FinanceReviewSection details={approval.financeDetails} />

          {/* 4. Action Center (Approve / Return / Reject) */}
          <ApprovalActions
            approval={approval}
            userRole={role}
            userName={user?.name}
            onApprove={handleApprove}
            onReject={handleReject}
            onReturn={handleReturn}
            isLoading={isActionLoading}
          />
        </div>

        {/* Right Column: Approval Chain, Audit Trail, Customer Context (5 cols) */}
        <div className="lg:col-span-5">
          {/* Customer Context Card */}
          <div className="card mb-6">
            <div className="card-header flex items-center justify-between">
              <div className="card-title text-base font-bold">Account Overview</div>
              <span className="badge badge-green text-xs">
                {approval.customerTier || 'Gold'} Tier
              </span>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Customer Name</span>
                  <strong style={{ color: 'var(--text)' }}>{approval.customerName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Credit Profile</span>
                  <strong style={{ color: 'var(--text)' }}>
                    {approval.financeDetails?.creditRating || 'A (Standard)'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Assigned Sales Rep</span>
                  <strong style={{ color: 'var(--text)' }}>{approval.requestedByRepName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Terms Requested</span>
                  <strong style={{ color: 'var(--amber)' }}>
                    {approval.financeDetails?.paymentTermsRequested || 'Net 30'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Sequential Approval Progression */}
          <ApprovalTimeline
            steps={approval.steps}
            currentStepIndex={approval.currentStepIndex}
            overallStatus={approval.status}
          />

          {/* Real-time Audit Trail */}
          <AuditTimeline auditTrail={approval.auditTrail} />
        </div>
      </div>
    </div>
  );
}
