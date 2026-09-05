import React from 'react';

interface MarginThresholds {
  healthy: number; // default 25%
  moderate: number; // default 15%
}

interface MarginIndicatorProps {
  marginPct: number;
  thresholds?: MarginThresholds;
  className?: string;
  showBar?: boolean;
}

export function MarginIndicator({
  marginPct,
  thresholds = { healthy: 25, moderate: 15 },
  className = '',
  showBar = true,
}: MarginIndicatorProps) {
  const clampedMargin = Math.max(0, Math.min(100, marginPct));

  let status: 'Healthy' | 'Moderate' | 'At Risk' = 'Healthy';
  let fillColor = 'var(--green)';
  let textColor = 'text-green';
  let badgeClass = 'badge-green';

  if (clampedMargin >= thresholds.healthy) {
    status = 'Healthy';
    fillColor = 'var(--green)';
    textColor = 'text-green';
    badgeClass = 'badge-green';
  } else if (clampedMargin >= thresholds.moderate) {
    status = 'Moderate';
    fillColor = 'var(--amber)';
    textColor = 'text-amber';
    badgeClass = 'badge-amber';
  } else {
    status = 'At Risk';
    fillColor = 'var(--red)';
    textColor = 'text-red';
    badgeClass = 'badge-red';
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Gross Margin
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.5px' }} className={textColor}>
            {clampedMargin.toFixed(1)}%
          </span>
          <span className={`badge ${badgeClass}`} style={{ fontSize: '9px' }}>
            {status}
          </span>
        </div>
      </div>

      {showBar && (
        <div
          style={{
            height: '6px',
            background: 'var(--surface3)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${clampedMargin}%`,
              height: '100%',
              background: fillColor,
              borderRadius: '3px',
              transition: 'width 0.4s ease, background 0.3s ease',
            }}
          />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: 'var(--text-muted)' }}>
        <span>Floor: {thresholds.moderate}%</span>
        <span>Target: {thresholds.healthy}%+</span>
      </div>
    </div>
  );
}
