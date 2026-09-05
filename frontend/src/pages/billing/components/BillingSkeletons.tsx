import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Receipt, CalendarClock } from 'lucide-react';

export function BillingStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="p-4 bg-card/60 border-border/60">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-6 rounded" />
          </div>
          <Skeleton className="h-6 w-24 mb-1" />
          <Skeleton className="h-3 w-20" />
        </Card>
      ))}
    </div>
  );
}

export function BillingChartSkeleton() {
  return (
    <Card className="p-5 bg-card/60 border-border/60">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Skeleton className="h-5 w-48 mb-1" />
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
      <Skeleton className="h-[280px] w-full rounded-lg" />
    </Card>
  );
}

export function BillingScheduleTableSkeleton() {
  return (
    <Card className="p-5 bg-card/60 border-border/60">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 rounded-lg bg-surface-2/40 border border-border/40 flex items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-16 rounded" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function BillingEmptyState({
  title = 'No Billing Schedules Found',
  description = 'There are currently no active recurring schedules or milestone payment contracts.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="py-16 text-center flex flex-col items-center justify-center p-8 bg-card/40 border border-dashed border-border/60 rounded-xl">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
        <CalendarClock className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-md mb-4">{description}</p>
    </div>
  );
}
