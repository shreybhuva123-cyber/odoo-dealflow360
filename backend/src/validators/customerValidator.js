import { z } from 'zod';
import { CustomerTier } from '@prisma/client';

export const createCustomerSchema = z.object({
  companyName: z.string().trim().min(1, 'Company name is required').max(200),
  contactName: z.string().trim().min(1, 'Contact person name is required').max(100),
  email: z.string().trim().email('Invalid customer email format').toLowerCase(),
  phone: z.string().trim().max(30).optional(),
  customerTier: z.nativeEnum(CustomerTier, {
    errorMap: () => ({ message: 'Customer tier must be BRONZE, SILVER, or GOLD' }),
  }).optional().default(CustomerTier.BRONZE),
  currency: z.string().trim().min(3).max(5).optional().default('USD').transform((v) => v.toUpperCase()),
});

export const updateCustomerSchema = z.object({
  companyName: z.string().trim().min(1).max(200).optional(),
  contactName: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().email('Invalid email format').toLowerCase().optional(),
  phone: z.string().trim().max(30).optional(),
  customerTier: z.nativeEnum(CustomerTier).optional(),
  currency: z.string().trim().min(3).max(5).optional().transform((v) => (v ? v.toUpperCase() : v)),
  isActive: z.boolean().optional(),
});
