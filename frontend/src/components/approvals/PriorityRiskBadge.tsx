import React from 'react';
import { ApprovalRiskLevel } from '@/types';

interface PriorityRiskBadgeProps {
  level: ApprovalRiskLevel | string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const PriorityRiskBadge: React.FC<PriorityRiskBadgeProps> = ({
  level,
  size = 'md',
  showLabel = true,
}) => {
  const norm = (level || 'LOW').toUpperCase();

  let badgeClass = 'badge-green';
  let dotColor = '#10B981';
  let text = 'LOW';

  if (norm === 'HIGH') {
    badgeClass = 'badge-red';
    dotColor = '#EF4444';
    text = 'HIGH';
  } else if (norm === 'MEDIUM') {
    badgeClass = 'badge-amber';
    dotColor = '#F59E0B';
    text = 'MEDIUM';
  }

  const padding = size === 'sm' ? '2px 8px' : size === 'lg' ? '6px 14px' : '4px 10px';
  const fontSize = size === 'sm' ? '10px' : size === 'lg' ? '13px' : '11px';

  return (
    <span
      className={`badge ${badgeClass} inline-flex items-center gap-1.5 font-bold tracking-wider`}
      style={{
        padding,
        fontSize,
        textTransform: 'uppercase',
        borderRadius: '9999px',
        boxShadow: norm === 'HIGH' ? '0 0 10px rgba(239, 68, 68, 0.25)' : undefined,
      }}
    >
      <span
        style={{
          width: size === 'sm' ? '6px' : '7px',
          height: size === 'sm' ? '6px' : '7px',
          borderRadius: '50%',
          backgroundColor: dotColor,
          display: 'inline-block',
          boxShadow: `0 0 6px ${dotColor}`,
        }}
      />
      {showLabel && `RISK: ${text}`}
    </span>
  );
};
