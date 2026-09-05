import React from 'react';
import { Link } from 'react-router-dom';
import { Subscription } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Layers,
  ArrowUpRight,
  PauseCircle,
  PlayCircle,
  Receipt,
  RotateCw,
} from 'lucide-react';

interface SubscriptionCardProps {
  subscription: Subscription;
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export function SubscriptionCard({
  subscription,
  onPause,
  onResume,
}: SubscriptionCardProps) {
  return (
    <Card className="bg-card/70 border-border/70 hover:border-border transition-all duration-200 hover:shadow-lg flex flex-col justify-between">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="space-y-1">
            <span className="font-mono text-xs font-bold text-primary flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {subscription.id}
            </span>
            <h3 className="font-semibold text-base text-foreground leading-tight">
              {subscription.customerName}
            </h3>
          </div>
          <SubscriptionStatusBadge status={subscription.status} size="sm" />
        </div>

        <p className="text-xs text-muted-foreground line-clamp-1">{subscription.planName}</p>
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-4">
        {/* Financial Metrics */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-surface-2/40 border border-border/40">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
              MRR
            </span>
            <span className="font-mono text-base font-bold text-primary">
              {formatCurrency(subscription.mrr, subscription.currency)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
              ARR
            </span>
            <span className="font-mono text-base font-bold text-emerald-400">
              {formatCurrency(subscription.arr, subscription.currency)}
            </span>
          </div>
        </div>

        {/* Schedule metadata */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Billing Cycle:</span>
            <span className="font-medium text-foreground capitalize">
              {subscription.frequency || subscription.billingCycle}
            </span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Next Invoice:</span>
            <span className="font-mono font-medium text-foreground">
              {subscription.nextBillingDate ? formatDate(subscription.nextBillingDate) : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Renewal:</span>
            <span className="font-mono font-medium text-foreground">
              {subscription.renewalDate ? formatDate(subscription.renewalDate) : 'Open-ended'}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-3 border-t border-border/40 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {subscription.status === 'active' && onPause && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPause(subscription.id)}
              className="h-8 px-2 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
            >
              <PauseCircle className="w-3.5 h-3.5 mr-1" />
              Pause
            </Button>
          )}

          {subscription.status === 'paused' && onResume && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onResume(subscription.id)}
              className="h-8 px-2 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
            >
              <PlayCircle className="w-3.5 h-3.5 mr-1" />
              Resume
            </Button>
          )}
        </div>

        <Link
          to={`/app/subscriptions/${subscription.id}`}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'h-8 text-xs border-border/80')}
        >
          Details
          <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </CardFooter>
    </Card>
  );
}
