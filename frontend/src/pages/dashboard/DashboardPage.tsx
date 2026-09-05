import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { showToast } from '@/stores/toast.store';
import { AttentionCenter } from '@/components/feedback/AttentionCenter';
import { HackathonDemoTour } from '@/components/layout/HackathonDemoTour';

export function DashboardPage() {
  const navigate = useNavigate();
  const [isTourOpen, setIsTourOpen] = React.useState(false);

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
            <span className="font-mono text-accent font-bold">$1,240,000 Total Value</span>
          </div>
          <div className="w-full bg-surface3 h-2 rounded-full overflow-hidden flex">
            <div className="bg-emerald-500 h-full" style={{ width: '45%' }} title="Qualified / Proposal (45%)" />
            <div className="bg-blue-500 h-full" style={{ width: '35%' }} title="Negotiation (35%)" />
            <div className="bg-amber-500 h-full" style={{ width: '20%' }} title="Closing / Won (20%)" />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Lead/Proposal: 45%</span>
            <span>Negotiation: 35%</span>
            <span>Closing: 20%</span>
          </div>
        </div>

        {/* Deal Health Distribution */}
        <div className="card p-3.5 bg-surface border-border/70 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-foreground">AI Deal Health Distribution</span>
            <span className="text-[11px] text-muted-foreground font-mono">103 Monitored Deals</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span>🟢</span>
              <span>Healthy: 72 (70%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <span>🟡</span>
              <span>At Risk: 23 (22%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-400 font-semibold">
              <span>🔴</span>
              <span>Critical: 8 (8%)</span>
            </div>
          </div>
          <div className="w-full bg-surface3 h-2 rounded-full overflow-hidden flex">
            <div className="bg-emerald-500 h-full" style={{ width: '70%' }} />
            <div className="bg-amber-500 h-full" style={{ width: '22%' }} />
            <div className="bg-red-500 h-full" style={{ width: '8%' }} />
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="stat-card">
          <div className="stat-label">Active Quotes</div>
          <div className="stat-val">24</div>
          <div className="stat-delta up">↑ 4 this week</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Approval</div>
          <div className="stat-val text-amber">3</div>
          <div className="stat-delta warn">⚠ Avg wait 1.4d</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Won This Month</div>
          <div className="stat-val text-green">$184k</div>
          <div className="stat-delta up">↑ 12% vs last month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">At-Risk Deals</div>
          <div className="stat-val text-red">2</div>
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
                <tr onClick={() => navigate(ROUTES.APP.QUOTATIONS)}>
                  <td className="td-bold">Acme Corp</td>
                  <td>$42,500</td>
                  <td><span className="badge badge-amber">Pending Approval</span></td>
                  <td className="td-muted">A. Morgan</td>
                </tr>
                <tr onClick={() => navigate(ROUTES.APP.QUOTATIONS)}>
                  <td className="td-bold">Beta Industries</td>
                  <td>$18,200</td>
                  <td><span className="badge badge-green">Approved</span></td>
                  <td className="td-muted">S. Patel</td>
                </tr>
                <tr onClick={() => navigate(ROUTES.APP.QUOTATIONS)}>
                  <td className="td-bold">Vertex LLC</td>
                  <td>$91,000</td>
                  <td><span className="badge badge-blue">Negotiation</span></td>
                  <td className="td-muted">A. Morgan</td>
                </tr>
                <tr onClick={() => navigate(ROUTES.APP.QUOTATIONS)}>
                  <td className="td-bold">NovaTech</td>
                  <td>$7,800</td>
                  <td><span className="badge badge-green">Confirmed</span></td>
                  <td className="td-muted">J. Liu</td>
                </tr>
                <tr onClick={() => navigate(ROUTES.APP.QUOTATIONS)}>
                  <td className="td-bold">CloudBase Co</td>
                  <td>$33,100</td>
                  <td><span className="badge badge-gray">Draft</span></td>
                  <td className="td-muted">A. Morgan</td>
                </tr>
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
            <div className="alert-item" onClick={() => navigate(ROUTES.APP.DEAL_HEALTH)}>
              <div className="alert-icon" style={{ fontSize: '16px' }}>🔴</div>
              <div className="alert-body">
                <div className="alert-title" style={{ fontWeight: 600, fontSize: '12px' }}>Vertex LLC — Stalled 9 days</div>
                <div className="alert-detail" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  No activity since customer portal viewed. $91k at risk.
                </div>
                <div className="alert-action" style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 600, marginTop: '4px' }}>
                  → Send nudge
                </div>
              </div>
            </div>

            <div className="alert-item" onClick={() => navigate(ROUTES.APP.APPROVALS)}>
              <div className="alert-icon" style={{ fontSize: '16px' }}>🟡</div>
              <div className="alert-body">
                <div className="alert-title" style={{ fontWeight: 600, fontSize: '12px' }}>Acme Corp — Discount anomaly</div>
                <div className="alert-detail" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  22% applied vs 15% Gold ceiling. Blended risk: HIGH.
                </div>
                <div className="alert-action" style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 600, marginTop: '4px' }}>
                  → Review quote
                </div>
              </div>
            </div>

            <div className="alert-item" onClick={() => navigate(ROUTES.APP.FULFILLMENT)}>
              <div className="alert-icon" style={{ fontSize: '16px' }}>🟠</div>
              <div className="alert-body">
                <div className="alert-title" style={{ fontWeight: 600, fontSize: '12px' }}>NovaTech — Partial backorder</div>
                <div className="alert-detail" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  12 units pending from East Depot. Est. arrival 3 days.
                </div>
                <div className="alert-action" style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 600, marginTop: '4px' }}>
                  → Manage fulfillment
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Bottom Grid */}
      <div className="grid-3 mt-16" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '16px' }}>
        {/* Approval Queue */}
        <div className="card">
          <div className="card-header"><div className="card-title">Approval Queue</div></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--surface2)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '12px' }}>Q-1042 · Acme Corp</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Risk: HIGH · Waiting on Sales Mgr</div>
                </div>
                <button className="btn btn-warning btn-xs" onClick={() => navigate(ROUTES.APP.APPROVALS)}>Review</button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--surface2)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '12px' }}>Q-1039 · Vertex LLC</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Risk: MEDIUM · Waiting on Finance</div>
                </div>
                <button className="btn btn-warning btn-xs" onClick={() => navigate(ROUTES.APP.APPROVALS)}>Review</button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--surface2)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '12px' }}>Q-1035 · PeakSoft</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Risk: LOW · Waiting on Sales Mgr</div>
                </div>
                <button className="btn btn-warning btn-xs" onClick={() => navigate(ROUTES.APP.APPROVALS)}>Review</button>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products This Month */}
        <div className="card">
          <div className="card-header"><div className="card-title">Top Products This Month</div></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '12px' }}>ProLaptop X1</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Hardware</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--accent)' }}>$48,000</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>32 units</div>
                </div>
              </div>
              <div style={{ height: '1px', background: 'var(--border)' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '12px' }}>CloudBase Pro Plan</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Subscription</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--accent)' }}>$28,800</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>18 subs</div>
                </div>
              </div>
              <div style={{ height: '1px', background: 'var(--border)' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '12px' }}>Setup & Deploy Svc</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Service</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--accent)' }}>$16,200</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>9 projects</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fulfillment Status */}
        <div className="card">
          <div className="card-header"><div className="card-title">Fulfillment Status</div></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700 }}>Main Warehouse</span>
                  <span style={{ color: 'var(--green)' }}>● Healthy</span>
                </div>
                <div className="wh-bar"><div className="wh-fill" style={{ width: '72%', background: 'var(--green)' }}></div></div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>72% stock capacity · 6 active shipments</div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700 }}>East Depot</span>
                  <span style={{ color: 'var(--amber)' }}>● Low Stock</span>
                </div>
                <div className="wh-bar"><div className="wh-fill" style={{ width: '28%', background: 'var(--amber)' }}></div></div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>28% stock capacity · 2 backorders pending</div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700 }}>West Hub</span>
                  <span style={{ color: 'var(--green)' }}>● Healthy</span>
                </div>
                <div className="wh-bar"><div className="wh-fill" style={{ width: '55%', background: 'var(--green)' }}></div></div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>55% stock capacity · 3 active shipments</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Hackathon Tour Dialog */}
      <HackathonDemoTour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </div>
  );
}
