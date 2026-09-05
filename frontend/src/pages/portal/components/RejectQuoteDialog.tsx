import React, { useState } from 'react';
import { CustomerQuote } from '@/types';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { XCircle, AlertCircle } from 'lucide-react';

interface RejectQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: CustomerQuote;
  onConfirm: (payload: { reason: string; customerName?: string }) => Promise<void>;
  isSubmitting?: boolean;
}

const DECLINE_REASONS = [
  'Pricing or budget constraints',
  'Selected an alternative solution / vendor',
  'Project postponed or delayed indefinitely',
  'Commercial or delivery terms not suitable',
  'Scope or product requirements changed',
  'Other reason',
];

export function RejectQuoteDialog({
  open,
  onOpenChange,
  quote,
  onConfirm,
  isSubmitting = false,
}: RejectQuoteDialogProps) {
  const [selectedReason, setSelectedReason] = useState(DECLINE_REASONS[0]);
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = notes.trim()
      ? `${selectedReason} - ${notes.trim()}`
      : selectedReason;

    await onConfirm({
      reason: finalReason,
      customerName: quote.customerName,
    });
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Decline Quotation"
      description={`Let our sales team know why quotation ${quote.quoteNumber} did not meet your needs`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-300">
        <div className="rounded-lg bg-rose-950/20 border border-rose-800/40 p-3 flex items-start gap-2.5 text-rose-300">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-rose-300/90 leading-relaxed">
            Declining will formally mark this quotation as closed. If you simply need adjusted pricing or modified quantities, consider submitting a <strong>Change Request / Counter Offer</strong> instead.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block font-medium text-slate-200 mb-1">
              Primary Reason for Declining <span className="text-rose-400">*</span>
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              {DECLINE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-200 mb-1">
              Additional Feedback (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide any feedback that might help us serve your business in the future..."
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Keep Offer Open
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-1.5"
          >
            <XCircle className="h-4 w-4" />
            <span>{isSubmitting ? 'Declining...' : 'Confirm Decline'}</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
