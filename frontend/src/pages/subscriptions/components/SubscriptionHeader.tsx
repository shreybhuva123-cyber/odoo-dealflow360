import React from 'react';
import { Link } from 'react-router-dom';
import { Subscription } from '@/types';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  PauseCircle,
  PlayCircle,
  XCircle,
  Receipt,
  FileText,
  Calendar,
  Building,
} from 'lucide-react';

interface SubscriptionHeaderProps {
  subscription: Subscription;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  isMutating?: boolean;
}

export function SubscriptionHeader({
  subscription,
  onPause,
  onResume,
  onCancel,
  isMutating = false,
}: SubscriptionHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Back button and breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          to="/app/subscriptions"
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Subscriptions
        </Link>
        <span>/</span>
        <span className="font-mono text-foreground font-semibold">{subscription.id}</span>
      </div>

      {/* Main Title & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/70 border border-border/70 p-6 rounded-2xl shadow-sm">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {subscription.planName}
            </h1>
            <SubscriptionStatusBadge status={subscription.status} size="md" />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Building className="w-4 h-4 text-primary" />
              <span>{subscription.customerName}</span>
            </div>

            {subscription.quotationNumber && (
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>Source Quote: </span>
                <Link
                  to={`/app/quotations/${subscription.quotationId || ''}`}
                  className="font-mono text-primary hover:underline font-semibold"
                >
                  {subscription.quotationNumber}
                </Link>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Frequency: {subscription.frequency || subscription.billingCycle}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {subscription.status === 'active' && onPause && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPause}
              disabled={isMutating}
              className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500/50"
            >
              <PauseCircle className="w-4 h-4 mr-1.5" />
              Pause Billing
            </Button>
          )}

          {subscription.status === 'paused' && onResume && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResume}
              disabled={isMutating}
              className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500/50"
            >
              <PlayCircle className="w-4 h-4 mr-1.5" />
              Resume Billing
            </Button>
          )}

          {subscription.status !== 'cancelled' && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isMutating}
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
            >
              <XCircle className="w-4 h-4 mr-1.5" />
              Cancel Contract
            </Button>
          )}

          <Link
            to={`/app/invoices?customer=${encodeURIComponent(subscription.customerName)}`}
            className={cn(buttonVariants({ size: 'sm' }), 'bg-primary text-primary-foreground hover:bg-primary/90')}
          >
            <Receipt className="w-4 h-4 mr-1.5" />
            Customer Invoices
          </Link>
        </div>
      </div>
    </div>
  );
}
