/**
 * Helper to parse pagination parameters from query string
 * @param {object} query Express req.query
 * @param {number} defaultLimit
 * @param {number} maxLimit
 * @returns {{ page: number, limit: number, skip: number }}
 */
export function getPaginationParams(query, defaultLimit = 20, maxLimit = 100) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const requestedLimit = parseInt(query.limit, 10) || defaultLimit;
  const limit = Math.min(Math.max(1, requestedLimit), maxLimit);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Builds standard pagination response metadata
 * @param {number} total
 * @param {number} page
 * @param {number} limit
 * @returns {{ page: number, limit: number, total: number, totalPages: number }}
 */
export function formatPagination(total, page, limit) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export const calculatePagination = getPaginationParams;
