import { Router } from 'express';
import { paymentController } from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { validate } from '../validators/index.js';
import {
  updatePaymentSchema,
  cancelPaymentSchema,
} from '../validators/billingValidator.js';

import { sendError } from '../utils/apiResponse.js';

const router = Router();

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
router.param('id', (req, res, next, id) => {
  if (!uuidRegex.test(id)) {
    return sendError(res, 'Invalid ID format: must be a valid UUID', 'ValidationError', 400);
  }
  next();
});

// All payment routes require authentication
router.use(authenticateToken);

// Get payment by ID
router.get(
  '/:id',
  authorizeRoles('ADMIN', 'FINANCE', 'SALES_MANAGER', 'SALES_REP'),
  paymentController.getPaymentById
);

// Update payment notes/metadata
router.patch(
  '/:id',
  authorizeRoles('ADMIN', 'FINANCE'),
  validate(updatePaymentSchema),
  paymentController.updatePayment
);

// Cancel payment
router.post(
  '/:id/cancel',
  authorizeRoles('ADMIN', 'FINANCE'),
  validate(cancelPaymentSchema),
  paymentController.cancelPayment
);

export default router;
