import { Router } from 'express';
import healthRoutes from './healthRoutes.js';

const router = Router();

import authRoutes from './authRoutes.js';
import testRoutes from './testRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import productRoutes from './productRoutes.js';
import variantRoutes from './variantRoutes.js';
import customerRoutes from './customerRoutes.js';
import priceListRoutes from './priceListRoutes.js';
import priceListItemRoutes from './priceListItemRoutes.js';
import quotationRoutes from './quotationRoutes.js';
import quotationItemRoutes from './quotationItemRoutes.js';
import discountRuleRoutes from './discountRuleRoutes.js';
import approvalRoutes from './approvalRoutes.js';
import orderRoutes from './orderRoutes.js';
import fulfillmentRoutes from './fulfillmentRoutes.js';
import invoiceRoutes from './invoiceRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import activityRoutes from './activityRoutes.js';

// Mount routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/test', testRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/variants', variantRoutes);
router.use('/customers', customerRoutes);
router.use('/price-lists', priceListRoutes);
router.use('/price-list-items', priceListItemRoutes);
router.use('/quotations', quotationRoutes);
router.use('/quotation-items', quotationItemRoutes);
router.use('/discount-rules', discountRuleRoutes);
router.use('/approvals', approvalRoutes);
router.use('/orders', orderRoutes);
router.use('/fulfillments', fulfillmentRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);
router.use('/activity', activityRoutes);

export default router;

