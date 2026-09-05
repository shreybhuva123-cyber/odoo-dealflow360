import React from 'react';
import { InvoiceItem } from '@/types';

interface InvoiceItemsProps {
  items: InvoiceItem[];
  currency?: string;
  className?: string;
}

export function InvoiceItems({
  items,
  currency = '₹',
  className = '',
}: InvoiceItemsProps) {
  const formatCurrency = (val: number) => `${currency}${val.toLocaleString()}`;

  return (
    <div
      className={`card overflow-hidden ${className}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="card-header py-3 px-4">
        <h3 className="card-title text-xs font-bold text-foreground">Billed Line Items</h3>
        <p className="text-[10px] text-muted-foreground">
          Commercial items synchronized from approved quotation and physical fulfillment
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full text-xs">
          <thead>
            <tr
              style={{
                background: 'var(--surface2)',
                borderBottom: '1px solid var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              <th className="py-2.5 px-4 text-left font-semibold">Product Description</th>
              <th className="py-2.5 px-4 text-left font-semibold">SKU</th>
              <th className="py-2.5 px-4 text-right font-semibold">Quantity</th>
              <th className="py-2.5 px-4 text-right font-semibold">Unit Price</th>
              <th className="py-2.5 px-4 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                <td className="py-3 px-4 font-semibold text-foreground">{item.productName}</td>
                <td className="py-3 px-4 font-mono text-muted-foreground">{item.sku}</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                  {item.quantity}
                </td>
                <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-accent">
                  {formatCurrency(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
