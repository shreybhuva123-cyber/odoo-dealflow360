import React from 'react';
import { PricingRule } from '@/types';

interface PricingRulesTableProps {
  rules: PricingRule[];
  onToggleStatus: (id: string) => void;
  onEdit: (rule: PricingRule) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function PricingRulesTable({
  rules,
  onToggleStatus,
  onEdit,
  onDelete,
  isLoading,
}: PricingRulesTableProps) {
  if (isLoading) {
    return (
      <div className="card p-8 text-center text-muted-foreground text-sm">
        Loading pricing rules...
      </div>
    );
  }

  const getTypeBadge = (type: PricingRule['type']) => {
    switch (type) {
      case 'CUSTOMER_TIER':
        return <span className="badge badge-blue text-[11px]">Customer Tier</span>;
      case 'CATEGORY_MAX':
        return <span className="badge badge-purple text-[11px]">Category Ceiling</span>;
      case 'MARGIN_PROTECTION':
        return <span className="badge badge-green text-[11px]">Margin Floor</span>;
      case 'VOLUME_DISCOUNT':
        return <span className="badge badge-gray text-[11px]">Volume Tier</span>;
      default:
        return <span className="badge badge-gray text-[11px]">{type}</span>;
    }
  };

  const formatCondition = (cond: PricingRule['condition']) => {
    const parts: string[] = [];
    if (cond.customerTier) parts.push(`Tier: ${cond.customerTier}`);
    if (cond.productCategory) parts.push(`Cat: ${cond.productCategory}`);
    if (cond.minQuantity) parts.push(`Qty ≥ ${cond.minQuantity}`);
    if (cond.minOrderValue) parts.push(`Order ≥ $${cond.minOrderValue.toLocaleString()}`);
    return parts.length > 0 ? parts.join(' · ') : 'All Catalog Items';
  };

  const formatAction = (action: PricingRule['action']) => {
    switch (action.type) {
      case 'MAX_DISCOUNT':
        return `Max ${action.value}% discount`;
      case 'PERCENTAGE_DISCOUNT':
        return `+${action.value}% volume incentive`;
      case 'ENFORCE_MARGIN':
        return `Enforce min ${action.value}% gross margin`;
      case 'REQUIRE_APPROVAL':
        return `Require ${action.requireApprovalRole || 'Manager'} above ${action.value}%`;
      default:
        return `${action.type}: ${action.value}`;
    }
  };

  return (
    <div className="card">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Priority</th>
              <th>Rule Name / Code</th>
              <th>Type</th>
              <th>Trigger Condition</th>
              <th>Enforced Action</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                <td className="font-mono text-xs font-semibold text-muted-foreground">
                  #{r.priority}
                </td>
                <td>
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground text-sm">
                      {r.name}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {r.code}
                    </span>
                    <span className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 max-w-xs">
                      {r.description}
                    </span>
                  </div>
                </td>
                <td>{getTypeBadge(r.type)}</td>
                <td className="text-xs text-muted-foreground">
                  {formatCondition(r.condition)}
                </td>
                <td>
                  <span className="font-medium text-xs text-foreground bg-muted/60 px-2 py-1 rounded">
                    {formatAction(r.action)}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => onToggleStatus(r.id)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                      r.isActive
                        ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {r.isActive ? '● Active' : '○ Inactive'}
                  </button>
                </td>
                <td className="text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-xs"
                      onClick={() => onEdit(r)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-xs text-red-400 hover:text-red-500"
                      onClick={() => onDelete(r.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
