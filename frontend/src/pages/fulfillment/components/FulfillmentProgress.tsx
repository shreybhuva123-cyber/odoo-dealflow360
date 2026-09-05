import React from 'react';
import { FulfillmentStatus } from '@/types';

interface FulfillmentProgressProps {
  status: FulfillmentStatus;
  className?: string;
}

interface Step {
  id: string;
  label: string;
  sublabel?: string;
  statuses: FulfillmentStatus[];
}

const STEPS: Step[] = [
  { id: 'created', label: 'Order Created', sublabel: 'Deal / Quote synced', statuses: ['pending', 'allocated', 'processing', 'ready', 'shipped', 'partially_delivered', 'delivered', 'completed'] },
  { id: 'allocated', label: 'Stock Allocated', sublabel: 'Warehouse reserved', statuses: ['allocated', 'processing', 'ready', 'shipped', 'partially_delivered', 'delivered', 'completed'] },
  { id: 'processing', label: 'Processing', sublabel: 'Picked & packed', statuses: ['processing', 'ready', 'shipped', 'partially_delivered', 'delivered', 'completed'] },
  { id: 'shipped', label: 'Shipped', sublabel: 'Carrier in transit', statuses: ['shipped', 'partially_delivered', 'delivered', 'completed'] },
  { id: 'completed', label: 'Delivered', sublabel: 'POD verified', statuses: ['completed', 'delivered'] },
];

export function FulfillmentProgress({ status, className = '' }: FulfillmentProgressProps) {
  const getStepState = (stepIndex: number) => {
    if (status === 'cancelled') return 'cancelled';

    // Current active status index
    const statusToIndex: Record<FulfillmentStatus, number> = {
      pending: 0,
      allocated: 1,
      processing: 2,
      ready: 2, // ready is end of processing
      shipped: 3,
      partially_delivered: 3,
      delivered: 4,
      completed: 4,
      cancelled: -1,
    };

    const currentIndex = statusToIndex[status] ?? 0;

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div
      className={`card p-4 ${className}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Fulfillment Lifecycle Telemetry
      </div>

      {/* Desktop Horizontal Stepper */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Connecting line */}
        <div
          className="absolute left-6 right-6 top-4 h-0.5 -translate-y-1/2 z-0"
          style={{ background: 'var(--border)' }}
        />

        {STEPS.map((step, idx) => {
          const state = getStepState(idx);
          const isCompleted = state === 'completed';
          const isCurrent = state === 'current';

          return (
            <div
              key={step.id}
              className="flex flex-col items-center text-center relative z-10 flex-1 px-1"
            >
              {/* Circle Indicator */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all mb-2"
                style={{
                  background: isCompleted
                    ? 'var(--green)'
                    : isCurrent
                    ? 'var(--accent)'
                    : 'var(--surface2)',
                  color: isCompleted || isCurrent ? '#FFFFFF' : 'var(--text-muted)',
                  border: isCurrent
                    ? '3px solid rgba(59, 130, 246, 0.4)'
                    : isCompleted
                    ? '3px solid rgba(16, 185, 129, 0.3)'
                    : '2px solid var(--border)',
                  boxShadow: isCurrent ? '0 0 12px rgba(59, 130, 246, 0.5)' : undefined,
                }}
              >
                {isCompleted ? '✓' : isCurrent ? '●' : idx + 1}
              </div>

              {/* Step Label */}
              <div
                className="text-xs font-semibold whitespace-nowrap"
                style={{
                  color: isCurrent
                    ? 'var(--accent)'
                    : isCompleted
                    ? 'var(--foreground)'
                    : 'var(--text-muted)',
                }}
              >
                {step.label}
              </div>
              {step.sublabel && (
                <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {step.sublabel}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Vertical Stepper */}
      <div className="flex sm:hidden flex-col gap-3">
        {STEPS.map((step, idx) => {
          const state = getStepState(idx);
          const isCompleted = state === 'completed';
          const isCurrent = state === 'current';

          return (
            <div key={step.id} className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] flex-shrink-0"
                style={{
                  background: isCompleted
                    ? 'var(--green)'
                    : isCurrent
                    ? 'var(--accent)'
                    : 'var(--surface2)',
                  color: isCompleted || isCurrent ? '#FFFFFF' : 'var(--text-muted)',
                  border: '1px solid var(--border)',
                }}
              >
                {isCompleted ? '✓' : isCurrent ? '●' : idx + 1}
              </div>
              <div className="flex-1">
                <span
                  className="text-xs font-semibold"
                  style={{
                    color: isCurrent
                      ? 'var(--accent)'
                      : isCompleted
                      ? 'var(--foreground)'
                      : 'var(--text-muted)',
                  }}
                >
                  {step.label}
                </span>
                {isCurrent && (
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">
                    In Progress
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
