import React from 'react';
import { Invoice } from '@/types';

interface PaymentStatusProps {
  invoice: Invoice;
  className?: string;
}

export function PaymentStatus({ invoice, className = '' }: PaymentStatusProps) {
  const formatCurrency = (val: number) => `${invoice.currency}${val.toLocaleString()}`;
  const pctPaid = invoice.total > 0 ? Math.min(100, Math.round((invoice.amountPaid / invoice.total) * 100)) : 0;

  return (
    <div
      className={`card p-4 space-y-3 ${className}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Payment Reconciliation Progress
        </h4>
        <span className="font-mono text-xs font-bold text-accent">{pctPaid}% Paid</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 rounded-full bg-muted/40 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pctPaid}%`,
            background:
              pctPaid === 100
                ? 'var(--green)'
                : pctPaid > 0
                ? 'var(--accent)'
                : 'var(--text-dim)',
          }}
        />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 text-center pt-1 text-xs">
        <div className="card p-2" style={{ background: 'var(--surface2)' }}>
          <div className="text-[10px] text-muted-foreground uppercase font-semibold">Total</div>
          <div className="font-mono font-bold text-foreground mt-0.5">
            {formatCurrency(invoice.total)}
          </div>
        </div>

        <div className="card p-2" style={{ background: 'var(--surface2)' }}>
          <div className="text-[10px] text-muted-foreground uppercase font-semibold">Paid</div>
          <div className="font-mono font-bold text-green-400 mt-0.5">
            {formatCurrency(invoice.amountPaid)}
          </div>
        </div>

        <div className="card p-2" style={{ background: 'var(--surface2)' }}>
          <div className="text-[10px] text-muted-foreground uppercase font-semibold">Remaining</div>
          <div
            className="font-mono font-bold mt-0.5"
            style={{
              color:
                invoice.balanceDue === 0
                  ? 'var(--green)'
                  : invoice.status === 'overdue'
                  ? 'var(--red)'
                  : 'var(--amber)',
            }}
          >
            {formatCurrency(invoice.balanceDue)}
          </div>
        </div>
      </div>
    </div>
  );
}
