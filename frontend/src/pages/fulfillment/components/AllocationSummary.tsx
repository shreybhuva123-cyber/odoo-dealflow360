import React from 'react';
import { Warehouse, ProductStockAvailability } from '@/types';

interface AllocationSummaryProps {
  requiredQuantity: number;
  totalAllocated: number;
  remainingQuantity: number;
  warehouses: Warehouse[];
  availability?: ProductStockAvailability | null;
  onAllocateAvailable?: () => void;
  onBackorderRemaining?: () => void;
  className?: string;
}

export function AllocationSummary({
  requiredQuantity,
  totalAllocated,
  remainingQuantity,
  warehouses,
  availability,
  onAllocateAvailable,
  onBackorderRemaining,
  className = '',
}: AllocationSummaryProps) {
  const isFullyAllocated = totalAllocated === requiredQuantity;
  const isOverAllocated = totalAllocated > requiredQuantity;
  const totalNetworkAvailable = availability?.totalAvailable ?? 0;
  const isShortage = remainingQuantity > 0 && totalNetworkAvailable < requiredQuantity;

  return (
    <div
      className={`card p-4 space-y-3 ${className}`}
      style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Allocation Yield
        </h4>
        {isFullyAllocated && (
          <span className="badge badge-green text-[11px] font-semibold">
            ✓ Fully Allocated
          </span>
        )}
        {isOverAllocated && (
          <span className="badge badge-red text-[11px] font-semibold">
            ⚠ Over-allocated by {totalAllocated - requiredQuantity}
          </span>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="card p-2" style={{ background: 'var(--surface)' }}>
          <div className="text-[10px] text-muted-foreground uppercase font-semibold">Required</div>
          <div className="font-mono text-base font-bold text-foreground mt-0.5">
            {requiredQuantity}
          </div>
        </div>

        <div className="card p-2" style={{ background: 'var(--surface)' }}>
          <div className="text-[10px] text-muted-foreground uppercase font-semibold">Allocated</div>
          <div
            className="font-mono text-base font-bold mt-0.5"
            style={{ color: isFullyAllocated ? 'var(--green)' : 'var(--accent)' }}
          >
            {totalAllocated}
          </div>
        </div>

        <div className="card p-2" style={{ background: 'var(--surface)' }}>
          <div className="text-[10px] text-muted-foreground uppercase font-semibold">Remaining</div>
          <div
            className="font-mono text-base font-bold mt-0.5"
            style={{
              color:
                remainingQuantity === 0
                  ? 'var(--green)'
                  : isShortage
                  ? 'var(--red)'
                  : 'var(--amber)',
            }}
          >
            {remainingQuantity}
          </div>
        </div>
      </div>

      {/* Warning banner if insufficient stock */}
      {remainingQuantity > 0 && (
        <div
          className="p-3 rounded text-xs space-y-2"
          style={{
            background: isShortage ? 'var(--red-dim)' : 'var(--amber-dim)',
            border: `1px solid ${isShortage ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
            color: isShortage ? 'var(--red)' : 'var(--amber)',
          }}
        >
          <div className="flex items-center gap-2 font-semibold">
            <span>⚠</span>
            <span>
              {isShortage ? 'Deficit Warning: Insufficient Network Stock' : 'Pending Allocation'}
            </span>
          </div>

          <p className="text-[11px] opacity-90">
            {remainingQuantity} units are still required. Total available across all connected hubs is{' '}
            <strong>{totalNetworkAvailable} units</strong>.
          </p>

          <div className="flex items-center gap-2 pt-1">
            {totalNetworkAvailable > 0 && totalAllocated < totalNetworkAvailable && (
              <button
                type="button"
                onClick={onAllocateAvailable}
                className="btn btn-warning btn-xs text-[11px]"
              >
                Auto-fill Available ({Math.min(remainingQuantity, totalNetworkAvailable - totalAllocated)})
              </button>
            )}
            {isShortage && (
              <button
                type="button"
                onClick={onBackorderRemaining}
                className="btn btn-ghost btn-xs text-[11px] border border-current"
              >
                Flag Backorder ({remainingQuantity})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
