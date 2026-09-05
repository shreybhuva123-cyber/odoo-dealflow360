import React from 'react';
import { CustomerQuote } from '@/types';
import { CustomerQuoteStatus } from './CustomerQuoteStatus';
import { Calendar, User, Mail, Clock, AlertTriangle, ShieldCheck, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomerQuoteHeaderProps {
  quote: CustomerQuote;
  onDownloadPdf?: () => void;
}

export function CustomerQuoteHeader({ quote, onDownloadPdf }: CustomerQuoteHeaderProps) {
  // Calculate remaining days
  const today = new Date();
  const validUntilDate = new Date(quote.validUntil);
  const diffTime = validUntilDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isExpired = diffDays < 0 || quote.status === 'expired';
  const isExpiringSoon = diffDays >= 0 && diffDays <= 5;

  return (
    <div className="space-y-4">
      {/* Expiry Warning Banner if expiring soon */}
      {isExpiringSoon && !isExpired && quote.status !== 'accepted' && quote.status !== 'rejected' && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
          <div className="flex-1">
            <span className="font-semibold">Validity Notice:</span> This commercial offer expires in{' '}
            <strong className="underline">{diffDays === 0 ? 'today' : `${diffDays} day${diffDays > 1 ? 's' : ''}`}</strong>.
            Prices and terms are subject to adjustment upon expiry.
          </div>
        </div>
      )}

      {/* Main Header Container */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Quotation {quote.quoteNumber}
              </h1>
              <CustomerQuoteStatus status={quote.status} size="md" />
              {quote.version > 1 && (
                <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
                  Version {quote.version} (Revised)
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400">
              Prepared especially for{' '}
              <span className="font-semibold text-slate-200">{quote.customerName}</span>
              {quote.customerEmail && <span> ({quote.customerEmail})</span>}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onDownloadPdf && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDownloadPdf}
                className="border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white"
              >
                <Download className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                Print / Save PDF
              </Button>
            )}
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-800/80 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2.5 text-xs text-slate-400">
            <Calendar className="h-4 w-4 text-slate-500" />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Issue Date</div>
              <div className="font-semibold text-slate-200">{quote.issueDate}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-400">
            <Clock className="h-4 w-4 text-slate-500" />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Valid Until</div>
              <div className="font-semibold text-slate-200">
                {quote.validUntil}{' '}
                {!isExpired && (
                  <span className="text-[11px] font-normal text-slate-400">
                    ({diffDays} days left)
                  </span>
                )}
              </div>
            </div>
          </div>

          {quote.salesRepName && (
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <User className="h-4 w-4 text-blue-400" />
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Account Executive</div>
                <div className="font-semibold text-slate-200">{quote.salesRepName}</div>
              </div>
            </div>
          )}

          {quote.salesRepEmail && (
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <Mail className="h-4 w-4 text-slate-500" />
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Sales Support</div>
                <a
                  href={`mailto:${quote.salesRepEmail}`}
                  className="font-semibold text-blue-400 hover:underline truncate max-w-[180px] block"
                >
                  {quote.salesRepEmail}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
