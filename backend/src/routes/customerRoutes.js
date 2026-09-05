import { Router } from 'express';
import { customerController } from '../controllers/customerController.js';
import { orderController } from '../controllers/orderController.js';
import { invoiceController } from '../controllers/invoiceController.js';
import { activityController } from '../controllers/activityController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { validate } from '../validators/index.js';
import { createCustomerSchema, updateCustomerSchema } from '../validators/customerValidator.js';

import { sendError } from '../utils/apiResponse.js';

const router = Router();

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
router.param('id', (req, res, next, id) => {
  if (!uuidRegex.test(id)) {
    return sendError(res, 'Invalid ID format: must be a valid UUID', 'ValidationError', 400);
  }
  next();
});
router.param('customerId', (req, res, next, id) => {
  if (!uuidRegex.test(id)) {
    return sendError(res, 'Invalid ID format: must be a valid UUID', 'ValidationError', 400);
  }
  next();
});

router.use(authenticateToken);

// All internal roles (ADMIN, SALES_REP, SALES_MANAGER, FINANCE, OPERATIONS) can read customer directory
router.get('/', (req, res, next) => customerController.getAll(req, res, next));
router.get('/:id', (req, res, next) => customerController.getById(req, res, next));
router.get('/:customerId/orders', (req, res, next) => orderController.getCustomerOrders(req, res, next));
router.get(
  '/:customerId/billing-summary',
  authorizeRoles('ADMIN', 'FINANCE', 'SALES_MANAGER', 'SALES_REP'),
  (req, res, next) => invoiceController.getCustomerBillingSummary(req, res, next)
);

// Get customer activity timeline
router.get(
  '/:id/activity',
  authorizeRoles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE', 'OPERATIONS'),
  (req, res, next) => activityController.getCustomerActivity(req, res, next)
);

// Only ADMIN can create, update, or deactivate customers
router.post(
  '/',
  authorizeRoles('ADMIN'),
  validate(createCustomerSchema),
  (req, res, next) => customerController.create(req, res, next)
);

router.put(
  '/:id',
  authorizeRoles('ADMIN'),
  validate(updateCustomerSchema),
  (req, res, next) => customerController.update(req, res, next)
);

router.delete(
  '/:id',
  authorizeRoles('ADMIN'),
  (req, res, next) => customerController.delete(req, res, next)
);

export default router;
