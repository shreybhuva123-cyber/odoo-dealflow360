import React, { useState } from 'react';
import { Product } from '@/types';
import { useProducts } from '@/hooks/useQuotations';
import { Search, Plus, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductSelectorProps {
  onAddProduct: (product: Product) => void;
  className?: string;
}

export function ProductSelector({ onAddProduct, className = '' }: ProductSelectorProps) {
  const { data: products = [], isLoading } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Hardware', 'Subscription', 'Service'];

  const filteredProducts = products.filter((p) => {
    const matchesQ =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat =
      selectedCategory === 'ALL' ||
      p.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesQ && matchesCat;
  });

  const getCategoryBadgeClass = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes('hard') || c.includes('phys')) return 'badge-blue';
    if (c.includes('sub') || c.includes('saas')) return 'badge-purple';
    if (c.includes('serv') || c.includes('prof')) return 'badge-green';
    return 'badge-gray';
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            placeholder="Search products by name, SKU, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap',
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-surface2 text-muted-foreground hover:text-foreground hover:bg-surface3 border border-border'
              )}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-muted-foreground bg-surface2/40 rounded-xl border border-border">
            Loading product catalog...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground bg-surface2/40 rounded-xl border border-border">
            No products match your search. Try adjusting keywords or category filters.
          </div>
        ) : (
          filteredProducts.map((p) => (
            <div
              key={p.id}
              className="p-3 rounded-xl border border-border bg-surface hover:bg-surface2/60 transition-all flex items-center justify-between gap-3 shadow-sm group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-foreground truncate">
                      {p.name}
                    </span>
                    <span className={cn('badge text-[9px]', getCategoryBadgeClass(p.category))}>
                      {p.category}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px]">{p.sku}</span>
                    <span>·</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">● In Stock</span>
                    <span>·</span>
                    <span>Max Disc: {p.maxAllowableDiscountPct}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <div className="font-bold text-xs text-primary font-mono">
                    ${p.basePrice.toLocaleString()}
                    <span className="text-[10px] text-muted-foreground font-normal ml-0.5">
                      {p.category === 'Subscription' ? '/mo' : ''}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all active:scale-95 cursor-pointer"
                  onClick={() => onAddProduct(p)}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
