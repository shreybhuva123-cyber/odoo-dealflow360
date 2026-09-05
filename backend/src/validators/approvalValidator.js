import { z } from 'zod';
import { UserRole, RiskLevel } from '@prisma/client';

export const rejectApprovalSchema = z.object({
  rejectionReason: z
    .string({ required_error: 'Rejection reason is required' })
    .trim()
    .min(3, 'Rejection reason must be at least 3 characters')
    .max(500, 'Rejection reason cannot exceed 500 characters'),
});

export const pendingApprovalFilterSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  approvalRole: z.nativeEnum(UserRole).optional(),
  riskLevel: z.nativeEnum(RiskLevel).optional(),
});
