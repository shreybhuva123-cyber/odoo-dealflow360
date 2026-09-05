import React from 'react';
import { DealRecommendation } from '@/services/api/recommendations.api';

interface RecommendationPanelProps {
  recommendations: DealRecommendation[];
  onAddRecommendation: (rec: DealRecommendation) => void;
  onDismissRecommendation: (recId: string) => void;
  className?: string;
}

export function RecommendationPanel({
  recommendations,
  onAddRecommendation,
  onDismissRecommendation,
  className = '',
}: RecommendationPanelProps) {
  const visibleRecs = recommendations.filter((r) => !r.isDismissed);

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px' }}>✨</span>
          <span className="card-title">Recommended for this deal</span>
        </div>
        <span className="badge badge-blue">AI Insights</span>
      </div>

      <div className="card-body">
        {visibleRecs.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '16px',
              color: 'var(--text-muted)',
              fontSize: '11px',
            }}
          >
            No further recommendations for this configuration. All deal attachments optimized.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {visibleRecs.map((rec) => (
              <div
                key={rec.id}
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--text)' }}>
                      {rec.name}
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                      {rec.description}
                    </div>
                  </div>
                  {rec.tag && (
                    <span className="badge badge-amber" style={{ fontSize: '9px' }}>
                      {rec.tag}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 600 }}>
                    {rec.revenueDelta} · {rec.marginDelta}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-success btn-xs"
                      onClick={() => onAddRecommendation(rec)}
                    >
                      + Add
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => onDismissRecommendation(rec.id)}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
