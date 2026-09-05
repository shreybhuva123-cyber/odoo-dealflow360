import React from 'react';
import { Invoice, Role } from '@/types';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { showToast } from '@/stores/toast.store';

interface InvoiceHeaderProps {
  invoice: Invoice;
  userRole?: Role | null;
  onRecordPayment?: () => void;
  onSendInvoice?: () => void;
  onSendReminder?: () => void;
  isSending?: boolean;
}

export function InvoiceHeader({
  invoice,
  userRole,
  onRecordPayment,
  onSendInvoice,
  onSendReminder,
  isSending = false,
}: InvoiceHeaderProps) {
  const isFinanceOrAdmin =
    userRole === 'ADMIN' ||
    userRole === 'FINANCE' ||
    userRole === 'SALES_MANAGER';

  const formatCurrency = (val: number, currency = '₹') => {
    return `${currency}${val.toLocaleString()}`;
  };

  return (
    <div
      className="card p-5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Invoice Identity */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-mono font-bold text-foreground">
              {invoice.invoiceNumber}
            </h1>
            <InvoiceStatusBadge status={invoice.status} size="md" />
          </div>
          <div className="text-sm font-semibold text-foreground">{invoice.customerName}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {invoice.customerEmail} · Terms:{' '}
            <span className="text-foreground">{invoice.paymentTerms}</span>
          </div>
        </div>

        {/* Right: Key Dates & Operational Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground uppercase font-semibold">
              Invoice Amount
            </div>
            <div className="font-mono text-xl font-bold text-accent">
              {formatCurrency(invoice.total, invoice.currency)}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Due: <strong className="text-foreground">{invoice.dueDate}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 border-l border-[var(--border)] pl-4">
            {invoice.status === 'overdue' && isFinanceOrAdmin && (
              <button
                type="button"
                onClick={onSendReminder}
                className="btn btn-warning btn-sm text-xs font-semibold"
              >
                🔔 Send Reminder
              </button>
            )}

            {isFinanceOrAdmin && invoice.balanceDue > 0 && (
              <button
                type="button"
                onClick={onRecordPayment}
                className="btn btn-primary btn-sm text-xs font-semibold"
              >
                + Record Payment
              </button>
            )}

            {isFinanceOrAdmin && (
              <button
                type="button"
                onClick={onSendInvoice}
                disabled={isSending}
                className="btn btn-ghost btn-sm text-xs"
              >
                {isSending ? 'Sending...' : '✉️ Transmit'}
              </button>
            )}

            <button
              type="button"
              onClick={() => showToast(`Exported ${invoice.invoiceNumber} to PDF`, 'green')}
              className="btn btn-ghost btn-sm text-xs"
            >
              📄 Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
