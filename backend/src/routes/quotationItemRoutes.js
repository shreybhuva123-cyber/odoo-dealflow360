import { Router } from 'express';
import { quotationController } from '../controllers/quotationController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { validate } from '../validators/index.js';
import { updateQuotationItemSchema } from '../validators/quotationValidator.js';

const router = Router();

// All quotation item routes require authentication
router.use(authenticateToken);

// Update quotation item
router.put(
  '/:itemId',
  authorizeRoles('SALES_REP', 'SALES_MANAGER', 'ADMIN'),
  validate(updateQuotationItemSchema),
  quotationController.updateItem
);

// Delete quotation item
router.delete(
  '/:itemId',
  authorizeRoles('SALES_REP', 'SALES_MANAGER', 'ADMIN'),
  quotationController.removeItem
);

export default router;
