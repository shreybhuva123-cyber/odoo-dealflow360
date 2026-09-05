import React from 'react';
import { Link } from 'react-router-dom';
import {
  usePricingOverview,
  useDiscountGovernanceMatrix,
  usePricingRules,
  useCustomerTiers,
} from '@/hooks/usePricing';
import {
  PricingOverviewStats,
  DiscountGovernanceMatrix,
} from './components';

export function PricingPage() {
  const { data: stats, isLoading: isStatsLoading } = usePricingOverview();
  const { data: matrix = [], isLoading: isMatrixLoading } = useDiscountGovernanceMatrix();
  const { data: rules = [] } = usePricingRules();
  const { data: tiers = [] } = useCustomerTiers();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link to="/app/admin" className="hover:text-foreground">
              Admin Command
            </Link>
            <span>/</span>
            <span>Pricing Governance</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Pricing & Discount Governance Hub</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage floor margins, customer tier ceilings, category limits, and multi-level approval triggers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/app/admin/pricing/rules"
            className="btn btn-primary btn-sm text-xs inline-flex items-center gap-1.5"
          >
            <span>Manage Rules ({rules.length})</span>
          </Link>
          <Link
            to="/app/admin/pricing/customer-tiers"
            className="btn btn-ghost btn-sm text-xs inline-flex items-center gap-1.5"
          >
            <span>Customer Tiers ({tiers.length})</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <PricingOverviewStats stats={stats} isLoading={isStatsLoading} />

      {/* Discount Governance Matrix */}
      <DiscountGovernanceMatrix entries={matrix} isLoading={isMatrixLoading} />

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">⚖️</span>
              <h3 className="font-semibold text-foreground text-sm">
                Pricing & Margin Floor Rules
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Configure strict gross margin protections, blanket discount caps, and volume accelerator schedules. Rules are automatically evaluated in priority sequence on every quote line.
            </p>
            <div className="text-xs text-muted-foreground space-y-1 mb-4">
              <div className="flex justify-between">
                <span>Active Protection Rules:</span>
                <span className="font-semibold text-foreground">
                  {rules.filter((r) => r.isActive).length} active
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Registered Rules:</span>
                <span className="font-semibold text-foreground">{rules.length}</span>
              </div>
            </div>
          </div>
          <Link
            to="/app/admin/pricing/rules"
            className="btn btn-ghost btn-sm text-accent text-xs w-fit"
          >
            Configure Pricing Rules →
          </Link>
        </div>

        <div className="card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🏆</span>
              <h3 className="font-semibold text-foreground text-sm">
                Customer Account Tiers
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Standardize customer discount ceilings across Bronze/Standard (5%), Silver (10%), Gold (15%), and Enterprise (20%) tiers, with customized category overrides.
            </p>
            <div className="text-xs text-muted-foreground space-y-1 mb-4">
              <div className="flex justify-between">
                <span>Active Tiers:</span>
                <span className="font-semibold text-foreground">{tiers.length} Tiers</span>
              </div>
              <div className="flex justify-between">
                <span>Enforcement Mode:</span>
                <span className="text-emerald-500 font-semibold">Strict Backend Guardrails</span>
              </div>
            </div>
          </div>
          <Link
            to="/app/admin/pricing/customer-tiers"
            className="btn btn-ghost btn-sm text-accent text-xs w-fit"
          >
            Manage Customer Tiers →
          </Link>
        </div>
      </div>
    </div>
  );
}
