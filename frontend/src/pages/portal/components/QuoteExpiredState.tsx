import React from 'react';
import { CustomerQuote } from '@/types';
import { AlertCircle, Mail, Phone, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuoteExpiredStateProps {
  quote: CustomerQuote;
  onRefresh?: () => void;
}

export function QuoteExpiredState({ quote }: QuoteExpiredStateProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 text-center max-w-xl mx-auto shadow-xl space-y-5 backdrop-blur">
      <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
        <AlertCircle className="h-7 w-7" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-white">Commercial Proposal Expired</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Quotation <strong className="text-slate-200">{quote.quoteNumber}</strong> prepared for{' '}
          <strong className="text-slate-200">{quote.customerName}</strong> was valid until{' '}
          <span className="underline">{quote.validUntil}</span>. Due to market pricing and inventory allocations, this offer is no longer directly actionable.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-left space-y-2 text-xs">
        <div className="font-semibold text-slate-300">Need an updated quotation?</div>
        <p className="text-slate-400">
          Our sales team can quickly generate a refreshed proposal with current inventory and pricing.
        </p>
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row gap-3">
          {quote.salesRepEmail && (
            <a
              href={`mailto:${quote.salesRepEmail}?subject=Request New Quotation for ${quote.quoteNumber}`}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>{quote.salesRepEmail}</span>
            </a>
          )}
          <div className="flex items-center gap-2 text-slate-400">
            <Phone className="h-3.5 w-3.5 text-slate-500" />
            <span>+1 (800) 555-3600</span>
          </div>
        </div>
      </div>
    </div>
  );
}
