import React, { useState } from 'react';
import { CustomerQuote } from '@/types';
import { ChevronDown, ChevronUp, FileText, CheckCircle } from 'lucide-react';

interface CustomerPricingSummaryProps {
  quote: CustomerQuote;
}

export function CustomerPricingSummary({ quote }: CustomerPricingSummaryProps) {
  const [showTerms, setShowTerms] = useState(false);
  const currency = quote.currency || '₹';

  const formatCurrency = (val: number) =>
    `${currency}${val.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Commercial Terms & Notes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-blue-400" />
              Offer Notes & Instructions
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {quote.notes ||
                'Pricing reflects enterprise volume agreement. Standard delivery within 7-10 business days upon acceptance. Dedicated technical support and onboarding included with hardware deployment.'}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowTerms(!showTerms)}
                className="flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                <span>{showTerms ? 'Hide' : 'Review'} Standard Terms & Conditions</span>
                {showTerms ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {showTerms && (
                <div className="mt-3 rounded-lg bg-slate-950/60 p-4 border border-slate-800 text-xs text-slate-400 space-y-2">
                  <p>
                    {quote.termsAndConditions ||
                      '1. Payment terms: Net 30 days from invoice issuance date.\n2. Taxes: GST applicable at prevailing government statutory rates (18%).\n3. Warranty: Comprehensive OEM hardware coverage for 24 months.\n4. Quotation validity: Subject to inventory availability until validUntil date.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Financial Calculation Breakdown */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur">
          <h3 className="text-sm font-semibold text-white mb-4">Investment Summary</h3>

          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Gross Subtotal</span>
              <span className="font-mono text-slate-200">{formatCurrency(quote.subtotal)}</span>
            </div>

            {quote.discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span className="flex items-center gap-1">
                  <span>Volume Savings</span>
                </span>
                <span className="font-mono">-{formatCurrency(quote.discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-400">
              <span>Estimated GST (18%)</span>
              <span className="font-mono text-slate-200">{formatCurrency(quote.tax)}</span>
            </div>

            {quote.shipping !== undefined && quote.shipping > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Shipping & Handling</span>
                <span className="font-mono text-slate-200">{formatCurrency(quote.shipping)}</span>
              </div>
            )}

            <div className="border-t border-slate-800 pt-3 mt-3">
              <div className="flex justify-between items-baseline">
                <span className="text-base font-bold text-white">Total Amount</span>
                <span className="font-mono text-2xl font-bold text-blue-400">
                  {formatCurrency(quote.total)}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 text-right">
                All applicable taxes included
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
