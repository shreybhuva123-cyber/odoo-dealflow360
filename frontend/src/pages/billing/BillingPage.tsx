import React from 'react';
import { Link } from 'react-router-dom';
import { useBillingStats, useBillingSchedules } from '@/hooks/useBilling';
import {
  BillingStats,
  BillingChart,
  BillingScheduleTable,
  BillingStatsSkeleton,
  BillingChartSkeleton,
  BillingScheduleTableSkeleton,
  BillingEmptyState,
} from './components';
import { Card } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { showToast } from '@/stores/toast.store';
import {
  CreditCard,
  Receipt,
  Layers,
  RotateCw,
  ArrowRight,
} from 'lucide-react';

export function BillingPage() {
  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useBillingStats();
  const {
    data: schedules = [],
    isLoading: isSchedulesLoading,
    refetch: refetchSchedules,
  } = useBillingSchedules();

  const handleSync = async () => {
    await Promise.all([refetchStats(), refetchSchedules()]);
    showToast('Billing schedules and financial realization synced', 'green');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            Billing & Revenue Operations
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time financial realization, recurring subscription cadence, milestone schedules, and revenue recognition
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            className="text-xs border-border/80"
          >
            <RotateCw className="w-3.5 h-3.5 mr-1.5" />
            Sync Ledger
          </Button>
          <Link
            to="/app/invoices"
            className={cn(buttonVariants({ size: 'sm' }), 'text-xs bg-primary text-primary-foreground hover:bg-primary/90')}
          >
            <Receipt className="w-3.5 h-3.5 mr-1.5" />
            Manage Invoices
          </Link>
        </div>
      </div>

      {/* Revenue & Realization KPIs */}
      {isStatsLoading || !stats ? (
        <BillingStatsSkeleton />
      ) : (
        <BillingStats stats={stats} />
      )}

      {/* Financial Realization Graph */}
      {isStatsLoading ? (
        <BillingChartSkeleton />
      ) : (
        <BillingChart />
      )}

      {/* Cross-navigation highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 bg-gradient-to-r from-card/90 to-surface-2/60 border-border/80 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Layers className="w-4 h-4" />
              <span>SaaS Subscriptions & ARR</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Manage recurring contracts, tiers, renewal cadences, and churn risk.
            </p>
          </div>
          <Link
            to="/app/subscriptions"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'border-border/80 text-xs')}
          >
            View Subscriptions
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </Card>

        <Card className="p-5 bg-gradient-to-r from-card/90 to-surface-2/60 border-border/80 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <Receipt className="w-4 h-4" />
              <span>Invoices & Receivables</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Reconcile payments, track overdue dunning, and issue tax invoices.
            </p>
          </div>
          <Link
            to="/app/invoices"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'border-border/80 text-xs')}
          >
            View Invoices
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </Card>
      </div>

      {/* Billing Schedules & Milestone Contracts Table */}
      {isSchedulesLoading ? (
        <BillingScheduleTableSkeleton />
      ) : schedules.length === 0 ? (
        <BillingEmptyState />
      ) : (
        <BillingScheduleTable schedules={schedules} />
      )}
    </div>
  );
}
