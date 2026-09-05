import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomerTiers, useUpdateCustomerTier } from '@/hooks/usePricing';
import { PricingCustomerTier } from '@/types';
import {
  CustomerTierTable,
  CustomerTierEditorDialog,
} from './components';

export function CustomerTiersPage() {
  const { data: tiers = [], isLoading } = useCustomerTiers();
  const updateTier = useUpdateCustomerTier();

  const [selectedTier, setSelectedTier] = useState<PricingCustomerTier | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEdit = (tier: PricingCustomerTier) => {
    setSelectedTier(tier);
    setIsDialogOpen(true);
  };

  const handleSave = (id: string, updates: Partial<PricingCustomerTier>) => {
    updateTier.mutate({ id, updates });
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
            <span>Customer Tiers</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Customer Account Tier Governance</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure discount ceilings, qualification spend thresholds, and auto-approval floors
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/app/admin/pricing"
            className="btn btn-ghost btn-sm text-xs"
          >
            ← Governance Matrix
          </Link>
          <Link
            to="/app/customers"
            className="btn btn-primary btn-sm text-xs"
          >
            View Customer Directory →
          </Link>
        </div>
      </div>

      {/* Tiers Table */}
      <CustomerTierTable
        tiers={tiers}
        onEdit={handleEdit}
        isLoading={isLoading}
      />

      {/* Tier Editor Dialog */}
      <CustomerTierEditorDialog
        isOpen={isDialogOpen}
        tier={selectedTier}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
