import React from 'react';
import { CustomerQuote } from '@/types';
import { Button, buttonVariants } from '@/components/ui/button';
import { CheckCircle2, MessageSquare, XCircle, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface QuoteActionsProps {
  quote: CustomerQuote;
  token: string;
  onAcceptClick: () => void;
  onRejectClick: () => void;
}

export function QuoteActions({
  quote,
  token,
  onAcceptClick,
  onRejectClick,
}: QuoteActionsProps) {
  const isAccepted = quote.status === 'accepted';
  const isRejected = quote.status === 'rejected';
  const isExpired = quote.status === 'expired';
  const isChangesRequested = quote.status === 'changes_requested';

  if (isAccepted) {
    return (
      <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-5 backdrop-blur flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-emerald-300">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600/20 border border-emerald-500/40">
            <Check className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="font-semibold text-white">Quotation Formally Accepted</h4>
            <p className="text-xs text-emerald-300/80">
              Your order confirmation and digital agreement are confirmed.
            </p>
          </div>
        </div>

        <Link
          to={`/portal/quote/${token}/confirmation`}
          className={cn(
            buttonVariants({ variant: 'default', size: 'sm' }),
            'bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1.5'
          )}
        >
          <span>View Order Confirmation</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="rounded-xl border border-rose-800/40 bg-rose-950/20 p-5 backdrop-blur flex items-center gap-3 text-rose-300">
        <XCircle className="h-6 w-6 text-rose-400 shrink-0" />
        <div>
          <h4 className="font-semibold text-white">Quotation Declined</h4>
          <p className="text-xs text-rose-300/80">
            This commercial offer has been marked as declined. If circumstances change, please reach out to your account executive.
          </p>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur flex items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-slate-300">Quotation Expired</h4>
          <p className="text-xs text-slate-500">
            The validity window for this commercial proposal has elapsed. Please request a refreshed quote.
          </p>
        </div>
        {quote.salesRepEmail && (
          <a
            href={`mailto:${quote.salesRepEmail}?subject=Request for Refreshed Quote ${quote.quoteNumber}`}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
            )}
          >
            Contact Account Executive
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur sticky bottom-4 shadow-xl z-20">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>
            {isChangesRequested
              ? 'Changes requested — awaiting revised proposal from sales.'
              : 'Review terms and take action on this proposal.'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRejectClick}
            className="border-slate-700 text-rose-400 hover:bg-rose-950/30 hover:border-rose-700"
          >
            <XCircle className="mr-1.5 h-3.5 w-3.5" />
            Decline
          </Button>

          <Link
            to={`/portal/quote/${token}/negotiate`}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'border-blue-700/60 bg-blue-950/30 text-blue-300 hover:bg-blue-900/40 hover:text-white'
            )}
          >
            <MessageSquare className="mr-1.5 h-3.5 w-3.5 text-blue-400" />
            Request Changes / Propose Terms
          </Link>

          <Button
            type="button"
            size="sm"
            onClick={onAcceptClick}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/30"
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            Accept & Sign Agreement
          </Button>
        </div>
      </div>
    </div>
  );
}
