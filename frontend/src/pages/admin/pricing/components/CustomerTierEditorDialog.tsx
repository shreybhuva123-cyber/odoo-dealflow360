import React, { useState, useEffect } from 'react';
import { PricingCustomerTier } from '@/types';
import { showToast } from '@/stores/toast.store';

interface CustomerTierEditorDialogProps {
  isOpen: boolean;
  tier: PricingCustomerTier | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<PricingCustomerTier>) => void;
}

export function CustomerTierEditorDialog({
  isOpen,
  tier,
  onClose,
  onSave,
}: CustomerTierEditorDialogProps) {
  const [defaultMaxDiscountPct, setDefaultMaxDiscountPct] = useState(10);
  const [autoApprovalThresholdPct, setAutoApprovalThresholdPct] = useState(5);
  const [annualSpendThreshold, setAnnualSpendThreshold] = useState(25000);
  const [description, setDescription] = useState('');
  const [categoryDiscounts, setCategoryDiscounts] = useState<
    { category: string; maxDiscountPct: number }[]
  >([]);

  useEffect(() => {
    if (tier) {
      setDefaultMaxDiscountPct(tier.defaultMaxDiscountPct);
      setAutoApprovalThresholdPct(tier.autoApprovalThresholdPct);
      setAnnualSpendThreshold(tier.annualSpendThreshold);
      setDescription(tier.description);
      setCategoryDiscounts(tier.categoryDiscounts || []);
    }
  }, [tier, isOpen]);

  if (!isOpen || !tier) return null;

  const handleCategoryDiscountChange = (idx: number, val: number) => {
    const updated = [...categoryDiscounts];
    updated[idx] = { ...updated[idx], maxDiscountPct: val };
    setCategoryDiscounts(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(tier.id, {
      defaultMaxDiscountPct: Number(defaultMaxDiscountPct),
      autoApprovalThresholdPct: Number(autoApprovalThresholdPct),
      annualSpendThreshold: Number(annualSpendThreshold),
      description: description.trim(),
      categoryDiscounts,
    });
    onClose();
    showToast(`Tier "${tier.name}" updated`, 'green');
  };

  return (
    <div className="modal-overlay open">
      <div className="modal max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="modal-head">
            <div className="modal-title">Edit Tier: {tier.name}</div>
            <button type="button" className="modal-close" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="modal-body space-y-4">
            <div className="field-group">
              <label className="field-label">Tier Description</label>
              <input
                type="text"
                className="field-input text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="field-group">
                <label className="field-label">Blanket Max Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="field-input text-sm font-semibold"
                  value={defaultMaxDiscountPct}
                  onChange={(e) => setDefaultMaxDiscountPct(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="field-group">
                <label className="field-label">Auto-Approval Threshold (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="field-input text-sm"
                  value={autoApprovalThresholdPct}
                  onChange={(e) => setAutoApprovalThresholdPct(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Annual Spend Qualification ($)</label>
              <input
                type="number"
                min="0"
                step="1000"
                className="field-input text-sm font-mono"
                value={annualSpendThreshold}
                onChange={(e) => setAnnualSpendThreshold(parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            {/* Category Level Overrides */}
            <div className="p-3 bg-muted/40 rounded-lg border border-border">
              <div className="text-xs font-semibold text-foreground mb-2">
                Category Maximum Discount Overrides
              </div>
              <div className="space-y-2">
                {categoryDiscounts.map((cd, idx) => (
                  <div
                    key={cd.category}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-foreground">{cd.category}</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="field-input text-xs w-20 text-right py-1 px-2 font-mono"
                        value={cd.maxDiscountPct}
                        onChange={(e) =>
                          handleCategoryDiscountChange(idx, parseFloat(e.target.value) || 0)
                        }
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Tier Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
