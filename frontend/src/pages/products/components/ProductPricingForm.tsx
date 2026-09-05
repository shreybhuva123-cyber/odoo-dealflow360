import React from 'react';
import { VolumePricingTier } from '@/types';

interface ProductPricingFormProps {
  formData: {
    basePrice: number;
    costPrice: number;
    minGrossMarginPct: number;
    maxAllowableDiscountPct: number;
    taxRatePct: number;
    volumeTiers: VolumePricingTier[];
  };
  onChange: (field: string, value: any) => void;
}

export function ProductPricingForm({
  formData,
  onChange,
}: ProductPricingFormProps) {
  const marginAmt = formData.basePrice - formData.costPrice;
  const currentMarginPct = formData.basePrice > 0 ? Math.round((marginAmt / formData.basePrice) * 100) : 0;
  const isMarginHealthy = currentMarginPct >= formData.minGrossMarginPct;

  const handleAddTier = () => {
    const nextMinQty = formData.volumeTiers.length > 0 ? formData.volumeTiers[formData.volumeTiers.length - 1].minQty + 10 : 10;
    const nextDisc = formData.volumeTiers.length > 0 ? formData.volumeTiers[formData.volumeTiers.length - 1].discountPct + 5 : 5;
    const unitPrice = Math.round(formData.basePrice * (1 - nextDisc / 100));

    onChange('volumeTiers', [
      ...formData.volumeTiers,
      { minQty: nextMinQty, unitPrice, discountPct: nextDisc },
    ]);
  };

  const handleRemoveTier = (idx: number) => {
    onChange(
      'volumeTiers',
      formData.volumeTiers.filter((_, i) => i !== idx)
    );
  };

  const handleUpdateTier = (idx: number, field: keyof VolumePricingTier, val: number) => {
    const updated = [...formData.volumeTiers];
    updated[idx] = { ...updated[idx], [field]: val };
    if (field === 'discountPct') {
      updated[idx].unitPrice = Math.round(formData.basePrice * (1 - val / 100));
    }
    onChange('volumeTiers', updated);
  };

  return (
    <div className="card p-5 mb-6">
      <h3 className="font-semibold text-foreground text-sm mb-4">
        2. Pricing, Cost & Margin Guardrails
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Base Price */}
        <div className="field-group">
          <label className="field-label">Base List Price ($) *</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="field-input text-base font-semibold"
            value={formData.basePrice || ''}
            onChange={(e) => onChange('basePrice', parseFloat(e.target.value) || 0)}
            placeholder="1200"
            required
          />
        </div>

        {/* Cost Price */}
        <div className="field-group">
          <label className="field-label">Standard Cost Price ($) *</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="field-input font-mono"
            value={formData.costPrice || ''}
            onChange={(e) => onChange('costPrice', parseFloat(e.target.value) || 0)}
            placeholder="850"
            required
          />
        </div>

        {/* Tax Rate % */}
        <div className="field-group">
          <label className="field-label">Default Tax Rate (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            className="field-input"
            value={formData.taxRatePct || 18}
            onChange={(e) => onChange('taxRatePct', parseFloat(e.target.value) || 0)}
            placeholder="18"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Min Gross Margin % */}
        <div className="field-group">
          <label className="field-label">Min Gross Margin Floor (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            className="field-input"
            value={formData.minGrossMarginPct}
            onChange={(e) => onChange('minGrossMarginPct', parseFloat(e.target.value) || 0)}
            placeholder="20"
          />
          <span className="text-[11px] text-muted-foreground mt-1">
            Quotes pricing below this threshold trigger high-risk Finance signoff.
          </span>
        </div>

        {/* Max Discount % */}
        <div className="field-group">
          <label className="field-label">Max Allowable Rep Discount (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            className="field-input"
            value={formData.maxAllowableDiscountPct}
            onChange={(e) => onChange('maxAllowableDiscountPct', parseFloat(e.target.value) || 0)}
            placeholder="15"
          />
          <span className="text-[11px] text-muted-foreground mt-1">
            Ceiling without special administrative exception.
          </span>
        </div>
      </div>

      {/* Live Calculated Margin Box */}
      <div className="p-4 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
        <div>
          <span className="text-xs text-muted-foreground block">Current Gross Margin at List Price:</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={`text-lg font-bold ${
                isMarginHealthy ? 'text-emerald-500' : 'text-amber-500'
              }`}
            >
              {currentMarginPct}% (${marginAmt > 0 ? marginAmt.toLocaleString() : 0} per unit)
            </span>
            <span className="badge badge-gray text-xs">
              Floor Target: {formData.minGrossMarginPct}%
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-muted-foreground block">Compliance Status:</span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${
              isMarginHealthy
                ? 'bg-emerald-500/10 text-emerald-500'
                : 'bg-amber-500/10 text-amber-500'
            }`}
          >
            {isMarginHealthy ? '✓ Compliant Floor' : '⚠ Below Target Margin'}
          </span>
        </div>
      </div>

      {/* Volume Pricing Tiers */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider">
              Volume Pricing Schedule (Optional)
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Define quantity-based discount brackets for this SKU
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-xs text-accent"
            onClick={handleAddTier}
          >
            + Add Tier Bracket
          </button>
        </div>

        {formData.volumeTiers.length === 0 ? (
          <div className="text-xs text-muted-foreground italic py-2">
            No volume tiers configured. Standard base price applies at all order volumes.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Min Quantity</th>
                  <th>Discount %</th>
                  <th>Effective Unit Price</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {formData.volumeTiers.map((t, idx) => (
                  <tr key={idx}>
                    <td>
                      <input
                        type="number"
                        min="1"
                        className="field-input py-1 px-2 text-xs w-24 font-mono"
                        value={t.minQty}
                        onChange={(e) =>
                          handleUpdateTier(idx, 'minQty', parseInt(e.target.value) || 1)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="field-input py-1 px-2 text-xs w-24"
                        value={t.discountPct}
                        onChange={(e) =>
                          handleUpdateTier(idx, 'discountPct', parseFloat(e.target.value) || 0)
                        }
                      />
                    </td>
                    <td className="font-mono text-xs">
                      ${t.unitPrice.toLocaleString()}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs text-red-400"
                        onClick={() => handleRemoveTier(idx)}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
