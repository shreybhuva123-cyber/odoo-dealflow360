import { activityService } from '../services/activityService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const activityController = {
  /**
   * GET /api/activity
   * Feed of recent activities with role-aware scoping
   */
  async getRecentActivity(req, res, next) {
    try {
      const { page, limit, entityType, entityId, action, actorUserId, startDate, endDate } = req.query;
      const pagination = {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
      };
      const filters = {
        entityType,
        entityId,
        action,
        actorUserId,
        startDate,
        endDate,
      };

      const result = await activityService.getRecentActivity(req.user, filters, pagination);
      return sendSuccess(res, 'Activities retrieved successfully', result.activities, 200, {
        meta: result.meta,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/activity/:id
   * Get single activity log with entity access validation
   */
  async getActivityById(req, res, next) {
    try {
      const activity = await activityService.getActivityById(req.params.id, req.user);
      return sendSuccess(res, 'Activity retrieved successfully', activity);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/activity/entities/:entityType/:entityId
   * Entity timeline
   */
  async getEntityActivity(req, res, next) {
    try {
      const { entityType, entityId } = req.params;
      const { page, limit } = req.query;
      const pagination = {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
      };

      const result = await activityService.getEntityActivity(
        entityType.toUpperCase(),
        entityId,
        req.user,
        pagination
      );
      return sendSuccess(res, 'Entity activity timeline retrieved successfully', result.activities, 200, {
        meta: result.meta,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/quotations/:id/activity
   */
  async getQuotationActivity(req, res, next) {
    try {
      const { page, limit } = req.query;
      const pagination = {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
      };

      const result = await activityService.getQuotationActivity(req.params.id, req.user, pagination);
      return sendSuccess(res, 'Quotation activity timeline retrieved successfully', result.activities, 200, {
        meta: result.meta,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/orders/:id/activity
   */
  async getOrderActivity(req, res, next) {
    try {
      const { page, limit } = req.query;
      const pagination = {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
      };

      const result = await activityService.getOrderActivity(req.params.id, req.user, pagination);
      return sendSuccess(res, 'Order activity timeline retrieved successfully', result.activities, 200, {
        meta: result.meta,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/invoices/:id/activity
   */
  async getInvoiceActivity(req, res, next) {
    try {
      const { page, limit } = req.query;
      const pagination = {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
      };

      const result = await activityService.getInvoiceActivity(req.params.id, req.user, pagination);
      return sendSuccess(res, 'Invoice activity timeline retrieved successfully', result.activities, 200, {
        meta: result.meta,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/customers/:id/activity
   */
  async getCustomerActivity(req, res, next) {
    try {
      const { page, limit } = req.query;
      const pagination = {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
      };

      const result = await activityService.getCustomerActivity(req.params.id, req.user, pagination);
      return sendSuccess(res, 'Customer activity timeline retrieved successfully', result.activities, 200, {
        meta: result.meta,
      });
    } catch (err) {
      next(err);
    }
  },
};
