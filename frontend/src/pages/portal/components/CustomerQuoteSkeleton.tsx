import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function CustomerQuoteSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-slate-800 rounded" />
            <div className="h-4 w-72 bg-slate-800/60 rounded" />
          </div>
          <div className="h-6 w-28 bg-slate-800 rounded-full" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
          <div className="h-10 bg-slate-800/40 rounded" />
          <div className="h-10 bg-slate-800/40 rounded" />
          <div className="h-10 bg-slate-800/40 rounded" />
          <div className="h-10 bg-slate-800/40 rounded" />
        </div>
      </div>

      {/* Items Skeleton */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
        <div className="h-5 w-40 bg-slate-800 rounded" />
        <div className="space-y-3 pt-2">
          <div className="h-12 bg-slate-800/40 rounded" />
          <div className="h-12 bg-slate-800/40 rounded" />
          <div className="h-12 bg-slate-800/40 rounded" />
        </div>
      </div>

      {/* Financial Summary Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/80 p-6 h-36" />
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 h-36" />
      </div>
    </div>
  );
}
