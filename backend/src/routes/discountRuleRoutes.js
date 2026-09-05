import { Router } from 'express';
import { discountRuleController } from '../controllers/discountRuleController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { validate } from '../validators/index.js';
import {
  createDiscountRuleSchema,
  updateDiscountRuleSchema,
  discountRuleFilterSchema,
} from '../validators/discountRuleValidator.js';

const router = Router();

// All discount rule routes require authentication
router.use(authenticateToken);

// Read rules: ADMIN, SALES_MANAGER, FINANCE
router.get(
  '/',
  authorizeRoles('ADMIN', 'SALES_MANAGER', 'FINANCE'),
  validate(discountRuleFilterSchema, 'query'),
  discountRuleController.getAll
);

router.get(
  '/:id',
  authorizeRoles('ADMIN', 'SALES_MANAGER', 'FINANCE'),
  discountRuleController.getById
);

// Admin-only mutations (Create, Update, Delete)
router.post(
  '/',
  authorizeRoles('ADMIN'),
  validate(createDiscountRuleSchema),
  discountRuleController.create
);

router.put(
  '/:id',
  authorizeRoles('ADMIN'),
  validate(updateDiscountRuleSchema),
  discountRuleController.update
);

router.delete(
  '/:id',
  authorizeRoles('ADMIN'),
  discountRuleController.delete
);

export default router;
