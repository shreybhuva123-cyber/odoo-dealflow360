import React from 'react';
import { ApprovalBottleneck } from '@/types';
import { Link } from 'react-router-dom';
import { CheckSquare, Clock, ArrowRight, ShieldAlert } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RiskBadge } from '@/components/deal-health';

interface ApprovalBottleneckCardProps {
  data: {
    managerPendingCount: number;
    financePendingCount: number;
    longestWaitingDays: number;
    bottlenecks: ApprovalBottleneck[];
  };
  currency?: string;
}

export function ApprovalBottleneckCard({ data, currency = '₹' }: ApprovalBottleneckCardProps) {
  const totalPending = data.managerPendingCount + data.financePendingCount;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm backdrop-blur space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Approval Bottlenecks & Delays</h3>
        </div>
        <Link
          to="/app/approvals"
          className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
        >
          <span>Approval Center</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3 text-center">
          <span className="text-[11px] text-slate-400 block font-medium">Manager Queue</span>
          <span className="text-lg font-bold font-mono text-white mt-0.5 block">
            {data.managerPendingCount} pending
          </span>
        </div>

        <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3 text-center">
          <span className="text-[11px] text-slate-400 block font-medium">Finance Queue</span>
          <span className="text-lg font-bold font-mono text-purple-400 mt-0.5 block">
            {data.financePendingCount} pending
          </span>
        </div>

        <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3 text-center">
          <span className="text-[11px] text-slate-400 block font-medium">Longest Waiting</span>
          <span className="text-lg font-bold font-mono text-amber-400 mt-0.5 block">
            {data.longestWaitingDays} days
          </span>
        </div>
      </div>

      {/* Bottlenecks list */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Pending Decision Queue ({totalPending})
        </div>

        <div className="space-y-2">
          {data.bottlenecks.map((b) => (
            <div
              key={b.dealId}
              className="rounded-lg bg-slate-950/40 border border-slate-800/60 p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <div className="font-semibold text-white flex items-center gap-2">
                  <span>{b.customerName}</span>
                  <span className="text-slate-400 font-mono text-[11px]">({b.quotationNumber})</span>
                  <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
                    Awaiting {b.waitingRole}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Deal Value: <strong className="text-slate-200 font-mono">{currency}{(b.dealValue / 100000).toFixed(1)}L</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-amber-400 font-mono font-bold text-[11px] flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {b.waitingDays} day{b.waitingDays !== 1 ? 's' : ''} in queue
                </span>
                <Link
                  to="/app/approvals"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'xs' }),
                    'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  )}
                >
                  Review
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
