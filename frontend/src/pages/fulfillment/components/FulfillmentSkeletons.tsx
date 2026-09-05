import React from 'react';

export function FulfillmentStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card p-3.5 animate-pulse" style={{ background: 'var(--surface)' }}>
          <div className="h-3 w-16 bg-muted/40 rounded mb-2" />
          <div className="h-6 w-12 bg-muted/40 rounded mb-1" />
          <div className="h-2.5 w-20 bg-muted/30 rounded" />
        </div>
      ))}
    </div>
  );
}

export function FulfillmentTableSkeleton() {
  return (
    <div
      className="card p-4 space-y-3 animate-pulse"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="h-4 w-48 bg-muted/40 rounded mb-4" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border)]">
          <div className="h-4 w-24 bg-muted/40 rounded" />
          <div className="h-4 w-32 bg-muted/30 rounded" />
          <div className="h-4 w-28 bg-muted/30 rounded" />
          <div className="h-4 w-16 bg-muted/40 rounded" />
          <div className="h-4 w-20 bg-muted/30 rounded" />
        </div>
      ))}
    </div>
  );
}

export function FulfillmentDetailSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-muted/40 rounded" />
          <div className="h-7 w-64 bg-muted/40 rounded" />
        </div>
        <div className="h-8 w-28 bg-muted/40 rounded" />
      </div>

      <div className="h-24 bg-muted/20 rounded-lg" />
      <div className="h-64 bg-muted/20 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-48 bg-muted/20 rounded-lg" />
        <div className="h-48 bg-muted/20 rounded-lg" />
      </div>
    </div>
  );
}
