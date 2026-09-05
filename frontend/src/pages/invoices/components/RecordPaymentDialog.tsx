import React, { useState } from 'react';
import { Invoice, Payment } from '@/types';
import { useRecordPayment } from '@/hooks/useInvoices';

interface RecordPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
}

export function RecordPaymentDialog({
  isOpen,
  onClose,
  invoice,
}: RecordPaymentDialogProps) {
  const recordMutation = useRecordPayment();

  const [amount, setAmount] = useState<number>(invoice.balanceDue);
  const [method, setMethod] = useState<Payment['method']>('bank_transfer');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError('Please provide a valid payment amount greater than zero.');
      return;
    }

    if (amount > invoice.balanceDue) {
      setError(`Amount cannot exceed the current outstanding balance of ${invoice.currency}${invoice.balanceDue.toLocaleString()}.`);
      return;
    }

    recordMutation.mutate(
      {
        invoiceId: invoice.id,
        payload: {
          amount: Number(amount),
          method,
          reference: reference.trim() || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
          paymentDate,
          notes: notes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

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
            <span style={{ fontSize: '18px' }}>💰</span>
            <h3 className="text-base font-bold text-foreground">Record Customer Payment</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ✕
          </button>
        </div>

        <div className="text-xs text-muted-foreground mb-4">
          Applying collection against Invoice{' '}
          <strong className="text-foreground font-mono">{invoice.invoiceNumber}</strong> for{' '}
          <strong className="text-foreground">{invoice.customerName}</strong>. Current balance due:{' '}
          <span className="font-mono text-accent font-bold">
            {invoice.currency}{invoice.balanceDue.toLocaleString()}
          </span>
        </div>

        {error && (
          <div className="p-2.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Amount */}
          <div>
            <label className="block text-muted-foreground mb-1 font-semibold">Payment Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
                {invoice.currency}
              </span>
              <input
                type="number"
                required
                min="1"
                max={invoice.balanceDue}
                value={amount}
                onChange={(e) => {
                  setAmount(Number(e.target.value));
                  setError('');
                }}
                className="input w-full pl-8 font-mono text-sm font-bold text-foreground p-2 rounded"
                style={{ background: 'var(--surface2)' }}
              />
            </div>
          </div>

          {/* Method & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground mb-1 font-semibold">
                Payment Channel
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="select w-full text-xs p-2 rounded"
                style={{ background: 'var(--surface2)' }}
              >
                <option value="bank_transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="credit_card">Corporate Credit Card</option>
                <option value="upi">UPI / Instant Gateway</option>
                <option value="wire">SWIFT / International Wire</option>
                <option value="check">Cheque / Demand Draft</option>
              </select>
            </div>

            <div>
              <label className="block text-muted-foreground mb-1 font-semibold">Payment Date</label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="input w-full text-xs p-2 rounded font-mono"
                style={{ background: 'var(--surface2)' }}
              />
            </div>
          </div>

          {/* Reference */}
          <div>
            <label className="block text-muted-foreground mb-1 font-semibold">
              Bank Reference / Transaction ID
            </label>
            <input
              type="text"
              placeholder="e.g. UTR-928371029 or CHQ-001248"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="input w-full text-xs p-2 rounded font-mono"
              style={{ background: 'var(--surface2)' }}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-muted-foreground mb-1 font-semibold">Internal Notes</label>
            <textarea
              placeholder="Optional notes regarding account reconciliation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input w-full text-xs p-2 rounded min-h-[50px]"
              style={{ background: 'var(--surface2)' }}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={recordMutation.isPending}
              className="btn btn-ghost btn-sm text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={recordMutation.isPending}
              className="btn btn-primary btn-sm text-xs font-semibold"
            >
              {recordMutation.isPending ? 'Reconciling...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
