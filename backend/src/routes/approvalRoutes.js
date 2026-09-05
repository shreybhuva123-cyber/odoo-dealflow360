import { Router } from 'express';
import { approvalController } from '../controllers/approvalController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { validate } from '../validators/index.js';
import {
  rejectApprovalSchema,
  pendingApprovalFilterSchema,
} from '../validators/approvalValidator.js';

import { sendError } from '../utils/apiResponse.js';

const router = Router();

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
router.param('id', (req, res, next, id) => {
  if (!uuidRegex.test(id)) {
    return sendError(res, 'Invalid ID format: must be a valid UUID', 'ValidationError', 400);
  }
  next();
});

// All approval routes require authentication
router.use(authenticateToken);

// Pending approvals dashboard: SALES_MANAGER, FINANCE, ADMIN
router.get(
  '/pending',
  authorizeRoles('SALES_MANAGER', 'FINANCE', 'ADMIN'),
  validate(pendingApprovalFilterSchema, 'query'),
  approvalController.getPending
);

// Single approval detail
router.get(
  '/:id',
  authorizeRoles('SALES_REP', 'SALES_MANAGER', 'FINANCE', 'ADMIN'),
  approvalController.getById
);

// Approve endpoint: SALES_MANAGER, FINANCE, ADMIN
router.post(
  '/:id/approve',
  authorizeRoles('SALES_MANAGER', 'FINANCE', 'ADMIN'),
  approvalController.approve
);

// Reject endpoint: SALES_MANAGER, FINANCE, ADMIN
router.post(
  '/:id/reject',
  authorizeRoles('SALES_MANAGER', 'FINANCE', 'ADMIN'),
  validate(rejectApprovalSchema),
  approvalController.reject
);

export default router;
