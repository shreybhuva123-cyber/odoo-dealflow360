import React from 'react';
import { ApprovalStep, ApprovalStatus } from '@/types';

interface ApprovalTimelineProps {
  steps: ApprovalStep[];
  currentStepIndex: number;
  overallStatus: ApprovalStatus;
}

export const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({
  steps = [],
  currentStepIndex = 1,
  overallStatus,
}) => {
  return (
    <div className="card mb-6">
      <div className="card-header flex items-center justify-between">
        <div>
          <div className="card-title text-base font-bold">Approval Chain Progression</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Sequential governance sign-offs required for order release
          </div>
        </div>
        <span className="badge badge-gray text-xs">
          Stage {Math.min(currentStepIndex + 1, steps.length)} of {steps.length}
        </span>
      </div>

      <div className="card-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {steps.map((step, idx) => {
            const isApproved = step.status === 'APPROVED';
            const isRejected = step.status === 'REJECTED';
            const isReturned = step.status === 'RETURNED' || step.status === 'PENDING_REVISION';
            const isPending = step.status === 'PENDING' && idx === currentStepIndex && overallStatus === 'PENDING';
            const isWaiting = !isApproved && !isRejected && !isReturned && !isPending;

            let dotIcon = '⏳';
            let dotClass = 'pending';
            let statusText = 'Pending Review';

            if (isApproved) {
              dotIcon = '✓';
              dotClass = 'approved';
              statusText = 'Approved';
            } else if (isRejected) {
              dotIcon = '✕';
              dotClass = 'rejected';
              statusText = 'Rejected';
            } else if (isReturned) {
              dotIcon = '↩';
              dotClass = 'rejected';
              statusText = 'Revision Requested';
            } else if (isPending) {
              dotIcon = '⏳';
              dotClass = 'pending';
              statusText = 'Awaiting Decision';
            } else if (isWaiting) {
              dotIcon = '💼';
              dotClass = 'waiting';
              statusText = 'Waiting on Previous Stage';
            }

            return (
              <div key={step.stepNumber} className="approval-step" style={{ alignItems: 'flex-start' }}>
                <div
                  className={`step-dot ${dotClass}`}
                  style={{
                    backgroundColor: isApproved
                      ? 'rgba(16, 185, 129, 0.2)'
                      : isRejected || isReturned
                      ? 'rgba(239, 68, 68, 0.2)'
                      : isPending
                      ? 'rgba(245, 158, 11, 0.2)'
                      : 'rgba(100, 116, 139, 0.2)',
                    borderColor: isApproved
                      ? 'var(--green)'
                      : isRejected || isReturned
                      ? 'var(--red)'
                      : isPending
                      ? 'var(--amber)'
                      : 'var(--border)',
                    color: isApproved
                      ? 'var(--green)'
                      : isRejected || isReturned
                      ? 'var(--red)'
                      : isPending
                      ? 'var(--amber)'
                      : 'var(--text-muted)',
                  }}
                >
                  {dotIcon}
                </div>

                <div className="step-info" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="step-role font-semibold text-foreground text-sm">
                      {step.stepName}
                      {step.approverName && (
                        <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '6px' }}>
                          — {step.approverName}
                        </span>
                      )}
                    </div>
                    <span
                      className={`badge ${
                        isApproved
                          ? 'badge-green'
                          : isRejected || isReturned
                          ? 'badge-red'
                          : isPending
                          ? 'badge-amber'
                          : 'badge-gray'
                      }`}
                      style={{ fontSize: '10px', padding: '1px 6px' }}
                    >
                      {statusText}
                    </span>
                  </div>

                  <div className="step-meta text-xs text-muted-foreground mt-0.5">
                    {step.decidedAt
                      ? `Decided on ${new Date(step.decidedAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}`
                      : isPending
                      ? 'Assigned · Active in queue'
                      : 'Not yet reached'}
                  </div>

                  {step.comment && (
                    <div
                      style={{
                        background: 'var(--surface2)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        padding: '6px 10px',
                        marginTop: '6px',
                        fontSize: '11px',
                        color: 'var(--text)',
                      }}
                    >
                      <strong style={{ color: 'var(--text-muted)' }}>Note: </strong>
                      {step.comment}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
