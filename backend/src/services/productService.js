import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';
import { getPaginationParams, formatPagination } from '../utils/pagination.js';
import { recordAuditLog } from '../utils/auditLogger.js';

export class ProductService {
  /**
   * Helper to calculate base margin amount and percentage
   * @param {number|string} basePrice
   * @param {number|string} costPrice
   * @returns {{ marginAmount: number, marginPercentage: number }}
   */
  calculateBaseMargin(basePrice, costPrice) {
    const selling = Number(basePrice) || 0;
    const cost = Number(costPrice) || 0;
    const marginAmount = Number((selling - cost).toFixed(2));
    const marginPercentage =
      selling > 0 ? Number((((selling - cost) / selling) * 100).toFixed(2)) : 0;

    return { marginAmount, marginPercentage };
  }

  /**
   * Create a new product
   * @param {object} data
   * @param {string} [userId]
   */
  async createProduct(data, userId) {
    // 1. Verify category exists
    const category = await prisma.productCategory.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new AppError('Specified product category does not exist', 400);
    }

    // 2. Check SKU uniqueness
    const existingSku = await prisma.product.findUnique({
      where: { sku: data.sku },
    });
    if (existingSku) {
      throw new AppError(`A product with SKU "${data.sku}" already exists`, 409);
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        categoryId: data.categoryId,
        description: data.description || null,
        unit: data.unit || 'UNIT',
        basePrice: data.basePrice,
        costPrice: data.costPrice,
        taxRate: data.taxRate || 0.0,
        isSubscription: data.isSubscription || false,
        isActive: true,
      },
      include: {
        category: true,
      },
    });

    await recordAuditLog({
      userId,
      entityType: 'PRODUCT',
      entityId: product.id,
      action: 'CREATE_PRODUCT',
      newValue: product,
      reason: 'Admin product creation',
    });

    const margins = this.calculateBaseMargin(product.basePrice, product.costPrice);
    return { ...product, ...margins };
  }

  /**
   * Query products with filters, search, and database-level pagination
   * @param {object} filters
   * @param {object} pagination
   */
  async getProducts(filters = {}, pagination = {}) {
    const { page, limit, skip } = getPaginationParams(pagination);

    const where = {};

    // Filter by active status
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive === 'true' || filters.isActive === true;
    } else {
      where.isActive = true;
    }

    // Filter by category
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    // Filter by subscription flag
    if (filters.isSubscription !== undefined) {
      where.isSubscription =
        filters.isSubscription === 'true' || filters.isSubscription === true;
    }

    // Search query matching product name or SKU
    if (filters.search) {
      const term = filters.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { sku: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [total, rawProducts] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          category: true,
          variants: true,
        },
      }),
    ]);

    // Attach calculated margins
    const products = rawProducts.map((p) => ({
      ...p,
      ...this.calculateBaseMargin(p.basePrice, p.costPrice),
    }));

    return {
      products,
      pagination: formatPagination(total, page, limit),
    };
  }

  /**
   * Fast targeted product search by keyword
   * @param {string} searchTerm
   * @param {number} limit
   */
  async searchProducts(searchTerm, limit = 10) {
    if (!searchTerm || !searchTerm.trim()) return [];
    const term = searchTerm.trim();

    const raw = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { sku: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: limit,
      include: { category: true },
    });

    return raw.map((p) => ({
      ...p,
      ...this.calculateBaseMargin(p.basePrice, p.costPrice),
    }));
  }

  /**
   * Get single product details including variants, category, and price list items
   * @param {string} id
   */
  async getProductById(id) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        priceListItems: {
          include: {
            priceList: true,
          },
        },
      },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const margins = this.calculateBaseMargin(product.basePrice, product.costPrice);
    return { ...product, ...margins };
  }

  /**
   * Update product master details
   * @param {string} id
   * @param {object} data
   * @param {string} [userId]
   */
  async updateProduct(id, data, userId) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Product not found', 404);
    }

    // Verify category if changed
    if (data.categoryId && data.categoryId !== existing.categoryId) {
      const category = await prisma.productCategory.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        throw new AppError('Specified product category does not exist', 400);
      }
    }

    // Verify SKU uniqueness if changed
    if (data.sku && data.sku !== existing.sku) {
      const duplicateSku = await prisma.product.findUnique({
        where: { sku: data.sku },
      });
      if (duplicateSku) {
        throw new AppError(`A product with SKU "${data.sku}" already exists`, 409);
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: { category: true, variants: true },
    });

    await recordAuditLog({
      userId,
      entityType: 'PRODUCT',
      entityId: id,
      action: 'UPDATE_PRODUCT',
      oldValue: existing,
      newValue: updated,
      reason: 'Admin product update',
    });

    const margins = this.calculateBaseMargin(updated.basePrice, updated.costPrice);
    return { ...updated, ...margins };
  }

  /**
   * Soft-delete product to preserve commercial historical records
   * @param {string} id
   * @param {string} [userId]
   */
  async deactivateProduct(id, userId) {
    const existing = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            quotationItems: true,
            orderItems: true,
            inventoryItems: true,
            subscriptions: true,
          },
        },
      },
    });

    if (!existing) {
      throw new AppError('Product not found', 404);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    await recordAuditLog({
      userId,
      entityType: 'PRODUCT',
      entityId: id,
      action: 'DEACTIVATE_PRODUCT',
      oldValue: { isActive: true },
      newValue: { isActive: false },
      reason: 'Admin product deactivation (soft delete)',
    });

    return {
      message: 'Product deactivated successfully',
      product: updated,
    };
  }

  // ==========================================
  // PRODUCT VARIANT MANAGEMENT
  // ==========================================

  /**
   * Create a variant for a specific product
   * @param {string} productId
   * @param {{ attribute: string, value: string, extraPrice?: number }} data
   * @param {string} [userId]
   */
  async createProductVariant(productId, data, userId) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new AppError('Product not found for variant creation', 404);
    }

    const existing = await prisma.productVariant.findFirst({
      where: {
        productId,
        attribute: data.attribute,
        value: data.value,
      },
    });
    if (existing) {
      throw new AppError(
        `Variant with attribute "${data.attribute}" and value "${data.value}" already exists for this product`,
        409
      );
    }

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        attribute: data.attribute,
        value: data.value,
        extraPrice: data.extraPrice ?? 0.0,
      },
    });

    await recordAuditLog({
      userId,
      entityType: 'PRODUCT_VARIANT',
      entityId: variant.id,
      action: 'CREATE_VARIANT',
      newValue: variant,
      reason: `Created variant for product ${product.sku}`,
    });

    return variant;
  }

  /**
   * Retrieve all variants for a product
   * @param {string} productId
   */
  async getProductVariants(productId) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return prisma.productVariant.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Update a product variant
   * @param {string} id
   * @param {object} data
   * @param {string} [userId]
   */
  async updateProductVariant(id, data, userId) {
    const existing = await prisma.productVariant.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Product variant not found', 404);
    }

    const updated = await prisma.productVariant.update({
      where: { id },
      data,
    });

    await recordAuditLog({
      userId,
      entityType: 'PRODUCT_VARIANT',
      entityId: id,
      action: 'UPDATE_VARIANT',
      oldValue: existing,
      newValue: updated,
    });

    return updated;
  }

  /**
   * Delete or remove product variant
   * @param {string} id
   * @param {string} [userId]
   */
  async deactivateProductVariant(id, userId) {
    const existing = await prisma.productVariant.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Product variant not found', 404);
    }

    await prisma.productVariant.delete({ where: { id } });

    await recordAuditLog({
      userId,
      entityType: 'PRODUCT_VARIANT',
      entityId: id,
      action: 'DELETE_VARIANT',
      oldValue: existing,
    });

    return { message: 'Product variant removed successfully' };
  }
}

export const productService = new ProductService();
