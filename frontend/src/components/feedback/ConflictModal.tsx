import React from 'react';

interface ConflictModalProps {
  isOpen: boolean;
  entityName?: string;
  onRefresh: () => void;
  onReviewChanges?: () => void;
  onClose: () => void;
}

export function ConflictModal({
  isOpen,
  entityName = 'This record',
  onRefresh,
  onReviewChanges,
  onClose,
}: ConflictModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay open">
      <div className="modal max-w-md border-amber-500/30">
        <div className="modal-head">
          <div className="modal-title flex items-center gap-2 text-amber-500">
            <span>⚠️</span>
            <span>Concurrent Edit Conflict</span>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body space-y-3">
          <p className="text-xs text-foreground font-medium">
            {entityName} was updated by another team member while you were making changes.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            To maintain data integrity and prevent overwriting approved terms, please refresh to load the latest backend version.
          </p>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-400">
            <strong>HTTP 409 Conflict:</strong> Your draft payload timestamp is older than the current database state.
          </div>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn btn-ghost text-xs" onClick={onClose}>
            Dismiss
          </button>
          {onReviewChanges && (
            <button
              type="button"
              className="btn btn-ghost text-xs"
              onClick={onReviewChanges}
            >
              Review Diff
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary text-xs"
            onClick={() => {
              onRefresh();
              onClose();
            }}
          >
            ↻ Load Latest Version
          </button>
        </div>
      </div>
    </div>
  );
}
