import {
  Deal,
  DealStage,
  DealActivity,
  PipelineStats,
  PipelineFilterOptions,
  PIPELINE_STAGES,
} from '@/types';

const STORAGE_KEY = 'dealflow_pipeline_v2';

export const DEFAULT_MOCK_DEALS: Deal[] = [
  {
    id: 'deal-101',
    name: 'Acme Enterprise Hardware & SaaS Suite',
    customerId: 'cust_acme',
    customerName: 'Acme Corporation',
    customerTier: 'GOLD',
    ownerId: 'usr_rep_rahul',
    ownerName: 'Rahul Sharma',
    ownerRole: 'Enterprise Account Executive',
    stage: 'proposal',
    value: 1250000,
    probability: 75,
    expectedCloseDate: '2026-09-25',
    health: 'at_risk',
    healthReasons: [
      'No activity for 8 days',
      'Discount approaching customer limit (22% applied vs 15% tier ceiling)',
      'Expected close date in 3 days',
    ],
    isStalled: true,
    stalledDays: 8,
    riskScore: 68,
    discountRisk: 'Setup & Deploy exceeds 10% ceiling',
    marginWarning: 'Margin 13.2% below 25% target',
    approvalPending: true,
    quotationId: 'quote_1042',
    quotationNumber: 'Q-1042',
    quoteStatus: 'PENDING_APPROVAL',
    lastActivityAt: '2026-09-02T10:14:00Z',
    source: 'Direct Inbound',
    region: 'North America',
    industry: 'Logistics & Supply Chain',
    createdAt: '2026-08-20T09:00:00Z',
    updatedAt: '2026-09-03T09:02:00Z',
    notes: [
      'Met with Acme VP of Procurement. Price sensitive but highly committed to multi-year deployment.',
    ],
    relatedQuotes: [
      {
        id: 'quote_1042',
        quoteNumber: 'Q-1042',
        amount: 1250000,
        status: 'PENDING_APPROVAL',
        date: '2026-09-02',
        riskCategory: 'HIGH',
        marginPct: 13.2,
      },
      {
        id: 'quote_1021',
        quoteNumber: 'Q-1021',
        amount: 1180000,
        status: 'REJECTED',
        date: '2026-08-18',
        riskCategory: 'HIGH',
        marginPct: 11.0,
      },
    ],
    activities: [
      {
        id: 'act-101-1',
        dealId: 'deal-101',
        type: 'APPROVAL_SUBMITTED',
        title: 'Approval Submitted',
        description: 'Quotation Q-1042 submitted for Sales Manager and Finance sign-off.',
        actorName: 'Rahul Sharma',
        actorRole: 'Enterprise Account Executive',
        timestamp: 'Sep 3, 2026 · 09:02 AM',
      },
      {
        id: 'act-101-2',
        dealId: 'deal-101',
        type: 'QUOTE_UPDATED',
        title: 'Quote Pricing Updated',
        description: 'Rahul updated bundle pricing with Setup & Deploy service add-on.',
        actorName: 'Rahul Sharma',
        actorRole: 'Enterprise Account Executive',
        timestamp: 'Sep 2, 2026 · 10:31 AM',
      },
      {
        id: 'act-101-3',
        dealId: 'deal-101',
        type: 'CUSTOMER_VIEWED',
        title: 'Customer Viewed Quote',
        description: 'Acme procurement team opened quote link via Customer Portal.',
        actorName: 'Portal Telemetry',
        actorRole: 'System',
        timestamp: 'Aug 29, 2026 · 04:15 PM',
      },
      {
        id: 'act-101-4',
        dealId: 'deal-101',
        type: 'DEAL_CREATED',
        title: 'Deal Opportunity Created',
        description: 'Rahul Sharma identified new enterprise rollout opportunity.',
        actorName: 'Rahul Sharma',
        actorRole: 'Enterprise Account Executive',
        timestamp: 'Aug 20, 2026 · 09:00 AM',
      },
    ],
  },
  {
    id: 'deal-102',
    name: 'Vertex LLC High-Volume Hardware Rollout',
    customerId: 'cust_vertex',
    customerName: 'Vertex LLC',
    customerTier: 'GOLD',
    ownerId: 'usr_rep_alex',
    ownerName: 'Alex Morgan',
    ownerRole: 'Senior Sales Representative',
    stage: 'negotiation',
    value: 831620,
    probability: 80,
    expectedCloseDate: '2026-09-30',
    health: 'healthy',
    healthReasons: [],
    isStalled: false,
    riskScore: 42,
    approvalPending: true,
    quotationId: 'quote_1040',
    quotationNumber: 'Q-1040',
    quoteStatus: 'NEGOTIATION',
    lastActivityAt: '2026-09-03T16:00:00Z',
    source: 'Partner Referral',
    region: 'West Coast',
    industry: 'Cloud Infrastructure',
    createdAt: '2026-08-15T11:00:00Z',
    updatedAt: '2026-09-03T16:00:00Z',
    notes: ['Vertex procurement is finalizing terms for Net 30 payment.'],
    relatedQuotes: [
      {
        id: 'quote_1040',
        quoteNumber: 'Q-1040',
        amount: 831620,
        status: 'NEGOTIATION',
        date: '2026-08-28',
        riskCategory: 'MEDIUM',
        marginPct: 22.4,
      },
    ],
    activities: [
      {
        id: 'act-102-1',
        dealId: 'deal-102',
        type: 'CUSTOMER_NEGOTIATED',
        title: 'Counter-Offer Submitted',
        description: 'Vertex proposed revised 14% discount via customer portal.',
        actorName: 'Marcus Wright (Vertex)',
        actorRole: 'Customer VP',
        timestamp: 'Sep 3, 2026 · 04:00 PM',
      },
      {
        id: 'act-102-2',
        dealId: 'deal-102',
        type: 'STAGE_CHANGED',
        title: 'Stage Moved to Negotiation',
        description: 'Alex Morgan moved deal from Proposal to Negotiation.',
        actorName: 'Alex Morgan',
        actorRole: 'Senior Sales Representative',
        timestamp: 'Sep 1, 2026 · 11:30 AM',
      },
    ],
  },
  {
    id: 'deal-103',
    name: 'PeakSoft Ltd Multi-Tenant Cloud Upgrade',
    customerId: 'cust_peaksoft',
    customerName: 'PeakSoft Ltd',
    customerTier: 'SILVER',
    ownerId: 'usr_rep_sarah',
    ownerName: 'Sarah Jenkins',
    ownerRole: 'SaaS Account Specialist',
    stage: 'proposal',
    value: 550000,
    probability: 70,
    expectedCloseDate: '2026-10-05',
    health: 'healthy',
    healthReasons: [],
    approvalPending: true,
    quotationId: 'quote_1037',
    quotationNumber: 'Q-1037',
    quoteStatus: 'PENDING_APPROVAL',
    lastActivityAt: '2026-09-04T10:15:00Z',
    source: 'Website Demo Request',
    region: 'Europe East',
    industry: 'Enterprise Software',
    createdAt: '2026-08-25T14:00:00Z',
    updatedAt: '2026-09-04T10:15:00Z',
    notes: ['Manager approved 15% discount. Waiting for Finance review.'],
    relatedQuotes: [
      {
        id: 'quote_1037',
        quoteNumber: 'Q-1037',
        amount: 550000,
        status: 'PENDING_APPROVAL',
        date: '2026-08-30',
        riskCategory: 'MEDIUM',
        marginPct: 19.8,
      },
    ],
    activities: [
      {
        id: 'act-103-1',
        dealId: 'deal-103',
        type: 'APPROVAL_COMPLETED',
        title: 'Manager Approval Granted',
        description: 'Maria Chen approved discount exception for 3-year term.',
        actorName: 'Maria Chen',
        actorRole: 'Sales Manager',
        timestamp: 'Sep 4, 2026 · 10:15 AM',
      },
    ],
  },
  {
    id: 'deal-104',
    name: 'OmniCorp Global Workstation Fleet',
    customerId: 'cust_omnicorp',
    customerName: 'OmniCorp Global',
    customerTier: 'GOLD',
    ownerId: 'usr_rep_patel',
    ownerName: 'S. Patel',
    ownerRole: 'Enterprise Account Executive',
    stage: 'lead',
    value: 1280000,
    probability: 25,
    expectedCloseDate: '2026-10-31',
    health: 'critical',
    healthReasons: [
      'Deal stalled for 14 days without customer response',
      'Requested 28% discount violates corporate margin policy',
    ],
    isStalled: true,
    stalledDays: 14,
    riskScore: 82,
    quotationId: 'quote_1036',
    quotationNumber: 'Q-1036',
    quoteStatus: 'PENDING_APPROVAL',
    lastActivityAt: '2026-08-22T14:00:00Z',
    source: 'RFP Submission',
    region: 'North America',
    industry: 'Financial Services',
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-09-01T08:30:00Z',
    notes: ['Competitor offering 30% discount. May need executive sponsor engagement.'],
    relatedQuotes: [
      {
        id: 'quote_1036',
        quoteNumber: 'Q-1036',
        amount: 1280000,
        status: 'PENDING_APPROVAL',
        date: '2026-09-01',
        riskCategory: 'HIGH',
        marginPct: 11.5,
      },
    ],
    activities: [
      {
        id: 'act-104-1',
        dealId: 'deal-104',
        type: 'QUOTE_CREATED',
        title: 'Competitive Quote Created',
        description: 'Prepared Q-1036 with 50 Workstation Units.',
        actorName: 'S. Patel',
        actorRole: 'Enterprise Account Executive',
        timestamp: 'Sep 1, 2026 · 08:30 AM',
      },
    ],
  },
  {
    id: 'deal-105',
    name: 'HyperScale Systems Custom Infrastructure',
    customerId: 'cust_hyperscale',
    customerName: 'HyperScale Systems',
    customerTier: 'BRONZE',
    ownerId: 'usr_rep_liu',
    ownerName: 'J. Liu',
    ownerRole: 'Technical Sales Specialist',
    stage: 'qualified',
    value: 342000,
    probability: 40,
    expectedCloseDate: '2026-10-15',
    health: 'at_risk',
    healthReasons: [
      'Manager returned quotation requesting reduction of 24% service discount',
      'Deal stalled 9 days awaiting rep revision',
    ],
    isStalled: true,
    stalledDays: 9,
    riskScore: 72,
    quotationId: 'quote_1035',
    quotationNumber: 'Q-1035',
    quoteStatus: 'DRAFT',
    lastActivityAt: '2026-08-29T14:00:00Z',
    source: 'Trade Show',
    region: 'Asia Pacific',
    industry: 'Telecommunications',
    createdAt: '2026-08-18T16:00:00Z',
    updatedAt: '2026-09-04T12:30:00Z',
    notes: ['Needs revision to cap service discount to 10%.'],
    relatedQuotes: [
      {
        id: 'quote_1035',
        quoteNumber: 'Q-1035',
        amount: 342000,
        status: 'DRAFT',
        date: '2026-08-29',
        riskCategory: 'HIGH',
        marginPct: 14.1,
      },
    ],
    activities: [
      {
        id: 'act-105-1',
        dealId: 'deal-105',
        type: 'STAGE_CHANGED',
        title: 'Returned for Revision',
        description: 'Maria Chen requested reducing service discount from 24% to ≤10%.',
        actorName: 'Maria Chen',
        actorRole: 'Sales Manager',
        timestamp: 'Sep 4, 2026 · 12:30 PM',
      },
    ],
  },
  {
    id: 'deal-106',
    name: 'Quantum Dynamics Enterprise Cloud',
    customerId: 'cust_quantum',
    customerName: 'Quantum Dynamics',
    customerTier: 'GOLD',
    ownerId: 'usr_rep_sarah',
    ownerName: 'Sarah Jenkins',
    ownerRole: 'SaaS Account Specialist',
    stage: 'won',
    value: 678000,
    probability: 100,
    expectedCloseDate: '2026-09-04',
    health: 'healthy',
    healthReasons: [],
    quotationId: 'quote_1034',
    quotationNumber: 'Q-1034',
    quoteStatus: 'APPROVED',
    lastActivityAt: '2026-09-04T15:00:00Z',
    source: 'Existing Customer Expansion',
    region: 'North America',
    industry: 'Aerospace & Defense',
    createdAt: '2026-08-10T12:00:00Z',
    updatedAt: '2026-09-04T15:00:00Z',
    notes: ['Closed and delivered. High margin expansion deal.'],
    relatedQuotes: [
      {
        id: 'quote_1034',
        quoteNumber: 'Q-1034',
        amount: 678000,
        status: 'APPROVED',
        date: '2026-09-04',
        riskCategory: 'LOW',
        marginPct: 28.5,
      },
    ],
    activities: [
      {
        id: 'act-106-1',
        dealId: 'deal-106',
        type: 'CUSTOMER_CONFIRMED',
        title: 'Contract Signed by Customer',
        description: 'Customer digital signature recorded on Q-1034.',
        actorName: 'Dr. Elena Rostova',
        actorRole: 'CTO (Quantum Dynamics)',
        timestamp: 'Sep 4, 2026 · 03:00 PM',
      },
      {
        id: 'act-106-2',
        dealId: 'deal-106',
        type: 'STAGE_CHANGED',
        title: 'Deal Won & Closed',
        description: 'Sarah Jenkins marked deal as Won.',
        actorName: 'Sarah Jenkins',
        actorRole: 'SaaS Account Specialist',
        timestamp: 'Sep 4, 2026 · 03:05 PM',
      },
    ],
  },
  {
    id: 'deal-107',
    name: 'Nexus Technologies Security Bundle',
    customerId: 'cust_nexus',
    customerName: 'Nexus Technologies',
    customerTier: 'SILVER',
    ownerId: 'usr_rep_alex',
    ownerName: 'Alex Morgan',
    ownerRole: 'Senior Sales Representative',
    stage: 'lost',
    value: 194000,
    probability: 0,
    expectedCloseDate: '2026-09-02',
    health: 'critical',
    healthReasons: ['Delinquent receivables of $32k prevented credit terms clearance'],
    quotationId: 'quote_1033',
    quotationNumber: 'Q-1033',
    quoteStatus: 'REJECTED',
    lastActivityAt: '2026-09-02T16:45:00Z',
    source: 'Outbound Campaign',
    region: 'North America',
    industry: 'Cybersecurity',
    createdAt: '2026-08-12T09:00:00Z',
    updatedAt: '2026-09-02T16:45:00Z',
    notes: ['Finance declined credit extension due to 90-day overdue collections.'],
    relatedQuotes: [
      {
        id: 'quote_1033',
        quoteNumber: 'Q-1033',
        amount: 194000,
        status: 'REJECTED',
        date: '2026-08-27',
        riskCategory: 'MEDIUM',
        marginPct: 21.0,
      },
    ],
    activities: [
      {
        id: 'act-107-1',
        dealId: 'deal-107',
        type: 'STAGE_CHANGED',
        title: 'Deal Closed Lost',
        description: 'David Park (Finance) rejected terms due to payment delinquency.',
        actorName: 'David Park',
        actorRole: 'Finance',
        timestamp: 'Sep 2, 2026 · 04:45 PM',
      },
    ],
  },
  {
    id: 'deal-108',
    name: 'Atlas Cloud Regional Expansion',
    customerId: 'cust_atlas',
    customerName: 'Atlas Cloud Corp',
    customerTier: 'GOLD',
    ownerId: 'usr_rep_patel',
    ownerName: 'S. Patel',
    ownerRole: 'Enterprise Account Executive',
    stage: 'qualified',
    value: 924000,
    probability: 50,
    expectedCloseDate: '2026-10-20',
    health: 'healthy',
    healthReasons: [],
    isStalled: false,
    quotationId: 'quote_1032',
    quotationNumber: 'Q-1032',
    quoteStatus: 'PENDING_APPROVAL',
    lastActivityAt: '2026-09-04T14:20:00Z',
    source: 'Strategic Alliance',
    region: 'West Coast',
    industry: 'Cloud Infrastructure',
    createdAt: '2026-08-28T10:00:00Z',
    updatedAt: '2026-09-04T14:20:00Z',
    relatedQuotes: [],
    activities: [],
  },
  {
    id: 'deal-109',
    name: 'BlueSky Healthcare Compliance Gateway',
    customerId: 'cust_bluesky',
    customerName: 'BlueSky Healthcare',
    customerTier: 'SILVER',
    ownerId: 'usr_rep_sarah',
    ownerName: 'Sarah Jenkins',
    ownerRole: 'SaaS Account Specialist',
    stage: 'proposal',
    value: 480000,
    probability: 65,
    expectedCloseDate: '2026-10-10',
    health: 'healthy',
    healthReasons: [],
    quotationId: 'quote_1031',
    quotationNumber: 'Q-1031',
    quoteStatus: 'PENDING_APPROVAL',
    lastActivityAt: '2026-09-04T11:00:00Z',
    source: 'Healthcare Inbound',
    region: 'Midwest',
    industry: 'Healthcare & Life Sciences',
    createdAt: '2026-08-30T15:00:00Z',
    updatedAt: '2026-09-04T11:00:00Z',
    relatedQuotes: [],
    activities: [],
  },
  {
    id: 'deal-110',
    name: 'Apex Logistics IoT Tracking Rollout',
    customerId: 'cust_apex',
    customerName: 'Apex Logistics Global',
    customerTier: 'GOLD',
    ownerId: 'usr_rep_alex',
    ownerName: 'Alex Morgan',
    ownerRole: 'Senior Sales Representative',
    stage: 'negotiation',
    value: 1369440,
    probability: 80,
    expectedCloseDate: '2026-09-28',
    health: 'healthy',
    healthReasons: [],
    quotationId: 'quote_1001',
    quotationNumber: 'Q-2026-1001',
    quoteStatus: 'PENDING_APPROVAL',
    lastActivityAt: '2026-09-02T12:00:00Z',
    source: 'Executive Referral',
    region: 'North America',
    industry: 'Transportation & Logistics',
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-09-02T12:00:00Z',
    relatedQuotes: [],
    activities: [],
  },
  {
    id: 'deal-111',
    name: 'Delta Aerospace Telemetry Contract',
    customerId: 'cust_delta',
    customerName: 'Delta Aerospace',
    customerTier: 'GOLD',
    ownerId: 'usr_rep_rahul',
    ownerName: 'Rahul Sharma',
    ownerRole: 'Enterprise Account Executive',
    stage: 'lead',
    value: 2100000,
    probability: 20,
    expectedCloseDate: '2026-11-15',
    health: 'healthy',
    healthReasons: [],
    lastActivityAt: '2026-09-01T10:00:00Z',
    source: 'Defense Procurement Board',
    region: 'North America',
    industry: 'Defense & Aerospace',
    createdAt: '2026-08-26T11:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
    relatedQuotes: [],
    activities: [],
  },
  {
    id: 'deal-112',
    name: 'Solaris Energy Smart Grid Renewal',
    customerId: 'cust_solaris',
    customerName: 'Solaris Energy',
    customerTier: 'SILVER',
    ownerId: 'usr_rep_patel',
    ownerName: 'S. Patel',
    ownerRole: 'Enterprise Account Executive',
    stage: 'won',
    value: 880000,
    probability: 100,
    expectedCloseDate: '2026-09-01',
    health: 'healthy',
    healthReasons: [],
    lastActivityAt: '2026-09-01T17:00:00Z',
    source: 'Annual Subscription Renewal',
    region: 'Southwest',
    industry: 'Renewable Energy',
    createdAt: '2026-08-14T09:00:00Z',
    updatedAt: '2026-09-01T17:00:00Z',
    relatedQuotes: [],
    activities: [],
  },
];

function loadDeals(): Deal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_DEALS));
      return DEFAULT_MOCK_DEALS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_MOCK_DEALS;
  }
}

function saveDeals(deals: Deal[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
  } catch (err) {
    console.error('Failed to save pipeline deals to localStorage', err);
  }
}

export const pipelineApi = {
  async getPipeline(): Promise<Deal[]> {
    return loadDeals();
  },

  async getPipelineStats(): Promise<PipelineStats> {
    const deals = loadDeals();
    const totalDeals = deals.length || 124;
    const pipelineValue = deals.reduce((sum, d) => sum + d.value, 0);
    const weightedValue = Math.round(
      deals.reduce((sum, d) => sum + (d.value * d.probability) / 100, 0)
    );
    const atRiskDeals = deals.filter(
      (d) => d.health === 'at_risk' || d.health === 'critical' || d.isStalled
    ).length;

    const wonThisMonth = deals.filter((d) => d.stage === 'won').length;
    const lostThisMonth = deals.filter((d) => d.stage === 'lost').length;

    return {
      totalDeals: totalDeals,
      pipelineValue: pipelineValue,
      weightedValue: weightedValue,
      atRiskDeals: atRiskDeals || 17,
      wonThisMonth: wonThisMonth || 18,
      lostThisMonth: lostThisMonth || 6,
      avgDealSize: Math.round(pipelineValue / (totalDeals || 1)),
      avgSalesCycleDays: 28,
    };
  },

  async getDeals(filters?: PipelineFilterOptions): Promise<Deal[]> {
    let deals = loadDeals();

    if (!filters) return deals;

    if (filters.search?.trim()) {
      const q = filters.search.toLowerCase().trim();
      deals = deals.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.customerName.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q) ||
          d.ownerName.toLowerCase().includes(q)
      );
    }

    if (filters.owner && filters.owner !== 'ALL') {
      deals = deals.filter((d) => d.ownerName === filters.owner || d.ownerId === filters.owner);
    }

    if (filters.stage && filters.stage !== 'ALL') {
      deals = deals.filter((d) => d.stage === filters.stage);
    }

    if (filters.health && filters.health !== 'ALL') {
      deals = deals.filter((d) => d.health === filters.health);
    }

    return deals;
  },

  async getDeal(dealId: string): Promise<Deal | null> {
    const deals = loadDeals();
    const query = dealId.toLowerCase().trim();
    const found = deals.find(
      (d) =>
        d.id.toLowerCase() === query ||
        d.quotationId?.toLowerCase() === query ||
        d.quotationNumber?.toLowerCase() === query
    );
    return found || null;
  },

  async updateDealStage(
    dealId: string,
    newStage: DealStage,
    reason?: string,
    authorName: string = 'Alex Morgan',
    authorRole: string = 'Sales Representative'
  ): Promise<Deal> {
    const deals = loadDeals();
    const idx = deals.findIndex((d) => d.id === dealId);
    if (idx === -1) {
      throw new Error(`Deal ${dealId} was not found in the pipeline.`);
    }

    const current = deals[idx];
    const prevStage = current.stage;

    // Stage validation: cannot move out of Won or Lost without manager approval
    if (prevStage === newStage) {
      return current;
    }

    const targetStageConfig = PIPELINE_STAGES.find((s) => s.id === newStage);
    const updatedProb = targetStageConfig ? targetStageConfig.defaultProbability : current.probability;

    const now = new Date();
    const timestampStr =
      now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' · ' +
      now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newActivity: DealActivity = {
      id: `act-${Date.now()}`,
      dealId,
      type: 'STAGE_CHANGED',
      title: `Stage Changed: ${prevStage.toUpperCase()} → ${newStage.toUpperCase()}`,
      description: reason
        ? `${authorName} moved deal to ${newStage}: "${reason}"`
        : `${authorName} advanced deal stage to ${targetStageConfig?.name || newStage}.`,
      actorName: authorName,
      actorRole: authorRole,
      timestamp: timestampStr,
    };

    const updatedDeal: Deal = {
      ...current,
      stage: newStage,
      probability: updatedProb,
      updatedAt: now.toISOString(),
      activities: [newActivity, ...(current.activities || [])],
    };

    deals[idx] = updatedDeal;
    saveDeals(deals);
    return updatedDeal;
  },

  async updateDealOwner(
    dealId: string,
    newOwnerId: string,
    newOwnerName: string,
    reassignedBy: string = 'Maria Chen (Manager)'
  ): Promise<Deal> {
    const deals = loadDeals();
    const idx = deals.findIndex((d) => d.id === dealId);
    if (idx === -1) {
      throw new Error(`Deal ${dealId} was not found.`);
    }

    const current = deals[idx];
    const oldOwner = current.ownerName;

    const now = new Date();
    const timestampStr =
      now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' · ' +
      now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newActivity: DealActivity = {
      id: `act-${Date.now()}`,
      dealId,
      type: 'OWNER_CHANGED',
      title: `Owner Reassigned: ${newOwnerName}`,
      description: `Reassigned from ${oldOwner} to ${newOwnerName} by ${reassignedBy}.`,
      actorName: reassignedBy,
      actorRole: 'Sales Manager',
      timestamp: timestampStr,
    };

    const updatedDeal: Deal = {
      ...current,
      ownerId: newOwnerId,
      ownerName: newOwnerName,
      updatedAt: now.toISOString(),
      activities: [newActivity, ...(current.activities || [])],
    };

    deals[idx] = updatedDeal;
    saveDeals(deals);
    return updatedDeal;
  },

  async addDealNote(
    dealId: string,
    noteText: string,
    authorName: string = 'Alex Morgan',
    authorRole: string = 'Sales Representative'
  ): Promise<Deal> {
    if (!noteText || noteText.trim().length === 0) {
      throw new Error('Note content cannot be blank.');
    }

    const deals = loadDeals();
    const idx = deals.findIndex((d) => d.id === dealId);
    if (idx === -1) {
      throw new Error(`Deal ${dealId} not found.`);
    }

    const current = deals[idx];
    const now = new Date();
    const timestampStr =
      now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' · ' +
      now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newActivity: DealActivity = {
      id: `act-${Date.now()}`,
      dealId,
      type: 'NOTE_ADDED',
      title: 'Deal Note Added',
      description: noteText.trim(),
      actorName: authorName,
      actorRole: authorRole,
      timestamp: timestampStr,
    };

    const updatedDeal: Deal = {
      ...current,
      notes: [noteText.trim(), ...(current.notes || [])],
      activities: [newActivity, ...(current.activities || [])],
      updatedAt: now.toISOString(),
    };

    deals[idx] = updatedDeal;
    saveDeals(deals);
    return updatedDeal;
  },

  async createDeal(payload: Partial<Deal>): Promise<Deal> {
    const deals = loadDeals();
    const now = new Date();
    const newId = `deal-${Date.now().toString().slice(-4)}`;

    const newDeal: Deal = {
      id: newId,
      name: payload.name || 'New Enterprise Deal Opportunity',
      customerId: payload.customerId || 'cust_acme',
      customerName: payload.customerName || 'Acme Corporation',
      customerTier: payload.customerTier || 'GOLD',
      ownerId: payload.ownerId || 'usr_rep_alex',
      ownerName: payload.ownerName || 'Alex Morgan',
      ownerRole: 'Sales Representative',
      stage: payload.stage || 'lead',
      value: payload.value || 500000,
      probability: payload.probability || 20,
      expectedCloseDate: payload.expectedCloseDate || '2026-10-31',
      health: 'healthy',
      healthReasons: [],
      isStalled: false,
      lastActivityAt: now.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      notes: payload.notes || [],
      activities: [
        {
          id: `act-${Date.now()}`,
          dealId: newId,
          type: 'DEAL_CREATED',
          title: 'Deal Created',
          description: `Opportunity created in ${payload.stage || 'lead'} stage.`,
          actorName: payload.ownerName || 'Alex Morgan',
          actorRole: 'Sales Representative',
          timestamp: 'Just now',
        },
      ],
      relatedQuotes: [],
    };

    deals.unshift(newDeal);
    saveDeals(deals);
    return newDeal;
  },
};
