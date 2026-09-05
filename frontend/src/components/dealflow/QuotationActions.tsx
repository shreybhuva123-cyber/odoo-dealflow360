import React from 'react';

interface QuotationActionsProps {
  onSaveDraft: () => void;
  onSubmitForApproval: () => void;
  isSaving?: boolean;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
}

export function QuotationActions({
  onSaveDraft,
  onSubmitForApproval,
  isSaving = false,
  isSubmitting = false,
  disabled = false,
  className = '',
}: QuotationActionsProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={onSaveDraft}
        disabled={disabled || isSaving}
      >
        {isSaving ? 'Saving...' : 'Save Draft'}
      </button>
      <button
        type="button"
        className="btn btn-primary btn-sm"
        onClick={onSubmitForApproval}
        disabled={disabled || isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
      </button>
    </div>
  );
}
