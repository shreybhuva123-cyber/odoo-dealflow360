import {
  DealHealthStatus,
  RiskLevel,
  RiskType,
  DealHealthDetail,
  DealHealthDashboardData,
  DealHealthFilterOptions,
  DealHealthMetric,
  DealHealthEvent,
} from '@/types';

const STORAGE_KEY = 'dealflow_deal_health_v2';

export const INITIAL_DEAL_HEALTH_DATA: Record<string, DealHealthDetail> = {
  'deal-104': {
    dealId: 'deal-104',
    dealName: 'OmniCorp Global Workstation Fleet',
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
    healthStatus: 'CRITICAL',
    healthScore: 34,
    riskLevel: 'HIGH',
    primaryRiskReason: 'Deal stalled for 14 days; discount 28% violates 15% margin ceiling',
    isStalled: true,
    stalledDays: 14,
    lastActivityAt: '2026-08-22T14:00:00Z',
    quotationId: 'quote_1036',
    quotationNumber: 'Q-1036',
    originalMargin: 28.0,
    currentMargin: 11.5,
    marginDelta: -16.5,
    appliedDiscount: 28.0,
    allowedDiscountThreshold: 15.0,
    approvalPending: true,
    approvalPendingRole: 'FINANCE',
    approvalWaitingDays: 6,
    signals: [
      {
        id: 'sig_104_1',
        type: 'MARGIN',
        severity: 'HIGH',
        title: 'Severe Margin Erosion',
        description: 'Gross margin collapsed by 16.5% (from 28.0% to 11.5%) due to customized hardware bundling.',
        detectedAt: '2026-09-01T08:30:00Z',
        status: 'active',
        metricChange: { from: 28.0, to: 11.5, unit: '%' },
      },
      {
        id: 'sig_104_2',
        type: 'STALLED',
        severity: 'HIGH',
        title: 'Prolonged Dormancy (14 Days)',
        description: 'No customer portal interaction or sales follow-up logged since August 22.',
        detectedAt: '2026-09-03T00:00:00Z',
        status: 'active',
      },
      {
        id: 'sig_104_3',
        type: 'DISCOUNT',
        severity: 'HIGH',
        title: 'Discount Policy Ceiling Breach',
        description: 'Applied discount of 28.0% exceeds the customer Tier ceiling of 15.0% by 13.0%.',
        detectedAt: '2026-09-01T08:30:00Z',
        status: 'active',
        metricChange: { from: 15.0, to: 28.0, unit: '%' },
      },
      {
        id: 'sig_104_4',
        type: 'APPROVAL',
        severity: 'MEDIUM',
        title: 'Finance Escalation Pending',
        description: 'Waiting for Finance VP review for 6 days. Standard SLA is 2 days.',
        detectedAt: '2026-09-02T10:00:00Z',
        status: 'active',
      },
    ],
    timeline: [
      {
        id: 'tl_104_1',
        timestamp: 'Sep 3, 2026 · 10:00 AM',
        title: 'Risk Level Escalated to CRITICAL',
        description: 'Automated deal monitor triggered Critical rating due to combined dormancy and margin drop.',
        type: 'RISK_ESCALATION',
        severity: 'HIGH',
      },
      {
        id: 'tl_104_2',
        timestamp: 'Sep 1, 2026 · 08:30 AM',
        title: 'Quotation Q-1036 Created with 28% Discount',
        description: 'Rep S. Patel submitted quote with 28% competitive discount against RFP.',
        type: 'DISCOUNT_APPLIED',
        severity: 'HIGH',
      },
      {
        id: 'tl_104_3',
        timestamp: 'Aug 22, 2026 · 02:00 PM',
        title: 'Last Customer Contact',
        description: 'Initial RFP review call with OmniCorp procurement lead.',
        type: 'ACTIVITY_GAP',
        severity: 'MEDIUM',
      },
    ],
  },

  'deal-101': {
    dealId: 'deal-101',
    dealName: 'Acme Enterprise Hardware & SaaS Suite',
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
    healthStatus: 'AT_RISK',
    healthScore: 68,
    riskLevel: 'HIGH',
    primaryRiskReason: 'Discount approaching customer limit (22% applied vs 15% tier ceiling)',
    isStalled: true,
    stalledDays: 8,
    lastActivityAt: '2026-09-02T10:14:00Z',
    quotationId: 'quote_1042',
    quotationNumber: 'Q-1042',
    originalMargin: 25.0,
    currentMargin: 13.2,
    marginDelta: -11.8,
    appliedDiscount: 22.0,
    allowedDiscountThreshold: 15.0,
    approvalPending: true,
    approvalPendingRole: 'MANAGER',
    approvalWaitingDays: 4,
    signals: [
      {
        id: 'sig_101_1',
        type: 'DISCOUNT',
        severity: 'HIGH',
        title: 'Tier Discount Limit Exceeded',
        description: 'Setup & Deploy service add-on pushed cumulative discount to 22.0% vs 15.0% tier ceiling.',
        detectedAt: '2026-09-02T10:31:00Z',
        status: 'active',
        metricChange: { from: 15.0, to: 22.0, unit: '%' },
      },
      {
        id: 'sig_101_2',
        type: 'MARGIN',
        severity: 'HIGH',
        title: 'Below Target Margin Floor',
        description: 'Gross margin at 13.2% sits 11.8% below the corporate 25.0% floor.',
        detectedAt: '2026-09-02T10:31:00Z',
        status: 'active',
        metricChange: { from: 25.0, to: 13.2, unit: '%' },
      },
      {
        id: 'sig_101_3',
        type: 'STALLED',
        severity: 'MEDIUM',
        title: 'Inactivity Warning (8 Days)',
        description: 'Expected close date in under 3 weeks with 8 days since last buyer touchpoint.',
        detectedAt: '2026-09-04T00:00:00Z',
        status: 'active',
      },
    ],
    timeline: [
      {
        id: 'tl_101_1',
        timestamp: 'Sep 3, 2026 · 09:02 AM',
        title: 'Approval Submitted to Sales Manager & Finance',
        description: 'Rahul submitted Q-1042 exception request.',
        type: 'APPROVAL_UPDATE',
        severity: 'MEDIUM',
      },
      {
        id: 'tl_101_2',
        timestamp: 'Sep 2, 2026 · 10:31 AM',
        title: 'Discount Increased to 22%',
        description: 'Added Setup & Deploy service add-on with 15% line discount.',
        type: 'DISCOUNT_APPLIED',
        severity: 'HIGH',
      },
      {
        id: 'tl_101_3',
        timestamp: 'Aug 29, 2026 · 04:15 PM',
        title: 'Customer Viewed Quote in Portal',
        description: 'Acme procurement team reviewed online quote.',
        type: 'CUSTOMER_ACTION',
      },
    ],
  },

  'deal-105': {
    dealId: 'deal-105',
    dealName: 'HyperScale Systems Custom Infrastructure',
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
    healthStatus: 'AT_RISK',
    healthScore: 58,
    riskLevel: 'MEDIUM',
    primaryRiskReason: 'Manager returned quotation requesting reduction of 24% service discount',
    isStalled: true,
    stalledDays: 9,
    lastActivityAt: '2026-08-29T14:00:00Z',
    quotationId: 'quote_1035',
    quotationNumber: 'Q-1035',
    originalMargin: 22.5,
    currentMargin: 14.1,
    marginDelta: -8.4,
    appliedDiscount: 24.0,
    allowedDiscountThreshold: 10.0,
    approvalPending: false,
    approvalPendingRole: 'NONE',
    signals: [
      {
        id: 'sig_105_1',
        type: 'DISCOUNT',
        severity: 'HIGH',
        title: 'Manager Returned Quotation',
        description: 'Maria Chen returned quotation requiring reduction from 24% to <= 10%.',
        detectedAt: '2026-09-04T12:30:00Z',
        status: 'active',
      },
      {
        id: 'sig_105_2',
        type: 'STALLED',
        severity: 'MEDIUM',
        title: '9 Days Awaiting Rep Revision',
        description: 'Rep has not acted on the returned quotation for over a week.',
        detectedAt: '2026-09-04T00:00:00Z',
        status: 'active',
      },
    ],
    timeline: [
      {
        id: 'tl_105_1',
        timestamp: 'Sep 4, 2026 · 12:30 PM',
        title: 'Quotation Returned by Maria Chen',
        description: 'Reason: "Service discount of 24% is unviable for Bronze accounts. Cap at 10%."',
        type: 'APPROVAL_UPDATE',
        severity: 'MEDIUM',
      },
    ],
  },

  'deal-107': {
    dealId: 'deal-107',
    dealName: 'Nexus Technologies Security Bundle',
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
    healthStatus: 'CRITICAL',
    healthScore: 22,
    riskLevel: 'HIGH',
    primaryRiskReason: 'Delinquent receivables of $32k prevented credit terms clearance',
    isStalled: false,
    stalledDays: 0,
    lastActivityAt: '2026-09-02T16:45:00Z',
    quotationId: 'quote_1033',
    quotationNumber: 'Q-1033',
    originalMargin: 21.0,
    currentMargin: 21.0,
    marginDelta: 0,
    appliedDiscount: 12.0,
    allowedDiscountThreshold: 15.0,
    approvalPending: false,
    approvalPendingRole: 'NONE',
    signals: [
      {
        id: 'sig_107_1',
        type: 'CUSTOMER_CREDIT',
        severity: 'HIGH',
        title: 'Collections Delinquency Block',
        description: 'Customer has 90-day overdue balance of $32,000; finance placed a credit hold.',
        detectedAt: '2026-09-02T16:45:00Z',
        status: 'active',
      },
      {
        id: 'sig_107_2',
        type: 'PROBABILITY',
        severity: 'HIGH',
        title: 'Deal Marked Closed Lost',
        description: 'Probability reduced to 0% following credit block.',
        detectedAt: '2026-09-02T16:45:00Z',
        status: 'active',
      },
    ],
    timeline: [
      {
        id: 'tl_107_1',
        timestamp: 'Sep 2, 2026 · 04:45 PM',
        title: 'Deal Closed Lost by Finance',
        description: 'David Park (Finance) rejected terms due to payment delinquency.',
        type: 'STAGE_CHANGE',
        severity: 'HIGH',
      },
    ],
  },

  'deal-102': {
    dealId: 'deal-102',
    dealName: 'Vertex LLC High-Volume Hardware Rollout',
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
    healthStatus: 'HEALTHY',
    healthScore: 88,
    riskLevel: 'LOW',
    primaryRiskReason: 'Healthy deal — active customer portal negotiation with viable margin',
    isStalled: false,
    stalledDays: 0,
    lastActivityAt: '2026-09-03T16:00:00Z',
    quotationId: 'quote_1040',
    quotationNumber: 'Q-1040',
    originalMargin: 24.0,
    currentMargin: 22.4,
    marginDelta: -1.6,
    appliedDiscount: 14.0,
    allowedDiscountThreshold: 15.0,
    approvalPending: true,
    approvalPendingRole: 'MANAGER',
    approvalWaitingDays: 1,
    signals: [
      {
        id: 'sig_102_1',
        type: 'CUSTOMER_NEGOTIATION',
        severity: 'LOW',
        title: 'Counter-Offer Submitted',
        description: 'Customer proposed 14% discount within permissible gold tier threshold.',
        detectedAt: '2026-09-03T16:00:00Z',
        status: 'mitigated',
      },
    ],
    timeline: [
      {
        id: 'tl_102_1',
        timestamp: 'Sep 3, 2026 · 04:00 PM',
        title: 'Counter-Offer Submitted by Marcus Wright',
        description: 'Vertex proposed revised 14% discount via customer portal.',
        type: 'CUSTOMER_ACTION',
      },
    ],
  },

  'deal-103': {
    dealId: 'deal-103',
    dealName: 'PeakSoft Ltd Multi-Tenant Cloud Upgrade',
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
    healthStatus: 'HEALTHY',
    healthScore: 82,
    riskLevel: 'LOW',
    primaryRiskReason: 'Manager approved 15% discount; awaiting standard finance review',
    isStalled: false,
    stalledDays: 0,
    lastActivityAt: '2026-09-04T10:15:00Z',
    quotationId: 'quote_1037',
    quotationNumber: 'Q-1037',
    originalMargin: 21.0,
    currentMargin: 19.8,
    marginDelta: -1.2,
    appliedDiscount: 15.0,
    allowedDiscountThreshold: 15.0,
    approvalPending: true,
    approvalPendingRole: 'FINANCE',
    approvalWaitingDays: 1,
    signals: [
      {
        id: 'sig_103_1',
        type: 'APPROVAL',
        severity: 'LOW',
        title: 'Manager Approval Granted',
        description: 'Maria Chen approved discount exception for 3-year term.',
        detectedAt: '2026-09-04T10:15:00Z',
        status: 'resolved',
      },
    ],
    timeline: [
      {
        id: 'tl_103_1',
        timestamp: 'Sep 4, 2026 · 10:15 AM',
        title: 'Manager Sign-Off Recorded',
        description: 'Approval moved to Finance queue.',
        type: 'APPROVAL_UPDATE',
      },
    ],
  },

  'deal-106': {
    dealId: 'deal-106',
    dealName: 'Quantum Dynamics Enterprise Cloud',
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
    healthStatus: 'HEALTHY',
    healthScore: 96,
    riskLevel: 'LOW',
    primaryRiskReason: 'Won and executed digitally with strong 28.5% margin',
    isStalled: false,
    stalledDays: 0,
    lastActivityAt: '2026-09-04T15:00:00Z',
    quotationId: 'quote_1034',
    quotationNumber: 'Q-1034',
    originalMargin: 28.5,
    currentMargin: 28.5,
    marginDelta: 0,
    appliedDiscount: 8.0,
    allowedDiscountThreshold: 15.0,
    approvalPending: false,
    approvalPendingRole: 'NONE',
    signals: [
      {
        id: 'sig_106_1',
        type: 'PROBABILITY',
        severity: 'LOW',
        title: 'Deal Won & Closed',
        description: 'Digital signature completed and accepted.',
        detectedAt: '2026-09-04T15:00:00Z',
        status: 'resolved',
      },
    ],
    timeline: [
      {
        id: 'tl_106_1',
        timestamp: 'Sep 4, 2026 · 03:00 PM',
        title: 'Customer Digital Signature Completed',
        description: 'Dr. Elena Rostova signed proposal online.',
        type: 'CUSTOMER_ACTION',
      },
    ],
  },

  'deal-108': {
    dealId: 'deal-108',
    dealName: 'Starlight Media Creative Pro Suite',
    customerId: 'cust_starlight',
    customerName: 'Starlight Media',
    customerTier: 'SILVER',
    ownerId: 'usr_rep_rahul',
    ownerName: 'Rahul Sharma',
    ownerRole: 'Enterprise Account Executive',
    stage: 'proposal',
    value: 415000,
    probability: 65,
    expectedCloseDate: '2026-10-10',
    healthStatus: 'HEALTHY',
    healthScore: 91,
    riskLevel: 'LOW',
    primaryRiskReason: 'Strong margin profile (31.2%) with minimal discounting',
    isStalled: false,
    stalledDays: 0,
    lastActivityAt: '2026-09-03T11:20:00Z',
    quotationId: 'quote_1032',
    quotationNumber: 'Q-1032',
    originalMargin: 32.0,
    currentMargin: 31.2,
    marginDelta: -0.8,
    appliedDiscount: 6.0,
    allowedDiscountThreshold: 12.0,
    approvalPending: false,
    approvalPendingRole: 'NONE',
    signals: [
      {
        id: 'sig_108_1',
        type: 'MARGIN',
        severity: 'LOW',
        title: 'Healthy Margin Guard',
        description: 'Gross margin at 31.2% comfortably exceeds minimum target threshold.',
        detectedAt: '2026-09-03T11:20:00Z',
        status: 'resolved',
      },
    ],
    timeline: [
      {
        id: 'tl_108_1',
        timestamp: 'Sep 3, 2026 · 11:20 AM',
        title: 'Proposal Q-1032 Dispatched',
        description: 'Commercial proposal sent to Starlight Media procurement.',
        type: 'STAGE_CHANGE',
      },
    ],
  },
};

function loadStoredDealHealth(): Record<string, DealHealthDetail> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEAL_HEALTH_DATA));
      return { ...INITIAL_DEAL_HEALTH_DATA };
    }
    return JSON.parse(raw);
  } catch {
    return { ...INITIAL_DEAL_HEALTH_DATA };
  }
}

function saveStoredDealHealth(data: Record<string, DealHealthDetail>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save deal health to localStorage', e);
  }
}

export const dealHealthApi = {
  async getDealHealth(dealId: string): Promise<DealHealthDetail | null> {
    await new Promise((r) => setTimeout(r, 100));
    const all = loadStoredDealHealth();
    return all[dealId] || null;
  },

  async getDealHealthDashboard(filters?: DealHealthFilterOptions): Promise<DealHealthDashboardData> {
    await new Promise((r) => setTimeout(r, 150));
    const all = Object.values(loadStoredDealHealth());

    // Apply filters
    let filtered = [...all];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.dealName.toLowerCase().includes(q) ||
          d.customerName.toLowerCase().includes(q) ||
          d.ownerName.toLowerCase().includes(q)
      );
    }
    if (filters?.health && filters.health !== 'ALL') {
      filtered = filtered.filter((d) => d.healthStatus === filters.health);
    }
    if (filters?.riskLevel && filters.riskLevel !== 'ALL') {
      filtered = filtered.filter((d) => d.riskLevel === filters.riskLevel);
    }
    if (filters?.stage && filters.stage !== 'ALL') {
      filtered = filtered.filter((d) => d.stage.toLowerCase() === filters.stage?.toLowerCase());
    }
    if (filters?.ownerId && filters.ownerId !== 'ALL') {
      filtered = filtered.filter((d) => d.ownerId === filters.ownerId);
    }

    // Calculations
    const totalActiveDeals = filtered.filter((d) => d.stage !== 'lost' && d.stage !== 'won').length;
    const healthyDeals = filtered.filter((d) => d.healthStatus === 'HEALTHY');
    const atRiskDeals = filtered.filter((d) => d.healthStatus === 'AT_RISK');
    const criticalDeals = filtered.filter((d) => d.healthStatus === 'CRITICAL');
    const stalledDealsList = filtered.filter((d) => d.isStalled);

    const totalPipelineValue = filtered
      .filter((d) => d.stage !== 'lost')
      .reduce((sum, d) => sum + d.value, 0);

    const weightedPipelineValue = filtered
      .filter((d) => d.stage !== 'lost')
      .reduce((sum, d) => sum + Math.round((d.value * d.probability) / 100), 0);

    const averageHealthScore = filtered.length
      ? Math.round(filtered.reduce((sum, d) => sum + d.healthScore, 0) / filtered.length)
      : 75;

    const totalCount = filtered.length || 1;
    const healthyDealsPct = Math.round((healthyDeals.length / totalCount) * 100);
    const atRiskDealsPct = Math.round((atRiskDeals.length / totalCount) * 100);
    const criticalDealsPct = Math.round((criticalDeals.length / totalCount) * 100);

    // Distribution
    const distribution = [
      { status: 'HEALTHY' as DealHealthStatus, label: 'Healthy', count: healthyDeals.length, percentage: healthyDealsPct, color: '#10b981' },
      { status: 'AT_RISK' as DealHealthStatus, label: 'At Risk', count: atRiskDeals.length, percentage: atRiskDealsPct, color: '#f59e0b' },
      { status: 'CRITICAL' as DealHealthStatus, label: 'Critical', count: criticalDeals.length, percentage: criticalDealsPct, color: '#ef4444' },
    ];

    // Risk Overview Categories
    const riskOverview = [
      { category: 'Discount Risk', count: filtered.filter((d) => (d.appliedDiscount || 0) > (d.allowedDiscountThreshold || 15)).length, riskLevel: 'HIGH' as RiskLevel, type: 'DISCOUNT' as RiskType },
      { category: 'Margin Erosion', count: filtered.filter((d) => (d.marginDelta || 0) < -5).length, riskLevel: 'HIGH' as RiskLevel, type: 'MARGIN' as RiskType },
      { category: 'Stalled Deals', count: stalledDealsList.length, riskLevel: 'MEDIUM' as RiskLevel, type: 'STALLED' as RiskType },
      { category: 'Approval Bottlenecks', count: filtered.filter((d) => d.approvalPending).length, riskLevel: 'MEDIUM' as RiskLevel, type: 'APPROVAL' as RiskType },
      { category: 'Low Probability', count: filtered.filter((d) => d.probability <= 25 && d.stage !== 'lost').length, riskLevel: 'LOW' as RiskLevel, type: 'PROBABILITY' as RiskType },
    ];

    // Health Trends
    const healthTrends = [
      { period: 'Aug 8', healthy: 18, atRisk: 4, critical: 1, avgScore: 84 },
      { period: 'Aug 15', healthy: 20, atRisk: 5, critical: 2, avgScore: 81 },
      { period: 'Aug 22', healthy: 21, atRisk: 6, critical: 2, avgScore: 79 },
      { period: 'Aug 29', healthy: 19, atRisk: 7, critical: 3, avgScore: 76 },
      { period: 'Sep 5', healthy: healthyDeals.length * 4, atRisk: atRiskDeals.length * 4, critical: criticalDeals.length * 4, avgScore: averageHealthScore },
    ];

    // Pipeline Health by Stage
    const stageMap: Record<string, { label: string; deals: DealHealthDetail[] }> = {
      lead: { label: 'Lead', deals: [] },
      qualified: { label: 'Qualified', deals: [] },
      proposal: { label: 'Proposal', deals: [] },
      negotiation: { label: 'Negotiation', deals: [] },
      won: { label: 'Won', deals: [] },
      lost: { label: 'Lost', deals: [] },
    };

    filtered.forEach((d) => {
      const st = d.stage.toLowerCase();
      if (stageMap[st]) {
        stageMap[st].deals.push(d);
      }
    });

    const pipelineHealth = Object.entries(stageMap).map(([stage, info]) => {
      const dealsCount = info.deals.length;
      const totalValue = info.deals.reduce((acc, it) => acc + it.value, 0);
      const weightedValue = info.deals.reduce((acc, it) => acc + Math.round((it.value * it.probability) / 100), 0);
      const avgScore = dealsCount
        ? Math.round(info.deals.reduce((acc, it) => acc + it.healthScore, 0) / dealsCount)
        : 80;
      const healthStatus: DealHealthStatus =
        avgScore >= 75 ? 'HEALTHY' : avgScore >= 50 ? 'AT_RISK' : 'CRITICAL';

      return {
        stage,
        label: info.label,
        dealsCount,
        totalValue,
        weightedValue,
        healthStatus,
        avgHealthScore: avgScore,
      };
    });

    // Margin Erosion List
    const marginErosion = filtered
      .filter((d) => (d.marginDelta || 0) < 0)
      .map((d) => ({
        dealId: d.dealId,
        dealName: d.dealName,
        customerName: d.customerName,
        originalMargin: d.originalMargin || 25,
        currentMargin: d.currentMargin || 20,
        marginDelta: d.marginDelta || -5,
        riskLevel: d.riskLevel,
        quotationNumber: d.quotationNumber,
      }))
      .sort((a, b) => a.marginDelta - b.marginDelta);

    // Discount Risk Deals
    const highDiscountDeals = filtered
      .filter((d) => (d.appliedDiscount || 0) > 0)
      .map((d) => ({
        dealId: d.dealId,
        dealName: d.dealName,
        customerName: d.customerName,
        appliedDiscount: d.appliedDiscount || 0,
        allowedLimit: d.allowedDiscountThreshold || 15,
        excess: Math.max(0, (d.appliedDiscount || 0) - (d.allowedDiscountThreshold || 15)),
        riskLevel: (d.appliedDiscount || 0) > (d.allowedDiscountThreshold || 15) ? ('HIGH' as RiskLevel) : ('LOW' as RiskLevel),
      }))
      .sort((a, b) => b.appliedDiscount - a.appliedDiscount);

    const averageDiscount = highDiscountDeals.length
      ? Number((highDiscountDeals.reduce((acc, it) => acc + it.appliedDiscount, 0) / highDiscountDeals.length).toFixed(1))
      : 8.4;
    const highestDiscount = highDiscountDeals.length
      ? Math.max(...highDiscountDeals.map((it) => it.appliedDiscount))
      : 28.0;

    // Stalled Deals List
    const stalledDeals = stalledDealsList.map((d) => ({
      dealId: d.dealId,
      dealName: d.dealName,
      customerName: d.customerName,
      ownerName: d.ownerName,
      stalledDays: d.stalledDays,
      lastActivityAt: d.lastActivityAt,
      value: d.value,
      riskScore: d.healthScore,
      healthStatus: d.healthStatus,
    }));

    // Approval Bottlenecks List
    const approvalBottlenecks = {
      managerPendingCount: filtered.filter((d) => d.approvalPendingRole === 'MANAGER').length,
      financePendingCount: filtered.filter((d) => d.approvalPendingRole === 'FINANCE').length,
      longestWaitingDays: Math.max(0, ...filtered.map((d) => d.approvalWaitingDays || 0)),
      bottlenecks: filtered
        .filter((d) => d.approvalPending)
        .map((d) => ({
          dealId: d.dealId,
          dealName: d.dealName,
          customerName: d.customerName,
          quotationNumber: d.quotationNumber || 'N/A',
          waitingRole: (d.approvalPendingRole === 'FINANCE' ? 'Finance' : 'Manager') as 'Manager' | 'Finance',
          waitingDays: d.approvalWaitingDays || 1,
          dealValue: d.value,
          riskLevel: d.riskLevel,
        })),
    };

    // High Risk Deals Table Items
    const highRiskDeals = filtered
      .filter((d) => d.healthStatus === 'CRITICAL' || d.healthStatus === 'AT_RISK')
      .sort((a, b) => a.healthScore - b.healthScore);

    return {
      kpis: {
        totalActiveDeals,
        totalActiveDealsTrend: 12,
        healthyDealsCount: healthyDeals.length,
        healthyDealsPct,
        atRiskDealsCount: atRiskDeals.length,
        atRiskDealsPct,
        criticalDealsCount: criticalDeals.length,
        criticalDealsPct,
        stalledDealsCount: stalledDealsList.length,
        totalPipelineValue,
        weightedPipelineValue,
        averageHealthScore,
      },
      distribution,
      riskOverview,
      healthTrends,
      pipelineHealth,
      marginErosion,
      discountRisk: {
        averageDiscount,
        highestDiscount,
        dealsAboveThresholdCount: highDiscountDeals.filter((d) => d.excess > 0).length,
        deals: highDiscountDeals,
      },
      stalledDeals,
      approvalBottlenecks,
      highRiskDeals,
    };
  },

  // Legacy compat
  async getMetrics(quotationId: string): Promise<DealHealthMetric[]> {
    await new Promise((r) => setTimeout(r, 60));
    return [
      { category: 'MARGIN', score: 82, status: 'HEALTHY', insight: 'Gross margin at 44.8% exceeds minimum target threshold (35%).' },
      { category: 'VELOCITY', score: 68, status: 'WARNING', insight: 'Quotation in review for 4.2 days; standard cycle is 2.1 days.' },
      { category: 'DISCOUNT_COMPLIANCE', score: 60, status: 'WARNING', insight: 'Cloud line discount of 15% required Tier-2 managerial signoff.' },
      { category: 'CUSTOMER_CREDIT', score: 94, status: 'EXCELLENT', insight: 'Customer credit profile is low risk with $195k available limit.' },
      { category: 'FULFILLMENT_FEASIBILITY', score: 90, status: 'HEALTHY', insight: 'All 8 Edge nodes reserved in US East distribution center.' },
    ];
  },

  async getEvents(quotationId?: string): Promise<DealHealthEvent[]> {
    await new Promise((r) => setTimeout(r, 60));
    return [
      { id: 'ev_1', quotationId: quotationId || 'quote_1042', eventType: 'DISCOUNT_SPIKE', severity: 'HIGH', description: 'Setup & deploy line item applied 22% discount', timestamp: '2026-09-02T10:31:00Z', resolved: false },
      { id: 'ev_2', quotationId: quotationId || 'quote_1042', eventType: 'MARGIN_EROSION', severity: 'HIGH', description: 'Projected margin dropped 11.8% below 25% floor', timestamp: '2026-09-02T10:31:00Z', resolved: false },
      { id: 'ev_3', quotationId: quotationId || 'quote_1042', eventType: 'STALLED_IN_APPROVAL', severity: 'MEDIUM', description: 'Approval pending with Sales Manager for 4 days', timestamp: '2026-09-03T09:02:00Z', resolved: false },
    ];
  },
};
