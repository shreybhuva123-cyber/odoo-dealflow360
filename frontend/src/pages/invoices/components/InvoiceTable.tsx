import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Invoice, Role } from '@/types';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { ROUTES } from '@/constants/routes';
import { showToast } from '@/stores/toast.store';

interface InvoiceTableProps {
  invoices: Invoice[];
  userRole?: Role | null;
  onRecordPayment?: (invoice: Invoice) => void;
  onSendReminder?: (invoice: Invoice) => void;
  className?: string;
}

export function InvoiceTable({
  invoices,
  userRole,
  onRecordPayment,
  onSendReminder,
  className = '',
}: InvoiceTableProps) {
  const navigate = useNavigate();

  const isFinanceOrAdmin =
    userRole === 'ADMIN' ||
    userRole === 'FINANCE' ||
    userRole === 'SALES_MANAGER' ||
    userRole === 'WAREHOUSE_OPS';

  const formatCurrency = (val: number, currency = '₹') => {
    return `${currency}${val.toLocaleString()}`;
  };

  const renderDueDateCell = (inv: Invoice) => {
    if (inv.status === 'paid') {
      return <span className="text-green-400 font-medium">Settled ✓</span>;
    }

    const dueDate = new Date(inv.dueDate);
    const today = new Date('2026-09-05'); // reference hackathon date
    const diffDays = Math.round((dueDate.getTime() - today.getTime()) / 86400000);

    if (diffDays < 0) {
      return (
        <div className="font-semibold text-red-400 flex items-center gap-1">
          <span>⚠</span>
          <span>{Math.abs(diffDays)}d overdue</span>
        </div>
      );
    }

    if (diffDays === 0) {
      return <span className="text-amber-400 font-bold">Due today</span>;
    }

    if (diffDays <= 3) {
      return <span className="text-amber-300 font-medium">Due in {diffDays}d</span>;
    }

    return (
      <span className="text-muted-foreground">
        {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </span>
    );
  };

  return (
    <div
      className={`card overflow-hidden ${className}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
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
              <th className="py-3 px-4 font-semibold text-left">Invoice #</th>
              <th className="py-3 px-4 font-semibold text-left">Client Account</th>
              <th className="py-3 px-4 font-semibold text-left">Commercial Deal</th>
              <th className="py-3 px-4 font-semibold text-right">Invoice Amount</th>
              <th className="py-3 px-4 font-semibold text-right">Balance Due</th>
              <th className="py-3 px-4 font-semibold text-left">Due Date</th>
              <th className="py-3 px-4 font-semibold text-left">Payment Status</th>
              <th className="py-3 px-4 font-semibold text-right">Operational Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {invoices.map((inv) => (
              <tr
                key={inv.id}
                className="hover:bg-muted/10 transition-colors cursor-pointer"
                onClick={() => navigate(ROUTES.APP.INVOICE_DETAIL(inv.id))}
              >
                {/* Invoice # */}
                <td className="py-3.5 px-4 font-mono font-bold text-accent">
                  <span className="hover:underline">{inv.invoiceNumber}</span>
                </td>

                {/* Customer */}
                <td className="py-3.5 px-4 font-semibold text-foreground">
                  <div>{inv.customerName}</div>
                  {inv.quotationNumber && (
                    <div className="text-[10px] text-muted-foreground font-mono">
                      Ref: {inv.quotationNumber}
                    </div>
                  )}
                </td>

                {/* Deal */}
                <td className="py-3.5 px-4">
                  {inv.dealName ? (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        if (inv.dealId) navigate(ROUTES.APP.PIPELINE_DETAIL(inv.dealId));
                      }}
                      className="text-foreground hover:text-accent hover:underline truncate max-w-[150px] inline-block"
                    >
                      {inv.dealName}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>

                {/* Amount */}
                <td className="py-3.5 px-4 text-right font-mono font-bold text-foreground">
                  {formatCurrency(inv.total, inv.currency)}
                </td>

                {/* Balance Due */}
                <td className="py-3.5 px-4 text-right font-mono">
                  <span
                    style={{
                      color:
                        inv.balanceDue === 0
                          ? 'var(--green)'
                          : inv.status === 'overdue'
                          ? 'var(--red)'
                          : 'var(--amber)',
                      fontWeight: inv.balanceDue > 0 ? 700 : 400,
                    }}
                  >
                    {formatCurrency(inv.balanceDue, inv.currency)}
                  </span>
                </td>

                {/* Due Date */}
                <td className="py-3.5 px-4 font-mono">{renderDueDateCell(inv)}</td>

                {/* Status */}
                <td className="py-3.5 px-4">
                  <InvoiceStatusBadge status={inv.status} size="sm" />
                </td>

                {/* Actions */}
                <td
                  className="py-3.5 px-4 text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="inline-flex items-center justify-end gap-1.5">
                    {isFinanceOrAdmin && inv.balanceDue > 0 && (
                      <button
                        type="button"
                        onClick={() => onRecordPayment?.(inv)}
                        className="btn btn-primary btn-xs text-[11px]"
                      >
                        + Payment
                      </button>
                    )}

                    {isFinanceOrAdmin && inv.status === 'overdue' && (
                      <button
                        type="button"
                        onClick={() => onSendReminder?.(inv)}
                        className="btn btn-warning btn-xs text-[11px]"
                        title="Send collection reminder email"
                      >
                        Remind 🔔
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        showToast(`PDF invoice generated for ${inv.invoiceNumber}`, 'green')
                      }
                      className="btn btn-ghost btn-xs text-[11px] text-muted-foreground hover:text-foreground"
                      title="Download Invoice PDF"
                    >
                      PDF
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(ROUTES.APP.INVOICE_DETAIL(inv.id))}
                      className="btn btn-ghost btn-xs text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      View →
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
