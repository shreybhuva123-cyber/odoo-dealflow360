import { Router } from 'express';
import { priceListController } from '../controllers/priceListController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { validate } from '../validators/index.js';
import {
  createPriceListSchema,
  updatePriceListSchema,
  createPriceListItemSchema,
} from '../validators/priceListValidator.js';

const router = Router();

router.use(authenticateToken);

// Read endpoints
router.get('/', (req, res, next) => priceListController.getAll(req, res, next));
router.get('/:id', (req, res, next) => priceListController.getById(req, res, next));
router.get('/:priceListId/items', (req, res, next) =>
  priceListController.getItems(req, res, next)
);

// Quotation Engine Price Lookup
router.get('/:priceListId/products/:productId', (req, res, next) =>
  priceListController.getProductPrice(req, res, next)
);

// Management endpoints (ADMIN only)
router.post(
  '/',
  authorizeRoles('ADMIN'),
  validate(createPriceListSchema),
  (req, res, next) => priceListController.create(req, res, next)
);

router.put(
  '/:id',
  authorizeRoles('ADMIN'),
  validate(updatePriceListSchema),
  (req, res, next) => priceListController.update(req, res, next)
);

router.delete(
  '/:id',
  authorizeRoles('ADMIN'),
  (req, res, next) => priceListController.delete(req, res, next)
);

// Add items to price list
router.post(
  '/:priceListId/items',
  authorizeRoles('ADMIN'),
  validate(createPriceListItemSchema),
  (req, res, next) => priceListController.addItem(req, res, next)
);

export default router;
