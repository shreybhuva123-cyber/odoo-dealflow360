import React from 'react';

interface ProbabilityIndicatorProps {
  probability: number;
  size?: 'sm' | 'md';
  showBar?: boolean;
}

export const ProbabilityIndicator: React.FC<ProbabilityIndicatorProps> = ({
  probability = 0,
  size = 'md',
  showBar = true,
}) => {
  const prob = Math.max(0, Math.min(100, Math.round(probability)));

  const getColor = () => {
    if (prob >= 80) return 'var(--green)';
    if (prob >= 50) return 'var(--accent)';
    if (prob >= 25) return 'var(--amber)';
    return 'var(--text-muted)';
  };

  const color = getColor();

  return (
    <div className="flex items-center gap-1.5" title={`Win Probability: ${prob}%`}>
      <span
        style={{
          fontSize: size === 'sm' ? '11px' : '12px',
          fontWeight: 700,
          color,
          fontFamily: 'monospace',
        }}
      >
        {prob}%
      </span>

      {showBar && (
        <div
          style={{
            width: size === 'sm' ? '36px' : '48px',
            height: '4px',
            borderRadius: '2px',
            background: 'var(--surface3)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${prob}%`,
              height: '100%',
              backgroundColor: color,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      )}
    </div>
  );
};
