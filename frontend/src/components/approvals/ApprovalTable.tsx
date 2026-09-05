import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApprovalRequest } from '@/types';
import { PriorityRiskBadge } from './PriorityRiskBadge';
import { ApprovalStatusBadge } from './ApprovalStatusBadge';
import { ROUTES } from '@/constants/routes';

interface ApprovalTableProps {
  approvals: ApprovalRequest[];
  isLoading?: boolean;
}

export const ApprovalTable: React.FC<ApprovalTableProps> = ({
  approvals = [],
  isLoading = false,
}) => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [repFilter, setRepFilter] = useState('ALL');

  // Extract unique reps for dropdown
  const uniqueReps = useMemo(() => {
    const reps = new Set<string>();
    approvals.forEach((a) => {
      if (a.requestedByRepName) reps.add(a.requestedByRepName);
    });
    return Array.from(reps).sort();
  }, [approvals]);

  // Filtered approvals
  const filteredApprovals = useMemo(() => {
    return approvals.filter((item) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          item.quoteNumber.toLowerCase().includes(q) ||
          item.customerName.toLowerCase().includes(q) ||
          item.requestedByRepName.toLowerCase().includes(q) ||
          item.triggerReason.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Risk
      if (riskFilter !== 'ALL' && item.riskLevel !== riskFilter) {
        return false;
      }

      // Status
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'RETURNED') {
          if (item.status !== 'RETURNED' && item.status !== 'PENDING_REVISION') {
            return false;
          }
        } else if (item.status !== statusFilter) {
          return false;
        }
      }

      // Rep
      if (repFilter !== 'ALL' && item.requestedByRepName !== repFilter) {
        return false;
      }

      return true;
    });
  }, [approvals, search, riskFilter, statusFilter, repFilter]);

  const hasActiveFilters =
    search.trim() !== '' ||
    riskFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    repFilter !== 'ALL';

  const clearFilters = () => {
    setSearch('');
    setRiskFilter('ALL');
    setStatusFilter('ALL');
    setRepFilter('ALL');
  };

  const handleRowClick = (id: string) => {
    navigate(ROUTES.APP.APPROVAL_DETAIL(id));
  };

  return (
    <div className="card">
      {/* Search & Filter Toolbar */}
      <div className="card-header flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 max-w-sm">
          <input
            type="text"
            className="field-input w-full text-xs"
            placeholder="Search quote #, customer, sales rep..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Risk Filter */}
          <select
            className="field-input text-xs py-1"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option value="ALL">All Risk Levels</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>

          {/* Status Filter */}
          <select
            className="field-input text-xs py-1"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="RETURNED">Revision Requested</option>
          </select>

          {/* Rep Filter */}
          <select
            className="field-input text-xs py-1"
            value={repFilter}
            onChange={(e) => setRepFilter(e.target.value)}
          >
            <option value="ALL">All Sales Reps</option>
            {uniqueReps.map((rep) => (
              <option key={rep} value={rep}>
                {rep}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              className="btn btn-ghost btn-xs text-xs"
              onClick={clearFilters}
              title="Reset all filters"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="card-body p-0">
        {isLoading ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            Loading approval queue...
          </div>
        ) : filteredApprovals.length === 0 ? (
          <div className="text-center py-12">
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔍</div>
            <div className="text-sm font-semibold text-foreground">No Quotations Match Criteria</div>
            <div className="text-xs text-muted-foreground mt-1 mb-4">
              Try adjusting your search query, status, or risk filters.
            </div>
            {hasActiveFilters && (
              <button className="btn btn-primary btn-sm" onClick={clearFilters}>
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th>Quote #</th>
                  <th>Customer</th>
                  <th>Sales Rep</th>
                  <th className="text-right">Total Amount</th>
                  <th className="text-right">Discount</th>
                  <th className="text-right">Margin</th>
                  <th className="text-center">Risk Level</th>
                  <th>Stage</th>
                  <th>Queue Age</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApprovals.map((item) => {
                  const isHigh = item.riskLevel === 'HIGH';

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleRowClick(item.id)}
                      className="cursor-pointer hover:bg-muted/40 transition-colors"
                      style={{
                        borderLeft: isHigh ? '3px solid var(--red)' : undefined,
                      }}
                    >
                      <td className="font-mono font-bold text-xs text-accent">
                        {item.quoteNumber}
                      </td>
                      <td>
                        <div className="font-medium text-foreground text-xs">
                          {item.customerName}
                        </div>
                        {item.customerTier && (
                          <span
                            className="badge badge-gray"
                            style={{ fontSize: '9px', padding: '0px 4px', marginTop: '2px' }}
                          >
                            {item.customerTier}
                          </span>
                        )}
                      </td>
                      <td className="td-muted text-xs">
                        {item.requestedByRepName}
                      </td>
                      <td className="text-right font-mono font-semibold text-xs">
                        ${item.dealValue.toLocaleString()}
                      </td>
                      <td className="text-right font-mono font-semibold text-xs">
                        <span style={{ color: item.discountAppliedPct > 15 ? 'var(--red)' : 'var(--amber)' }}>
                          {item.discountAppliedPct}%
                        </span>
                      </td>
                      <td className="text-right font-mono font-semibold text-xs">
                        <span style={{ color: item.marginPct >= 25 ? 'var(--green)' : item.marginPct >= 18 ? 'var(--amber)' : 'var(--red)' }}>
                          {item.marginPct}%
                        </span>
                      </td>
                      <td className="text-center">
                        <PriorityRiskBadge level={item.riskLevel} size="sm" />
                      </td>
                      <td className="text-xs">
                        <span className="font-medium text-foreground">{item.approvalStage}</span>
                      </td>
                      <td className="td-muted text-xs font-mono">
                        {item.timeInQueue}
                      </td>
                      <td>
                        <ApprovalStatusBadge status={item.status} size="sm" />
                      </td>
                      <td className="text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-primary btn-xs"
                          onClick={() => handleRowClick(item.id)}
                        >
                          Review →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer count */}
      <div className="card-footer px-4 py-3 flex items-center justify-between text-xs text-muted-foreground border-t border-border">
        <div>
          Showing {filteredApprovals.length} of {approvals.length} quotes requiring governance
        </div>
        <div className="flex items-center gap-2">
          <span>Priority sorted: High risk & pending first</span>
        </div>
      </div>
    </div>
  );
};
