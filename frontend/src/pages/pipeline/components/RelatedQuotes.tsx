import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RelatedQuote } from '@/types';
import { ROUTES } from '@/constants/routes';

interface RelatedQuotesProps {
  quotes: RelatedQuote[];
  dealId: string;
}

export const RelatedQuotes: React.FC<RelatedQuotesProps> = ({ quotes = [], dealId }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return <span className="badge badge-green">Approved ✓</span>;
      case 'PENDING_APPROVAL':
        return <span className="badge badge-amber">Pending Approval ⏳</span>;
      case 'REJECTED':
        return <span className="badge badge-red">Rejected ✕</span>;
      case 'NEGOTIATION':
        return <span className="badge badge-purple">Negotiation 💬</span>;
      case 'CONFIRMED':
        return <span className="badge badge-green">Confirmed 🖋️</span>;
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  return (
    <div className="card mb-6">
      <div className="card-header flex items-center justify-between">
        <div>
          <div className="card-title text-base font-bold">Associated Quotations</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Quotes generated, negotiated, or approved for this opportunity
          </div>
        </div>
        <button
          className="btn btn-primary btn-xs text-xs"
          onClick={() => navigate(ROUTES.APP.QUOTATION_NEW)}
        >
          + Draft New Quote
        </button>
      </div>

      <div className="card-body p-0">
        {quotes.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No quotation drafts linked to this deal yet.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="w-full text-left text-xs">
              <thead>
                <tr>
                  <th>Quote #</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Margin</th>
                  <th className="text-center">Risk</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr
                    key={q.id}
                    onClick={() => navigate(ROUTES.APP.QUOTATION_DETAIL(q.id))}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    <td className="font-mono font-bold text-accent">
                      {q.quoteNumber}
                    </td>
                    <td className="text-right font-mono font-bold text-foreground">
                      ${q.amount.toLocaleString()}
                    </td>
                    <td className="text-right font-mono">
                      {q.marginPct !== undefined ? `${q.marginPct}%` : '—'}
                    </td>
                    <td className="text-center">
                      <span
                        className={`badge ${
                          q.riskCategory === 'HIGH'
                            ? 'badge-red'
                            : q.riskCategory === 'MEDIUM'
                            ? 'badge-amber'
                            : 'badge-green'
                        }`}
                        style={{ fontSize: '10px', padding: '1px 5px' }}
                      >
                        {q.riskCategory}
                      </span>
                    </td>
                    <td>{getStatusBadge(q.status)}</td>
                    <td className="td-muted">{q.date}</td>
                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn btn-primary btn-xs"
                        onClick={() => navigate(ROUTES.APP.QUOTATION_DETAIL(q.id))}
                      >
                        Open Quote ↗
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
