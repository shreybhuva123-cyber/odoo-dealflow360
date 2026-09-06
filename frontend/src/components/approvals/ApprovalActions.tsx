import React, { useState } from 'react';
import { ApprovalRequest, Role } from '@/types';
import { ApproveModal } from './ApproveModal';
import { RejectModal } from './RejectModal';
import { ReturnModal } from './ReturnModal';

interface ApprovalActionsProps {
  approval: ApprovalRequest;
  userRole: Role | null;
  userName?: string;
  onApprove: (comment?: string, approverName?: string, role?: string) => void;
  onReject: (reason: string, approverName?: string, role?: string) => void;
  onReturn: (feedback: string, approverName?: string, role?: string) => void;
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

  // Selected acting persona (defaults to current user role or auto-switched)
  const [activePersona, setActivePersona] = useState<{ name: string; role: Role } | null>(null);

  const effectiveRole = activePersona?.role || userRole;
  const effectiveName = activePersona?.name || userName;

  const isSalesRep = effectiveRole === 'SALES_REP';
  const isAdmin = effectiveRole === 'ADMIN';
  const isSalesManager = effectiveRole === 'SALES_MANAGER';
  const isFinance = effectiveRole === 'FINANCE';

  const isFinalized =
    approval.status === 'APPROVED' ||
    approval.status === 'REJECTED' ||
    approval.status === 'RETURNED' ||
    approval.status === 'PENDING_REVISION';

  // Current step analysis
  const currentStep = approval.steps[approval.currentStepIndex];
  const isManagerStep = currentStep?.roleRequired === 'SALES_MANAGER' || approval.currentStepIndex <= 1;
  const isFinanceStep = currentStep?.roleRequired === 'FINANCE' || approval.currentStepIndex === 2;

  const canAct =
    !isFinalized &&
    (isAdmin ||
      (isSalesManager && isManagerStep) ||
      (isFinance && isFinanceStep));

  const needsFinanceLater =
    isManagerStep &&
    (approval.riskLevel === 'HIGH' ||
      approval.riskScore >= 50 ||
      approval.discountAppliedPct > 15 ||
      approval.marginPct < 20);

  return (
    <div className="card mb-6" style={{ background: 'var(--surface)' }}>
      <div className="card-header flex items-center justify-between">
        <div>
          <div className="card-title text-base font-bold">Decision & Action Center</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Submit governance ruling on quotation {approval.quoteNumber}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-gray text-xs">
            Role: {effectiveRole?.replace('_', ' ') || 'Guest'}
          </span>
          {activePersona && (
            <span className="badge badge-blue text-xs">Simulated: {activePersona.name}</span>
          )}
        </div>
      </div>

      <div className="card-body">
        {/* Quick Persona Switcher for Smooth Testing & Demos */}
        {!isFinalized && (
          <div
            className="mb-4 p-3 rounded-lg border flex flex-wrap items-center justify-between gap-3"
            style={{
              background: 'rgba(59, 130, 246, 0.04)',
              borderColor: 'rgba(59, 130, 246, 0.2)',
            }}
          >
            <div className="text-xs">
              <span className="font-semibold text-foreground">Governance Review Persona:</span>
              <span className="text-muted-foreground ml-1">
                (Click to act as an authorized decision maker)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={`btn btn-xs ${
                  effectiveRole === 'SALES_MANAGER' ? 'btn-primary' : 'btn-ghost'
                }`}
                onClick={() =>
                  setActivePersona({ name: 'Maria Chen', role: 'SALES_MANAGER' })
                }
              >
                👤 Sales Manager (Maria Chen)
              </button>

              <button
                type="button"
                className={`btn btn-xs ${
                  effectiveRole === 'FINANCE' ? 'btn-primary' : 'btn-ghost'
                }`}
                onClick={() =>
                  setActivePersona({ name: 'David Park', role: 'FINANCE' })
                }
              >
                💼 Finance Manager (David Park)
              </button>

              <button
                type="button"
                className={`btn btn-xs ${
                  effectiveRole === 'ADMIN' ? 'btn-primary' : 'btn-ghost'
                }`}
                onClick={() =>
                  setActivePersona({ name: 'System Admin', role: 'ADMIN' })
                }
              >
                ⚡ Executive Admin
              </button>
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
            <strong>Quotation Status: {approval.status.replace('_', ' ')}</strong> — This quotation
            has reached a terminal or revision state.
          </div>
        )}

        {/* Current Workflow Guidance */}
        {!isFinalized && (
          <div className="mb-4">
            {isManagerStep && (
              <div
                style={{
                  background: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  fontSize: '12px',
                  color: 'var(--accent)',
                }}
              >
                <strong>Stage 1: Sales Manager Review</strong> — {needsFinanceLater
                  ? '⚠️ Higher risk threshold triggered (risk/discount/margin). Sales Manager approval will advance this deal to Finance Review.'
                  : 'Standard risk level. Sales Manager approval will immediately finalize quotation for customer release.'}
              </div>
            )}

            {isFinanceStep && (
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  fontSize: '12px',
                  color: 'var(--amber)',
                }}
              >
                <strong>Stage 2: Finance Manager Review</strong> — Sales Manager has approved.
                Finance Manager sign-off is required to release this high-value/discounted quote.
              </div>
            )}
          </div>
        )}

        {/* Action Controls for Authorized Reviewers */}
        {canAct && (
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Acting as <strong>{effectiveName}</strong> ({effectiveRole?.replace('_', ' ')}): Select
              an action to process quotation <strong>{approval.quoteNumber}</strong>.
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
                <span>
                  {isAdmin
                    ? 'Executive Approve (Finalize)'
                    : isManagerStep && needsFinanceLater
                    ? 'Approve & Route to Finance'
                    : 'Approve & Release to Customer'}
                </span>
              </button>

              <button
                type="button"
                className="btn btn-warning"
                style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 600 }}
                onClick={() => setShowReturnModal(true)}
                disabled={isLoading}
              >
                <span>↩</span>
                <span>Return to Sales Rep</span>
              </button>

              <button
                type="button"
                className="btn btn-danger"
                style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 600 }}
                onClick={() => setShowRejectModal(true)}
                disabled={isLoading}
              >
                <span>✕</span>
                <span>Reject Quotation</span>
              </button>
            </div>
          </div>
        )}

        {/* Rep Guidance if currently in Rep mode and not switched */}
        {!isFinalized && isSalesRep && !canAct && (
          <div className="text-xs text-muted-foreground mt-2">
            Tip: Click <strong>"Sales Manager"</strong> or <strong>"Finance Manager"</strong> above to test approving this quotation.
          </div>
        )}
      </div>

      {/* Modals */}
      <ApproveModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={(comment) => {
          setShowApproveModal(false);
          onApprove(comment, effectiveName, effectiveRole || 'SALES_MANAGER');
        }}
        quoteNumber={approval.quoteNumber}
        customerName={approval.customerName}
        dealValue={approval.dealValue}
        isNextFinance={needsFinanceLater}
        isLoading={isLoading}
      />

      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={(reason) => {
          setShowRejectModal(false);
          onReject(reason, effectiveName, effectiveRole || 'SALES_MANAGER');
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
          onReturn(feedback, effectiveName, effectiveRole || 'SALES_MANAGER');
        }}
        quoteNumber={approval.quoteNumber}
        customerName={approval.customerName}
        isLoading={isLoading}
      />
    </div>
  );
};
