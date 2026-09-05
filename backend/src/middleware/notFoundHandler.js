import { sendError } from '../utils/apiResponse.js';

export function notFoundHandler(req, res, next) {
  return sendError(
    res,
    `Route ${req.method} ${req.originalUrl} not found on this server`,
    'NotFoundError',
    404
  );
}
