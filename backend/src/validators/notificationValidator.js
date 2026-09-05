import { z } from 'zod';
import { NotificationType } from '@prisma/client';

export const notificationFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce
    .number({ invalid_type_error: 'Limit must be a number' })
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(20),
  unreadOnly: z
    .preprocess(
      (val) => (val === 'true' || val === true ? true : val === 'false' || val === false ? false : undefined),
      z.boolean().optional()
    ),
  type: z.nativeEnum(NotificationType).optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Invalid startDate format')
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Invalid endDate format')
    .optional(),
});

export const notificationPreferenceSchema = z.object({
  notificationType: z.nativeEnum(NotificationType, {
    required_error: 'notificationType is required',
    invalid_type_error: 'Invalid notificationType',
  }),
  enabled: z.boolean({
    required_error: 'enabled is required',
    invalid_type_error: 'enabled must be a boolean',
  }),
});

export const activityFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce
    .number({ invalid_type_error: 'Limit must be a number' })
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(20),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  action: z.string().optional(),
  actorUserId: z.string().uuid('Invalid actor user ID format').optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Invalid startDate format')
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Invalid endDate format')
    .optional(),
});
