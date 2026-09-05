import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useQuotations } from '@/hooks/useQuotations';
import { QuotationList } from '@/components/dealflow/QuotationList';
import { Quotation } from '@/types';
import { showToast } from '@/stores/toast.store';

export function QuotationsListPage() {
  const navigate = useNavigate();
  const { data: quotations = [], isLoading } = useQuotations();
  const [activeTab, setActiveTab] = useState<'ALL' | 'MY' | 'PENDING' | 'CONFIRMED'>('ALL');

  const filteredQuotes = quotations.filter((q) => {
    if (activeTab === 'MY') {
      return q.assignedRepName?.includes('Morgan') || q.assignedRepId === 'usr_rep_1';
    }
    if (activeTab === 'PENDING') {
      return q.status === 'PENDING_APPROVAL' || q.status === 'IN_REVIEW';
    }
    if (activeTab === 'CONFIRMED') {
      return q.status === 'CONFIRMED' || q.status === 'ACCEPTED' || q.status === 'APPROVED';
    }
    return true;
  });

  const handleOpenQuotation = (quote: Quotation) => {
    navigate(ROUTES.APP.QUOTATION_DETAIL(quote.id));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Quotations</h1>
          <p className="text-xs text-muted-foreground">
            Manage deal commercial terms, discount approvals, and active customer proposals
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => showToast('Quotes list refreshed', 'blue')}
          >
            ↻ Refresh
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => navigate(ROUTES.APP.QUOTATION_NEW)}
          >
            + New Quote
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 0 }}>
        <div
          className={`tab ${activeTab === 'ALL' ? 'active' : ''}`}
          onClick={() => setActiveTab('ALL')}
        >
          All Quotes ({quotations.length})
        </div>
        <div
          className={`tab ${activeTab === 'MY' ? 'active' : ''}`}
          onClick={() => setActiveTab('MY')}
        >
          My Quotes
        </div>
        <div
          className={`tab ${activeTab === 'PENDING' ? 'active' : ''}`}
          onClick={() => setActiveTab('PENDING')}
        >
          Pending Approval (
          {quotations.filter((q) => q.status === 'PENDING_APPROVAL' || q.status === 'IN_REVIEW').length}
          )
        </div>
        <div
          className={`tab ${activeTab === 'CONFIRMED' ? 'active' : ''}`}
          onClick={() => setActiveTab('CONFIRMED')}
        >
          Confirmed
        </div>
      </div>

      {/* Quotation List Component */}
      {isLoading ? (
        <div className="card p-12 text-center text-muted-foreground text-xs">
          Loading quotations workspace...
        </div>
      ) : (
        <QuotationList
          quotations={filteredQuotes}
          onOpenQuotation={handleOpenQuotation}
        />
      )}
    </div>
  );
}
