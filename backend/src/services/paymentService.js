import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';
import { recordAuditLog } from '../utils/auditLogger.js';
import { invoiceService } from './invoiceService.js';
import { InvoiceStatus, PaymentStatus, UserRole } from '@prisma/client';
import { notificationEvents } from './notificationEvents.js';

export class PaymentService {
  /**
   * Concurrency-safe payment number generator: PAY-YYYY-000001
   */
  async generatePaymentNumber(tx) {
    const db = tx || prisma;
    const year = new Date().getFullYear();
    const prefix = `PAY-${year}-`;

    const latest = await db.payment.findFirst({
      where: { paymentNumber: { startsWith: prefix } },
      orderBy: { paymentNumber: 'desc' },
      select: { paymentNumber: true },
    });

    let nextSeq = 1;
    if (latest && latest.paymentNumber) {
      const parts = latest.paymentNumber.split('-');
      if (parts.length === 3) {
        const parsed = parseInt(parts[2], 10);
        if (!isNaN(parsed)) {
          nextSeq = parsed + 1;
        }
      }
    }

    let candidate = `${prefix}${String(nextSeq).padStart(6, '0')}`;
    let exists = await db.payment.findUnique({ where: { paymentNumber: candidate }, select: { id: true } });
    while (exists) {
      nextSeq += 1;
      candidate = `${prefix}${String(nextSeq).padStart(6, '0')}`;
      exists = await db.payment.findUnique({ where: { paymentNumber: candidate }, select: { id: true } });
    }

    return candidate;
  }

  /**
   * Record payment on an issued invoice
   */
  async recordPayment(invoiceId, userId, data) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: true,
        order: { select: { id: true, orderNumber: true, salesRepId: true } },
      },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    if (invoice.status === InvoiceStatus.DRAFT) {
      throw new AppError('Invoice must be issued before recording payments', 400);
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new AppError('Invoice is already paid', 400);
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new AppError('Cannot record payment for cancelled invoice', 400);
    }

    const amount = Number(data.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new AppError('Payment amount must be greater than zero', 400);
    }

    const outstanding = Number(invoice.outstandingAmount);
    if (amount > outstanding) {
      throw new AppError('Payment exceeds outstanding amount', 400);
    }

    if (data.transactionReference) {
      const existingTxn = await prisma.payment.findUnique({
        where: { transactionReference: data.transactionReference },
      });
      if (existingTxn) {
        throw new AppError('Duplicate payment transaction reference', 409);
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Concurrency check for transaction reference
      if (data.transactionReference) {
        const conTxn = await tx.payment.findUnique({
          where: { transactionReference: data.transactionReference },
        });
        if (conTxn) {
          throw new AppError('Duplicate payment transaction reference', 409);
        }
      }

      // Re-read invoice within transaction to lock and prevent race condition
      const currentInvoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
      });

      const currentOutstanding = Number(currentInvoice.outstandingAmount);
      if (amount > currentOutstanding) {
        throw new AppError('Payment exceeds outstanding amount', 400);
      }

      const paymentNumber = await this.generatePaymentNumber(tx);
      const paymentDate = data.paymentDate ? new Date(data.paymentDate) : new Date();

      const payment = await tx.payment.create({
        data: {
          paymentNumber,
          invoiceId,
          amount,
          paymentMethod: data.paymentMethod || 'BANK_TRANSFER',
          transactionReference: data.transactionReference || null,
          status: PaymentStatus.COMPLETED,
          paymentDate,
          paidAt: paymentDate,
          notes: data.notes || null,
          createdById: userId || null,
        },
      });

      const newPaidAmount = Number((Number(currentInvoice.paidAmount) + amount).toFixed(2));
      const newOutstandingAmount = Math.max(
        0,
        Number((Number(currentInvoice.totalAmount) - newPaidAmount).toFixed(2))
      );

      let newStatus = currentInvoice.status;
      if (newOutstandingAmount === 0) {
        newStatus = InvoiceStatus.PAID;
      } else if (newPaidAmount > 0) {
        newStatus = InvoiceStatus.PARTIALLY_PAID;
      }

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: newPaidAmount,
          outstandingAmount: newOutstandingAmount,
          status: newStatus,
          paidAt: newStatus === InvoiceStatus.PAID ? new Date() : currentInvoice.paidAt,
        },
      });

      await recordAuditLog({
        userId,
        entityType: 'PAYMENT',
        entityId: payment.id,
        action: 'RECORD',
        newValue: {
          paymentNumber,
          invoiceId,
          amount,
          status: PaymentStatus.COMPLETED,
        },
      });

      await recordAuditLog({
        userId,
        entityType: 'INVOICE',
        entityId: invoiceId,
        action: 'PAYMENT_RECEIVED',
        oldValue: {
          paidAmount: currentInvoice.paidAmount,
          outstandingAmount: currentInvoice.outstandingAmount,
          status: currentInvoice.status,
        },
        newValue: {
          paidAmount: newPaidAmount,
          outstandingAmount: newOutstandingAmount,
          status: newStatus,
        },
      });

      return { payment, invoice: updatedInvoice };
    });

    try {
      await notificationEvents.handlePaymentReceived(result.payment, result.invoice, { id: userId });
      if (result.invoice.status === InvoiceStatus.PAID) {
        await notificationEvents.handleInvoicePaid(result.invoice, { id: userId });
      }
    } catch (err) {
      // Non-fatal
    }

    return result;
  }

  /**
   * Get all payments for an invoice with ownership check
   */
  async getPayments(invoiceId, user) {
    await invoiceService.getInvoiceById(invoiceId, user); // verifies existence & ownership
    return await prisma.payment.findMany({
      where: { invoiceId },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { paymentDate: 'desc' },
    });
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId, user) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        invoice: {
          include: {
            customer: { select: { id: true, companyName: true, email: true } },
            order: { select: { id: true, orderNumber: true, salesRepId: true } },
          },
        },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (user && user.role === UserRole.SALES_REP && payment.invoice.order?.salesRepId !== user.id) {
      throw new AppError('You are not authorized to access this payment', 403);
    }

    return payment;
  }

  /**
   * Update payment metadata
   */
  async updatePayment(paymentId, userId, data) {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (payment.status === PaymentStatus.CANCELLED) {
      throw new AppError('Cannot modify a cancelled payment', 400);
    }

    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: { notes: data.notes || null },
    });

    await recordAuditLog({
      userId,
      entityType: 'PAYMENT',
      entityId: paymentId,
      action: 'UPDATE',
      oldValue: { notes: payment.notes },
      newValue: { notes: updated.notes },
    });

    return updated;
  }

  /**
   * Cancel payment and recalculate invoice balances inside transaction
   */
  async cancelPayment(paymentId, userId, reason) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { invoice: true },
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (payment.status === PaymentStatus.CANCELLED) {
      throw new AppError('Payment is already cancelled', 400);
    }

    return await prisma.$transaction(async (tx) => {
      const cancelledPayment = await tx.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.CANCELLED },
      });

      // Recalculate remaining valid payments
      const validPayments = await tx.payment.findMany({
        where: {
          invoiceId: payment.invoiceId,
          status: { in: [PaymentStatus.COMPLETED, PaymentStatus.SUCCESSFUL] },
        },
      });

      const recalculatedPaidAmount = Number(
        validPayments.reduce((sum, p) => sum + Number(p.amount), 0).toFixed(2)
      );

      const totalAmount = Number(payment.invoice.totalAmount);
      const recalculatedOutstanding = Math.max(
        0,
        Number((totalAmount - recalculatedPaidAmount).toFixed(2))
      );

      let recalculatedStatus = payment.invoice.status;
      const isPastDue = payment.invoice.dueDate && new Date(payment.invoice.dueDate) < new Date();

      if (recalculatedPaidAmount === 0) {
        recalculatedStatus = isPastDue ? InvoiceStatus.OVERDUE : InvoiceStatus.ISSUED;
      } else if (recalculatedOutstanding > 0) {
        recalculatedStatus = isPastDue ? InvoiceStatus.OVERDUE : InvoiceStatus.PARTIALLY_PAID;
      } else {
        recalculatedStatus = InvoiceStatus.PAID;
      }

      const updatedInvoice = await tx.invoice.update({
        where: { id: payment.invoiceId },
        data: {
          paidAmount: recalculatedPaidAmount,
          outstandingAmount: recalculatedOutstanding,
          status: recalculatedStatus,
          paidAt: recalculatedStatus === InvoiceStatus.PAID ? payment.invoice.paidAt : null,
        },
      });

      await recordAuditLog({
        userId,
        entityType: 'PAYMENT',
        entityId: paymentId,
        action: 'CANCEL',
        oldValue: { status: payment.status },
        newValue: { status: PaymentStatus.CANCELLED },
        reason: reason || 'Payment cancelled by user',
      });

      await recordAuditLog({
        userId,
        entityType: 'INVOICE',
        entityId: payment.invoiceId,
        action: 'PAYMENT_CANCELLED',
        oldValue: {
          paidAmount: payment.invoice.paidAmount,
          outstandingAmount: payment.invoice.outstandingAmount,
          status: payment.invoice.status,
        },
        newValue: {
          paidAmount: recalculatedPaidAmount,
          outstandingAmount: recalculatedOutstanding,
          status: recalculatedStatus,
        },
      });

      return { payment: cancelledPayment, invoice: updatedInvoice };
    });
  }

  /**
   * Get invoice payment summary
   */
  async getInvoicePaymentSummary(invoiceId, user) {
    const invoice = await invoiceService.getInvoiceById(invoiceId, user);
    const payments = await prisma.payment.findMany({
      where: { invoiceId },
      orderBy: { paymentDate: 'desc' },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    });

    return {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      invoiceTotal: Number(invoice.totalAmount),
      paidAmount: Number(invoice.paidAmount),
      outstandingAmount: Number(invoice.outstandingAmount),
      paymentStatus: invoice.status,
      paymentCount: payments.length,
      paymentHistory: payments,
    };
  }
}

export const paymentService = new PaymentService();
