import { z } from 'zod';
import { InvoiceStatus, PaymentStatus } from '@prisma/client';

export const createInvoiceSchema = z.object({
  dueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
}).passthrough();

export const updateInvoiceSchema = z.object({
  dueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
}).strict();

export const cancelInvoiceSchema = z.object({
  reason: z.string().max(500, 'Cancellation reason cannot exceed 500 characters').optional().nullable(),
});

export const recordPaymentSchema = z.object({
  amount: z.coerce
    .number({ required_error: 'Payment amount is required' })
    .refine((val) => !isNaN(val), { message: 'Invalid payment amount' })
    .refine((val) => val > 0, { message: 'Payment amount must be greater than zero' }),
  paymentMethod: z.string().min(1, 'Payment method is required').default('BANK_TRANSFER'),
  transactionReference: z.string().min(1).max(100).optional().nullable(),
  paymentDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
});

export const updatePaymentSchema = z.object({
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
}).strict();

export const cancelPaymentSchema = z.object({
  reason: z.string().max(500, 'Cancellation reason cannot exceed 500 characters').optional().nullable(),
});

export const invoiceFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.nativeEnum(InvoiceStatus).optional(),
  customerId: z.string().uuid('Customer ID must be a valid UUID').optional(),
  orderId: z.string().uuid('Order ID must be a valid UUID').optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'totalAmount', 'dueDate', 'invoiceNumber']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  startDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  endDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
});
