import React, { useState, useEffect } from 'react';
import { PricingRule, PricingRuleType } from '@/types';
import { showToast } from '@/stores/toast.store';

interface PricingRuleEditorDialogProps {
  isOpen: boolean;
  ruleToEdit: PricingRule | null;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function PricingRuleEditorDialog({
  isOpen,
  ruleToEdit,
  onClose,
  onSave,
}: PricingRuleEditorDialogProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<PricingRuleType>('CUSTOMER_TIER');
  const [priority, setPriority] = useState(10);
  const [customerTier, setCustomerTier] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [minQty, setMinQty] = useState('');
  const [actionType, setActionType] = useState<any>('MAX_DISCOUNT');
  const [actionValue, setActionValue] = useState(10);
  const [requireApprovalRole, setRequireApprovalRole] = useState('SALES_MANAGER');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (ruleToEdit) {
      setName(ruleToEdit.name);
      setCode(ruleToEdit.code);
      setDescription(ruleToEdit.description);
      setType(ruleToEdit.type);
      setPriority(ruleToEdit.priority);
      setCustomerTier(ruleToEdit.condition.customerTier || '');
      setProductCategory(ruleToEdit.condition.productCategory || '');
      setMinQty(ruleToEdit.condition.minQuantity ? String(ruleToEdit.condition.minQuantity) : '');
      setActionType(ruleToEdit.action.type);
      setActionValue(ruleToEdit.action.value);
      setRequireApprovalRole(ruleToEdit.action.requireApprovalRole || 'SALES_MANAGER');
      setIsActive(ruleToEdit.isActive);
    } else {
      setName('');
      setCode(`RULE-${Date.now().toString().slice(-4)}`);
      setDescription('');
      setType('CUSTOMER_TIER');
      setPriority(10);
      setCustomerTier('');
      setProductCategory('');
      setMinQty('');
      setActionType('MAX_DISCOUNT');
      setActionValue(10);
      setRequireApprovalRole('SALES_MANAGER');
      setIsActive(true);
    }
  }, [ruleToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      showToast('Rule name and code are required', 'amber');
      return;
    }

    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim(),
      type,
      priority: Number(priority) || 10,
      condition: {
        customerTier: customerTier || undefined,
        productCategory: productCategory || undefined,
        minQuantity: minQty ? Number(minQty) : undefined,
      },
      action: {
        type: actionType,
        value: Number(actionValue),
        requireApprovalRole: actionType === 'REQUIRE_APPROVAL' ? requireApprovalRole : undefined,
      },
      isActive,
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="modal-overlay open">
      <div className="modal max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="modal-head">
            <div className="modal-title">
              {ruleToEdit ? 'Edit Pricing Rule' : 'New Pricing Governance Rule'}
            </div>
            <button type="button" className="modal-close" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="modal-body space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="field-group">
                <label className="field-label">Rule Name *</label>
                <input
                  type="text"
                  className="field-input text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hardware Blanket Ceiling"
                  required
                />
              </div>

              <div className="field-group">
                <label className="field-label">Rule Code *</label>
                <input
                  type="text"
                  className="field-input text-sm font-mono"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="RULE-HW-15"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="field-group">
                <label className="field-label">Rule Type</label>
                <select
                  className="field-input text-sm"
                  value={type}
                  onChange={(e) => setType(e.target.value as PricingRuleType)}
                >
                  <option value="CUSTOMER_TIER">Customer Tier Discount</option>
                  <option value="CATEGORY_MAX">Product Category Ceiling</option>
                  <option value="MARGIN_PROTECTION">Margin Floor Protection</option>
                  <option value="VOLUME_DISCOUNT">Volume Incentive</option>
                </select>
              </div>

              <div className="field-group">
                <label className="field-label">Priority (Lower = Evaluated First)</label>
                <input
                  type="number"
                  className="field-input text-sm font-mono"
                  value={priority}
                  onChange={(e) => setPriority(parseInt(e.target.value) || 10)}
                  min="1"
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Rule Description / Purpose</label>
              <textarea
                rows={2}
                className="field-input text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the business rationale and enforcement logic..."
              />
            </div>

            {/* Condition Scope */}
            <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-3">
              <div className="text-xs font-semibold text-foreground">
                Trigger Criteria (Optional filters)
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">
                    Customer Tier
                  </label>
                  <select
                    className="field-input text-xs"
                    value={customerTier}
                    onChange={(e) => setCustomerTier(e.target.value)}
                  >
                    <option value="">Any Tier</option>
                    <option value="STANDARD">Standard</option>
                    <option value="SILVER">Silver</option>
                    <option value="GOLD">Gold</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">
                    Category
                  </label>
                  <select
                    className="field-input text-xs"
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                  >
                    <option value="">Any Category</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Subscription">Subscription</option>
                    <option value="Service">Service</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">
                    Min Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="field-input text-xs"
                    placeholder="e.g. 50"
                    value={minQty}
                    onChange={(e) => setMinQty(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Action Enforced */}
            <div className="p-3 bg-accent/5 rounded-lg border border-accent/20 space-y-3">
              <div className="text-xs font-semibold text-accent">
                Enforced Action / Ceiling
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">
                    Action Type
                  </label>
                  <select
                    className="field-input text-xs"
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                  >
                    <option value="MAX_DISCOUNT">Enforce Max Discount (%)</option>
                    <option value="REQUIRE_APPROVAL">Require Role Approval</option>
                    <option value="ENFORCE_MARGIN">Enforce Floor Gross Margin (%)</option>
                    <option value="PERCENTAGE_DISCOUNT">Add Volume Incentive (%)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">
                    Value (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="field-input text-xs font-semibold"
                    value={actionValue}
                    onChange={(e) => setActionValue(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {actionType === 'REQUIRE_APPROVAL' && (
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">
                    Approval Role Required
                  </label>
                  <select
                    className="field-input text-xs"
                    value={requireApprovalRole}
                    onChange={(e) => setRequireApprovalRole(e.target.value)}
                  >
                    <option value="SALES_MANAGER">Sales Manager</option>
                    <option value="FINANCE">Finance Director / Controller</option>
                    <option value="ADMIN">System Administrator</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="rule-active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="rule-active" className="text-xs text-foreground cursor-pointer">
                Rule is active and evaluated by quotation calculation engine
              </label>
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {ruleToEdit ? 'Save Changes' : 'Create Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
