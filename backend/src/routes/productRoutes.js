import { Router } from 'express';
import { productController } from '../controllers/productController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { validate } from '../validators/index.js';
import {
  createProductSchema,
  updateProductSchema,
  createVariantSchema,
} from '../validators/productValidator.js';
import { sendError } from '../utils/apiResponse.js';

const router = Router();

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
router.param('id', (req, res, next, id) => {
  if (!uuidRegex.test(id)) {
    return sendError(res, 'Invalid ID format: must be a valid UUID', 'ValidationError', 400);
  }
  next();
});
router.param('productId', (req, res, next, id) => {
  if (!uuidRegex.test(id)) {
    return sendError(res, 'Invalid ID format: must be a valid UUID', 'ValidationError', 400);
  }
  next();
});

// Authentication required for all product endpoints
router.use(authenticateToken);

// Read endpoints accessible by all internal roles
router.get('/', (req, res, next) => productController.getAll(req, res, next));
router.get('/:id', (req, res, next) => productController.getById(req, res, next));
router.get('/:productId/variants', (req, res, next) =>
  productController.getVariants(req, res, next)
);

// Management endpoints restricted to ADMIN
router.post(
  '/',
  authorizeRoles('ADMIN'),
  validate(createProductSchema),
  (req, res, next) => productController.create(req, res, next)
);

router.put(
  '/:id',
  authorizeRoles('ADMIN'),
  validate(updateProductSchema),
  (req, res, next) => productController.update(req, res, next)
);

router.delete(
  '/:id',
  authorizeRoles('ADMIN'),
  (req, res, next) => productController.delete(req, res, next)
);

// Nested Variant creation
router.post(
  '/:productId/variants',
  authorizeRoles('ADMIN'),
  validate(createVariantSchema),
  (req, res, next) => productController.createVariant(req, res, next)
);

export default router;
