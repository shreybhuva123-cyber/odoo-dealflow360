import {
  ApprovalRequest,
  ApprovalAuditItem,
  ApprovalKpis,
  Quotation,
} from '@/types';

const APPROVALS_STORAGE_KEY = 'dealflow_approvals_v2';
const QUOTATIONS_STORAGE_KEY = 'dealflow_quotations_v2';

export const DEFAULT_MOCK_APPROVALS: ApprovalRequest[] = [
  {
    id: 'appr_req_1042',
    quotationId: 'quote_1042',
    quoteNumber: 'Q-1042',
    customerName: 'Acme Corp',
    customerTier: 'GOLD',
    requestedByRepName: 'A. Morgan',
    requestedByRepId: 'usr_rep_1',
    triggerReason:
      'Service discount (18%) exceeds 10% ceiling. CloudBase Pro discount (30%) exceeds 15% tier ceiling. Overall gross margin (13.2%) is below company threshold (25%).',
    discountAppliedPct: 22.0,
    marginPct: 13.2,
    dealValue: 42500,
    riskScore: 68,
    riskLevel: 'HIGH',
    approvalStage: 'Sales Manager',
    timeInQueue: '1.5 hrs ago',
    status: 'PENDING',
    currentStepIndex: 1,
    createdAt: '2026-09-02T10:14:00Z',
    updatedAt: '2026-09-03T09:02:00Z',
    steps: [
      {
        stepNumber: 1,
        stepName: 'Rep Submission',
        roleRequired: 'SALES_REP',
        approverName: 'A. Morgan',
        status: 'APPROVED',
        comment: 'Standard bundle proposal submitted with aggressive enterprise pricing.',
        decidedAt: '2026-09-02T10:14:00Z',
      },
      {
        stepNumber: 2,
        stepName: 'Sales Manager Review',
        roleRequired: 'SALES_MANAGER',
        approverName: 'Maria Chen',
        status: 'PENDING',
      },
      {
        stepNumber: 3,
        stepName: 'Finance Review',
        roleRequired: 'FINANCE',
        approverName: 'David Park',
        status: 'PENDING',
      },
      {
        stepNumber: 4,
        stepName: 'Final Decision',
        roleRequired: 'SYSTEM',
        status: 'PENDING',
      },
    ],
    discountAnalysis: [
      {
        id: 'da_1',
        productId: 'prod_laptop',
        productName: 'ProLaptop X1 (×10)',
        category: 'Hardware',
        quantity: 10,
        unitPrice: 1200,
        appliedDiscountPct: 15.0,
        categoryCeilingPct: 15.0,
        customerTierCeilingPct: 15.0,
        status: 'PASS',
        variancePts: 0,
      },
      {
        id: 'da_2',
        productId: 'prod_deploy',
        productName: 'Setup & Deploy (Onsite)',
        category: 'Service',
        quantity: 1,
        unitPrice: 1800,
        appliedDiscountPct: 18.0,
        categoryCeilingPct: 10.0,
        customerTierCeilingPct: 15.0,
        status: 'BREACHED',
        variancePts: 8.0,
      },
      {
        id: 'da_3',
        productId: 'prod_cloud',
        productName: 'CloudBase Pro (Annual)',
        category: 'Subscription',
        quantity: 1,
        unitPrice: 299,
        appliedDiscountPct: 30.0,
        categoryCeilingPct: 15.0,
        customerTierCeilingPct: 15.0,
        status: 'BREACHED',
        variancePts: 15.0,
      },
    ],
    riskFactors: [
      {
        id: 'rf_1',
        severity: 'HIGH',
        title: 'Service Discount Limit Exceeded',
        detail: 'Setup & Deploy discount of 18.0% exceeds maximum allowed service discount of 10.0%.',
        impact: 'Loss of $144 on professional services labor margin.',
      },
      {
        id: 'rf_2',
        severity: 'HIGH',
        title: 'Subscription Discount Breaches Gold Ceiling',
        detail: 'CloudBase Pro discount of 30.0% is double the Gold customer ceiling (15.0%).',
        impact: 'High ARR discount will compound on annual contract renewals.',
      },
      {
        id: 'rf_3',
        severity: 'MEDIUM',
        title: 'Gross Margin Compression',
        detail: 'Overall margin of 13.2% is 11.8 percentage points below company target (25.0%).',
        impact: 'Dilutes quarterly sales division profitability target.',
      },
      {
        id: 'rf_4',
        severity: 'LOW',
        title: 'Extended Payment Terms Requested',
        detail: 'Net 60 payment terms requested vs standard Net 30 agreement.',
        impact: 'Requires Finance sign-off on 30-day additional working capital exposure.',
      },
    ],
    auditTrail: [
      {
        id: 'aud_1',
        icon: '📝',
        title: 'Quote Created',
        actor: 'A. Morgan',
        role: 'Sales Representative',
        action: 'CREATED',
        comment: 'Initial draft prepared with hardware units and CloudBase license.',
        timestamp: 'Sep 2, 2026 · 10:14 AM',
      },
      {
        id: 'aud_2',
        icon: '💡',
        title: 'Upsell Bundle Attached',
        actor: 'A. Morgan',
        role: 'Sales Representative',
        action: 'UPDATED',
        comment: 'Added Setup & Deploy and Extended Warranty recommendation.',
        timestamp: 'Sep 2, 2026 · 10:31 AM',
      },
      {
        id: 'aud_3',
        icon: '🔀',
        title: 'Auto-Routed for Approval',
        actor: 'DealFlow Engine',
        role: 'System',
        action: 'ROUTED',
        comment: 'Trigger: High Risk Score (68/100). Service discount breach (+8.0 pts) detected.',
        timestamp: 'Sep 3, 2026 · 09:02 AM',
      },
    ],
    financeDetails: {
      grossRevenue: 42500,
      costOfGoods: 36890,
      netMarginDollars: 5610,
      netMarginPct: 13.2,
      taxTotal: 3612.5,
      paymentTermsRequested: 'Net 60 Days',
      standardPaymentTerms: 'Net 30 Days',
      creditRating: 'A- (Moderate Exposure)',
      creditLimit: 100000,
      outstandingBalance: 18400,
      currency: 'USD',
    },
  },
  {
    id: 'appr_req_1040',
    quotationId: 'quote_1040',
    quoteNumber: 'Q-1040',
    customerName: 'Vertex LLC',
    customerTier: 'GOLD',
    requestedByRepName: 'A. Morgan',
    requestedByRepId: 'usr_rep_1',
    triggerReason:
      'High order volume hardware deal with blended margin (22.4%) approaching the 20% minimum threshold.',
    discountAppliedPct: 14.0,
    marginPct: 22.4,
    dealValue: 83162,
    riskScore: 42,
    riskLevel: 'MEDIUM',
    approvalStage: 'Sales Manager',
    timeInQueue: '3.2 hrs ago',
    status: 'PENDING',
    currentStepIndex: 1,
    createdAt: '2026-08-28T09:00:00Z',
    updatedAt: '2026-09-03T16:00:00Z',
    steps: [
      {
        stepNumber: 1,
        stepName: 'Rep Submission',
        roleRequired: 'SALES_REP',
        approverName: 'A. Morgan',
        status: 'APPROVED',
        comment: 'Volume renewal discount requested for Vertex 40-seat rollout.',
        decidedAt: '2026-08-28T09:00:00Z',
      },
      {
        stepNumber: 2,
        stepName: 'Sales Manager Review',
        roleRequired: 'SALES_MANAGER',
        approverName: 'Maria Chen',
        status: 'PENDING',
      },
      {
        stepNumber: 3,
        stepName: 'Finance Review',
        roleRequired: 'FINANCE',
        approverName: 'David Park',
        status: 'PENDING',
      },
      {
        stepNumber: 4,
        stepName: 'Final Decision',
        roleRequired: 'SYSTEM',
        status: 'PENDING',
      },
    ],
    discountAnalysis: [
      {
        id: 'da_40_1',
        productId: 'prod_laptop',
        productName: 'ProLaptop X1 (×40)',
        category: 'Hardware',
        quantity: 40,
        unitPrice: 1200,
        appliedDiscountPct: 14.0,
        categoryCeilingPct: 15.0,
        customerTierCeilingPct: 15.0,
        status: 'PASS',
        variancePts: 0,
      },
      {
        id: 'da_40_2',
        productId: 'prod_cloud',
        productName: 'CloudBase Pro (×40)',
        category: 'Subscription',
        quantity: 40,
        unitPrice: 299,
        appliedDiscountPct: 12.0,
        categoryCeilingPct: 15.0,
        customerTierCeilingPct: 15.0,
        status: 'PASS',
        variancePts: 0,
      },
    ],
    riskFactors: [
      {
        id: 'rf_40_1',
        severity: 'MEDIUM',
        title: 'Deal Size & Credit Ceiling Check',
        detail: 'Deal value ($83,162) exceeds customer single-order automated credit line of $50,000.',
        impact: 'Requires standard verification of Vertex payment history.',
      },
      {
        id: 'rf_40_2',
        severity: 'LOW',
        title: 'Discount Within Tier',
        detail: 'Applied discount 14.0% is within Gold tier ceiling of 15.0%.',
        impact: 'Low compliance risk.',
      },
    ],
    auditTrail: [
      {
        id: 'aud_40_1',
        icon: '📝',
        title: 'Quote Created',
        actor: 'A. Morgan',
        role: 'Sales Representative',
        action: 'CREATED',
        comment: 'Volume expansion proposal for Vertex LLC.',
        timestamp: 'Aug 28, 2026 · 09:00 AM',
      },
      {
        id: 'aud_40_2',
        icon: '🔀',
        title: 'Routed for Approval',
        actor: 'DealFlow Engine',
        role: 'System',
        action: 'ROUTED',
        comment: 'High total deal value ($83,162) requires Sales Manager concurrence.',
        timestamp: 'Sep 3, 2026 · 04:00 PM',
      },
    ],
    financeDetails: {
      grossRevenue: 83162,
      costOfGoods: 64500,
      netMarginDollars: 18662,
      netMarginPct: 22.4,
      taxTotal: 12685.8,
      paymentTermsRequested: 'Net 30 Days',
      standardPaymentTerms: 'Net 30 Days',
      creditRating: 'AAA (Exceptional History)',
      creditLimit: 250000,
      outstandingBalance: 12000,
      currency: 'USD',
    },
  },
  {
    id: 'appr_req_1037',
    quotationId: 'quote_1037',
    quoteNumber: 'Q-1037',
    customerName: 'PeakSoft Ltd',
    customerTier: 'SILVER',
    requestedByRepName: 'Sarah Jenkins',
    requestedByRepId: 'usr_rep_2',
    triggerReason:
      'Silver customer discount (15%) breaches Silver tier ceiling of 10%. Sales Manager has approved; awaiting Finance sign-off.',
    discountAppliedPct: 15.0,
    marginPct: 19.8,
    dealValue: 55000,
    riskScore: 45,
    riskLevel: 'MEDIUM',
    approvalStage: 'Finance',
    timeInQueue: '4.8 hrs ago',
    status: 'PENDING',
    currentStepIndex: 2,
    createdAt: '2026-08-30T11:00:00Z',
    updatedAt: '2026-09-04T10:15:00Z',
    steps: [
      {
        stepNumber: 1,
        stepName: 'Rep Submission',
        roleRequired: 'SALES_REP',
        approverName: 'Sarah Jenkins',
        status: 'APPROVED',
        comment: 'Negotiated multi-year commitment with PeakSoft VP of Tech.',
        decidedAt: '2026-08-30T11:00:00Z',
      },
      {
        stepNumber: 2,
        stepName: 'Sales Manager Review',
        roleRequired: 'SALES_MANAGER',
        approverName: 'Maria Chen',
        status: 'APPROVED',
        comment: 'Approved in view of 3-year recurring software contract value.',
        decidedAt: '2026-09-04T10:15:00Z',
      },
      {
        stepNumber: 3,
        stepName: 'Finance Review',
        roleRequired: 'FINANCE',
        approverName: 'David Park',
        status: 'PENDING',
      },
      {
        stepNumber: 4,
        stepName: 'Final Decision',
        roleRequired: 'SYSTEM',
        status: 'PENDING',
      },
    ],
    discountAnalysis: [
      {
        id: 'da_37_1',
        productId: 'prod_cloud',
        productName: 'CloudBase Pro Multi-Tenant',
        category: 'Subscription',
        quantity: 20,
        unitPrice: 299,
        appliedDiscountPct: 15.0,
        categoryCeilingPct: 15.0,
        customerTierCeilingPct: 10.0,
        status: 'BREACHED',
        variancePts: 5.0,
      },
    ],
    riskFactors: [
      {
        id: 'rf_37_1',
        severity: 'MEDIUM',
        title: 'Customer Tier Discount Exceeded',
        detail: 'PeakSoft has Silver tier (max 10%), but quote specifies 15.0% discount.',
        impact: '+5% discount variance above authorized tier limit.',
      },
    ],
    auditTrail: [
      {
        id: 'aud_37_1',
        icon: '📝',
        title: 'Quote Created',
        actor: 'Sarah Jenkins',
        role: 'Sales Representative',
        action: 'CREATED',
        timestamp: 'Aug 30, 2026 · 11:00 AM',
      },
      {
        id: 'aud_37_2',
        icon: '✅',
        title: 'Approved by Sales Manager',
        actor: 'Maria Chen',
        role: 'Sales Manager',
        action: 'APPROVED',
        comment: 'Approved — 3 year ARR value justifies extra 5% concession.',
        timestamp: 'Sep 4, 2026 · 10:15 AM',
      },
    ],
    financeDetails: {
      grossRevenue: 55000,
      costOfGoods: 44100,
      netMarginDollars: 10900,
      netMarginPct: 19.8,
      taxTotal: 4400,
      paymentTermsRequested: 'Net 45 Days',
      standardPaymentTerms: 'Net 30 Days',
      creditRating: 'A (Good Standing)',
      creditLimit: 75000,
      outstandingBalance: 6500,
      currency: 'USD',
    },
  },
  {
    id: 'appr_req_1036',
    quotationId: 'quote_1036',
    quoteNumber: 'Q-1036',
    customerName: 'OmniCorp Global',
    customerTier: 'GOLD',
    requestedByRepName: 'S. Patel',
    requestedByRepId: 'usr_rep_3',
    triggerReason:
      'Massive enterprise deal ($128k) requesting 28% discount, breaching Gold tier limit (15%) by 13 points with severely compressed margin (11.5%).',
    discountAppliedPct: 28.0,
    marginPct: 11.5,
    dealValue: 128000,
    riskScore: 82,
    riskLevel: 'HIGH',
    approvalStage: 'Sales Manager',
    timeInQueue: '5.6 hrs ago',
    status: 'PENDING',
    currentStepIndex: 1,
    createdAt: '2026-09-01T08:30:00Z',
    updatedAt: '2026-09-04T08:00:00Z',
    steps: [
      {
        stepNumber: 1,
        stepName: 'Rep Submission',
        roleRequired: 'SALES_REP',
        approverName: 'S. Patel',
        status: 'APPROVED',
        comment: 'Competitive RFP against rival vendor; high discount requested to win deal.',
        decidedAt: '2026-09-01T08:30:00Z',
      },
      {
        stepNumber: 2,
        stepName: 'Sales Manager Review',
        roleRequired: 'SALES_MANAGER',
        approverName: 'Maria Chen',
        status: 'PENDING',
      },
      {
        stepNumber: 3,
        stepName: 'Finance Review',
        roleRequired: 'FINANCE',
        approverName: 'David Park',
        status: 'PENDING',
      },
      {
        stepNumber: 4,
        stepName: 'Final Decision',
        roleRequired: 'SYSTEM',
        status: 'PENDING',
      },
    ],
    discountAnalysis: [
      {
        id: 'da_36_1',
        productId: 'prod_hardware_fleet',
        productName: 'Workstation Fleet Bundle',
        category: 'Hardware',
        quantity: 50,
        unitPrice: 2000,
        appliedDiscountPct: 28.0,
        categoryCeilingPct: 15.0,
        customerTierCeilingPct: 15.0,
        status: 'BREACHED',
        variancePts: 13.0,
      },
    ],
    riskFactors: [
      {
        id: 'rf_36_1',
        severity: 'HIGH',
        title: 'Severe Discount Breach (+13 pts)',
        detail: 'Applied 28.0% vs maximum allowed 15.0% Gold discount limit.',
        impact: 'Direct top-line erosion of $35,840.',
      },
      {
        id: 'rf_36_2',
        severity: 'HIGH',
        title: 'Critically Low Margin (11.5%)',
        detail: 'Below minimum 15% stop-loss margin policy.',
        impact: 'Will require VP Sales / CFO co-signature.',
      },
    ],
    auditTrail: [
      {
        id: 'aud_36_1',
        icon: '📝',
        title: 'Quote Created',
        actor: 'S. Patel',
        role: 'Sales Representative',
        action: 'CREATED',
        timestamp: 'Sep 1, 2026 · 08:30 AM',
      },
      {
        id: 'aud_36_2',
        icon: '⚠️',
        title: 'Critical Risk Flagged',
        actor: 'DealFlow Engine',
        role: 'System',
        action: 'ALERT',
        comment: 'Risk Score 82/100 (HIGH). Margin 11.5% violates stop-loss policy.',
        timestamp: 'Sep 4, 2026 · 08:00 AM',
      },
    ],
    financeDetails: {
      grossRevenue: 128000,
      costOfGoods: 113280,
      netMarginDollars: 14720,
      netMarginPct: 11.5,
      taxTotal: 10240,
      paymentTermsRequested: 'Net 90 Days',
      standardPaymentTerms: 'Net 30 Days',
      creditRating: 'BBB (Requires Monitor)',
      creditLimit: 150000,
      outstandingBalance: 42000,
      currency: 'USD',
    },
  },
  {
    id: 'appr_req_1035',
    quotationId: 'quote_1035',
    quoteNumber: 'Q-1035',
    customerName: 'HyperScale Systems',
    customerTier: 'BRONZE',
    requestedByRepName: 'J. Liu',
    requestedByRepId: 'usr_rep_4',
    triggerReason:
      'Service discount 24% rejected by manager. Returned to sales rep with feedback to reduce service discount to ≤10%.',
    discountAppliedPct: 24.0,
    marginPct: 14.1,
    dealValue: 34200,
    riskScore: 72,
    riskLevel: 'HIGH',
    approvalStage: 'Revision Requested',
    timeInQueue: '8.4 hrs ago',
    status: 'PENDING_REVISION',
    currentStepIndex: 1,
    createdAt: '2026-08-29T14:00:00Z',
    updatedAt: '2026-09-04T12:30:00Z',
    steps: [
      {
        stepNumber: 1,
        stepName: 'Rep Submission',
        roleRequired: 'SALES_REP',
        approverName: 'J. Liu',
        status: 'APPROVED',
        comment: 'Initial quote with 24% discount for client incentive.',
        decidedAt: '2026-08-29T14:00:00Z',
      },
      {
        stepNumber: 2,
        stepName: 'Sales Manager Review',
        roleRequired: 'SALES_MANAGER',
        approverName: 'Maria Chen',
        status: 'RETURNED',
        comment: 'Returned for revision: Service discount of 24% cannot be approved. Cap it at 10% and resubmit.',
        decidedAt: '2026-09-04T12:30:00Z',
      },
      {
        stepNumber: 3,
        stepName: 'Finance Review',
        roleRequired: 'FINANCE',
        approverName: 'David Park',
        status: 'PENDING',
      },
      {
        stepNumber: 4,
        stepName: 'Final Decision',
        roleRequired: 'SYSTEM',
        status: 'PENDING',
      },
    ],
    discountAnalysis: [
      {
        id: 'da_35_1',
        productId: 'prod_deploy',
        productName: 'Setup & Deploy Custom',
        category: 'Service',
        quantity: 2,
        unitPrice: 1800,
        appliedDiscountPct: 24.0,
        categoryCeilingPct: 10.0,
        customerTierCeilingPct: 5.0,
        status: 'BREACHED',
        variancePts: 14.0,
      },
    ],
    riskFactors: [
      {
        id: 'rf_35_1',
        severity: 'HIGH',
        title: 'Returned for Revision by Manager',
        detail: 'Maria Chen requested reducing service discount from 24% to ≤10%.',
        impact: 'Quote awaiting rep modification.',
      },
    ],
    auditTrail: [
      {
        id: 'aud_35_1',
        icon: '📝',
        title: 'Quote Created',
        actor: 'J. Liu',
        role: 'Sales Representative',
        action: 'CREATED',
        timestamp: 'Aug 29, 2026 · 02:00 PM',
      },
      {
        id: 'aud_35_2',
        icon: '↩️',
        title: 'Returned for Revision',
        actor: 'Maria Chen',
        role: 'Sales Manager',
        action: 'RETURNED',
        comment: 'Cap service discount to 10% and resubmit for immediate sign-off.',
        timestamp: 'Sep 4, 2026 · 12:30 PM',
      },
    ],
    financeDetails: {
      grossRevenue: 34200,
      costOfGoods: 29377,
      netMarginDollars: 4823,
      netMarginPct: 14.1,
      taxTotal: 2736,
      paymentTermsRequested: 'Net 30 Days',
      standardPaymentTerms: 'Net 30 Days',
      creditRating: 'B+ (Satisfactory)',
      creditLimit: 50000,
      outstandingBalance: 4100,
      currency: 'USD',
    },
  },
  {
    id: 'appr_req_1034',
    quotationId: 'quote_1034',
    quoteNumber: 'Q-1034',
    customerName: 'Quantum Dynamics',
    customerTier: 'GOLD',
    requestedByRepName: 'Sarah Jenkins',
    requestedByRepId: 'usr_rep_2',
    triggerReason:
      'Low risk quote approved by Sales Manager and Finance team today.',
    discountAppliedPct: 9.0,
    marginPct: 28.5,
    dealValue: 67800,
    riskScore: 18,
    riskLevel: 'LOW',
    approvalStage: 'Fully Approved',
    timeInQueue: 'Completed',
    status: 'APPROVED',
    currentStepIndex: 3,
    createdAt: '2026-09-04T07:00:00Z',
    updatedAt: '2026-09-04T15:00:00Z',
    steps: [
      {
        stepNumber: 1,
        stepName: 'Rep Submission',
        roleRequired: 'SALES_REP',
        approverName: 'Sarah Jenkins',
        status: 'APPROVED',
        decidedAt: '2026-09-04T07:00:00Z',
      },
      {
        stepNumber: 2,
        stepName: 'Sales Manager Review',
        roleRequired: 'SALES_MANAGER',
        approverName: 'Maria Chen',
        status: 'APPROVED',
        comment: 'High margin deal with excellent bundle terms. Fully approved.',
        decidedAt: '2026-09-04T09:30:00Z',
      },
      {
        stepNumber: 3,
        stepName: 'Finance Review',
        roleRequired: 'FINANCE',
        approverName: 'David Park',
        status: 'APPROVED',
        comment: 'Terms and cash flow metrics verified. Approved for delivery.',
        decidedAt: '2026-09-04T15:00:00Z',
      },
      {
        stepNumber: 4,
        stepName: 'Final Decision',
        roleRequired: 'SYSTEM',
        status: 'APPROVED',
        comment: 'DealFlow Engine dispatched customer contract packet.',
        decidedAt: '2026-09-04T15:00:00Z',
      },
    ],
    discountAnalysis: [
      {
        id: 'da_34_1',
        productId: 'prod_cloud',
        productName: 'CloudBase Enterprise',
        category: 'Subscription',
        quantity: 15,
        unitPrice: 500,
        appliedDiscountPct: 9.0,
        categoryCeilingPct: 15.0,
        customerTierCeilingPct: 15.0,
        status: 'PASS',
        variancePts: 0,
      },
    ],
    riskFactors: [
      {
        id: 'rf_34_1',
        severity: 'LOW',
        title: 'Healthy Deal Parameters',
        detail: '9% discount within 15% policy; healthy 28.5% gross margin.',
        impact: 'Positive net profit contribution.',
      },
    ],
    auditTrail: [
      {
        id: 'aud_34_1',
        icon: '📝',
        title: 'Quote Created',
        actor: 'Sarah Jenkins',
        role: 'Sales Representative',
        action: 'CREATED',
        timestamp: 'Sep 4, 2026 · 07:00 AM',
      },
      {
        id: 'aud_34_2',
        icon: '✅',
        title: 'Manager Approval Granted',
        actor: 'Maria Chen',
        role: 'Sales Manager',
        action: 'APPROVED',
        timestamp: 'Sep 4, 2026 · 09:30 AM',
      },
      {
        id: 'aud_34_3',
        icon: '✅',
        title: 'Finance Sign-Off',
        actor: 'David Park',
        role: 'Finance',
        action: 'APPROVED',
        timestamp: 'Sep 4, 2026 · 03:00 PM',
      },
    ],
    financeDetails: {
      grossRevenue: 67800,
      costOfGoods: 48477,
      netMarginDollars: 19323,
      netMarginPct: 28.5,
      taxTotal: 5424,
      paymentTermsRequested: 'Net 30 Days',
      standardPaymentTerms: 'Net 30 Days',
      creditRating: 'AAA',
      creditLimit: 200000,
      outstandingBalance: 0,
      currency: 'USD',
    },
  },
  {
    id: 'appr_req_1033',
    quotationId: 'quote_1033',
    quoteNumber: 'Q-1033',
    customerName: 'Nexus Technologies',
    customerTier: 'SILVER',
    requestedByRepName: 'A. Morgan',
    requestedByRepId: 'usr_rep_1',
    triggerReason:
      'Rejected by Finance due to unapproved Net 90 payment terms with customer carrying overdue invoice balances.',
    discountAppliedPct: 16.0,
    marginPct: 21.0,
    dealValue: 19400,
    riskScore: 54,
    riskLevel: 'MEDIUM',
    approvalStage: 'Rejected',
    timeInQueue: 'Completed',
    status: 'REJECTED',
    currentStepIndex: 2,
    createdAt: '2026-08-27T10:00:00Z',
    updatedAt: '2026-09-02T16:45:00Z',
    steps: [
      {
        stepNumber: 1,
        stepName: 'Rep Submission',
        roleRequired: 'SALES_REP',
        approverName: 'A. Morgan',
        status: 'APPROVED',
        decidedAt: '2026-08-27T10:00:00Z',
      },
      {
        stepNumber: 2,
        stepName: 'Sales Manager Review',
        roleRequired: 'SALES_MANAGER',
        approverName: 'Maria Chen',
        status: 'APPROVED',
        comment: 'Approved subject to Finance credit clearance.',
        decidedAt: '2026-08-28T14:00:00Z',
      },
      {
        stepNumber: 3,
        stepName: 'Finance Review',
        roleRequired: 'FINANCE',
        approverName: 'David Park',
        status: 'REJECTED',
        comment:
          'Rejected: Nexus has $32,000 overdue across 90+ days. Net 90 extension cannot be granted without payment.',
        decidedAt: '2026-09-02T16:45:00Z',
      },
      {
        stepNumber: 4,
        stepName: 'Final Decision',
        roleRequired: 'SYSTEM',
        status: 'REJECTED',
        comment: 'System closed quote as REJECTED.',
        decidedAt: '2026-09-02T16:45:00Z',
      },
    ],
    discountAnalysis: [
      {
        id: 'da_33_1',
        productId: 'prod_deploy',
        productName: 'Setup & Deploy',
        category: 'Service',
        quantity: 1,
        unitPrice: 1800,
        appliedDiscountPct: 16.0,
        categoryCeilingPct: 10.0,
        customerTierCeilingPct: 10.0,
        status: 'BREACHED',
        variancePts: 6.0,
      },
    ],
    riskFactors: [
      {
        id: 'rf_33_1',
        severity: 'HIGH',
        title: 'Overdue Receivable Delinquency',
        detail: 'Customer has $32,000 pending in collections from Q1 2026.',
        impact: 'Severe credit risk.',
      },
    ],
    auditTrail: [
      {
        id: 'aud_33_1',
        icon: '📝',
        title: 'Quote Created',
        actor: 'A. Morgan',
        role: 'Sales Representative',
        action: 'CREATED',
        timestamp: 'Aug 27, 2026 · 10:00 AM',
      },
      {
        id: 'aud_33_2',
        icon: '❌',
        title: 'Rejected by Finance',
        actor: 'David Park',
        role: 'Finance',
        action: 'REJECTED',
        comment: 'Payment delinquency prevents granting Net 90 terms.',
        timestamp: 'Sep 2, 2026 · 04:45 PM',
      },
    ],
    financeDetails: {
      grossRevenue: 19400,
      costOfGoods: 15326,
      netMarginDollars: 4074,
      netMarginPct: 21.0,
      taxTotal: 1552,
      paymentTermsRequested: 'Net 90 Days',
      standardPaymentTerms: 'Net 30 Days',
      creditRating: 'C (High Risk - Delinquent)',
      creditLimit: 30000,
      outstandingBalance: 32000,
      currency: 'USD',
    },
  },
  {
    id: 'appr_req_1032',
    quotationId: 'quote_1032',
    quoteNumber: 'Q-1032',
    customerName: 'Atlas Cloud Corp',
    customerTier: 'GOLD',
    requestedByRepName: 'S. Patel',
    requestedByRepId: 'usr_rep_3',
    triggerReason: 'Cloud migration services discount of 14% exceeds standard 10% threshold.',
    discountAppliedPct: 14.0,
    marginPct: 23.5,
    dealValue: 92400,
    riskScore: 36,
    riskLevel: 'MEDIUM',
    approvalStage: 'Sales Manager',
    timeInQueue: '2.1 hrs ago',
    status: 'PENDING',
    currentStepIndex: 1,
    createdAt: '2026-09-04T08:00:00Z',
    updatedAt: '2026-09-04T14:20:00Z',
    steps: [
      {
        stepNumber: 1,
        stepName: 'Rep Submission',
        roleRequired: 'SALES_REP',
        approverName: 'S. Patel',
        status: 'APPROVED',
        decidedAt: '2026-09-04T08:00:00Z',
      },
      {
        stepNumber: 2,
        stepName: 'Sales Manager Review',
        roleRequired: 'SALES_MANAGER',
        approverName: 'Maria Chen',
        status: 'PENDING',
      },
      {
        stepNumber: 3,
        stepName: 'Finance Review',
        roleRequired: 'FINANCE',
        approverName: 'David Park',
        status: 'PENDING',
      },
      {
        stepNumber: 4,
        stepName: 'Final Decision',
        roleRequired: 'SYSTEM',
        status: 'PENDING',
      },
    ],
    discountAnalysis: [],
    riskFactors: [],
    auditTrail: [],
    financeDetails: {
      grossRevenue: 92400,
      costOfGoods: 70686,
      netMarginDollars: 21714,
      netMarginPct: 23.5,
      taxTotal: 7392,
      paymentTermsRequested: 'Net 30 Days',
      standardPaymentTerms: 'Net 30 Days',
      creditRating: 'A+',
      creditLimit: 150000,
      outstandingBalance: 8200,
      currency: 'USD',
    },
  },
  {
    id: 'appr_req_1031',
    quotationId: 'quote_1031',
    quoteNumber: 'Q-1031',
    customerName: 'BlueSky Healthcare',
    customerTier: 'SILVER',
    requestedByRepName: 'Sarah Jenkins',
    requestedByRepId: 'usr_rep_2',
    triggerReason: 'Healthcare HIPAA compliance warranty discount exceeds standard margin limit.',
    discountAppliedPct: 11.0,
    marginPct: 26.2,
    dealValue: 48000,
    riskScore: 22,
    riskLevel: 'LOW',
    approvalStage: 'Sales Manager',
    timeInQueue: '6.5 hrs ago',
    status: 'PENDING',
    currentStepIndex: 1,
    createdAt: '2026-09-04T09:15:00Z',
    updatedAt: '2026-09-04T11:00:00Z',
    steps: [
      {
        stepNumber: 1,
        stepName: 'Rep Submission',
        roleRequired: 'SALES_REP',
        approverName: 'Sarah Jenkins',
        status: 'APPROVED',
        decidedAt: '2026-09-04T09:15:00Z',
      },
      {
        stepNumber: 2,
        stepName: 'Sales Manager Review',
        roleRequired: 'SALES_MANAGER',
        approverName: 'Maria Chen',
        status: 'PENDING',
      },
      {
        stepNumber: 3,
        stepName: 'Finance Review',
        roleRequired: 'FINANCE',
        approverName: 'David Park',
        status: 'PENDING',
      },
      {
        stepNumber: 4,
        stepName: 'Final Decision',
        roleRequired: 'SYSTEM',
        status: 'PENDING',
      },
    ],
    discountAnalysis: [],
    riskFactors: [],
    auditTrail: [],
    financeDetails: {
      grossRevenue: 48000,
      costOfGoods: 35424,
      netMarginDollars: 12576,
      netMarginPct: 26.2,
      taxTotal: 3840,
      paymentTermsRequested: 'Net 30 Days',
      standardPaymentTerms: 'Net 30 Days',
      creditRating: 'AA',
      creditLimit: 120000,
      outstandingBalance: 0,
      currency: 'USD',
    },
  },
];

function loadApprovals(): ApprovalRequest[] {
  try {
    const raw = localStorage.getItem(APPROVALS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(APPROVALS_STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_APPROVALS));
      return DEFAULT_MOCK_APPROVALS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_MOCK_APPROVALS;
  }
}

function saveApprovals(approvals: ApprovalRequest[]): void {
  try {
    localStorage.setItem(APPROVALS_STORAGE_KEY, JSON.stringify(approvals));
  } catch (err) {
    console.error('Failed to save approvals to localStorage', err);
  }
}

function syncQuotationStatus(
  quoteNumber: string,
  quotationId: string,
  status: 'APPROVED' | 'REJECTED' | 'DRAFT' | 'PENDING_APPROVAL'
) {
  try {
    const rawQuotes = localStorage.getItem(QUOTATIONS_STORAGE_KEY);
    if (!rawQuotes) return;
    const quotes: Quotation[] = JSON.parse(rawQuotes);
    const updated = quotes.map((q) => {
      if (q.quoteNumber === quoteNumber || q.id === quotationId) {
        return {
          ...q,
          status,
          updatedAt: new Date().toISOString(),
        };
      }
      return q;
    });
    localStorage.setItem(QUOTATIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to sync quotation status', err);
  }
}

export const approvalsApi = {
  async getAll(): Promise<ApprovalRequest[]> {
    return loadApprovals();
  },

  async getById(idOrQuote: string): Promise<ApprovalRequest | null> {
    const approvals = loadApprovals();
    const query = idOrQuote.toLowerCase().trim();
    const found = approvals.find(
      (a) =>
        a.id.toLowerCase() === query ||
        a.quotationId.toLowerCase() === query ||
        a.quoteNumber.toLowerCase() === query
    );
    return found || null;
  },

  async getKpis(): Promise<ApprovalKpis> {
    const list = loadApprovals();
    const pendingCount = list.filter((a) => a.status === 'PENDING').length;
    const highRiskCount = list.filter((a) => a.riskLevel === 'HIGH' && a.status === 'PENDING').length;
    const approvedTodayCount = list.filter((a) => a.status === 'APPROVED').length;

    return {
      pendingCount: pendingCount || 12,
      highRiskCount: highRiskCount || 4,
      avgApprovalHours: 2.4,
      approvedTodayCount: approvedTodayCount || 8,
    };
  },

  async approve(
    id: string,
    comment?: string,
    approverName: string = 'Maria Chen',
    role: string = 'SALES_MANAGER'
  ): Promise<ApprovalRequest> {
    const list = loadApprovals();
    const idx = list.findIndex((a) => a.id === id || a.quotationId === id || a.quoteNumber === id);
    if (idx === -1) {
      throw new Error(`Approval request ${id} not found.`);
    }

    const current = list[idx];
    const now = new Date();
    const timestampStr = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) + ' · ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Step logic
    const updatedSteps = [...current.steps];
    let newStatus = current.status;
    let newStage = current.approvalStage;
    let nextStepIndex = current.currentStepIndex;

    // If currently at Step 1 (Sales Manager)
    if (current.currentStepIndex <= 1) {
      updatedSteps[1] = {
        ...updatedSteps[1],
        status: 'APPROVED',
        approverName,
        comment: comment || 'Approved by Sales Manager.',
        decidedAt: now.toISOString(),
      };

      // Check if Finance review is required (high risk or discount > 15% or margin < 20%)
      const needsFinance =
        current.riskLevel === 'HIGH' ||
        current.discountAppliedPct > 15 ||
        current.marginPct < 20 ||
        updatedSteps.length > 2;

      if (needsFinance && updatedSteps[2]) {
        nextStepIndex = 2;
        newStage = 'Finance';
        newStatus = 'PENDING';
        updatedSteps[2] = {
          ...updatedSteps[2],
          status: 'PENDING',
        };
      } else {
        // Fully approved
        nextStepIndex = updatedSteps.length - 1;
        newStage = 'Fully Approved';
        newStatus = 'APPROVED';
        if (updatedSteps[updatedSteps.length - 1]) {
          updatedSteps[updatedSteps.length - 1].status = 'APPROVED';
          updatedSteps[updatedSteps.length - 1].decidedAt = now.toISOString();
        }
        syncQuotationStatus(current.quoteNumber, current.quotationId, 'APPROVED');
      }
    } else if (current.currentStepIndex === 2) {
      // Finance step approved
      updatedSteps[2] = {
        ...updatedSteps[2],
        status: 'APPROVED',
        approverName: approverName || 'David Park',
        comment: comment || 'Approved by Finance.',
        decidedAt: now.toISOString(),
      };
      nextStepIndex = updatedSteps.length - 1;
      newStage = 'Fully Approved';
      newStatus = 'APPROVED';
      if (updatedSteps[updatedSteps.length - 1]) {
        updatedSteps[updatedSteps.length - 1].status = 'APPROVED';
        updatedSteps[updatedSteps.length - 1].decidedAt = now.toISOString();
      }
      syncQuotationStatus(current.quoteNumber, current.quotationId, 'APPROVED');
    }

    const newAuditEntry: ApprovalAuditItem = {
      id: `aud_${Date.now()}`,
      icon: '✅',
      title: `${approverName} · Approved (${role.replace('_', ' ')})`,
      actor: approverName,
      role: role.replace('_', ' '),
      action: 'APPROVED',
      comment: comment || (newStatus === 'APPROVED' ? 'Final approval granted.' : 'Forwarded to Finance review.'),
      timestamp: timestampStr,
    };

    const updatedApproval: ApprovalRequest = {
      ...current,
      steps: updatedSteps,
      currentStepIndex: nextStepIndex,
      status: newStatus,
      approvalStage: newStage,
      updatedAt: now.toISOString(),
      auditTrail: [newAuditEntry, ...current.auditTrail],
    };

    list[idx] = updatedApproval;
    saveApprovals(list);
    return updatedApproval;
  },

  async reject(
    id: string,
    reason: string,
    approverName: string = 'Maria Chen',
    role: string = 'SALES_MANAGER'
  ): Promise<ApprovalRequest> {
    if (!reason || reason.trim().length === 0) {
      throw new Error('A rejection reason is mandatory.');
    }

    const list = loadApprovals();
    const idx = list.findIndex((a) => a.id === id || a.quotationId === id || a.quoteNumber === id);
    if (idx === -1) {
      throw new Error(`Approval request ${id} not found.`);
    }

    const current = list[idx];
    const now = new Date();
    const timestampStr = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) + ' · ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const updatedSteps = current.steps.map((step, sIdx) => {
      if (sIdx === current.currentStepIndex) {
        return {
          ...step,
          status: 'REJECTED' as const,
          approverName,
          comment: reason,
          decidedAt: now.toISOString(),
        };
      }
      return step;
    });

    const newAuditEntry: ApprovalAuditItem = {
      id: `aud_${Date.now()}`,
      icon: '❌',
      title: `${approverName} · Rejected Quote`,
      actor: approverName,
      role: role.replace('_', ' '),
      action: 'REJECTED',
      comment: `Reason: ${reason}`,
      timestamp: timestampStr,
    };

    const updatedApproval: ApprovalRequest = {
      ...current,
      steps: updatedSteps,
      status: 'REJECTED',
      approvalStage: 'Rejected',
      updatedAt: now.toISOString(),
      auditTrail: [newAuditEntry, ...current.auditTrail],
    };

    list[idx] = updatedApproval;
    saveApprovals(list);
    syncQuotationStatus(current.quoteNumber, current.quotationId, 'REJECTED');
    return updatedApproval;
  },

  async returnForRevision(
    id: string,
    feedback: string,
    approverName: string = 'Maria Chen',
    role: string = 'SALES_MANAGER'
  ): Promise<ApprovalRequest> {
    if (!feedback || feedback.trim().length === 0) {
      throw new Error('Feedback instructions are required when returning for revision.');
    }

    const list = loadApprovals();
    const idx = list.findIndex((a) => a.id === id || a.quotationId === id || a.quoteNumber === id);
    if (idx === -1) {
      throw new Error(`Approval request ${id} not found.`);
    }

    const current = list[idx];
    const now = new Date();
    const timestampStr = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) + ' · ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const updatedSteps = current.steps.map((step, sIdx) => {
      if (sIdx === current.currentStepIndex) {
        return {
          ...step,
          status: 'RETURNED' as const,
          approverName,
          comment: feedback,
          decidedAt: now.toISOString(),
        };
      }
      return step;
    });

    const newAuditEntry: ApprovalAuditItem = {
      id: `aud_${Date.now()}`,
      icon: '↩️',
      title: `${approverName} · Returned for Revision`,
      actor: approverName,
      role: role.replace('_', ' '),
      action: 'RETURNED',
      comment: `Instructions: ${feedback}`,
      timestamp: timestampStr,
    };

    const updatedApproval: ApprovalRequest = {
      ...current,
      steps: updatedSteps,
      status: 'PENDING_REVISION',
      approvalStage: 'Revision Requested',
      updatedAt: now.toISOString(),
      auditTrail: [newAuditEntry, ...current.auditTrail],
    };

    list[idx] = updatedApproval;
    saveApprovals(list);
    syncQuotationStatus(current.quoteNumber, current.quotationId, 'DRAFT');
    return updatedApproval;
  },
};
