import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWarehouse, useWarehouseInventory } from '@/hooks/useWarehouses';
import { useFulfillments } from '@/hooks/useFulfillment';
import { useAuthStore } from '@/stores/auth.store';
import { WarehouseInventoryTable, WarehouseFilters } from './components';
import { FulfillmentStatusBadge } from '@/pages/fulfillment/components';
import { ROUTES } from '@/constants/routes';

export function WarehouseDetailPage() {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [stockStatus, setStockStatus] = useState<any>('all');

  const { data: warehouse, isLoading: isWarehouseLoading } = useWarehouse(warehouseId);
  const { data: inventory = [], isLoading: isInventoryLoading } = useWarehouseInventory(
    warehouseId,
    { search, category, stockStatus }
  );

  const { data: fulfillments = [] } = useFulfillments({ warehouseId });

  if (isWarehouseLoading) {
    return (
      <div className="p-12 max-w-7xl mx-auto text-center text-xs text-muted-foreground animate-pulse">
        Loading warehouse facility telemetry...
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="p-12 max-w-md mx-auto text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-base font-bold text-foreground">Warehouse Not Found</h2>
        <p className="text-xs text-muted-foreground">
          Could not locate distribution facility "{warehouseId}".
        </p>
        <button
          type="button"
          onClick={() => navigate(ROUTES.APP.WAREHOUSES)}
          className="btn btn-primary btn-sm text-xs"
        >
          ← Return to Warehouses
        </button>
      </div>
    );
  }

  const cap = warehouse.capacityPercentage || 50;
  const capColor = cap >= 90 ? 'var(--red)' : cap >= 75 ? 'var(--amber)' : 'var(--green)';

  const handleResetFilters = () => {
    setSearch('');
    setCategory('all');
    setStockStatus('all');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(ROUTES.APP.WAREHOUSES)}
            className="btn btn-ghost btn-sm text-xs"
          >
            ← Back
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '18px' }}>{warehouse.isPrimary ? '🌟' : '🏭'}</span>
              <h1 className="text-xl font-bold text-foreground">{warehouse.name}</h1>
              <span className="font-mono text-xs font-bold text-accent px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30">
                {warehouse.code}
              </span>
              {warehouse.isPrimary && <span className="badge badge-blue text-[10px]">Primary Hub</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              📍 {warehouse.location} · Manager: {warehouse.managerName || 'Operations Lead'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(ROUTES.APP.FULFILLMENT)}
            className="btn btn-ghost btn-sm text-xs"
          >
            View Active Fulfillments ↗
          </button>
        </div>
      </div>

      {/* Warehouse Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Capacity */}
        <div className="card p-3" style={{ background: 'var(--surface)' }}>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
            <span className="uppercase font-semibold text-[10px]">Utilization</span>
            <span className="font-mono font-bold" style={{ color: capColor }}>
              {cap}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-muted/30 overflow-hidden mb-1">
            <div className="h-full rounded-full" style={{ width: `${cap}%`, background: capColor }} />
          </div>
          <div className="text-[10px] text-muted-foreground">Storage floor capacity</div>
        </div>

        {/* Total SKUs */}
        <div className="card p-3" style={{ background: 'var(--surface)' }}>
          <div className="text-[10px] text-muted-foreground uppercase font-semibold">
            Catalog SKUs
          </div>
          <div className="font-mono text-xl font-bold text-foreground mt-0.5">
            {warehouse.totalProducts || 0}
          </div>
          <div className="text-[10px] text-muted-foreground">Active products tracked</div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card p-3" style={{ background: 'var(--surface)' }}>
          <div className="text-[10px] text-muted-foreground uppercase font-semibold">
            Low Stock Alerts
          </div>
          <div
            className="font-mono text-xl font-bold mt-0.5"
            style={{ color: warehouse.lowStockCount ? 'var(--red)' : 'var(--green)' }}
          >
            {warehouse.lowStockCount || 0}
          </div>
          <div className="text-[10px] text-muted-foreground">SKUs below safety threshold</div>
        </div>

        {/* Active Fulfillments */}
        <div className="card p-3" style={{ background: 'var(--surface)' }}>
          <div className="text-[10px] text-muted-foreground uppercase font-semibold">
            Active Fulfillments
          </div>
          <div className="font-mono text-xl font-bold text-accent mt-0.5">
            {warehouse.activeFulfillments || 0}
          </div>
          <div className="text-[10px] text-muted-foreground">Orders processing in hub</div>
        </div>
      </div>

      {/* Inventory Management Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Facility Inventory & SKUs</h2>
          <span className="text-xs text-muted-foreground">{inventory.length} SKUs listed</span>
        </div>

        {/* Filter bar */}
        <WarehouseFilters
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          stockStatus={stockStatus}
          onStockStatusChange={setStockStatus}
          onReset={handleResetFilters}
        />

        {/* Inventory Table */}
        <WarehouseInventoryTable
          items={inventory}
          warehouseId={warehouse.id}
          userRole={role}
        />
      </div>

      {/* Active Fulfillments in this Warehouse */}
      {fulfillments.length > 0 && (
        <div className="card p-4 space-y-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Active Orders Assigned to {warehouse.name}
          </h3>
          <div className="divide-y divide-[var(--border)] text-xs">
            {fulfillments.slice(0, 5).map((f) => (
              <div
                key={f.id}
                onClick={() => navigate(ROUTES.APP.FULFILLMENT_DETAIL(f.id))}
                className="py-2.5 flex items-center justify-between hover:bg-muted/10 cursor-pointer px-2 rounded"
              >
                <div>
                  <span className="font-mono font-bold text-accent mr-2">{f.id}</span>
                  <span className="font-semibold text-foreground">{f.customerName}</span>
                  {f.dealName && <span className="text-muted-foreground ml-2">({f.dealName})</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-muted-foreground">
                    {f.allocatedItems}/{f.totalItems} items
                  </span>
                  <FulfillmentStatusBadge status={f.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
