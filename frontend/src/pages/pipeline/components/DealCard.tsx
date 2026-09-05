import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDraggable } from '@dnd-kit/core';
import { Deal } from '@/types';
import { DealHealthBadge } from './DealHealthBadge';
import { ProbabilityIndicator } from './ProbabilityIndicator';
import { ROUTES } from '@/constants/routes';

interface DealCardProps {
  deal: Deal;
  isOverlay?: boolean;
}

export const DealCard: React.FC<DealCardProps> = ({ deal, isOverlay = false }) => {
  const navigate = useNavigate();

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
    data: deal,
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    transition: isDragging ? 'none' : 'box-shadow 0.2s ease, transform 0.2s ease',
    background: 'var(--surface2)',
    border: isOverlay ? '2px solid var(--accent)' : '1px solid var(--border)',
    boxShadow: isOverlay
      ? '0 12px 28px rgba(0, 0, 0, 0.5)'
      : '0 2px 6px rgba(0, 0, 0, 0.15)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '10px',
    userSelect: 'none',
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only navigate if not actively dragging
    if (!isDragging) {
      navigate(ROUTES.APP.PIPELINE_DETAIL(deal.id));
    }
  };

  const formattedCloseDate = deal.expectedCloseDate
    ? new Date(deal.expectedCloseDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : 'TBD';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className="group hover:border-accent/40 hover:shadow-lg transition-all"
    >
      {/* Top Header: Deal Name & Menu */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="font-bold text-xs text-foreground group-hover:text-accent transition-colors line-clamp-1">
          {deal.name}
        </div>
        <span className="text-muted-foreground text-xs opacity-60 hover:opacity-100 flex-shrink-0">
          ⋮
        </span>
      </div>

      {/* Customer Name & Tier */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
        <span className="truncate">{deal.customerName}</span>
        {deal.customerTier && (
          <span
            className="badge badge-gray"
            style={{ fontSize: '9px', padding: '0 4px', lineHeight: '14px' }}
          >
            {deal.customerTier}
          </span>
        )}
      </div>

      {/* Value & Probability Row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="font-extrabold text-sm text-foreground font-mono">
          ${deal.value.toLocaleString()}
        </div>
        <ProbabilityIndicator probability={deal.probability} size="sm" />
      </div>

      {/* Close Date & Owner */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 pb-2 border-b border-border/50">
        <div className="flex items-center gap-1">
          <span style={{ fontSize: '11px' }}>📅</span>
          <span>Close: {formattedCloseDate}</span>
        </div>
        <div className="flex items-center gap-1.5 truncate max-w-[110px]" title={deal.ownerName}>
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'var(--accent-dim)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '9px',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {deal.ownerName.charAt(0)}
          </div>
          <span className="truncate">{deal.ownerName.split(' ')[0]}</span>
        </div>
      </div>

      {/* Badges & Signals Row */}
      <div className="flex flex-wrap items-center gap-1.5">
        <DealHealthBadge health={deal.health} size="sm" />

        {deal.approvalPending && (
          <span
            className="badge badge-amber"
            style={{ fontSize: '10px', padding: '2px 6px' }}
            title="Quotation awaiting manager or finance approval"
          >
            ⏳ Approval Pending
          </span>
        )}

        {deal.isStalled && (
          <span
            className="badge badge-red"
            style={{ fontSize: '10px', padding: '2px 6px' }}
            title={`No customer activity for ${deal.stalledDays || 10} days`}
          >
            ⚠ Stalled {deal.stalledDays || 12}d
          </span>
        )}

        {deal.riskScore && deal.riskScore >= 60 && (
          <span
            className="badge badge-red"
            style={{ fontSize: '10px', padding: '2px 6px' }}
            title={`Deal risk score: ${deal.riskScore}/100`}
          >
            Risk: {deal.riskScore}
          </span>
        )}
      </div>
    </div>
  );
};
