import React, { useState } from 'react';
import { ApprovalRequest, Role } from '@/types';
import { ApproveModal } from './ApproveModal';
import { RejectModal } from './RejectModal';
import { ReturnModal } from './ReturnModal';

interface ApprovalActionsProps {
  approval: ApprovalRequest;
  userRole: Role | null;
  userName?: string;
  onApprove: (comment?: string) => void;
  onReject: (reason: string) => void;
  onReturn: (feedback: string) => void;
  isLoading?: boolean;
}

export const ApprovalActions: React.FC<ApprovalActionsProps> = ({
  approval,
  userRole,
  userName = 'Approver',
  onApprove,
  onReject,
  onReturn,
  isLoading = false,
}) => {
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  const isSalesRep = userRole === 'SALES_REP';
  const isAdmin = userRole === 'ADMIN';
  const isSalesManager = userRole === 'SALES_MANAGER';
  const isFinance = userRole === 'FINANCE';

  const isFinalized =
    approval.status === 'APPROVED' ||
    approval.status === 'REJECTED' ||
    approval.status === 'RETURNED' ||
    approval.status === 'PENDING_REVISION';

  // Check if current user is authorized for current step
  const currentStep = approval.steps[approval.currentStepIndex];
  const isManagerStep = currentStep?.roleRequired === 'SALES_MANAGER' || approval.currentStepIndex <= 1;
  const isFinanceStep = currentStep?.roleRequired === 'FINANCE' || approval.currentStepIndex === 2;

  const canAct =
    !isFinalized &&
    (isAdmin ||
      (isSalesManager && isManagerStep) ||
      (isFinance && isFinanceStep));

  return (
    <div className="card mb-6" style={{ background: 'var(--surface)' }}>
      <div className="card-header flex items-center justify-between">
        <div>
          <div className="card-title text-base font-bold">Decision & Action Center</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Submit your governance ruling on quotation {approval.quoteNumber}
          </div>
        </div>
        <span className="badge badge-gray text-xs">
          Role: {userRole?.replace('_', ' ') || 'Guest'}
        </span>
      </div>

      <div className="card-body">
        {/* Sales Rep Notice */}
        {isSalesRep && (
          <div
            style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: '6px',
              padding: '12px 14px',
              fontSize: '12px',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '16px' }}>ℹ️</span>
            <div>
              <strong style={{ display: 'block', marginBottom: '2px' }}>Read-Only View:</strong>
              As a Sales Representative ({userName}), you can inspect the approval progress, discount analysis, and audit log for your quotation, but cannot approve, return, or reject deals.
            </div>
          </div>
        )}

        {/* Finalized Notice */}
        {isFinalized && (
          <div
            style={{
              background:
                approval.status === 'APPROVED'
                  ? 'rgba(16, 185, 129, 0.08)'
                  : approval.status === 'REJECTED'
                  ? 'rgba(239, 68, 68, 0.08)'
                  : 'rgba(245, 158, 11, 0.08)',
              border: `1px solid ${
                approval.status === 'APPROVED'
                  ? 'rgba(16, 185, 129, 0.3)'
                  : approval.status === 'REJECTED'
                  ? 'rgba(239, 68, 68, 0.3)'
                  : 'rgba(245, 158, 11, 0.3)'
              }`,
              borderRadius: '6px',
              padding: '12px 14px',
              fontSize: '12px',
              color:
                approval.status === 'APPROVED'
                  ? 'var(--green)'
                  : approval.status === 'REJECTED'
                  ? 'var(--red)'
                  : 'var(--amber)',
            }}
          >
            <strong>Quotation Status: {approval.status.replace('_', ' ')}</strong> — This quotation has been finalized or returned for revision. No further approvals can be executed at this time.
          </div>
        )}

        {/* Waiting on Other Department */}
        {!isFinalized && !isSalesRep && !canAct && (
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '6px',
              padding: '12px 14px',
              fontSize: '12px',
              color: 'var(--amber)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span>⏳</span>
            <div>
              {isSalesManager && isFinanceStep
                ? 'Manager sign-off completed. Currently awaiting Finance clearance.'
                : isFinance && isManagerStep
                ? 'Awaiting Sales Manager review first before Finance clearance is enabled.'
                : 'Current approval stage is assigned to another review team.'}
            </div>
          </div>
        )}

        {/* Action Controls for Authorized Reviewers */}
        {canAct && (
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Select an action to process quotation <strong>{approval.quoteNumber}</strong> ({approval.customerName}).
              {isManagerStep && ' As Sales Manager, your approval will advance this deal to Finance review.'}
              {isFinanceStep && ' As Finance, your approval will finalize and release this deal.'}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="btn btn-success"
                style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 600 }}
                onClick={() => setShowApproveModal(true)}
                disabled={isLoading}
              >
                <span>✓</span>
                <span>Approve Deal</span>
              </button>

              <button
                type="button"
                className="btn btn-warning"
                style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 600 }}
                onClick={() => setShowReturnModal(true)}
                disabled={isLoading}
              >
                <span>↩</span>
                <span>Return for Revision</span>
              </button>

              <button
                type="button"
                className="btn btn-danger"
                style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 600 }}
                onClick={() => setShowRejectModal(true)}
                disabled={isLoading}
              >
                <span>✕</span>
                <span>Reject Deal</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ApproveModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={(comment) => {
          setShowApproveModal(false);
          onApprove(comment);
        }}
        quoteNumber={approval.quoteNumber}
        customerName={approval.customerName}
        dealValue={approval.dealValue}
        isNextFinance={isManagerStep && (approval.riskLevel === 'HIGH' || approval.discountAppliedPct > 15)}
        isLoading={isLoading}
      />

      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={(reason) => {
          setShowRejectModal(false);
          onReject(reason);
        }}
        quoteNumber={approval.quoteNumber}
        customerName={approval.customerName}
        isLoading={isLoading}
      />

      <ReturnModal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        onConfirm={(feedback) => {
          setShowReturnModal(false);
          onReturn(feedback);
        }}
        quoteNumber={approval.quoteNumber}
        customerName={approval.customerName}
        isLoading={isLoading}
      />
    </div>
  );
};
