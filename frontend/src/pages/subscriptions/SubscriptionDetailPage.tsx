import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useSubscription,
  usePauseSubscription,
  useResumeSubscription,
  useCancelSubscription,
} from '@/hooks/useSubscriptions';
import { useInvoices } from '@/hooks/useInvoices';
import {
  SubscriptionHeader,
  SubscriptionTimeline,
  SubscriptionDetailSkeleton,
} from './components';
import { InvoiceTable } from '../invoices/components/InvoiceTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { showToast } from '@/stores/toast.store';
import {
  Building2,
  Calendar,
  Layers,
  ArrowLeft,
  AlertTriangle,
  Receipt,
  FileText,
  ShieldCheck,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';

export function SubscriptionDetailPage() {
  const { subscriptionId } = useParams<{ subscriptionId: string }>();
  const {
    data: subscription,
    isLoading,
    error,
    refetch,
  } = useSubscription(subscriptionId || '');

  const pauseMutation = usePauseSubscription();
  const resumeMutation = useResumeSubscription();
  const cancelMutation = useCancelSubscription();

  const { data: customerInvoices = [] } = useInvoices(
    subscription ? { search: subscription.customerName } : {}
  );

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <SubscriptionDetailSkeleton />
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="p-12 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Subscription Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested subscription contract #{subscriptionId} could not be located.
        </p>
        <Link to="/app/subscriptions" className={cn(buttonVariants({ variant: 'outline' }))}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Subscriptions
        </Link>
      </div>
    );
  }

  const handlePause = async () => {
    try {
      await pauseMutation.mutateAsync(subscription.id);
      showToast('Subscription paused', 'amber');
      refetch();
    } catch {
      showToast('Failed to pause subscription', 'red');
    }
  };

  const handleResume = async () => {
    try {
      await resumeMutation.mutateAsync(subscription.id);
      showToast('Subscription resumed', 'green');
      refetch();
    } catch {
      showToast('Failed to resume subscription', 'red');
    }
  };

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel this contract?')) {
      try {
        await cancelMutation.mutateAsync(subscription.id);
        showToast('Subscription cancelled', 'red');
        refetch();
      } catch {
        showToast('Failed to cancel subscription', 'red');
      }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <SubscriptionHeader
        subscription={subscription}
        onPause={handlePause}
        onResume={handleResume}
        onCancel={handleCancel}
        isMutating={pauseMutation.isPending || resumeMutation.isPending || cancelMutation.isPending}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Financial Breakdown, Timeline, and Linked Invoices */}
        <div className="lg:col-span-8 space-y-6">
          {/* Contract Terms & Revenue Breakdown */}
          <Card className="bg-card/70 border-border/70 shadow-sm">
            <CardHeader className="p-5 pb-3 border-b border-border/40">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center justify-between">
                <span>Contract & Revenue Profile</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {subscription.autoRenew ? 'Auto-Renew Active' : 'Expiring Contract'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl bg-surface-2/50 border border-border/40">
                  <span className="text-[11px] text-muted-foreground font-medium block mb-1">
                    Monthly Recurring (MRR)
                  </span>
                  <span className="font-mono text-lg font-bold text-primary">
                    {formatCurrency(subscription.mrr, subscription.currency)}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-2/50 border border-border/40">
                  <span className="text-[11px] text-muted-foreground font-medium block mb-1">
                    Annual Run-Rate (ARR)
                  </span>
                  <span className="font-mono text-lg font-bold text-emerald-400">
                    {formatCurrency(subscription.arr, subscription.currency)}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-2/50 border border-border/40">
                  <span className="text-[11px] text-muted-foreground font-medium block mb-1">
                    Billing Cycle
                  </span>
                  <span className="text-sm font-semibold text-foreground capitalize">
                    {subscription.frequency || subscription.billingCycle}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-2/50 border border-border/40">
                  <span className="text-[11px] text-muted-foreground font-medium block mb-1">
                    Contract Tier
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {subscription.planTier || 'Standard'}
                  </span>
                </div>
              </div>

              {/* Schedule Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border/40 text-xs">
                <div>
                  <span className="text-muted-foreground block mb-0.5">Start Date:</span>
                  <span className="font-mono font-medium text-foreground">
                    {formatDate(subscription.startDate)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Next Invoice Due:</span>
                  <span className="font-mono font-medium text-foreground">
                    {subscription.nextBillingDate ? formatDate(subscription.nextBillingDate) : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Contract Renewal Date:</span>
                  <span className="font-mono font-medium text-foreground">
                    {subscription.renewalDate ? formatDate(subscription.renewalDate) : 'Open-ended'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <SubscriptionTimeline timeline={subscription.timeline} />

          {/* Invoices Generated Under Customer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" />
                Customer Invoices ({customerInvoices.length})
              </h3>
              <Link
                to={`/app/invoices?customer=${encodeURIComponent(subscription.customerName)}`}
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-xs text-primary')}
              >
                View All Invoices
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {customerInvoices.length > 0 ? (
              <InvoiceTable invoices={customerInvoices} />
            ) : (
              <Card className="p-6 text-center text-xs text-muted-foreground bg-card/50">
                No invoices recorded for this customer yet.
              </Card>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Customer Profile & Churn Health */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer Metadata Card */}
          <Card className="bg-card/70 border-border/70 p-5 space-y-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-primary" />
              Customer Information
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-semibold text-foreground text-sm">
                {subscription.customerName}
              </div>
              <p className="text-muted-foreground">
                Enterprise Accounts Tier · Bengaluru, India
              </p>
              <div className="pt-2 border-t border-border/40 flex items-center justify-between text-muted-foreground">
                <span>Account Manager:</span>
                <span className="font-medium text-foreground">Neha Sharma</span>
              </div>
            </div>
          </Card>

          {/* Churn & Health Risk Score */}
          <Card className="bg-card/70 border-border/70 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Account Health
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" />
                Healthy (98/100)
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Customer has 100% on-time payment record with zero overdue balance across 4 billing cycles.
            </p>

            <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Risk of Churn:</span>
              <span className="font-bold text-emerald-400">Very Low (&lt; 2%)</span>
            </div>
          </Card>

          {/* Linked Commercial Entities */}
          <Card className="bg-card/70 border-border/70 p-5 space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Linked Commercial Flow
            </div>

            <div className="space-y-2 text-xs">
              {subscription.dealId && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-surface-2/40 border border-border/40">
                  <div className="truncate max-w-[170px]">
                    <div className="font-medium text-foreground">Deal Opportunity</div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {subscription.dealName || subscription.dealId}
                    </div>
                  </div>
                  <Link
                    to={`/app/pipeline/${subscription.dealId}`}
                    className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-7 w-7 text-primary')}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {subscription.quotationId && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-surface-2/40 border border-border/40">
                  <div>
                    <div className="font-medium text-foreground">Source Quotation</div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      {subscription.quotationNumber || subscription.quotationId}
                    </div>
                  </div>
                  <Link
                    to={`/app/quotations/${subscription.quotationId}`}
                    className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-7 w-7 text-emerald-400')}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
