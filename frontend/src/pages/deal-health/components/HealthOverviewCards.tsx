import React from 'react';
import { DealHealthDashboardKPIs, DealHealthStatus } from '@/types';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  TrendingUp,
  DollarSign,
  HeartPulse,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthOverviewCardsProps {
  kpis: DealHealthDashboardKPIs;
  activeStatusFilter?: DealHealthStatus | 'ALL';
  onSelectStatus: (status: DealHealthStatus | 'ALL') => void;
  currency?: string;
}

export function HealthOverviewCards({
  kpis,
  activeStatusFilter = 'ALL',
  onSelectStatus,
  currency = '₹',
}: HealthOverviewCardsProps) {
  const formatCurrency = (val: number) =>
    `${currency}${(val / 100000).toFixed(1)}L`;

  const cards = [
    {
      id: 'ALL',
      title: 'Total Active Deals',
      value: kpis.totalActiveDeals,
      subtext: `+${kpis.totalActiveDealsTrend}% this month`,
      icon: Activity,
      borderColor: 'hover:border-blue-500/50',
      activeBorder: 'border-blue-500 bg-blue-950/20',
      iconColor: 'text-blue-400 bg-blue-500/10',
      onClick: () => onSelectStatus('ALL'),
      isActive: activeStatusFilter === 'ALL',
    },
    {
      id: 'HEALTHY',
      title: 'Healthy Deals',
      value: kpis.healthyDealsCount,
      subtext: `${kpis.healthyDealsPct}% of pipeline`,
      icon: CheckCircle2,
      borderColor: 'hover:border-emerald-500/50',
      activeBorder: 'border-emerald-500 bg-emerald-950/20',
      iconColor: 'text-emerald-400 bg-emerald-500/10',
      onClick: () => onSelectStatus('HEALTHY'),
      isActive: activeStatusFilter === 'HEALTHY',
    },
    {
      id: 'AT_RISK',
      title: 'At Risk Deals',
      value: kpis.atRiskDealsCount,
      subtext: `${kpis.atRiskDealsPct}% of pipeline`,
      icon: AlertTriangle,
      borderColor: 'hover:border-amber-500/50',
      activeBorder: 'border-amber-500 bg-amber-950/20',
      iconColor: 'text-amber-400 bg-amber-500/10',
      onClick: () => onSelectStatus('AT_RISK'),
      isActive: activeStatusFilter === 'AT_RISK',
    },
    {
      id: 'CRITICAL',
      title: 'Critical Deals',
      value: kpis.criticalDealsCount,
      subtext: `${kpis.criticalDealsPct}% urgent action`,
      icon: AlertOctagon,
      borderColor: 'hover:border-rose-500/50',
      activeBorder: 'border-rose-500 bg-rose-950/20',
      iconColor: 'text-rose-400 bg-rose-500/10',
      onClick: () => onSelectStatus('CRITICAL'),
      isActive: activeStatusFilter === 'CRITICAL',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Row: Status Filter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.id}
              onClick={c.onClick}
              role="button"
              tabIndex={0}
              className={cn(
                'group relative rounded-xl border border-slate-800 bg-slate-900/80 p-4 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md backdrop-blur',
                c.borderColor,
                c.isActive && c.activeBorder
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{c.title}</span>
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/60 transition-transform group-hover:scale-105',
                    c.iconColor
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-white tracking-tight">
                  {c.value}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {c.subtext}
                </span>
              </div>

              {c.isActive && (
                <div className="absolute bottom-1 right-2 text-[10px] text-blue-400 font-semibold tracking-wider uppercase">
                  Active Filter &bull;
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Second Row: Commercial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pipeline Value</span>
            <DollarSign className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-white">
              {formatCurrency(kpis.totalPipelineValue)}
            </span>
            <span className="text-[11px] text-slate-400">Total pipeline</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Weighted Pipeline</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-400">
              {formatCurrency(kpis.weightedPipelineValue)}
            </span>
            <span className="text-[11px] text-slate-400">Probability factored</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Stalled Deals</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-amber-400">
              {kpis.stalledDealsCount}
            </span>
            <span className="text-[11px] text-slate-400">&ge; 7 days inactive</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avg Deal Health</span>
            <HeartPulse className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-white">
              {kpis.averageHealthScore}
              <span className="text-sm font-normal text-slate-500">/100</span>
            </span>
            <span className="text-[11px] text-slate-400">Health Index</span>
          </div>
        </div>
      </div>
    </div>
  );
}
