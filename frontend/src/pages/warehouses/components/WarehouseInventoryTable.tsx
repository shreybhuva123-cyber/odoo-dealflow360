import React from 'react';
import { WarehouseInventoryItem, Role } from '@/types';
import { useRestockInventoryItem } from '@/hooks/useWarehouses';

interface WarehouseInventoryTableProps {
  items: WarehouseInventoryItem[];
  warehouseId: string;
  userRole?: Role | null;
  className?: string;
}

export function WarehouseInventoryTable({
  items,
  warehouseId,
  userRole,
  className = '',
}: WarehouseInventoryTableProps) {
  const restockMutation = useRestockInventoryItem();

  const isOps =
    userRole === 'ADMIN' ||
    userRole === 'WAREHOUSE_OPS' ||
    userRole === 'FINANCE' ||
    userRole === 'SALES_MANAGER';

  const renderReorderBadge = (status: WarehouseInventoryItem['reorderStatus']) => {
    switch (status) {
      case 'out_of_stock':
        return (
          <span className="badge badge-red text-[10px] inline-flex items-center gap-1 font-semibold">
            ✕ Out of Stock
          </span>
        );
      case 'low':
        return (
          <span className="badge badge-amber text-[10px] inline-flex items-center gap-1 font-semibold">
            ⚠ Low Stock
          </span>
        );
      default:
        return (
          <span className="badge badge-green text-[10px] inline-flex items-center gap-1">
            ✓ Healthy
          </span>
        );
    }
  };

  const handleRestock = (item: WarehouseInventoryItem) => {
    restockMutation.mutate({
      warehouseId,
      itemId: item.id,
      quantity: 25,
    });
  };

  return (
    <div
      className={`card overflow-hidden ${className}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
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
              <th className="py-2.5 px-4 text-left font-semibold">SKU</th>
              <th className="py-2.5 px-4 text-left font-semibold">Category</th>
              <th className="py-2.5 px-4 text-right font-semibold">Available Units</th>
              <th className="py-2.5 px-4 text-right font-semibold">Allocated / Reserved</th>
              <th className="py-2.5 px-4 text-left font-semibold">Reorder Health</th>
              <th className="py-2.5 px-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  No inventory SKUs match current filter parameters.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const totalStock = item.available + item.reserved;

                return (
                  <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                    {/* Product */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{item.productName}</div>
                      {item.lastRestockedAt && (
                        <div className="text-[10px] text-muted-foreground">
                          Last restocked: {item.lastRestockedAt}
                        </div>
                      )}
                    </td>

                    {/* SKU */}
                    <td className="py-3 px-4 font-mono text-accent">{item.sku}</td>

                    {/* Category */}
                    <td className="py-3 px-4 text-muted-foreground">{item.category}</td>

                    {/* Available */}
                    <td className="py-3 px-4 text-right font-mono">
                      <span
                        style={{
                          color:
                            item.available === 0
                              ? 'var(--red)'
                              : item.available <= item.minStockThreshold
                              ? 'var(--amber)'
                              : 'var(--green)',
                          fontWeight: 700,
                        }}
                      >
                        {item.available}
                      </span>
                    </td>

                    {/* Reserved */}
                    <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                      {item.reserved}
                      <span className="text-[10px] text-muted-foreground ml-1">
                        ({totalStock} total)
                      </span>
                    </td>

                    {/* Reorder Status */}
                    <td className="py-3 px-4">{renderReorderBadge(item.reorderStatus)}</td>

                    {/* Restock Action */}
                    <td className="py-3 px-4 text-right">
                      {isOps ? (
                        <button
                          type="button"
                          onClick={() => handleRestock(item)}
                          disabled={restockMutation.isPending}
                          className="btn btn-ghost btn-xs text-[11px] hover:text-accent border border-[var(--border)]"
                          title="Simulate shipment replenishment (+25 units)"
                        >
                          + Restock 25
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
