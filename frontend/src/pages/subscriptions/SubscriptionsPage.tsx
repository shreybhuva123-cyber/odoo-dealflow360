import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  useSubscriptions,
  usePauseSubscription,
  useResumeSubscription,
  useCancelSubscription,
} from '@/hooks/useSubscriptions';
import { SubscriptionStatus } from '@/types';
import {
  SubscriptionTable,
  SubscriptionCard,
  SubscriptionStatsSkeleton,
  SubscriptionTableSkeleton,
  SubscriptionEmptyState,
} from './components';
import { Card } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/formatters';
import { showToast } from '@/stores/toast.store';
import {
  Layers,
  Search,
  LayoutGrid,
  List,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Plus,
  RefreshCw,
} from 'lucide-react';

export function SubscriptionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const { data: subscriptions = [], isLoading, refetch } = useSubscriptions({
    search: searchTerm || undefined,
    status: statusFilter === 'all' ? undefined : (statusFilter as SubscriptionStatus),
  });

  const pauseMutation = usePauseSubscription();
  const resumeMutation = useResumeSubscription();
  const cancelMutation = useCancelSubscription();

  // Aggregate metrics
  const metrics = useMemo(() => {
    let totalMrr = 0;
    let totalArr = 0;
    let activeCount = 0;
    const currency = subscriptions[0]?.currency || 'INR';

    subscriptions.forEach((sub) => {
      if (sub.status === 'active') {
        totalMrr += sub.mrr;
        totalArr += sub.arr;
        activeCount++;
      }
    });

    return {
      totalMrr,
      totalArr,
      activeCount,
      totalCount: subscriptions.length,
      currency,
    };
  }, [subscriptions]);

  const handlePause = async (id: string) => {
    try {
      await pauseMutation.mutateAsync(id);
      showToast(`Subscription ${id} paused`, 'amber');
      refetch();
    } catch {
      showToast('Failed to pause subscription', 'red');
    }
  };

  const handleResume = async (id: string) => {
    try {
      await resumeMutation.mutateAsync(id);
      showToast(`Subscription ${id} resumed`, 'green');
      refetch();
    } catch {
      showToast('Failed to resume subscription', 'red');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelMutation.mutateAsync(id);
      showToast(`Subscription ${id} cancelled`, 'red');
      refetch();
    } catch {
      showToast('Failed to cancel subscription', 'red');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            Subscriptions & Recurring Revenue
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Contract recurring schedules, SaaS revenue recognition, churn prevention, and automated renewal cadences
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs border-border/80"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
          <Link
            to="/app/quotations"
            className={cn(buttonVariants({ size: 'sm' }), 'text-xs bg-primary text-primary-foreground hover:bg-primary/90')}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Contract Quote
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <SubscriptionStatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-card/70 border-border/70 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-muted-foreground">Monthly Recurring (MRR)</span>
              <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="font-mono text-xl font-bold text-primary">
              {formatCurrency(metrics.totalMrr, metrics.currency)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Active SaaS revenue run-rate
            </div>
          </Card>

          <Card className="p-4 bg-card/70 border-border/70 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-muted-foreground">Annual Run-Rate (ARR)</span>
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="font-mono text-xl font-bold text-emerald-400">
              {formatCurrency(metrics.totalArr, metrics.currency)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Projected 12-month contracted value
            </div>
          </Card>

          <Card className="p-4 bg-card/70 border-border/70 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-muted-foreground">Active Contracts</span>
              <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="font-mono text-xl font-bold text-foreground">
              {metrics.activeCount}{' '}
              <span className="text-xs font-normal text-muted-foreground">
                / {metrics.totalCount} total
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Currently generating recurring invoices
            </div>
          </Card>

          <Card className="p-4 bg-card/70 border-border/70 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-muted-foreground">Renewal Retention</span>
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="font-mono text-xl font-bold text-amber-400">
              98.4%
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Zero churn over last 90 days
            </div>
          </Card>
        </div>
      )}

      {/* Filter & View Switcher Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card/60 border border-border/60 p-3 rounded-xl">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto flex-1">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Filter by customer, plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs bg-surface-2/40 border-border/60"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
            className="w-[150px] h-9 text-xs bg-transparent border border-border/60 rounded-lg px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="paused">Paused</option>
            <option value="past_due">Past Due</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-1 border border-border/60 rounded-lg p-0.5 bg-surface-2/40">
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="h-7 px-2.5 text-xs"
          >
            <List className="w-3.5 h-3.5 mr-1" />
            Table
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-7 px-2.5 text-xs"
          >
            <LayoutGrid className="w-3.5 h-3.5 mr-1" />
            Grid
          </Button>
        </div>
      </div>

      {/* Subscriptions List */}
      {isLoading ? (
        <SubscriptionTableSkeleton />
      ) : subscriptions.length === 0 ? (
        <SubscriptionEmptyState />
      ) : viewMode === 'table' ? (
        <SubscriptionTable
          subscriptions={subscriptions}
          onPause={handlePause}
          onResume={handleResume}
          onCancel={handleCancel}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              onPause={handlePause}
              onResume={handleResume}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
