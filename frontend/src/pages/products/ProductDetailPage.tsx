import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProduct, useDeleteProduct } from '@/hooks/useProducts';
import {
  ProductStatusBadge,
  ProductTypeBadge,
  ProductInventoryTab,
} from './components';

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(productId);
  const deleteMutation = useDeleteProduct();

  const [activeTab, setActiveTab] = useState<0 | 1 | 2 | 3>(0);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-muted-foreground text-sm">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-12 text-center max-w-md mx-auto">
        <div className="text-4xl mb-3">📦</div>
        <h2 className="text-lg font-bold text-foreground">Product Not Found</h2>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          The requested product SKU or ID does not exist in the active catalog.
        </p>
        <Link to="/app/products" className="btn btn-primary btn-sm">
          Return to Products
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      deleteMutation.mutate(product.id, {
        onSuccess: () => navigate('/app/products'),
      });
    }
  };

  const marginAmt = product.basePrice - product.costPrice;
  const currentMarginPct = product.basePrice > 0 ? Math.round((marginAmt / product.basePrice) * 100) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link to="/app/products" className="hover:text-foreground">
              Products
            </Link>
            <span>/</span>
            <span className="font-mono">{product.sku}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
            <ProductTypeBadge type={product.type} />
            <ProductStatusBadge status={product.status} isActive={product.isActive} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/app/products/${product.id}/edit`}
            className="btn btn-primary btn-sm text-xs inline-flex items-center gap-1"
          >
            ✏️ Edit Product
          </Link>
          <button
            type="button"
            className="btn btn-ghost btn-sm text-xs text-red-400 hover:text-red-500"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Primary KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="stat-card">
          <div className="stat-label">List Base Price</div>
          <div className="stat-val text-foreground">
            ${product.basePrice.toLocaleString()}
            {product.type === 'SUBSCRIPTION' && (
              <span className="text-xs font-normal text-muted-foreground"> /mo</span>
            )}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">Standard catalog list</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Standard Cost</div>
          <div className="stat-val text-muted-foreground font-mono">
            ${product.costPrice.toLocaleString()}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">Procurement unit cost</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Gross Margin</div>
          <div
            className={`stat-val ${
              currentMarginPct >= product.minGrossMarginPct
                ? 'text-emerald-500'
                : 'text-amber-500'
            }`}
          >
            {currentMarginPct}%
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            Floor: {product.minGrossMarginPct}%
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Max Allowed Discount</div>
          <div className="stat-val text-accent">
            {product.maxAllowableDiscountPct}%
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">Rep discount ceiling</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <div
          className={`tab ${activeTab === 0 ? 'active' : ''}`}
          onClick={() => setActiveTab(0)}
        >
          Overview & Specs
        </div>
        <div
          className={`tab ${activeTab === 1 ? 'active' : ''}`}
          onClick={() => setActiveTab(1)}
        >
          Pricing & Volume Schedule
        </div>
        <div
          className={`tab ${activeTab === 2 ? 'active' : ''}`}
          onClick={() => setActiveTab(2)}
        >
          Variants ({product.variants?.length || 0})
        </div>
        <div
          className={`tab ${activeTab === 3 ? 'active' : ''}`}
          onClick={() => setActiveTab(3)}
        >
          Warehouse Inventory
        </div>
      </div>

      {/* Tab 0: Overview */}
      {activeTab === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-5">
              <h3 className="font-semibold text-foreground text-sm mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description || 'No detailed description provided for this catalog item.'}
              </p>

              {product.tags && product.tags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Tags:</span>
                  {product.tags.map((tag) => (
                    <span key={tag} className="badge badge-gray text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-5">
              <h3 className="font-semibold text-foreground text-sm mb-4">
                Operational & Delivery Parameters
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Category</span>
                  <span className="font-semibold text-foreground mt-0.5 block">
                    {product.category}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Product Type</span>
                  <span className="font-semibold text-foreground mt-0.5 block">
                    {product.type}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Lead Time</span>
                  <span className="font-semibold text-foreground mt-0.5 block">
                    {product.leadTimeDays > 0 ? `${product.leadTimeDays} business days` : 'Immediate'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Default Tax Rate</span>
                  <span className="font-semibold text-foreground mt-0.5 block">
                    {product.taxRatePct ?? 18}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Operating Currency</span>
                  <span className="font-semibold text-foreground mt-0.5 block">
                    {product.currency || 'USD'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Inventory Tracking</span>
                  <span className="font-semibold text-foreground mt-0.5 block">
                    {product.type === 'PHYSICAL' ? 'Multi-warehouse tracked' : 'Digital entitlement'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-5">
              <h3 className="font-semibold text-foreground text-sm mb-3">
                Profitability & Margin Safety
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">List Margin:</span>
                    <span className="font-bold text-foreground">{currentMarginPct}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        currentMarginPct >= product.minGrossMarginPct
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, currentMarginPct)}%` }}
                    />
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground space-y-1 pt-2 border-t border-border">
                  <div className="flex justify-between">
                    <span>Floor Target:</span>
                    <span className="font-semibold text-foreground">{product.minGrossMarginPct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unit Margin ($):</span>
                    <span className="font-semibold text-foreground font-mono">
                      ${marginAmt.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Floor Price ($):</span>
                    <span className="font-semibold text-foreground font-mono">
                      ${Math.round(product.costPrice / (1 - product.minGrossMarginPct / 100)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Pricing & Volume Schedule */}
      {activeTab === 1 && (
        <div className="card p-5">
          <div className="card-header px-0 pt-0">
            <div className="card-title">Volume Pricing Brackets</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Automated quantity tiers applied when rep adds item to quotation
            </p>
          </div>

          {product.volumeTiers && product.volumeTiers.length > 0 ? (
            <div className="table-wrap mt-3">
              <table>
                <thead>
                  <tr>
                    <th>Minimum Order Quantity</th>
                    <th>Discount Granted (%)</th>
                    <th>Effective Unit Price</th>
                    <th>Gross Margin at Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {product.volumeTiers.map((vt, i) => {
                    const tierMargin = vt.unitPrice - product.costPrice;
                    const tierMarginPct = Math.round((tierMargin / (vt.unitPrice || 1)) * 100);

                    return (
                      <tr key={i}>
                        <td className="font-mono text-sm font-semibold text-foreground">
                          ≥ {vt.minQty} units
                        </td>
                        <td>
                          <span className="badge badge-green font-semibold text-xs">
                            {vt.discountPct}% OFF
                          </span>
                        </td>
                        <td className="font-mono text-sm font-bold text-foreground">
                          ${vt.unitPrice.toLocaleString()}
                        </td>
                        <td>
                          <span
                            className={`text-xs font-semibold ${
                              tierMarginPct >= product.minGrossMarginPct
                                ? 'text-emerald-500'
                                : 'text-amber-500'
                            }`}
                          >
                            {tierMarginPct}% (${tierMargin.toLocaleString()}/unit)
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-xs">
              No volume schedule tiers created. The standard base price of ${product.basePrice.toLocaleString()} applies for all order quantities.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Variants */}
      {activeTab === 2 && (
        <div className="card p-5">
          <div className="card-header px-0 pt-0 flex items-center justify-between">
            <div>
              <div className="card-title">Product Variants</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                SKU configurations selectable during quotation drafting
              </p>
            </div>
            <Link
              to={`/app/products/${product.id}/edit`}
              className="btn btn-ghost btn-xs text-accent"
            >
              Manage Variants →
            </Link>
          </div>

          {product.variants && product.variants.length > 0 ? (
            <div className="table-wrap mt-3">
              <table>
                <thead>
                  <tr>
                    <th>Variant Name</th>
                    <th>Variant SKU</th>
                    <th>Attributes</th>
                    <th>Unit Price</th>
                    <th>Cost Price</th>
                    <th>Available Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((v) => (
                    <tr key={v.id}>
                      <td className="font-semibold text-foreground text-sm">{v.name}</td>
                      <td className="font-mono text-xs text-muted-foreground">{v.sku}</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(v.attributes || {}).map(([k, val]) => (
                            <span
                              key={k}
                              className="badge badge-gray text-[10px] font-normal"
                            >
                              {k}: {val}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="font-bold text-foreground text-sm">
                        ${v.price.toLocaleString()}
                      </td>
                      <td className="font-mono text-xs text-muted-foreground">
                        ${v.costPrice.toLocaleString()}
                      </td>
                      <td className="font-semibold text-xs text-foreground">
                        {v.availableStock} units
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-xs">
              No variants defined. This product is sold as a standalone single SKU.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Warehouse Inventory */}
      {activeTab === 3 && <ProductInventoryTab product={product} />}
    </div>
  );
}
