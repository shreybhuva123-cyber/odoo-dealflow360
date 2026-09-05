import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { StageConfig, Deal } from '@/types';
import { DealCard } from './DealCard';

interface PipelineColumnProps {
  stage: StageConfig;
  deals: Deal[];
  isDraggingActive?: boolean;
}

export const PipelineColumn: React.FC<PipelineColumnProps> = ({
  stage,
  deals = [],
  isDraggingActive = false,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div
      ref={setNodeRef}
      style={{
        background: isOver
          ? 'rgba(59, 130, 246, 0.08)'
          : isDraggingActive
          ? 'rgba(26, 34, 53, 0.4)'
          : 'var(--surface)',
        border: isOver
          ? '2px dashed var(--accent)'
          : isDraggingActive
          ? '1px dashed var(--border)'
          : '1px solid var(--border)',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        minWidth: '280px',
        width: '100%',
        height: '100%',
        maxHeight: 'calc(100vh - 270px)',
        transition: 'all 0.2s ease',
      }}
      className="flex-1"
    >
      {/* Column Header */}
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: `3px solid ${stage.color}`,
          borderTopLeftRadius: '9px',
          borderTopRightRadius: '9px',
        }}
      >
        <div className="flex items-center gap-2">
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: stage.color,
              boxShadow: `0 0 6px ${stage.color}`,
            }}
          />
          <span className="font-bold text-xs text-foreground uppercase tracking-wider">
            {stage.name}
          </span>
          <span
            className="badge badge-gray"
            style={{ fontSize: '10px', padding: '1px 6px' }}
          >
            {deals.length}
          </span>
        </div>

        <div className="font-mono font-bold text-xs text-muted-foreground">
          ${totalValue >= 1000000 ? `${(totalValue / 1000000).toFixed(2)}M` : `${Math.round(totalValue / 1000)}k`}
        </div>
      </div>

      {/* Droppable Card Stack */}
      <div
        style={{
          flex: 1,
          padding: '10px',
          overflowY: 'auto',
          minHeight: '180px',
        }}
        className="scrollbar-thin"
      >
        {deals.length === 0 ? (
          <div
            style={{
              height: '100%',
              minHeight: '140px',
              border: '1px dashed var(--border)',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: '11px',
              padding: '12px',
              textAlign: 'center',
            }}
          >
            <span>{isOver ? 'Drop deal here' : 'No deals in this stage'}</span>
          </div>
        ) : (
          deals.map((deal) => <DealCard key={deal.id} deal={deal} />)
        )}
      </div>
    </div>
  );
};
