import { Router } from 'express';
import { notificationController } from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { validate } from '../validators/index.js';
import {
  notificationFilterSchema,
  notificationPreferenceSchema,
} from '../validators/notificationValidator.js';

import { sendError } from '../utils/apiResponse.js';

const router = Router();

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
router.param('id', (req, res, next, id) => {
  if (!uuidRegex.test(id)) {
    return sendError(res, 'Invalid ID format: must be a valid UUID', 'ValidationError', 400);
  }
  next();
});

// All notification endpoints require authenticated user
router.use(authenticateToken);

// 1. Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// 2. Preferences
router.get('/preferences', notificationController.getPreferences);
router.put(
  '/preferences',
  validate(notificationPreferenceSchema),
  notificationController.updatePreference
);

// 3. Mark all as read (supports both /read-all and /mark-all-read)
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/mark-all-read', notificationController.markAllAsRead);

// 4. Batch trigger overdue invoices (Admin only)
router.post(
  '/trigger-overdue',
  authorizeRoles('ADMIN'),
  notificationController.triggerOverdueInvoices
);

// 5. Get user notifications
router.get(
  '/',
  validate(notificationFilterSchema, 'query'),
  notificationController.getNotifications
);

// 6. Get single notification
router.get('/:id', notificationController.getNotificationById);

// 7. Mark single notification as read
router.patch('/:id/read', notificationController.markAsRead);

// 8. Delete single notification
router.delete('/:id', notificationController.deleteNotification);

export default router;
