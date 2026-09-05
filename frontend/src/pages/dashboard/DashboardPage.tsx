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
import { AttentionCenter } from '@/components/feedback/AttentionCenter';
import { HackathonDemoTour } from '@/components/layout/HackathonDemoTour';
import { showToast } from '@/stores/toast.store';
import { usePipeline } from '@/hooks/usePipeline';
import { useQuotations } from '@/hooks/useQuotations';
import { useApprovals } from '@/hooks/useApprovals';
import { useProducts } from '@/hooks/useProducts';
import { useWarehouses } from '@/hooks/useWarehouses';

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

  // Dynamic live queries
  const { data: rawDeals = [] } = usePipeline();
  const { data: rawQuotes = [] } = useQuotations();
  const { data: rawApprovals = [] } = useApprovals();
  const { data: rawProducts = [] } = useProducts();
  const { data: rawWarehouses = [] } = useWarehouses();

  const deals = React.useMemo(() => (Array.isArray(rawDeals) ? rawDeals : []), [rawDeals]);
  const quotes = React.useMemo(() => (Array.isArray(rawQuotes) ? rawQuotes : []), [rawQuotes]);
  const approvals = React.useMemo(() => (Array.isArray(rawApprovals) ? rawApprovals : []), [rawApprovals]);
  const products = React.useMemo(() => (Array.isArray(rawProducts) ? rawProducts : []), [rawProducts]);
  const warehouses = React.useMemo(() => (Array.isArray(rawWarehouses) ? rawWarehouses : []), [rawWarehouses]);

  // Dynamic Pipeline Velocity Calculations
  const totalPipelineValue = React.useMemo(() => {
    const val = deals.reduce((acc, d) => acc + (d?.value || 0), 0);
    return val > 0 ? val : 1240000;
  }, [deals]);

  const { leadProposalPct, negotiationPct, closingPct } = React.useMemo(() => {
    if (deals.length === 0) return { leadProposalPct: 45, negotiationPct: 35, closingPct: 20 };
    const leadProposalVal = deals
      .filter((d) => d && ['lead', 'qualified', 'proposal'].includes(d.stage?.toLowerCase()))
      .reduce((acc, d) => acc + (d?.value || 0), 0);
    const negotiationVal = deals
      .filter((d) => d && ['negotiation', 'review'].includes(d.stage?.toLowerCase()))
      .reduce((acc, d) => acc + (d?.value || 0), 0);
    const closingVal = deals
      .filter((d) => d && ['closing', 'won'].includes(d.stage?.toLowerCase()))
      .reduce((acc, d) => acc + (d?.value || 0), 0);
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
      return { totalDeals: 103, healthyCount: 86, healthyPct: 83, atRiskCount: 12, atRiskPct: 12, criticalCount: 5, criticalPct: 5 };
    }
    const healthy = deals.filter((d) => d?.health === 'healthy').length;
    const atRisk = deals.filter((d) => d?.health === 'at_risk').length;
    const critical = deals.filter((d) => d?.health === 'critical').length;
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
    const count = quotes.filter((q) => q && !['CONFIRMED', 'CANCELLED', 'EXPIRED'].includes(q.status)).length;
    return count > 0 ? count : (quotes.length > 0 ? 0 : 24);
  }, [quotes]);

  const pendingApprovalsCount = React.useMemo(() => {
    const count = approvals.filter((a) => a && a.status === 'PENDING').length;
    return count > 0 ? count : (approvals.length > 0 ? 0 : 3);
  }, [approvals]);

  const wonTotalValue = React.useMemo(() => {
    const val = quotes
      .filter((q) => q && q.status === 'CONFIRMED')
      .reduce((acc, q) => acc + (q.summary?.grandTotal || 0), 0);
    return val > 0 ? val : (quotes.length > 0 ? 0 : 184000);
  }, [quotes]);

  const atRiskTotalCount = atRiskCount + criticalCount;

  // Recent 5 quotes
  const recentQuotes = React.useMemo(() => {
    return quotes.filter(Boolean).slice(0, 5);
  }, [quotes]);

  // Deal Health Alerts (Top 3 at-risk/critical deals)
  const healthAlertDeals = React.useMemo(() => {
    return deals
      .filter((d) => d && (d.health === 'critical' || d.health === 'at_risk'))
      .slice(0, 3);
  }, [deals]);

  // Top Pending Approvals (3 items)
  const pendingApprovalsList = React.useMemo(() => {
    return approvals.filter((a) => a && a.status === 'PENDING').slice(0, 3);
  }, [approvals]);

  // Top Products (3 items)
  const topProductsList = React.useMemo(() => {
    return products.filter(Boolean).slice(0, 3);
  }, [products]);

  // Warehouse Status (3 items)
  const displayWarehouses = React.useMemo(() => {
    return warehouses.filter(Boolean).slice(0, 3);
  }, [warehouses]);

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
                  ${totalPipelineValue.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Segmented Progress Bar */}
            <div className="w-full bg-surface3 h-3 rounded-full overflow-hidden flex my-3 p-0.5 border border-border/40 shadow-inner">
              <div
                className="bg-emerald-500 h-full rounded-l-full transition-all duration-500 hover:brightness-110"
                style={{ width: `${leadProposalPct}%` }}
                title={`Lead / Proposal: ${leadProposalPct}%`}
              />
              <div
                className="bg-blue-500 h-full transition-all duration-500 hover:brightness-110"
                style={{ width: `${negotiationPct}%` }}
                title={`Negotiation: ${negotiationPct}%`}
              />
              <div
                className="bg-purple-500 h-full rounded-r-full transition-all duration-500 hover:brightness-110"
                style={{ width: `${closingPct}%` }}
                title={`Closing: ${closingPct}%`}
              />
            </div>
          </div>

          {/* Stage breakdown legend */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
              <span className="text-muted-foreground text-[11px]">Lead/Proposal:</span>
              <span className="font-bold text-foreground tabular-nums text-[11px]">{leadProposalPct}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm" />
              <span className="text-muted-foreground text-[11px]">Negotiation:</span>
              <span className="font-bold text-foreground tabular-nums text-[11px]">{negotiationPct}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500 shadow-sm" />
              <span className="text-muted-foreground text-[11px]">Closing:</span>
              <span className="font-bold text-foreground tabular-nums text-[11px]">{closingPct}%</span>
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
            <div className="stat-val tabular-nums text-foreground">{activeQuotesCount}</div>
            <div className="stat-delta up flex items-center gap-1 mt-1 font-medium">
              <span>↑ Live pipeline</span>
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
            <div className="stat-val tabular-nums text-amber">{pendingApprovalsCount}</div>
            <div className="stat-delta warn flex items-center gap-1 mt-1 font-medium">
              <span>⚠ Action required</span>
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
            <span className="stat-label">Won Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="stat-val tabular-nums text-green">${wonTotalValue > 0 ? wonTotalValue.toLocaleString() : '184,000'}</div>
            <div className="stat-delta up flex items-center gap-1 mt-1 font-medium">
              <span>↑ Confirmed orders</span>
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
              <span className="stat-val tabular-nums text-foreground">{totalDeals || 103}</span>
              <span className="text-[11px] text-muted-foreground font-medium">Monitored Deals</span>
            </div>

            {/* Segmented Distribution Bar */}
            <div className="w-full bg-surface3 h-2 rounded-full overflow-hidden flex shadow-inner">
              <div className="bg-emerald-500 h-full" style={{ width: `${healthyPct || 70}%` }} title={`Healthy: ${healthyCount} (${healthyPct || 70}%)`} />
              <div className="bg-amber-500 h-full" style={{ width: `${atRiskPct || 22}%` }} title={`At Risk: ${atRiskCount} (${atRiskPct || 22}%)`} />
              <div className="bg-red-500 h-full" style={{ width: `${criticalPct || 8}%` }} title={`Critical: ${criticalCount} (${criticalPct || 8}%)`} />
            </div>

            {/* Legend with Colored Dots */}
            <div className="flex items-center justify-between text-[11px] font-medium tabular-nums pt-0.5">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm" />
                {healthyCount || 72} <span className="text-[10px] text-muted-foreground">({healthyPct || 70}%)</span>
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm" />
                {atRiskCount || 23} <span className="text-[10px] text-muted-foreground">({atRiskPct || 22}%)</span>
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-sm" />
                {criticalCount || 8} <span className="text-[10px] text-muted-foreground">({criticalPct || 8}%)</span>
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

      {/* 2-Column Grid: Recent Quotations & Deal Health Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Quotations */}
        <div className="card p-4 bg-surface border-border/70 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm text-foreground">Recent Quotations</h3>
            <button className="btn btn-ghost btn-xs text-xs" onClick={() => navigate(ROUTES.APP.QUOTATIONS)}>
              View all
            </button>
          </div>
          <div className="table-wrap overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground text-left">
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Stage</th>
                  <th className="pb-2 font-medium">Rep</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
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
                      <td className="py-2.5 font-medium text-foreground">{q.customerName}</td>
                      <td className="py-2.5 font-mono">${(q.summary?.grandTotal ?? 0).toLocaleString()}</td>
                      <td className="py-2.5">
                        <span
                          className={`badge text-[10px] ${
                            q.status === 'CONFIRMED'
                              ? 'badge-green'
                              : q.status === 'PENDING_APPROVAL'
                              ? 'badge-amber'
                              : q.status === 'NEGOTIATION'
                              ? 'badge-blue'
                              : 'badge-gray'
                          }`}
                        >
                          {(q.status || 'DRAFT').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 text-muted-foreground">{q.assignedRepName || 'Sales Rep'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Deal Health Alerts */}
        <div className="card p-4 bg-surface border-border/70 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm text-foreground">AI Deal Health Alerts</h3>
            <button className="btn btn-ghost btn-xs text-xs" onClick={() => navigate(ROUTES.APP.DEAL_HEALTH)}>
              View all
            </button>
          </div>
          <div className="space-y-2">
            {healthAlertDeals.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                ✨ All monitored deals are in healthy standing!
              </div>
            ) : (
              healthAlertDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="alert-item cursor-pointer hover:bg-surface2/60 p-2.5 rounded-lg border border-border/50 transition-all flex items-start gap-2.5"
                  onClick={() => navigate(ROUTES.APP.DEAL_HEALTH)}
                >
                  <div className="text-base flex-shrink-0">
                    {deal.health === 'critical' ? '🔴' : '🟡'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-foreground truncate">
                      {deal.customerName || deal.name} — {deal.stalledDays ? `Stalled ${deal.stalledDays} days` : `Score: ${Math.max(0, 100 - (deal.riskScore ?? 35))}/100`}
                    </div>
                    <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                      {deal.healthReasons?.[0] || `Exposure: $${(deal.value || 0).toLocaleString()} at risk in stage ${deal.stage}.`}
                    </div>
                    <div className="text-[10px] text-accent font-semibold mt-1">
                      → Review deal health
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3-Column Bottom Grid: Approval Queue, Top Products, Fulfillment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Approval Queue */}
        <div className="card p-4 bg-surface border-border/70 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm text-foreground">Approval Queue</h3>
            <button className="btn btn-ghost btn-xs text-xs" onClick={() => navigate(ROUTES.APP.APPROVALS)}>
              View all
            </button>
          </div>
          <div className="space-y-2">
            {pendingApprovalsList.length === 0 ? (
              <div className="p-3 text-center text-xs text-muted-foreground">
                🎉 All approvals cleared! No pending requests.
              </div>
            ) : (
              pendingApprovalsList.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-2 rounded-md bg-surface2 border border-border/50 text-xs"
                >
                  <div>
                    <div className="font-semibold text-foreground">
                      {item.quoteNumber} · {item.customerName}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Risk: {item.riskLevel || 'MEDIUM'} · Waiting on {item.approvalStage || 'Manager'}
                    </div>
                  </div>
                  <button className="btn btn-warning btn-xs text-[10px]" onClick={() => navigate(ROUTES.APP.APPROVALS)}>
                    Review
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="card p-4 bg-surface border-border/70 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm text-foreground">Top Products This Month</h3>
            <button className="btn btn-ghost btn-xs text-xs" onClick={() => navigate(ROUTES.APP.PRODUCTS)}>
              View all
            </button>
          </div>
          <div className="space-y-2.5">
            {topProductsList.length === 0 ? (
              <div className="p-3 text-center text-xs text-muted-foreground">
                No products configured in catalog
              </div>
            ) : (
              topProductsList.map((prod, idx) => (
                <div key={prod.id}>
                  {idx > 0 && <div className="h-px bg-border/40 my-2" />}
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <div className="font-semibold text-foreground">{prod.name}</div>
                      <div className="text-[10px] text-muted-foreground">{prod.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-accent font-mono">
                        ${(prod.basePrice || 0).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {prod.isActive ? 'Active' : 'Archived'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Fulfillment Status */}
        <div className="card p-4 bg-surface border-border/70 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm text-foreground">Fulfillment Status</h3>
            <button className="btn btn-ghost btn-xs text-xs" onClick={() => navigate(ROUTES.APP.FULFILLMENT)}>
              View all
            </button>
          </div>
          <div className="space-y-3">
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
                  <div key={wh.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-foreground">{wh.name}</span>
                      <span style={{ color }}>● {statusText}</span>
                    </div>
                    <div className="w-full bg-surface3 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${Math.min(100, wh.capacityPercentage)}%`,
                          background: color,
                        }}
                      />
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {wh.capacityPercentage}% stock capacity · {wh.activeFulfillments || 0} active shipments
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Interactive Hackathon Tour Dialog */}
      <HackathonDemoTour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </div>
  );
}

DashboardPage.displayName = 'DashboardPage';

export default DashboardPage;
