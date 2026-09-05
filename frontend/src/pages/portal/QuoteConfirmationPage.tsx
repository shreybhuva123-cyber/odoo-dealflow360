import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCustomerQuote } from '@/hooks/portal';
import { CustomerQuoteSkeleton, PortalErrorState } from './components';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  CheckCircle2,
  Download,
  ArrowLeft,
  FileCheck,
  Truck,
  Receipt,
  Mail,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function QuoteConfirmationPage() {
  const { token } = useParams<{ token: string }>();
  const { data: quote, isLoading } = useCustomerQuote(token);

  if (isLoading) {
    return <CustomerQuoteSkeleton />;
  }

  if (!quote || !token) {
    return (
      <PortalErrorState message="The confirmation receipt could not be retrieved." />
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const currency = quote.currency || '₹';

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-16">
      {/* Back Link */}
      <div>
        <Link
          to={`/portal/quote/${token}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Quotation {quote.quoteNumber}</span>
        </Link>
      </div>

      {/* Hero Confirmation Card */}
      <div className="rounded-2xl border border-emerald-800/40 bg-gradient-to-b from-emerald-950/40 via-slate-900/80 to-slate-900/80 p-8 text-center shadow-xl space-y-6 backdrop-blur">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="h-9 w-9" />
        </div>

        <div className="space-y-2">
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
            Digital Agreement Executed
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Thank you for your business!
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Your formal acceptance of Quotation{' '}
            <strong className="text-slate-200">{quote.quoteNumber}</strong> has been confirmed and logged into DealFlow360 operations.
          </p>
        </div>

        {/* Receipt Snapshot Box */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 text-left grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Customer</span>
            <div className="font-semibold text-white">{quote.customerName}</div>
            {quote.customerEmail && (
              <div className="text-slate-400 text-[11px]">{quote.customerEmail}</div>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Grand Total</span>
            <div className="font-mono text-base font-bold text-blue-400">
              {currency}{quote.total.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400">Taxes & fees included</div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Items Ordered</span>
            <div className="font-semibold text-white">
              {quote.items.reduce((sum, it) => sum + it.quantity, 0)} total units
            </div>
            <div className="text-[11px] text-slate-400">Across {quote.items.length} product lines</div>
          </div>
        </div>

        {/* Next Steps Roadmap */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-left space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-blue-400" />
            Next Steps in Order Processing
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg bg-slate-950/40 border border-slate-800/80 p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
                <Mail className="h-3.5 w-3.5" />
                <span>1. Order Receipt</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                A formal countersigned PDF copy has been queued to your registered email address.
              </p>
            </div>

            <div className="rounded-lg bg-slate-950/40 border border-slate-800/80 p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <Truck className="h-3.5 w-3.5" />
                <span>2. Warehouse Allocation</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Fulfillment units are reserved from the regional distribution hub for priority packing.
              </p>
            </div>

            <div className="rounded-lg bg-slate-950/40 border border-slate-800/80 p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs">
                <Receipt className="h-3.5 w-3.5" />
                <span>3. Tax Invoicing</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Accounts receivable will generate your tax invoice with Net-30 payment instructions.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700"
          >
            <Download className="mr-1.5 h-4 w-4 text-slate-400" />
            Print / Save Order Receipt
          </Button>

          <Link
            to={`/portal/quote/${token}`}
            className={cn(
              buttonVariants({ variant: 'default', size: 'sm' }),
              'bg-blue-600 hover:bg-blue-500 text-white font-medium'
            )}
          >
            Return to Quotation Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
