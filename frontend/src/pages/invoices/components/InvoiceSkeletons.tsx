import React from 'react';

export function InvoiceTableSkeleton() {
  return (
    <div
      className="card p-4 space-y-3 animate-pulse"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="h-4 w-40 bg-muted/40 rounded mb-4" />
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border)]">
          <div className="h-4 w-20 bg-muted/40 rounded" />
          <div className="h-4 w-32 bg-muted/30 rounded" />
          <div className="h-4 w-28 bg-muted/30 rounded" />
          <div className="h-4 w-16 bg-muted/40 rounded" />
          <div className="h-4 w-24 bg-muted/30 rounded" />
        </div>
      ))}
    </div>
  );
}

export function InvoiceDetailSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-muted/40 rounded" />
          <div className="h-7 w-64 bg-muted/40 rounded" />
        </div>
        <div className="h-8 w-28 bg-muted/40 rounded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-24 bg-muted/20 rounded-lg" />
        <div className="h-24 bg-muted/20 rounded-lg" />
        <div className="h-24 bg-muted/20 rounded-lg" />
      </div>

      <div className="h-48 bg-muted/20 rounded-lg" />
      <div className="h-32 bg-muted/20 rounded-lg" />
    </div>
  );
}

export function InvoiceEmptyState({
  isFiltered = false,
  onReset,
}: {
  isFiltered?: boolean;
  onReset?: () => void;
}) {
  return (
    <div
      className="card p-12 text-center"
      style={{ background: 'var(--surface)', border: '1px dashed var(--border)' }}
    >
      <div className="text-4xl mb-3">🧾</div>
      <h3 className="text-sm font-bold text-foreground mb-1">
        {isFiltered ? 'No Matching Invoices Found' : 'No Invoices Generated'}
      </h3>
      <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
        {isFiltered
          ? 'Try adjusting your search queries or clearing active status and date filters.'
          : 'Invoices generated from eligible deals or completed fulfillments will appear here.'}
      </p>
      {isFiltered && onReset && (
        <button type="button" onClick={onReset} className="btn btn-ghost btn-sm text-xs">
          Reset Filters
        </button>
      )}
    </div>
  );
}
