import React, { useState } from 'react';

interface AddNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (noteText: string) => void;
  dealName: string;
  isLoading?: boolean;
}

export const AddNoteDialog: React.FC<AddNoteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  dealName,
  isLoading = false,
}) => {
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) {
      setError('Note content cannot be empty.');
      return;
    }
    setError('');
    onConfirm(note.trim());
    setNote('');
  };

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: '460px' }}>
        <div className="modal-head">
          <div className="modal-title flex items-center gap-2">
            <span>📌</span>
            <span>Add Deal Note</span>
          </div>
          <button className="modal-close" onClick={onClose} disabled={isLoading}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Add a meeting summary, negotiation note, or follow-up task for <strong className="text-foreground">{dealName}</strong>.
            </div>

            <div className="field-group">
              <label className="field-label" style={{ fontSize: '11px', fontWeight: 600 }}>
                Note Details <span style={{ color: 'var(--red)' }}>*</span>
              </label>
              <textarea
                className="field-input w-full"
                style={{
                  minHeight: '100px',
                  resize: 'vertical',
                  borderColor: error ? 'var(--red)' : undefined,
                }}
                placeholder="e.g. Spoke with customer procurement lead. They agreed to 3-year term if payment terms are Net 45."
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  if (error) setError('');
                }}
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
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Add Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
