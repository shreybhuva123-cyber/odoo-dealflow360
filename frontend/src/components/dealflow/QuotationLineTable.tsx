import React from 'react';
import { QuotationLine } from '@/types';
import { DiscountEditor } from './DiscountEditor';

interface QuotationLineTableProps {
  lines: QuotationLine[];
  customerTier?: string;
  onUpdateQuantity: (lineId: string, newQty: number) => void;
  onUpdateDiscount: (lineId: string, newDiscountPct: number) => void;
  onRemoveLine: (lineId: string) => void;
  className?: string;
}

export function QuotationLineTable({
  lines,
  customerTier = 'GOLD',
  onUpdateQuantity,
  onUpdateDiscount,
  onRemoveLine,
  className = '',
}: QuotationLineTableProps) {
  if (lines.length === 0) {
    return (
      <div
        className={`card ${className}`}
        style={{ textAlign: 'center', padding: '36px 20px', background: 'var(--surface)' }}
      >
        <div style={{ fontSize: '28px', marginBottom: '8px' }}>🛒</div>
        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text)' }}>
          Your quotation lines are empty
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Select products from the catalog or accepted AI recommendations to start building the order.
        </div>
      </div>
    );
  }

  const getCategoryBadgeClass = (category?: string) => {
    const c = (category || 'Hardware').toLowerCase();
    if (c.includes('hard') || c.includes('phys')) return 'badge-blue';
    if (c.includes('sub') || c.includes('saas')) return 'badge-purple';
    if (c.includes('serv') || c.includes('prof')) return 'badge-green';
    return 'badge-gray';
  };

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <div className="card-title">Quotation Lines</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {lines.length} {lines.length === 1 ? 'item' : 'items'}
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product Line</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Discount Governance</th>
              <th style={{ textAlign: 'right' }}>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => {
              const lineSubtotal = l.quantity * l.unitPrice;
              const lineDiscount = lineSubtotal * (l.discountPct / 100);
              const lineTotal = lineSubtotal - lineDiscount;

              return (
                <tr key={l.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="td-bold">{l.productName}</span>
                      <span
                        className={`badge ${getCategoryBadgeClass(l.category)}`}
                        style={{ fontSize: '9px' }}
                      >
                        {l.category || 'Hardware'}
                      </span>
                    </div>
                    {l.sku && (
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        SKU: {l.sku} · Est. Margin: {l.grossMarginPct ? `${l.grossMarginPct.toFixed(1)}%` : '25%'}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        style={{ padding: '2px 6px', lineHeight: 1 }}
                        onClick={() => onUpdateQuantity(l.id, Math.max(1, l.quantity - 1))}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={l.quantity}
                        onChange={(e) =>
                          onUpdateQuantity(
                            l.id,
                            Math.max(1, parseInt(e.target.value, 10) || 1)
                          )
                        }
                        style={{
                          width: '44px',
                          textAlign: 'center',
                          background: 'var(--surface3)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          color: 'var(--text)',
                          fontSize: '12px',
                          fontWeight: 700,
                          padding: '2px 0',
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        style={{ padding: '2px 6px', lineHeight: 1 }}
                        onClick={() => onUpdateQuantity(l.id, l.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                      ${l.unitPrice.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <DiscountEditor
                      currentDiscount={l.discountPct}
                      category={l.category || 'Hardware'}
                      customerTier={customerTier}
                      onChangeDiscount={(newDisc) => onUpdateDiscount(l.id, newDisc)}
                      compact={true}
                    />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--accent)' }}>
                      ${lineTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    {lineDiscount > 0 && (
                      <div style={{ fontSize: '9.5px', color: 'var(--red)' }}>
                        -${lineDiscount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => onRemoveLine(l.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        padding: '4px',
                      }}
                      title="Remove product line"
                    >
                      ✕
                    </button>
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
