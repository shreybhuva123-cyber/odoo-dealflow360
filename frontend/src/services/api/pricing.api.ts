import {
  PricingRule,
  PricingCustomerTier,
  DiscountGovernanceEntry,
  PricingOverviewStats,
} from '@/types';

const RULES_STORAGE_KEY = 'dealflow_pricing_rules_v2';
const TIERS_STORAGE_KEY = 'dealflow_customer_tiers_v2';

export const INITIAL_CUSTOMER_TIERS: PricingCustomerTier[] = [
  {
    id: 'tier_standard',
    code: 'STANDARD',
    name: 'Standard Tier (Bronze)',
    description: 'Baseline accounts and new prospective clients with standard catalog terms.',
    defaultMaxDiscountPct: 5,
    autoApprovalThresholdPct: 5,
    annualSpendThreshold: 0,
    colorBadge: 'gray',
    customerCount: 14,
    categoryDiscounts: [
      { category: 'Hardware', maxDiscountPct: 5 },
      { category: 'Subscription', maxDiscountPct: 5 },
      { category: 'Service', maxDiscountPct: 5 },
    ],
  },
  {
    id: 'tier_silver',
    code: 'SILVER',
    name: 'Silver Tier',
    description: 'Growth SMB accounts with regular purchasing cadences and moderate volume.',
    defaultMaxDiscountPct: 10,
    autoApprovalThresholdPct: 7,
    annualSpendThreshold: 25000,
    colorBadge: 'blue',
    customerCount: 9,
    categoryDiscounts: [
      { category: 'Hardware', maxDiscountPct: 10 },
      { category: 'Subscription', maxDiscountPct: 10 },
      { category: 'Service', maxDiscountPct: 8 },
    ],
  },
  {
    id: 'tier_gold',
    code: 'GOLD',
    name: 'Gold Tier',
    description: 'Mid-Market key accounts with predictable volume and dedicated support.',
    defaultMaxDiscountPct: 15,
    autoApprovalThresholdPct: 10,
    annualSpendThreshold: 100000,
    colorBadge: 'green',
    customerCount: 6,
    categoryDiscounts: [
      { category: 'Hardware', maxDiscountPct: 15 },
      { category: 'Subscription', maxDiscountPct: 15 },
      { category: 'Service', maxDiscountPct: 10 },
    ],
  },
  {
    id: 'tier_enterprise',
    code: 'ENTERPRISE',
    name: 'Enterprise Tier',
    description: 'Strategic accounts with multi-year commitments and custom volume commitments.',
    defaultMaxDiscountPct: 20,
    autoApprovalThresholdPct: 12,
    annualSpendThreshold: 500000,
    colorBadge: 'purple',
    customerCount: 3,
    categoryDiscounts: [
      { category: 'Hardware', maxDiscountPct: 20 },
      { category: 'Subscription', maxDiscountPct: 20 },
      { category: 'Service', maxDiscountPct: 15 },
    ],
  },
];

export const INITIAL_PRICING_RULES: PricingRule[] = [
  {
    id: 'rule_std_cap',
    name: 'Standard Tier Blanket Cap',
    code: 'RULE-TIER-STD-05',
    description: 'Standard accounts capped at 5% discount with zero manager approval required.',
    type: 'CUSTOMER_TIER',
    status: 'ACTIVE',
    priority: 10,
    condition: { customerTier: 'STANDARD' },
    action: { type: 'MAX_DISCOUNT', value: 5 },
    isActive: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-02-15T12:00:00Z',
  },
  {
    id: 'rule_silver_mgr',
    name: 'Silver Tier Manager Approval Trigger',
    code: 'RULE-TIER-SLV-10',
    description: 'Discounts between 7% and 10% on Silver accounts route to Sales Manager for review.',
    type: 'CUSTOMER_TIER',
    status: 'ACTIVE',
    priority: 20,
    condition: { customerTier: 'SILVER' },
    action: { type: 'REQUIRE_APPROVAL', value: 10, requireApprovalRole: 'SALES_MANAGER' },
    isActive: true,
    createdAt: '2026-01-10T10:30:00Z',
    updatedAt: '2026-02-15T12:00:00Z',
  },
  {
    id: 'rule_gold_dual',
    name: 'Gold Tier Dual Signoff Protocol',
    code: 'RULE-TIER-GLD-15',
    description: 'Discounts over 10% route to Sales Manager; if blended margin risk is HIGH, route to Finance.',
    type: 'CUSTOMER_TIER',
    status: 'ACTIVE',
    priority: 30,
    condition: { customerTier: 'GOLD' },
    action: { type: 'REQUIRE_APPROVAL', value: 15, requireApprovalRole: 'FINANCE' },
    isActive: true,
    createdAt: '2026-01-12T14:00:00Z',
    updatedAt: '2026-02-18T16:00:00Z',
  },
  {
    id: 'rule_hw_margin',
    name: 'Hardware Floor Margin Protection',
    code: 'RULE-MARGIN-HW-20',
    description: 'Enforce minimum 20% gross margin on all physical workstations and peripherals.',
    type: 'MARGIN_PROTECTION',
    status: 'ACTIVE',
    priority: 40,
    condition: { productCategory: 'Hardware' },
    action: { type: 'ENFORCE_MARGIN', value: 20 },
    isActive: true,
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-02-20T11:00:00Z',
  },
  {
    id: 'rule_service_cap',
    name: 'Services Low-Margin Ceiling',
    code: 'RULE-CAT-SVC-10',
    description: 'Cap discounts on billable implementation and engineering hours at 10% maximum.',
    type: 'CATEGORY_MAX',
    status: 'ACTIVE',
    priority: 50,
    condition: { productCategory: 'Service' },
    action: { type: 'MAX_DISCOUNT', value: 10 },
    isActive: true,
    createdAt: '2026-01-16T11:20:00Z',
    updatedAt: '2026-02-22T09:30:00Z',
  },
  {
    id: 'rule_vol_workstation',
    name: 'Volume License Workstation Accelerator',
    code: 'RULE-VOL-QTY-50',
    description: 'Automatic 3% volume incentive when physical unit volume exceeds 50 units in quote.',
    type: 'VOLUME_DISCOUNT',
    status: 'ACTIVE',
    priority: 60,
    condition: { minQuantity: 50 },
    action: { type: 'PERCENTAGE_DISCOUNT', value: 3 },
    isActive: true,
    createdAt: '2026-01-20T13:00:00Z',
    updatedAt: '2026-02-25T14:15:00Z',
  },
  {
    id: 'rule_ent_exec',
    name: 'Enterprise Strategic Board Exception',
    code: 'RULE-TIER-ENT-25',
    description: 'Discounts exceeding 20% up to 25% require Finance Director and Executive signoff.',
    type: 'CUSTOMER_TIER',
    status: 'INACTIVE',
    priority: 70,
    condition: { customerTier: 'ENTERPRISE' },
    action: { type: 'REQUIRE_APPROVAL', value: 25, requireApprovalRole: 'FINANCE' },
    isActive: false,
    createdAt: '2026-02-01T15:00:00Z',
    updatedAt: '2026-02-28T10:00:00Z',
  },
];

function getStoredRules(): PricingRule[] {
  try {
    const raw = localStorage.getItem(RULES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(INITIAL_PRICING_RULES));
      return INITIAL_PRICING_RULES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PRICING_RULES;
  }
}

function saveStoredRules(rules: PricingRule[]): void {
  try {
    localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
  } catch (err) {
    console.error('Failed to save pricing rules:', err);
  }
}

function getStoredTiers(): PricingCustomerTier[] {
  try {
    const raw = localStorage.getItem(TIERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TIERS_STORAGE_KEY, JSON.stringify(INITIAL_CUSTOMER_TIERS));
      return INITIAL_CUSTOMER_TIERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CUSTOMER_TIERS;
  }
}

function saveStoredTiers(tiers: PricingCustomerTier[]): void {
  try {
    localStorage.setItem(TIERS_STORAGE_KEY, JSON.stringify(tiers));
  } catch (err) {
    console.error('Failed to save customer tiers:', err);
  }
}

export const pricingApi = {
  async getOverview(): Promise<PricingOverviewStats> {
    const rules = getStoredRules();
    const tiers = getStoredTiers();

    return {
      totalRules: rules.length,
      activeRules: rules.filter((r) => r.isActive).length,
      totalTiers: tiers.length,
      avgDiscountPct: 11.4,
      marginCompliancePct: 94.2,
      pendingExceptionsCount: 3,
    };
  },

  async getRules(): Promise<PricingRule[]> {
    return getStoredRules();
  },

  async getRuleById(id: string): Promise<PricingRule | null> {
    const rules = getStoredRules();
    return rules.find((r) => r.id === id) || null;
  },

  async createRule(payload: Omit<PricingRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<PricingRule> {
    const rules = getStoredRules();
    const newRule: PricingRule = {
      ...payload,
      id: `rule_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: payload.isActive ? 'ACTIVE' : 'INACTIVE',
    };

    const updated = [...rules, newRule];
    saveStoredRules(updated);
    return newRule;
  },

  async updateRule(id: string, updates: Partial<PricingRule>): Promise<PricingRule> {
    const rules = getStoredRules();
    const idx = rules.findIndex((r) => r.id === id);
    if (idx === -1) {
      throw new Error(`Rule with ID ${id} not found`);
    }

    const updatedRule: PricingRule = {
      ...rules[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
      status: updates.isActive !== undefined ? (updates.isActive ? 'ACTIVE' : 'INACTIVE') : rules[idx].status,
    };

    rules[idx] = updatedRule;
    saveStoredRules(rules);
    return updatedRule;
  },

  async deleteRule(id: string): Promise<{ success: boolean }> {
    const rules = getStoredRules();
    const filtered = rules.filter((r) => r.id !== id);
    saveStoredRules(filtered);
    return { success: true };
  },

  async toggleRuleStatus(id: string): Promise<PricingRule> {
    const rules = getStoredRules();
    const target = rules.find((r) => r.id === id);
    if (!target) throw new Error(`Rule ${id} not found`);
    return pricingApi.updateRule(id, { isActive: !target.isActive });
  },

  async getTiers(): Promise<PricingCustomerTier[]> {
    return getStoredTiers();
  },

  async getTierById(id: string): Promise<PricingCustomerTier | null> {
    const tiers = getStoredTiers();
    return tiers.find((t) => t.id === id || t.code === id) || null;
  },

  async updateTier(id: string, updates: Partial<PricingCustomerTier>): Promise<PricingCustomerTier> {
    const tiers = getStoredTiers();
    const idx = tiers.findIndex((t) => t.id === id || t.code === id);
    if (idx === -1) {
      throw new Error(`Tier with ID ${id} not found`);
    }

    const updatedTier: PricingCustomerTier = {
      ...tiers[idx],
      ...updates,
    };

    tiers[idx] = updatedTier;
    saveStoredTiers(tiers);
    return updatedTier;
  },

  async getDiscountGovernanceMatrix(): Promise<DiscountGovernanceEntry[]> {
    return [
      {
        tier: 'STANDARD',
        tierName: 'Bronze / Standard',
        maxDiscount: 5,
        approvalRoute: 'No approval required (Direct submit)',
        hardwareCeiling: 5,
        softwareCeiling: 5,
        servicesCeiling: 5,
        subscriptionCeiling: 5,
      },
      {
        tier: 'SILVER',
        tierName: 'Silver Tier',
        maxDiscount: 10,
        approvalRoute: 'Sales Manager review required (>7%)',
        hardwareCeiling: 10,
        softwareCeiling: 10,
        servicesCeiling: 8,
        subscriptionCeiling: 10,
      },
      {
        tier: 'GOLD',
        tierName: 'Gold Tier',
        maxDiscount: 15,
        approvalRoute: 'Sales Manager → Finance if blended risk is HIGH',
        hardwareCeiling: 15,
        softwareCeiling: 15,
        servicesCeiling: 10,
        subscriptionCeiling: 15,
      },
      {
        tier: 'ENTERPRISE',
        tierName: 'Enterprise Tier',
        maxDiscount: 20,
        approvalRoute: 'Sales Manager + Finance Director mandatory approval',
        hardwareCeiling: 20,
        softwareCeiling: 20,
        servicesCeiling: 15,
        subscriptionCeiling: 20,
      },
    ];
  },
};
