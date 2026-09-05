import React from 'react';
import { Warehouse, FulfillmentItem } from '@/types';

interface ConfirmAllocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item: FulfillmentItem;
  warehouses: Warehouse[];
  allocations: Record<string, number>;
  isSubmitting?: boolean;
}

export function ConfirmAllocationDialog({
  isOpen,
  onClose,
  onConfirm,
  item,
  warehouses,
  allocations,
  isSubmitting = false,
}: ConfirmAllocationDialogProps) {
  if (!isOpen) return null;

  const allocatedEntries = Object.entries(allocations)
    .filter(([_, qty]) => qty > 0)
    .map(([whId, qty]) => {
      const wh = warehouses.find((w) => w.id === whId);
      return {
        warehouseName: wh?.name || whId,
        city: wh?.city || '',
        quantity: qty,
      };
    });

  const totalQuantity = allocatedEntries.reduce((acc, e) => acc + e.quantity, 0);

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card w-full max-w-md p-6 animate-scale-in"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '20px' }}>📦</span>
            <h3 className="text-base font-bold text-foreground">Confirm Warehouse Allocation</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          Please review the physical inventory reservation plan for{' '}
          <strong className="text-foreground">{item.productName}</strong> (SKU: {item.sku}).
        </p>

        {/* Allocation breakdown list */}
        <div
          className="rounded p-3 mb-4 space-y-2 text-xs"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
        >
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Allocation Schedule
          </div>
          {allocatedEntries.map((entry, i) => (
            <div key={i} className="flex items-center justify-between py-1 border-b border-[var(--border)] last:border-none">
              <div className="text-foreground font-medium flex items-center gap-1.5">
                <span>🏭</span>
                <span>{entry.warehouseName}</span>
              </div>
              <div className="font-mono font-bold text-accent">{entry.quantity} units</div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2 mt-1 border-t border-[var(--border)] font-bold">
            <span className="text-foreground">Total Units Allocated:</span>
            <span className="font-mono text-sm text-green-400">{totalQuantity}</span>
          </div>
        </div>

        <div className="text-[11px] text-muted-foreground mb-6">
          ℹ️ Once confirmed, stock counts will be immediately deducted from the authoritative
          inventory ledger and earmarked for dispatch.
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="btn btn-ghost btn-sm text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting || totalQuantity === 0}
            className="btn btn-primary btn-sm text-xs"
          >
            {isSubmitting ? 'Reserving Stock...' : 'Confirm Allocation'}
          </button>
        </div>
      </div>
    </div>
  );
}
