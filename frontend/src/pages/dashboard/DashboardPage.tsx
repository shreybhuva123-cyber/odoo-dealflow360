import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AttentionCenter } from '@/components/feedback/AttentionCenter';
import { HackathonDemoTour } from '@/components/layout/HackathonDemoTour';
import { usePipeline } from '@/hooks/usePipeline';
import { useQuotations } from '@/hooks/useQuotations';
import { useApprovals } from '@/hooks/useApprovals';
import { useProducts } from '@/hooks/useProducts';
import { useWarehouses } from '@/hooks/useWarehouses';

export function DashboardPage() {
  const navigate = useNavigate();
  const [isTourOpen, setIsTourOpen] = React.useState(false);

  // Dynamic live queries
  const { data: deals = [] } = usePipeline();
  const { data: quotes = [] } = useQuotations();
  const { data: approvals = [] } = useApprovals();
  const { data: products = [] } = useProducts();
  const { data: warehouses = [] } = useWarehouses();

  // Dynamic Pipeline Velocity Calculations
  const totalPipelineValue = React.useMemo(() => {
    return deals.reduce((acc, d) => acc + (d.value || 0), 0);
  }, [deals]);

  const { leadProposalPct, negotiationPct, closingPct } = React.useMemo(() => {
    if (deals.length === 0) return { leadProposalPct: 45, negotiationPct: 35, closingPct: 20 };
    const leadProposalVal = deals
      .filter((d) => ['lead', 'qualified', 'proposal'].includes(d.stage?.toLowerCase()))
      .reduce((acc, d) => acc + (d.value || 0), 0);
    const negotiationVal = deals
      .filter((d) => ['negotiation', 'review'].includes(d.stage?.toLowerCase()))
      .reduce((acc, d) => acc + (d.value || 0), 0);
    const closingVal = deals
      .filter((d) => ['closing', 'won'].includes(d.stage?.toLowerCase()))
      .reduce((acc, d) => acc + (d.value || 0), 0);
    const total = leadProposalVal + negotiationVal + closingVal || totalPipelineValue || 1;
    return {
      leadProposalPct: Math.round((leadProposalVal / total) * 100),
      negotiationPct: Math.round((negotiationVal / total) * 100),
      closingPct: Math.max(0, 100 - Math.round((leadProposalVal / total) * 100) - Math.round((negotiationVal / total) * 100)),
    };
  }, [deals, totalPipelineValue]);

  // Dynamic AI Deal Health Distribution
  const { totalDeals, healthyCount, healthyPct, atRiskCount, atRiskPct, criticalCount, criticalPct } = React.useMemo(() => {
    const total = deals.length;
    if (total === 0) {
      return { totalDeals: 0, healthyCount: 0, healthyPct: 0, atRiskCount: 0, atRiskPct: 0, criticalCount: 0, criticalPct: 0 };
    }
    const healthy = deals.filter((d) => d.health === 'healthy').length;
    const atRisk = deals.filter((d) => d.health === 'at_risk').length;
    const critical = deals.filter((d) => d.health === 'critical').length;
    return {
      totalDeals: total,
      healthyCount: healthy,
      healthyPct: Math.round((healthy / total) * 100),
      atRiskCount: atRisk,
      atRiskPct: Math.round((atRisk / total) * 100),
      criticalCount: critical,
      criticalPct: Math.max(0, 100 - Math.round((healthy / total) * 100) - Math.round((atRisk / total) * 100)),
    };
  }, [deals]);

  // 4 Top Stats
  const activeQuotesCount = React.useMemo(() => {
    return quotes.filter((q) => !['CONFIRMED', 'CANCELLED', 'EXPIRED'].includes(q.status)).length;
  }, [quotes]);

  const pendingApprovalsCount = React.useMemo(() => {
    return approvals.filter((a) => a.status === 'PENDING').length;
  }, [approvals]);

  const wonTotalValue = React.useMemo(() => {
    return quotes
      .filter((q) => q.status === 'CONFIRMED')
      .reduce((acc, q) => acc + (q.summary?.grandTotal || 0), 0);
  }, [quotes]);

  const atRiskTotalCount = atRiskCount + criticalCount;

  // Recent 5 quotes
  const recentQuotes = React.useMemo(() => {
    return [...quotes].slice(0, 5);
  }, [quotes]);

  // Deal Health Alerts (Top 3 at-risk/critical deals)
  const healthAlertDeals = React.useMemo(() => {
    return deals
      .filter((d) => d.health === 'critical' || d.health === 'at_risk')
      .slice(0, 3);
  }, [deals]);

  // Top Pending Approvals (3 items)
  const pendingApprovalsList = React.useMemo(() => {
    return approvals.filter((a) => a.status === 'PENDING').slice(0, 3);
  }, [approvals]);

  // Top Products (3 items)
  const topProductsList = React.useMemo(() => {
    return products.slice(0, 3);
  }, [products]);

  // Warehouse Status (3 items)
  const displayWarehouses = React.useMemo(() => {
    return warehouses.slice(0, 3);
  }, [warehouses]);

  return (
    <div style={{ padding: '0 0 24px 0' }} className="space-y-5">
      {/* Executive Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/70 bg-gradient-to-r from-surface via-surface to-accent/10 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span>Good morning, Sales Operations Team</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              ● All Systems Operational
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Here's what needs your attention across your pipeline, approvals, and fulfillment today.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsTourOpen(true)}
          className="btn btn-primary btn-sm text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-md"
        >
          <span>🏆</span>
          <span>Start Hackathon Golden Path Demo</span>
        </button>
      </div>

      {/* Pipeline Health vs Deal Health Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pipeline Distribution */}
        <div className="card p-3.5 bg-surface border-border/70 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-foreground">Pipeline Velocity Health</span>
            <span className="font-mono text-accent font-bold">
              ${totalPipelineValue.toLocaleString()} Total Value
            </span>
          </div>
          <div className="w-full bg-surface3 h-2 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all"
              style={{ width: `${leadProposalPct}%` }}
              title={`Lead / Proposal (${leadProposalPct}%)`}
            />
            <div
              className="bg-blue-500 h-full transition-all"
              style={{ width: `${negotiationPct}%` }}
              title={`Negotiation (${negotiationPct}%)`}
            />
            <div
              className="bg-amber-500 h-full transition-all"
              style={{ width: `${closingPct}%` }}
              title={`Closing / Won (${closingPct}%)`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Lead/Proposal: {leadProposalPct}%</span>
            <span>Negotiation: {negotiationPct}%</span>
            <span>Closing: {closingPct}%</span>
          </div>
        </div>

        {/* Deal Health Distribution */}
        <div className="card p-3.5 bg-surface border-border/70 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-foreground">AI Deal Health Distribution</span>
            <span className="text-[11px] text-muted-foreground font-mono">
              {totalDeals} Monitored Deals
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span>🟢</span>
              <span>Healthy: {healthyCount} ({healthyPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <span>🟡</span>
              <span>At Risk: {atRiskCount} ({atRiskPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-400 font-semibold">
              <span>🔴</span>
              <span>Critical: {criticalCount} ({criticalPct}%)</span>
            </div>
          </div>
          <div className="w-full bg-surface3 h-2 rounded-full overflow-hidden flex">
            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${healthyPct}%` }} />
            <div className="bg-amber-500 h-full transition-all" style={{ width: `${atRiskPct}%` }} />
            <div className="bg-red-500 h-full transition-all" style={{ width: `${criticalPct}%` }} />
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="stat-card">
          <div className="stat-label">Active Quotes</div>
          <div className="stat-val">{activeQuotesCount}</div>
          <div className="stat-delta up">↑ Live pipeline</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Approval</div>
          <div className="stat-val text-amber">{pendingApprovalsCount}</div>
          <div className="stat-delta warn">⚠ Action required</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Won Revenue</div>
          <div className="stat-val text-green">${wonTotalValue.toLocaleString()}</div>
          <div className="stat-delta up">↑ Confirmed orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">At-Risk Deals</div>
          <div className="stat-val text-red">{atRiskTotalCount}</div>
          <div className="stat-delta down">↓ Action needed</div>
        </div>
      </div>

      {/* Real-Time Attention Center Triage Widget */}
      <AttentionCenter />

      {/* 2-Column Grid */}
      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Recent Quotations */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Quotations</div>
            <button className="btn btn-ghost btn-xs" onClick={() => navigate(ROUTES.APP.QUOTATIONS)}>
              View all
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Stage</th>
                  <th>Rep</th>
                </tr>
              </thead>
              <tbody>
                {recentQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-muted-foreground text-xs">
                      No recent quotations found
                    </td>
                  </tr>
                ) : (
                  recentQuotes.map((q) => (
                    <tr
                      key={q.id}
                      className="cursor-pointer hover:bg-surface2/50 transition-colors"
                      onClick={() => navigate(ROUTES.APP.QUOTATIONS)}
                    >
                      <td className="td-bold">{q.customerName}</td>
                      <td>${(q.summary?.grandTotal ?? 0).toLocaleString()}</td>
                      <td>
                        <span
                          className={`badge ${
                            q.status === 'CONFIRMED'
                              ? 'badge-green'
                              : q.status === 'PENDING_APPROVAL'
                              ? 'badge-amber'
                              : q.status === 'NEGOTIATION'
                              ? 'badge-blue'
                              : 'badge-gray'
                          }`}
                        >
                          {q.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="td-muted">{q.assignedRepName || 'Sales Rep'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Deal Health Alerts */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Deal Health Alerts</div>
            <button className="btn btn-ghost btn-xs" onClick={() => navigate(ROUTES.APP.DEAL_HEALTH)}>
              View all
            </button>
          </div>
          <div className="card-body">
            {healthAlertDeals.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                ✨ All monitored deals are in healthy standing!
              </div>
            ) : (
              healthAlertDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="alert-item cursor-pointer hover:bg-surface2/60 p-2.5 rounded-lg border border-border/50 mb-2 transition-all"
                  onClick={() => navigate(ROUTES.APP.DEAL_HEALTH)}
                >
                  <div className="alert-icon" style={{ fontSize: '16px' }}>
                    {deal.health === 'critical' ? '🔴' : '🟡'}
                  </div>
                  <div className="alert-body">
                    <div className="alert-title" style={{ fontWeight: 600, fontSize: '12px' }}>
                      {deal.customerName || deal.name} — {deal.stalledDays ? `Stalled ${deal.stalledDays} days` : `Score: ${Math.max(0, 100 - (deal.riskScore ?? 35))}/100`}
                    </div>
                    <div className="alert-detail" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {deal.healthReasons?.[0] || `Exposure: $${(deal.value || 0).toLocaleString()} at risk in stage ${deal.stage}.`}
                    </div>
                    <div className="alert-action" style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 600, marginTop: '4px' }}>
                      → Review deal health
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3-Column Bottom Grid */}
      <div className="grid-3 mt-16" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '16px' }}>
        {/* Approval Queue */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Approval Queue</div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pendingApprovalsList.length === 0 ? (
                <div className="p-3 text-center text-xs text-muted-foreground">
                  🎉 All approvals cleared! No pending requests.
                </div>
              ) : (
                pendingApprovalsList.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 10px',
                      background: 'var(--surface2)',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '12px' }}>
                        {item.quoteNumber} · {item.customerName}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        Risk: {item.riskLevel || 'MEDIUM'} · Waiting on {item.approvalStage || 'Manager'}
                      </div>
                    </div>
                    <button className="btn btn-warning btn-xs" onClick={() => navigate(ROUTES.APP.APPROVALS)}>
                      Review
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Top Products This Month */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Top Products This Month</div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topProductsList.length === 0 ? (
                <div className="p-3 text-center text-xs text-muted-foreground">
                  No products configured in catalog
                </div>
              ) : (
                topProductsList.map((prod, idx) => (
                  <React.Fragment key={prod.id}>
                    {idx > 0 && <div style={{ height: '1px', background: 'var(--border)' }}></div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '12px' }}>{prod.name}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{prod.category}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--accent)' }}>
                          ${(prod.basePrice || 0).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          {prod.isActive ? 'Active catalog' : 'Archived'}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Fulfillment Status */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Fulfillment Status</div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {displayWarehouses.length === 0 ? (
                <div className="p-3 text-center text-xs text-muted-foreground">
                  No warehouse hubs active
                </div>
              ) : (
                displayWarehouses.map((wh) => {
                  const isHigh = wh.capacityPercentage > 80;
                  const isLow = wh.capacityPercentage < 35;
                  const color = isHigh || isLow ? 'var(--amber)' : 'var(--green)';
                  const statusText = isHigh ? 'High Utilization' : isLow ? 'Low Stock' : 'Healthy';

                  return (
                    <div key={wh.id}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '12px',
                          marginBottom: '4px',
                        }}
                      >
                        <span style={{ fontWeight: 700 }}>{wh.name}</span>
                        <span style={{ color }}>● {statusText}</span>
                      </div>
                      <div className="wh-bar">
                        <div
                          className="wh-fill"
                          style={{
                            width: `${Math.min(100, wh.capacityPercentage)}%`,
                            background: color,
                          }}
                        ></div>
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {wh.capacityPercentage}% stock capacity · {wh.activeFulfillments || 0} active shipments
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Hackathon Tour Dialog */}
      <HackathonDemoTour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </div>
  );
}
