import { Router } from 'express';
import { activityController } from '../controllers/activityController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { validate } from '../validators/index.js';
import { activityFilterSchema } from '../validators/notificationValidator.js';

const router = Router();

// All activity routes require authentication
router.use(authenticateToken);

// 1. Recent activity feed with role scoping
router.get(
  '/',
  validate(activityFilterSchema, 'query'),
  activityController.getRecentActivity
);

// 2. Specific entity activity timeline
router.get('/entities/:entityType/:entityId', activityController.getEntityActivity);
router.get('/entity/:entityType/:entityId', activityController.getEntityActivity);

// 3. Entity shortcuts
router.get('/quotations/:id', activityController.getQuotationActivity);
router.get('/orders/:id', activityController.getOrderActivity);
router.get('/invoices/:id', activityController.getInvoiceActivity);
router.get('/customers/:id', activityController.getCustomerActivity);

// 4. Single activity entry by ID
router.get('/:id', activityController.getActivityById);

export default router;
