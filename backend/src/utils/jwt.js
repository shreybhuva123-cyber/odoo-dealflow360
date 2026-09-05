import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * Generate a signed JWT containing only minimal user claims
 * @param {{ id: string, role: string }} user
 * @param {string} [expiresIn]
 * @returns {string}
 */
export function generateAccessToken(user, expiresIn = config.jwtExpiresIn) {
  if (!user || !user.id || !user.role) {
    throw new Error('Cannot generate token: user object must have id and role');
  }

  const payload = {
    userId: user.id,
    role: user.role,
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn,
    algorithm: 'HS256',
  });
}

/**
 * Verify a JWT's signature and validity
 * Explicitly mandates HS256 algorithm to prevent 'none' algorithm and key-confusion attacks
 * @param {string} token
 * @returns {object} Decoded payload
 */
export function verifyAccessToken(token) {
  if (!token) {
    throw new Error('JWT token is required for verification');
  }
  return jwt.verify(token, config.jwtSecret, {
    algorithms: ['HS256'],
  });
}

/**
 * Strips passwordHash and returns a safe user object
 * @param {object} user
 * @returns {object}
 */
export function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

/**
 * Generate a short-lived signed JWT specifically for password resets
 * @param {string} email
 * @param {string} [expiresIn='15m']
 * @returns {string}
 */
export function generateResetToken(email, expiresIn = '15m') {
  if (!email) {
    throw new Error('Email is required to generate a password reset token');
  }

  const payload = {
    email: email.toLowerCase().trim(),
    purpose: 'PASSWORD_RESET',
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn,
    algorithm: 'HS256',
  });
}

/**
 * Verify a password reset JWT token and extract email
 * @param {string} token
 * @returns {{ email: string, purpose: string }}
 */
export function verifyResetToken(token) {
  if (!token) {
    throw new Error('Reset token is required');
  }

  const decoded = jwt.verify(token, config.jwtSecret, {
    algorithms: ['HS256'],
  });

  if (decoded.purpose !== 'PASSWORD_RESET') {
    throw new Error('Invalid token purpose: not a password reset token');
  }

  return decoded;
}
