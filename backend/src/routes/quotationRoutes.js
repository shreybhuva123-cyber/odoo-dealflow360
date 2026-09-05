import { Router } from 'express';
import { quotationController } from '../controllers/quotationController.js';
import { approvalController } from '../controllers/approvalController.js';
import { orderController } from '../controllers/orderController.js';
import { activityController } from '../controllers/activityController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { validate } from '../validators/index.js';
import {
  createQuotationSchema,
  updateQuotationSchema,
  createQuotationItemSchema,
  quotationFilterSchema,
} from '../validators/quotationValidator.js';

import { sendError } from '../utils/apiResponse.js';

const router = Router();

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
router.param('id', (req, res, next, id) => {
  if (!uuidRegex.test(id)) {
    return sendError(res, 'Invalid ID format: must be a valid UUID', 'ValidationError', 400);
  }
  next();
});
router.param('quotationId', (req, res, next, id) => {
  if (!uuidRegex.test(id)) {
    return sendError(res, 'Invalid ID format: must be a valid UUID', 'ValidationError', 400);
  }
  next();
});

// All quotation routes require authentication
router.use(authenticateToken);

// Create quotation: SALES_REP, SALES_MANAGER, ADMIN
router.post(
  '/',
  authorizeRoles('SALES_REP', 'SALES_MANAGER', 'ADMIN'),
  validate(createQuotationSchema),
  quotationController.create
);

// List quotations: all internal roles with RBAC filtering in service
router.get(
  '/',
  authorizeRoles('SALES_REP', 'SALES_MANAGER', 'ADMIN', 'FINANCE', 'OPERATIONS'),
  validate(quotationFilterSchema, 'query'),
  quotationController.getAll
);

// Get quotation details
router.get(
  '/:id',
  authorizeRoles('SALES_REP', 'SALES_MANAGER', 'ADMIN', 'FINANCE', 'OPERATIONS'),
  quotationController.getById
);

// Update draft quotation
router.put(
  '/:id',
  authorizeRoles('SALES_REP', 'SALES_MANAGER', 'ADMIN'),
  validate(updateQuotationSchema),
  quotationController.update
);

// Cancel quotation (DELETE or POST /cancel)
router.delete(
  '/:id',
  authorizeRoles('SALES_REP', 'SALES_MANAGER', 'ADMIN'),
  quotationController.cancel
);

router.post(
  '/:id/cancel',
  authorizeRoles('SALES_REP', 'SALES_MANAGER', 'ADMIN'),
  quotationController.cancel
);

// Add line item to quotation
router.post(
  '/:id/items',
  authorizeRoles('SALES_REP', 'SALES_MANAGER', 'ADMIN'),
  validate(createQuotationItemSchema),
  quotationController.addItem
);

// Recalculate quotation
router.post(
  '/:id/recalculate',
  authorizeRoles('SALES_REP', 'SALES_MANAGER', 'ADMIN'),
  quotationController.recalculate
);

// Submit quotation for approval
router.post(
  '/:id/submit',
  authorizeRoles('SALES_REP', 'SALES_MANAGER', 'ADMIN'),
  quotationController.submit
);

// Evaluate quotation risk and approval requirements
router.post(
  '/:id/evaluate-risk',
  authorizeRoles('SALES_REP', 'SALES_MANAGER', 'ADMIN', 'FINANCE', 'OPERATIONS'),
  quotationController.evaluateRisk
);

// Get quotation approvals
router.get(
  '/:id/approvals',
  authorizeRoles('SALES_REP', 'SALES_MANAGER', 'ADMIN', 'FINANCE', 'OPERATIONS'),
  approvalController.getByQuotation
);

// Get quotation approval history
router.get(
  '/:id/approval-history',
  authorizeRoles('SALES_REP', 'SALES_MANAGER', 'ADMIN', 'FINANCE', 'OPERATIONS'),
  approvalController.getHistoryByQuotation
);

// Create order from approved quotation
router.post(
  '/:quotationId/create-order',
  authorizeRoles('SALES_REP', 'SALES_MANAGER', 'ADMIN'),
  orderController.createOrderFromQuotation
);

router.post(
  '/:id/create-order',
  authorizeRoles('SALES_REP', 'SALES_MANAGER', 'ADMIN'),
  orderController.createOrderFromQuotation
);

// Get quotation activity timeline
router.get(
  '/:id/activity',
  authorizeRoles('SALES_REP', 'SALES_MANAGER', 'ADMIN', 'FINANCE', 'OPERATIONS'),
  activityController.getQuotationActivity
);

export default router;
