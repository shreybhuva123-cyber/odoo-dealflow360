import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';
import { RiskLevel, UserRole } from '@prisma/client';
import {
  RISK_LEVEL_THRESHOLDS,
  RISK_PENALTIES,
  EXPOSURE_THRESHOLDS,
  APPROVAL_ROLES,
  RISK_REASON_CODES,
} from '../config/riskConstants.js';
import { discountService } from './discountService.js';
import { recordAuditLog } from '../utils/auditLogger.js';

export class RiskService {
  /**
   * Deterministically calculate the risk score (0 - 100)
   * @param {{
   *   maxDeviation: number,
   *   actualMargin: number,
   *   minimumRequiredMargin: number,
   *   totalAmount: number,
   *   customerTier: string
   * }} data
   * @returns {number}
   */
  calculateRiskScore(data) {
    let score = 0;

    const maxDeviation = Number(data.maxDeviation) || 0;
    const actualMargin = Number(data.actualMargin) || 0;
    const requiredMargin = Number(data.minimumRequiredMargin) || 0;
    const totalAmount = Number(data.totalAmount) || 0;
    const customerTier = data.customerTier || 'BRONZE';

    // 1. Discount Deviation Penalties
    if (maxDeviation > 10) {
      score += RISK_PENALTIES.DISCOUNT_DEVIATION_HIGH; // +50
    } else if (maxDeviation > 5) {
      score += RISK_PENALTIES.DISCOUNT_DEVIATION_MODERATE; // +30
    } else if (maxDeviation > 0) {
      score += RISK_PENALTIES.DISCOUNT_DEVIATION_SLIGHT; // +15
    }

    // 2. Margin Health Penalties
    const marginDeficit = Number((requiredMargin - actualMargin).toFixed(2));
    if (actualMargin < 0) {
      score += RISK_PENALTIES.MARGIN_DEFICIT_SEVERE; // +50 (Negative margin is critical risk)
    } else if (marginDeficit > 15) {
      score += RISK_PENALTIES.MARGIN_DEFICIT_SEVERE; // +50
    } else if (marginDeficit > 5) {
      score += RISK_PENALTIES.MARGIN_DEFICIT_MODERATE; // +35
    } else if (marginDeficit > 0) {
      score += RISK_PENALTIES.MARGIN_DEFICIT_SLIGHT; // +20
    }

    // 3. Financial Exposure Penalties
    if (totalAmount > EXPOSURE_THRESHOLDS.VERY_HIGH_EXPOSURE_AMOUNT) {
      score += RISK_PENALTIES.EXPOSURE_VERY_HIGH; // +20
    } else if (totalAmount > EXPOSURE_THRESHOLDS.HIGH_EXPOSURE_AMOUNT) {
      score += RISK_PENALTIES.EXPOSURE_HIGH; // +10
    }

    // 4. Customer Tier Risk Factor (Bronze tier requesting deviation)
    if (customerTier === 'BRONZE' && maxDeviation > 0) {
      score += RISK_PENALTIES.BRONZE_TIER_WITH_DEVIATION; // +5
    }

    // Clamp score between 0 and 100
    score = Math.min(100, Math.max(0, score));
    return Number(score.toFixed(2));
  }

  /**
   * Determine risk level from numeric risk score
   * @param {number} riskScore
   * @returns {import('@prisma/client').RiskLevel}
   */
  determineRiskLevel(riskScore) {
    const score = Number(riskScore) || 0;
    if (score >= RISK_LEVEL_THRESHOLDS.CRITICAL.min) {
      return RiskLevel.CRITICAL;
    }
    if (score >= RISK_LEVEL_THRESHOLDS.HIGH.min) {
      return RiskLevel.HIGH;
    }
    if (score >= RISK_LEVEL_THRESHOLDS.MEDIUM.min) {
      return RiskLevel.MEDIUM;
    }
    return RiskLevel.LOW;
  }

  /**
   * Determine approval requirement and required roles
   * @param {{
   *   riskScore: number,
   *   riskLevel: string,
   *   hasManagerTrigger: boolean,
   *   hasFinanceTrigger: boolean,
   *   maxDeviation: number,
   *   marginDeficit: number,
   *   totalAmount: number
   * }} evaluation
   * @returns {{ approvalRequired: boolean, approvalRequirements: string[] }}
   */
  determineApprovalRequirement(evaluation) {
    const requirements = new Set();

    // Sales Manager approval required if:
    // - discount exceeds manager threshold, OR
    // - discount deviation > 0, OR
    // - risk level is MEDIUM or above due to discount
    if (evaluation.hasManagerTrigger || evaluation.maxDeviation > 0) {
      requirements.add(APPROVAL_ROLES.SALES_MANAGER);
    }

    // Finance approval required if:
    // - discount exceeds finance threshold, OR
    // - margin deficit > 0 (below category minimum margin), OR
    // - high exposure total (> $100,000)
    if (
      evaluation.hasFinanceTrigger ||
      evaluation.marginDeficit > 0 ||
      evaluation.totalAmount > EXPOSURE_THRESHOLDS.VERY_HIGH_EXPOSURE_AMOUNT
    ) {
      requirements.add(APPROVAL_ROLES.FINANCE);
    }

    // If quotation is HIGH or CRITICAL risk, ensure both approvals are present
    if (evaluation.riskLevel === RiskLevel.HIGH || evaluation.riskLevel === RiskLevel.CRITICAL) {
      requirements.add(APPROVAL_ROLES.SALES_MANAGER);
      requirements.add(APPROVAL_ROLES.FINANCE);
    }

    const approvalRequirements = Array.from(requirements);
    const approvalRequired = approvalRequirements.length > 0;

    return {
      approvalRequired,
      approvalRequirements,
    };
  }

  /**
   * Comprehensive risk evaluation of a quotation
   * @param {string} quotationId
   * @param {{ persist?: boolean, user?: { id: string, role: string } }} [options]
   */
  async evaluateQuotationRisk(quotationId, options = {}) {
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
            variant: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!quotation) {
      throw new AppError('Quotation not found', 404);
    }

    // Enforce ownership if user context is passed
    if (options.user) {
      if (
        options.user.role === UserRole.SALES_REP &&
        quotation.salesRepId !== options.user.id
      ) {
        throw new AppError('You do not have permission to view this quotation', 403);
      }
    }

    const reasons = [];
    let maxRequestedDiscount = 0;
    let maxAllowedDiscount = 0;
    let maxDeviation = 0;
    let hasManagerTrigger = false;
    let hasFinanceTrigger = false;

    const itemEvaluations = [];
    let totalWeightedMinMargin = 0;
    let totalLineSelling = 0;

    for (const item of quotation.items) {
      const requestedDiscount = Number(item.discountPercentage);
      if (requestedDiscount > maxRequestedDiscount) {
        maxRequestedDiscount = requestedDiscount;
      }

      // Fetch rule for customer tier & category
      const rule = await discountService.getApplicableDiscountRule(
        quotation.customerId,
        item.productId,
        item.variantId || undefined
      );

      const allowedDiscount = discountService.calculateMaximumAllowedDiscount(rule);
      const deviation = discountService.calculateDiscountDeviation(requestedDiscount, allowedDiscount);

      if (allowedDiscount > maxAllowedDiscount) {
        maxAllowedDiscount = allowedDiscount;
      }
      if (deviation > maxDeviation) {
        maxDeviation = deviation;
      }

      // Check manager and finance threshold triggers
      const managerLimit = rule ? Number(rule.managerApprovalRequiredAbove) : 0;
      const financeLimit = rule ? Number(rule.financeApprovalRequiredAbove) : 0;

      if (rule && requestedDiscount > managerLimit) {
        hasManagerTrigger = true;
      }
      if (rule && requestedDiscount > financeLimit) {
        hasFinanceTrigger = true;
      }
      if (deviation > 0) {
        hasManagerTrigger = true;
      }

      // Track weighted target margin from product categories
      const categoryMargin = item.product?.category?.defaultMarginPercentage
        ? Number(item.product.category.defaultMarginPercentage)
        : 20.0;
      const itemNet = Number(item.lineTotal) || 0;
      totalLineSelling += itemNet;
      totalWeightedMinMargin += itemNet * categoryMargin;

      itemEvaluations.push({
        itemId: item.id,
        productId: item.productId,
        productName: item.product.name,
        categoryName: item.product.category?.name || 'Uncategorized',
        requestedDiscount,
        maximumAllowedDiscount: allowedDiscount,
        deviation,
        allowed: requestedDiscount <= allowedDiscount,
        itemMarginPercentage: Number(item.marginPercentage),
        requiredMarginPercentage: categoryMargin,
      });
    }

    // Weighted minimum required margin for the quotation
    const minimumRequiredMargin =
      totalLineSelling > 0
        ? Number((totalWeightedMinMargin / totalLineSelling).toFixed(2))
        : 20.0;

    const actualMargin = Number(quotation.marginPercentage) || 0.0;
    const marginDeficit = Number((minimumRequiredMargin - actualMargin).toFixed(2));
    const totalAmount = Number(quotation.totalAmount) || 0.0;

    // Calculate deterministic risk score
    const riskScore = this.calculateRiskScore({
      maxDeviation,
      actualMargin,
      minimumRequiredMargin,
      totalAmount,
      customerTier: quotation.customer.customerTier,
    });

    const riskLevel = this.determineRiskLevel(riskScore);

    // Determine approval requirements
    const { approvalRequired, approvalRequirements } = this.determineApprovalRequirement({
      riskScore,
      riskLevel,
      hasManagerTrigger,
      hasFinanceTrigger,
      maxDeviation,
      marginDeficit,
      totalAmount,
    });

    // Build human-readable structured reasons
    if (maxDeviation > 0) {
      reasons.push({
        code: RISK_REASON_CODES.DISCOUNT_EXCEEDED.code,
        message: `Requested discount of ${maxRequestedDiscount}% exceeds maximum allowed limit of ${maxAllowedDiscount}% (deviation: ${maxDeviation}%)`,
        severity: maxDeviation > 10 ? 'HIGH' : 'MEDIUM',
      });
      if (maxDeviation > 10) {
        reasons.push({
          code: RISK_REASON_CODES.DISCOUNT_DEVIATION_HIGH.code,
          message: RISK_REASON_CODES.DISCOUNT_DEVIATION_HIGH.message,
          severity: 'HIGH',
        });
      }
    } else {
      reasons.push(RISK_REASON_CODES.DISCOUNT_WITHIN_LIMIT);
    }

    if (actualMargin < 0) {
      reasons.push({
        code: RISK_REASON_CODES.NEGATIVE_MARGIN.code,
        message: `Quotation margin of ${actualMargin}% is negative, generating an immediate operational loss`,
        severity: 'CRITICAL',
      });
    } else if (marginDeficit > 0) {
      reasons.push({
        code: RISK_REASON_CODES.LOW_MARGIN.code,
        message: `Quotation margin of ${actualMargin}% is below the required threshold of ${minimumRequiredMargin}% (deficit: ${marginDeficit}%)`,
        severity: marginDeficit > 15 ? 'HIGH' : 'MEDIUM',
      });
    }

    if (totalAmount > EXPOSURE_THRESHOLDS.HIGH_EXPOSURE_AMOUNT) {
      reasons.push({
        code: RISK_REASON_CODES.HIGH_FINANCIAL_EXPOSURE.code,
        message: `Quotation total of $${totalAmount.toFixed(2)} represents substantial financial exposure`,
        severity: totalAmount > EXPOSURE_THRESHOLDS.VERY_HIGH_EXPOSURE_AMOUNT ? 'HIGH' : 'MEDIUM',
      });
    }

    // Persist evaluation to database if requested
    if (options.persist) {
      await prisma.quotation.update({
        where: { id: quotationId },
        data: {
          riskScore,
          riskLevel,
          approvalRequired,
        },
      });

      if (options.user) {
        await recordAuditLog({
          userId: options.user.id,
          entityType: 'QUOTATION',
          entityId: quotationId,
          action: 'RISK_EVALUATED',
          newValue: {
            riskScore,
            riskLevel,
            approvalRequired,
            approvalRequirements,
          },
          reason: 'Quotation risk and approval requirements evaluated',
        });
      }
    }

    return {
      quotationId: quotation.id,
      quoteNumber: quotation.quoteNumber,
      customerTier: quotation.customer.customerTier,
      riskScore,
      riskLevel,
      approvalRequired,
      approvalRequirements,
      discountEvaluation: {
        requestedDiscount: maxRequestedDiscount,
        maximumAllowedDiscount: maxAllowedDiscount,
        deviation: maxDeviation,
      },
      marginEvaluation: {
        marginPercentage: actualMargin,
        minimumRequiredMargin,
        marginDeficit: Math.max(0, marginDeficit),
      },
      financialExposure: {
        totalAmount,
        isHighExposure: totalAmount > EXPOSURE_THRESHOLDS.HIGH_EXPOSURE_AMOUNT,
      },
      itemEvaluations,
      reasons,
    };
  }
}

export const riskService = new RiskService();
export default riskService;
