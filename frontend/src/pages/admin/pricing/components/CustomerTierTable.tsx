import React from 'react';
import { PricingCustomerTier } from '@/types';

interface CustomerTierTableProps {
  tiers: PricingCustomerTier[];
  onEdit: (tier: PricingCustomerTier) => void;
  isLoading?: boolean;
}

export function CustomerTierTable({
  tiers,
  onEdit,
  isLoading,
}: CustomerTierTableProps) {
  if (isLoading) {
    return (
      <div className="card p-8 text-center text-muted-foreground text-sm">
        Loading customer tiers...
      </div>
    );
  }

  return (
    <div className="card">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tier</th>
              <th>Spend Requirement</th>
              <th>Default Ceiling</th>
              <th>Auto-Approve Floor</th>
              <th>Category Ceilings</th>
              <th>Active Clients</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((t) => (
              <tr key={t.id} className="hover:bg-muted/40 transition-colors">
                <td>
                  <div className="flex flex-col">
                    <span className={`badge badge-${t.colorBadge} text-xs font-semibold w-fit`}>
                      {t.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground mt-1 max-w-xs">
                      {t.description}
                    </span>
                  </div>
                </td>
                <td className="font-mono text-xs">
                  {t.annualSpendThreshold === 0 ? (
                    <span className="text-muted-foreground">None ($0)</span>
                  ) : (
                    `$${t.annualSpendThreshold.toLocaleString()} /yr`
                  )}
                </td>
                <td className="font-bold text-foreground text-sm">
                  {t.defaultMaxDiscountPct}%
                </td>
                <td className="text-xs">
                  <span className="text-emerald-500 font-medium">
                    ≤ {t.autoApprovalThresholdPct}%
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    (zero manager delay)
                  </span>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {t.categoryDiscounts.map((cd) => (
                      <span
                        key={cd.category}
                        className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono"
                      >
                        {cd.category}: {cd.maxDiscountPct}%
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <span className="badge badge-gray text-xs">
                    {t.customerCount} accounts
                  </span>
                </td>
                <td className="text-right">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-xs"
                    onClick={() => onEdit(t)}
                  >
                    Edit Tier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
