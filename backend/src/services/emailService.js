import nodemailer from 'nodemailer';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  /**
   * Initializes Nodemailer transporter if SMTP settings are present
   */
  initTransporter() {
    if (config.smtpHost && config.smtpUser && config.smtpPass) {
      try {
        this.transporter = nodemailer.createTransport({
          host: config.smtpHost,
          port: config.smtpPort,
          secure: config.smtpSecure || config.smtpPort === 465,
          auth: {
            user: config.smtpUser,
            pass: config.smtpPass,
          },
        });
        logger.info(`📧 SMTP Email Transporter configured via ${config.smtpHost}:${config.smtpPort}`);
      } catch (err) {
        logger.warn(`⚠️ Failed to initialize SMTP transporter: ${err.message}. Using development logger.`);
        this.transporter = null;
      }
    } else {
      logger.info('ℹ️ SMTP credentials not configured. Email service will run in development mode (terminal logger).');
    }
  }

  /**
   * Generates high-trust HTML template for DealFlow360 OTP Email
   */
  generateOtpHtml(email, otpCode) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DealFlow360 Email Verification</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0A0F1E; margin: 0; padding: 24px; color: #F1F5F9; }
    .container { max-width: 540px; margin: 0 auto; background-color: #111827; border: 1px solid #1F2937; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .header { background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%); padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.025em; }
    .header p { margin: 6px 0 0 0; font-size: 13px; color: #BFDBFE; }
    .body { padding: 32px 28px; }
    .greeting { font-size: 15px; color: #E2E8F0; margin-bottom: 16px; }
    .text { font-size: 14px; line-height: 1.6; color: #94A3B8; margin-bottom: 24px; }
    .otp-card { background-color: #0F172A; border: 2px dashed #3B82F6; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .otp-code { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #60A5FA; margin: 0; }
    .otp-expiry { font-size: 12px; color: #64748B; margin-top: 8px; }
    .security-notice { background-color: rgba(239, 68, 68, 0.1); border-left: 3px solid #EF4444; padding: 12px 16px; border-radius: 6px; font-size: 12px; color: #FCA5A5; margin-top: 24px; }
    .footer { padding: 20px 28px; background-color: #0B0F19; border-top: 1px solid #1F2937; text-align: center; font-size: 11px; color: #64748B; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>DealFlow360 Enterprise</h1>
      <p>Intelligent Sales Operations & B2B Deal Closing</p>
    </div>
    <div class="body">
      <div class="greeting">Hello,</div>
      <div class="text">
        You are verifying your email address (<strong>${email}</strong>) for your DealFlow360 account. Please enter the following 6-digit one-time passcode (OTP) to complete authentication:
      </div>
      <div class="otp-card">
        <div class="otp-code">${otpCode}</div>
        <div class="otp-expiry">Valid for 10 minutes • Single-use only</div>
      </div>
      <div class="text" style="font-size: 12px; margin-bottom: 0;">
        If you did not request this verification code, please ignore this email or contact your workspace administrator immediately.
      </div>
      <div class="security-notice">
        <strong>Security Shield:</strong> DealFlow360 personnel will never ask for this code. Never share your 6-digit OTP with anyone.
      </div>
    </div>
    <div class="footer">
      &copy; 2026 DealFlow360 Security Operations • Automated Delivery Gateway
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Sends 6-digit OTP to target email address
   * @param {string} email
   * @param {string} otpCode
   * @returns {Promise<{ success: boolean, messageId?: string, mode: string }>}
   */
  async sendVerificationOtp(email, otpCode) {
    const subject = `[DealFlow360] ${otpCode} is your email verification code`;
    const htmlContent = this.generateOtpHtml(email, otpCode);
    const textContent = `Your DealFlow360 verification code is: ${otpCode}. This code expires in 10 minutes. Do not share it with anyone.`;

    // 1. If SMTP is configured, attempt real email delivery
    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: config.emailFrom,
          to: email,
          subject,
          text: textContent,
          html: htmlContent,
        });
        logger.info(`✅ OTP email successfully delivered to ${email} (MessageId: ${info.messageId})`);
        return { success: true, messageId: info.messageId, mode: 'smtp' };
      } catch (smtpError) {
        logger.error(`❌ SMTP delivery failed to ${email}: ${smtpError.message}. Falling back to console logger.`);
      }
    }

    // 2. Development logger fallback (clear ASCII banner in terminal for testing)
    console.log('\n' + '='.repeat(64));
    console.log(`🔐 [DealFlow360 EMAIL VERIFICATION DISPATCH]`);
    console.log(`📨 To:      ${email}`);
    console.log(`🔑 6-DIGIT OTP CODE:  [ ${otpCode} ]`);
    console.log(`⏰ Expiry:  10 Minutes`);
    console.log(`🛡️ Status:  Ready for client verification`);
    console.log('='.repeat(64) + '\n');

    return { success: true, mode: 'development-logger' };
  }
}

export const emailService = new EmailService();
