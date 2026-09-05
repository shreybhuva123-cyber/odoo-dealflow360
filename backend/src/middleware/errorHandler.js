import { ZodError } from 'zod';
import { AppError } from '../utils/appError.js';
import { sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  // Sanitize URL query parameters to avoid logging credentials
  const sanitizedUrl = req.originalUrl
    ? req.originalUrl.replace(/([?&](?:password|token|secret|apiKey)=)[^&]+/gi, '$1***')
    : req.url;

  // Log the error
  logger.error(`${req.method} ${sanitizedUrl} - ${err.message}`, {
    stack: config.isDevelopment ? err.stack : undefined,
  });

  // 1. Handle JSON parse error (e.g., malformed body)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(
      res,
      'Invalid JSON payload provided in request body',
      'MalformedJSON',
      400
    );
  }

  // 1b. Handle Payload Too Large (e.g., body exceeding limit)
  if (err.status === 413 || err.statusCode === 413 || err.type === 'entity.too.large') {
    return sendError(
      res,
      'Request payload exceeds the maximum allowed size of 500kb',
      'PayloadTooLarge',
      413
    );
  }

  // 2. Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(
      res,
      'Validation failed',
      'ValidationError',
      400,
      formattedErrors
    );
  }

  // 3. Handle Prisma Known Request Errors
  if (err.name === 'PrismaClientKnownRequestError') {
    switch (err.code) {
      case 'P2002': {
        const target = err.meta?.target ? err.meta.target.join(', ') : 'field';
        return sendError(
          res,
          `A record with this ${target} already exists`,
          'ConflictError',
          409
        );
      }
      case 'P2023': {
        return sendError(
          res,
          'Invalid unique identifier format provided',
          'ValidationError',
          400
        );
      }
      case 'P2025': {
        return sendError(
          res,
          err.meta?.cause || 'Requested record was not found',
          'NotFoundError',
          404
        );
      }
      case 'P2003': {
        return sendError(
          res,
          'Foreign key constraint violation',
          'ForeignKeyViolation',
          400
        );
      }
      case 'P2034': {
        return sendError(
          res,
          'Transaction failed due to concurrent modification. Please retry.',
          'ConflictError',
          409
        );
      }
      default:
        return sendError(
          res,
          'Database operation failed',
          `PrismaError (${err.code})`,
          400
        );
    }
  }

  // 4. Handle Prisma Initialization or Connection Errors
  if (err.name === 'PrismaClientInitializationError') {
    return sendError(
      res,
      'Unable to connect to the database service',
      'DatabaseConnectionError',
      503
    );
  }

  // 5. Handle Custom AppError
  if (err instanceof AppError) {
    return sendError(
      res,
      err.message,
      err.status || 'ApplicationError',
      err.statusCode,
      err.details
    );
  }

  // 6. Generic unhandled error (fallback 500)
  const message = config.isProduction
    ? 'Internal Server Error'
    : err.message || 'Something went wrong';

  return sendError(
    res,
    message,
    err.name || 'InternalServerError',
    500,
    config.isDevelopment ? { stack: err.stack } : null
  );
}
