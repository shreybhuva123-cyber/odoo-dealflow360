import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDealHealthDetail } from '@/hooks/useDealHealth';
import {
  DealHealthSummary,
  DealHealthSignals,
  DealHealthTimeline,
  DealHealthDetailSkeleton,
} from './components';
import { DealHealthBadge, RiskBadge, RiskBreakdown } from '@/components/deal-health';
import { buttonVariants, Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Layers,
  FileText,
  CheckSquare,
  Truck,
  Receipt,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function DealHealthDetailPage() {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();

  const { data: deal, isLoading, error } = useDealHealthDetail(dealId);

  if (isLoading) {
    return <DealHealthDetailSkeleton />;
  }

  if (error || !deal) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4 mt-12">
        <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Deal Not Found</h2>
        <p className="text-xs text-slate-400">
          No health telemetry records were found matching deal ID "{dealId}".
        </p>
        <Link
          to="/app/deal-health"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'border-slate-700')}
        >
          Return to Deal Health Dashboard
        </Link>
      </div>
    );
  }

  const currency = '₹';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-16">
      {/* Back Breadcrumb */}
      <div>
        <Link
          to="/app/deal-health"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Deal Health Dashboard</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {deal.dealName}
              </h1>
              <DealHealthBadge status={deal.healthStatus} size="md" />
              <RiskBadge level={deal.riskLevel} size="md" />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span>Customer: <strong className="text-slate-200">{deal.customerName}</strong></span>
              <span>&bull;</span>
              <span>Account Owner: <strong className="text-slate-200">{deal.ownerName}</strong></span>
              <span>&bull;</span>
              <span>Quotation: <span className="font-mono text-blue-400">{deal.quotationNumber || 'N/A'}</span></span>
            </div>
          </div>

          {/* Cross-Module Action Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
            <Link
              to={`/app/pipeline/${deal.dealId}`}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'xs' }),
                'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white flex items-center gap-1'
              )}
            >
              <Layers className="h-3 w-3 text-blue-400" />
              <span>Pipeline</span>
            </Link>

            {deal.quotationId && (
              <Link
                to={`/app/quotations/${deal.quotationId}`}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'xs' }),
                  'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white flex items-center gap-1'
                )}
              >
                <FileText className="h-3 w-3 text-purple-400" />
                <span>Quotation</span>
              </Link>
            )}

            <Link
              to="/app/approvals"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'xs' }),
                'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white flex items-center gap-1'
              )}
            >
              <CheckSquare className="h-3 w-3 text-amber-400" />
              <span>Approvals</span>
            </Link>

            <Link
              to="/app/fulfillment"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'xs' }),
                'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white flex items-center gap-1'
              )}
            >
              <Truck className="h-3 w-3 text-emerald-400" />
              <span>Fulfillment</span>
            </Link>

            <Link
              to="/app/invoices"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'xs' }),
                'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white flex items-center gap-1'
              )}
            >
              <Receipt className="h-3 w-3 text-indigo-400" />
              <span>Invoicing</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Summary: Health Score Gauge & Commercial Parameter Metrics */}
      <DealHealthSummary deal={deal} currency={currency} />

      {/* Risk Breakdown Component */}
      <RiskBreakdown riskLevel={deal.riskLevel} signals={deal.signals} />

      {/* Telemetry Signals Sensor List */}
      <DealHealthSignals signals={deal.signals} />

      {/* Evolution Audit Timeline */}
      <DealHealthTimeline timeline={deal.timeline} />
    </div>
  );
}
