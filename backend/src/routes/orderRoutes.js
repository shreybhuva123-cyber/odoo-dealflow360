import { Router } from 'express';
import { orderController } from '../controllers/orderController.js';
import { fulfillmentController } from '../controllers/fulfillmentController.js';
import { invoiceController } from '../controllers/invoiceController.js';
import { activityController } from '../controllers/activityController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { validate } from '../validators/index.js';
import {
  updateOrderStatusSchema,
  cancelOrderSchema,
  orderFilterSchema,
} from '../validators/orderValidator.js';
import { createFulfillmentSchema } from '../validators/fulfillmentValidator.js';
import { createInvoiceSchema } from '../validators/billingValidator.js';

import { sendError } from '../utils/apiResponse.js';

const router = Router();

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
router.param('id', (req, res, next, id) => {
  if (!uuidRegex.test(id)) {
    return sendError(res, 'Invalid ID format: must be a valid UUID', 'ValidationError', 400);
  }
  next();
});
router.param('orderId', (req, res, next, id) => {
  if (!uuidRegex.test(id)) {
    return sendError(res, 'Invalid ID format: must be a valid UUID', 'ValidationError', 400);
  }
  next();
});

// All order routes require authentication
router.use(authenticateToken);

// List orders
router.get(
  '/',
  authorizeRoles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE', 'OPERATIONS'),
  validate(orderFilterSchema, 'query'),
  orderController.getOrders
);

// Get order by order number (e.g. ORD-2026-000001)
router.get(
  '/number/:orderNumber',
  authorizeRoles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE', 'OPERATIONS'),
  orderController.getOrderByNumber
);

// Get order by ID
router.get(
  '/:id',
  authorizeRoles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE', 'OPERATIONS'),
  orderController.getOrderById
);

// Get order items
router.get(
  '/:id/items',
  authorizeRoles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE', 'OPERATIONS'),
  orderController.getOrderItems
);

// Get order audit history
router.get(
  '/:id/history',
  authorizeRoles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE', 'OPERATIONS'),
  orderController.getOrderHistory
);

// Update order status: OPERATIONS and ADMIN only
router.patch(
  '/:id/status',
  authorizeRoles('ADMIN', 'OPERATIONS'),
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

// Cancel order: ADMIN, OPERATIONS, SALES_MANAGER
router.post(
  '/:id/cancel',
  authorizeRoles('ADMIN', 'OPERATIONS', 'SALES_MANAGER'),
  validate(cancelOrderSchema),
  orderController.cancelOrder
);

// Create fulfillment for order: OPERATIONS, ADMIN
router.post(
  '/:orderId/fulfillment',
  authorizeRoles('ADMIN', 'OPERATIONS'),
  validate(createFulfillmentSchema),
  fulfillmentController.createFulfillment
);

// Get fulfillments for order
router.get(
  '/:orderId/fulfillment',
  authorizeRoles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE', 'OPERATIONS'),
  fulfillmentController.getFulfillment
);

// Create invoice from order: ADMIN, FINANCE
router.post(
  '/:orderId/create-invoice',
  authorizeRoles('ADMIN', 'FINANCE'),
  validate(createInvoiceSchema),
  invoiceController.createInvoiceFromOrder
);

// Get order activity timeline
router.get(
  '/:id/activity',
  authorizeRoles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE', 'OPERATIONS'),
  activityController.getOrderActivity
);

export default router;
