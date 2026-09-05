import React from 'react';
import { FinanceReviewDetails } from '@/types';

interface FinanceReviewSectionProps {
  details: FinanceReviewDetails;
}

export const FinanceReviewSection: React.FC<FinanceReviewSectionProps> = ({ details }) => {
  if (!details) return null;

  const isNonStandardTerms = details.paymentTermsRequested !== details.standardPaymentTerms;

  return (
    <div className="card mb-6" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
      <div className="card-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '18px' }}>💼</span>
          <div>
            <div className="card-title text-base font-bold">Finance & Credit Evaluation</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Profitability, terms compliance, and credit risk assessment
            </div>
          </div>
        </div>
        <span className="badge badge-blue text-xs">
          Finance View
        </span>
      </div>

      <div className="card-body">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '10px 12px',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Gross Revenue
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', marginTop: '2px' }}>
              ${details.grossRevenue.toLocaleString()}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              COGS: ${details.costOfGoods.toLocaleString()}
            </div>
          </div>

          <div
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '10px 12px',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Net Margin ($ / %)
            </div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 800,
                color: details.netMarginPct >= 20 ? 'var(--green)' : 'var(--amber)',
                marginTop: '2px',
              }}
            >
              ${details.netMarginDollars.toLocaleString()}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {details.netMarginPct}% Net Margin
            </div>
          </div>

          <div
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '10px 12px',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Payment Terms
            </div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: isNonStandardTerms ? 'var(--amber)' : 'var(--text)',
                marginTop: '4px',
              }}
            >
              {details.paymentTermsRequested}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              Std: {details.standardPaymentTerms}
            </div>
          </div>

          <div
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '10px 12px',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Credit Rating
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>
              {details.creditRating}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              Limit: ${details.creditLimit.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Credit & Terms Warning if Non-standard */}
        {isNonStandardTerms && (
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '6px',
              padding: '10px 12px',
              fontSize: '12px',
              color: 'var(--amber)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>⚠️</span>
            <div>
              <strong>Working Capital Notice: </strong> Requested terms ({details.paymentTermsRequested}) deviate from standard ({details.standardPaymentTerms}). Outstanding receivables currently total ${details.outstandingBalance.toLocaleString()}.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
