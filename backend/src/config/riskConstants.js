import { RiskLevel } from '@prisma/client';

/**
 * Centralized Risk Engine Configuration & Thresholds
 * DealFlow360 B2B Sales Operations Platform
 */

// Risk Score boundaries (0 - 100)
export const RISK_LEVEL_THRESHOLDS = {
  LOW: { min: 0, max: 29 },
  MEDIUM: { min: 30, max: 59 },
  HIGH: { min: 60, max: 84 },
  CRITICAL: { min: 85, max: 100 },
};

// Deterministic Penalty Points
export const RISK_PENALTIES = {
  // Discount Deviation Penalties
  DISCOUNT_DEVIATION_SLIGHT: 15,    // deviation > 0% and <= 5%
  DISCOUNT_DEVIATION_MODERATE: 30,  // deviation > 5% and <= 10%
  DISCOUNT_DEVIATION_HIGH: 50,      // deviation > 10%

  // Margin Deficit Penalties (Deficit = Required Margin - Actual Margin)
  MARGIN_DEFICIT_SLIGHT: 20,        // deficit > 0% and <= 5%
  MARGIN_DEFICIT_MODERATE: 35,      // deficit > 5% and <= 15%
  MARGIN_DEFICIT_SEVERE: 50,        // deficit > 15% or negative margin

  // Financial Exposure (Quote Total)
  EXPOSURE_HIGH: 10,                // Total > $50,000
  EXPOSURE_VERY_HIGH: 20,           // Total > $100,000

  // Tier Risk Factor
  BRONZE_TIER_WITH_DEVIATION: 5,    // BRONZE tier requesting over-limit discount
};

// Exposure thresholds in USD
export const EXPOSURE_THRESHOLDS = {
  HIGH_EXPOSURE_AMOUNT: 50000.0,
  VERY_HIGH_EXPOSURE_AMOUNT: 100000.0,
};

// Approval Roles
export const APPROVAL_ROLES = {
  SALES_MANAGER: 'SALES_MANAGER',
  FINANCE: 'FINANCE',
};

// Standard Reason Codes & Explanations
export const RISK_REASON_CODES = {
  DISCOUNT_WITHIN_LIMIT: {
    code: 'DISCOUNT_WITHIN_LIMIT',
    message: 'Requested discount is within the allowed limit',
    severity: 'LOW',
  },
  DISCOUNT_EXCEEDED: {
    code: 'DISCOUNT_EXCEEDED',
    message: 'Requested discount exceeds the maximum allowed limit',
    severity: 'HIGH',
  },
  DISCOUNT_DEVIATION_HIGH: {
    code: 'DISCOUNT_DEVIATION_HIGH',
    message: 'Discount deviation exceeds 10% above allowable policy',
    severity: 'HIGH',
  },
  LOW_MARGIN: {
    code: 'LOW_MARGIN',
    message: 'Quotation margin is below the minimum required margin',
    severity: 'HIGH',
  },
  NEGATIVE_MARGIN: {
    code: 'NEGATIVE_MARGIN',
    message: 'Quotation margin is negative, resulting in operational loss',
    severity: 'CRITICAL',
  },
  HIGH_FINANCIAL_EXPOSURE: {
    code: 'HIGH_FINANCIAL_EXPOSURE',
    message: 'Quotation value represents high financial exposure',
    severity: 'MEDIUM',
  },
};

export default {
  RISK_LEVEL_THRESHOLDS,
  RISK_PENALTIES,
  EXPOSURE_THRESHOLDS,
  APPROVAL_ROLES,
  RISK_REASON_CODES,
};
