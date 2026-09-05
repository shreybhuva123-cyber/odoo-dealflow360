import React, { useState } from 'react';

export interface RiskFactor {
  title: string;
  detail: string;
  allowed?: string;
  current?: string;
}

interface RiskIndicatorProps {
  score: number; // 0 - 100
  factors?: RiskFactor[];
  discountTotal?: number;
  overallMarginPct?: number;
  categoryViolations?: string[];
  className?: string;
}

export function RiskIndicator({
  score,
  factors,
  discountTotal = 420,
  overallMarginPct = 18,
  categoryViolations = ['Service discount: 18% (Allowed: 10%)'],
  className = '',
}: RiskIndicatorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  let category: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  let barColor = 'var(--green)';
  let textColor = 'var(--green)';
  let badgeClass = 'badge-green';

  if (clampedScore > 60) {
    category = 'HIGH';
    barColor = 'var(--red)';
    textColor = 'var(--red)';
    badgeClass = 'badge-red';
  } else if (clampedScore > 25) {
    category = 'MEDIUM';
    barColor = 'var(--amber)';
    textColor = 'var(--amber)';
    badgeClass = 'badge-amber';
  }

  // Generate dynamic explanations if none explicitly provided
  const riskExplanations: RiskFactor[] =
    factors && factors.length > 0
      ? factors
      : [
          ...(categoryViolations.length > 0
            ? categoryViolations.map((v) => ({
                title: 'Category Ceiling Breach',
                detail: v,
              }))
            : []),
          ...(overallMarginPct < 20
            ? [
                {
                  title: 'Margin Compression',
                  detail: `Current margin is ${overallMarginPct.toFixed(1)}% (Target baseline: 20%+)`,
                },
              ]
            : []),
          {
            title: 'Commercial Discount Exposure',
            detail: `Total deal discount impact is -$${discountTotal.toLocaleString()}`,
          },
        ];

  // Circumference for radial circle (r=40 -> 2 * PI * 40 ≈ 251.2)
  const strokeDashoffset = 251.2 - (clampedScore / 100) * 251.2;

  return (
    <>
      <div
        className={`card p-4 cursor-pointer transition-all hover:border-blue-500/60 ${className}`}
        onClick={() => setIsModalOpen(true)}
        title="Click to view full AI risk breakdown"
        style={{ background: 'var(--surface)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Deal Risk Score
          </span>
          <span className={`badge ${badgeClass}`}>{category} RISK</span>
        </div>

        {/* Radial and Score View */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ position: 'relative', width: '64px', height: '64px', flexShrink: 0 }}>
            <svg width="64" height="64" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="var(--surface3)"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={barColor}
                strokeWidth="10"
                strokeDasharray="251.2"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '16px', fontWeight: 800, color: textColor, lineHeight: 1 }}>
                {clampedScore}
              </div>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
              {clampedScore} <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/ 100</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
              {clampedScore > 60
                ? '⚠ Sales Manager + Finance approval required'
                : clampedScore > 25
                ? '⚠ Sales Manager sign-off needed'
                : '✓ Auto-approved within standard rep authority'}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 600, marginTop: '4px' }}>
              Why is this deal risky? →
            </div>
          </div>
        </div>
      </div>

      {/* Slide-over / Modal: "Why is this deal risky?" */}
      {isModalOpen && (
        <div className="modal-overlay open" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '440px' }}
          >
            <div className="modal-head">
              <div>
                <div className="modal-title">Why is this deal risky?</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Risk Score: <strong style={{ color: textColor }}>{clampedScore} / 100 ({category})</strong>
                </div>
              </div>
              <button
                className="modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '12px' }}>
                DealFlow360 evaluates blended risk across category ceilings, customer credit tier, and gross margin floors:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {riskExplanations.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'var(--surface2)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <span style={{ fontSize: '12px' }}>
                        {index === 0 && category === 'HIGH' ? '🔴' : '⚠️'}
                      </span>
                      <strong style={{ fontSize: '12px', color: 'var(--text)' }}>
                        {index + 1}. {item.title}
                      </strong>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', paddingLeft: '18px' }}>
                      {item.detail}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: '16px',
                  background: 'var(--surface3)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  fontSize: '11px',
                  color: 'var(--text-dim)',
                }}
              >
                💡 <em>Tip: Adding high-margin AI recommendations (e.g. Support or Warranty) raises the blended margin and reduces deal risk.</em>
              </div>
            </div>
            <div className="modal-foot">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIsModalOpen(false)}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
