import React from 'react';
import { ApprovalAuditItem } from '@/types';

interface AuditTimelineProps {
  auditTrail: ApprovalAuditItem[];
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ auditTrail = [] }) => {
  return (
    <div className="card mb-6">
      <div className="card-header flex items-center justify-between">
        <div className="card-title text-base font-bold">Audit Trail & Activity Log</div>
        <span className="badge badge-gray text-xs">{auditTrail.length} Events</span>
      </div>

      <div className="card-body">
        {auditTrail.length === 0 ? (
          <div className="text-center py-4 text-xs text-muted-foreground">
            No audit records found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {auditTrail.map((item, idx) => (
              <React.Fragment key={item.id || idx}>
                {idx > 0 && <div style={{ height: '1px', background: 'var(--border)' }} />}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
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
                    {item.icon || '📌'}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text)' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {item.timestamp}
                      </div>
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <span style={{ color: 'var(--text)' }}>{item.actor}</span> · {item.role}
                    </div>

                    {item.comment && (
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
                        {item.comment}
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
