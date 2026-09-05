export type ApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'RETURNED'
  | 'PENDING_REVISION'
  | 'ESCALATED';

export type ApprovalRiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface DiscountRule {
  id: string;
  name: string;
  maxDiscountWithoutApproval: number; // e.g. 10%
  requiresManagerApprovalAbove: number; // e.g. 10% - 20%
  requiresVPApprovalAbove: number; // e.g. > 20%
  minMarginThreshold: number; // e.g. 25%
}

export interface ApprovalStep {
  stepNumber: number;
  stepName: string;
  roleRequired: 'SALES_REP' | 'SALES_MANAGER' | 'FINANCE' | 'VP_SALES' | 'SYSTEM';
  approverId?: string;
  approverName?: string;
  status: ApprovalStatus;
  comment?: string;
  decidedAt?: string;
}

export interface DiscountAnalysisItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  appliedDiscountPct: number;
  categoryCeilingPct: number;
  customerTierCeilingPct: number;
  status: 'PASS' | 'BREACHED';
  variancePts: number;
}

export interface RiskFactor {
  id: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  detail: string;
  impact: string;
}

export interface ApprovalAuditItem {
  id: string;
  icon: string;
  title: string;
  actor: string;
  role: string;
  action: string;
  comment?: string;
  timestamp: string;
}

export interface FinanceReviewDetails {
  grossRevenue: number;
  costOfGoods: number;
  netMarginDollars: number;
  netMarginPct: number;
  taxTotal: number;
  paymentTermsRequested: string;
  standardPaymentTerms: string;
  creditRating: string;
  creditLimit: number;
  outstandingBalance: number;
  currency: string;
}

export interface ApprovalRequest {
  id: string;
  quotationId: string;
  quoteNumber: string;
  customerName: string;
  customerTier?: 'GOLD' | 'SILVER' | 'BRONZE';
  requestedByRepName: string;
  requestedByRepId: string;
  triggerReason: string;
  discountAppliedPct: number;
  marginPct: number;
  dealValue: number;
  riskScore: number; // 0 - 100
  riskLevel: ApprovalRiskLevel;
  approvalStage: string; // e.g. "Sales Manager", "Finance", "Fully Approved", "Revision Requested"
  timeInQueue: string;
  status: ApprovalStatus;
  currentStepIndex: number;
  steps: ApprovalStep[];
  discountAnalysis: DiscountAnalysisItem[];
  riskFactors: RiskFactor[];
  auditTrail: ApprovalAuditItem[];
  financeDetails: FinanceReviewDetails;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalKpis {
  pendingCount: number;
  highRiskCount: number;
  avgApprovalHours: number;
  approvedTodayCount: number;
}
