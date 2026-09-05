import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';
import { getPaginationParams, formatPagination } from '../utils/pagination.js';
import { recordAuditLog } from '../utils/auditLogger.js';
import { QuoteStatus, UserRole } from '@prisma/client';
import { riskService } from './riskService.js';
import { approvalService } from './approvalService.js';
import { notificationEvents } from './notificationEvents.js';
import { activityService } from './activityService.js';

export class QuotationService {
  // ==========================================
  // CALCULATION ENGINE FUNCTIONS
  // ==========================================

  /**
   * Calculate line item gross subtotal (unitPrice * quantity)
   * @param {number|string} unitPrice
   * @param {number} quantity
   * @returns {number}
   */
  calculateLineSubtotal(unitPrice, quantity) {
    const price = Number(unitPrice) || 0;
    const qty = Number(quantity) || 0;
    return Number((price * qty).toFixed(2));
  }

  /**
   * Calculate line item discount amount (grossSubtotal * discountPercentage / 100)
   * @param {number|string} subtotal
   * @param {number|string} discountPercentage
   * @returns {number}
   */
  calculateDiscountAmount(subtotal, discountPercentage) {
    const sub = Number(subtotal) || 0;
    const disc = Number(discountPercentage) || 0;
    return Number(((sub * disc) / 100).toFixed(2));
  }

  /**
   * Calculate line item tax amount (taxableAmount * taxRate / 100)
   * @param {number|string} taxableAmount (netAmount)
   * @param {number|string} taxRate
   * @returns {number}
   */
  calculateTaxAmount(taxableAmount, taxRate) {
    const taxable = Number(taxableAmount) || 0;
    const rate = Number(taxRate) || 0;
    return Number(((taxable * rate) / 100).toFixed(2));
  }

  /**
   * Calculate line item margin amount (netAmount - costAmount)
   * @param {number|string} netAmount
   * @param {number|string} costAmount
   * @returns {number}
   */
  calculateMarginAmount(netAmount, costAmount) {
    const net = Number(netAmount) || 0;
    const cost = Number(costAmount) || 0;
    return Number((net - cost).toFixed(2));
  }

  /**
   * Calculate line item margin percentage ((marginAmount / netAmount) * 100)
   * @param {number|string} marginAmount
   * @param {number|string} netAmount
   * @returns {number}
   */
  calculateMarginPercentage(marginAmount, netAmount) {
    const margin = Number(marginAmount) || 0;
    const net = Number(netAmount) || 0;
    if (net <= 0) return 0;
    return Number(((margin / net) * 100).toFixed(2));
  }

  /**
   * Calculate all financial fields for a quotation line item
   * @param {{
   *   unitPrice: number|string,
   *   quantity: number,
   *   discountPercentage?: number|string,
   *   costPrice: number|string,
   *   taxRate?: number|string
   * }} itemData
   * @returns {{
   *   unitPrice: number,
   *   quantity: number,
   *   discountPercentage: number,
   *   grossAmount: number,
   *   discountAmount: number,
   *   netAmount: number,
   *   taxAmount: number,
   *   lineTotal: number,
   *   costPrice: number,
   *   costAmount: number,
   *   marginAmount: number,
   *   marginPercentage: number
   * }}
   */
  calculateQuotationItem(itemData) {
    const unitPrice = Number(itemData.unitPrice) || 0;
    const quantity = Number(itemData.quantity) || 1;
    const discountPercentage = Number(itemData.discountPercentage) || 0;
    const costPrice = Number(itemData.costPrice) || 0;
    const taxRate = Number(itemData.taxRate) || 0;

    const grossAmount = this.calculateLineSubtotal(unitPrice, quantity);
    const discountAmount = this.calculateDiscountAmount(grossAmount, discountPercentage);
    const netAmount = Number((grossAmount - discountAmount).toFixed(2));
    const taxAmount = this.calculateTaxAmount(netAmount, taxRate);
    const lineTotal = Number((netAmount + taxAmount).toFixed(2));
    const costAmount = Number((costPrice * quantity).toFixed(2));
    const marginAmount = this.calculateMarginAmount(netAmount, costAmount);
    const marginPercentage = this.calculateMarginPercentage(marginAmount, netAmount);

    return {
      unitPrice,
      quantity,
      discountPercentage,
      grossAmount,
      discountAmount,
      netAmount,
      taxAmount,
      lineTotal,
      costPrice,
      costAmount,
      marginAmount,
      marginPercentage,
    };
  }

  // ==========================================
  // VALIDATION & GUARD HELPERS
  // ==========================================

  /**
   * Validate that a quotation is in an editable state (DRAFT or REVISION_REQUIRED)
   * @param {{ status: string }} quotation
   */
  validateQuotationEditable(quotation) {
    if (!quotation) {
      throw new AppError('Quotation not found', 404);
    }
    const editableStatuses = [QuoteStatus.DRAFT, QuoteStatus.REVISION_REQUIRED];
    if (!editableStatuses.includes(quotation.status)) {
      throw new AppError(
        `Quotation cannot be modified in status "${quotation.status}". Only DRAFT quotations can be edited.`,
        422
      );
    }
    return true;
  }

  /**
   * Validate quotation resource ownership
   * - SALES_REP: can only modify/view their own quotes
   * - SALES_MANAGER: elevated view/review permission
   * - ADMIN: full access
   * @param {{ salesRepId: string }} quotation
   * @param {{ id: string, role: string }} user
   */
  validateQuotationOwnership(quotation, user) {
    if (!user) {
      throw new AppError('User authentication required', 401);
    }
    if (user.role === UserRole.ADMIN || user.role === UserRole.SALES_MANAGER) {
      return true;
    }
    if (user.role === UserRole.SALES_REP) {
      if (quotation.salesRepId !== user.id) {
        throw new AppError('You do not have permission to access or modify this quotation', 403);
      }
      return true;
    }
    throw new AppError('Forbidden: Your role cannot modify quotations', 403);
  }

  // ==========================================
  // PRICING & QUOTE NUMBER GENERATION
  // ==========================================

  /**
   * Determine authoritative product price based on Customer Tier, Price List, and Variant
   * @param {string} customerId
   * @param {string} productId
   * @param {string} [variantId]
   * @param {number} [quantity=1]
   */
  async getApplicableProductPrice(customerId, productId, variantId = null, quantity = 1) {
    // 1. Validate customer
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true, companyName: true, customerTier: true, isActive: true },
    });
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }
    if (!customer.isActive) {
      throw new AppError('Cannot create quotations for inactive customers', 400);
    }

    // 2. Validate product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        sku: true,
        basePrice: true,
        costPrice: true,
        taxRate: true,
        isActive: true,
      },
    });
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    if (!product.isActive) {
      throw new AppError(`Product "${product.name}" (${product.sku}) is inactive and cannot be quoted`, 400);
    }

    // 3. Validate variant (if provided)
    let variantExtraPrice = 0;
    let variant = null;
    if (variantId) {
      variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
      });
      if (!variant) {
        throw new AppError('Specified product variant not found', 404);
      }
      if (variant.productId !== productId) {
        throw new AppError('The specified variant does not belong to the selected product', 400);
      }
      variantExtraPrice = Number(variant.extraPrice) || 0;
    }

    // 4. Resolve applicable price list for customer's tier
    const priceList = await prisma.priceList.findFirst({
      where: {
        customerTier: customer.customerTier,
        isActive: true,
      },
      select: { id: true, name: true, currency: true },
    });

    let baseUnitPrice = Number(product.basePrice);
    let pricingSource = 'BASE_CATALOG';
    let matchedPriceListItem = null;

    if (priceList) {
      // Find matching item in the customer's price list with best volume quantity break
      matchedPriceListItem = await prisma.priceListItem.findFirst({
        where: {
          priceListId: priceList.id,
          productId,
          minimumQuantity: { lte: quantity },
        },
        orderBy: { minimumQuantity: 'desc' },
      });

      if (matchedPriceListItem) {
        baseUnitPrice = Number(matchedPriceListItem.price);
        pricingSource = 'PRICE_LIST';
      }
    }

    const finalUnitPrice = Number((baseUnitPrice + variantExtraPrice).toFixed(2));

    return {
      unitPrice: finalUnitPrice,
      baseUnitPrice,
      variantExtraPrice,
      costPrice: Number(product.costPrice),
      taxRate: Number(product.taxRate),
      pricingSource,
      priceListId: priceList?.id || null,
      priceListName: priceList?.name || null,
      customerTier: customer.customerTier,
      variant,
      product,
    };
  }

  /**
   * Generate a unique, human-readable, database-safe quote number (e.g. DFQ-2026-000001)
   * @param {object} [tx] Optional Prisma transaction client
   * @returns {Promise<string>}
   */
  async generateQuoteNumber(tx) {
    const db = tx || prisma;
    const year = new Date().getFullYear();
    const prefix = `DFQ-${year}-`;

    const latest = await db.quotation.findFirst({
      where: { quoteNumber: { startsWith: prefix } },
      orderBy: { quoteNumber: 'desc' },
      select: { quoteNumber: true },
    });

    let nextSeq = 1;
    if (latest && latest.quoteNumber) {
      const parts = latest.quoteNumber.split('-');
      if (parts.length === 3) {
        const parsed = parseInt(parts[2], 10);
        if (!isNaN(parsed)) {
          nextSeq = parsed + 1;
        }
      }
    }

    return `${prefix}${String(nextSeq).padStart(6, '0')}`;
  }

  // ==========================================
  // QUOTATION CRUD
  // ==========================================

  /**
   * Create a new draft quotation
   * @param {string} userId Authenticated sales representative / admin ID
   * @param {{ customerId: string, expiresAt?: string }} data
   */
  async createQuotation(userId, data) {
    // 1. Verify customer exists and is active
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }
    if (!customer.isActive) {
      throw new AppError('Cannot create quotation for inactive customer', 400);
    }

    // 2. Generate unique quote number
    const quoteNumber = await this.generateQuoteNumber();

    // 3. Create quotation with status DRAFT and initial financial values at zero
    const quotation = await prisma.quotation.create({
      data: {
        quoteNumber,
        customerId: data.customerId,
        salesRepId: userId, // Always derive from authenticated user
        status: QuoteStatus.DRAFT,
        subtotal: 0.0,
        discountAmount: 0.0,
        taxAmount: 0.0,
        totalAmount: 0.0,
        marginAmount: 0.0,
        marginPercentage: 0.0,
        riskScore: 0.0,
        approvalRequired: false,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
      include: {
        customer: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            email: true,
            customerTier: true,
          },
        },
        salesRep: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        items: true,
      },
    });

    // 4. Record audit log
    await recordAuditLog({
      userId,
      entityType: 'QUOTATION',
      entityId: quotation.id,
      action: 'QUOTE_CREATED',
      newValue: {
        quoteNumber: quotation.quoteNumber,
        customerId: quotation.customerId,
        salesRepId: quotation.salesRepId,
        status: quotation.status,
      },
      reason: 'Sales rep created draft quotation',
    });

    try {
      await activityService.createActivity({
        actorUserId: userId,
        entityType: 'QUOTATION',
        entityId: quotation.id,
        action: 'QUOTATION_CREATED',
        description: `Quotation ${quotation.quoteNumber} created`,
        metadata: { quoteNumber: quotation.quoteNumber },
      });
    } catch (actErr) {
      // Non-fatal
    }

    return quotation;
  }

  /**
   * Get paginated quotations with filtering and ownership enforcement
   * @param {object} filters
   * @param {object} pagination
   * @param {{ id: string, role: string }} user
   */
  async getQuotations(filters = {}, pagination = {}, user) {
    const { page, limit, skip } = getPaginationParams(pagination);

    const where = {};

    // Ownership filter: SALES_REP sees only their own quotes
    if (user.role === UserRole.SALES_REP) {
      where.salesRepId = user.id;
    } else if (filters.salesRepId) {
      where.salesRepId = filters.salesRepId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.search) {
      where.OR = [
        { quoteNumber: { contains: filters.search, mode: 'insensitive' } },
        { customer: { companyName: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, quotations] = await Promise.all([
      prisma.quotation.count({ where }),
      prisma.quotation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: {
            select: {
              id: true,
              companyName: true,
              contactName: true,
              email: true,
              customerTier: true,
            },
          },
          salesRep: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          _count: {
            select: { items: true },
          },
        },
      }),
    ]);

    return {
      quotations,
      pagination: formatPagination(total, page, limit),
    };
  }

  /**
   * Get single quotation details with items, product info, and customer
   * @param {string} id
   * @param {{ id: string, role: string }} user
   */
  async getQuotationById(id, user) {
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            email: true,
            customerTier: true,
            phone: true,
          },
        },
        salesRep: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                unit: true,
                basePrice: true,
                costPrice: true,
                taxRate: true,
                category: {
                  select: { id: true, name: true },
                },
              },
            },
            variant: {
              select: {
                id: true,
                attribute: true,
                value: true,
                extraPrice: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!quotation) {
      throw new AppError('Quotation not found', 404);
    }

    // Ownership check for SALES_REP
    if (user.role === UserRole.SALES_REP && quotation.salesRepId !== user.id) {
      throw new AppError('You do not have permission to view this quotation', 403);
    }

    return quotation;
  }

  /**
   * Update draft quotation metadata (e.g. expiresAt, customerId)
   * @param {string} id
   * @param {{ id: string, role: string }} user
   * @param {{ expiresAt?: string, customerId?: string }} data
   */
  async updateQuotation(id, user, data) {
    const quotation = await prisma.quotation.findUnique({ where: { id } });
    if (!quotation) {
      throw new AppError('Quotation not found', 404);
    }

    this.validateQuotationOwnership(quotation, user);
    this.validateQuotationEditable(quotation);

    const updateData = {};

    if (data.expiresAt !== undefined) {
      updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    }

    if (data.customerId && data.customerId !== quotation.customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
      if (!customer) {
        throw new AppError('Customer not found', 404);
      }
      if (!customer.isActive) {
        throw new AppError('Cannot reassign quotation to inactive customer', 400);
      }
      updateData.customerId = data.customerId;
    }

    const updated = await prisma.quotation.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        salesRep: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    await recordAuditLog({
      userId: user.id,
      entityType: 'QUOTATION',
      entityId: id,
      action: 'QUOTE_UPDATED',
      oldValue: quotation,
      newValue: updated,
      reason: 'Draft quotation metadata updated',
    });

    return updated;
  }

  // ==========================================
  // QUOTATION ITEMS MANAGEMENT
  // ==========================================

  /**
   * Add an item to a draft quotation
   * @param {string} quotationId
   * @param {{ id: string, role: string }} user
   * @param {{ productId: string, variantId?: string, quantity: number, discountPercentage?: number }} data
   */
  async addQuotationItem(quotationId, user, data) {
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
    });
    if (!quotation) {
      throw new AppError('Quotation not found', 404);
    }

    this.validateQuotationOwnership(quotation, user);
    this.validateQuotationEditable(quotation);

    // 1. Authoritative price lookup
    const pricing = await this.getApplicableProductPrice(
      quotation.customerId,
      data.productId,
      data.variantId,
      data.quantity
    );

    // 2. Compute exact item financial figures
    const computed = this.calculateQuotationItem({
      unitPrice: pricing.unitPrice,
      quantity: data.quantity,
      discountPercentage: data.discountPercentage || 0,
      costPrice: pricing.costPrice,
      taxRate: pricing.taxRate,
    });

    // 3. Atomically create item and recalculate quotation in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.quotationItem.create({
        data: {
          quotationId,
          productId: data.productId,
          variantId: data.variantId || null,
          quantity: computed.quantity,
          unitPrice: computed.unitPrice,
          discountPercentage: computed.discountPercentage,
          discountAmount: computed.discountAmount,
          taxAmount: computed.taxAmount,
          lineTotal: computed.lineTotal,
          costPrice: computed.costPrice,
          marginAmount: computed.marginAmount,
          marginPercentage: computed.marginPercentage,
        },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          variant: { select: { id: true, attribute: true, value: true, extraPrice: true } },
        },
      });

      const updatedQuotation = await this.recalculateQuotation(quotationId, tx);

      return { item, quotation: updatedQuotation };
    });

    await recordAuditLog({
      userId: user.id,
      entityType: 'QUOTATION',
      entityId: quotationId,
      action: 'QUOTE_ITEM_ADDED',
      newValue: result.item,
      reason: `Added product ${pricing.product.sku} (x${data.quantity}) to quote`,
    });

    return result;
  }

  /**
   * Update an existing quotation line item
   * @param {string} itemId
   * @param {{ id: string, role: string }} user
   * @param {{ quantity?: number, variantId?: string, discountPercentage?: number }} data
   */
  async updateQuotationItem(itemId, user, data) {
    const item = await prisma.quotationItem.findUnique({
      where: { id: itemId },
      include: {
        quotation: true,
      },
    });
    if (!item) {
      throw new AppError('Quotation item not found', 404);
    }

    this.validateQuotationOwnership(item.quotation, user);
    this.validateQuotationEditable(item.quotation);

    const targetQuantity = data.quantity !== undefined ? data.quantity : item.quantity;
    const targetVariantId = data.variantId !== undefined ? data.variantId : item.variantId;
    const targetDiscountPercentage =
      data.discountPercentage !== undefined
        ? data.discountPercentage
        : Number(item.discountPercentage);

    // Re-resolve price if quantity or variant changed
    const pricing = await this.getApplicableProductPrice(
      item.quotation.customerId,
      item.productId,
      targetVariantId,
      targetQuantity
    );

    const computed = this.calculateQuotationItem({
      unitPrice: pricing.unitPrice,
      quantity: targetQuantity,
      discountPercentage: targetDiscountPercentage,
      costPrice: pricing.costPrice,
      taxRate: pricing.taxRate,
    });

    const result = await prisma.$transaction(async (tx) => {
      const updatedItem = await tx.quotationItem.update({
        where: { id: itemId },
        data: {
          variantId: targetVariantId || null,
          quantity: computed.quantity,
          unitPrice: computed.unitPrice,
          discountPercentage: computed.discountPercentage,
          discountAmount: computed.discountAmount,
          taxAmount: computed.taxAmount,
          lineTotal: computed.lineTotal,
          costPrice: computed.costPrice,
          marginAmount: computed.marginAmount,
          marginPercentage: computed.marginPercentage,
        },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          variant: { select: { id: true, attribute: true, value: true, extraPrice: true } },
        },
      });

      const updatedQuotation = await this.recalculateQuotation(item.quotationId, tx);

      return { item: updatedItem, quotation: updatedQuotation };
    });

    await recordAuditLog({
      userId: user.id,
      entityType: 'QUOTATION',
      entityId: item.quotationId,
      action: 'QUOTE_ITEM_UPDATED',
      oldValue: item,
      newValue: result.item,
      reason: `Updated quotation line item ${itemId}`,
    });

    return result;
  }

  /**
   * Remove line item from draft quotation
   * @param {string} itemId
   * @param {{ id: string, role: string }} user
   */
  async removeQuotationItem(itemId, user) {
    const item = await prisma.quotationItem.findUnique({
      where: { id: itemId },
      include: { quotation: true },
    });
    if (!item) {
      throw new AppError('Quotation item not found', 404);
    }

    this.validateQuotationOwnership(item.quotation, user);
    this.validateQuotationEditable(item.quotation);

    const quotationId = item.quotationId;

    const result = await prisma.$transaction(async (tx) => {
      await tx.quotationItem.delete({ where: { id: itemId } });
      const updatedQuotation = await this.recalculateQuotation(quotationId, tx);
      return updatedQuotation;
    });

    await recordAuditLog({
      userId: user.id,
      entityType: 'QUOTATION',
      entityId: quotationId,
      action: 'QUOTE_ITEM_REMOVED',
      oldValue: item,
      reason: `Removed line item ${itemId}`,
    });

    return {
      message: 'Quotation item removed successfully',
      quotation: result,
    };
  }

  /**
   * Recalculate quotation financial totals based on current items
   * @param {string} quotationId
   * @param {object} [tx] Optional Prisma transaction client
   */
  async recalculateQuotation(quotationId, tx) {
    const db = tx || prisma;

    const items = await db.quotationItem.findMany({
      where: { quotationId },
    });

    if (items.length === 0) {
      // Zero items reset totals to 0.00
      return db.quotation.update({
        where: { id: quotationId },
        data: {
          subtotal: 0.0,
          discountAmount: 0.0,
          taxAmount: 0.0,
          totalAmount: 0.0,
          marginAmount: 0.0,
          marginPercentage: 0.0,
        },
      });
    }

    const subtotal = Number(
      items
        .reduce((sum, it) => sum + Number(it.unitPrice) * it.quantity, 0)
        .toFixed(2)
    );

    const discountAmount = Number(
      items
        .reduce((sum, it) => sum + Number(it.discountAmount), 0)
        .toFixed(2)
    );

    const taxAmount = Number(
      items
        .reduce((sum, it) => sum + Number(it.taxAmount), 0)
        .toFixed(2)
    );

    const totalAmount = Number((subtotal - discountAmount + taxAmount).toFixed(2));

    const totalCost = Number(
      items
        .reduce((sum, it) => sum + Number(it.costPrice) * it.quantity, 0)
        .toFixed(2)
    );

    const netSelling = Number((subtotal - discountAmount).toFixed(2));
    const marginAmount = Number((netSelling - totalCost).toFixed(2));
    const marginPercentage =
      netSelling > 0 ? Number(((marginAmount / netSelling) * 100).toFixed(2)) : 0.0;

    return db.quotation.update({
      where: { id: quotationId },
      data: {
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        marginAmount,
        marginPercentage,
      },
    });
  }

  // ==========================================
  // STATUS TRANSITIONS & SUBMISSION
  // ==========================================

  /**
   * Submit quotation for approval
   * @param {string} quotationId
   * @param {{ id: string, role: string }} user
   */
  async submitQuotation(quotationId, user) {
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: { items: true },
    });
    if (!quotation) {
      throw new AppError('Quotation not found', 404);
    }

    this.validateQuotationOwnership(quotation, user);
    this.validateQuotationEditable(quotation);

    if (quotation.items.length === 0) {
      throw new AppError('Cannot submit a quotation with zero items. Please add at least one product item.', 400);
    }

    // Recalculate totals to ensure absolute freshness
    await this.recalculateQuotation(quotationId);

    // Evaluate risk and approval requirement via Risk Engine
    const riskEvaluation = await riskService.evaluateQuotationRisk(quotationId, {
      persist: false,
    });

    const updated = await prisma.quotation.update({
      where: { id: quotationId },
      data: {
        status: QuoteStatus.PENDING_APPROVAL,
        riskScore: riskEvaluation.riskScore,
        riskLevel: riskEvaluation.riskLevel,
        approvalRequired: riskEvaluation.approvalRequired,
      },
      include: {
        customer: true,
        salesRep: { select: { id: true, name: true, email: true, role: true } },
        items: true,
      },
    });

    // Create approval requests if approval is required
    if (riskEvaluation.approvalRequired) {
      await approvalService.createApprovalRequests(quotationId, riskEvaluation);
    }

    await recordAuditLog({
      userId: user.id,
      entityType: 'QUOTATION',
      entityId: quotationId,
      action: 'QUOTE_SUBMITTED',
      oldValue: { status: quotation.status },
      newValue: {
        status: updated.status,
        riskScore: updated.riskScore,
        riskLevel: updated.riskLevel,
        approvalRequired: updated.approvalRequired,
        approvalRequirements: riskEvaluation.approvalRequirements,
      },
      reason: 'Quotation submitted by sales representative',
    });

    try {
      await notificationEvents.handleQuotationSubmitted(updated, user);
      if (updated.riskLevel === 'HIGH' || updated.riskLevel === 'CRITICAL') {
        await notificationEvents.handleHighRiskQuotation(updated);
      }
    } catch (notifErr) {
      // Non-fatal
    }

    return updated;
  }

  /**
   * Cancel a quotation
   * @param {string} quotationId
   * @param {{ id: string, role: string }} user
   */
  async cancelQuotation(quotationId, user) {
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
    });
    if (!quotation) {
      throw new AppError('Quotation not found', 404);
    }

    this.validateQuotationOwnership(quotation, user);

    if (quotation.status === QuoteStatus.CONFIRMED) {
      throw new AppError('Confirmed quotations cannot be cancelled directly', 422);
    }

    if (quotation.status === QuoteStatus.CANCELLED) {
      throw new AppError('Quotation is already cancelled', 400);
    }

    const updated = await prisma.quotation.update({
      where: { id: quotationId },
      data: {
        status: QuoteStatus.CANCELLED,
      },
    });

    await recordAuditLog({
      userId: user.id,
      entityType: 'QUOTATION',
      entityId: quotationId,
      action: 'QUOTE_CANCELLED',
      oldValue: { status: quotation.status },
      newValue: { status: updated.status },
      reason: 'Quotation marked as cancelled',
    });

    try {
      await activityService.createActivity({
        actorUserId: user.id,
        entityType: 'QUOTATION',
        entityId: quotationId,
        action: 'QUOTATION_CANCELLED',
        description: `Quotation ${quotation.quoteNumber} cancelled`,
        metadata: { quoteNumber: quotation.quoteNumber },
      });
    } catch (actErr) {
      // Non-fatal
    }

    return updated;
  }
}

export const quotationService = new QuotationService();
