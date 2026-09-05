import { sendError } from '../utils/apiResponse.js';

/**
 * Middleware factory to enforce Role-Based Access Control (RBAC)
 * @param  {...string} roles Allowed roles (e.g. 'ADMIN', 'FINANCE')
 */
export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(
        res,
        'Authentication required before role verification',
        'UnauthorizedError',
        401
      );
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access forbidden: Requires one of [${roles.join(', ')}] role(s). Your role is [${req.user.role}].`,
        'ForbiddenError',
        403
      );
    }

    next();
  };
}
