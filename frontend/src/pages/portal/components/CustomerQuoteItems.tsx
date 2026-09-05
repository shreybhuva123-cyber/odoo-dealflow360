import React from 'react';
import { CustomerQuoteItem } from '@/types';
import { Package, Tag } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface CustomerQuoteItemsProps {
  items: CustomerQuoteItem[];
  currency?: string;
}

export function CustomerQuoteItems({ items, currency = 'INR' }: CustomerQuoteItemsProps) {
  const formatMoney = (val: number) => formatCurrency(val, currency);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-sm backdrop-blur">
      <div className="border-b border-slate-800 bg-slate-900/90 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-400" />
          <h2 className="text-base font-semibold text-white">Quoted Items & Services</h2>
        </div>
        <span className="text-xs text-slate-400">
          {items.length} item{items.length !== 1 ? 's' : ''} listed
        </span>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-950/40 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th scope="col" className="py-3.5 pl-6 pr-3">Product / Service</th>
              <th scope="col" className="px-3 py-3.5">Category</th>
              <th scope="col" className="px-3 py-3.5 text-center">Qty</th>
              <th scope="col" className="px-3 py-3.5 text-right">Unit Price</th>
              <th scope="col" className="py-3.5 pl-3 pr-6 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {items.map((item, idx) => (
              <tr key={item.id || idx} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-4 pl-6 pr-3">
                  <div className="flex items-start gap-2">
                    <div>
                      <div className="font-semibold text-white flex items-center gap-2">
                        {item.productName}
                        {item.badge && (
                          <span className="inline-flex items-center rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400 border border-blue-500/20">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="mt-1 text-xs text-slate-400 line-clamp-2 max-w-md">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 text-xs text-slate-400 whitespace-nowrap">
                  {item.category || 'Standard'}
                </td>
                <td className="px-3 py-4 text-center font-mono text-sm text-slate-200">
                  {item.quantity}
                </td>
                <td className="px-3 py-4 text-right font-mono text-sm text-slate-300">
                  {formatMoney(item.unitPrice)}
                </td>
                <td className="py-4 pl-3 pr-6 text-right font-mono font-semibold text-white">
                  {formatMoney(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-800/60 p-4 space-y-4">
        {items.map((item, idx) => (
          <div key={item.id || idx} className="pt-3 first:pt-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-semibold text-white text-sm block">
                  {item.productName}
                </span>
                {item.category && (
                  <span className="text-[11px] text-slate-500">{item.category}</span>
                )}
              </div>
              {item.badge && (
                <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-400 border border-blue-500/20">
                  {item.badge}
                </span>
              )}
            </div>

            {item.description && (
              <p className="text-xs text-slate-400">{item.description}</p>
            )}

            <div className="flex items-center justify-between border-t border-slate-800/50 pt-2 text-xs">
              <span className="text-slate-400">
                Qty: <strong className="text-slate-200">{item.quantity}</strong> &times;{' '}
                {formatMoney(item.unitPrice)}
              </span>
              <span className="font-mono font-bold text-white text-sm">
                {formatMoney(item.total)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
