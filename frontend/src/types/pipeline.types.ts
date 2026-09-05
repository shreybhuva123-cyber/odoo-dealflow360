export type DealStage =
  | 'lead'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost';

export type DealHealth = 'healthy' | 'at_risk' | 'critical';

export type DealActivityType =
  | 'DEAL_CREATED'
  | 'QUOTE_CREATED'
  | 'QUOTE_UPDATED'
  | 'APPROVAL_SUBMITTED'
  | 'APPROVAL_COMPLETED'
  | 'CUSTOMER_VIEWED'
  | 'CUSTOMER_NEGOTIATED'
  | 'CUSTOMER_CONFIRMED'
  | 'STAGE_CHANGED'
  | 'NOTE_ADDED'
  | 'OWNER_CHANGED';

export interface DealActivity {
  id: string;
  dealId: string;
  type: DealActivityType;
  title: string;
  description: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface RelatedQuote {
  id: string;
  quoteNumber: string;
  amount: number;
  status: string;
  date: string;
  riskCategory: 'LOW' | 'MEDIUM' | 'HIGH';
  marginPct?: number;
}

export interface Deal {
  id: string;
  name: string;
  customerId: string;
  customerName: string;
  customerTier?: 'GOLD' | 'SILVER' | 'BRONZE';
  ownerId: string;
  ownerName: string;
  ownerRole?: string;
  stage: DealStage;
  value: number;
  probability: number; // 0 - 100
  expectedCloseDate: string;
  health: DealHealth;
  healthReasons?: string[];
  isStalled?: boolean;
  stalledDays?: number;
  riskScore?: number; // 0 - 100
  discountRisk?: string;
  marginWarning?: string;
  approvalPending?: boolean;
  quotationId?: string;
  quotationNumber?: string;
  quoteStatus?: string;
  lastActivityAt: string;
  source?: string;
  region?: string;
  industry?: string;
  relatedQuotes?: RelatedQuote[];
  activities?: DealActivity[];
  notes?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStats {
  totalDeals: number;
  pipelineValue: number;
  weightedValue: number;
  atRiskDeals: number;
  wonThisMonth: number;
  lostThisMonth: number;
  avgDealSize: number;
  avgSalesCycleDays: number;
}

export interface PipelineFilterOptions {
  search?: string;
  owner?: string;
  stage?: string;
  health?: string;
  closeDate?: string;
  minValue?: number;
  maxValue?: number;
}

export interface StageConfig {
  id: DealStage;
  name: string;
  color: string;
  badgeClass: string;
  defaultProbability: number;
  description: string;
}

export const PIPELINE_STAGES: StageConfig[] = [
  {
    id: 'lead',
    name: 'Lead',
    color: '#64748B',
    badgeClass: 'badge-gray',
    defaultProbability: 20,
    description: 'Initial inquiry or discovery',
  },
  {
    id: 'qualified',
    name: 'Qualified',
    color: '#3B82F6',
    badgeClass: 'badge-blue',
    defaultProbability: 40,
    description: 'Budget, authority & timeline confirmed',
  },
  {
    id: 'proposal',
    name: 'Proposal',
    color: '#8B5CF6',
    badgeClass: 'badge-purple',
    defaultProbability: 60,
    description: 'Formal quotation sent for evaluation',
  },
  {
    id: 'negotiation',
    name: 'Negotiation',
    color: '#F59E0B',
    badgeClass: 'badge-amber',
    defaultProbability: 80,
    description: 'Contract terms & discount discussion',
  },
  {
    id: 'won',
    name: 'Won',
    color: '#10B981',
    badgeClass: 'badge-green',
    defaultProbability: 100,
    description: 'Deal closed & agreed for delivery',
  },
  {
    id: 'lost',
    name: 'Lost',
    color: '#EF4444',
    badgeClass: 'badge-red',
    defaultProbability: 0,
    description: 'Deal disqualified or lost to competitor',
  },
];
