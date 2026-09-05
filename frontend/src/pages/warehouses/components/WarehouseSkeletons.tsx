import React from 'react';

export function WarehouseCardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card p-4 animate-pulse" style={{ background: 'var(--surface)' }}>
          <div className="h-4 w-28 bg-muted/40 rounded mb-2" />
          <div className="h-3 w-40 bg-muted/30 rounded mb-4" />
          <div className="h-2 w-full bg-muted/30 rounded mb-4" />
          <div className="grid grid-cols-3 gap-2">
            <div className="h-10 bg-muted/30 rounded" />
            <div className="h-10 bg-muted/30 rounded" />
            <div className="h-10 bg-muted/30 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function WarehouseEmptyState({ onReset }: { onReset?: () => void }) {
  return (
    <div
      className="card p-12 text-center"
      style={{ background: 'var(--surface)', border: '1px dashed var(--border)' }}
    >
      <div className="text-4xl mb-3">🏭</div>
      <h3 className="text-sm font-bold text-foreground mb-1">No Warehouses Located</h3>
      <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
        No regional logistics facilities match your current query parameters.
      </p>
      {onReset && (
        <button type="button" onClick={onReset} className="btn btn-ghost btn-sm text-xs">
          Reset Filter Query
        </button>
      )}
    </div>
  );
}
