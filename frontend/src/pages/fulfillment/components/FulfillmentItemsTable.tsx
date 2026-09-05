import React from 'react';
import { FulfillmentItem, ItemStockStatus, Role } from '@/types';

interface FulfillmentItemsTableProps {
  items: FulfillmentItem[];
  userRole?: Role | null;
  onOpenAllocate?: (item: FulfillmentItem) => void;
  className?: string;
}

export function FulfillmentItemsTable({
  items,
  userRole,
  onOpenAllocate,
  className = '',
}: FulfillmentItemsTableProps) {
  const isOps =
    userRole === 'ADMIN' ||
    userRole === 'WAREHOUSE_OPS' ||
    userRole === 'FINANCE' ||
    userRole === 'SALES_MANAGER';

  const renderStockStatusBadge = (item: FulfillmentItem) => {
    if (item.remainingQuantity === 0 && item.allocatedQuantity > 0) {
      return (
        <span className="badge badge-green text-[10px] inline-flex items-center gap-1">
          ✓ Fully Allocated
        </span>
      );
    }

    if (item.status === 'out_of_stock' || item.availableQuantity === 0) {
      return (
        <span className="badge badge-red text-[10px] inline-flex items-center gap-1">
          ✕ Out of Stock
        </span>
      );
    }

    if (item.availableQuantity < item.requiredQuantity) {
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold"
          style={{
            background: 'var(--red-dim)',
            color: 'var(--red)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          🔴 Only {item.availableQuantity} available
        </span>
      );
    }

    if (item.availableQuantity <= 10) {
      return (
        <span className="badge badge-amber text-[10px] inline-flex items-center gap-1">
          ⚠ {item.availableQuantity} available (Low)
        </span>
      );
    }

    return (
      <span className="badge badge-green text-[10px] inline-flex items-center gap-1">
        ✓ {item.availableQuantity} available
      </span>
    );
  };

  return (
    <div
      className={`card overflow-hidden ${className}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="card-header py-3 px-4 flex items-center justify-between">
        <div>
          <div className="card-title text-sm">Fulfillment Line Items & Stock Availability</div>
          <div className="text-[11px] text-muted-foreground">
            Authoritative inventory levels synchronized with central multi-warehouse nodes
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full text-xs">
          <thead>
            <tr
              style={{
                background: 'var(--surface2)',
                borderBottom: '1px solid var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              <th className="py-2.5 px-4 text-left font-semibold">Product Description</th>
              <th className="py-2.5 px-4 text-left font-semibold">SKU Code</th>
              <th className="py-2.5 px-4 text-right font-semibold">Required</th>
              <th className="py-2.5 px-4 text-right font-semibold">Allocated</th>
              <th className="py-2.5 px-4 text-right font-semibold">Remaining</th>
              <th className="py-2.5 px-4 text-left font-semibold">Stock Health</th>
              <th className="py-2.5 px-4 text-right font-semibold">Warehouse Allocation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {items.map((item) => {
              const isShortage =
                item.remainingQuantity > 0 && item.availableQuantity < item.remainingQuantity;

              return (
                <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                  {/* Product */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-foreground">{item.productName}</div>
                    {item.allocations && item.allocations.length > 0 && (
                      <div className="text-[10px] text-muted-foreground mt-0.5 flex flex-wrap gap-1">
                        {item.allocations.map((a, idx) => (
                          <span
                            key={idx}
                            className="bg-muted/40 px-1.5 py-0.5 rounded font-mono text-[9px]"
                          >
                            🏭 {a.warehouseName.split(' ')[0]}: {a.quantity}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* SKU */}
                  <td className="py-3 px-4 font-mono text-muted-foreground">{item.sku}</td>

                  {/* Required */}
                  <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                    {item.requiredQuantity}
                  </td>

                  {/* Allocated */}
                  <td className="py-3 px-4 text-right font-mono text-accent font-semibold">
                    {item.allocatedQuantity}
                  </td>

                  {/* Remaining */}
                  <td className="py-3 px-4 text-right font-mono">
                    <span
                      style={{
                        color:
                          item.remainingQuantity === 0
                            ? 'var(--green)'
                            : isShortage
                            ? 'var(--red)'
                            : 'var(--amber)',
                        fontWeight: item.remainingQuantity > 0 ? 700 : 400,
                      }}
                    >
                      {item.remainingQuantity}
                    </span>
                  </td>

                  {/* Status Indicator */}
                  <td className="py-3 px-4">{renderStockStatusBadge(item)}</td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    {isOps && item.remainingQuantity > 0 ? (
                      <button
                        type="button"
                        onClick={() => onOpenAllocate?.(item)}
                        className="btn btn-primary btn-xs text-[11px]"
                      >
                        Allocate Stock →
                      </button>
                    ) : item.remainingQuantity === 0 ? (
                      <span className="text-[10px] text-green-400 font-semibold">
                        Ready for Packing ✓
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Read-only (Rep)</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
