import React, { useState } from 'react';
import { Deal, DealStage, PIPELINE_STAGES } from '@/types';

interface NewDealDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: Partial<Deal>) => void;
  isLoading?: boolean;
}

const CUSTOMER_OPTIONS = [
  { id: 'cust_acme', name: 'Acme Corporation', tier: 'GOLD' as const },
  { id: 'cust_vertex', name: 'Vertex LLC', tier: 'GOLD' as const },
  { id: 'cust_beta', name: 'Beta Industries', tier: 'SILVER' as const },
  { id: 'cust_peaksoft', name: 'PeakSoft Ltd', tier: 'SILVER' as const },
  { id: 'cust_nova', name: 'Nova Ltd', tier: 'BRONZE' as const },
];

const SALES_REPS = [
  { id: 'usr_rep_rahul', name: 'Rahul Sharma' },
  { id: 'usr_rep_alex', name: 'Alex Morgan' },
  { id: 'usr_rep_sarah', name: 'Sarah Jenkins' },
  { id: 'usr_rep_patel', name: 'S. Patel' },
  { id: 'usr_rep_liu', name: 'J. Liu' },
];

export const NewDealDialog: React.FC<NewDealDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [customerId, setCustomerId] = useState(CUSTOMER_OPTIONS[0].id);
  const [value, setValue] = useState(500000);
  const [stage, setStage] = useState<DealStage>('lead');
  const [ownerId, setOwnerId] = useState(SALES_REPS[0].id);
  const [expectedCloseDate, setExpectedCloseDate] = useState('2026-10-31');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Opportunity name is required.');
      return;
    }

    const customer = CUSTOMER_OPTIONS.find((c) => c.id === customerId);
    const owner = SALES_REPS.find((r) => r.id === ownerId);
    const stageConfig = PIPELINE_STAGES.find((s) => s.id === stage);

    setError('');
    onConfirm({
      name: name.trim(),
      customerId: customer?.id || 'cust_acme',
      customerName: customer?.name || 'Acme Corporation',
      customerTier: customer?.tier || 'GOLD',
      ownerId: owner?.id || 'usr_rep_alex',
      ownerName: owner?.name || 'Alex Morgan',
      stage,
      value: Number(value) || 100000,
      probability: stageConfig?.defaultProbability || 20,
      expectedCloseDate,
    });
  };

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: '500px' }}>
        <div className="modal-head">
          <div className="modal-title flex items-center gap-2">
            <span>🚀</span>
            <span>Create New Deal Opportunity</span>
          </div>
          <button className="modal-close" onClick={onClose} disabled={isLoading}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-3">
            <div className="field-group">
              <label className="field-label" style={{ fontSize: '11px', fontWeight: 600 }}>
                Deal Name <span style={{ color: 'var(--red)' }}>*</span>
              </label>
              <input
                type="text"
                className="field-input w-full"
                placeholder="e.g. Acme Enterprise SaaS Suite Expansion"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                disabled={isLoading}
              />
              {error && (
                <div style={{ color: 'var(--red)', fontSize: '11px', marginTop: '3px' }}>
                  {error}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="field-group">
                <label className="field-label" style={{ fontSize: '11px', fontWeight: 600 }}>
                  Customer Account
                </label>
                <select
                  className="field-input w-full"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  disabled={isLoading}
                >
                  {CUSTOMER_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.tier})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label className="field-label" style={{ fontSize: '11px', fontWeight: 600 }}>
                  Estimated Value ($)
                </label>
                <input
                  type="number"
                  className="field-input w-full"
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="field-group">
                <label className="field-label" style={{ fontSize: '11px', fontWeight: 600 }}>
                  Initial Stage
                </label>
                <select
                  className="field-input w-full"
                  value={stage}
                  onChange={(e) => setStage(e.target.value as DealStage)}
                  disabled={isLoading}
                >
                  {PIPELINE_STAGES.filter((s) => s.id !== 'lost').map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.defaultProbability}%)
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label className="field-label" style={{ fontSize: '11px', fontWeight: 600 }}>
                  Assigned Owner
                </label>
                <select
                  className="field-input w-full"
                  value={ownerId}
                  onChange={(e) => setOwnerId(e.target.value)}
                  disabled={isLoading}
                >
                  {SALES_REPS.map((rep) => (
                    <option key={rep.id} value={rep.id}>
                      {rep.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" style={{ fontSize: '11px', fontWeight: 600 }}>
                Target Expected Close Date
              </label>
              <input
                type="date"
                className="field-input w-full"
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
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
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Opportunity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
