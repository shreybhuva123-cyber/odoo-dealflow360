import { dashboardService } from '../services/dashboardService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const dashboardController = {
  /**
   * Dispatches role-specific dashboard payload
   */
  async getRoleDashboard(req, res, next) {
    try {
      const data = await dashboardService.getRoleDashboard(req.user, req.query);
      return sendSuccess(res, 'Dashboard data retrieved successfully', data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Top-level KPI Summary
   */
  async getDashboardSummary(req, res, next) {
    try {
      const data = await dashboardService.getDashboardSummary(req.user, req.query);
      return sendSuccess(res, 'Dashboard summary retrieved successfully', data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Sales Pipeline Overview
   */
  async getSalesOverview(req, res, next) {
    try {
      const data = await dashboardService.getSalesOverview(req.user, req.query);
      return sendSuccess(res, 'Sales overview retrieved successfully', data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Revenue Analytics & Margin Analysis
   */
  async getRevenueAnalytics(req, res, next) {
    try {
      const data = await dashboardService.getRevenueAnalytics(req.user, req.query);
      return sendSuccess(res, 'Revenue analytics retrieved successfully', data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Customer Analytics & Ranking
   */
  async getCustomerAnalytics(req, res, next) {
    try {
      const data = await dashboardService.getCustomerAnalytics(req.user, req.query);
      return sendSuccess(res, 'Customer analytics retrieved successfully', data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Product Analytics & Top Products
   */
  async getProductAnalytics(req, res, next) {
    try {
      const data = await dashboardService.getProductAnalytics(req.user, req.query);
      return sendSuccess(res, 'Product analytics retrieved successfully', data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Order Analytics & Status Distribution
   */
  async getOrderAnalytics(req, res, next) {
    try {
      const data = await dashboardService.getOrderAnalytics(req.user, req.query);
      return sendSuccess(res, 'Order analytics retrieved successfully', data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Finance Dashboard & Accounts Receivable Aging
   */
  async getFinanceDashboard(req, res, next) {
    try {
      const data = await dashboardService.getFinanceDashboard(req.user, req.query);
      return sendSuccess(res, 'Finance dashboard retrieved successfully', data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Operations Dashboard & Fulfillment Backlog
   */
  async getOperationsDashboard(req, res, next) {
    try {
      const data = await dashboardService.getOperationsDashboard(req.user, req.query);
      return sendSuccess(res, 'Operations dashboard retrieved successfully', data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Sales Rep Performance & Ranking
   */
  async getSalesRepPerformance(req, res, next) {
    try {
      const data = await dashboardService.getSalesRepPerformance(req.user, req.query);
      return sendSuccess(res, 'Sales representative performance retrieved successfully', data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Actionable Alerts
   */
  async getDashboardAlerts(req, res, next) {
    try {
      const data = await dashboardService.getDashboardAlerts(req.user, req.query);
      return sendSuccess(res, 'Dashboard alerts retrieved successfully', data);
    } catch (err) {
      next(err);
    }
  },
};
