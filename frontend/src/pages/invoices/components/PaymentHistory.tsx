import React from 'react';
import { Payment } from '@/types';

interface PaymentHistoryProps {
  payments: Payment[];
  currency?: string;
  className?: string;
}

export function PaymentHistory({
  payments = [],
  currency = '₹',
  className = '',
}: PaymentHistoryProps) {
  const formatCurrency = (val: number) => `${currency}${val.toLocaleString()}`;

  const formatMethodName = (method: Payment['method']) => {
    switch (method) {
      case 'bank_transfer':
        return 'Bank Transfer (NEFT/RTGS)';
      case 'credit_card':
        return 'Corporate Card';
      case 'upi':
        return 'UPI Gateway';
      case 'wire':
        return 'Wire Transfer';
      case 'check':
        return 'Cheque / DD';
      default:
        return method;
    }
  };

  return (
    <div
      className={`card overflow-hidden ${className}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="card-header py-3 px-4">
        <h3 className="card-title text-xs font-bold text-foreground">
          Reconciliation & Payment History
        </h3>
        <p className="text-[10px] text-muted-foreground">
          Audit ledger of all payments and credits applied against this invoice
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
              <th className="py-2.5 px-4 text-left font-semibold">Payment Date</th>
              <th className="py-2.5 px-4 text-right font-semibold">Amount Applied</th>
              <th className="py-2.5 px-4 text-left font-semibold">Method</th>
              <th className="py-2.5 px-4 text-left font-semibold">Bank Reference</th>
              <th className="py-2.5 px-4 text-left font-semibold">Recorded By</th>
              <th className="py-2.5 px-4 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-muted-foreground">
                  No payment transactions recorded yet.
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                  <td className="py-3 px-4 font-mono text-foreground">{p.paymentDate}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-green-400">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="py-3 px-4 text-foreground font-medium">
                    {formatMethodName(p.method)}
                  </td>
                  <td className="py-3 px-4 font-mono text-accent">{p.reference}</td>
                  <td className="py-3 px-4 text-muted-foreground">{p.recordedBy}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="badge badge-green text-[10px] uppercase">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
