import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { validate } from '../validators/index.js';
import { registerSchema, loginSchema, adminCreateUserSchema, sendOtpSchema, verifyOtpSchema, resendOtpSchema } from '../validators/authValidator.js';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public Authentication Endpoints guarded by brute-force rate limiter
router.post('/register', authRateLimiter, validate(registerSchema), (req, res, next) =>
  authController.register(req, res, next)
);

router.post('/login', authRateLimiter, validate(loginSchema), (req, res, next) =>
  authController.login(req, res, next)
);

// Email Verification with Automated 6-Digit OTP
router.post('/send-otp', authRateLimiter, validate(sendOtpSchema), (req, res, next) =>
  authController.sendOtp(req, res, next)
);

router.post('/verify-otp', authRateLimiter, validate(verifyOtpSchema), (req, res, next) =>
  authController.verifyOtp(req, res, next)
);

router.post('/resend-otp', authRateLimiter, validate(resendOtpSchema), (req, res, next) =>
  authController.resendOtp(req, res, next)
);

// Protected User Profile & Session
router.get('/me', authenticateToken, (req, res, next) =>
  authController.me(req, res, next)
);

router.post('/logout', (req, res, next) =>
  authController.logout(req, res, next)
);

// Administrative User Creation (ADMIN only)
router.post(
  '/users',
  authenticateToken,
  authorizeRoles('ADMIN'),
  validate(adminCreateUserSchema),
  (req, res, next) => authController.adminCreateUser(req, res, next)
);

export default router;
