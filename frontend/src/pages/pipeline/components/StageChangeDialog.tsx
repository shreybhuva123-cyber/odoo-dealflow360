import React, { useState } from 'react';
import { DealStage, PIPELINE_STAGES } from '@/types';

interface StageChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newStage: DealStage, reason?: string) => void;
  currentStage: DealStage;
  dealName: string;
  isLoading?: boolean;
}

export const StageChangeDialog: React.FC<StageChangeDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentStage,
  dealName,
  isLoading = false,
}) => {
  const [selectedStage, setSelectedStage] = useState<DealStage>(currentStage);
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(selectedStage, reason);
  };

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: '440px' }}>
        <div className="modal-head">
          <div className="modal-title">Change Deal Stage</div>
          <button className="modal-close" onClick={onClose} disabled={isLoading}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Moving opportunity: <strong className="text-foreground">{dealName}</strong>
            </div>

            <div className="field-group mb-3">
              <label className="field-label" style={{ fontSize: '11px', fontWeight: 600 }}>
                Target Pipeline Stage
              </label>
              <select
                className="field-input w-full"
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value as DealStage)}
                disabled={isLoading}
              >
                {PIPELINE_STAGES.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name} ({stage.defaultProbability}% default prob)
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label className="field-label" style={{ fontSize: '11px', fontWeight: 600 }}>
                Transition Justification / Reason (Optional)
              </label>
              <textarea
                className="field-input w-full"
                style={{ minHeight: '70px', resize: 'vertical' }}
                placeholder="e.g. Budget signed off by CFO; moved to contract negotiation."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
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
              className="btn btn-primary"
              disabled={isLoading || selectedStage === currentStage}
            >
              {isLoading ? 'Updating...' : 'Change Stage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
