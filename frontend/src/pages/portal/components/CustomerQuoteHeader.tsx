import React from 'react';
import { CustomerQuote } from '@/types';
import { CustomerQuoteStatus } from './CustomerQuoteStatus';
import { Calendar, User, Mail, Clock, AlertTriangle, ShieldCheck, Download, Printer, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomerQuoteHeaderProps {
  quote: CustomerQuote;
  onDownloadPdf?: () => void;
  onDownloadHtml?: () => void;
}

export function CustomerQuoteHeader({ quote, onDownloadPdf, onDownloadHtml }: CustomerQuoteHeaderProps) {
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
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-sm text-amber-300 shadow-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
          <div className="flex-1 text-xs">
            <span className="font-semibold text-amber-200">Validity Notice:</span> This commercial offer expires in{' '}
            <strong className="underline text-amber-300 font-bold">{diffDays === 0 ? 'today' : `${diffDays} day${diffDays > 1 ? 's' : ''}`}</strong>.
            Prices and terms are subject to adjustment upon expiry.
          </div>
        </div>
      )}

      {/* Main Header Container */}
      <div className="rounded-2xl border border-slate-800/90 bg-gradient-to-b from-slate-900/95 to-slate-900/80 p-6 sm:p-7 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                Official Proposal
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
                {quote.quoteNumber}
              </h1>
              <CustomerQuoteStatus status={quote.status} size="md" />
              {quote.version > 1 && (
                <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
                  Version {quote.version} (Revised)
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400">
              Commercial proposal prepared specifically for{' '}
              <span className="font-semibold text-slate-100">{quote.customerName}</span>
              {quote.customerEmail && <span className="text-slate-400"> &bull; {quote.customerEmail}</span>}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onDownloadPdf && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDownloadPdf}
                className="border-slate-700 bg-slate-800/90 text-slate-200 hover:bg-slate-700 hover:text-white text-xs h-8"
              >
                <Printer className="mr-1.5 h-3.5 w-3.5 text-blue-400" />
                Print / Save PDF
              </Button>
            )}
            {onDownloadHtml && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDownloadHtml}
                className="border-slate-700 bg-slate-800/90 text-slate-200 hover:bg-slate-700 hover:text-white text-xs h-8"
              >
                <FileText className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                Export HTML
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
