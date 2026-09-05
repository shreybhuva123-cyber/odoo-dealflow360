import React from 'react';
import { Invoice } from '@/types';

interface SendReminderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  invoice: Invoice;
  isSending?: boolean;
}

export function SendReminderDialog({
  isOpen,
  onClose,
  onConfirm,
  invoice,
  isSending = false,
}: SendReminderDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card w-full max-w-md p-6 animate-scale-in"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '18px' }}>🔔</span>
            <h3 className="text-base font-bold text-foreground">Send Overdue Payment Notice</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          An automated collection notice with payment settlement links will be emailed directly to{' '}
          <strong className="text-foreground">{invoice.customerName}</strong> (
          {invoice.customerEmail}).
        </p>

        <div
          className="p-3 rounded mb-4 text-xs space-y-1.5"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
        >
          <div className="flex justify-between">
            <span className="text-muted-foreground">Invoice Reference:</span>
            <span className="font-mono font-bold text-accent">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Overdue Balance:</span>
            <span className="font-mono font-bold text-red-400">
              {invoice.currency}{invoice.balanceDue.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Initial Due Date:</span>
            <span className="font-mono text-foreground">{invoice.dueDate}</span>
          </div>
          {invoice.remindersSentCount ? (
            <div className="flex justify-between text-[11px] text-muted-foreground pt-1 border-t border-[var(--border)]">
              <span>Prior Reminders:</span>
              <span>{invoice.remindersSentCount} notice(s) previously logged</span>
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="btn btn-ghost btn-sm text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSending}
            className="btn btn-warning btn-sm text-xs font-semibold"
          >
            {isSending ? 'Sending Notice...' : 'Confirm & Dispatch Notice'}
          </button>
        </div>
      </div>
    </div>
  );
}
