import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { validate } from '../validators/index.js';
import { dashboardFilterSchema } from '../validators/dashboardValidator.js';

const router = Router();

// All dashboard routes require authentication
router.use(authenticateToken);

/**
 * GET /api/dashboard
 * Dispatches to role-tailored dashboard payload
 */
router.get(
  '/',
  authorizeRoles('ADMIN', 'SALES_MANAGER', 'SALES_REP', 'FINANCE', 'OPERATIONS'),
  validate(dashboardFilterSchema, 'query'),
  dashboardController.getRoleDashboard
);

/**
 * GET /api/dashboard/summary
 * Executive KPI summary with period-over-period comparison
 */
router.get(
  '/summary',
  authorizeRoles('ADMIN', 'SALES_MANAGER', 'SALES_REP', 'FINANCE', 'OPERATIONS'),
  validate(dashboardFilterSchema, 'query'),
  dashboardController.getDashboardSummary
);

/**
 * GET /api/dashboard/sales
 * Sales pipeline & quotation conversion overview
 */
router.get(
  '/sales',
  authorizeRoles('ADMIN', 'SALES_MANAGER', 'SALES_REP', 'FINANCE', 'OPERATIONS'),
  validate(dashboardFilterSchema, 'query'),
  dashboardController.getSalesOverview
);

/**
 * GET /api/dashboard/revenue
 * Revenue time-series analytics and margin analysis
 */
router.get(
  '/revenue',
  authorizeRoles('ADMIN', 'SALES_MANAGER', 'SALES_REP', 'FINANCE', 'OPERATIONS'),
  validate(dashboardFilterSchema, 'query'),
  dashboardController.getRevenueAnalytics
);

/**
 * GET /api/dashboard/customers
 * Top customers and revenue breakdown
 */
router.get(
  '/customers',
  authorizeRoles('ADMIN', 'SALES_MANAGER', 'SALES_REP', 'FINANCE', 'OPERATIONS'),
  validate(dashboardFilterSchema, 'query'),
  dashboardController.getCustomerAnalytics
);

/**
 * GET /api/dashboard/products
 * Product analytics and bestsellers
 */
router.get(
  '/products',
  authorizeRoles('ADMIN', 'SALES_MANAGER', 'SALES_REP', 'FINANCE', 'OPERATIONS'),
  validate(dashboardFilterSchema, 'query'),
  dashboardController.getProductAnalytics
);

/**
 * GET /api/dashboard/orders
 * Order volume and status distribution
 */
router.get(
  '/orders',
  authorizeRoles('ADMIN', 'SALES_MANAGER', 'SALES_REP', 'FINANCE', 'OPERATIONS'),
  validate(dashboardFilterSchema, 'query'),
  dashboardController.getOrderAnalytics
);

/**
 * GET /api/dashboard/alerts
 * Actionable role-specific alerts
 */
router.get(
  '/alerts',
  authorizeRoles('ADMIN', 'SALES_MANAGER', 'SALES_REP', 'FINANCE', 'OPERATIONS'),
  validate(dashboardFilterSchema, 'query'),
  dashboardController.getDashboardAlerts
);

/**
 * GET /api/dashboard/finance
 * Finance dashboard & Accounts Receivable aging (ADMIN, FINANCE only)
 */
router.get(
  '/finance',
  authorizeRoles('ADMIN', 'FINANCE'),
  validate(dashboardFilterSchema, 'query'),
  dashboardController.getFinanceDashboard
);

/**
 * GET /api/dashboard/operations
 * Operations dashboard & fulfillment backlog (ADMIN, OPERATIONS, SALES_MANAGER only)
 */
router.get(
  '/operations',
  authorizeRoles('ADMIN', 'OPERATIONS', 'SALES_MANAGER'),
  validate(dashboardFilterSchema, 'query'),
  dashboardController.getOperationsDashboard
);

/**
 * GET /api/dashboard/sales-reps
 * Sales rep performance & ranking leaderboard (ADMIN, SALES_MANAGER only)
 */
router.get(
  '/sales-reps',
  authorizeRoles('ADMIN', 'SALES_MANAGER'),
  validate(dashboardFilterSchema, 'query'),
  dashboardController.getSalesRepPerformance
);

export default router;
