import { Router } from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { sendSuccess } from '../utils/apiResponse.js';

const router = Router();

/**
 * -------------------------------------------------------------
 * DEVELOPMENT / TESTING RBAC VERIFICATION ROUTES
 * Note: These routes verify role-based middleware functionality.
 * -------------------------------------------------------------
 */

// 1. Admin Test Route: accessible only by ADMIN
router.get('/admin', authenticateToken, authorizeRoles('ADMIN'), (req, res) => {
  return sendSuccess(res, 'Admin access granted', { user: req.user });
});

// 2. Sales Test Route: accessible by SALES_REP, SALES_MANAGER, ADMIN
router.get(
  '/sales',
  authenticateToken,
  authorizeRoles('SALES_REP', 'SALES_MANAGER', 'ADMIN'),
  (req, res) => {
    return sendSuccess(res, 'Sales access granted', { user: req.user });
  }
);

// 3. Sales Manager Test Route: accessible by SALES_MANAGER, ADMIN (disallowed for SALES_REP)
router.get(
  '/sales-manager',
  authenticateToken,
  authorizeRoles('SALES_MANAGER', 'ADMIN'),
  (req, res) => {
    return sendSuccess(res, 'Sales Manager approval access granted', { user: req.user });
  }
);

// 4. Finance Test Route: accessible only by FINANCE, ADMIN
router.get(
  '/finance',
  authenticateToken,
  authorizeRoles('FINANCE', 'ADMIN'),
  (req, res) => {
    return sendSuccess(res, 'Finance access granted', { user: req.user });
  }
);

// 5. Operations Test Route: accessible only by OPERATIONS, ADMIN
router.get(
  '/operations',
  authenticateToken,
  authorizeRoles('OPERATIONS', 'ADMIN'),
  (req, res) => {
    return sendSuccess(res, 'Operations access granted', { user: req.user });
  }
);

export default router;
