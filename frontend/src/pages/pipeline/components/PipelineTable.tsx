import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Deal, PIPELINE_STAGES } from '@/types';
import { DealHealthBadge } from './DealHealthBadge';
import { ProbabilityIndicator } from './ProbabilityIndicator';
import { ROUTES } from '@/constants/routes';

interface PipelineTableProps {
  deals: Deal[];
  isLoading?: boolean;
}

type SortField = 'name' | 'customerName' | 'ownerName' | 'value' | 'probability' | 'expectedCloseDate';

export const PipelineTable: React.FC<PipelineTableProps> = ({ deals = [], isLoading = false }) => {
  const navigate = useNavigate();

  const [sortField, setSortField] = useState<SortField>('value');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedDeals = useMemo(() => {
    return [...deals].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'value' || sortField === 'probability') {
        comparison = (a[sortField] || 0) - (b[sortField] || 0);
      } else {
        const aVal = String(a[sortField] || '').toLowerCase();
        const bVal = String(b[sortField] || '').toLowerCase();
        comparison = aVal.localeCompare(bVal);
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [deals, sortField, sortAsc]);

  const handleRowClick = (dealId: string) => {
    navigate(ROUTES.APP.PIPELINE_DETAIL(dealId));
  };

  const getStageBadge = (stageId: string) => {
    const config = PIPELINE_STAGES.find((s) => s.id === stageId);
    return (
      <span
        className={`badge ${config?.badgeClass || 'badge-gray'}`}
        style={{ fontSize: '11px', textTransform: 'capitalize' }}
      >
        {config?.name || stageId}
      </span>
    );
  };

  return (
    <div className="card">
      <div className="card-body p-0">
        <div className="table-wrap">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className="cursor-pointer">
                  Deal Name {sortField === 'name' ? (sortAsc ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('customerName')} className="cursor-pointer">
                  Customer {sortField === 'customerName' ? (sortAsc ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('ownerName')} className="cursor-pointer">
                  Owner {sortField === 'ownerName' ? (sortAsc ? '↑' : '↓') : ''}
                </th>
                <th>Stage</th>
                <th onClick={() => handleSort('value')} className="cursor-pointer text-right">
                  Value {sortField === 'value' ? (sortAsc ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('probability')} className="cursor-pointer text-center">
                  Probability {sortField === 'probability' ? (sortAsc ? '↑' : '↓') : ''}
                </th>
                <th className="text-center">Health</th>
                <th onClick={() => handleSort('expectedCloseDate')} className="cursor-pointer">
                  Expected Close {sortField === 'expectedCloseDate' ? (sortAsc ? '↑' : '↓') : ''}
                </th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedDeals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-muted-foreground text-xs">
                    No deals match current filter criteria.
                  </td>
                </tr>
              ) : (
                sortedDeals.map((deal) => {
                  const formattedDate = deal.expectedCloseDate
                    ? new Date(deal.expectedCloseDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—';

                  return (
                    <tr
                      key={deal.id}
                      onClick={() => handleRowClick(deal.id)}
                      className="cursor-pointer hover:bg-muted/40 transition-colors"
                    >
                      <td className="font-semibold text-foreground text-xs max-w-xs truncate">
                        {deal.name}
                        {deal.isStalled && (
                          <span
                            className="badge badge-red ml-2"
                            style={{ fontSize: '9px', padding: '1px 4px' }}
                          >
                            Stalled {deal.stalledDays}d
                          </span>
                        )}
                      </td>
                      <td className="text-xs">
                        <span className="text-foreground">{deal.customerName}</span>
                        {deal.customerTier && (
                          <span
                            className="badge badge-gray ml-1.5"
                            style={{ fontSize: '9px', padding: '0 4px' }}
                          >
                            {deal.customerTier}
                          </span>
                        )}
                      </td>
                      <td className="td-muted text-xs">
                        {deal.ownerName}
                      </td>
                      <td>{getStageBadge(deal.stage)}</td>
                      <td className="text-right font-mono font-bold text-xs text-foreground">
                        ${deal.value.toLocaleString()}
                      </td>
                      <td className="text-center">
                        <ProbabilityIndicator probability={deal.probability} size="sm" />
                      </td>
                      <td className="text-center">
                        <DealHealthBadge health={deal.health} size="sm" />
                      </td>
                      <td className="td-muted text-xs font-mono">
                        {formattedDate}
                      </td>
                      <td className="text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-primary btn-xs"
                          onClick={() => handleRowClick(deal.id)}
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card-footer px-4 py-3 text-xs text-muted-foreground border-t border-border flex justify-between items-center">
        <span>Showing {sortedDeals.length} deals</span>
        <span>Sorted by {sortField} ({sortAsc ? 'Ascending' : 'Descending'})</span>
      </div>
    </div>
  );
};
