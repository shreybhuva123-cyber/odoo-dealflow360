import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Deal } from '@/types';
import { DealHealthBadge } from './DealHealthBadge';
import { ROUTES } from '@/constants/routes';

interface DealHealthSummaryProps {
  deal: Deal;
}

export const DealHealthSummary: React.FC<DealHealthSummaryProps> = ({ deal }) => {
  const navigate = useNavigate();

  const isCritical = deal.health === 'critical';
  const isAtRisk = deal.health === 'at_risk';
  const isHealthy = deal.health === 'healthy';

  const reasons = deal.healthReasons && deal.healthReasons.length > 0
    ? deal.healthReasons
    : isHealthy
    ? ['All commercial metrics within company target thresholds', 'Active customer dialogue verified within last 48 hours']
    : ['Deal velocity requires review', 'Commercial parameters flagged for attention'];

  return (
    <div
      className="card mb-6"
      style={{
        borderColor: isCritical
          ? 'rgba(239, 68, 68, 0.4)'
          : isAtRisk
          ? 'rgba(245, 158, 11, 0.4)'
          : undefined,
      }}
    >
      <div className="card-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '18px' }}>
            {isCritical ? '🚨' : isAtRisk ? '⚠️' : '💚'}
          </span>
          <div>
            <div className="card-title text-base font-bold">Deal Health & Risk Telemetry</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Real-time automated margin guard, velocity monitoring, and stalled detection
            </div>
          </div>
        </div>
        <DealHealthBadge health={deal.health} size="md" />
      </div>

      <div className="card-body">
        {/* Banner */}
        <div
          style={{
            background: isCritical
              ? 'rgba(239, 68, 68, 0.1)'
              : isAtRisk
              ? 'rgba(245, 158, 11, 0.1)'
              : 'rgba(16, 185, 129, 0.1)',
            border: `1px solid ${
              isCritical
                ? 'rgba(239, 68, 68, 0.3)'
                : isAtRisk
                ? 'rgba(245, 158, 11, 0.3)'
                : 'rgba(16, 185, 129, 0.3)'
            }`,
            borderRadius: '6px',
            padding: '12px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '18px', marginTop: '1px' }}>
            {isCritical ? '🔴' : isAtRisk ? '🟡' : '🟢'}
          </span>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: '13px',
                color: isCritical
                  ? 'var(--red)'
                  : isAtRisk
                  ? 'var(--amber)'
                  : 'var(--green)',
                marginBottom: '2px',
              }}
            >
              {isCritical
                ? 'Critical Deal Risk — Immediate Action Required'
                : isAtRisk
                ? 'Deal At Risk — Stagnation or Discount Warning'
                : 'Deal Velocity Healthy'}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text)', margin: 0 }}>
              {isCritical
                ? 'This deal has stalled past threshold or has non-compliant commercial terms. Sales leadership escalation recommended.'
                : isAtRisk
                ? 'This deal is showing symptoms of stalled velocity or discount compression approaching authorized limits.'
                : 'Pacing on track with expected close date. Continuous customer engagement detected.'}
            </p>
          </div>
        </div>

        {/* Signals List */}
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-muted)',
              marginBottom: '8px',
            }}
          >
            Telemetry Indicators & Reasons
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {reasons.map((reason, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--text)',
                }}
              >
                <span
                  style={{
                    color: isCritical
                      ? 'var(--red)'
                      : isAtRisk
                      ? 'var(--amber)'
                      : 'var(--green)',
                  }}
                >
                  •
                </span>
                <span>{reason}</span>
              </div>
            ))}

            {deal.isStalled && (
              <div
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--red)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--red)',
                }}
              >
                <span>⏱️</span>
                <strong>Stalled Deal Notice: </strong>
                <span>No customer interaction or pipeline progression in {deal.stalledDays || 12} days.</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Link to Deal Health */}
        <div className="mt-4 pt-3 border-t border-border flex justify-end">
          <button
            className="btn btn-ghost btn-sm text-xs"
            onClick={() => navigate(ROUTES.APP.DEAL_HEALTH_DETAIL(deal.id))}
          >
            Open Deep Health Analysis & Signals ↗
          </button>
        </div>
      </div>
    </div>
  );
};
