import React from 'react';
import { BillingStats as StatsType } from '@/types';

interface BillingStatsProps {
  stats?: StatsType;
  isLoading?: boolean;
}

export function BillingStats({ stats, isLoading }: BillingStatsProps) {
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

  const formatLakhs = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)} L`;
    }
    return `₹${val.toLocaleString()}`;
  };

  const cards = [
    {
      label: 'Total Revenue',
      value: formatLakhs(stats.totalRevenue),
      subtext: 'Billed contract yield',
      icon: '💰',
      color: 'var(--foreground)',
    },
    {
      label: 'Outstanding',
      value: formatLakhs(stats.outstandingAmount),
      subtext: 'Uncollected receivables',
      icon: '⏳',
      color: 'var(--accent)',
    },
    {
      label: 'Overdue',
      value: formatLakhs(stats.overdueAmount),
      subtext: `${stats.overdueCount} account(s) past due`,
      icon: '⚠',
      color: 'var(--red)',
    },
    {
      label: 'Paid / Collected',
      value: formatLakhs(stats.paidAmount),
      subtext: 'Settled funds',
      icon: '✓',
      color: 'var(--green)',
    },
    {
      label: 'Due Soon',
      value: formatLakhs(stats.dueSoonAmount),
      subtext: 'Maturing in 7 days',
      icon: '📅',
      color: 'var(--amber)',
    },
    {
      label: 'Monthly Recurring (MRR)',
      value: formatLakhs(stats.mrr),
      subtext: `${stats.activeSubscriptionsCount} active SaaS plans`,
      icon: '🔁',
      color: '#C084FC',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
            <span style={{ fontSize: '13px' }}>{c.icon}</span>
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
