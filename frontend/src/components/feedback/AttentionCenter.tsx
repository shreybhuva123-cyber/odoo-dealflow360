import React from 'react';
import { Link } from 'react-router-dom';
import { useApprovals } from '@/hooks/useApprovals';
import { usePipeline } from '@/hooks/usePipeline';
import { useQuotations } from '@/hooks/useQuotations';
import { useInvoices } from '@/hooks/useInvoices';

export interface AttentionItem {
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

export function AttentionCenter({ items }: AttentionCenterProps) {
  const { data: approvals = [] } = useApprovals();
  const { data: deals = [] } = usePipeline();
  const { data: quotes = [] } = useQuotations();
  const { data: invoices = [] } = useInvoices();

  const displayItems = React.useMemo(() => {
    if (items && items.length > 0) return items;

    const pendingApprovals = approvals.filter((a) => a.status === 'PENDING');
    const riskyDeals = deals.filter((d) => d.health === 'critical' || d.health === 'at_risk');
    const negotiationQuotes = quotes.filter((q) => q.status === 'NEGOTIATION');
    const overdueInvoices = invoices.filter(
      (i) => i.status === 'overdue' || (i.status === 'pending' && new Date(i.dueDate).getTime() < Date.now())
    );

    const list: AttentionItem[] = [];

    if (pendingApprovals.length > 0) {
      const first = pendingApprovals[0];
      list.push({
        id: 'approvals',
        label: 'Approvals Pending Review',
        count: pendingApprovals.length,
        icon: '⏳',
        badgeColor: 'amber',
        route: '/app/approvals',
        description: `${first.quoteNumber} ${first.customerName}${pendingApprovals.length > 1 ? ` & ${pendingApprovals.length - 1} others` : ' waiting'}`,
      });
    }

    if (riskyDeals.length > 0) {
      const first = riskyDeals[0];
      const healthScore = Math.max(0, 100 - (first.riskScore ?? 35));
      list.push({
        id: 'critical_deals',
        label: 'Critical Deals at Risk',
        count: riskyDeals.length,
        icon: '🔴',
        badgeColor: 'red',
        route: '/app/deal-health',
        description: `${first.name || first.customerName} health score: ${healthScore}/100`,
      });
    }

    if (negotiationQuotes.length > 0) {
      const first = negotiationQuotes[0];
      list.push({
        id: 'negotiations',
        label: 'Customer Negotiations Active',
        count: negotiationQuotes.length,
        icon: '💬',
        badgeColor: 'blue',
        route: '/app/quotations',
        description: `${first.customerName} active counter-proposal`,
      });
    }

    if (overdueInvoices.length > 0) {
      const first = overdueInvoices[0];
      list.push({
        id: 'overdue_invoices',
        label: 'Overdue Receivables',
        count: overdueInvoices.length,
        icon: '🧾',
        badgeColor: 'red',
        route: '/app/invoices',
        description: `${first.invoiceNumber} (${first.customerName}) pending payment`,
      });
    }

    return list;
  }, [items, approvals, deals, quotes, invoices]);

  const totalCount = displayItems.reduce((acc, i) => acc + i.count, 0);

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
        {displayItems.map((item) => (
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
