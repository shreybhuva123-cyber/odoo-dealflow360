import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';
import { getPaginationParams, formatPagination } from '../utils/pagination.js';
import { recordAuditLog } from '../utils/auditLogger.js';

export class DiscountService {
  /**
   * Find the applicable active discount rule for customer and product
   * @param {string} customerId
   * @param {string} productId
   * @param {string} [variantId]
   * @returns {Promise<import('@prisma/client').DiscountRule | null>}
   */
  async getApplicableDiscountRule(customerId, productId, variantId) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true, customerTier: true, isActive: true },
    });
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, categoryId: true, isActive: true },
    });
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        select: { id: true, productId: true },
      });
      if (!variant || variant.productId !== productId) {
        throw new AppError('The specified variant does not belong to the selected product', 400);
      }
    }

    // Match active discount rule by customerTier and categoryId
    const rule = await prisma.discountRule.findFirst({
      where: {
        customerTier: customer.customerTier,
        categoryId: product.categoryId,
        isActive: true,
      },
      include: {
        category: {
          select: { id: true, name: true, defaultMarginPercentage: true },
        },
      },
    });

    return rule;
  }

  /**
   * Calculate maximum allowed discount percentage for a rule
   * @param {import('@prisma/client').DiscountRule | null} rule
   * @returns {number}
   */
  calculateMaximumAllowedDiscount(rule) {
    if (!rule || !rule.isActive) {
      return 0.0;
    }
    return Number(rule.maxDiscountPercentage);
  }

  /**
   * Calculate discount deviation between requested discount and maximum allowed discount
   * @param {number} requestedDiscount
   * @param {number} maximumAllowedDiscount
   * @returns {number}
   */
  calculateDiscountDeviation(requestedDiscount, maximumAllowedDiscount) {
    const req = Number(requestedDiscount) || 0;
    const max = Number(maximumAllowedDiscount) || 0;

    if (req <= max) {
      return 0.0;
    }
    return Number((req - max).toFixed(2));
  }

  /**
   * Validate a requested discount against a rule
   * @param {number} requestedDiscount
   * @param {import('@prisma/client').DiscountRule | null} rule
   * @returns {{
   *   allowed: boolean,
   *   requestedDiscount: number,
   *   maximumAllowedDiscount: number,
   *   deviation: number,
   *   reason: string
   * }}
   */
  validateDiscountAgainstRule(requestedDiscount, rule) {
    const req = Number(requestedDiscount) || 0;
    const max = this.calculateMaximumAllowedDiscount(rule);
    const deviation = this.calculateDiscountDeviation(req, max);
    const allowed = req <= max;

    let reason;
    if (allowed) {
      reason = 'Requested discount is within the allowed limit';
    } else if (!rule) {
      reason = `No active discount rule found; maximum allowable discount defaults to 0% (deviation: ${deviation}%)`;
    } else {
      reason = `Requested discount of ${req}% exceeds the maximum allowed discount of ${max}% (deviation: ${deviation}%)`;
    }

    return {
      allowed,
      requestedDiscount: req,
      maximumAllowedDiscount: max,
      deviation,
      reason,
    };
  }

  /**
   * Evaluate a discount for a given customer, product, and requested discount
   * @param {string} customerId
   * @param {string} productId
   * @param {string} [variantId]
   * @param {number} requestedDiscount
   */
  async evaluateDiscount(customerId, productId, variantId, requestedDiscount) {
    const rule = await this.getApplicableDiscountRule(customerId, productId, variantId);
    const validation = this.validateDiscountAgainstRule(requestedDiscount, rule);

    return {
      ...validation,
      ruleId: rule ? rule.id : null,
      customerTier: rule ? rule.customerTier : null,
      categoryId: rule ? rule.categoryId : null,
      managerApprovalRequiredAbove: rule ? Number(rule.managerApprovalRequiredAbove) : 0,
      financeApprovalRequiredAbove: rule ? Number(rule.financeApprovalRequiredAbove) : 0,
    };
  }

  // ==========================================
  // ADMIN DISCOUNT RULE CRUD
  // ==========================================

  /**
   * Create a new discount rule
   * @param {object} data
   * @param {{ id: string, role: string }} user
   */
  async createDiscountRule(data, user) {
    // Verify category exists
    const category = await prisma.productCategory.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new AppError('Product category not found', 404);
    }

    // Check unique constraint [customerTier, categoryId]
    const existing = await prisma.discountRule.findUnique({
      where: {
        customerTier_categoryId: {
          customerTier: data.customerTier,
          categoryId: data.categoryId,
        },
      },
    });
    if (existing) {
      throw new AppError(
        `A discount rule already exists for tier "${data.customerTier}" and category "${category.name}"`,
        409
      );
    }

    const created = await prisma.discountRule.create({
      data: {
        customerTier: data.customerTier,
        categoryId: data.categoryId,
        maxDiscountPercentage: data.maxDiscountPercentage,
        managerApprovalRequiredAbove: data.managerApprovalRequiredAbove,
        financeApprovalRequiredAbove: data.financeApprovalRequiredAbove,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
      include: {
        category: { select: { id: true, name: true, defaultMarginPercentage: true } },
      },
    });

    await recordAuditLog({
      userId: user.id,
      entityType: 'DISCOUNT_RULE',
      entityId: created.id,
      action: 'DISCOUNT_RULE_CREATED',
      newValue: created,
      reason: 'Discount rule created by admin',
    });

    return created;
  }

  /**
   * List discount rules with pagination and filters
   * @param {object} filters
   * @param {object} query
   */
  async getDiscountRules(filters = {}, query = {}) {
    const { page, limit, skip } = getPaginationParams(query);
    const where = {};

    if (filters.customerTier) {
      where.customerTier = filters.customerTier;
    }
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive === 'true' || filters.isActive === true;
    }

    const [rules, total] = await Promise.all([
      prisma.discountRule.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, defaultMarginPercentage: true } },
        },
        orderBy: [{ customerTier: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.discountRule.count({ where }),
    ]);

    return {
      rules,
      pagination: formatPagination(total, page, limit),
    };
  }

  /**
   * Get discount rule by ID
   * @param {string} id
   */
  async getDiscountRuleById(id) {
    const rule = await prisma.discountRule.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, defaultMarginPercentage: true } },
      },
    });
    if (!rule) {
      throw new AppError('Discount rule not found', 404);
    }
    return rule;
  }

  /**
   * Update discount rule
   * @param {string} id
   * @param {object} data
   * @param {{ id: string, role: string }} user
   */
  async updateDiscountRule(id, data, user) {
    const existing = await prisma.discountRule.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!existing) {
      throw new AppError('Discount rule not found', 404);
    }

    // If changing tier or category, verify unique constraint
    const targetTier = data.customerTier || existing.customerTier;
    const targetCategory = data.categoryId || existing.categoryId;
    if (
      (data.customerTier && data.customerTier !== existing.customerTier) ||
      (data.categoryId && data.categoryId !== existing.categoryId)
    ) {
      const conflict = await prisma.discountRule.findUnique({
        where: {
          customerTier_categoryId: {
            customerTier: targetTier,
            categoryId: targetCategory,
          },
        },
      });
      if (conflict && conflict.id !== id) {
        throw new AppError(
          `A discount rule already exists for tier "${targetTier}" and category "${targetCategory}"`,
          409
        );
      }
    }

    const updated = await prisma.discountRule.update({
      where: { id },
      data: {
        customerTier: data.customerTier,
        categoryId: data.categoryId,
        maxDiscountPercentage: data.maxDiscountPercentage,
        managerApprovalRequiredAbove: data.managerApprovalRequiredAbove,
        financeApprovalRequiredAbove: data.financeApprovalRequiredAbove,
        isActive: data.isActive,
      },
      include: {
        category: { select: { id: true, name: true, defaultMarginPercentage: true } },
      },
    });

    await recordAuditLog({
      userId: user.id,
      entityType: 'DISCOUNT_RULE',
      entityId: id,
      action: 'DISCOUNT_RULE_UPDATED',
      oldValue: existing,
      newValue: updated,
      reason: 'Discount rule updated by admin',
    });

    return updated;
  }

  /**
   * Delete discount rule
   * @param {string} id
   * @param {{ id: string, role: string }} user
   */
  async deleteDiscountRule(id, user) {
    const existing = await prisma.discountRule.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Discount rule not found', 404);
    }

    await prisma.discountRule.delete({ where: { id } });

    await recordAuditLog({
      userId: user.id,
      entityType: 'DISCOUNT_RULE',
      entityId: id,
      action: 'DISCOUNT_RULE_DELETED',
      oldValue: existing,
      reason: 'Discount rule deleted by admin',
    });

    return { message: 'Discount rule deleted successfully' };
  }
}

export const discountService = new DiscountService();
export default discountService;
