import { sendError } from '../utils/apiResponse.js';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Express middleware to validate that specified route parameters are valid UUIDs
 * Prevents non-UUID path traversals (e.g. ../../etc/passwd) from reaching database layers
 * @param  {...string} paramNames (e.g. 'id', 'orderId')
 */
export function validateUuidParam(...paramNames) {
  return (req, res, next) => {
    for (const param of paramNames) {
      const val = req.params[param];
      if (val && !uuidRegex.test(val)) {
        return sendError(
          res,
          `Invalid parameter "${param}". Must be a valid UUID.`,
          'ValidationError',
          400
        );
      }
    }
    next();
  };
}
