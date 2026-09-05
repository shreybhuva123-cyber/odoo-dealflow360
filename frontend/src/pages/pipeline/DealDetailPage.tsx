import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useDeal,
  useUpdateDealStage,
  useUpdateDealOwner,
  useAddDealNote,
} from '@/hooks/usePipeline';
import { useAuthStore } from '@/stores/auth.store';
import {
  DealHealthBadge,
  DealOverview,
  DealHealthSummary,
  DealActivityTimeline,
  RelatedQuotes,
  StageChangeDialog,
  OwnerSelector,
  AddNoteDialog,
} from './components';
import { PIPELINE_STAGES, DealStage } from '@/types';
import { ROUTES } from '@/constants/routes';

type TabKey = 'overview' | 'activity' | 'quotes' | 'health';

export function DealDetailPage() {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);

  const isManager = role === 'SALES_MANAGER' || role === 'ADMIN';

  const { data: deal, isLoading, error } = useDeal(dealId);
  const updateStageMutation = useUpdateDealStage();
  const updateOwnerMutation = useUpdateDealOwner();
  const addNoteMutation = useAddDealNote();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
  const [isOwnerDialogOpen, setIsOwnerDialogOpen] = useState(false);
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center py-24">
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
        <div className="text-base font-semibold text-foreground">Loading Deal Workspace...</div>
        <div className="text-xs text-muted-foreground mt-1">
          Retrieving opportunity metrics, quote links, and activity telemetry
        </div>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center py-24">
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
        <div className="text-base font-semibold text-foreground">Deal Opportunity Not Found</div>
        <div className="text-xs text-muted-foreground mt-1 mb-6">
          Could not locate deal identifier "{dealId}".
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate(ROUTES.APP.PIPELINE)}
        >
          ← Return to Pipeline
        </button>
      </div>
    );
  }

  const stageConfig = PIPELINE_STAGES.find((s) => s.id === deal.stage);

  const handleStageChange = (newStage: DealStage, reason?: string) => {
    setIsStageDialogOpen(false);
    updateStageMutation.mutate({
      dealId: deal.id,
      stage: newStage,
      reason,
      authorName: user?.name || 'Alex Morgan',
      authorRole: role?.replace('_', ' ') || 'Sales Representative',
    });
  };

  const handleOwnerChange = (newOwnerId: string, newOwnerName: string) => {
    setIsOwnerDialogOpen(false);
    updateOwnerMutation.mutate({
      dealId: deal.id,
      newOwnerId,
      newOwnerName,
      reassignedBy: user?.name || 'Sales Manager',
    });
  };

  const handleAddNote = (noteText: string) => {
    setIsAddNoteDialogOpen(false);
    addNoteMutation.mutate({
      dealId: deal.id,
      noteText,
      authorName: user?.name || 'Alex Morgan',
      authorRole: role?.replace('_', ' ') || 'Sales Representative',
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link
              to={ROUTES.APP.PIPELINE}
              className="hover:text-accent transition-colors flex items-center gap-1"
            >
              <span>← Pipeline</span>
            </Link>
            <span>/</span>
            <span className="text-foreground font-mono font-bold">{deal.id}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              {deal.name}
            </h1>
            <span
              className={`badge ${stageConfig?.badgeClass || 'badge-gray'} text-xs capitalize`}
            >
              {stageConfig?.name || deal.stage}
            </span>
            <DealHealthBadge health={deal.health} size="md" />
            <span className="font-mono font-extrabold text-lg text-accent">
              ${deal.value.toLocaleString()}
            </span>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Account: <strong style={{ color: 'var(--text)' }}>{deal.customerName}</strong> ({deal.customerTier || 'Standard'}) · Owner: <strong style={{ color: 'var(--text)' }}>{deal.ownerName}</strong> · Probability: <strong style={{ color: 'var(--accent)' }}>{deal.probability}%</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="btn btn-ghost btn-sm text-xs"
            onClick={() => setIsStageDialogOpen(true)}
            disabled={updateStageMutation.isPending}
          >
            🔀 Change Stage
          </button>

          {isManager && (
            <button
              className="btn btn-ghost btn-sm text-xs"
              onClick={() => setIsOwnerDialogOpen(true)}
              disabled={updateOwnerMutation.isPending}
            >
              👤 Change Owner
            </button>
          )}

          <button
            className="btn btn-ghost btn-sm text-xs"
            onClick={() => setIsAddNoteDialogOpen(true)}
          >
            + Add Note
          </button>

          {deal.quotationId && (
            <button
              className="btn btn-primary btn-sm text-xs"
              onClick={() => navigate(ROUTES.APP.QUOTATION_DETAIL(deal.quotationId!))}
            >
              View Quotation ({deal.quotationNumber || 'Q-1042'}) ↗
            </button>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div
        style={{
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          gap: '24px',
          marginBottom: '20px',
        }}
      >
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            paddingBottom: '10px',
            fontSize: '13px',
            fontWeight: 600,
            color: activeTab === 'overview' ? 'var(--accent)' : 'var(--text-muted)',
            borderBottom: activeTab === 'overview' ? '2px solid var(--accent)' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
          }}
        >
          Overview
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          style={{
            paddingBottom: '10px',
            fontSize: '13px',
            fontWeight: 600,
            color: activeTab === 'activity' ? 'var(--accent)' : 'var(--text-muted)',
            borderBottom: activeTab === 'activity' ? '2px solid var(--accent)' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
          }}
        >
          Activity Timeline ({deal.activities?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('quotes')}
          style={{
            paddingBottom: '10px',
            fontSize: '13px',
            fontWeight: 600,
            color: activeTab === 'quotes' ? 'var(--accent)' : 'var(--text-muted)',
            borderBottom: activeTab === 'quotes' ? '2px solid var(--accent)' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
          }}
        >
          Related Quotes ({deal.relatedQuotes?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('health')}
          style={{
            paddingBottom: '10px',
            fontSize: '13px',
            fontWeight: 600,
            color: activeTab === 'health' ? 'var(--accent)' : 'var(--text-muted)',
            borderBottom: activeTab === 'health' ? '2px solid var(--accent)' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
          }}
        >
          Deal Health Telemetry
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <DealOverview deal={deal} />
            <RelatedQuotes quotes={deal.relatedQuotes || []} dealId={deal.id} />
          </div>
          <div className="lg:col-span-4">
            <DealHealthSummary deal={deal} />
            <DealActivityTimeline
              activities={deal.activities || []}
              onOpenAddNote={() => setIsAddNoteDialogOpen(true)}
            />
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <DealActivityTimeline
          activities={deal.activities || []}
          onOpenAddNote={() => setIsAddNoteDialogOpen(true)}
        />
      )}

      {activeTab === 'quotes' && (
        <RelatedQuotes quotes={deal.relatedQuotes || []} dealId={deal.id} />
      )}

      {activeTab === 'health' && (
        <DealHealthSummary deal={deal} />
      )}

      {/* Modals */}
      <StageChangeDialog
        isOpen={isStageDialogOpen}
        onClose={() => setIsStageDialogOpen(false)}
        onConfirm={handleStageChange}
        currentStage={deal.stage}
        dealName={deal.name}
        isLoading={updateStageMutation.isPending}
      />

      <OwnerSelector
        isOpen={isOwnerDialogOpen}
        onClose={() => setIsOwnerDialogOpen(false)}
        onConfirm={handleOwnerChange}
        currentOwnerName={deal.ownerName}
        dealName={deal.name}
        isLoading={updateOwnerMutation.isPending}
      />

      <AddNoteDialog
        isOpen={isAddNoteDialogOpen}
        onClose={() => setIsAddNoteDialogOpen(false)}
        onConfirm={handleAddNote}
        dealName={deal.name}
        isLoading={addNoteMutation.isPending}
      />
    </div>
  );
}
