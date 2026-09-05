import React from 'react';
import { PricingOverviewStats as StatsType } from '@/types';

interface PricingOverviewStatsProps {
  stats?: StatsType;
  isLoading?: boolean;
}

export function PricingOverviewStats({ stats, isLoading }: PricingOverviewStatsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card animate-pulse h-20 bg-muted/40" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      <div className="stat-card">
        <div className="stat-label">Active Rules</div>
        <div className="stat-val text-foreground">
          {stats.activeRules} <span className="text-xs text-muted-foreground font-normal">/ {stats.totalRules}</span>
        </div>
        <div className="text-[10px] text-muted-foreground mt-1">Rule engine active</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Customer Tiers</div>
        <div className="stat-val text-accent">{stats.totalTiers}</div>
        <div className="text-[10px] text-muted-foreground mt-1">Standard to Enterprise</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Avg Applied Discount</div>
        <div className="stat-val text-foreground">{stats.avgDiscountPct}%</div>
        <div className="stat-delta up">Balanced with targets</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Margin Compliance</div>
        <div className="stat-val text-emerald-500">{stats.marginCompliancePct}%</div>
        <div className="text-[10px] text-emerald-500 mt-1">Floors respected</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Pending Exceptions</div>
        <div className="stat-val text-amber-500">{stats.pendingExceptionsCount}</div>
        <div className="text-[10px] text-muted-foreground mt-1">Requiring finance</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Governance Mode</div>
        <div className="stat-val text-xs uppercase tracking-wide text-foreground mt-1">Strict Floors</div>
        <div className="text-[10px] text-muted-foreground mt-1">Enforced by backend</div>
      </div>
    </div>
  );
}
