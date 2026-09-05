import React from 'react';
import { Link } from 'react-router-dom';

interface AttentionItem {
  id: string;
  label: string;
  count: number;
  icon: string;
  badgeColor: 'red' | 'amber' | 'blue' | 'purple';
  route: string;
  description: string;
}

interface AttentionCenterProps {
  items?: AttentionItem[];
}

const DEFAULT_ATTENTION_ITEMS: AttentionItem[] = [
  {
    id: 'approvals',
    label: 'Approvals Pending Review',
    count: 3,
    icon: '⏳',
    badgeColor: 'amber',
    route: '/app/approvals',
    description: 'Q-1042 Acme Corp & 2 others waiting',
  },
  {
    id: 'critical_deals',
    label: 'Critical Deals at Risk',
    count: 2,
    icon: '🔴',
    badgeColor: 'red',
    route: '/app/deal-health',
    description: 'OmniCorp Global health score: 34/100',
  },
  {
    id: 'negotiations',
    label: 'Customer Negotiations Active',
    count: 1,
    icon: '💬',
    badgeColor: 'blue',
    route: '/portal/quote/portal_acme_1042/negotiate',
    description: 'Acme Corp proposed $1,050/unit',
  },
  {
    id: 'overdue_invoices',
    label: 'Overdue Receivables',
    count: 2,
    icon: '🧾',
    badgeColor: 'red',
    route: '/app/invoices',
    description: 'INV-2026-004 & INV-2026-007 pending',
  },
];

export function AttentionCenter({ items = DEFAULT_ATTENTION_ITEMS }: AttentionCenterProps) {
  const totalCount = items.reduce((acc, i) => acc + i.count, 0);

  if (totalCount === 0) return null;

  return (
    <div className="card p-4 mb-6 border-accent/30 bg-gradient-to-r from-surface via-surface to-accent/5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 text-accent text-sm">
            ⚡
          </span>
          <h3 className="text-sm font-bold text-foreground">
            Requires Your Attention
          </h3>
          <span className="badge badge-blue text-[10px] font-bold">
            {totalCount} Actionable Items
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Real-time triage queue for active workflow items
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((item) => (
          <Link
            key={item.id}
            to={item.route}
            className="p-3 rounded-lg border border-border bg-surface2/60 hover:bg-surface2 hover:border-accent/40 transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-base">{item.icon}</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  item.badgeColor === 'red'
                    ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                    : item.badgeColor === 'amber'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                }`}
              >
                {item.count}
              </span>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1">
                {item.label}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
