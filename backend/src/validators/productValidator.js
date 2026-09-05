import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required').max(200, 'Product name cannot exceed 200 characters'),
  sku: z.string().trim().min(1, 'Product SKU is required').max(100, 'SKU cannot exceed 100 characters').toUpperCase(),
  categoryId: z.string().uuid('Category ID must be a valid UUID'),
  description: z.string().trim().max(1000).optional(),
  unit: z.string().trim().min(1).max(20).optional().default('UNIT'),
  basePrice: z.coerce.number().min(0, 'Base price must be a non-negative number'),
  costPrice: z.coerce.number().min(0, 'Cost price must be a non-negative number'),
  taxRate: z.coerce.number().min(0, 'Tax rate must be non-negative').max(100, 'Tax rate cannot exceed 100%').optional().default(0.0),
  isSubscription: z.boolean().optional().default(false),
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  sku: z.string().trim().min(1).max(100).toUpperCase().optional(),
  categoryId: z.string().uuid('Category ID must be a valid UUID').optional(),
  description: z.string().trim().max(1000).optional(),
  unit: z.string().trim().min(1).max(20).optional(),
  basePrice: z.coerce.number().min(0).optional(),
  costPrice: z.coerce.number().min(0).optional(),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  isSubscription: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const createVariantSchema = z.object({
  attribute: z.string().trim().min(1, 'Variant attribute is required (e.g. RAM, Storage)').max(50),
  value: z.string().trim().min(1, 'Variant value is required (e.g. 16GB, 512GB)').max(50),
  extraPrice: z.coerce.number().min(0, 'Extra price must be a non-negative number').optional().default(0.0),
});

export const updateVariantSchema = z.object({
  attribute: z.string().trim().min(1).max(50).optional(),
  value: z.string().trim().min(1).max(50).optional(),
  extraPrice: z.coerce.number().min(0).optional(),
});
