export type PricingRuleType =
  | 'CUSTOMER_TIER'
  | 'CATEGORY_MAX'
  | 'VOLUME_DISCOUNT'
  | 'MARGIN_PROTECTION'
  | 'PROMOTIONAL';

export type PricingRuleStatus = 'ACTIVE' | 'INACTIVE' | 'SCHEDULED' | 'EXPIRED';

export interface PricingRuleCondition {
  customerTier?: string;
  productCategory?: string;
  productId?: string;
  minQuantity?: number;
  minOrderValue?: number;
}

export interface PricingRuleAction {
  type: 'MAX_DISCOUNT' | 'PERCENTAGE_DISCOUNT' | 'FIXED_DISCOUNT' | 'REQUIRE_APPROVAL' | 'ENFORCE_MARGIN';
  value: number;
  requireApprovalRole?: string;
}

export interface PricingRule {
  id: string;
  name: string;
  code: string;
  description: string;
  type: PricingRuleType;
  status: PricingRuleStatus;
  priority: number;
  condition: PricingRuleCondition;
  action: PricingRuleAction;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CustomerTierCode = 'STANDARD' | 'SILVER' | 'GOLD' | 'ENTERPRISE';

export interface PricingCustomerTier {
  id: string;
  code: CustomerTierCode;
  name: string;
  description: string;
  defaultMaxDiscountPct: number;
  autoApprovalThresholdPct: number;
  annualSpendThreshold: number;
  colorBadge: string;
  customerCount: number;
  categoryDiscounts: {
    category: string;
    maxDiscountPct: number;
  }[];
}

export interface DiscountGovernanceEntry {
  tier: string;
  tierName: string;
  maxDiscount: number;
  approvalRoute: string;
  hardwareCeiling: number;
  softwareCeiling: number;
  servicesCeiling: number;
  subscriptionCeiling: number;
}

export interface PricingOverviewStats {
  totalRules: number;
  activeRules: number;
  totalTiers: number;
  avgDiscountPct: number;
  marginCompliancePct: number;
  pendingExceptionsCount: number;
}
