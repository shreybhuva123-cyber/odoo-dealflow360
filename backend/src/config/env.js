import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env relative to project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_fallback',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isTest: process.env.NODE_ENV === 'test',
  // Rate limiting configurations
  authRateLimitWindowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000', 10),
  authRateLimitMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '20', 10),
  generalRateLimitWindowMs: parseInt(process.env.GENERAL_RATE_LIMIT_WINDOW_MS || '900000', 10),
  generalRateLimitMax: parseInt(process.env.GENERAL_RATE_LIMIT_MAX || '500', 10),
  // Email & SMTP configurations
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpSecure: process.env.SMTP_SECURE === 'true',
  emailFrom: process.env.EMAIL_FROM || 'DealFlow360 Security <no-reply@dealflow360.com>',
};

export const env = config;

// Validate critical configurations
if (config.isProduction) {
  if (!process.env.DATABASE_URL) {
    console.error('❌ CRITICAL SECURITY ERROR: DATABASE_URL environment variable is required in production.');
    throw new Error('DATABASE_URL is required in production');
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev_secret_fallback' || process.env.JWT_SECRET.length < 32) {
    console.error('❌ CRITICAL SECURITY ERROR: Strong JWT_SECRET (>= 32 chars) is required in production.');
    throw new Error('Strong JWT_SECRET (>= 32 chars) is required in production');
  }
  if (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN === '*') {
    console.warn('⚠️ WARNING: Wildcard or missing CORS_ORIGIN in production. Specify exact frontend domain(s) for strict security.');
  }
}

