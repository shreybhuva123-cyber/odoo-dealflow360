import { Router } from 'express';
import { fulfillmentController } from '../controllers/fulfillmentController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { validate } from '../validators/index.js';
import {
  updateFulfillmentStatusSchema,
  assignFulfillmentSchema,
  updateTrackingSchema,
} from '../validators/fulfillmentValidator.js';

const router = Router();

// All fulfillment routes require authentication
router.use(authenticateToken);

// Update fulfillment status: OPERATIONS and ADMIN only
router.patch(
  '/:id/status',
  authorizeRoles('ADMIN', 'OPERATIONS'),
  validate(updateFulfillmentStatusSchema),
  fulfillmentController.updateFulfillmentStatus
);

// Assign fulfillment to an operations user: OPERATIONS and ADMIN only
router.patch(
  '/:id/assign',
  authorizeRoles('ADMIN', 'OPERATIONS'),
  validate(assignFulfillmentSchema),
  fulfillmentController.assignFulfillment
);

// Add/update tracking info: OPERATIONS and ADMIN only
router.patch(
  '/:id/tracking',
  authorizeRoles('ADMIN', 'OPERATIONS'),
  validate(updateTrackingSchema),
  fulfillmentController.addTrackingInformation
);

export default router;
