import React from 'react';
import { DiscountGovernanceEntry } from '@/types';

interface DiscountGovernanceMatrixProps {
  entries: DiscountGovernanceEntry[];
  isLoading?: boolean;
}

export function DiscountGovernanceMatrix({
  entries,
  isLoading,
}: DiscountGovernanceMatrixProps) {
  if (isLoading) {
    return (
      <div className="card p-8 text-center text-muted-foreground text-sm">
        Loading governance matrix...
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <div>
          <div className="card-title">Discount Governance Matrix</div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cross-tier ceilings, product category limits, and automated approval routing paths
          </p>
        </div>
        <span className="badge badge-blue text-xs">
          Strict Compliance Mode
        </span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Customer Tier</th>
              <th>Blanket Max Disc</th>
              <th>Hardware Ceiling</th>
              <th>Software / SaaS</th>
              <th>Services Ceiling</th>
              <th>Required Approval Route</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((item) => {
              const getBadgeColor = (t: string) => {
                switch (t) {
                  case 'STANDARD':
                    return 'badge-gray';
                  case 'SILVER':
                    return 'badge-blue';
                  case 'GOLD':
                    return 'badge-green';
                  case 'ENTERPRISE':
                    return 'badge-purple';
                  default:
                    return 'badge-gray';
                }
              };

              return (
                <tr key={item.tier} className="hover:bg-muted/40 transition-colors">
                  <td>
                    <span className={`badge ${getBadgeColor(item.tier)} text-xs font-semibold`}>
                      {item.tierName}
                    </span>
                  </td>
                  <td className="font-bold text-foreground text-sm">
                    {item.maxDiscount}%
                  </td>
                  <td className="font-medium text-xs text-foreground">
                    {item.hardwareCeiling}%
                  </td>
                  <td className="font-medium text-xs text-foreground">
                    {item.subscriptionCeiling}%
                  </td>
                  <td className="font-medium text-xs text-foreground">
                    {item.servicesCeiling}%
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>🛡️</span>
                      <span className="font-medium text-foreground">
                        {item.approvalRoute}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card-body bg-muted/20 border-t border-border p-4 text-xs text-muted-foreground">
        <div className="flex items-start gap-2">
          <span className="text-base leading-none">💡</span>
          <div>
            <strong className="text-foreground">Blended Risk Escalation Rule:</strong> When a quote contains multiple line items across differing categories, the DealFlow360 rule engine calculates the aggregate weighted gross margin. If the aggregate margin breaches the product floor, approval automatically escalates to the highest required tier (e.g. Finance Director).
          </div>
        </div>
      </div>
    </div>
  );
}
