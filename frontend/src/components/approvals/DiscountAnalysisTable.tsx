import React from 'react';
import { DiscountAnalysisItem } from '@/types';

interface DiscountAnalysisTableProps {
  items: DiscountAnalysisItem[];
  customerTier?: string;
}

export const DiscountAnalysisTable: React.FC<DiscountAnalysisTableProps> = ({
  items = [],
  customerTier = 'Gold',
}) => {
  if (items.length === 0) {
    return (
      <div className="card mb-6">
        <div className="card-header">
          <div className="card-title text-sm">Discount Compliance Analysis</div>
        </div>
        <div className="card-body text-center py-6 text-muted-foreground text-xs">
          No line-level discount breaches detected.
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-6">
      <div className="card-header flex items-center justify-between">
        <div>
          <div className="card-title text-base font-bold">Discount Policy Compliance</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Comparing applied discounts against category maximums and {customerTier} tier ceiling
          </div>
        </div>
        <span className="badge badge-blue text-xs">
          Tier: {customerTier}
        </span>
      </div>

      <div className="card-body p-0">
        <div className="table-wrap">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th>Product / Service</th>
                <th>Category</th>
                <th className="text-right">Unit Price</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Applied Discount</th>
                <th className="text-right">Category Ceiling</th>
                <th className="text-right">Tier Limit</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isBreached = item.status === 'BREACHED';

                return (
                  <tr key={item.id} className={isBreached ? 'bg-red-500/5' : undefined}>
                    <td className="font-semibold text-foreground">
                      {item.productName}
                    </td>
                    <td className="td-muted">
                      <span className="badge badge-gray text-xs">{item.category}</span>
                    </td>
                    <td className="text-right font-mono text-xs">
                      ${item.unitPrice.toLocaleString()}
                    </td>
                    <td className="text-center font-mono text-xs">
                      {item.quantity}
                    </td>
                    <td className="text-right font-bold font-mono">
                      <span
                        style={{
                          color: isBreached ? 'var(--red)' : 'var(--green)',
                          fontSize: '13px',
                        }}
                      >
                        {item.appliedDiscountPct}%
                      </span>
                    </td>
                    <td className="text-right text-xs td-muted font-mono">
                      {item.categoryCeilingPct}%
                    </td>
                    <td className="text-right text-xs td-muted font-mono">
                      {item.customerTierCeilingPct}%
                    </td>
                    <td className="text-center">
                      {isBreached ? (
                        <span className="badge badge-red inline-flex items-center gap-1">
                          <span>+{item.variancePts} pts over</span>
                        </span>
                      ) : (
                        <span className="badge badge-green">
                          ✓ OK
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
