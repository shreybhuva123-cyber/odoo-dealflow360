import React from 'react';
import { DealHealth } from '@/types';

interface DealHealthBadgeProps {
  health: DealHealth | string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export const DealHealthBadge: React.FC<DealHealthBadgeProps> = ({
  health,
  size = 'md',
  showLabel = true,
}) => {
  const norm = (health || 'healthy').toLowerCase();

  let badgeClass = 'badge-green';
  let dotColor = '#10B981';
  let text = 'Healthy';

  if (norm === 'critical') {
    badgeClass = 'badge-red';
    dotColor = '#EF4444';
    text = 'Critical';
  } else if (norm === 'at_risk' || norm === 'at-risk') {
    badgeClass = 'badge-amber';
    dotColor = '#F59E0B';
    text = 'At Risk';
  }

  const padding = size === 'sm' ? '2px 8px' : '3px 10px';
  const fontSize = size === 'sm' ? '10px' : '11px';

  return (
    <span
      className={`badge ${badgeClass} inline-flex items-center gap-1.5 font-semibold`}
      style={{
        padding,
        fontSize,
        borderRadius: '9999px',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: size === 'sm' ? '6px' : '7px',
          height: size === 'sm' ? '6px' : '7px',
          borderRadius: '50%',
          backgroundColor: dotColor,
          display: 'inline-block',
          boxShadow: `0 0 5px ${dotColor}`,
        }}
      />
      {showLabel && text}
    </span>
  );
};
