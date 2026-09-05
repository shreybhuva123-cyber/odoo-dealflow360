import { Router } from 'express';
import { categoryController } from '../controllers/categoryController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { validate } from '../validators/index.js';
import { createCategorySchema, updateCategorySchema } from '../validators/categoryValidator.js';

const router = Router();

// All category routes require authentication
router.use(authenticateToken);

// Publicly readable by internal authenticated staff (Sales, Finance, Ops, Admin)
router.get('/', (req, res, next) => categoryController.getAll(req, res, next));
router.get('/:id', (req, res, next) => categoryController.getById(req, res, next));

// Write operations strictly restricted to ADMIN
router.post(
  '/',
  authorizeRoles('ADMIN'),
  validate(createCategorySchema),
  (req, res, next) => categoryController.create(req, res, next)
);

router.put(
  '/:id',
  authorizeRoles('ADMIN'),
  validate(updateCategorySchema),
  (req, res, next) => categoryController.update(req, res, next)
);

router.delete(
  '/:id',
  authorizeRoles('ADMIN'),
  (req, res, next) => categoryController.delete(req, res, next)
);

export default router;
