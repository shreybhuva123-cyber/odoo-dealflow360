import { fulfillmentService } from '../services/fulfillmentService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class FulfillmentController {
  /**
   * Create fulfillment for an order
   * POST /api/orders/:orderId/fulfillment
   */
  async createFulfillment(req, res, next) {
    try {
      const orderId = req.params.orderId || req.params.id;
      const fulfillment = await fulfillmentService.createFulfillment(orderId, req.user, req.body);
      return sendSuccess(res, 'Fulfillment created successfully', { fulfillment }, 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get fulfillments for an order
   * GET /api/orders/:orderId/fulfillment
   */
  async getFulfillment(req, res, next) {
    try {
      const orderId = req.params.orderId || req.params.id;
      const fulfillments = await fulfillmentService.getFulfillment(orderId, req.user);
      return sendSuccess(res, 'Fulfillments retrieved successfully', { fulfillments }, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update fulfillment status
   * PATCH /api/fulfillments/:id/status
   */
  async updateFulfillmentStatus(req, res, next) {
    try {
      const { status, notes } = req.body;
      const fulfillment = await fulfillmentService.updateFulfillmentStatus(
        req.params.id,
        req.user,
        status,
        notes
      );
      return sendSuccess(res, 'Fulfillment status updated successfully', { fulfillment }, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Assign operations user to fulfillment
   * PATCH /api/fulfillments/:id/assign
   */
  async assignFulfillment(req, res, next) {
    try {
      const { operationsUserId } = req.body;
      const fulfillment = await fulfillmentService.assignFulfillment(
        req.params.id,
        operationsUserId,
        req.user
      );
      return sendSuccess(res, 'Fulfillment assigned successfully', { fulfillment }, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Add or update tracking information
   * PATCH /api/fulfillments/:id/tracking
   */
  async addTrackingInformation(req, res, next) {
    try {
      const fulfillment = await fulfillmentService.addTrackingInformation(
        req.params.id,
        req.user,
        req.body
      );
      return sendSuccess(res, 'Tracking information updated successfully', { fulfillment }, 200);
    } catch (err) {
      next(err);
    }
  }
}

export const fulfillmentController = new FulfillmentController();
