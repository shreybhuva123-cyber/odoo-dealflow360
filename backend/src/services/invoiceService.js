import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';
import { recordAuditLog } from '../utils/auditLogger.js';
import { formatPagination } from '../utils/pagination.js';
import { InvoiceStatus, PaymentStatus, UserRole } from '@prisma/client';
import { notificationEvents } from './notificationEvents.js';
import { activityService } from './activityService.js';

export class InvoiceService {
  /**
   * Concurrency-safe invoice number generator: INV-YYYY-000001
   * @param {any} tx
   * @returns {Promise<string>}
   */
  async generateInvoiceNumber(tx) {
    const db = tx || prisma;
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;

    const latest = await db.invoice.findFirst({
      where: { invoiceNumber: { startsWith: prefix } },
      orderBy: { invoiceNumber: 'desc' },
      select: { invoiceNumber: true },
    });

    let nextSeq = 1;
    if (latest && latest.invoiceNumber) {
      const parts = latest.invoiceNumber.split('-');
      if (parts.length === 3) {
        const parsed = parseInt(parts[2], 10);
        if (!isNaN(parsed)) {
          nextSeq = parsed + 1;
        }
      }
    }

    let candidate = `${prefix}${String(nextSeq).padStart(6, '0')}`;
    let exists = await db.invoice.findUnique({ where: { invoiceNumber: candidate }, select: { id: true } });
    while (exists) {
      nextSeq += 1;
      candidate = `${prefix}${String(nextSeq).padStart(6, '0')}`;
      exists = await db.invoice.findUnique({ where: { invoiceNumber: candidate }, select: { id: true } });
    }

    return candidate;
  }

  /**
   * Calculate single invoice item line amounts
   */
  calculateInvoiceItem(itemData) {
    const quantity = Number(itemData.quantity || 1);
    const unitPrice = Number(itemData.unitPrice || 0);
    const grossAmount = Number((quantity * unitPrice).toFixed(2));
    const discountPercentage = Number(itemData.discountPercentage || 0);

    const discountAmount = itemData.discountAmount !== undefined
      ? Number(Number(itemData.discountAmount).toFixed(2))
      : Number(((grossAmount * discountPercentage) / 100).toFixed(2));

    const netAmount = Number((grossAmount - discountAmount).toFixed(2));
    const taxAmount = itemData.taxAmount !== undefined
      ? Number(Number(itemData.taxAmount).toFixed(2))
      : 0;

    const lineTotal = Number((netAmount + taxAmount).toFixed(2));

    return {
      quantity,
      unitPrice,
      grossAmount,
      discountPercentage,
      discountAmount,
      taxAmount,
      lineTotal,
    };
  }

  /**
   * Calculate invoice subtotal (sum of gross item amounts)
   */
  calculateInvoiceSubtotal(invoiceItems) {
    return Number(
      invoiceItems
        .reduce((sum, item) => sum + Number(item.quantity || 1) * Number(item.unitPrice || 0), 0)
        .toFixed(2)
    );
  }

  /**
   * Calculate total discount amount across invoice items
   */
  calculateInvoiceDiscount(invoiceItems) {
    return Number(
      invoiceItems
        .reduce((sum, item) => sum + Number(item.discountAmount || 0), 0)
        .toFixed(2)
    );
  }

  /**
   * Calculate total tax amount across invoice items
   */
  calculateInvoiceTax(invoiceItems) {
    return Number(
      invoiceItems
        .reduce((sum, item) => sum + Number(item.taxAmount || 0), 0)
        .toFixed(2)
    );
  }

  /**
   * Calculate grand total = subtotal - discount + tax
   */
  calculateInvoiceTotal(subtotal, discountAmount, taxAmount) {
    return Number((Number(subtotal) - Number(discountAmount) + Number(taxAmount)).toFixed(2));
  }

  /**
   * Calculate total paid amount from valid completed payments
   */
  calculateInvoicePaidAmount(payments) {
    if (!payments || !Array.isArray(payments)) return 0;
    return Number(
      payments
        .filter((p) => p.status === PaymentStatus.COMPLETED || p.status === PaymentStatus.SUCCESSFUL)
        .reduce((sum, p) => sum + Number(p.amount || 0), 0)
        .toFixed(2)
    );
  }

  /**
   * Calculate outstanding amount = total - paid (never negative)
   */
  calculateInvoiceOutstandingAmount(totalAmount, paidAmount) {
    const remaining = Number((Number(totalAmount) - Number(paidAmount)).toFixed(2));
    return Math.max(0, remaining);
  }

  /**
   * Derive status based on financial balances and due date
   */
  calculateInvoiceStatus(invoice) {
    if (invoice.status === InvoiceStatus.CANCELLED) return InvoiceStatus.CANCELLED;
    const paid = Number(invoice.paidAmount || 0);
    const total = Number(invoice.totalAmount || 0);
    const outstanding = this.calculateInvoiceOutstandingAmount(total, paid);

    if (outstanding === 0 && total > 0 && paid >= total) {
      return InvoiceStatus.PAID;
    }

    const isPastDue = invoice.dueDate && new Date(invoice.dueDate) < new Date();

    if (paid > 0 && paid < total) {
      return isPastDue ? InvoiceStatus.OVERDUE : InvoiceStatus.PARTIALLY_PAID;
    }

    if (paid === 0) {
      if (invoice.status === InvoiceStatus.DRAFT) return InvoiceStatus.DRAFT;
      return isPastDue ? InvoiceStatus.OVERDUE : InvoiceStatus.ISSUED;
    }

    return invoice.status || InvoiceStatus.DRAFT;
  }

  /**
   * Validate invoice status transitions
   */
  validateInvoiceStatusTransition(currentStatus, newStatus) {
    const allowedTransitions = {
      [InvoiceStatus.DRAFT]: [InvoiceStatus.ISSUED, InvoiceStatus.CANCELLED],
      [InvoiceStatus.ISSUED]: [
        InvoiceStatus.PARTIALLY_PAID,
        InvoiceStatus.PAID,
        InvoiceStatus.OVERDUE,
        InvoiceStatus.CANCELLED,
      ],
      [InvoiceStatus.PARTIALLY_PAID]: [
        InvoiceStatus.PAID,
        InvoiceStatus.OVERDUE,
        InvoiceStatus.CANCELLED,
      ],
      [InvoiceStatus.OVERDUE]: [
        InvoiceStatus.PARTIALLY_PAID,
        InvoiceStatus.PAID,
        InvoiceStatus.CANCELLED,
      ],
      [InvoiceStatus.PAID]: [],
      [InvoiceStatus.CANCELLED]: [],
    };

    if (currentStatus === newStatus) return true;
    const validNext = allowedTransitions[currentStatus] || [];
    if (!validNext.includes(newStatus)) {
      throw new AppError(
        `Invalid invoice status transition from ${currentStatus} to ${newStatus}`,
        400
      );
    }
    return true;
  }

  /**
   * Create invoice from confirmed/billable order with item snapshots
   */
  async createInvoiceFromOrder(orderId, userId, data = {}) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true } },
            variant: { select: { id: true, attribute: true, value: true } },
          },
        },
        customer: { select: { id: true, companyName: true, email: true } },
      },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.status === 'CANCELLED') {
      throw new AppError('Order is not eligible for invoicing', 400);
    }

    if (!order.items || order.items.length === 0) {
      throw new AppError('Order is not eligible for invoicing: order has no items', 400);
    }

    // Check for duplicate invoice
    const existing = await prisma.invoice.findFirst({
      where: {
        orderId: order.id,
        status: { not: InvoiceStatus.CANCELLED },
      },
    });

    if (existing) {
      throw new AppError('Invoice already exists for this order', 409);
    }

    return await prisma.$transaction(async (tx) => {
      // Re-check concurrency inside transaction
      const conCheck = await tx.invoice.findFirst({
        where: {
          orderId: order.id,
          status: { not: InvoiceStatus.CANCELLED },
        },
      });
      if (conCheck) {
        throw new AppError('Invoice already exists for this order', 409);
      }

      const invoiceNumber = await this.generateInvoiceNumber(tx);

      // Snapshot line items
      const invoiceItemsData = order.items.map((item) => {
        const nameSnapshot = item.productNameSnapshot || item.product?.name || 'Item';
        const skuSnapshot = item.skuSnapshot || item.product?.sku || 'SKU';
        const qty = item.quantity;
        const unitPrice = Number(item.unitPrice);
        const discPct = Number(item.discountPercentage || 0);
        const discAmt = Number(item.discountAmount || 0);
        const taxAmt = Number(item.taxAmount || 0);
        const lineTotal = Number(item.lineTotal);

        return {
          productId: item.productId,
          variantId: item.variantId || null,
          productNameSnapshot: nameSnapshot,
          skuSnapshot: skuSnapshot,
          description: `${nameSnapshot} (${skuSnapshot})`,
          quantity: qty,
          unitPrice,
          discountPercentage: discPct,
          discountAmount: discAmt,
          taxAmount: taxAmt,
          lineTotal,
          amount: lineTotal,
          isRecurring: item.isRecurring || false,
        };
      });

      // Recalculate server-side totals
      const subtotal = this.calculateInvoiceSubtotal(invoiceItemsData);
      const discountAmount = this.calculateInvoiceDiscount(invoiceItemsData);
      const taxAmount = this.calculateInvoiceTax(invoiceItemsData);
      const totalAmount = this.calculateInvoiceTotal(subtotal, discountAmount, taxAmount);
      const paidAmount = 0.0;
      const outstandingAmount = totalAmount;

      const dueDate = data.dueDate
        ? new Date(data.dueDate)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days standard

      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          orderId: order.id,
          customerId: order.customerId,
          type: 'ONE_TIME',
          subtotal,
          discountAmount,
          taxAmount,
          totalAmount,
          paidAmount,
          outstandingAmount,
          currency: order.currency || 'USD',
          status: InvoiceStatus.DRAFT,
          dueDate,
          notes: data.notes || order.notes || null,
          createdById: userId || null,
          items: {
            create: invoiceItemsData,
          },
        },
        include: {
          items: true,
          customer: {
            select: { id: true, companyName: true, contactName: true, email: true },
          },
          order: {
            select: { id: true, orderNumber: true, status: true, salesRepId: true },
          },
        },
      });

      await recordAuditLog({
        userId,
        entityType: 'INVOICE',
        entityId: invoice.id,
        action: 'CREATE',
        newValue: {
          invoiceNumber,
          orderId: order.id,
          totalAmount,
          status: InvoiceStatus.DRAFT,
        },
        reason: 'Invoice generated from order',
      });

      return invoice;
    });
  }

  /**
   * Get invoices with filters, pagination, and RBAC scoping
   */
  async getInvoices(filters = {}, pagination = { page: 1, limit: 10 }, user) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where = {};

    // RBAC: SALES_REP only sees their orders' invoices
    if (user && user.role === UserRole.SALES_REP) {
      where.order = { salesRepId: user.id };
    }

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.customerId) {
      where.customerId = filters.customerId;
    }
    if (filters.orderId) {
      where.orderId = filters.orderId;
    }
    if (filters.search) {
      where.OR = [
        { invoiceNumber: { contains: filters.search, mode: 'insensitive' } },
        { customer: { companyName: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const [invoices, totalCount] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [filters.sortBy || 'createdAt']: filters.sortOrder || 'desc' },
        include: {
          customer: { select: { id: true, companyName: true, contactName: true, email: true } },
          order: { select: { id: true, orderNumber: true, salesRepId: true } },
          _count: { select: { items: true, payments: true } },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      invoices,
      meta: formatPagination(totalCount, page, limit),
    };
  }

  /**
   * Get single invoice by ID with items, payments, and ownership check
   */
  async getInvoiceById(invoiceId, user) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: { select: { id: true, companyName: true, contactName: true, email: true, phone: true } },
        order: { select: { id: true, orderNumber: true, status: true, salesRepId: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true } },
            variant: { select: { id: true, attribute: true, value: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
        createdBy: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    // Ownership check for SALES_REP
    if (user && user.role === UserRole.SALES_REP && invoice.order?.salesRepId !== user.id) {
      throw new AppError('You are not authorized to access this invoice', 403);
    }

    return invoice;
  }

  /**
   * Get invoice by human-readable invoiceNumber
   */
  async getInvoiceByNumber(invoiceNumber, user) {
    const invoice = await prisma.invoice.findUnique({
      where: { invoiceNumber },
      include: {
        customer: { select: { id: true, companyName: true, contactName: true, email: true } },
        order: { select: { id: true, orderNumber: true, status: true, salesRepId: true } },
        items: true,
        payments: { orderBy: { paymentDate: 'desc' } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    if (user && user.role === UserRole.SALES_REP && invoice.order?.salesRepId !== user.id) {
      throw new AppError('You are not authorized to access this invoice', 403);
    }

    return invoice;
  }

  /**
   * Update draft invoice metadata (locked once issued)
   */
  async updateInvoice(invoiceId, userId, data) {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new AppError('Invoice cannot be modified after issuance', 400);
    }

    const updateData = {};
    if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate);
    if (data.notes !== undefined) updateData.notes = data.notes;

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: updateData,
    });

    await recordAuditLog({
      userId,
      entityType: 'INVOICE',
      entityId: invoiceId,
      action: 'UPDATE',
      oldValue: { dueDate: invoice.dueDate, notes: invoice.notes },
      newValue: updateData,
    });

    return updated;
  }

  /**
   * Issue draft invoice (locks financial values)
   */
  async issueInvoice(invoiceId, userId) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { items: true, customer: true },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new AppError(`Invoice cannot be issued from status ${invoice.status}`, 400);
    }

    if (!invoice.items || invoice.items.length === 0) {
      throw new AppError('Invoice cannot be issued: no items', 400);
    }

    if (Number(invoice.totalAmount) <= 0) {
      throw new AppError('Invoice cannot be issued: total amount must be positive', 400);
    }

    this.validateInvoiceStatusTransition(invoice.status, InvoiceStatus.ISSUED);

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: InvoiceStatus.ISSUED,
        invoiceDate: new Date(),
      },
      include: { items: true, customer: true },
    });

    await recordAuditLog({
      userId,
      entityType: 'INVOICE',
      entityId: invoiceId,
      action: 'ISSUE',
      oldValue: { status: invoice.status },
      newValue: { status: InvoiceStatus.ISSUED, invoiceDate: updated.invoiceDate },
      reason: 'Invoice issued to customer',
    });

    try {
      await notificationEvents.handleInvoiceIssued(updated, { id: userId });
    } catch (err) {
      // Non-fatal
    }

    return updated;
  }

  /**
   * Cancel invoice (only if not paid or cancelled)
   */
  async cancelInvoice(invoiceId, userId, reason) {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new AppError('Cannot cancel a fully paid invoice', 400);
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new AppError('Invoice is already cancelled', 400);
    }

    this.validateInvoiceStatusTransition(invoice.status, InvoiceStatus.CANCELLED);

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: InvoiceStatus.CANCELLED },
    });

    await recordAuditLog({
      userId,
      entityType: 'INVOICE',
      entityId: invoiceId,
      action: 'CANCEL',
      oldValue: { status: invoice.status },
      newValue: { status: InvoiceStatus.CANCELLED },
      reason: reason || 'Invoice cancelled by user',
    });

    try {
      await activityService.createActivity({
        actorUserId: userId,
        entityType: 'INVOICE',
        entityId: invoiceId,
        action: 'INVOICE_CANCELLED',
        description: `Invoice ${invoice.invoiceNumber} cancelled`,
        metadata: { invoiceNumber: invoice.invoiceNumber, reason },
      });
    } catch (err) {
      // Non-fatal
    }

    return updated;
  }

  /**
   * Recalculate invoice financial totals server-side
   */
  async recalculateInvoice(invoiceId, userId) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { items: true, payments: true },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new AppError('Cannot recalculate cancelled invoice', 400);
    }

    const subtotal = this.calculateInvoiceSubtotal(invoice.items);
    const discountAmount = this.calculateInvoiceDiscount(invoice.items);
    const taxAmount = this.calculateInvoiceTax(invoice.items);
    const totalAmount = this.calculateInvoiceTotal(subtotal, discountAmount, taxAmount);
    const paidAmount = this.calculateInvoicePaidAmount(invoice.payments);
    const outstandingAmount = this.calculateInvoiceOutstandingAmount(totalAmount, paidAmount);

    const newStatus = this.calculateInvoiceStatus({
      ...invoice,
      totalAmount,
      paidAmount,
      outstandingAmount,
    });

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        paidAmount,
        outstandingAmount,
        status: newStatus,
        paidAt: newStatus === InvoiceStatus.PAID ? (invoice.paidAt || new Date()) : null,
      },
      include: { items: true, payments: true },
    });

    await recordAuditLog({
      userId,
      entityType: 'INVOICE',
      entityId: invoiceId,
      action: 'RECALCULATE',
      newValue: { subtotal, discountAmount, taxAmount, totalAmount, paidAmount, outstandingAmount, status: newStatus },
    });

    return updated;
  }

  /**
   * Get invoice audit log history
   */
  async getInvoiceHistory(invoiceId, user) {
    await this.getInvoiceById(invoiceId, user); // verifies existence + RBAC
    return await prisma.auditLog.findMany({
      where: {
        entityType: 'INVOICE',
        entityId: invoiceId,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get invoice items
   */
  async getInvoiceItems(invoiceId, user) {
    await this.getInvoiceById(invoiceId, user);
    return await prisma.invoiceItem.findMany({
      where: { invoiceId },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        variant: { select: { id: true, attribute: true, value: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Identify and update all overdue invoices
   */
  async updateOverdueInvoiceStatuses() {
    const now = new Date();
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: { in: [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID] },
        dueDate: { lt: now },
        outstandingAmount: { gt: 0 },
      },
      select: { id: true, invoiceNumber: true, dueDate: true, status: true, outstandingAmount: true },
    });

    if (overdueInvoices.length === 0) {
      return { updatedCount: 0, invoices: [] };
    }

    const ids = overdueInvoices.map((inv) => inv.id);
    await prisma.invoice.updateMany({
      where: { id: { in: ids } },
      data: { status: InvoiceStatus.OVERDUE },
    });

    for (const inv of overdueInvoices) {
      await recordAuditLog({
        entityType: 'INVOICE',
        entityId: inv.id,
        action: 'MARK_OVERDUE',
        oldValue: { status: inv.status },
        newValue: { status: InvoiceStatus.OVERDUE },
        reason: 'Invoice passed due date with outstanding balance',
      });
    }

    return {
      updatedCount: overdueInvoices.length,
      invoices: overdueInvoices,
    };
  }

  /**
   * Calculate customer billing summary
   */
  async getCustomerBillingSummary(customerId, user) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true, companyName: true, customerTier: true },
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const invoices = await prisma.invoice.findMany({
      where: { customerId },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        paidAmount: true,
        outstandingAmount: true,
        dueDate: true,
      },
    });

    const now = new Date();
    let totalInvoicedAmount = 0;
    let totalPaidAmount = 0;
    let totalOutstandingAmount = 0;
    let overdueAmount = 0;
    let paidInvoices = 0;
    let unpaidInvoices = 0;
    let partiallyPaidInvoices = 0;
    let overdueInvoices = 0;
    let cancelledInvoices = 0;

    for (const inv of invoices) {
      const tot = Number(inv.totalAmount || 0);
      const pd = Number(inv.paidAmount || 0);
      const out = Number(inv.outstandingAmount || 0);

      if (inv.status !== InvoiceStatus.CANCELLED) {
        totalInvoicedAmount += tot;
        totalPaidAmount += pd;
        totalOutstandingAmount += out;
      }

      const isOverdue =
        inv.status === InvoiceStatus.OVERDUE ||
        (inv.dueDate && new Date(inv.dueDate) < now && out > 0 && inv.status !== InvoiceStatus.CANCELLED);

      if (isOverdue) {
        overdueAmount += out;
        overdueInvoices++;
      }

      if (inv.status === InvoiceStatus.PAID) paidInvoices++;
      else if (inv.status === InvoiceStatus.ISSUED) unpaidInvoices++;
      else if (inv.status === InvoiceStatus.PARTIALLY_PAID) partiallyPaidInvoices++;
      else if (inv.status === InvoiceStatus.CANCELLED) cancelledInvoices++;
    }

    return {
      customer,
      totalInvoices: invoices.length,
      totalInvoicedAmount: Number(totalInvoicedAmount.toFixed(2)),
      totalPaidAmount: Number(totalPaidAmount.toFixed(2)),
      totalOutstandingAmount: Number(totalOutstandingAmount.toFixed(2)),
      overdueAmount: Number(overdueAmount.toFixed(2)),
      paidInvoices,
      unpaidInvoices,
      partiallyPaidInvoices,
      overdueInvoices,
      cancelledInvoices,
    };
  }
}

export const invoiceService = new InvoiceService();
