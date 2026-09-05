import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  DollarSign,
  FileText,
  GitPullRequest,
  CheckCircle,
  BarChart3,
  ArrowUpRight,
  Activity,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { showToast } from '@/stores/toast.store';
import { AttentionCenter } from '@/components/feedback/AttentionCenter';
import { HackathonDemoTour } from '@/components/layout/HackathonDemoTour';

interface RevenueTrendPoint {
  month: string;
  revenue: number;
  target: number;
}

const REVENUE_TREND_DATA: RevenueTrendPoint[] = [
  { month: 'Oct', revenue: 145000, target: 140000 },
  { month: 'Nov', revenue: 172000, target: 155000 },
  { month: 'Dec', revenue: 198000, target: 180000 },
  { month: 'Jan', revenue: 185000, target: 175000 },
  { month: 'Feb', revenue: 215000, target: 190000 },
  { month: 'Mar', revenue: 248000, target: 210000 },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const [isTourOpen, setIsTourOpen] = React.useState(false);

  const handleStartTour = () => {
    setIsTourOpen(true);
    showToast('Starting Hackathon Golden Path Demo Tour', 'blue');
  };

  return (
    <div className="pb-8 space-y-6">
      {/* Bento Grid Architecture */}
      <div className="bento-grid">
        {/* 1. Welcome Banner (span 4 cols) */}
        <div
          className={cn(
            'bento-card bento-span-4 p-5',
            'bg-gradient-to-r from-surface via-surface2/60 to-blue-950/25',
            'border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4'
          )}
        >
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Good morning, Sales Operations Team
              </h1>
              <span className="badge badge-green text-xs font-semibold py-0.5 px-2 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>All Systems Operational</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground max-w-2xl">
              Here's what needs your attention across your pipeline, approvals, and fulfillment today.
              Monitor high-priority bottlenecks and accelerate deal closures.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto flex-shrink-0">
            <button
              type="button"
              onClick={handleStartTour}
              className="btn btn-primary btn-sm text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Start Hackathon Golden Path Demo</span>
            </button>
          </div>
        </div>

        {/* 2. Pipeline Velocity (span 2 cols) */}
        <div
          className={cn(
            'bento-card bento-span-2 flex flex-col justify-between cursor-pointer group',
            'hover:border-blue-500/40 bg-gradient-to-br from-surface to-surface2/40'
          )}
          onClick={() => navigate(ROUTES.APP.PIPELINE)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate(ROUTES.APP.PIPELINE)}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                  <GitPullRequest className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="stat-label text-[11px]">Pipeline Velocity</h3>
                  <div className="text-xs text-foreground font-semibold">Active Deal Stages</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Total Pipeline Value
                </div>
                <div className="text-base font-extrabold text-accent tabular-nums tracking-tight">
                  $1,240,000
                </div>
              </div>
            </div>

            {/* Segmented Progress Bar */}
            <div className="w-full bg-surface3 h-3 rounded-full overflow-hidden flex my-3 p-0.5 border border-border/40 shadow-inner">
              <div
                className="bg-emerald-500 h-full rounded-l-full transition-all duration-500 hover:brightness-110"
                style={{ width: '45%' }}
                title="Lead / Proposal: 45%"
              />
              <div
                className="bg-blue-500 h-full transition-all duration-500 hover:brightness-110"
                style={{ width: '35%' }}
                title="Negotiation: 35%"
              />
              <div
                className="bg-purple-500 h-full rounded-r-full transition-all duration-500 hover:brightness-110"
                style={{ width: '20%' }}
                title="Closing: 20%"
              />
            </div>
          </div>

          {/* Stage breakdown legend */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
              <span className="text-muted-foreground text-[11px]">Lead/Proposal:</span>
              <span className="font-bold text-foreground tabular-nums text-[11px]">45%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm" />
              <span className="text-muted-foreground text-[11px]">Negotiation:</span>
              <span className="font-bold text-foreground tabular-nums text-[11px]">35%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500 shadow-sm" />
              <span className="text-muted-foreground text-[11px]">Closing:</span>
              <span className="font-bold text-foreground tabular-nums text-[11px]">20%</span>
            </div>
          </div>
        </div>

        {/* 3. Active Quotes (1 col) */}
        <div
          className={cn(
            'bento-card flex flex-col justify-between cursor-pointer group',
            'hover:border-blue-500/40 bg-gradient-to-br from-surface to-blue-950/10'
          )}
          onClick={() => navigate(ROUTES.APP.QUOTATIONS)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate(ROUTES.APP.QUOTATIONS)}
        >
          <div className="flex items-center justify-between">
            <span className="stat-label">Active Quotes</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="stat-val tabular-nums text-foreground">24</div>
            <div className="stat-delta up flex items-center gap-1 mt-1 font-medium">
              <span>↑ 4 this week</span>
            </div>
          </div>
        </div>

        {/* 4. Pending Approval (1 col) */}
        <div
          className={cn(
            'bento-card flex flex-col justify-between cursor-pointer group',
            'hover:border-amber-500/40 bg-gradient-to-br from-surface to-amber-950/10'
          )}
          onClick={() => navigate(ROUTES.APP.APPROVALS)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate(ROUTES.APP.APPROVALS)}
        >
          <div className="flex items-center justify-between">
            <span className="stat-label">Pending Approval</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="stat-val tabular-nums text-amber">3</div>
            <div className="stat-delta warn flex items-center gap-1 mt-1 font-medium">
              <span>⚠ Avg wait 1.4d</span>
            </div>
          </div>
        </div>

        {/* 5. Revenue Trend (span 2 cols, row span 2) */}
        <div
          className={cn(
            'bento-card bento-span-2 bento-row-2 flex flex-col justify-between',
            'bg-gradient-to-b from-surface via-surface to-blue-950/15'
          )}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shadow-sm">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="stat-label text-[11px]">Revenue Trend</h3>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl font-extrabold text-foreground tabular-nums tracking-tight">
                    $1.24M
                  </span>
                  <span className="badge badge-green text-[10px] font-semibold flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    +18.4% YoY
                  </span>
                </div>
              </div>
            </div>
            <span className="badge badge-gray text-[10px] font-semibold">Last 6 Months</span>
          </div>

          <div className="w-full flex-1 min-h-[200px] pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueBentoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,54,82,0.5)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#2A3652' }}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `$${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#2A3652',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#F3F4F6',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
                  }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                  labelStyle={{ color: '#94A3B8', fontWeight: 600, marginBottom: '2px' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueBentoGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            <span>Forecast Target: $260k/mo</span>
            <span className="text-emerald-400 font-semibold tabular-nums">95.4% Target Realization</span>
          </div>
        </div>

        {/* 6. Won This Month (1 col) */}
        <div
          className={cn(
            'bento-card flex flex-col justify-between cursor-pointer group',
            'hover:border-emerald-500/40 bg-gradient-to-br from-surface to-emerald-950/10'
          )}
          onClick={() => navigate(ROUTES.APP.QUOTATIONS)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate(ROUTES.APP.QUOTATIONS)}
        >
          <div className="flex items-center justify-between">
            <span className="stat-label">Won This Month</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="stat-val tabular-nums text-green">$184k</div>
            <div className="stat-delta up flex items-center gap-1 mt-1 font-medium">
              <span>↑ 12% vs last month</span>
            </div>
          </div>
        </div>

        {/* 7. Deal Health (1 col) */}
        <div
          className={cn(
            'bento-card flex flex-col justify-between cursor-pointer group',
            'hover:border-purple-500/40 bg-gradient-to-br from-surface to-purple-950/10'
          )}
          onClick={() => navigate(ROUTES.APP.DEAL_HEALTH)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate(ROUTES.APP.DEAL_HEALTH)}
        >
          <div className="flex items-center justify-between">
            <span className="stat-label">Deal Health</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-sm">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="stat-val tabular-nums text-foreground">103</span>
              <span className="text-[11px] text-muted-foreground font-medium">Monitored</span>
            </div>

            {/* Segmented Distribution Bar */}
            <div className="w-full bg-surface3 h-2 rounded-full overflow-hidden flex shadow-inner">
              <div className="bg-emerald-500 h-full" style={{ width: '70%' }} title="Healthy: 72 (70%)" />
              <div className="bg-amber-500 h-full" style={{ width: '22%' }} title="At Risk: 23 (22%)" />
              <div className="bg-red-500 h-full" style={{ width: '8%' }} title="Critical: 8 (8%)" />
            </div>

            {/* Legend with Colored Dots */}
            <div className="flex items-center justify-between text-[11px] font-medium tabular-nums pt-0.5">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm" />
                72 <span className="text-[10px] text-muted-foreground">(70%)</span>
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm" />
                23 <span className="text-[10px] text-muted-foreground">(22%)</span>
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-sm" />
                8 <span className="text-[10px] text-muted-foreground">(8%)</span>
              </span>
            </div>
          </div>
        </div>

        {/* 8. Attention Center (span 2 cols) */}
        <div
          className={cn(
            'bento-card bento-span-2 p-4 flex flex-col justify-between',
            '[&_.card]:border-0 [&_.card]:bg-transparent [&_.card]:p-0 [&_.card]:mb-0 lg:[&_.grid]:grid-cols-2'
          )}
        >
          <AttentionCenter />
        </div>

        {/* 9. Quick Actions (span 2 cols) */}
        <div className="bento-card bento-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-accent/20 text-accent flex items-center justify-center">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <h3 className="stat-label text-[11px]">Quick Actions</h3>
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">Frequent Operations</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 flex-1">
            {/* Action 1: New Quote */}
            <button
              type="button"
              onClick={() => navigate(ROUTES.APP.QUOTATION_NEW)}
              className={cn(
                'p-3 rounded-xl border border-border/70 bg-surface2/40',
                'hover:bg-surface2 hover:border-accent/50 transition-all text-left group flex flex-col justify-between'
              )}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors">
                  New Quote
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                  Draft custom quotation
                </div>
              </div>
            </button>

            {/* Action 2: View Pipeline */}
            <button
              type="button"
              onClick={() => navigate(ROUTES.APP.PIPELINE)}
              className={cn(
                'p-3 rounded-xl border border-border/70 bg-surface2/40',
                'hover:bg-surface2 hover:border-accent/50 transition-all text-left group flex flex-col justify-between'
              )}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all shadow-sm">
                  <GitPullRequest className="w-3.5 h-3.5" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors">
                  View Pipeline
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                  Manage deal stages
                </div>
              </div>
            </button>

            {/* Action 3: Approvals */}
            <button
              type="button"
              onClick={() => navigate(ROUTES.APP.APPROVALS)}
              className={cn(
                'p-3 rounded-xl border border-border/70 bg-surface2/40',
                'hover:bg-surface2 hover:border-accent/50 transition-all text-left group flex flex-col justify-between'
              )}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors">
                  Approvals
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                  Review quote approvals
                </div>
              </div>
            </button>

            {/* Action 4: Reports */}
            <button
              type="button"
              onClick={() => navigate(ROUTES.APP.REPORTS)}
              className={cn(
                'p-3 rounded-xl border border-border/70 bg-surface2/40',
                'hover:bg-surface2 hover:border-accent/50 transition-all text-left group flex flex-col justify-between'
              )}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors">
                  Reports
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                  Analytics & metrics
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Hackathon Tour Dialog */}
      <HackathonDemoTour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </div>
  );
}

DashboardPage.displayName = 'DashboardPage';
