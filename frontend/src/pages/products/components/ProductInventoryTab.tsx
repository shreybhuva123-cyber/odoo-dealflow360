import React from 'react';
import { Product } from '@/types';

interface ProductInventoryTabProps {
  product: Product;
}

export function ProductInventoryTab({ product }: ProductInventoryTabProps) {
  if (product.type !== 'PHYSICAL') {
    return (
      <div className="card p-8 text-center">
        <div className="text-3xl mb-2">☁️</div>
        <h4 className="font-semibold text-foreground text-sm">Virtual Item / Non-Stocked</h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
          {product.name} is classified as a {product.type.toLowerCase()} product. It does not require bin storage or warehouse stock tracking.
        </p>
      </div>
    );
  }

  const warehouseEntries = Object.entries(product.warehouseStock || {
    'wh-1': 65,
    'wh-2': 25,
    'wh-3': 15,
  });

  const totalStock = warehouseEntries.reduce((acc, [, qty]) => acc + qty, 0) || (product.stockQuantity ?? 0);

  const warehouseNames: Record<string, { name: string; location: string }> = {
    'wh-1': { name: 'Main Fulfillment Center', location: 'Mumbai Central Logistics Hub' },
    'wh-2': { name: 'East Regional Depot', location: 'Kolkata Industrial Corridor' },
    'wh-3': { name: 'West Distribution Hub', location: 'Ahmedabad Port Facility' },
  };

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-label">Total Stock On Hand</div>
          <div className="stat-val text-foreground">{totalStock}</div>
          <div className="text-[11px] text-muted-foreground mt-1">Across all depots</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Stock Status</div>
          <div
            className={`stat-val ${
              totalStock < 30 ? 'text-amber-500' : 'text-emerald-500'
            }`}
          >
            {totalStock < 30 ? 'Low Stock' : 'Optimal'}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {totalStock < 30 ? 'Reorder recommended' : 'Sufficient buffer'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Replenishment Lead Time</div>
          <div className="stat-val text-foreground">{product.leadTimeDays} days</div>
          <div className="text-[11px] text-muted-foreground mt-1">Standard supplier SLA</div>
        </div>
      </div>

      {/* Warehouse distribution breakdown */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Stock By Warehouse Location</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Warehouse Facility</th>
                <th>Location</th>
                <th>Available Units</th>
                <th>Allocation Capacity</th>
              </tr>
            </thead>
            <tbody>
              {warehouseEntries.map(([whId, qty]) => {
                const whInfo = warehouseNames[whId] || {
                  name: `Depot (${whId})`,
                  location: 'Regional Distribution Center',
                };
                const pct = Math.min(100, Math.round((qty / (totalStock || 1)) * 100));

                return (
                  <tr key={whId}>
                    <td className="font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <span>🏭</span>
                        <span>{whInfo.name}</span>
                      </div>
                    </td>
                    <td className="text-xs text-muted-foreground">{whInfo.location}</td>
                    <td className="font-mono text-sm font-semibold">{qty} units</td>
                    <td className="w-1/3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-accent h-full rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground w-10 text-right">
                          {pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
