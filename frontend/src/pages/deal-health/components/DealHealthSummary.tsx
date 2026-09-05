import React from 'react';
import { DealHealthDetail } from '@/types';
import { DealHealthScore, RiskBadge } from '@/components/deal-health';
import {
  Calendar,
  User,
  DollarSign,
  TrendingUp,
  Percent,
  Clock,
  Layers,
  ShieldAlert,
} from 'lucide-react';

interface DealHealthSummaryProps {
  deal: DealHealthDetail;
  currency?: string;
}

export function DealHealthSummary({ deal, currency = '₹' }: DealHealthSummaryProps) {
  const formatCurrency = (val: number) =>
    `${currency}${val.toLocaleString('en-IN')}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Radial Health Gauge Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm backdrop-blur flex flex-col items-center justify-center text-center space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Health Assessment
        </span>
        <DealHealthScore
          score={deal.healthScore}
          status={deal.healthStatus}
          size="lg"
          showBadge={true}
        />
        <div className="text-xs text-slate-400 pt-1">
          Risk Tier: <RiskBadge level={deal.riskLevel} size="sm" className="inline-flex ml-1" />
        </div>
      </div>

      {/* Commercial Telemetry Grid */}
      <div className="lg:col-span-3 rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm backdrop-blur space-y-4">
        <h3 className="text-sm font-semibold text-white border-b border-slate-800 pb-3">
          Deal Intelligence & Commercial Parameters
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-medium flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5 text-blue-400" /> Deal Value
            </span>
            <div className="font-mono text-base font-bold text-white">
              {formatCurrency(deal.value)}
            </div>
            <div className="text-[11px] text-slate-400">Gross contract volume</div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-medium flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> Win Probability
            </span>
            <div className="font-mono text-base font-bold text-emerald-400">
              {deal.probability}%
            </div>
            <div className="text-[11px] text-slate-400">Weighted: {formatCurrency(Math.round((deal.value * deal.probability) / 100))}</div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-medium flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-purple-400" /> Pipeline Stage
            </span>
            <div className="text-base font-bold text-white capitalize">
              {deal.stage}
            </div>
            <div className="text-[11px] text-slate-400">Active sales cycle</div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-medium flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-amber-400" /> Expected Close
            </span>
            <div className="text-sm font-semibold text-white font-mono">
              {deal.expectedCloseDate}
            </div>
            <div className="text-[11px] text-slate-400">Target close date</div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-medium flex items-center gap-1">
              <Percent className="h-3.5 w-3.5 text-rose-400" /> Gross Margin
            </span>
            <div className="font-mono text-sm font-bold text-white">
              {deal.currentMargin !== undefined ? `${deal.currentMargin}%` : 'N/A'}{' '}
              {deal.originalMargin !== undefined && (
                <span className="text-slate-500 font-normal text-xs">
                  (floor: {deal.originalMargin}%)
                </span>
              )}
            </div>
            {deal.marginDelta !== undefined && deal.marginDelta < 0 && (
              <div className="text-[11px] text-rose-400 font-semibold">
                Drop: {deal.marginDelta}%
              </div>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-medium flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-blue-400" /> Account Owner
            </span>
            <div className="text-sm font-semibold text-white">
              {deal.ownerName}
            </div>
            <div className="text-[11px] text-slate-400">{deal.ownerRole || 'Sales Rep'}</div>
          </div>
        </div>

        {/* Warning / Notice Banner */}
        {deal.primaryRiskReason && (
          <div className="rounded-lg bg-rose-950/20 border border-rose-800/40 p-3 text-xs text-rose-300 flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-white">Primary Risk Driver:</span>
              <p className="text-rose-300/90 leading-relaxed">{deal.primaryRiskReason}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
