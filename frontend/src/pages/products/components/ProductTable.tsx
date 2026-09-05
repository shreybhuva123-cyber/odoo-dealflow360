import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { ProductStatusBadge, ProductTypeBadge } from './ProductStatusBadge';

interface ProductTableProps {
  products: Product[];
  onDelete: (id: string, name: string) => void;
  isLoading?: boolean;
}

export function ProductTable({ products, onDelete, isLoading }: ProductTableProps) {
  if (isLoading) {
    return (
      <div className="card p-8 text-center text-muted-foreground text-sm">
        Loading product catalog...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="text-3xl mb-2">📦</div>
        <h3 className="font-semibold text-foreground text-base">No products found</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          No catalog items match your search or filter criteria. Try adjusting your filters or create a new product.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product / SKU</th>
              <th>Type / Category</th>
              <th>Base Price</th>
              <th>Cost Price</th>
              <th>Min Margin</th>
              <th>Max Discount</th>
              <th>Stock / Avail</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const marginAmt = p.basePrice - p.costPrice;
              const grossMarginCalc = Math.round((marginAmt / (p.basePrice || 1)) * 100);

              return (
                <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                  {/* Name and SKU */}
                  <td>
                    <div className="flex flex-col">
                      <Link
                        to={`/app/products/${p.id}`}
                        className="td-bold text-accent hover:underline inline-flex items-center gap-1.5"
                      >
                        {p.name}
                        {p.variants && p.variants.length > 0 && (
                          <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {p.variants.length} var
                          </span>
                        )}
                      </Link>
                      <span className="text-xs text-muted-foreground font-mono">
                        {p.sku}
                      </span>
                    </div>
                  </td>

                  {/* Type & Category */}
                  <td>
                    <div className="flex flex-col gap-1 items-start">
                      <ProductTypeBadge type={p.type} />
                      <span className="text-xs text-muted-foreground">{p.category}</span>
                    </div>
                  </td>

                  {/* Base Price */}
                  <td className="font-medium text-foreground">
                    ${p.basePrice.toLocaleString()}
                    {p.type === 'SUBSCRIPTION' && (
                      <span className="text-[10px] text-muted-foreground font-normal"> /mo</span>
                    )}
                  </td>

                  {/* Cost Price */}
                  <td className="text-xs text-muted-foreground font-mono">
                    ${p.costPrice.toLocaleString()}
                  </td>

                  {/* Min Margin % */}
                  <td>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-semibold ${
                          grossMarginCalc >= p.minGrossMarginPct
                            ? 'text-emerald-500'
                            : 'text-amber-500'
                        }`}
                      >
                        {grossMarginCalc}%
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        (min {p.minGrossMarginPct}%)
                      </span>
                    </div>
                  </td>

                  {/* Max Discount */}
                  <td>
                    <span className="badge badge-gray text-xs font-semibold">
                      {p.maxAllowableDiscountPct}% max
                    </span>
                  </td>

                  {/* Stock */}
                  <td>
                    {p.type === 'PHYSICAL' ? (
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={`text-xs font-semibold ${
                            (p.stockQuantity ?? 0) < 30
                              ? 'text-amber-500'
                              : 'text-foreground'
                          }`}
                        >
                          {p.stockQuantity ?? 0} units
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {p.leadTimeDays > 0 ? `${p.leadTimeDays}d lead time` : 'Immediate'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Unlimited (Virtual)
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td>
                    <ProductStatusBadge status={p.status} isActive={p.isActive} />
                  </td>

                  {/* Actions */}
                  <td className="text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Link
                        to={`/app/products/${p.id}`}
                        className="btn btn-ghost btn-xs text-xs"
                      >
                        View
                      </Link>
                      <Link
                        to={`/app/products/${p.id}/edit`}
                        className="btn btn-ghost btn-xs text-xs"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => onDelete(p.id, p.name)}
                        className="btn btn-ghost btn-xs text-xs text-red-400 hover:text-red-500"
                        title="Delete product"
                      >
                        Delete
                      </button>
                    </div>
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
