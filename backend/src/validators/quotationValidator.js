import { z } from 'zod';
import { QuoteStatus } from '@prisma/client';

export const createQuotationSchema = z.object({
  customerId: z.string().uuid('Customer ID must be a valid UUID'),
  expiresAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'expiresAt must be a valid date or ISO string',
    })
    .optional(),
});

export const updateQuotationSchema = z
  .object({
    customerId: z.string().uuid('Customer ID must be a valid UUID').optional(),
    expiresAt: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'expiresAt must be a valid date or ISO string',
      })
      .optional()
      .nullable(),
  })
  .strict();

export const createQuotationItemSchema = z.object({
  productId: z.string().uuid('Product ID must be a valid UUID'),
  variantId: z.string().uuid('Variant ID must be a valid UUID').optional().nullable(),
  quantity: z
    .coerce
    .number({ invalid_type_error: 'Quantity must be a number' })
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1'),
  discountPercentage: z
    .coerce
    .number({ invalid_type_error: 'Discount percentage must be a number' })
    .min(0, 'Discount percentage cannot be negative')
    .max(100, 'Discount percentage cannot exceed 100')
    .optional()
    .default(0),
});

export const updateQuotationItemSchema = z
  .object({
    variantId: z.string().uuid('Variant ID must be a valid UUID').optional().nullable(),
    quantity: z
      .coerce
      .number({ invalid_type_error: 'Quantity must be a number' })
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1')
      .optional(),
    discountPercentage: z
      .coerce
      .number({ invalid_type_error: 'Discount percentage must be a number' })
      .min(0, 'Discount percentage cannot be negative')
      .max(100, 'Discount percentage cannot exceed 100')
      .optional(),
  })
  .strict();

export const quotationFilterSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.nativeEnum(QuoteStatus).optional(),
  customerId: z.string().uuid().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'totalAmount', 'quoteNumber']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
