import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Layers } from 'lucide-react';

export function SubscriptionStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-5 bg-card/60 border-border/60">
          <Skeleton className="h-3 w-28 mb-3" />
          <Skeleton className="h-8 w-36 mb-1" />
          <Skeleton className="h-3 w-20" />
        </Card>
      ))}
    </div>
  );
}

export function SubscriptionTableSkeleton() {
  return (
    <Card className="p-4 bg-card/60 border-border/60">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 rounded-lg bg-surface-2/40 border border-border/40 flex items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-60" />
            </div>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function SubscriptionDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-card/60 border border-border/60 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-card/60 border-border/60 space-y-4">
            <Skeleton className="h-5 w-40" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
            <Skeleton className="h-24 rounded-lg" />
          </Card>
          <Card className="p-6 bg-card/60 border-border/60 space-y-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-32 rounded-lg" />
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="p-6 bg-card/60 border-border/60 space-y-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-28 rounded-lg" />
          </Card>
        </div>
      </div>
    </div>
  );
}

export function SubscriptionEmptyState({
  title = 'No Subscriptions Found',
  description = 'There are currently no active SaaS contracts or recurring billing subscriptions.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="py-16 text-center flex flex-col items-center justify-center p-8 bg-card/40 border border-dashed border-border/60 rounded-xl">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
        <Layers className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-md mb-4">{description}</p>
    </div>
  );
}
