import { create } from 'zustand';
import { QuotationLine } from '@/types';

export interface QuotationDraft {
  customerId: string;
  customerName: string;
  title: string;
  lines: QuotationLine[];
  notes?: string;
  targetDiscountPct: number;
}

interface WorkspaceState {
  activeQuotationId: string | null;
  activeCustomerId: string | null;
  quotationDraft: QuotationDraft | null;
  recentDealIds: string[];

  // Actions
  setActiveQuotationId: (id: string | null) => void;
  setActiveCustomerId: (id: string | null) => void;
  setQuotationDraft: (draft: QuotationDraft | null) => void;
  addRecentDeal: (dealId: string) => void;
  clearDraft: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeQuotationId: null,
  activeCustomerId: null,
  quotationDraft: null,
  recentDealIds: [],

  setActiveQuotationId: (id) => set({ activeQuotationId: id }),
  setActiveCustomerId: (id) => set({ activeCustomerId: id }),
  setQuotationDraft: (draft) => set({ quotationDraft: draft }),
  addRecentDeal: (dealId) =>
    set((state) => ({
      recentDealIds: [dealId, ...state.recentDealIds.filter((id) => id !== dealId)].slice(0, 10),
    })),
  clearDraft: () => set({ quotationDraft: null }),
}));
