import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Deal, PIPELINE_STAGES } from '@/types';
import { ProbabilityIndicator } from './ProbabilityIndicator';
import { ROUTES } from '@/constants/routes';

interface DealOverviewProps {
  deal: Deal;
}

export const DealOverview: React.FC<DealOverviewProps> = ({ deal }) => {
  const navigate = useNavigate();
  const stageConfig = PIPELINE_STAGES.find((s) => s.id === deal.stage);
  const weightedValue = Math.round((deal.value * deal.probability) / 100);

  const formattedCloseDate = deal.expectedCloseDate
    ? new Date(deal.expectedCloseDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Not Set';

  const formattedCreatedDate = deal.createdAt
    ? new Date(deal.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

  return (
    <div className="card mb-6">
      <div className="card-header flex items-center justify-between">
        <div>
          <div className="card-title text-base font-bold">Deal Commercial Overview</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Core opportunity details, revenue impact, and expected close timeline
          </div>
        </div>
        <span className={`badge ${stageConfig?.badgeClass || 'badge-gray'} text-xs capitalize`}>
          Stage: {stageConfig?.name || deal.stage}
        </span>
      </div>

      <div className="card-body">
        {/* Key Commercial Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Deal Value
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent)', marginTop: '2px' }}>
              ${deal.value.toLocaleString()}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Nominal contract amount</div>
          </div>

          <div
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Win Probability
            </div>
            <div className="flex items-center gap-2 mt-1">
              <ProbabilityIndicator probability={deal.probability} size="md" showBar={true} />
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Weighted: ${weightedValue.toLocaleString()}
            </div>
          </div>

          <div
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Expected Close
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>
              {formattedCloseDate}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              Created: {formattedCreatedDate}
            </div>
          </div>

          <div
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Assigned Owner
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>
              {deal.ownerName}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {deal.ownerRole || 'Sales Representative'}
            </div>
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Account & Context
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Customer Company:</span>
              <strong className="text-foreground">{deal.customerName}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Customer Tier:</span>
              <span className="badge badge-gray">{deal.customerTier || 'Standard'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Industry Sector:</span>
              <span className="text-foreground">{deal.industry || 'Technology & Services'}</span>
            </div>
          </div>

          <div
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Pipeline Governance
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Lead Source:</span>
              <span className="text-foreground">{deal.source || 'Direct Referral'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Sales Region:</span>
              <span className="text-foreground">{deal.region || 'Global / North America'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Approval Status:</span>
              <span
                className={`badge ${
                  deal.approvalPending
                    ? 'badge-amber'
                    : deal.quoteStatus === 'APPROVED'
                    ? 'badge-green'
                    : 'badge-gray'
                }`}
              >
                {deal.approvalPending ? '⏳ Approval Pending' : deal.quoteStatus || 'Not Required'}
              </span>
            </div>
          </div>
        </div>

        {/* Fulfillment Link Integration */}
        <div
          className="mt-4 p-3 rounded flex items-center justify-between"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '20px' }}>🚚</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">Fulfillment Status:</span>
                <span className="font-mono font-bold text-accent text-xs">
                  {deal.id === 'deal-101'
                    ? 'FUL-1024'
                    : deal.id === 'deal-102'
                    ? 'FUL-1023'
                    : 'FUL-1025'}
                </span>
                <span className="badge badge-green text-[10px]">Processing</span>
              </div>
              <div className="text-[10px] text-muted-foreground">
                Multi-warehouse stock allocation and carrier tracking
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              navigate(
                ROUTES.APP.FULFILLMENT_DETAIL(
                  deal.id === 'deal-101' ? 'FUL-1024' : deal.id === 'deal-102' ? 'FUL-1023' : 'FUL-1025'
                )
              )
            }
            className="btn btn-primary btn-xs text-xs"
          >
            View Fulfillment →
          </button>
        </div>

        {/* Invoice & Billing Link Integration */}
        <div
          className="mt-3 p-3 rounded flex items-center justify-between"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '20px' }}>🧾</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">Commercial Invoicing:</span>
                <span className="font-mono font-bold text-primary text-xs">
                  {deal.id === 'deal-101'
                    ? 'INV-1024'
                    : deal.id === 'deal-102'
                    ? 'INV-1023'
                    : 'INV-1025'}
                </span>
                <span className="badge badge-blue text-[10px]">
                  {deal.id === 'deal-101' ? 'Partially Paid' : deal.id === 'deal-102' ? 'Paid' : 'Overdue'}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground">
                Automated GST tax breakdown, reconciliation ledger, and payment tracking
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              navigate(
                ROUTES.APP.INVOICE_DETAIL(
                  deal.id === 'deal-101' ? 'inv_1024' : deal.id === 'deal-102' ? 'inv_1023' : 'inv_1025'
                )
              )
            }
            className="btn btn-ghost btn-xs text-xs border border-border"
          >
            View Invoice →
          </button>
        </div>
      </div>
    </div>
  );
};
