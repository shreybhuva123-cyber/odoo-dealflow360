import { verifyAccessToken, sanitizeUser } from '../utils/jwt.js';
import { prisma } from '../config/prisma.js';
import { sendError } from '../utils/apiResponse.js';

/**
 * Express middleware to authenticate requests via JWT Bearer tokens
 */
export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(
        res,
        'Access denied: No authentication token provided',
        'UnauthorizedError',
        401
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return sendError(
        res,
        'Access denied: Malformed authorization header',
        'UnauthorizedError',
        401
      );
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(
          res,
          'Authentication token has expired. Please log in again.',
          'TokenExpiredError',
          401
        );
      }
      return sendError(
        res,
        'Authentication token is invalid or corrupted',
        'InvalidTokenError',
        401
      );
    }

    // Ensure token contains required user ID
    if (!decoded || !decoded.userId) {
      return sendError(
        res,
        'Invalid token payload structure',
        'UnauthorizedError',
        401
      );
    }

    // Retrieve active user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return sendError(
        res,
        'User associated with this token no longer exists',
        'UnauthorizedError',
        401
      );
    }

    if (!user.isActive) {
      return sendError(
        res,
        'User account has been deactivated',
        'ForbiddenError',
        403
      );
    }

    // Attach safe user object to request context
    req.user = sanitizeUser(user);
    next();
  } catch (error) {
    next(error);
  }
}
