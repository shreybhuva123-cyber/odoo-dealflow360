import { z } from 'zod';
import { CustomerTier } from '@prisma/client';

export const createDiscountRuleSchema = z.object({
  customerTier: z.nativeEnum(CustomerTier, {
    errorMap: () => ({ message: 'customerTier must be one of: BRONZE, SILVER, GOLD' }),
  }),
  categoryId: z.string().uuid('Category ID must be a valid UUID'),
  maxDiscountPercentage: z
    .coerce
    .number({ invalid_type_error: 'maxDiscountPercentage must be a number' })
    .min(0, 'maxDiscountPercentage cannot be negative')
    .max(100, 'maxDiscountPercentage cannot exceed 100'),
  managerApprovalRequiredAbove: z
    .coerce
    .number({ invalid_type_error: 'managerApprovalRequiredAbove must be a number' })
    .min(0, 'managerApprovalRequiredAbove cannot be negative')
    .max(100, 'managerApprovalRequiredAbove cannot exceed 100'),
  financeApprovalRequiredAbove: z
    .coerce
    .number({ invalid_type_error: 'financeApprovalRequiredAbove must be a number' })
    .min(0, 'financeApprovalRequiredAbove cannot be negative')
    .max(100, 'financeApprovalRequiredAbove cannot exceed 100'),
  isActive: z.boolean().optional().default(true),
});

export const updateDiscountRuleSchema = z
  .object({
    customerTier: z.nativeEnum(CustomerTier).optional(),
    categoryId: z.string().uuid('Category ID must be a valid UUID').optional(),
    maxDiscountPercentage: z
      .coerce
      .number({ invalid_type_error: 'maxDiscountPercentage must be a number' })
      .min(0, 'maxDiscountPercentage cannot be negative')
      .max(100, 'maxDiscountPercentage cannot exceed 100')
      .optional(),
    managerApprovalRequiredAbove: z
      .coerce
      .number({ invalid_type_error: 'managerApprovalRequiredAbove must be a number' })
      .min(0, 'managerApprovalRequiredAbove cannot be negative')
      .max(100, 'managerApprovalRequiredAbove cannot exceed 100')
      .optional(),
    financeApprovalRequiredAbove: z
      .coerce
      .number({ invalid_type_error: 'financeApprovalRequiredAbove must be a number' })
      .min(0, 'financeApprovalRequiredAbove cannot be negative')
      .max(100, 'financeApprovalRequiredAbove cannot exceed 100')
      .optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const discountRuleFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  customerTier: z.nativeEnum(CustomerTier).optional(),
  categoryId: z.string().uuid().optional(),
  isActive: z
    .union([z.boolean(), z.string().transform((val) => val === 'true')])
    .optional(),
});
