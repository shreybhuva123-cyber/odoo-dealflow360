import { z } from 'zod';
import { FulfillmentStatus } from '@prisma/client';

export const createFulfillmentSchema = z.object({
  estimatedShipmentCount: z.coerce.number().int().positive().default(1),
  estimatedShippingCost: z.coerce.number().min(0).default(0),
  carrier: z.string().max(100).optional().nullable(),
  trackingNumber: z.string().max(100).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const updateFulfillmentStatusSchema = z.object({
  status: z.nativeEnum(FulfillmentStatus, {
    errorMap: () => ({
      message: `Status must be one of: ${Object.values(FulfillmentStatus).join(', ')}`,
    }),
  }),
  notes: z.string().max(500).optional().nullable(),
});

export const assignFulfillmentSchema = z.object({
  operationsUserId: z.string({ required_error: 'operationsUserId is required' }).uuid('operationsUserId must be a valid UUID'),
});

export const updateTrackingSchema = z.object({
  trackingNumber: z
    .string({ required_error: 'trackingNumber is required' })
    .min(2, 'Tracking number must be at least 2 characters')
    .max(100, 'Tracking number cannot exceed 100 characters'),
  carrier: z
    .string({ required_error: 'carrier is required' })
    .min(2, 'Carrier must be at least 2 characters')
    .max(100, 'Carrier cannot exceed 100 characters'),
  notes: z.string().max(500).optional().nullable(),
});
