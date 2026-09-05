import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(100, 'Category name cannot exceed 100 characters'),
  description: z.string().trim().max(500, 'Description cannot exceed 500 characters').optional(),
  defaultMarginPercentage: z.coerce
    .number()
    .min(0, 'Default margin percentage must be at least 0%')
    .max(100, 'Default margin percentage cannot exceed 100%')
    .optional()
    .default(20.0),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1, 'Category name cannot be empty').max(100).optional(),
  description: z.string().trim().max(500).optional(),
  defaultMarginPercentage: z.coerce
    .number()
    .min(0, 'Default margin percentage must be at least 0%')
    .max(100, 'Default margin percentage cannot exceed 100%')
    .optional(),
  isActive: z.boolean().optional(),
});
