import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';
import { getPaginationParams, formatPagination } from '../utils/pagination.js';
import { recordAuditLog } from '../utils/auditLogger.js';

export class PriceListService {
  /**
   * Create a new price list
   * @param {object} data
   * @param {string} [userId]
   */
  async createPriceList(data, userId) {
    const existing = await prisma.priceList.findUnique({
      where: { name: data.name },
    });
    if (existing) {
      throw new AppError(`Price list with name "${data.name}" already exists`, 409);
    }

    const priceList = await prisma.priceList.create({
      data: {
        name: data.name,
        customerTier: data.customerTier,
        currency: data.currency || 'USD',
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    await recordAuditLog({
      userId,
      entityType: 'PRICE_LIST',
      entityId: priceList.id,
      action: 'CREATE_PRICE_LIST',
      newValue: priceList,
      reason: 'Admin price list creation',
    });

    return priceList;
  }

  /**
   * Get price lists with pagination
   * @param {object} filters
   * @param {object} pagination
   */
  async getPriceLists(filters = {}, pagination = {}) {
    const { page, limit, skip } = getPaginationParams(pagination);

    const where = {};
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive === 'true' || filters.isActive === true;
    }
    if (filters.customerTier) {
      where.customerTier = filters.customerTier;
    }

    const [total, priceLists] = await Promise.all([
      prisma.priceList.count({ where }),
      prisma.priceList.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { items: true },
          },
        },
      }),
    ]);

    return {
      priceLists,
      pagination: formatPagination(total, page, limit),
    };
  }

  /**
   * Retrieve price list by ID with all item lines
   * @param {string} id
   */
  async getPriceListById(id) {
    const priceList = await prisma.priceList.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                basePrice: true,
                costPrice: true,
                unit: true,
              },
            },
          },
          orderBy: { minimumQuantity: 'asc' },
        },
      },
    });

    if (!priceList) {
      throw new AppError('Price list not found', 404);
    }

    return priceList;
  }

  /**
   * Update price list header
   * @param {string} id
   * @param {object} data
   * @param {string} [userId]
   */
  async updatePriceList(id, data, userId) {
    const existing = await prisma.priceList.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Price list not found', 404);
    }

    if (data.name && data.name !== existing.name) {
      const duplicate = await prisma.priceList.findUnique({ where: { name: data.name } });
      if (duplicate) {
        throw new AppError(`Price list with name "${data.name}" already exists`, 409);
      }
    }

    const updated = await prisma.priceList.update({
      where: { id },
      data,
    });

    await recordAuditLog({
      userId,
      entityType: 'PRICE_LIST',
      entityId: id,
      action: 'UPDATE_PRICE_LIST',
      oldValue: existing,
      newValue: updated,
      reason: 'Price list update',
    });

    return updated;
  }

  /**
   * Deactivate price list
   * @param {string} id
   * @param {string} [userId]
   */
  async deactivatePriceList(id, userId) {
    const existing = await prisma.priceList.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Price list not found', 404);
    }

    const updated = await prisma.priceList.update({
      where: { id },
      data: { isActive: false },
    });

    await recordAuditLog({
      userId,
      entityType: 'PRICE_LIST',
      entityId: id,
      action: 'DEACTIVATE_PRICE_LIST',
      oldValue: { isActive: true },
      newValue: { isActive: false },
    });

    return { message: 'Price list deactivated successfully', priceList: updated };
  }

  // ==========================================
  // PRICE LIST ITEM OPERATIONS
  // ==========================================

  /**
   * Add a product price to a price list
   * @param {string} priceListId
   * @param {object} data
   * @param {string} [userId]
   */
  async addPriceListItem(priceListId, data, userId) {
    // Verify price list exists
    const priceList = await prisma.priceList.findUnique({ where: { id: priceListId } });
    if (!priceList) {
      throw new AppError('Price list not found', 404);
    }

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) {
      throw new AppError('Specified product does not exist', 400);
    }

    const minQty = data.minimumQuantity || 1;

    // Check duplicate item entry
    const existing = await prisma.priceListItem.findUnique({
      where: {
        priceListId_productId_minimumQuantity: {
          priceListId,
          productId: data.productId,
          minimumQuantity: minQty,
        },
      },
    });
    if (existing) {
      throw new AppError(
        `This product already has a price entry for minimum quantity ${minQty} in this price list`,
        409
      );
    }

    const item = await prisma.priceListItem.create({
      data: {
        priceListId,
        productId: data.productId,
        price: data.price,
        minimumQuantity: minQty,
      },
      include: {
        product: { select: { id: true, name: true, sku: true, basePrice: true } },
      },
    });

    await recordAuditLog({
      userId,
      entityType: 'PRICE_LIST_ITEM',
      entityId: item.id,
      action: 'ADD_PRICE_LIST_ITEM',
      newValue: item,
      reason: `Added product ${product.sku} to price list ${priceList.name}`,
    });

    return item;
  }

  /**
   * Retrieve items for a specific price list
   * @param {string} priceListId
   * @param {object} pagination
   */
  async getPriceListItems(priceListId, pagination = {}) {
    const { page, limit, skip } = getPaginationParams(pagination);

    const priceList = await prisma.priceList.findUnique({ where: { id: priceListId } });
    if (!priceList) {
      throw new AppError('Price list not found', 404);
    }

    const where = { priceListId };

    const [total, items] = await Promise.all([
      prisma.priceListItem.count({ where }),
      prisma.priceListItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ productId: 'asc' }, { minimumQuantity: 'asc' }],
        include: {
          product: {
            select: { id: true, name: true, sku: true, basePrice: true, costPrice: true },
          },
        },
      }),
    ]);

    return {
      items,
      pagination: formatPagination(total, page, limit),
    };
  }

  /**
   * Update price list item
   * @param {string} id
   * @param {object} data
   * @param {string} [userId]
   */
  async updatePriceListItem(id, data, userId) {
    const existing = await prisma.priceListItem.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Price list item not found', 404);
    }

    const updated = await prisma.priceListItem.update({
      where: { id },
      data,
      include: {
        product: { select: { id: true, name: true, sku: true, basePrice: true } },
      },
    });

    await recordAuditLog({
      userId,
      entityType: 'PRICE_LIST_ITEM',
      entityId: id,
      action: 'UPDATE_PRICE_LIST_ITEM',
      oldValue: existing,
      newValue: updated,
    });

    return updated;
  }

  /**
   * Remove item from price list
   * @param {string} id
   * @param {string} [userId]
   */
  async removePriceListItem(id, userId) {
    const existing = await prisma.priceListItem.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Price list item not found', 404);
    }

    await prisma.priceListItem.delete({ where: { id } });

    await recordAuditLog({
      userId,
      entityType: 'PRICE_LIST_ITEM',
      entityId: id,
      action: 'REMOVE_PRICE_LIST_ITEM',
      oldValue: existing,
    });

    return { message: 'Price list item removed successfully' };
  }

  /**
   * Retrieve applicable price list price for a product (used by Quotation engine)
   * @param {string} priceListId
   * @param {string} productId
   */
  async getProductPrice(priceListId, productId) {
    const priceList = await prisma.priceList.findUnique({ where: { id: priceListId } });
    if (!priceList) {
      throw new AppError('Price list not found', 404);
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Find custom price list entries for this product
    const items = await prisma.priceListItem.findMany({
      where: { priceListId, productId },
      orderBy: { minimumQuantity: 'asc' },
    });

    return {
      priceList: {
        id: priceList.id,
        name: priceList.name,
        customerTier: priceList.customerTier,
        currency: priceList.currency,
      },
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        basePrice: product.basePrice,
        costPrice: product.costPrice,
      },
      priceEntries: items,
      defaultPrice: items.length > 0 ? items[0].price : product.basePrice,
    };
  }
}

export const priceListService = new PriceListService();
