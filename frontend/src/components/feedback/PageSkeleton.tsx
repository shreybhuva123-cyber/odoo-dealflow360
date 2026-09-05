import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* KPI Metric Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-lg border border-border/60 bg-card space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>

      {/* Main Table Skeleton */}
      <TableSkeleton rows={5} columns={6} />
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card overflow-hidden">
      <div className="p-4 border-b border-border/60 flex justify-between items-center">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="p-4 space-y-3">
        <div className="flex gap-4 pb-2 border-b border-border/40">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex gap-4 py-2 border-b border-border/20 items-center">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <Skeleton key={colIdx} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-5 rounded-lg border border-border/60 bg-card space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}
