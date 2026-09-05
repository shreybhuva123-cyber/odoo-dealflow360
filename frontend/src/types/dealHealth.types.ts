export type DealHealthStatus = 'HEALTHY' | 'AT_RISK' | 'CRITICAL';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type RiskType =
  | 'DISCOUNT'
  | 'MARGIN'
  | 'STALLED'
  | 'APPROVAL'
  | 'PROBABILITY'
  | 'FULFILLMENT'
  | 'CUSTOMER_CREDIT'
  | 'CUSTOMER_NEGOTIATION';

export interface DealHealthMetric {
  category: 'MARGIN' | 'VELOCITY' | 'DISCOUNT_COMPLIANCE' | 'CUSTOMER_CREDIT' | 'FULFILLMENT_FEASIBILITY';
  score: number; // 0 - 100
  status: 'EXCELLENT' | 'HEALTHY' | 'WARNING' | 'CRITICAL';
  insight: string;
}

export interface DealHealthEvent {
  id: string;
  quotationId: string;
  eventType: 'DISCOUNT_SPIKE' | 'MARGIN_EROSION' | 'STALLED_IN_APPROVAL' | 'OVERDUE_PAYMENT_FLAG';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  timestamp: string;
  resolved: boolean;
}

export interface Recommendation {
  id: string;
  quotationId?: string;
  type: 'UPSELL' | 'CROSS_SELL' | 'DISCOUNT_OPTIMIZATION' | 'WAREHOUSE_ROUTING';
  title: string;
  description: string;
  impactScore: number;
  potentialRevenueIncrease: number;
}

export interface RiskSignal {
  id: string;
  type: RiskType;
  severity: RiskLevel;
  title: string;
  description: string;
  detectedAt: string;
  status: 'active' | 'mitigated' | 'resolved';
  metricChange?: {
    from: number;
    to: number;
    unit?: string;
  };
}

export interface DealHealthTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type:
    | 'RISK_ESCALATION'
    | 'MARGIN_DROP'
    | 'DISCOUNT_APPLIED'
    | 'ACTIVITY_GAP'
    | 'STAGE_CHANGE'
    | 'APPROVAL_UPDATE'
    | 'CUSTOMER_ACTION';
  severity?: RiskLevel;
  actor?: string;
}

export interface DealHealthDetail {
  dealId: string;
  dealName: string;
  customerId: string;
  customerName: string;
  customerTier?: string;
  ownerId: string;
  ownerName: string;
  ownerRole?: string;
  stage: string;
  value: number;
  probability: number;
  expectedCloseDate: string;
  healthStatus: DealHealthStatus;
  healthScore: number; // 0 - 100
  riskLevel: RiskLevel;
  primaryRiskReason?: string;
  isStalled: boolean;
  stalledDays: number;
  lastActivityAt: string;
  quotationId?: string;
  quotationNumber?: string;
  originalMargin?: number;
  currentMargin?: number;
  marginDelta?: number;
  appliedDiscount?: number;
  allowedDiscountThreshold?: number;
  approvalPending?: boolean;
  approvalPendingRole?: 'MANAGER' | 'FINANCE' | 'NONE';
  approvalWaitingDays?: number;
  signals: RiskSignal[];
  timeline: DealHealthTimelineEvent[];
  recommendations?: Recommendation[];
}

export interface DealHealthDashboardKPIs {
  totalActiveDeals: number;
  totalActiveDealsTrend: number; // percentage change, e.g. +12%
  healthyDealsCount: number;
  healthyDealsPct: number;
  atRiskDealsCount: number;
  atRiskDealsPct: number;
  criticalDealsCount: number;
  criticalDealsPct: number;
  stalledDealsCount: number;
  totalPipelineValue: number;
  weightedPipelineValue: number;
  averageHealthScore: number;
}

export interface DealHealthDistributionItem {
  status: DealHealthStatus;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DealHealthTrendPoint {
  period: string; // e.g. 'Aug 1', 'Aug 8'
  healthy: number;
  atRisk: number;
  critical: number;
  avgScore: number;
}

export interface PipelineHealthStage {
  stage: string;
  label: string;
  dealsCount: number;
  totalValue: number;
  weightedValue: number;
  healthStatus: DealHealthStatus;
  avgHealthScore: number;
}

export interface MarginErosionDeal {
  dealId: string;
  dealName: string;
  customerName: string;
  originalMargin: number; // e.g. 32
  currentMargin: number;  // e.g. 24
  marginDelta: number;    // e.g. -8
  riskLevel: RiskLevel;
  quotationNumber?: string;
}

export interface DiscountRiskDeal {
  dealId: string;
  dealName: string;
  customerName: string;
  appliedDiscount: number; // e.g. 24%
  allowedLimit: number;    // e.g. 15%
  excess: number;          // e.g. +9%
  riskLevel: RiskLevel;
}

export interface StalledDeal {
  dealId: string;
  dealName: string;
  customerName: string;
  ownerName: string;
  stalledDays: number;
  lastActivityAt: string;
  value: number;
  riskScore: number;
  healthStatus: DealHealthStatus;
}

export interface ApprovalBottleneck {
  dealId: string;
  dealName: string;
  customerName: string;
  quotationNumber: string;
  waitingRole: 'Manager' | 'Finance';
  waitingDays: number;
  dealValue: number;
  riskLevel: RiskLevel;
}

export interface DealHealthFilterOptions {
  search?: string;
  health?: DealHealthStatus | 'ALL';
  riskLevel?: RiskLevel | 'ALL';
  stage?: string | 'ALL';
  ownerId?: string | 'ALL';
  riskType?: RiskType | 'ALL';
  timeRange?: '7d' | '30d' | '90d' | '6mo' | '1yr';
}

export interface DealHealthDashboardData {
  kpis: DealHealthDashboardKPIs;
  distribution: DealHealthDistributionItem[];
  riskOverview: { category: string; count: number; riskLevel: RiskLevel; type: RiskType }[];
  healthTrends: DealHealthTrendPoint[];
  pipelineHealth: PipelineHealthStage[];
  marginErosion: MarginErosionDeal[];
  discountRisk: {
    averageDiscount: number;
    highestDiscount: number;
    dealsAboveThresholdCount: number;
    deals: DiscountRiskDeal[];
  };
  stalledDeals: StalledDeal[];
  approvalBottlenecks: {
    managerPendingCount: number;
    financePendingCount: number;
    longestWaitingDays: number;
    bottlenecks: ApprovalBottleneck[];
  };
  highRiskDeals: DealHealthDetail[];
}
