import React from 'react';
import { StalledDeal } from '@/types';
import { Link } from 'react-router-dom';
import { Clock, AlertCircle, ArrowRight, User } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DealHealthBadge } from '@/components/deal-health';

interface StalledDealsCardProps {
  deals: StalledDeal[];
  currency?: string;
}

export function StalledDealsCard({ deals, currency = '₹' }: StalledDealsCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm backdrop-blur space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Stalled Deals & Dormancy Alerts</h3>
        </div>
        <span className="text-xs text-amber-400 font-medium">
          {deals.length} deals inactive &ge; 7 days
        </span>
      </div>

      <div className="divide-y divide-slate-800/60">
        {deals.map((deal) => (
          <div key={deal.dealId} className="py-3 first:pt-0 last:pb-0 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">{deal.customerName}</span>
                  <DealHealthBadge status={deal.healthStatus} size="sm" />
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{deal.dealName}</div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  No activity for {deal.stalledDays} days
                </span>

                <Link
                  to={`/app/deal-health/${deal.dealId}`}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'xs' }),
                    'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white flex items-center gap-1'
                  )}
                >
                  <span>View Deal</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3 text-slate-400" />
                Owner: <strong className="text-slate-300">{deal.ownerName}</strong>
              </span>
              <span>
                Deal Value: <strong className="text-white font-mono">{currency}{(deal.value / 100000).toFixed(1)}L</strong>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
