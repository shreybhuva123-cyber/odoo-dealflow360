import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';
import { getPaginationParams, formatPagination } from '../utils/pagination.js';
import { recordAuditLog } from '../utils/auditLogger.js';

export class CategoryService {
  /**
   * Create a new product category
   * @param {{ name: string, description?: string, defaultMarginPercentage?: number }} data
   * @param {string} [userId]
   */
  async createCategory(data, userId) {
    const existing = await prisma.productCategory.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new AppError(`Category with name "${data.name}" already exists`, 409);
    }

    const category = await prisma.productCategory.create({
      data: {
        name: data.name,
        description: data.description || null,
        defaultMarginPercentage: data.defaultMarginPercentage ?? 20.0,
        isActive: true,
      },
    });

    await recordAuditLog({
      userId,
      entityType: 'PRODUCT_CATEGORY',
      entityId: category.id,
      action: 'CREATE_CATEGORY',
      newValue: category,
      reason: 'Admin category creation',
    });

    return category;
  }

  /**
   * Retrieve active categories with pagination
   * @param {object} query
   */
  async getCategories(query = {}) {
    const { page, limit, skip } = getPaginationParams(query);

    const where = {};
    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true' || query.isActive === true;
    } else {
      where.isActive = true; // default active
    }

    const [total, categories] = await Promise.all([
      prisma.productCategory.count({ where }),
      prisma.productCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { products: true },
          },
        },
      }),
    ]);

    return {
      categories,
      pagination: formatPagination(total, page, limit),
    };
  }

  /**
   * Retrieve category by ID with related product count
   * @param {string} id
   */
  async getCategoryById(id) {
    const category = await prisma.productCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true, discountRules: true },
        },
      },
    });

    if (!category) {
      throw new AppError('Product category not found', 404);
    }

    return category;
  }

  /**
   * Update category fields
   * @param {string} id
   * @param {object} data
   * @param {string} [userId]
   */
  async updateCategory(id, data, userId) {
    const existing = await prisma.productCategory.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Product category not found', 404);
    }

    if (data.name && data.name !== existing.name) {
      const duplicate = await prisma.productCategory.findUnique({ where: { name: data.name } });
      if (duplicate) {
        throw new AppError(`Category with name "${data.name}" already exists`, 409);
      }
    }

    const updated = await prisma.productCategory.update({
      where: { id },
      data,
    });

    await recordAuditLog({
      userId,
      entityType: 'PRODUCT_CATEGORY',
      entityId: id,
      action: 'UPDATE_CATEGORY',
      oldValue: existing,
      newValue: updated,
      reason: 'Admin category update',
    });

    return updated;
  }

  /**
   * Delete or soft-delete category safely
   * @param {string} id
   * @param {string} [userId]
   */
  async deleteCategory(id, userId) {
    const existing = await prisma.productCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!existing) {
      throw new AppError('Product category not found', 404);
    }

    // If products are associated with category, enforce soft-deletion
    if (existing._count.products > 0) {
      const deactivated = await prisma.productCategory.update({
        where: { id },
        data: { isActive: false },
      });

      await recordAuditLog({
        userId,
        entityType: 'PRODUCT_CATEGORY',
        entityId: id,
        action: 'DEACTIVATE_CATEGORY',
        oldValue: { isActive: true },
        newValue: { isActive: false },
        reason: `Category deactivated (contains ${existing._count.products} associated products)`,
      });

      return {
        softDeleted: true,
        message: `Category deactivated because it contains ${existing._count.products} associated product(s)`,
        category: deactivated,
      };
    }

    // Otherwise if no products, hard delete
    await prisma.productCategory.delete({ where: { id } });

    await recordAuditLog({
      userId,
      entityType: 'PRODUCT_CATEGORY',
      entityId: id,
      action: 'DELETE_CATEGORY',
      oldValue: existing,
      reason: 'Empty category deleted',
    });

    return {
      softDeleted: false,
      message: 'Category deleted successfully',
    };
  }
}

export const categoryService = new CategoryService();
