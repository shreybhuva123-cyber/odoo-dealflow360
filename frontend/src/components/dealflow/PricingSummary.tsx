import React, { useState } from 'react';
import { QuotationSummary } from '@/types';
import { MarginIndicator } from './MarginIndicator';

interface PricingSummaryProps {
  quoteNumber: string;
  summary: QuotationSummary;
  riskScore: number;
  approvalRequired: boolean;
  onSaveDraft: () => void;
  onSubmitForApproval: () => void;
  isSaving?: boolean;
  isSubmitting?: boolean;
  className?: string;
}

export function PricingSummary({
  quoteNumber,
  summary,
  riskScore,
  approvalRequired,
  onSaveDraft,
  onSubmitForApproval,
  isSaving = false,
  isSubmitting = false,
  className = '',
}: PricingSummaryProps) {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleSubmitClick = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = () => {
    setIsConfirmModalOpen(false);
    onSubmitForApproval();
  };

  return (
    <>
      <div className={`card ${className}`} style={{ background: 'var(--surface)' }}>
        <div className="card-header">
          <div className="card-title">QUOTE SUMMARY</div>
          <span className="font-mono text-xs text-accent font-bold">{quoteNumber}</span>
        </div>

        <div className="card-body">
          {/* Commercial Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            <div className="invoice-row">
              <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>${summary.subtotal.toLocaleString()}</span>
            </div>
            <div className="invoice-row">
              <span style={{ color: 'var(--text-muted)' }}>Discount Total</span>
              <span style={{ fontWeight: 600, color: 'var(--red)' }}>
                -${summary.discountTotal.toLocaleString()}
              </span>
            </div>
            <div className="invoice-row">
              <span style={{ color: 'var(--text-muted)' }}>Tax (18% GST/VAT)</span>
              <span style={{ fontWeight: 600 }}>${summary.taxTotal.toLocaleString()}</span>
            </div>
            <div
              className="invoice-row"
              style={{
                borderTop: '1px solid var(--border)',
                borderBottom: 'none',
                paddingTop: '10px',
                marginTop: '4px',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '13px' }}>Grand Total</span>
              <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--accent)' }}>
                ${summary.grandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Margin Indicator */}
          <div style={{ padding: '10px 0', borderTop: '1px solid var(--border)' }}>
            <MarginIndicator marginPct={summary.overallMarginPct} />
          </div>

          {/* Risk Indicator Score */}
          <div
            style={{
              padding: '10px 0',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
              Blended Risk
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: '14px',
                  color: riskScore > 60 ? 'var(--red)' : riskScore > 25 ? 'var(--amber)' : 'var(--green)',
                }}
              >
                {riskScore} / 100
              </span>
              <span
                className={`badge ${
                  riskScore > 60 ? 'badge-red' : riskScore > 25 ? 'badge-amber' : 'badge-green'
                }`}
                style={{ fontSize: '9px' }}
              >
                {riskScore > 60 ? 'HIGH' : riskScore > 25 ? 'MEDIUM' : 'LOW'}
              </span>
            </div>
          </div>

          {/* Approval Requirement Warning */}
          {approvalRequired && (
            <div
              style={{
                background: 'var(--amber-dim)',
                border: '1px solid var(--amber)',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '11px',
                color: 'var(--amber)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '10px',
                marginBottom: '14px',
              }}
            >
              <span>⚠</span>
              <span>Approval Required: Discount ceiling or margin breach detected</span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            <button
              type="button"
              className="btn btn-ghost w-full"
              style={{ justifyContent: 'center', padding: '9px 0' }}
              onClick={onSaveDraft}
              disabled={isSaving}
            >
              {isSaving ? 'Saving Draft...' : 'Save Draft'}
            </button>
            <button
              type="button"
              className="btn btn-primary w-full"
              style={{ justifyContent: 'center', padding: '9px 0' }}
              onClick={handleSubmitClick}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="modal-overlay open" onClick={() => setIsConfirmModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-head">
              <div className="modal-title">Submit Quotation for Review?</div>
              <button className="modal-close" onClick={() => setIsConfirmModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '14px',
                  marginBottom: '14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Quotation #</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{quoteNumber}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Amount</span>
                  <span style={{ fontWeight: 800, fontSize: '14px' }}>${summary.grandTotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Net Margin</span>
                  <span style={{ fontWeight: 700, color: 'var(--green)' }}>{summary.overallMarginPct.toFixed(1)}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Deal Risk</span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: riskScore > 60 ? 'var(--red)' : riskScore > 25 ? 'var(--amber)' : 'var(--green)',
                    }}
                  >
                    {riskScore} / 100 ({riskScore > 60 ? 'HIGH' : riskScore > 25 ? 'MEDIUM' : 'LOW'})
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', lineHeight: 1.4 }}>
                {riskScore > 60
                  ? 'This quotation breaches standard category discount guidelines and requires managerial and finance authorization before dispatch.'
                  : 'This quotation will be routed into the managerial queue for commercial sign-off.'}
              </div>
            </div>
            <div className="modal-foot">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setIsConfirmModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmSubmit}
              >
                Submit Quotation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
