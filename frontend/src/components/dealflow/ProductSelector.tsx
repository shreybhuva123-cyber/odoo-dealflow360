import React, { useState } from 'react';
import { Product } from '@/types';
import { useProducts } from '@/hooks/useQuotations';

interface ProductSelectorProps {
  onAddProduct: (product: Product) => void;
  className?: string;
}

export function ProductSelector({ onAddProduct, className = '' }: ProductSelectorProps) {
  const { data: products = [] } = useProducts();
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
    <div className={`space-y-3 ${className}`}>
      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            className="field-input"
            placeholder="🔍 Search products by name, SKU, or specs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`btn btn-xs ${
                selectedCategory === cat ? 'btn-primary' : 'btn-ghost'
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '260px',
          overflowY: 'auto',
        }}
      >
        {filteredProducts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '24px',
              color: 'var(--text-muted)',
              fontSize: '12px',
            }}
          >
            No products match your search. Try adjusting keywords or category filters.
          </div>
        ) : (
          filteredProducts.map((p) => (
            <div
              key={p.id}
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: '12.5px',
                      color: 'var(--text)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {p.name}
                  </span>
                  <span className={`badge ${getCategoryBadgeClass(p.category)}`} style={{ fontSize: '9px' }}>
                    {p.category}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {p.sku} · <span style={{ color: 'var(--green)' }}>● In Stock</span> · Max Disc: {p.maxAllowableDiscountPct}%
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--accent)' }}>
                    ${p.basePrice.toLocaleString()}{' '}
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 400 }}>
                      {p.category === 'Subscription' ? '/mo' : ''}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-xs"
                  onClick={() => onAddProduct(p)}
                >
                  + Add
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
