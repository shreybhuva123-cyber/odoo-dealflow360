import crypto from 'crypto';
import { logger } from '../utils/logger.js';

class OtpService {
  constructor() {
    // Key: lowercase email, Value: { code, expiresAt, attempts, createdAt }
    this.otpStore = new Map();
    this.OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
    this.RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds cooldown
    this.MAX_ATTEMPTS = 5;

    // Periodic cleanup of expired OTPs every 5 minutes
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpired();
    }, 5 * 60 * 1000);

    // Prevent interval from hanging Node process during tests
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  /**
   * Generates a cryptographically strong 6-digit numeric OTP
   */
  generateCode() {
    return crypto.randomInt(100000, 1000000).toString();
  }

  /**
   * Generates and stores a new OTP for an email address
   * @param {string} email
   * @returns {{ code: string, expiresAt: Date }}
   */
  createOtp(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const code = this.generateCode();
    const now = Date.now();
    const expiresAt = new Date(now + this.OTP_EXPIRY_MS);

    this.otpStore.set(normalizedEmail, {
      code,
      expiresAt: expiresAt.getTime(),
      attempts: 0,
      createdAt: now,
    });

    logger.info(`🔑 6-digit OTP created for ${normalizedEmail} (expires in 10 mins)`);

    return { code, expiresAt };
  }

  /**
   * Checks whether a new OTP can be requested (60-second cooldown check)
   * @param {string} email
   * @returns {{ allowed: boolean, waitSeconds?: number }}
   */
  canResend(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const record = this.otpStore.get(normalizedEmail);

    if (!record) {
      return { allowed: true };
    }

    const elapsed = Date.now() - record.createdAt;
    if (elapsed < this.RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((this.RESEND_COOLDOWN_MS - elapsed) / 1000);
      return { allowed: false, waitSeconds };
    }

    return { allowed: true };
  }

  /**
   * Verifies the submitted OTP for the target email
   * @param {string} email
   * @param {string} code
   * @returns {{ valid: boolean, message: string }}
   */
  verifyOtp(email, code) {
    const normalizedEmail = email.toLowerCase().trim();
    const record = this.otpStore.get(normalizedEmail);

    if (!record) {
      return {
        valid: false,
        message: 'No verification code found for this email. Please request a new code.',
      };
    }

    // Check expiration
    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(normalizedEmail);
      return {
        valid: false,
        message: 'Verification code has expired. Please request a new code.',
      };
    }

    // Check max attempts
    if (record.attempts >= this.MAX_ATTEMPTS) {
      this.otpStore.delete(normalizedEmail);
      return {
        valid: false,
        message: 'Too many incorrect attempts. For security, please request a new verification code.',
      };
    }

    // Compare codes
    if (record.code !== code.trim()) {
      record.attempts += 1;
      const remaining = this.MAX_ATTEMPTS - record.attempts;
      return {
        valid: false,
        message: `Incorrect verification code. ${remaining} attempt(s) remaining.`,
      };
    }

    // Success: single-use OTP consumed
    this.otpStore.delete(normalizedEmail);
    logger.info(`✅ OTP successfully verified for ${normalizedEmail}`);
    return { valid: true, message: 'Email successfully verified' };
  }

  /**
   * Retrieve active OTP for dev/test verification if needed
   * @param {string} email
   */
  getDevOtp(email) {
    const record = this.otpStore.get(email.toLowerCase().trim());
    return record?.code || null;
  }

  /**
   * Cleans up expired OTP records from memory
   */
  cleanupExpired() {
    const now = Date.now();
    for (const [email, record] of this.otpStore.entries()) {
      if (now > record.expiresAt) {
        this.otpStore.delete(email);
      }
    }
  }
}

export const otpService = new OtpService();
