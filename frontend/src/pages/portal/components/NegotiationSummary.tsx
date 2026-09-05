import React from 'react';
import { NegotiationRequest } from '@/types';
import { MessageSquare, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NegotiationSummaryProps {
  negotiation: NegotiationRequest;
}

export function NegotiationSummary({ negotiation }: NegotiationSummaryProps) {
  const getStatusBadge = (status: NegotiationRequest['status']) => {
    switch (status) {
      case 'accepted':
        return {
          label: 'Accepted by Sales',
          icon: CheckCircle,
          className: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40',
        };
      case 'rejected':
        return {
          label: 'Declined by Sales',
          icon: XCircle,
          className: 'bg-rose-950/40 text-rose-400 border-rose-800/40',
        };
      case 'under_review':
        return {
          label: 'Under Commercial Review',
          icon: Clock,
          className: 'bg-indigo-950/40 text-indigo-400 border-indigo-800/40',
        };
      case 'pending':
      default:
        return {
          label: 'Proposal Submitted / Pending',
          icon: Clock,
          className: 'bg-amber-950/40 text-amber-400 border-amber-800/40',
        };
    }
  };

  const badge = getStatusBadge(negotiation.status);
  const StatusIcon = badge.icon;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm backdrop-blur space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Your Negotiation Submission</h3>
        </div>

        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border',
            badge.className
          )}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          <span>{badge.label}</span>
        </span>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <span className="text-slate-400">Customer Note / Message:</span>
          <p className="mt-1 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-200 leading-relaxed italic">
            "{negotiation.message}"
          </p>
        </div>

        {negotiation.items && negotiation.items.length > 0 && (
          <div className="space-y-2">
            <span className="text-slate-400 font-medium">Proposed Item Changes:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {negotiation.items.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-slate-950/40 border border-slate-800/60 p-3 space-y-1.5"
                >
                  <div className="font-semibold text-white">{item.productName}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
                    <span>
                      Qty: {item.currentQuantity} <ArrowRight className="inline h-3 w-3" />{' '}
                      <strong className="text-slate-200">{item.requestedQuantity}</strong>
                    </span>
                    <span>|</span>
                    <span>
                      Rate: ₹{item.currentPrice.toLocaleString()} <ArrowRight className="inline h-3 w-3" />{' '}
                      <strong className="text-blue-400">₹{item.requestedPrice.toLocaleString()}</strong>
                    </span>
                  </div>
                  {item.note && (
                    <p className="text-[11px] text-slate-500 italic">"{item.note}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {negotiation.salesRepResponse && (
          <div className="rounded-lg bg-blue-950/30 border border-blue-800/40 p-3 text-blue-300 space-y-1">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <span>Response from Sales Representative:</span>
            </div>
            <p className="text-xs text-blue-200/90 leading-relaxed">
              {negotiation.salesRepResponse}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
