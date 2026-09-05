import { config } from '../config/env.js';

/**
 * Security headers middleware enforcing OWASP and industry security best practices
 */
export function securityHeaders(req, res, next) {
  // Prevent Express server fingerprinting
  res.removeHeader('X-Powered-By');

  // Mitigate MIME sniffing attacks
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Clickjacking mitigation: deny rendering in iframes/frames
  res.setHeader('X-Frame-Options', 'DENY');

  // Disable browser legacy XSS filter to prevent side-channel vulnerabilities
  res.setHeader('X-XSS-Protection', '0');

  // Privacy: restrict referrer leakage across origins
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Restrict resource loading behaviors (with tailored CSP for Swagger UI)
  if (req.path.startsWith('/api-docs')) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none';"
    );
  } else {
    res.setHeader('Content-Security-Policy', "default-src 'self'; frame-ancestors 'none'; object-src 'none';");
  }

  // HTTP Strict Transport Security (HSTS) in production
  if (config.isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
}
