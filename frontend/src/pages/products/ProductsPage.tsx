import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts, useProductMetrics, useDeleteProduct } from '@/hooks/useProducts';
import { ProductFilterOptions } from '@/types';
import {
  ProductFilters,
  ProductTable,
  ProductGrid,
} from './components';

export function ProductsPage() {
  const [filters, setFilters] = useState<ProductFilterOptions>({});
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const { data: products = [], isLoading } = useProducts(filters);
  const { data: metrics } = useProductMetrics();
  const deleteMutation = useDeleteProduct();

  // Distinct categories from products
  const categories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the product catalog?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Product Catalog & Pricing</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage physical inventory, SaaS subscriptions, services, gross margin floors, and volume tiers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/app/admin/pricing/rules"
            className="btn btn-ghost btn-sm text-xs"
          >
            ⚙️ Pricing Rules
          </Link>
          <Link
            to="/app/products/new"
            className="btn btn-primary btn-sm text-xs inline-flex items-center gap-1.5"
          >
            <span>+ Add Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="stat-card">
          <div className="stat-label">Total SKUs</div>
          <div className="stat-val text-foreground">
            {metrics?.totalProducts ?? products.length}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">Catalog items</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Active For Quotes</div>
          <div className="stat-val text-emerald-500">
            {metrics?.activeCount ?? products.filter((p) => p.isActive).length}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">Live in builder</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Avg Margin Target</div>
          <div className="stat-val text-accent">
            {metrics?.avgGrossMargin ?? 35}%
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">Protected floor</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Low Stock SKUs</div>
          <div
            className={`stat-val ${
              (metrics?.lowStockCount ?? 0) > 0 ? 'text-amber-500' : 'text-foreground'
            }`}
          >
            {metrics?.lowStockCount ?? 0}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">&lt;50 units in depot</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Product Categories</div>
          <div className="stat-val text-foreground">
            {metrics?.categoriesCount ?? categories.length}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">Hardware, SaaS, Svc</div>
        </div>
      </div>

      {/* Filter and View Toggle Controls */}
      <ProductFilters
        filters={filters}
        onChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        categories={categories}
      />

      {/* View Output */}
      {viewMode === 'table' ? (
        <ProductTable
          products={products}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      ) : (
        <ProductGrid
          products={products}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
