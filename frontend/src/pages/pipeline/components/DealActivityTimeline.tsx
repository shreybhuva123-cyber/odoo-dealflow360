import React from 'react';
import { DealActivity } from '@/types';

interface DealActivityTimelineProps {
  activities: DealActivity[];
  onOpenAddNote: () => void;
}

export const DealActivityTimeline: React.FC<DealActivityTimelineProps> = ({
  activities = [],
  onOpenAddNote,
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'DEAL_CREATED':
        return '🚀';
      case 'QUOTE_CREATED':
        return '📝';
      case 'QUOTE_UPDATED':
        return '💡';
      case 'APPROVAL_SUBMITTED':
        return '⏳';
      case 'APPROVAL_COMPLETED':
        return '✅';
      case 'CUSTOMER_VIEWED':
        return '👁️';
      case 'CUSTOMER_NEGOTIATED':
        return '💬';
      case 'CUSTOMER_CONFIRMED':
        return '🖋️';
      case 'STAGE_CHANGED':
        return '🔀';
      case 'OWNER_CHANGED':
        return '👤';
      case 'NOTE_ADDED':
      default:
        return '📌';
    }
  };

  return (
    <div className="card mb-6">
      <div className="card-header flex items-center justify-between">
        <div>
          <div className="card-title text-base font-bold">Activity Timeline & Notes</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Chronological audit of deal progression, rep updates, and customer touchpoints
          </div>
        </div>
        <button className="btn btn-primary btn-xs text-xs" onClick={onOpenAddNote}>
          + Add Note
        </button>
      </div>

      <div className="card-body">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No activity logged yet for this deal. Click "+ Add Note" to record updates.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {activities.map((act, idx) => (
              <div key={act.id || idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '15px',
                    flexShrink: 0,
                  }}
                >
                  {getActivityIcon(act.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text)' }}>
                      {act.title}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {act.timestamp}
                    </div>
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    by <strong style={{ color: 'var(--text)' }}>{act.actorName}</strong> ({act.actorRole})
                  </div>

                  {act.description && (
                    <div
                      style={{
                        background: 'var(--surface2)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        padding: '8px 12px',
                        marginTop: '6px',
                        fontSize: '12px',
                        color: 'var(--text)',
                      }}
                    >
                      {act.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
