import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { Deal, DealStage, PIPELINE_STAGES } from '@/types';
import { PipelineColumn } from './PipelineColumn';
import { DealCard } from './DealCard';

interface PipelineBoardProps {
  deals: Deal[];
  onMoveDeal: (dealId: string, targetStage: DealStage) => void;
}

export const PipelineBoard: React.FC<PipelineBoardProps> = ({ deals = [], onMoveDeal }) => {
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6, // 6px movement before drag activates so normal clicks on card pass through
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const deal = deals.find((d) => d.id === event.active.id);
    if (deal) {
      setActiveDeal(deal);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const dealId = active.id as string;
    const targetStage = over.id as DealStage;

    const deal = deals.find((d) => d.id === dealId);
    if (deal && deal.stage !== targetStage) {
      onMoveDeal(dealId, targetStage);
    }
  };

  const handleDragCancel = () => {
    setActiveDeal(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        className="flex gap-4 overflow-x-auto pb-4 items-stretch scrollbar-thin"
        style={{ minHeight: 'calc(100vh - 260px)' }}
      >
        {PIPELINE_STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.id);
          return (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              deals={stageDeals}
              isDraggingActive={!!activeDeal}
            />
          );
        })}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDeal ? (
          <div style={{ width: '280px' }}>
            <DealCard deal={activeDeal} isOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
