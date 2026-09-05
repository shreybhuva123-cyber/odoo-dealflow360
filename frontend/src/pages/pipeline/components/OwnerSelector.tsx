import React, { useState } from 'react';

interface OwnerOption {
  id: string;
  name: string;
  role: string;
}

const SALES_TEAM: OwnerOption[] = [
  { id: 'usr_rep_rahul', name: 'Rahul Sharma', role: 'Enterprise Account Executive' },
  { id: 'usr_rep_alex', name: 'Alex Morgan', role: 'Senior Sales Representative' },
  { id: 'usr_rep_sarah', name: 'Sarah Jenkins', role: 'SaaS Account Specialist' },
  { id: 'usr_rep_patel', name: 'S. Patel', role: 'Enterprise Account Executive' },
  { id: 'usr_rep_liu', name: 'J. Liu', role: 'Technical Sales Specialist' },
];

interface OwnerSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (ownerId: string, ownerName: string) => void;
  currentOwnerName: string;
  dealName: string;
  isLoading?: boolean;
}

export const OwnerSelector: React.FC<OwnerSelectorProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentOwnerName,
  dealName,
  isLoading = false,
}) => {
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>(
    SALES_TEAM.find((o) => o.name === currentOwnerName)?.id || SALES_TEAM[0].id
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const owner = SALES_TEAM.find((o) => o.id === selectedOwnerId);
    if (owner) {
      onConfirm(owner.id, owner.name);
    }
  };

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: '420px' }}>
        <div className="modal-head">
          <div className="modal-title">Reassign Opportunity Owner</div>
          <button className="modal-close" onClick={onClose} disabled={isLoading}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Select a new representative for <strong className="text-foreground">{dealName}</strong>.
            </div>

            <div className="field-group">
              <label className="field-label" style={{ fontSize: '11px', fontWeight: 600 }}>
                Sales Representative
              </label>
              <select
                className="field-input w-full"
                value={selectedOwnerId}
                onChange={(e) => setSelectedOwnerId(e.target.value)}
                disabled={isLoading}
              >
                {SALES_TEAM.map((rep) => (
                  <option key={rep.id} value={rep.id}>
                    {rep.name} — {rep.role}
                  </option>
                ))}
              </select>
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
              disabled={isLoading}
            >
              {isLoading ? 'Reassigning...' : 'Confirm Reassignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
