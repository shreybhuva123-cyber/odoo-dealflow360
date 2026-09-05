import { z } from 'zod';

export const dashboardFilterSchema = z
  .object({
    period: z
      .enum([
        'today',
        'yesterday',
        'this_week',
        'this_month',
        'this_quarter',
        'this_year',
        'last_7_days',
        'last_30_days',
        'last_90_days',
        'custom',
      ])
      .optional()
      .default('this_month'),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Invalid startDate format')
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Invalid endDate format')
      .optional(),
    limit: z.coerce
      .number({ invalid_type_error: 'Limit must be a number' })
      .int('Limit must be an integer')
      .min(1, 'Limit must be at least 1')
      .max(100, 'Limit cannot exceed 100')
      .optional()
      .default(5),
    groupBy: z.enum(['day', 'week', 'month']).optional().default('day'),
    customerId: z.string().uuid('Invalid customer ID format').optional(),
    salesRepId: z.string().uuid('Invalid salesRep ID format').optional(),
  })
  .refine(
    (data) => {
      if (data.period === 'custom') {
        return !!data.startDate && !!data.endDate;
      }
      return true;
    },
    {
      message: 'Both startDate and endDate are required when period is custom',
      path: ['period'],
    }
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return false;
        }
        return start <= end;
      }
      return true;
    },
    {
      message: 'startDate cannot be after endDate',
      path: ['startDate'],
    }
  );
