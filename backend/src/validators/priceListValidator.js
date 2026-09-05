import { z } from 'zod';
import { CustomerTier } from '@prisma/client';

export const createPriceListSchema = z.object({
  name: z.string().trim().min(1, 'Price list name is required').max(100),
  customerTier: z.nativeEnum(CustomerTier, {
    errorMap: () => ({ message: 'Customer tier must be BRONZE, SILVER, or GOLD' }),
  }),
  currency: z.string().trim().min(3).max(5).optional().default('USD').transform((v) => v.toUpperCase()),
  isActive: z.boolean().optional().default(true),
});

export const updatePriceListSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  customerTier: z.nativeEnum(CustomerTier).optional(),
  currency: z.string().trim().min(3).max(5).optional().transform((v) => (v ? v.toUpperCase() : v)),
  isActive: z.boolean().optional(),
});

export const createPriceListItemSchema = z.object({
  productId: z.string().uuid('Product ID must be a valid UUID'),
  price: z.coerce.number().min(0, 'Price must be a non-negative number'),
  minimumQuantity: z.coerce.number().int().min(1, 'Minimum quantity must be at least 1').optional().default(1),
});

export const updatePriceListItemSchema = z.object({
  price: z.coerce.number().min(0, 'Price must be a non-negative number').optional(),
  minimumQuantity: z.coerce.number().int().min(1, 'Minimum quantity must be at least 1').optional(),
});
