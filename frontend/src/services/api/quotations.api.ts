import { apiClient } from './client';
import { Quotation, QuotationSummary, ApiResponse } from '@/types';

const STORAGE_KEY = 'dealflow_quotations_v2';

export const DEFAULT_MOCK_QUOTATIONS: Quotation[] = [
  {
    id: 'quote_1042',
    quoteNumber: 'Q-1042',
    title: 'Acme Corp Enterprise Hardware & SaaS Suite',
    customerId: 'cust_acme',
    customerName: 'Acme Corp',
    customerTier: 'GOLD',
    status: 'PENDING_APPROVAL',
    riskScore: 68,
    riskCategory: 'HIGH',
    approvalRequired: true,
    approvalRequestId: 'appr_req_1042',
    portalToken: 'portal_acme_1042',
    expiryDate: '2026-09-30T00:00:00Z',
    assignedRepId: 'usr_rep_1',
    assignedRepName: 'A. Morgan',
    createdAt: '2026-09-02T10:14:00Z',
    updatedAt: '2026-09-03T09:02:00Z',
    lines: [
      {
        id: 'ql_1042_1',
        productId: 'prod_laptop',
        productName: 'ProLaptop X1',
        sku: 'DF-LAPTOP-X1',
        category: 'Hardware',
        quantity: 10,
        unitPrice: 1200,
        costPrice: 850,
        discountPct: 15.0,
        lineTotal: 10200,
        grossMarginPct: 16.7,
      },
      {
        id: 'ql_1042_2',
        productId: 'prod_cloud',
        productName: 'CloudBase Pro',
        sku: 'DF-CLOUD-PRO',
        category: 'Subscription',
        quantity: 1,
        unitPrice: 299,
        costPrice: 80,
        discountPct: 30.0,
        lineTotal: 209.3,
        grossMarginPct: 61.8,
      },
      {
        id: 'ql_1042_3',
        productId: 'prod_deploy',
        productName: 'Setup & Deploy',
        sku: 'DF-SVC-SETUP',
        category: 'Service',
        quantity: 1,
        unitPrice: 1800,
        costPrice: 1300,
        discountPct: 18.0,
        lineTotal: 1476,
        grossMarginPct: 11.9,
      },
    ],
    summary: {
      subtotal: 13899,
      discountTotal: 2013.7,
      taxTotal: 2139.35,
      grandTotal: 14024.65,
      overallMarginPct: 24.2,
      currency: 'USD',
    },
    negotiationThread: [],
  },
  {
    id: 'quote_1041',
    quoteNumber: 'Q-1041',
    title: 'Beta Industries Professional Services Contract',
    customerId: 'cust_beta',
    customerName: 'Beta Industries',
    customerTier: 'SILVER',
    status: 'APPROVED',
    riskScore: 24,
    riskCategory: 'LOW',
    approvalRequired: false,
    portalToken: 'portal_beta_1041',
    expiryDate: '2026-10-15T00:00:00Z',
    assignedRepId: 'usr_rep_2',
    assignedRepName: 'S. Patel',
    createdAt: '2026-09-01T14:20:00Z',
    updatedAt: '2026-09-04T11:00:00Z',
    lines: [
      {
        id: 'ql_1041_1',
        productId: 'prod_laptop',
        productName: 'ProLaptop X1',
        sku: 'DF-LAPTOP-X1',
        category: 'Hardware',
        quantity: 10,
        unitPrice: 1200,
        costPrice: 850,
        discountPct: 8.0,
        lineTotal: 11040,
        grossMarginPct: 23.0,
      },
      {
        id: 'ql_1041_2',
        productId: 'prod_display',
        productName: 'UltraDisplay 4K',
        sku: 'DF-DISP-4K',
        category: 'Hardware',
        quantity: 5,
        unitPrice: 480,
        costPrice: 310,
        discountPct: 8.0,
        lineTotal: 2208,
        grossMarginPct: 29.8,
      },
    ],
    summary: {
      subtotal: 14400,
      discountTotal: 1152,
      taxTotal: 2384.64,
      grandTotal: 15632.64,
      overallMarginPct: 31.0,
      currency: 'USD',
    },
    negotiationThread: [],
  },
  {
    id: 'quote_1040',
    quoteNumber: 'Q-1040',
    title: 'Vertex LLC High-Volume Hardware & SaaS Renewal',
    customerId: 'cust_vertex',
    customerName: 'Vertex LLC',
    customerTier: 'GOLD',
    status: 'NEGOTIATION',
    riskScore: 42,
    riskCategory: 'MEDIUM',
    approvalRequired: true,
    portalToken: 'portal_apex_1001_secure',
    expiryDate: '2026-09-30T00:00:00Z',
    assignedRepId: 'usr_rep_1',
    assignedRepName: 'A. Morgan',
    createdAt: '2026-08-28T09:00:00Z',
    updatedAt: '2026-09-03T16:00:00Z',
    lines: [
      {
        id: 'ql_1040_1',
        productId: 'prod_laptop',
        productName: 'ProLaptop X1',
        sku: 'DF-LAPTOP-X1',
        category: 'Hardware',
        quantity: 40,
        unitPrice: 1200,
        costPrice: 850,
        discountPct: 14.0,
        lineTotal: 41280,
        grossMarginPct: 17.6,
      },
      {
        id: 'ql_1040_2',
        productId: 'prod_display',
        productName: 'UltraDisplay 4K',
        sku: 'DF-DISP-4K',
        category: 'Hardware',
        quantity: 40,
        unitPrice: 480,
        costPrice: 310,
        discountPct: 14.0,
        lineTotal: 16512,
        grossMarginPct: 24.9,
      },
      {
        id: 'ql_1040_3',
        productId: 'prod_cloud',
        productName: 'CloudBase Pro',
        sku: 'DF-CLOUD-PRO',
        category: 'Subscription',
        quantity: 40,
        unitPrice: 299,
        costPrice: 80,
        discountPct: 12.0,
        lineTotal: 10524.8,
        grossMarginPct: 69.6,
      },
      {
        id: 'ql_1040_4',
        productId: 'prod_warranty',
        productName: 'Extended Warranty',
        sku: 'DF-WARR-1Y',
        category: 'Hardware',
        quantity: 40,
        unitPrice: 60,
        costPrice: 20,
        discountPct: 10.0,
        lineTotal: 2160,
        grossMarginPct: 63.0,
      },
    ],
    summary: {
      subtotal: 81560,
      discountTotal: 11083.2,
      taxTotal: 12685.82,
      grandTotal: 83162.62,
      overallMarginPct: 22.4,
      currency: 'USD',
    },
    negotiationThread: [],
  },
  {
    id: 'quote_1039',
    quoteNumber: 'Q-1039',
    title: 'NovaTech Annual Subscription Order',
    customerId: 'cust_nova',
    customerName: 'NovaTech',
    customerTier: 'BRONZE',
    status: 'CONFIRMED',
    riskScore: 12,
    riskCategory: 'LOW',
    approvalRequired: false,
    portalToken: 'portal_nova_1039',
    expiryDate: '2026-10-01T00:00:00Z',
    assignedRepId: 'usr_rep_3',
    assignedRepName: 'J. Liu',
    createdAt: '2026-08-25T11:00:00Z',
    updatedAt: '2026-08-30T15:00:00Z',
    lines: [
      {
        id: 'ql_1039_1',
        productId: 'prod_cloud',
        productName: 'CloudBase Pro',
        sku: 'DF-CLOUD-PRO',
        category: 'Subscription',
        quantity: 25,
        unitPrice: 299,
        costPrice: 80,
        discountPct: 4.0,
        lineTotal: 7176,
        grossMarginPct: 72.1,
      },
    ],
    summary: {
      subtotal: 7475,
      discountTotal: 299,
      taxTotal: 1291.68,
      grandTotal: 8467.68,
      overallMarginPct: 28.0,
      currency: 'USD',
    },
    negotiationThread: [],
  },
  {
    id: 'quote_1038',
    quoteNumber: 'Q-1038',
    title: 'CloudBase Co Hardware Expansion Draft',
    customerId: 'cust_cloudbase',
    customerName: 'CloudBase Co',
    customerTier: 'SILVER',
    status: 'DRAFT',
    riskScore: 18,
    riskCategory: 'LOW',
    approvalRequired: false,
    portalToken: 'portal_cloudbase_1038',
    expiryDate: '2026-10-10T00:00:00Z',
    assignedRepId: 'usr_rep_1',
    assignedRepName: 'A. Morgan',
    createdAt: '2026-09-04T08:30:00Z',
    updatedAt: '2026-09-04T08:30:00Z',
    lines: [
      {
        id: 'ql_1038_1',
        productId: 'prod_laptop',
        productName: 'ProLaptop X1',
        sku: 'DF-LAPTOP-X1',
        category: 'Hardware',
        quantity: 25,
        unitPrice: 1200,
        costPrice: 850,
        discountPct: 10.0,
        lineTotal: 27000,
        grossMarginPct: 21.3,
      },
    ],
    summary: {
      subtotal: 30000,
      discountTotal: 3000,
      taxTotal: 4860,
      grandTotal: 31860,
      overallMarginPct: 18.2,
      currency: 'USD',
    },
    negotiationThread: [],
  },
  {
    id: 'quote_1037',
    quoteNumber: 'Q-1037',
    title: 'PeakSoft Ltd Services & Cloud Package',
    customerId: 'cust_peaksoft',
    customerName: 'PeakSoft Ltd',
    customerTier: 'GOLD',
    status: 'PENDING_APPROVAL',
    riskScore: 54,
    riskCategory: 'MEDIUM',
    approvalRequired: true,
    portalToken: 'portal_peaksoft_1037',
    expiryDate: '2026-09-28T00:00:00Z',
    assignedRepId: 'usr_rep_4',
    assignedRepName: 'R. Sharma',
    createdAt: '2026-08-30T13:10:00Z',
    updatedAt: '2026-09-01T14:40:00Z',
    lines: [
      {
        id: 'ql_1037_1',
        productId: 'prod_deploy',
        productName: 'Setup & Deploy',
        sku: 'DF-SVC-SETUP',
        category: 'Service',
        quantity: 25,
        unitPrice: 1800,
        costPrice: 1300,
        discountPct: 18.0,
        lineTotal: 36900,
        grossMarginPct: 11.9,
      },
    ],
    summary: {
      subtotal: 45000,
      discountTotal: 8100,
      taxTotal: 6642,
      grandTotal: 43542,
      overallMarginPct: 19.1,
      currency: 'USD',
    },
    negotiationThread: [],
  },
  {
    id: 'quote_1036',
    quoteNumber: 'Q-1036',
    title: 'Orbis Corp Display Upgrade Won Deal',
    customerId: 'cust_orbis',
    customerName: 'Orbis Corp',
    customerTier: 'BRONZE',
    status: 'CONFIRMED',
    riskScore: 8,
    riskCategory: 'LOW',
    approvalRequired: false,
    portalToken: 'portal_orbis_1036',
    expiryDate: '2026-08-30T00:00:00Z',
    assignedRepId: 'usr_rep_3',
    assignedRepName: 'J. Liu',
    createdAt: '2026-08-15T09:00:00Z',
    updatedAt: '2026-08-25T17:00:00Z',
    lines: [
      {
        id: 'ql_1036_1',
        productId: 'prod_display',
        productName: 'UltraDisplay 4K',
        sku: 'DF-DISP-4K',
        category: 'Hardware',
        quantity: 25,
        unitPrice: 480,
        costPrice: 310,
        discountPct: 3.0,
        lineTotal: 11640,
        grossMarginPct: 33.4,
      },
    ],
    summary: {
      subtotal: 12000,
      discountTotal: 360,
      taxTotal: 2095.2,
      grandTotal: 13735.2,
      overallMarginPct: 35.0,
      currency: 'USD',
    },
    negotiationThread: [],
  },
];

// Helper to get quotes from localStorage with default fallback
function loadStoredQuotes(): Quotation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load quotes from storage', e);
  }
  return DEFAULT_MOCK_QUOTATIONS;
}

function saveStoredQuotes(quotes: Quotation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
  } catch (e) {
    console.warn('Failed to save quotes to storage', e);
  }
}

export const quotationsApi = {
  async getAll(): Promise<Quotation[]> {
    try {
      const res = await apiClient.get<any>('/quotations');
      const data = res.data?.data;
      if (Array.isArray(data) && data.length > 0) return data;
      if (data && Array.isArray(data.quotations) && data.quotations.length > 0) return data.quotations;
      return loadStoredQuotes();
    } catch {
      return loadStoredQuotes();
    }
  },

  async getById(id: string): Promise<Quotation | null> {
    try {
      const res = await apiClient.get<any>(`/quotations/${id}`);
      const data = res.data?.data;
      if (data?.quotation) return data.quotation;
      if (data?.id) return data;
    } catch {
      // Backend unavailable or 401, fallback to stored mock
    }

    const all = loadStoredQuotes();
    const cleanId = (id || '').toLowerCase().trim();
    const cleanNum = cleanId.replace('q-', '').replace('quote_', '');

    const found = all.find(
      (q) =>
        q.id.toLowerCase() === cleanId ||
        q.quoteNumber.toLowerCase() === cleanId ||
        (cleanNum && (q.id.toLowerCase().includes(cleanNum) || q.quoteNumber.toLowerCase().includes(cleanNum)))
    );

    return (
      found ||
      DEFAULT_MOCK_QUOTATIONS.find((q) => q.id === id || q.id === cleanId) ||
      all[0] ||
      DEFAULT_MOCK_QUOTATIONS[0]
    );
  },

  async getByPortalToken(token: string): Promise<Quotation | null> {
    try {
      const res = await apiClient.get<ApiResponse<Quotation>>(`/portal/quote/${token}`);
      return res.data.data;
    } catch {
      const all = loadStoredQuotes();
      return all.find((q) => q.portalToken === token) || all[0];
    }
  },

  async create(payload: Partial<Quotation>): Promise<Quotation> {
    try {
      const res = await apiClient.post<ApiResponse<Quotation>>('/quotations', payload);
      return res.data.data;
    } catch {
      const all = loadStoredQuotes();
      const num = 1043 + all.length;
      const newQuote: Quotation = {
        id: `quote_${num}`,
        quoteNumber: `Q-${num}`,
        title: payload.title || `${payload.customerName || 'New'} Dealflow Quotation`,
        customerId: payload.customerId || 'cust_acme',
        customerName: payload.customerName || 'Acme Corp',
        customerTier: payload.customerTier || 'GOLD',
        status: payload.status || 'DRAFT',
        riskScore: payload.riskScore ?? 15,
        riskCategory: payload.riskCategory || 'LOW',
        approvalRequired: payload.approvalRequired ?? false,
        lines: payload.lines || [],
        summary: payload.summary || {
          subtotal: 0,
          discountTotal: 0,
          taxTotal: 0,
          grandTotal: 0,
          overallMarginPct: 30,
          currency: 'USD',
        },
        expiryDate: payload.expiryDate || '2026-10-31T00:00:00Z',
        assignedRepId: payload.assignedRepId || 'usr_rep_1',
        assignedRepName: payload.assignedRepName || 'Alex Morgan',
        negotiationThread: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [newQuote, ...all];
      saveStoredQuotes(updated);
      return newQuote;
    }
  },

  async update(id: string, payload: Partial<Quotation>): Promise<Quotation> {
    try {
      const res = await apiClient.patch<ApiResponse<Quotation>>(`/quotations/${id}`, payload);
      return res.data.data;
    } catch {
      const all = loadStoredQuotes();
      const idx = all.findIndex((q) => q.id === id || q.quoteNumber === id);
      if (idx >= 0) {
        const updated = {
          ...all[idx],
          ...payload,
          updatedAt: new Date().toISOString(),
        };
        all[idx] = updated;
        saveStoredQuotes(all);
        return updated;
      }
      return { ...DEFAULT_MOCK_QUOTATIONS[0], ...payload };
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/quotations/${id}`);
      return true;
    } catch {
      const all = loadStoredQuotes().filter((q) => q.id !== id && q.quoteNumber !== id);
      saveStoredQuotes(all);
      return true;
    }
  },

  async submit(id: string): Promise<Quotation> {
    return quotationsApi.update(id, {
      status: 'PENDING_APPROVAL',
      approvalRequired: true,
    });
  },

  async recalculate(quotation: Partial<Quotation>): Promise<QuotationSummary> {
    const lines = quotation.lines || [];
    let subtotal = 0;
    let discountTotal = 0;
    let totalCost = 0;

    lines.forEach((l) => {
      const lineSub = l.quantity * l.unitPrice;
      const lineDisc = lineSub * (l.discountPct / 100);
      subtotal += lineSub;
      discountTotal += lineDisc;
      totalCost += l.quantity * (l.costPrice || l.unitPrice * 0.7);
    });

    const netAfterDiscount = subtotal - discountTotal;
    const taxTotal = Math.round(netAfterDiscount * 0.18 * 100) / 100;
    const grandTotal = Math.round((netAfterDiscount + taxTotal) * 100) / 100;
    const grossProfit = netAfterDiscount - totalCost;
    const overallMarginPct =
      netAfterDiscount > 0
        ? Math.max(0, Math.min(100, Math.round((grossProfit / netAfterDiscount) * 1000) / 10))
        : 0;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discountTotal: Math.round(discountTotal * 100) / 100,
      taxTotal,
      grandTotal,
      overallMarginPct,
      currency: quotation.summary?.currency || 'USD',
    };
  },
};
