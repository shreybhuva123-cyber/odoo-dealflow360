import { BillingSchedule, BillingStats, BillingFilterOptions, Invoice } from '@/types';
import { DEFAULT_INVOICES } from './invoices.api';

const BILLING_STORAGE_KEY = 'dealflow_billing_schedules_v2';

export const MOCK_INVOICES: Invoice[] = DEFAULT_INVOICES;

export const DEFAULT_BILLING_SCHEDULES: BillingSchedule[] = [
  {
    id: 'BS-1024',
    quotationId: 'quote_1042',
    quotationNumber: 'Q-1042',
    dealId: 'deal-101',
    dealName: 'Acme Enterprise Hardware & SaaS Suite',
    customerId: 'cust_acme',
    customerName: 'Acme Corporation',
    billingType: 'SUBSCRIPTION',
    currency: '₹',
    totalContractValue: 3000000,
    interval: 'MONTHLY',
    frequency: 'Monthly',
    startDate: '2026-09-01',
    nextBillingDate: '2026-10-01',
    amount: 250000,
    status: 'ACTIVE',
  },
  {
    id: 'BS-1023',
    quotationId: 'quote_1040',
    quotationNumber: 'Q-1040',
    dealId: 'deal-102',
    dealName: 'XYZ Ltd Retail Systems Overhaul',
    customerId: 'cust_xyz',
    customerName: 'XYZ Ltd',
    billingType: 'SUBSCRIPTION',
    currency: '₹',
    totalContractValue: 2000000,
    interval: 'QUARTERLY',
    frequency: 'Quarterly',
    startDate: '2026-08-15',
    nextBillingDate: '2026-11-15',
    amount: 500000,
    status: 'ACTIVE',
  },
  {
    id: 'BS-1025',
    quotationId: 'quote_1041',
    quotationNumber: 'Q-1041',
    dealId: 'deal-103',
    dealName: 'Beta Smart Factory Sensors & Edge Gateway',
    customerId: 'cust_beta',
    customerName: 'Beta Industries',
    billingType: 'MILESTONE_BASED',
    currency: '₹',
    totalContractValue: 1500000,
    interval: 'MILESTONE',
    frequency: 'Milestone',
    startDate: '2026-08-01',
    nextBillingDate: '2026-09-20',
    amount: 450000,
    status: 'ACTIVE',
    milestones: [
      { id: 'm-1', name: 'Phase 1 Hardware Delivery', percentage: 40, amount: 600000, dueDate: '2026-08-10', status: 'COMPLETED' },
      { id: 'm-2', name: 'Phase 2 IoT Sensor Calibration', percentage: 30, amount: 450000, dueDate: '2026-09-20', status: 'TRIGGERED' },
      { id: 'm-3', name: 'Phase 3 Full Commissioning', percentage: 30, amount: 450000, dueDate: '2026-10-30', status: 'PENDING' },
    ],
  },
  {
    id: 'BS-1026',
    quotationId: 'quote_1038',
    quotationNumber: 'Q-1038',
    dealId: 'deal-105',
    dealName: 'Nexus Next-Gen Developer Workstations',
    customerId: 'cust_nexus',
    customerName: 'Nexus Dynamics',
    billingType: 'ONE_OFF',
    currency: '₹',
    totalContractValue: 820000,
    interval: 'MONTHLY',
    frequency: 'One-time',
    startDate: '2026-09-02',
    amount: 820000,
    status: 'COMPLETED',
  },
];

function loadStoredSchedules(): BillingSchedule[] {
  try {
    const raw = localStorage.getItem(BILLING_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BILLING_STORAGE_KEY, JSON.stringify(DEFAULT_BILLING_SCHEDULES));
      return DEFAULT_BILLING_SCHEDULES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_BILLING_SCHEDULES;
  }
}

function saveStoredSchedules(schedules: BillingSchedule[]): void {
  try {
    localStorage.setItem(BILLING_STORAGE_KEY, JSON.stringify(schedules));
  } catch (err) {
    console.error('Failed to persist billing schedules', err);
  }
}

export const billingApi = {
  async getBillingStats(): Promise<BillingStats> {
    await new Promise((r) => setTimeout(r, 50));
    return {
      totalRevenue: 4250000,
      outstandingAmount: 820000,
      overdueAmount: 240000,
      paidAmount: 3190000,
      dueSoonAmount: 180000,
      mrr: 505000,
      activeSubscriptionsCount: 4,
      overdueCount: 1,
      invoicesCount: 6,
      avgPaymentDays: 8.4,
    };
  },

  async getBillingSchedules(filters?: BillingFilterOptions): Promise<BillingSchedule[]> {
    await new Promise((r) => setTimeout(r, 60));
    let list = loadStoredSchedules();

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.customerName.toLowerCase().includes(q) ||
          (s.dealName && s.dealName.toLowerCase().includes(q)) ||
          s.id.toLowerCase().includes(q)
      );
    }

    if (filters?.frequency && filters.frequency !== 'all') {
      list = list.filter((s) => s.frequency?.toLowerCase() === filters.frequency!.toLowerCase());
    }

    if (filters?.status && filters.status !== 'all') {
      list = list.filter((s) => s.status.toLowerCase() === filters.status!.toLowerCase());
    }

    return list;
  },

  async getBillingSchedule(id?: string): Promise<BillingSchedule | null> {
    await new Promise((r) => setTimeout(r, 50));
    if (!id) return null;
    const list = loadStoredSchedules();
    return list.find((s) => s.id === id || s.quotationId === id || s.dealId === id) || null;
  },

  async updateBillingSchedule(
    id: string,
    data: Partial<BillingSchedule>
  ): Promise<BillingSchedule> {
    await new Promise((r) => setTimeout(r, 100));
    const list = loadStoredSchedules();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Billing schedule not found');

    const updated = { ...list[idx], ...data };
    list[idx] = updated;
    saveStoredSchedules(list);
    return updated;
  },

  async getInvoices(): Promise<Invoice[]> {
    return DEFAULT_INVOICES;
  },
};
