import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { validate } from '../validators/index.js';
import { registerSchema, loginSchema, adminCreateUserSchema } from '../validators/authValidator.js';
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
