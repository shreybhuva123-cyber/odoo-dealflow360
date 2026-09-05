import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  usePricingRules,
  useCreatePricingRule,
  useUpdatePricingRule,
  useDeletePricingRule,
  useTogglePricingRuleStatus,
} from '@/hooks/usePricing';
import { PricingRule, PricingRuleType } from '@/types';
import {
  PricingRulesTable,
  PricingRuleEditorDialog,
} from './components';

export function PricingRulesPage() {
  const { data: rules = [], isLoading } = usePricingRules();
  const createRule = useCreatePricingRule();
  const updateRule = useUpdatePricingRule();
  const deleteRule = useDeletePricingRule();
  const toggleStatus = useTogglePricingRuleStatus();

  const [filterType, setFilterType] = useState<string>('ALL');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState<PricingRule | null>(null);

  const filteredRules = rules.filter((r) => {
    if (filterType === 'ALL') return true;
    return r.type === filterType;
  });

  const handleOpenNew = () => {
    setRuleToEdit(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (rule: PricingRule) => {
    setRuleToEdit(rule);
    setIsEditorOpen(true);
  };

  const handleSave = (data: any) => {
    if (ruleToEdit) {
      updateRule.mutate({
        id: ruleToEdit.id,
        updates: data,
      });
    } else {
      createRule.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this pricing rule?')) {
      deleteRule.mutate(id);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link to="/app/admin" className="hover:text-foreground">
              Admin
            </Link>
            <span>/</span>
            <Link to="/app/admin/pricing" className="hover:text-foreground">
              Pricing
            </Link>
            <span>/</span>
            <span>Rules</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Pricing & Discount Governance Rules</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure automated guardrails, margin protections, and multi-level approval triggers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/app/admin/pricing"
            className="btn btn-ghost btn-sm text-xs"
          >
            ← Governance Matrix
          </Link>
          <button
            type="button"
            className="btn btn-primary btn-sm text-xs inline-flex items-center gap-1.5"
            onClick={handleOpenNew}
          >
            <span>+ New Rule</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: 'ALL', label: `All Rules (${rules.length})` },
          { key: 'CUSTOMER_TIER', label: 'Customer Tiers' },
          { key: 'CATEGORY_MAX', label: 'Category Caps' },
          { key: 'MARGIN_PROTECTION', label: 'Margin Floors' },
          { key: 'VOLUME_DISCOUNT', label: 'Volume Tiers' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              filterType === tab.key
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setFilterType(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Rules Table */}
      <PricingRulesTable
        rules={filteredRules}
        onToggleStatus={(id) => toggleStatus.mutate(id)}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {/* Rule Editor Dialog */}
      <PricingRuleEditorDialog
        isOpen={isEditorOpen}
        ruleToEdit={ruleToEdit}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
