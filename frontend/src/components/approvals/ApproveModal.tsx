import React, { useState } from 'react';

interface ApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
  quoteNumber: string;
  customerName: string;
  dealValue: number;
  isNextFinance: boolean;
  isLoading?: boolean;
}

export const ApproveModal: React.FC<ApproveModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  quoteNumber,
  customerName,
  dealValue,
  isNextFinance,
  isLoading = false,
}) => {
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(comment);
  };

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: '480px' }}>
        <div className="modal-head">
          <div className="modal-title flex items-center gap-2">
            <span style={{ color: 'var(--green)' }}>✓</span>
            <span>Approve Quotation {quoteNumber}</span>
          </div>
          <button className="modal-close" onClick={onClose} disabled={isLoading}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Customer</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>
                  {customerName}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Value</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>
                  ${dealValue.toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Next Progression</span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: isNextFinance ? 'var(--amber)' : 'var(--green)',
                  }}
                >
                  {isNextFinance ? 'Forward to Finance Review' : 'Final Order Release (Approved)'}
                </span>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" style={{ fontSize: '12px', fontWeight: 600 }}>
                Approval Note (Optional)
              </label>
              <textarea
                className="field-input"
                style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g. Approved given competitive pressure and strategic account value."
                disabled={isLoading}
              />
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
              className="btn btn-success"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Confirm Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
