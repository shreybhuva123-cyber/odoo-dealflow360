import { Subscription, SubscriptionFilterOptions } from '@/types';

const SUBSCRIPTIONS_STORAGE_KEY = 'dealflow_subscriptions_v2';

export const DEFAULT_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'SUB-1024',
    quotationId: 'quote_1042',
    quotationNumber: 'Q-1042',
    dealId: 'deal-101',
    dealName: 'Acme Enterprise Hardware & SaaS Suite',
    customerId: 'cust_acme',
    customerName: 'Acme Corporation',
    planName: 'Enterprise Cloud Intelligence (Annual Tier)',
    planTier: 'Enterprise',
    mrr: 250000,
    arr: 3000000,
    amount: 250000,
    currency: 'INR',
    billingCycle: 'MONTHLY',
    frequency: 'Monthly',
    startDate: '2026-09-01',
    nextBillingDate: '2026-10-01',
    renewalDate: '2027-08-31',
    status: 'active',
    autoRenew: true,
    invoicesCount: 1,
    timeline: [
      { id: 'tl-1', title: 'Contract Initiated & Provisioned', timestamp: '01 Sep 2026', status: 'completed' },
      { id: 'tl-2', title: 'Invoice INV-1024 Generated', timestamp: '05 Sep 2026', status: 'completed' },
      { id: 'tl-3', title: 'Tranche 1 Payment Cleared', timestamp: '05 Sep 2026', status: 'completed' },
      { id: 'tl-4', title: 'Next Monthly Cycle Billing', timestamp: '01 Oct 2026', status: 'upcoming' },
    ],
  },
  {
    id: 'SUB-1023',
    quotationId: 'quote_1040',
    quotationNumber: 'Q-1040',
    dealId: 'deal-102',
    dealName: 'XYZ Ltd Retail Systems Overhaul',
    customerId: 'cust_xyz',
    customerName: 'XYZ Ltd',
    planName: 'Business Priority Support & SLA',
    planTier: 'Business',
    mrr: 80000,
    arr: 960000,
    amount: 80000,
    currency: 'INR',
    billingCycle: 'MONTHLY',
    frequency: 'Monthly',
    startDate: '2026-08-15',
    nextBillingDate: '2026-10-15',
    renewalDate: '2027-08-14',
    status: 'paused',
    autoRenew: false,
    invoicesCount: 1,
    timeline: [
      { id: 'tl-21', title: 'Billing Cycle Started', timestamp: '15 Aug 2026', status: 'completed' },
      { id: 'tl-22', title: 'Customer Requested Seasonal Hold', timestamp: '01 Sep 2026', status: 'completed', note: 'Paused pending store expansion' },
    ],
  },
  {
    id: 'SUB-1025',
    quotationId: 'quote_1041',
    quotationNumber: 'Q-1041',
    dealId: 'deal-103',
    dealName: 'Beta Smart Factory Sensors & Edge Gateway',
    customerId: 'cust_beta',
    customerName: 'Beta Industries',
    planName: 'Smart Factory Edge Gateway SaaS',
    planTier: 'Industrial',
    mrr: 180000,
    arr: 2160000,
    amount: 540000,
    currency: 'INR',
    billingCycle: 'QUARTERLY',
    frequency: 'Quarterly',
    startDate: '2026-08-01',
    nextBillingDate: '2026-11-01',
    renewalDate: '2027-07-31',
    status: 'active',
    autoRenew: true,
    invoicesCount: 1,
    timeline: [
      { id: 'tl-31', title: 'Quarterly Cadence Initialized', timestamp: '01 Aug 2026', status: 'completed' },
      { id: 'tl-32', title: 'Next Q4 Billing Scheduled', timestamp: '01 Nov 2026', status: 'upcoming' },
    ],
  },
  {
    id: 'SUB-1026',
    quotationId: 'quote_1038',
    quotationNumber: 'Q-1038',
    dealId: 'deal-105',
    dealName: 'Nexus Next-Gen Developer Workstations',
    customerId: 'cust_nexus',
    customerName: 'Nexus Dynamics',
    planName: 'Developer Cloud Workspaces Pro',
    planTier: 'Professional',
    mrr: 95000,
    arr: 1140000,
    amount: 95000,
    currency: 'INR',
    billingCycle: 'MONTHLY',
    frequency: 'Monthly',
    startDate: '2026-07-15',
    nextBillingDate: '2026-09-15',
    renewalDate: '2027-07-14',
    status: 'past_due',
    autoRenew: true,
    invoicesCount: 2,
    timeline: [
      { id: 'tl-41', title: 'Renewal Attempt 1 Failed', timestamp: '01 Sep 2026', status: 'current', note: 'Expired corporate credit card' },
    ],
  },
];

export const MOCK_SUBSCRIPTIONS = DEFAULT_SUBSCRIPTIONS;

function normalizeCurrency(cur?: string): string {
  if (!cur || cur === '₹') return 'INR';
  return cur;
}

function loadStoredSubscriptions(): Subscription[] {
  try {
    const raw = localStorage.getItem(SUBSCRIPTIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(DEFAULT_SUBSCRIPTIONS));
      return DEFAULT_SUBSCRIPTIONS;
    }
    const parsed: Subscription[] = JSON.parse(raw);
    // Sanitize any previously saved currency symbols
    return parsed.map((s) => ({
      ...s,
      currency: normalizeCurrency(s.currency),
    }));
  } catch {
    return DEFAULT_SUBSCRIPTIONS;
  }
}

function saveStoredSubscriptions(subs: Subscription[]): void {
  try {
    localStorage.setItem(SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(subs));
  } catch (err) {
    console.error('Failed to persist subscriptions', err);
  }
}

export const subscriptionsApi = {
  async getSubscriptions(filters?: SubscriptionFilterOptions): Promise<Subscription[]> {
    await new Promise((r) => setTimeout(r, 60));
    let list = loadStoredSubscriptions();

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          s.customerName.toLowerCase().includes(q) ||
          s.planName.toLowerCase().includes(q) ||
          (s.dealName && s.dealName.toLowerCase().includes(q))
      );
    }

    if (filters?.status && filters.status !== 'all') {
      list = list.filter((s) => s.status.toLowerCase() === filters.status!.toLowerCase());
    }

    if (filters?.billingCycle && filters.billingCycle !== 'all') {
      list = list.filter((s) => s.billingCycle.toLowerCase() === filters.billingCycle!.toLowerCase());
    }

    return list;
  },

  async getSubscription(id?: string): Promise<Subscription | null> {
    await new Promise((r) => setTimeout(r, 50));
    if (!id) return null;
    const list = loadStoredSubscriptions();
    return list.find((s) => s.id === id || s.quotationId === id || s.dealId === id) || null;
  },

  async pauseSubscription(id: string): Promise<Subscription> {
    await new Promise((r) => setTimeout(r, 100));
    const list = loadStoredSubscriptions();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Subscription not found');

    const sub = list[idx];
    sub.status = 'paused';
    if (!sub.timeline) sub.timeline = [];
    sub.timeline.unshift({
      id: `tl_${Date.now()}`,
      title: 'Subscription Paused',
      timestamp: 'Just now',
      status: 'completed',
      note: 'Recurring invoice generation halted by Operations',
    });

    list[idx] = sub;
    saveStoredSubscriptions(list);
    return sub;
  },

  async resumeSubscription(id: string): Promise<Subscription> {
    await new Promise((r) => setTimeout(r, 100));
    const list = loadStoredSubscriptions();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Subscription not found');

    const sub = list[idx];
    sub.status = 'active';
    if (!sub.timeline) sub.timeline = [];
    sub.timeline.unshift({
      id: `tl_${Date.now()}`,
      title: 'Subscription Resumed',
      timestamp: 'Just now',
      status: 'completed',
      note: 'Recurring billing reactivated',
    });

    list[idx] = sub;
    saveStoredSubscriptions(list);
    return sub;
  },

  async cancelSubscription(id: string): Promise<Subscription> {
    await new Promise((r) => setTimeout(r, 100));
    const list = loadStoredSubscriptions();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Subscription not found');

    const sub = list[idx];
    sub.status = 'cancelled';
    sub.autoRenew = false;
    if (!sub.timeline) sub.timeline = [];
    sub.timeline.unshift({
      id: `tl_${Date.now()}`,
      title: 'Subscription Cancelled',
      timestamp: 'Just now',
      status: 'completed',
      note: 'Contract terminated',
    });

    list[idx] = sub;
    saveStoredSubscriptions(list);
    return sub;
  },

  async getAll(): Promise<Subscription[]> {
    return loadStoredSubscriptions();
  },
};
