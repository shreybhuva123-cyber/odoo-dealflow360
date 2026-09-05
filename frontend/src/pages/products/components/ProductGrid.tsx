import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { ProductStatusBadge, ProductTypeBadge } from './ProductStatusBadge';

interface ProductGridProps {
  products: Product[];
  onDelete: (id: string, name: string) => void;
  isLoading?: boolean;
}

export function ProductGrid({ products, onDelete, isLoading }: ProductGridProps) {
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
          No catalog items match your search or filter criteria. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((p) => {
        const marginAmt = p.basePrice - p.costPrice;
        const grossMarginCalc = Math.round((marginAmt / (p.basePrice || 1)) * 100);

        return (
          <div
            key={p.id}
            className="card p-5 flex flex-col justify-between hover:border-accent/50 transition-all shadow-sm"
          >
            <div>
              {/* Header with Type & Status */}
              <div className="flex items-center justify-between mb-3">
                <ProductTypeBadge type={p.type} />
                <ProductStatusBadge status={p.status} isActive={p.isActive} />
              </div>

              {/* Title & SKU */}
              <Link
                to={`/app/products/${p.id}`}
                className="font-bold text-foreground hover:text-accent text-base block transition-colors line-clamp-1"
              >
                {p.name}
              </Link>
              <div className="text-xs text-muted-foreground font-mono mt-0.5">
                {p.sku}
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 min-h-[32px]">
                {p.description}
              </p>

              {/* Pricing & Margin metrics */}
              <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Base Price</span>
                  <span className="font-bold text-foreground text-sm">
                    ${p.basePrice.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Cost Price</span>
                  <span className="font-mono text-muted-foreground">
                    ${p.costPrice.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Gross Margin</span>
                  <span
                    className={`font-semibold ${
                      grossMarginCalc >= p.minGrossMarginPct
                        ? 'text-emerald-500'
                        : 'text-amber-500'
                    }`}
                  >
                    {grossMarginCalc}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Max Discount</span>
                  <span className="font-semibold text-foreground">
                    {p.maxAllowableDiscountPct}%
                  </span>
                </div>
              </div>

              {/* Stock or Variants summary */}
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {p.type === 'PHYSICAL'
                    ? `Stock: ${p.stockQuantity ?? 0} units`
                    : 'Unlimited availability'}
                </span>
                {p.variants && p.variants.length > 0 && (
                  <span className="text-[11px] font-medium text-accent">
                    {p.variants.length} variants
                  </span>
                )}
              </div>
            </div>

            {/* Actions footer */}
            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
              <Link
                to={`/app/products/${p.id}`}
                className="btn btn-ghost btn-xs text-xs text-accent"
              >
                View Details →
              </Link>
              <div className="flex items-center gap-1">
                <Link
                  to={`/app/products/${p.id}/edit`}
                  className="btn btn-ghost btn-xs text-xs"
                >
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(p.id, p.name)}
                  className="btn btn-ghost btn-xs text-xs text-red-400 hover:text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
