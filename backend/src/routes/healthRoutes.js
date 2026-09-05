import { Router } from 'express';
import { healthController } from '../controllers/healthController.js';

const router = Router();

// GET /api/health
router.get('/', (req, res, next) => healthController.getHealth(req, res, next));

// GET /api/health/ready
router.get('/ready', (req, res, next) => healthController.getReadiness(req, res, next));

export default router;
