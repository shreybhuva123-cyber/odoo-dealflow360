import { AppError } from './appError.js';

/**
 * Parses dashboard date range parameters and computes current and previous periods
 * @param {{ period?: string, startDate?: string, endDate?: string }} query
 * @returns {{
 *   period: string,
 *   current: { startDate: Date, endDate: Date },
 *   previous: { startDate: Date, endDate: Date }
 * }}
 */
export function parseDashboardDateRange(query = {}) {
  const period = query.period || (query.startDate && query.endDate ? 'custom' : 'this_month');
  const now = new Date();

  let startDate;
  let endDate = new Date(now);

  switch (period) {
    case 'today': {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      break;
    }
    case 'yesterday': {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
      break;
    }
    case 'this_week': {
      const day = now.getDay();
      const diffToMonday = (day + 6) % 7;
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday, 0, 0, 0, 0);
      endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
      break;
    }
    case 'this_month': {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    }
    case 'this_quarter': {
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0, 23, 59, 59, 999);
      break;
    }
    case 'this_year': {
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    }
    case 'last_7_days': {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      endDate = new Date(now);
      break;
    }
    case 'last_30_days': {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      endDate = new Date(now);
      break;
    }
    case 'last_90_days': {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      endDate = new Date(now);
      break;
    }
    case 'custom': {
      if (!query.startDate || !query.endDate) {
        throw new AppError('Both startDate and endDate are required for custom date range', 400);
      }
      startDate = new Date(query.startDate);
      endDate = new Date(query.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new AppError('Invalid date format for startDate or endDate', 400);
      }

      // If user passed YYYY-MM-DD, normalize end of day for endDate
      if (query.endDate.length === 10) {
        endDate.setHours(23, 59, 59, 999);
      }

      if (startDate > endDate) {
        throw new AppError('startDate cannot be after endDate', 400);
      }
      break;
    }
    default:
      throw new AppError(`Unsupported dashboard period: ${period}`, 400);
  }

  // Calculate equivalent previous period
  const durationMs = endDate.getTime() - startDate.getTime();
  const prevEndDate = new Date(startDate.getTime() - 1);
  const prevStartDate = new Date(prevEndDate.getTime() - durationMs);

  return {
    period,
    current: { startDate, endDate },
    previous: { startDate: prevStartDate, endDate: prevEndDate },
  };
}

/**
 * Calculates percentage change with safe division
 * @param {number} current
 * @param {number} previous
 * @returns {number}
 */
export function calculatePercentageChange(current, previous) {
  const c = Number(current || 0);
  const p = Number(previous || 0);

  if (p === 0) {
    if (c === 0) return 0;
    return c > 0 ? 100 : -100;
  }

  const change = ((c - p) / Math.abs(p)) * 100;
  return Number(change.toFixed(2));
}
