import React from 'react';
import { DiscountRiskDeal } from '@/types';
import { Link } from 'react-router-dom';
import { Percent, AlertTriangle, ExternalLink } from 'lucide-react';
import { RiskBadge } from '@/components/deal-health';

interface DiscountRiskCardProps {
  data: {
    averageDiscount: number;
    highestDiscount: number;
    dealsAboveThresholdCount: number;
    deals: DiscountRiskDeal[];
  };
}

export function DiscountRiskCard({ data }: DiscountRiskCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm backdrop-blur space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Percent className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Discount Policy & Compliance Risk</h3>
        </div>
        <span className="text-xs text-amber-400 font-medium">
          {data.dealsAboveThresholdCount} above policy threshold
        </span>
      </div>

      {/* 3 Metric Pills */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3 text-center">
          <span className="text-[11px] text-slate-400 block font-medium">Avg Discount</span>
          <span className="text-lg font-bold font-mono text-white mt-0.5 block">
            {data.averageDiscount}%
          </span>
        </div>

        <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3 text-center">
          <span className="text-[11px] text-slate-400 block font-medium">Peak Discount</span>
          <span className="text-lg font-bold font-mono text-rose-400 mt-0.5 block">
            {data.highestDiscount}%
          </span>
        </div>

        <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3 text-center">
          <span className="text-[11px] text-slate-400 block font-medium">Ceiling Breaches</span>
          <span className="text-lg font-bold font-mono text-amber-400 mt-0.5 block">
            {data.dealsAboveThresholdCount}
          </span>
        </div>
      </div>

      {/* High Discount Deals List */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Deals Exceeding Allowed Limit
        </div>

        <div className="space-y-2">
          {data.deals.slice(0, 3).map((d) => (
            <div
              key={d.dealId}
              className="rounded-lg bg-slate-950/40 border border-slate-800/60 p-3 text-xs flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <Link
                  to={`/app/deal-health/${d.dealId}`}
                  className="font-semibold text-white hover:text-blue-400 transition-colors flex items-center gap-1 truncate"
                >
                  <span>{d.dealName}</span>
                  <ExternalLink className="h-3 w-3 text-slate-500 shrink-0" />
                </Link>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {d.customerName} &bull; Applied:{' '}
                  <strong className="text-rose-400">{d.appliedDiscount}%</strong> (Allowed:{' '}
                  <span className="text-slate-300">{d.allowedLimit}%</span>)
                </div>
              </div>

              <div className="shrink-0 text-right">
                <span className="rounded bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 text-[10px] font-bold text-rose-400 font-mono block">
                  +{d.excess}% Excess
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
