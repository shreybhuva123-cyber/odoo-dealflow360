import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

export const createOrderSchema = z.object({
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
}).passthrough(); // allows client to send metadata without crashing, but financials are ignored

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus, {
    errorMap: () => ({
      message: `Status must be one of: ${Object.values(OrderStatus).join(', ')}`,
    }),
  }),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
});

export const cancelOrderSchema = z.object({
  reason: z
    .string({ required_error: 'Cancellation reason is required' })
    .min(3, 'Cancellation reason must be at least 3 characters')
    .max(500, 'Cancellation reason cannot exceed 500 characters'),
});

export const updateOrderSchema = z.object({
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
});

export const orderFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.nativeEnum(OrderStatus).optional(),
  customerId: z.string().uuid('Customer ID must be a valid UUID').optional(),
  salesRepId: z.string().uuid('Sales Rep ID must be a valid UUID').optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'totalAmount', 'orderNumber']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  startDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  endDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
});
