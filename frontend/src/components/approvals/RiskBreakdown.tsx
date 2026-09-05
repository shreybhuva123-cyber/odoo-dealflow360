import React from 'react';
import { RiskFactor, ApprovalRiskLevel } from '@/types';
import { PriorityRiskBadge } from './PriorityRiskBadge';

interface RiskBreakdownProps {
  riskScore: number;
  riskLevel: ApprovalRiskLevel | string;
  riskFactors: RiskFactor[];
  triggerReason?: string;
  approvalStage?: string;
}

export const RiskBreakdown: React.FC<RiskBreakdownProps> = ({
  riskScore,
  riskLevel,
  riskFactors = [],
  triggerReason,
  approvalStage,
}) => {
  const isHighRisk = (riskLevel || '').toUpperCase() === 'HIGH' || riskScore >= 60;
  const isMediumRisk = (riskLevel || '').toUpperCase() === 'MEDIUM' || (riskScore >= 30 && riskScore < 60);

  return (
    <div className="card mb-6" style={{ borderColor: isHighRisk ? 'rgba(239, 68, 68, 0.4)' : undefined }}>
      <div className="card-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div>
            <div className="card-title text-base font-bold flex items-center gap-2">
              Why Does This Need Approval?
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Automated deal governance and policy compliance breakdown
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>DEAL RISK SCORE</div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: isHighRisk ? 'var(--red)' : isMediumRisk ? 'var(--amber)' : 'var(--green)',
              }}
            >
              {riskScore}/100
            </div>
          </div>
          <PriorityRiskBadge level={riskLevel} size="md" />
        </div>
      </div>

      <div className="card-body">
        {/* Compliance Trigger Banner */}
        <div
          style={{
            background: isHighRisk ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            border: `1px solid ${isHighRisk ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            borderRadius: '6px',
            padding: '12px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '16px', color: isHighRisk ? 'var(--red)' : 'var(--amber)', marginTop: '1px' }}>
            {isHighRisk ? '🚨' : '⚡'}
          </span>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: '12px',
                color: isHighRisk ? 'var(--red)' : 'var(--amber)',
                marginBottom: '2px',
              }}
            >
              {isHighRisk ? 'Critical Approval Gate Triggered' : 'Governance Review Recommended'}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text)', margin: 0 }}>
              {triggerReason ||
                'Discounts exceed standard salesperson authority. Approval required before customer dispatch.'}
            </p>
            {approvalStage && (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Current Review Level: <strong style={{ color: 'var(--text)' }}>{approvalStage}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Breakdown Factors List */}
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-muted)',
              marginBottom: '10px',
            }}
          >
            Triggered Governance Rules ({riskFactors.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {riskFactors.map((factor) => {
              const fHigh = factor.severity === 'HIGH';
              const fMed = factor.severity === 'MEDIUM';

              return (
                <div
                  key={factor.id}
                  style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    borderLeft: `4px solid ${fHigh ? 'var(--red)' : fMed ? 'var(--amber)' : 'var(--green)'}`,
                    borderRadius: '6px',
                    padding: '10px 14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text)' }}>
                      {factor.title}
                    </div>
                    <span
                      className={`badge ${fHigh ? 'badge-red' : fMed ? 'badge-amber' : 'badge-green'}`}
                      style={{ fontSize: '10px', padding: '1px 6px' }}
                    >
                      {factor.severity} RISK
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    {factor.detail}
                  </div>
                  {factor.impact && (
                    <div style={{ fontSize: '11px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Commercial Impact:</span>
                      <span>{factor.impact}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
