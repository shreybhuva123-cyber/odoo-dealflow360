import { Router } from 'express';
import { invoiceController } from '../controllers/invoiceController.js';
import { paymentController } from '../controllers/paymentController.js';
import { activityController } from '../controllers/activityController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { validate } from '../validators/index.js';
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  cancelInvoiceSchema,
  recordPaymentSchema,
  invoiceFilterSchema,
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
router.param('invoiceId', (req, res, next, id) => {
  if (!uuidRegex.test(id)) {
    return sendError(res, 'Invalid ID format: must be a valid UUID', 'ValidationError', 400);
  }
  next();
});

// All invoice routes require authentication
router.use(authenticateToken);

// Update overdue status job route
router.post(
  '/update-overdue',
  authorizeRoles('ADMIN', 'FINANCE'),
  invoiceController.updateOverdueInvoices
);

// List invoices with filtering, pagination, and RBAC
router.get(
  '/',
  authorizeRoles('ADMIN', 'FINANCE', 'SALES_MANAGER', 'SALES_REP', 'OPERATIONS'),
  validate(invoiceFilterSchema, 'query'),
  invoiceController.getInvoices
);

// Get invoice by invoiceNumber (e.g. INV-2026-000001)
router.get(
  '/number/:invoiceNumber',
  authorizeRoles('ADMIN', 'FINANCE', 'SALES_MANAGER', 'SALES_REP', 'OPERATIONS'),
  invoiceController.getInvoiceByNumber
);

// Get invoice by ID
router.get(
  '/:id',
  authorizeRoles('ADMIN', 'FINANCE', 'SALES_MANAGER', 'SALES_REP', 'OPERATIONS'),
  invoiceController.getInvoiceById
);

// Update invoice metadata (draft only)
router.patch(
  '/:id',
  authorizeRoles('ADMIN', 'FINANCE'),
  validate(updateInvoiceSchema),
  invoiceController.updateInvoice
);

// Issue invoice
router.post(
  '/:id/issue',
  authorizeRoles('ADMIN', 'FINANCE'),
  invoiceController.issueInvoice
);

// Cancel invoice
router.post(
  '/:id/cancel',
  authorizeRoles('ADMIN', 'FINANCE'),
  validate(cancelInvoiceSchema),
  invoiceController.cancelInvoice
);

// Recalculate invoice
router.post(
  '/:id/recalculate',
  authorizeRoles('ADMIN', 'FINANCE'),
  invoiceController.recalculateInvoice
);

// Get invoice audit history
router.get(
  '/:id/history',
  authorizeRoles('ADMIN', 'FINANCE', 'SALES_MANAGER', 'SALES_REP', 'OPERATIONS'),
  invoiceController.getInvoiceHistory
);

// Get invoice items
router.get(
  '/:id/items',
  authorizeRoles('ADMIN', 'FINANCE', 'SALES_MANAGER', 'SALES_REP', 'OPERATIONS'),
  invoiceController.getInvoiceItems
);

// Payments nested under invoice
router.post(
  '/:invoiceId/payments',
  authorizeRoles('ADMIN', 'FINANCE'),
  validate(recordPaymentSchema),
  paymentController.recordPayment
);

router.get(
  '/:invoiceId/payments',
  authorizeRoles('ADMIN', 'FINANCE', 'SALES_MANAGER', 'SALES_REP', 'OPERATIONS'),
  paymentController.getPayments
);

router.get(
  '/:invoiceId/payment-summary',
  authorizeRoles('ADMIN', 'FINANCE', 'SALES_MANAGER', 'SALES_REP', 'OPERATIONS'),
  paymentController.getInvoicePaymentSummary
);

// Get invoice activity timeline
router.get(
  '/:id/activity',
  authorizeRoles('ADMIN', 'FINANCE', 'SALES_MANAGER', 'SALES_REP'),
  activityController.getInvoiceActivity
);

export default router;
