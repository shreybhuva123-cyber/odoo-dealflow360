import React from 'react';
import { PipelineStats as StatsType } from '@/types';

interface PipelineStatsProps {
  stats?: StatsType;
  isLoading?: boolean;
}

export const PipelineStats: React.FC<PipelineStatsProps> = ({ stats, isLoading = false }) => {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card animate-pulse">
            <div className="h-3 w-20 bg-muted/40 rounded mb-2" />
            <div className="h-6 w-28 bg-muted/60 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)} L`;
    }
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Deals */}
      <div className="stat-card" style={{ borderLeft: '3px solid var(--accent)' }}>
        <div className="stat-label flex items-center justify-between">
          <span>Total Pipeline Deals</span>
          <span style={{ fontSize: '15px' }}>📋</span>
        </div>
        <div className="stat-value text-accent">{stats.totalDeals} Deals</div>
        <div className="stat-meta">Active opportunities in pipeline</div>
      </div>

      {/* 2. Pipeline Value */}
      <div className="stat-card" style={{ borderLeft: '3px solid var(--green)' }}>
        <div className="stat-label flex items-center justify-between">
          <span>Gross Pipeline Value</span>
          <span style={{ fontSize: '15px' }}>💰</span>
        </div>
        <div className="stat-value text-green">{formatCurrency(stats.pipelineValue)}</div>
        <div className="stat-meta">Unweighted nominal total</div>
      </div>

      {/* 3. Weighted Pipeline */}
      <div className="stat-card" style={{ borderLeft: '3px solid var(--purple)' }}>
        <div className="stat-label flex items-center justify-between">
          <span>Weighted Pipeline</span>
          <span style={{ fontSize: '15px' }}>📈</span>
        </div>
        <div className="stat-value text-purple">{formatCurrency(stats.weightedValue)}</div>
        <div className="stat-meta">Probability-adjusted expected yield</div>
      </div>

      {/* 4. At Risk */}
      <div className="stat-card" style={{ borderLeft: '3px solid var(--amber)' }}>
        <div className="stat-label flex items-center justify-between">
          <span>Deals At Risk</span>
          <span style={{ fontSize: '15px' }}>⚠️</span>
        </div>
        <div className="stat-value text-amber">{stats.atRiskDeals} Deals</div>
        <div className="stat-meta">Stalled {'>'}7d or discount breaches</div>
      </div>
    </div>
  );
};
