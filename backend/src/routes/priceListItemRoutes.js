import { Router } from 'express';
import { priceListController } from '../controllers/priceListController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { validate } from '../validators/index.js';
import { updatePriceListItemSchema } from '../validators/priceListValidator.js';

const router = Router();

router.use(authenticateToken);

// Direct update and delete for specific price list item by ID
router.put(
  '/:id',
  authorizeRoles('ADMIN'),
  validate(updatePriceListItemSchema),
  (req, res, next) => priceListController.updateItem(req, res, next)
);

router.delete(
  '/:id',
  authorizeRoles('ADMIN'),
  (req, res, next) => priceListController.deleteItem(req, res, next)
);

export default router;
