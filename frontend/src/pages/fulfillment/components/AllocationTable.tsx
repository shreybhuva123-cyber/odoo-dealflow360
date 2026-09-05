import React from 'react';
import { FulfillmentItem, Warehouse, ProductStockAvailability } from '@/types';

interface AllocationTableProps {
  item: FulfillmentItem;
  warehouses: Warehouse[];
  availability?: ProductStockAvailability | null;
  allocations: Record<string, number>;
  onAllocationChange: (warehouseId: string, quantity: number) => void;
  className?: string;
}

export function AllocationTable({
  item,
  warehouses,
  availability,
  allocations,
  onAllocationChange,
  className = '',
}: AllocationTableProps) {
  const getWarehouseAvailable = (whId: string) => {
    if (!availability) return 20;
    const match = availability.warehouses.find((w) => w.warehouseId === whId);
    return match ? match.available : 0;
  };

  const handleStep = (whId: string, delta: number) => {
    const current = allocations[whId] || 0;
    const maxAvailable = getWarehouseAvailable(whId);
    const updated = Math.max(0, Math.min(maxAvailable, current + delta));
    onAllocationChange(whId, updated);
  };

  const handleDirectInput = (whId: string, rawVal: string) => {
    const parsed = parseInt(rawVal, 10);
    const maxAvailable = getWarehouseAvailable(whId);
    if (isNaN(parsed)) {
      onAllocationChange(whId, 0);
    } else {
      const updated = Math.max(0, Math.min(maxAvailable, parsed));
      onAllocationChange(whId, updated);
    }
  };

  return (
    <div
      className={`card overflow-hidden ${className}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="card-header py-3 px-4 flex items-center justify-between">
        <div>
          <div className="card-title text-xs font-bold text-foreground">
            Warehouse Stock Allocation Matrix
          </div>
          <div className="text-[10px] text-muted-foreground">
            Configure multi-node split routing for SKU:{' '}
            <span className="font-mono text-accent">{item.sku}</span>
          </div>
        </div>
        <div className="text-xs">
          <span className="text-muted-foreground">Required: </span>
          <strong className="font-mono text-foreground font-bold">{item.requiredQuantity}</strong>
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
              <th className="py-2.5 px-4 text-left font-semibold">Distribution Center</th>
              <th className="py-2.5 px-4 text-left font-semibold">Region</th>
              <th className="py-2.5 px-4 text-right font-semibold">Available Stock</th>
              <th className="py-2.5 px-4 text-center font-semibold w-40">Allocate Units</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {warehouses.map((wh) => {
              const available = getWarehouseAvailable(wh.id);
              const allocated = allocations[wh.id] || 0;
              const isOverAllocated = allocated > available;

              return (
                <tr key={wh.id} className="hover:bg-muted/10 transition-colors">
                  {/* Warehouse Name */}
                  <td className="py-3 px-4 font-semibold text-foreground">
                    <div className="flex items-center gap-2">
                      <span>{wh.isPrimary ? '🌟' : '🏭'}</span>
                      <div>
                        <div>{wh.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{wh.code}</div>
                      </div>
                    </div>
                  </td>

                  {/* Region */}
                  <td className="py-3 px-4 text-muted-foreground">
                    {wh.city}, {wh.country}
                    <div className="text-[10px] text-muted-foreground">
                      {wh.transitDaysToCustomer}d standard transit
                    </div>
                  </td>

                  {/* Available Stock */}
                  <td className="py-3 px-4 text-right font-mono">
                    <span
                      style={{
                        color:
                          available === 0
                            ? 'var(--red)'
                            : available <= 5
                            ? 'var(--amber)'
                            : 'var(--green)',
                        fontWeight: 600,
                      }}
                    >
                      {available} units
                    </span>
                  </td>

                  {/* Stepper Inputs */}
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStep(wh.id, -1)}
                        disabled={allocated <= 0}
                        className="btn btn-ghost btn-xs w-7 h-7 p-0 flex items-center justify-center rounded font-bold text-sm border border-[var(--border)]"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="0"
                        max={available}
                        value={allocated}
                        onChange={(e) => handleDirectInput(wh.id, e.target.value)}
                        className="input input-xs w-16 text-center font-mono font-bold text-xs py-1"
                        style={{
                          background: 'var(--surface2)',
                          borderColor: isOverAllocated ? 'var(--red)' : undefined,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleStep(wh.id, 1)}
                        disabled={allocated >= available}
                        className="btn btn-ghost btn-xs w-7 h-7 p-0 flex items-center justify-center rounded font-bold text-sm border border-[var(--border)]"
                      >
                        +
                      </button>
                    </div>
                    {isOverAllocated && (
                      <div className="text-[9px] text-red-400 mt-1">Exceeds available stock</div>
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
