import React, { useState } from 'react';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (feedback: string) => void;
  quoteNumber: string;
  customerName: string;
  isLoading?: boolean;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  quoteNumber,
  customerName,
  isLoading = false,
}) => {
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setError('Revision instructions are required so the sales rep knows what to change.');
      return;
    }
    setError('');
    onConfirm(feedback.trim());
  };

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: '480px' }}>
        <div className="modal-head">
          <div className="modal-title flex items-center gap-2">
            <span style={{ color: 'var(--amber)' }}>↩</span>
            <span>Return for Revision — {quoteNumber}</span>
          </div>
          <button className="modal-close" onClick={onClose} disabled={isLoading}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px',
                fontSize: '12px',
                color: 'var(--amber)',
              }}
            >
              ↩ Returning this quote will set its status to <strong>PENDING REVISION</strong>. The sales rep can edit pricing and discounts, then resubmit for approval.
            </div>

            <div className="field-group">
              <label className="field-label" style={{ fontSize: '12px', fontWeight: 600 }}>
                Instructions for Sales Rep <span style={{ color: 'var(--red)' }}>*</span>
              </label>
              <textarea
                className="field-input"
                style={{
                  width: '100%',
                  minHeight: '90px',
                  resize: 'vertical',
                  borderColor: error ? 'var(--red)' : undefined,
                }}
                value={feedback}
                onChange={(e) => {
                  setFeedback(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. Please reduce Setup & Deploy discount from 18% to ≤10%. Maintain CloudBase discount at 15% to protect overall gross margin."
                disabled={isLoading}
              />
              {error && (
                <div style={{ color: 'var(--red)', fontSize: '11px', marginTop: '4px' }}>
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="modal-foot flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-warning"
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Return for Revision'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
