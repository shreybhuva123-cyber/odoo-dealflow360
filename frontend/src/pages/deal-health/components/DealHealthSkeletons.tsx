import React from 'react';

export function DealHealthDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse p-6 max-w-7xl mx-auto">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-slate-800 rounded" />
          <div className="h-4 w-96 bg-slate-800/60 rounded" />
        </div>
        <div className="h-9 w-32 bg-slate-800 rounded-md" />
      </div>

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-slate-900 border border-slate-800 rounded-xl" />
        ))}
      </div>

      {/* Second KPI Cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-slate-900 border border-slate-800 rounded-xl" />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72 bg-slate-900 border border-slate-800 rounded-xl" />
        <div className="h-72 bg-slate-900 border border-slate-800 rounded-xl" />
      </div>

      {/* Table skeleton */}
      <div className="h-64 bg-slate-900 border border-slate-800 rounded-xl" />
    </div>
  );
}

export function DealHealthDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse p-6 max-w-7xl mx-auto">
      <div className="h-6 w-48 bg-slate-800 rounded" />
      <div className="h-24 bg-slate-900 border border-slate-800 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="h-64 bg-slate-900 border border-slate-800 rounded-xl" />
        <div className="lg:col-span-3 h-64 bg-slate-900 border border-slate-800 rounded-xl" />
      </div>
      <div className="h-64 bg-slate-900 border border-slate-800 rounded-xl" />
    </div>
  );
}
