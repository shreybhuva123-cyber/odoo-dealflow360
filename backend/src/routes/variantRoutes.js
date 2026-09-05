import { Router } from 'express';
import { productController } from '../controllers/productController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { validate } from '../validators/index.js';
import { updateVariantSchema } from '../validators/productValidator.js';

const router = Router();

router.use(authenticateToken);

router.put(
  '/:id',
  authorizeRoles('ADMIN'),
  validate(updateVariantSchema),
  (req, res, next) => productController.updateVariant(req, res, next)
);

router.delete(
  '/:id',
  authorizeRoles('ADMIN'),
  (req, res, next) => productController.deleteVariant(req, res, next)
);

export default router;
