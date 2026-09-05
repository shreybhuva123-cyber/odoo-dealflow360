import React, { useState } from 'react';
import { CustomerQuote, NegotiationItemRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Send, CheckSquare, Square, Calculator, Info } from 'lucide-react';

interface NegotiationRequestFormProps {
  quote: CustomerQuote;
  onSubmit: (payload: {
    items: NegotiationItemRequest[];
    message: string;
    customerName: string;
    customerEmail?: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

interface ItemRowState {
  selected: boolean;
  requestedQuantity: number;
  requestedPrice: number;
  note: string;
}

export function NegotiationRequestForm({
  quote,
  onSubmit,
  isSubmitting = false,
}: NegotiationRequestFormProps) {
  const [rowStates, setRowStates] = useState<Record<string, ItemRowState>>(() => {
    const init: Record<string, ItemRowState> = {};
    quote.items.forEach((it) => {
      init[it.id] = {
        selected: false,
        requestedQuantity: it.quantity,
        requestedPrice: it.unitPrice,
        note: '',
      };
    });
    return init;
  });

  const [message, setMessage] = useState('');
  const [customerName, setCustomerName] = useState(quote.customerName || '');
  const [customerEmail, setCustomerEmail] = useState(quote.customerEmail || '');

  const toggleSelect = (id: string) => {
    setRowStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        selected: !prev[id]?.selected,
      },
    }));
  };

  const updateQuantity = (id: string, qty: number) => {
    setRowStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        requestedQuantity: Math.max(1, qty),
      },
    }));
  };

  const updatePrice = (id: string, price: number) => {
    setRowStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        requestedPrice: Math.max(0, price),
      },
    }));
  };

  const updateNote = (id: string, note: string) => {
    setRowStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        note,
      },
    }));
  };

  // Calculations
  const selectedItems = quote.items.filter((it) => rowStates[it.id]?.selected);

  let currentSelectedSubtotal = 0;
  let counterSelectedSubtotal = 0;

  selectedItems.forEach((it) => {
    const state = rowStates[it.id];
    currentSelectedSubtotal += it.quantity * it.unitPrice;
    counterSelectedSubtotal += (state?.requestedQuantity || it.quantity) * (state?.requestedPrice || it.unitPrice);
  });

  const subtotalDelta = counterSelectedSubtotal - currentSelectedSubtotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && selectedItems.length === 0) return;

    const payloadItems: NegotiationItemRequest[] = selectedItems.map((it) => {
      const state = rowStates[it.id];
      return {
        itemId: it.id,
        productName: it.productName,
        currentQuantity: it.quantity,
        requestedQuantity: state.requestedQuantity,
        currentPrice: it.unitPrice,
        requestedPrice: state.requestedPrice,
        note: state.note || undefined,
      };
    });

    await onSubmit({
      items: payloadItems,
      message: message.trim(),
      customerName,
      customerEmail,
    });
  };

  const currency = quote.currency || '₹';
  const formatCurrency = (val: number) =>
    `${currency}${Math.abs(val).toLocaleString('en-IN')}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informative Guidance */}
      <div className="rounded-xl border border-blue-800/40 bg-blue-950/20 p-4 text-xs text-blue-300 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-white">Commercial Terms Negotiation</p>
          <p className="text-blue-300/80 leading-relaxed">
            Select the specific line items you wish to negotiate. You can request volume adjustments, target unit pricing, and attach item-specific notes. Your proposal will be routed directly to your account executive for immediate review.
          </p>
        </div>
      </div>

      {/* Selectable Items Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden backdrop-blur">
        <div className="border-b border-slate-800 bg-slate-900/90 px-5 py-3.5 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            Select Line Items to Modify ({selectedItems.length} of {quote.items.length} selected)
          </h3>
        </div>

        <div className="divide-y divide-slate-800">
          {quote.items.map((item) => {
            const state = rowStates[item.id] || {
              selected: false,
              requestedQuantity: item.quantity,
              requestedPrice: item.unitPrice,
              note: '',
            };

            return (
              <div
                key={item.id}
                className={`p-4 transition-colors ${
                  state.selected ? 'bg-slate-800/40' : 'hover:bg-slate-800/20'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSelect(item.id)}
                      className="mt-0.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {state.selected ? (
                        <CheckSquare className="h-5 w-5 text-blue-400" />
                      ) : (
                        <Square className="h-5 w-5 text-slate-600" />
                      )}
                    </button>
                    <div>
                      <div className="font-semibold text-sm text-white flex items-center gap-2">
                        {item.productName}
                        {item.badge && (
                          <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] text-blue-400 border border-blue-500/20">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Current: <strong className="text-slate-200">{item.quantity} units</strong> @{' '}
                        <strong className="text-slate-200">{currency}{item.unitPrice.toLocaleString('en-IN')}</strong> ={' '}
                        <strong className="text-slate-200">{currency}{item.total.toLocaleString('en-IN')}</strong>
                      </div>
                    </div>
                  </div>

                  {state.selected && (
                    <div className="flex flex-wrap items-center gap-3 pl-8 md:pl-0">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-slate-400">Target Qty:</span>
                        <Input
                          type="number"
                          min={1}
                          value={state.requestedQuantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="w-20 h-8 bg-slate-950 border-slate-700 text-xs text-center text-white"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-slate-400">Target Rate ({currency}):</span>
                        <Input
                          type="number"
                          min={0}
                          step={100}
                          value={state.requestedPrice}
                          onChange={(e) => updatePrice(item.id, parseFloat(e.target.value) || 0)}
                          className="w-28 h-8 bg-slate-950 border-slate-700 text-xs text-center text-white font-mono"
                        />
                      </div>

                      <div className="text-xs font-mono font-semibold text-right min-w-[100px]">
                        <div className="text-slate-400 text-[10px]">Proposed Item Total</div>
                        <div className="text-blue-400">
                          {currency}{(state.requestedQuantity * state.requestedPrice).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {state.selected && (
                  <div className="mt-3 pl-8">
                    <Input
                      type="text"
                      value={state.note}
                      onChange={(e) => updateNote(item.id, e.target.value)}
                      placeholder={`Rationale for ${item.productName} adjustment (e.g. Higher volume commitment, competitive match)...`}
                      className="h-8 bg-slate-950 border-slate-800 text-xs text-slate-300 placeholder:text-slate-600"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Live Calculation Delta Bar */}
        {selectedItems.length > 0 && (
          <div className="border-t border-slate-800 bg-slate-950/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Calculator className="h-4 w-4 text-blue-400" />
              <span>
                Items targeted: <strong className="text-white">{selectedItems.length}</strong>
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-400">
                Current Selected: {currency}{currentSelectedSubtotal.toLocaleString('en-IN')}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
              <span className="text-white font-semibold">
                Counter Proposal: {currency}{counterSelectedSubtotal.toLocaleString('en-IN')}
              </span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  subtotalDelta <= 0
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                    : 'bg-blue-950/60 text-blue-400 border border-blue-800/40'
                }`}
              >
                Delta: {subtotalDelta < 0 ? '-' : '+'}{formatCurrency(subtotalDelta)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Message & Contact */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 backdrop-blur">
        <h3 className="text-sm font-semibold text-white">Proposal Message & Contact</h3>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Detailed Counter Message / Rationale <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={4}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Explain your business justification or timeline requirements (e.g., 'We are ready to issue PO this week if we can align on ₹11,000/unit for the fleet trackers.')..."
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Your Name
            </label>
            <Input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="bg-slate-950 border-slate-700 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Your Email
            </label>
            <Input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="bg-slate-950 border-slate-700 text-xs text-white"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            disabled={(!message.trim() && selectedItems.length === 0) || isSubmitting}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            <span>{isSubmitting ? 'Submitting Proposal...' : 'Submit Counter Offer'}</span>
          </Button>
        </div>
      </div>
    </form>
  );
}
