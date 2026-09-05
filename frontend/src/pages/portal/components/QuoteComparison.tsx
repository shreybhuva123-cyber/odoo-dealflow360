import React, { useState } from 'react';
import { CustomerQuote } from '@/types';
import { GitCompare, TrendingDown, ArrowRight, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface QuoteComparisonProps {
  quote: CustomerQuote;
}

export function QuoteComparison({ quote }: QuoteComparisonProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!quote.previousVersion || quote.version <= 1) {
    return null;
  }

  const prev = quote.previousVersion;
  const currTotal = quote.total;
  const diffTotal = currTotal - prev.total;
  const isSavings = diffTotal < 0;
  const currency = quote.currency || '₹';

  const formatCurrency = (val: number) =>
    `${currency}${Math.abs(val).toLocaleString('en-IN')}`;

  return (
    <div className="rounded-xl border border-indigo-800/40 bg-gradient-to-r from-indigo-950/30 via-slate-900/60 to-blue-950/30 p-5 shadow-sm backdrop-blur">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <GitCompare className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                Revised Offer: Version {quote.version} vs Version {prev.versionNumber}
              </h3>
              <span className="inline-flex items-center gap-1 rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
                <Sparkles className="h-3 w-3" /> Updated Terms
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {prev.summary || 'Updated following your negotiation request.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-center">
          <div className="text-right">
            <div className="text-[11px] text-slate-400">
              <span className="line-through">{formatCurrency(prev.total)}</span>
              <ArrowRight className="inline mx-1 h-3 w-3 text-slate-500" />
              <span className="font-bold text-white">{formatCurrency(currTotal)}</span>
            </div>
            {isSavings ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                <TrendingDown className="h-3.5 w-3.5" />
                Net Savings: {formatCurrency(diffTotal)}
              </span>
            ) : (
              <span className="text-xs font-semibold text-indigo-400">
                Delta: +{formatCurrency(diffTotal)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle comparison details"
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isOpen && prev.changes && prev.changes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-indigo-900/40">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-2.5">
            Key Amendments from Version {prev.versionNumber}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {prev.changes.map((change, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 text-xs space-y-1.5"
              >
                <div className="font-semibold text-slate-200 flex items-center justify-between">
                  <span>{change.item}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="rounded bg-rose-950/40 border border-rose-800/40 px-2 py-0.5 text-rose-300 text-[11px]">
                    {change.previous}
                  </span>
                  <ArrowRight className="h-3 w-3 text-slate-500 shrink-0" />
                  <span className="rounded bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 text-emerald-300 text-[11px] font-medium">
                    {change.updated}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
