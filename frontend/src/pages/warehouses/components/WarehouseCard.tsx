import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Warehouse } from '@/types';
import { ROUTES } from '@/constants/routes';

interface WarehouseCardProps {
  warehouse: Warehouse;
  className?: string;
}

export function WarehouseCard({ warehouse, className = '' }: WarehouseCardProps) {
  const navigate = useNavigate();

  const getCapacityColor = (cap?: number) => {
    if (!cap) return 'var(--accent)';
    if (cap >= 90) return 'var(--red)';
    if (cap >= 75) return 'var(--amber)';
    return 'var(--green)';
  };

  const cap = warehouse.capacityPercentage || 50;
  const capColor = getCapacityColor(cap);

  return (
    <div
      onClick={() => navigate(ROUTES.APP.WAREHOUSE_DETAIL(warehouse.id))}
      className={`card p-4 transition-all hover:translate-y-[-2px] hover:border-accent/40 cursor-pointer select-none ${className}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: '15px' }}>{warehouse.isPrimary ? '🌟' : '🏭'}</span>
            <span className="font-mono text-[11px] font-bold text-accent">{warehouse.code}</span>
            {warehouse.isPrimary && (
              <span className="badge badge-blue text-[9px] px-1.5 py-0">Primary Hub</span>
            )}
          </div>
          <h3 className="text-sm font-bold text-foreground mt-0.5">{warehouse.name}</h3>
        </div>
      </div>

      <div className="text-[11px] text-muted-foreground mb-3 flex items-center gap-1">
        <span>📍</span>
        <span className="truncate">{warehouse.location}</span>
      </div>

      {/* Capacity Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-muted-foreground">Facility Capacity</span>
          <span className="font-mono font-bold" style={{ color: capColor }}>
            {cap}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-muted/30 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${cap}%`, background: capColor }}
          />
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
        <div className="p-2 rounded" style={{ background: 'var(--surface2)' }}>
          <div className="text-[10px] text-muted-foreground uppercase">Inventory</div>
          <div className="font-mono font-bold text-foreground mt-0.5">
            {warehouse.totalProducts || 0}
          </div>
          <div className="text-[9px] text-muted-foreground">SKUs</div>
        </div>

        <div className="p-2 rounded" style={{ background: 'var(--surface2)' }}>
          <div className="text-[10px] text-muted-foreground uppercase">Low Stock</div>
          <div
            className="font-mono font-bold mt-0.5"
            style={{ color: warehouse.lowStockCount ? 'var(--red)' : 'var(--green)' }}
          >
            {warehouse.lowStockCount || 0}
          </div>
          <div className="text-[9px] text-muted-foreground">Items</div>
        </div>

        <div className="p-2 rounded" style={{ background: 'var(--surface2)' }}>
          <div className="text-[10px] text-muted-foreground uppercase">Fulfillments</div>
          <div className="font-mono font-bold text-accent mt-0.5">
            {warehouse.activeFulfillments || 0}
          </div>
          <div className="text-[9px] text-muted-foreground">Active</div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs">
        <span className="text-muted-foreground text-[10px]">
          Transit: {warehouse.transitDaysToCustomer}d to customer
        </span>
        <span className="font-semibold text-accent hover:underline flex items-center gap-1">
          View Warehouse →
        </span>
      </div>
    </div>
  );
}
