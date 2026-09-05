import { config } from '../config/env.js';
import { sendError } from '../utils/apiResponse.js';

/**
 * Factory creating an in-memory sliding-window rate limiter
 * @param {object} options
 * @param {number} [options.windowMs] Time window in ms
 * @param {number} [options.max] Max requests per window
 * @param {string} [options.message] Custom error message
 * @param {function} [options.skip] Custom skip function
 */
export function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000;
  const max = options.max || 100;
  const message = options.message || 'Too many requests, please try again later.';
  const hits = new Map(); // ip -> [timestamps]

  // Periodic cleanup every 5 minutes to prevent memory leaks
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of hits.entries()) {
      const valid = timestamps.filter((t) => now - t < windowMs);
      if (valid.length === 0) {
        hits.delete(ip);
      } else {
        hits.set(ip, valid);
      }
    }
  }, 5 * 60 * 1000);

  if (interval.unref) interval.unref();

  const limiter = (req, res, next) => {
    // Skip if configured (e.g. during fast test runs unless explicitly tested)
    if (options.skip && options.skip(req)) {
      return next();
    }

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const now = Date.now();

    let timestamps = hits.get(ip) || [];
    timestamps = timestamps.filter((t) => now - t < windowMs);

    if (timestamps.length >= max) {
      const oldest = timestamps[0];
      const retryAfter = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
      res.setHeader('Retry-After', retryAfter);
      res.setHeader('RateLimit-Limit', max);
      res.setHeader('RateLimit-Remaining', 0);
      res.setHeader('RateLimit-Reset', Math.ceil((oldest + windowMs) / 1000));

      return sendError(res, message, 'TooManyRequests', 429, { retryAfter });
    }

    timestamps.push(now);
    hits.set(ip, timestamps);

    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', Math.max(0, max - timestamps.length));
    res.setHeader('RateLimit-Reset', Math.ceil((now + windowMs) / 1000));

    next();
  };

  limiter.reset = () => hits.clear();
  return limiter;
}

// Authentication rate limiter: strictly guards login & registration brute force attempts
export const authRateLimiter = createRateLimiter({
  windowMs: config.authRateLimitWindowMs,
  max: config.authRateLimitMax,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
  skip: (req) => config.isTest && req.headers['x-test-rate-limit'] !== 'true',
});

// General API rate limiter
export const generalRateLimiter = createRateLimiter({
  windowMs: config.generalRateLimitWindowMs,
  max: config.generalRateLimitMax,
  message: 'API request limit exceeded. Please slow down.',
  skip: (req) => config.isTest && req.headers['x-test-rate-limit'] !== 'true',
});
