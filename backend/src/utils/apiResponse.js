/**
 * Utility for uniform API responses across DealFlow360
 */

export function sendSuccess(res, message = 'Success', data = null, statusCode = 200, extra = {}) {
  const payload = {
    success: true,
    message,
    ...(data !== null ? { data } : {}),
    timestamp: new Date().toISOString(),
    ...extra,
  };
  return res.status(statusCode).json(payload);
}

export function sendError(res, message = 'Something went wrong', error = null, statusCode = 500, details = null) {
  const payload = {
    success: false,
    message,
    error: error || message,
    ...(details ? { details } : {}),
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(payload);
}
