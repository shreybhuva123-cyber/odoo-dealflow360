import React, { useState } from 'react';
import { CustomerQuote } from '@/types';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface AcceptQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: CustomerQuote;
  onConfirm: (payload: {
    signatoryName: string;
    signatoryEmail: string;
    signatoryTitle?: string;
    notes?: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export function AcceptQuoteDialog({
  open,
  onOpenChange,
  quote,
  onConfirm,
  isSubmitting = false,
}: AcceptQuoteDialogProps) {
  const [signatoryName, setSignatoryName] = useState(quote.customerName || '');
  const [signatoryEmail, setSignatoryEmail] = useState(quote.customerEmail || '');
  const [signatoryTitle, setSignatoryTitle] = useState('Authorized Signatory');
  const [poNumber, setPoNumber] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed || !signatoryName || !signatoryEmail) return;

    await onConfirm({
      signatoryName,
      signatoryEmail,
      signatoryTitle,
      notes: poNumber ? `Purchase Order Reference: ${poNumber}` : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Accept & Confirm Quotation"
      description={`Digitally confirm commercial terms for quotation ${quote.quoteNumber}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-300">
        <div className="rounded-lg bg-emerald-950/20 border border-emerald-800/40 p-3 flex items-start gap-2.5 text-emerald-300">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-white">Digital Sign-Off Agreement</p>
            <p className="text-[11px] text-emerald-300/80">
              Total Order Value: <span className="font-bold text-white font-mono">{formatCurrency(quote.total, quote.currency)}</span>.
              Upon confirmation, our fulfillment team will initiate delivery scheduling.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block font-medium text-slate-200 mb-1">
              Authorized Signatory Full Name <span className="text-rose-400">*</span>
            </label>
            <Input
              type="text"
              required
              value={signatoryName}
              onChange={(e) => setSignatoryName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-200 mb-1">
                Corporate Email <span className="text-rose-400">*</span>
              </label>
              <Input
                type="email"
                required
                value={signatoryEmail}
                onChange={(e) => setSignatoryEmail(e.target.value)}
                placeholder="jane@company.com"
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-200 mb-1">
                Job Title / Role
              </label>
              <Input
                type="text"
                value={signatoryTitle}
                onChange={(e) => setSignatoryTitle(e.target.value)}
                placeholder="e.g. Procurement Director"
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-200 mb-1">
              Customer Purchase Order # (Optional)
            </label>
            <Input
              type="text"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              placeholder="e.g. PO-2026-9901"
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-300">
                I acknowledge that I am authorized to bind{' '}
                <strong className="text-white">{quote.customerName}</strong> to this order,
                and accept the pricing, products, and commercial terms stated herein.
              </span>
            </label>
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
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={!agreed || !signatoryName || !signatoryEmail || isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{isSubmitting ? 'Confirming...' : 'Sign & Accept Quotation'}</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
