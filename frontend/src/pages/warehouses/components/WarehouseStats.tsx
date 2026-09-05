import React from 'react';
import { WarehouseStats as StatsType } from '@/types';

interface WarehouseStatsProps {
  stats?: StatsType;
  isLoading?: boolean;
}

export function WarehouseStats({ stats, isLoading }: WarehouseStatsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="card p-3 animate-pulse" style={{ background: 'var(--surface)' }}>
            <div className="h-3 w-16 bg-muted/40 rounded mb-2" />
            <div className="h-6 w-12 bg-muted/40 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Warehouses',
      value: stats.totalWarehouses,
      subtext: 'Multi-region nodes',
      icon: '🏭',
      color: 'var(--accent)',
    },
    {
      label: 'Total SKUs',
      value: stats.totalProducts.toLocaleString(),
      subtext: 'Catalog on hand',
      icon: '📦',
      color: 'var(--foreground)',
    },
    {
      label: 'Avg Capacity',
      value: `${stats.avgCapacityPercentage}%`,
      subtext: 'Network utilization',
      icon: '📊',
      color: stats.avgCapacityPercentage > 85 ? 'var(--amber)' : 'var(--green)',
    },
    {
      label: 'Low Stock SKUs',
      value: stats.totalLowStockItems,
      subtext: 'Needs replenishment',
      icon: '⚠',
      color: stats.totalLowStockItems > 0 ? 'var(--red)' : 'var(--green)',
    },
    {
      label: 'Active Fulfillments',
      value: stats.totalActiveFulfillments,
      subtext: 'Routing through hubs',
      icon: '🚚',
      color: 'var(--accent)',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {cards.map((c, i) => (
        <div
          key={i}
          className="card p-3.5 select-none"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              {c.label}
            </span>
            <span style={{ fontSize: '12px' }}>{c.icon}</span>
          </div>
          <div
            className="font-mono text-xl font-bold tracking-tight mb-0.5"
            style={{ color: c.color }}
          >
            {c.value}
          </div>
          <div className="text-[10px] text-muted-foreground truncate">{c.subtext}</div>
        </div>
      ))}
    </div>
  );
}
