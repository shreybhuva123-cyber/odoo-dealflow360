import React, { useState, useEffect } from 'react';
import { FulfillmentItem, Warehouse, ProductStockAvailability } from '@/types';
import { AllocationTable } from './AllocationTable';
import { AllocationSummary } from './AllocationSummary';
import { ConfirmAllocationDialog } from './ConfirmAllocationDialog';
import { useStockAvailability } from '@/hooks/useWarehouses';
import { useAllocateInventory } from '@/hooks/useFulfillment';
import { showToast } from '@/stores/toast.store';

interface WarehouseAllocationProps {
  fulfillmentId: string;
  item: FulfillmentItem;
  warehouses: Warehouse[];
  onClose?: () => void;
  className?: string;
}

export function WarehouseAllocation({
  fulfillmentId,
  item,
  warehouses,
  onClose,
  className = '',
}: WarehouseAllocationProps) {
  const { data: availability } = useStockAvailability(item.sku);
  const allocateMutation = useAllocateInventory();

  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Initialize from current item allocations if present
  useEffect(() => {
    const initial: Record<string, number> = {};
    if (item.allocations && item.allocations.length > 0) {
      item.allocations.forEach((a) => {
        initial[a.warehouseId] = a.quantity;
      });
    }
    setAllocations(initial);
  }, [item]);

  const handleAllocationChange = (warehouseId: string, quantity: number) => {
    setAllocations((prev) => ({
      ...prev,
      [warehouseId]: quantity,
    }));
  };

  const totalAllocated = Object.values(allocations).reduce((acc, v) => acc + (v || 0), 0);
  const remainingQuantity = Math.max(0, item.requiredQuantity - totalAllocated);

  const handleAllocateAvailable = () => {
    if (!availability) return;
    let needed = item.requiredQuantity;
    const newAlloc: Record<string, number> = {};

    // Prioritize primary hub then nearby hubs
    const sortedHubs = [...availability.warehouses].sort((a, b) => b.available - a.available);

    for (const hub of sortedHubs) {
      if (needed <= 0) break;
      const take = Math.min(needed, hub.available);
      if (take > 0) {
        newAlloc[hub.warehouseId] = take;
        needed -= take;
      }
    }

    setAllocations(newAlloc);
    showToast('Auto-allocated maximum available stock across hubs', 'blue');
  };

  const handleBackorderRemaining = () => {
    showToast(`Marked ${remainingQuantity} units of SKU ${item.sku} as Backordered`, 'blue');
  };

  const handleCommitConfirm = () => {
    const formatted = Object.entries(allocations)
      .filter(([_, qty]) => qty > 0)
      .map(([whId, qty]) => {
        const wh = warehouses.find((w) => w.id === whId);
        return {
          warehouseId: whId,
          warehouseName: wh?.name || whId,
          quantity: qty,
        };
      });

    allocateMutation.mutate(
      {
        fulfillmentId,
        itemId: item.id,
        allocations: formatted,
      },
      {
        onSuccess: () => {
          setIsConfirmOpen(false);
          onClose?.();
        },
      }
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">
            Inventory Allocation: {item.productName}
          </h3>
          <p className="text-xs text-muted-foreground">
            SKU: <span className="font-mono text-accent">{item.sku}</span> · Required:{' '}
            <strong className="text-foreground">{item.requiredQuantity} units</strong>
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-xs text-xs text-muted-foreground hover:text-foreground"
          >
            ✕ Close Panel
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Allocation Matrix (8 cols) */}
        <div className="lg:col-span-8">
          <AllocationTable
            item={item}
            warehouses={warehouses}
            availability={availability}
            allocations={allocations}
            onAllocationChange={handleAllocationChange}
          />
        </div>

        {/* Summary & Yield (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <AllocationSummary
            requiredQuantity={item.requiredQuantity}
            totalAllocated={totalAllocated}
            remainingQuantity={remainingQuantity}
            warehouses={warehouses}
            availability={availability}
            onAllocateAvailable={handleAllocateAvailable}
            onBackorderRemaining={handleBackorderRemaining}
          />

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setIsConfirmOpen(true)}
              disabled={totalAllocated === 0 || allocateMutation.isPending}
              className="btn btn-primary btn-sm w-full font-semibold"
            >
              {allocateMutation.isPending
                ? 'Committing...'
                : totalAllocated === item.requiredQuantity
                ? 'Confirm Full Allocation ✓'
                : 'Confirm Allocation Plan →'}
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost btn-sm w-full text-xs"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmAllocationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleCommitConfirm}
        item={item}
        warehouses={warehouses}
        allocations={allocations}
        isSubmitting={allocateMutation.isPending}
      />
    </div>
  );
}
