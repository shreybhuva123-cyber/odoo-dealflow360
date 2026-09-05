import React from 'react';
import { FulfillmentStats as StatsType } from '@/types';

interface FulfillmentStatsProps {
  stats?: StatsType;
  isLoading?: boolean;
  onFilterStatus?: (status: string) => void;
  activeStatus?: string;
}

export function FulfillmentStats({
  stats,
  isLoading,
  onFilterStatus,
  activeStatus = 'all',
}: FulfillmentStatsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card p-3.5 animate-pulse" style={{ background: 'var(--surface)' }}>
            <div className="h-3 w-16 bg-muted/40 rounded mb-2" />
            <div className="h-6 w-12 bg-muted/40 rounded mb-1" />
            <div className="h-2.5 w-20 bg-muted/30 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      key: 'pending',
      label: 'Pending',
      value: stats.pending,
      subtext: 'Awaiting allocation',
      icon: '⏳',
      color: 'var(--amber)',
      bg: 'var(--amber-dim)',
      border: 'rgba(245, 158, 11, 0.25)',
    },
    {
      key: 'processing',
      label: 'Processing',
      value: stats.processing,
      subtext: 'Picking & packaging',
      icon: '⚙️',
      color: '#C084FC',
      bg: 'rgba(168, 85, 247, 0.12)',
      border: 'rgba(168, 85, 247, 0.25)',
    },
    {
      key: 'partial',
      label: 'Partial',
      value: stats.partial,
      subtext: 'Partially fulfilled',
      icon: '🚛',
      color: '#FB923C',
      bg: 'rgba(234, 88, 12, 0.12)',
      border: 'rgba(234, 88, 12, 0.25)',
    },
    {
      key: 'ready',
      label: 'Ready to Ship',
      value: stats.readyToShip,
      subtext: 'Staged at dock',
      icon: '📦',
      color: '#818CF8',
      bg: 'rgba(99, 102, 241, 0.12)',
      border: 'rgba(99, 102, 241, 0.25)',
    },
    {
      key: 'completed',
      label: 'Completed',
      value: stats.completed,
      subtext: 'Delivered & signed',
      icon: '✓',
      color: 'var(--green)',
      bg: 'var(--green-dim)',
      border: 'rgba(16, 185, 129, 0.25)',
    },
    {
      key: 'low_stock',
      label: 'Low Stock',
      value: stats.lowStockAlerts,
      subtext: 'Shortage risk items',
      icon: '⚠',
      color: 'var(--red)',
      bg: 'var(--red-dim)',
      border: 'rgba(239, 68, 68, 0.25)',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => {
        const isSelected = activeStatus === c.key;
        return (
          <div
            key={c.key}
            onClick={() => onFilterStatus?.(isSelected ? 'all' : c.key)}
            className="card p-3.5 transition-all cursor-pointer select-none hover:translate-y-[-2px]"
            style={{
              background: 'var(--surface)',
              border: isSelected ? `2px solid ${c.color}` : '1px solid var(--border)',
              boxShadow: isSelected ? `0 0 12px ${c.bg}` : undefined,
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {c.label}
              </span>
              <span style={{ fontSize: '13px' }}>{c.icon}</span>
            </div>
            <div
              className="font-mono text-2xl font-bold tracking-tight mb-0.5"
              style={{ color: c.color }}
            >
              {c.value}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">{c.subtext}</div>
          </div>
        );
      })}
    </div>
  );
}
