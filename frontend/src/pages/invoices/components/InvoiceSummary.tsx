import React from 'react';
import { Invoice } from '@/types';

interface InvoiceSummaryProps {
  invoice: Invoice;
  className?: string;
}

export function InvoiceSummary({ invoice, className = '' }: InvoiceSummaryProps) {
  const formatCurrency = (val: number) => `${invoice.currency}${val.toLocaleString()}`;

  return (
    <div
      className={`card p-4 space-y-3 ${className}`}
      style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
    >
      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
        Financial Calculation Breakdown
      </h3>

      <div className="space-y-2 text-xs">
        {/* Subtotal */}
        <div className="flex justify-between items-center text-muted-foreground">
          <span>Gross Subtotal:</span>
          <span className="font-mono text-foreground">{formatCurrency(invoice.subtotal)}</span>
        </div>

        {/* Discount */}
        {invoice.discount > 0 && (
          <div className="flex justify-between items-center text-green-400">
            <span>Special Deal Discount:</span>
            <span className="font-mono">- {formatCurrency(invoice.discount)}</span>
          </div>
        )}

        {/* Tax */}
        <div className="flex justify-between items-center text-muted-foreground">
          <span>Taxes (18% GST / VAT):</span>
          <span className="font-mono text-foreground">+ {formatCurrency(invoice.tax)}</span>
        </div>

        {/* Shipping */}
        {invoice.shipping > 0 && (
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Freight & Handling:</span>
            <span className="font-mono text-foreground">+ {formatCurrency(invoice.shipping)}</span>
          </div>
        )}

        {/* Total Divider */}
        <div className="pt-2 border-t border-[var(--border)] flex justify-between items-center font-bold text-sm">
          <span className="text-foreground">Total Invoiced:</span>
          <span className="font-mono text-accent">{formatCurrency(invoice.total)}</span>
        </div>

        {/* Amount Paid */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Amount Paid / Settled:</span>
          <span className="font-mono font-semibold text-green-400">
            {formatCurrency(invoice.amountPaid)}
          </span>
        </div>

        {/* Balance Due */}
        <div
          className="pt-2 border-t border-[var(--border)] flex justify-between items-center font-bold text-sm"
          style={{
            color:
              invoice.balanceDue === 0
                ? 'var(--green)'
                : invoice.status === 'overdue'
                ? 'var(--red)'
                : 'var(--amber)',
          }}
        >
          <span>Balance Outstanding:</span>
          <span className="font-mono">{formatCurrency(invoice.balanceDue)}</span>
        </div>
      </div>
    </div>
  );
}
