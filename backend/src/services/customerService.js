import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';
import { getPaginationParams, formatPagination } from '../utils/pagination.js';
import { recordAuditLog } from '../utils/auditLogger.js';
import { CustomerTier } from '@prisma/client';

export class CustomerService {
  /**
   * Helper to validate customer tier
   * @param {string} tier
   */
  validateCustomerTier(tier) {
    if (!Object.values(CustomerTier).includes(tier)) {
      throw new AppError(
        `Invalid customer tier "${tier}". Must be one of: ${Object.values(CustomerTier).join(', ')}`,
        400
      );
    }
    return true;
  }

  /**
   * Create a new B2B customer
   * @param {object} data
   * @param {string} [userId]
   */
  async createCustomer(data, userId) {
    if (data.customerTier) {
      this.validateCustomerTier(data.customerTier);
    }

    const email = data.email.toLowerCase().trim();

    // Check duplicate email
    const existing = await prisma.customer.findUnique({
      where: { email },
    });
    if (existing) {
      throw new AppError(`Customer with email "${email}" already exists`, 409);
    }

    const customer = await prisma.customer.create({
      data: {
        companyName: data.companyName.trim(),
        contactName: data.contactName.trim(),
        email,
        phone: data.phone ? data.phone.trim() : null,
        customerTier: data.customerTier || CustomerTier.BRONZE,
        currency: data.currency || 'USD',
        isActive: true,
      },
    });

    await recordAuditLog({
      userId,
      entityType: 'CUSTOMER',
      entityId: customer.id,
      action: 'CREATE_CUSTOMER',
      newValue: customer,
      reason: 'Customer account creation',
    });

    return customer;
  }

  /**
   * Get paginated customer directory with search and tier filters
   * @param {object} filters
   * @param {object} pagination
   */
  async getCustomers(filters = {}, pagination = {}) {
    const { page, limit, skip } = getPaginationParams(pagination);

    const where = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive === 'true' || filters.isActive === true;
    } else {
      where.isActive = true;
    }

    if (filters.tier) {
      this.validateCustomerTier(filters.tier);
      where.customerTier = filters.tier;
    }

    if (filters.search) {
      const term = filters.search.trim();
      where.OR = [
        { companyName: { contains: term, mode: 'insensitive' } },
        { contactName: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { companyName: 'asc' },
        include: {
          _count: {
            select: {
              quotations: true,
              orders: true,
              subscriptions: true,
            },
          },
        },
      }),
    ]);

    return {
      customers,
      pagination: formatPagination(total, page, limit),
    };
  }

  /**
   * Search customers by term
   * @param {string} searchTerm
   * @param {number} limit
   */
  async searchCustomers(searchTerm, limit = 10) {
    if (!searchTerm || !searchTerm.trim()) return [];
    const term = searchTerm.trim();

    return prisma.customer.findMany({
      where: {
        isActive: true,
        OR: [
          { companyName: { contains: term, mode: 'insensitive' } },
          { contactName: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { companyName: 'asc' },
    });
  }

  /**
   * Retrieve customer details with aggregate counts
   * @param {string} id
   */
  async getCustomerById(id) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            quotations: true,
            orders: true,
            subscriptions: true,
            invoices: true,
            negotiations: true,
          },
        },
      },
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    return customer;
  }

  /**
   * Update customer information
   * @param {string} id
   * @param {object} data
   * @param {string} [userId]
   */
  async updateCustomer(id, data, userId) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Customer not found', 404);
    }

    if (data.customerTier) {
      this.validateCustomerTier(data.customerTier);
    }

    if (data.email && data.email.toLowerCase() !== existing.email) {
      const duplicate = await prisma.customer.findUnique({
        where: { email: data.email.toLowerCase() },
      });
      if (duplicate) {
        throw new AppError(`Customer with email "${data.email}" already exists`, 409);
      }
    }

    const updated = await prisma.customer.update({
      where: { id },
      data,
    });

    await recordAuditLog({
      userId,
      entityType: 'CUSTOMER',
      entityId: id,
      action: 'UPDATE_CUSTOMER',
      oldValue: existing,
      newValue: updated,
      reason: 'Customer profile update',
    });

    return updated;
  }

  /**
   * Soft-deactivate customer to protect historical contracts & quotes
   * @param {string} id
   * @param {string} [userId]
   */
  async deactivateCustomer(id, userId) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Customer not found', 404);
    }

    const deactivated = await prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });

    await recordAuditLog({
      userId,
      entityType: 'CUSTOMER',
      entityId: id,
      action: 'DEACTIVATE_CUSTOMER',
      oldValue: { isActive: true },
      newValue: { isActive: false },
      reason: 'Customer account deactivation',
    });

    return {
      message: 'Customer deactivated successfully. Historical records preserved.',
      customer: deactivated,
    };
  }
}

export const customerService = new CustomerService();
