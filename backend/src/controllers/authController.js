import { authService } from '../services/authService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class AuthController {
  /**
   * Public user registration (restricted to SALES_REP)
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const user = await authService.registerUser(req.body);
      return sendSuccess(res, 'User registered successfully', { user }, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * User login with credential verification and JWT generation
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.loginUser(email, password);
      return sendSuccess(res, 'Login successful', result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current authenticated user profile
   * GET /api/auth/me
   */
  async me(req, res, next) {
    try {
      return sendSuccess(res, 'Current user profile retrieved', { user: req.user }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user (stateless JWT acknowledgment)
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      return sendSuccess(
        res,
        'Logout successful. Access token must be removed from client storage.',
        null,
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send 6-digit email verification OTP
   * POST /api/auth/send-otp
   */
  async sendOtp(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.sendVerificationOtp(email);
      return sendSuccess(res, 'Verification code sent successfully', result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify submitted 6-digit email OTP
   * POST /api/auth/verify-otp
   */
  async verifyOtp(req, res, next) {
    try {
      const { email, code } = req.body;
      const result = await authService.verifyEmailOtp(email, code);
      return sendSuccess(res, 'Email verified successfully', result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resend 6-digit email verification OTP
   * POST /api/auth/resend-otp
   */
  async resendOtp(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.resendVerificationOtp(email);
      return sendSuccess(res, 'Verification code resent successfully', result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send 6-digit password reset OTP
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      return sendSuccess(res, 'Password reset verification code dispatched', result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify password reset OTP and return temporary reset token
   * POST /api/auth/verify-reset-otp
   */
  async verifyResetOtp(req, res, next) {
    try {
      const { email, code } = req.body;
      const result = await authService.verifyPasswordResetOtp(email, code);
      return sendSuccess(res, 'Email verified for password reset', result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete password reset using verified resetToken
   * POST /api/auth/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const { email, resetToken, newPassword } = req.body;
      const result = await authService.resetPassword(email, resetToken, newPassword);
      return sendSuccess(res, 'Password reset successful', result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Administrative creation of internal staff with elevated roles
   * POST /api/auth/users
   */
  async adminCreateUser(req, res, next) {
    try {
      const user = await authService.adminCreateUser(req.body);
      return sendSuccess(res, 'Internal user created successfully', { user }, 201);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
