import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useQuotations } from '@/hooks/useQuotations';
import { QuotationList } from '@/components/dealflow/QuotationList';
import { Quotation } from '@/types';
import { showToast } from '@/stores/toast.store';
import { cn } from '@/lib/utils';
import {
  FileText,
  Plus,
  RefreshCw,
  Loader2,
} from 'lucide-react';

const TABS = [
  { key: 'ALL', label: 'All Quotes' },
  { key: 'MY', label: 'My Quotes' },
  { key: 'PENDING', label: 'Pending Approval' },
  { key: 'CONFIRMED', label: 'Confirmed' },
] as const;

type TabKey = typeof TABS[number]['key'];

export function QuotationsListPage() {
  const navigate = useNavigate();
  const { data: quotations = [], isLoading } = useQuotations();
  const [activeTab, setActiveTab] = useState<TabKey>('ALL');

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

  const getTabCount = (key: TabKey): number => {
    switch (key) {
      case 'ALL': return quotations.length;
      case 'PENDING': return quotations.filter((q) => q.status === 'PENDING_APPROVAL' || q.status === 'IN_REVIEW').length;
      case 'CONFIRMED': return quotations.filter((q) => q.status === 'CONFIRMED' || q.status === 'ACCEPTED' || q.status === 'APPROVED').length;
      default: return 0;
    }
  };

  const handleOpenQuotation = (quote: Quotation) => {
    navigate(ROUTES.APP.QUOTATION_DETAIL(quote.id));
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Quotations</h1>
            <p className="text-xs text-muted-foreground">
              Manage deal commercial terms, discount approvals, and active customer proposals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-border/50 transition-colors"
            onClick={() => showToast('Quotes list refreshed', 'blue')}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all active:scale-95"
            onClick={() => navigate(ROUTES.APP.QUOTATION_NEW)}
          >
            <Plus className="w-3.5 h-3.5" />
            New Quote
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border/40 w-fit">
        {TABS.map((tab) => {
          const count = getTabCount(tab.key);
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5',
                isActive
                  ? 'bg-background text-foreground shadow-sm border border-border/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              {tab.label}
              {count > 0 && (
                <span className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[18px] text-center',
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bg-card border border-border rounded-xl p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground">Loading quotations workspace...</p>
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
