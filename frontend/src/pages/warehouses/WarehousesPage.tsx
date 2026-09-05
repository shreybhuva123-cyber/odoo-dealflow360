import React, { useState } from 'react';
import { useWarehouses, useWarehouseStats } from '@/hooks/useWarehouses';
import {
  WarehouseCard,
  WarehouseStats,
  WarehouseCardSkeleton,
  WarehouseEmptyState,
} from './components';
import { showToast } from '@/stores/toast.store';

export function WarehousesPage() {
  const [search, setSearch] = useState('');

  const { data: stats, isLoading: isStatsLoading } = useWarehouseStats();
  const {
    data: warehouses = [],
    isLoading: isWarehousesLoading,
    refetch,
  } = useWarehouses({ search });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Warehouses & Logistics Hubs</h1>
          <p className="text-xs text-muted-foreground">
            Multi-region distribution centers, real-time stock balances, and capacity telemetry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm text-xs"
            onClick={() => {
              refetch();
              showToast('Warehouse inventory telemetry refreshed', 'blue');
            }}
          >
            ↻ Refresh Nodes
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <WarehouseStats stats={stats} isLoading={isStatsLoading} />

      {/* Search Toolbar */}
      <div
        className="card p-3 flex items-center gap-3"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex-1 relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            style={{ fontSize: '13px' }}
          >
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search warehouse by name, city, location code..."
            className="input input-sm w-full pl-8 text-xs"
            style={{ background: 'var(--surface2)' }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Warehouse Cards Grid */}
      {isWarehousesLoading ? (
        <WarehouseCardSkeleton />
      ) : warehouses.length === 0 ? (
        <WarehouseEmptyState onReset={() => setSearch('')} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.map((wh) => (
            <WarehouseCard key={wh.id} warehouse={wh} />
          ))}
        </div>
      )}
    </div>
  );
}
