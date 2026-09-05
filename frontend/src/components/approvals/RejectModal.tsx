import React, { useState } from 'react';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  quoteNumber: string;
  customerName: string;
  isLoading?: boolean;
}

export const RejectModal: React.FC<RejectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  quoteNumber,
  customerName,
  isLoading = false,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A rejection reason is required so the sales representative understands why.');
      return;
    }
    setError('');
    onConfirm(reason.trim());
  };

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: '480px' }}>
        <div className="modal-head">
          <div className="modal-title flex items-center gap-2">
            <span style={{ color: 'var(--red)' }}>✕</span>
            <span>Reject Quotation {quoteNumber}</span>
          </div>
          <button className="modal-close" onClick={onClose} disabled={isLoading}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px',
                fontSize: '12px',
                color: 'var(--red)',
              }}
            >
              ⚠ Rejecting this quotation will set its status to <strong>REJECTED</strong> and notify the sales representative. The customer will not receive this quote.
            </div>

            <div className="field-group">
              <label className="field-label" style={{ fontSize: '12px', fontWeight: 600 }}>
                Reason for Rejection <span style={{ color: 'var(--red)' }}>*</span>
              </label>
              <textarea
                className="field-input"
                style={{
                  width: '100%',
                  minHeight: '90px',
                  resize: 'vertical',
                  borderColor: error ? 'var(--red)' : undefined,
                }}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. Blended margin of 11.5% violates commercial stop-loss policy. Discounts on Hardware line must be renegotiated."
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
              className="btn btn-danger"
              disabled={isLoading}
            >
              {isLoading ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
