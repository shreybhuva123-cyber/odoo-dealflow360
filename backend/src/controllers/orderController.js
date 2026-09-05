import { orderService } from '../services/orderService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class OrderController {
  /**
   * Create order from approved quotation
   * POST /api/quotations/:quotationId/create-order
   */
  async createOrderFromQuotation(req, res, next) {
    try {
      const quotationId = req.params.quotationId || req.params.id;
      const order = await orderService.createOrderFromQuotation(quotationId, req.user, req.body);
      return sendSuccess(res, 'Order created successfully from quotation', { order }, 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * List paginated orders
   * GET /api/orders
   */
  async getOrders(req, res, next) {
    try {
      const {
        page,
        limit,
        status,
        customerId,
        salesRepId,
        search,
        sortBy,
        sortOrder,
        startDate,
        endDate,
      } = req.query;

      const filters = {
        status,
        customerId,
        salesRepId,
        search,
        sortBy,
        sortOrder,
        startDate,
        endDate,
      };

      const pagination = { page, limit };
      const data = await orderService.getOrders(filters, pagination, req.user);
      return sendSuccess(res, 'Orders retrieved successfully', data, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get single order by ID
   * GET /api/orders/:id
   */
  async getOrderById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.params.id, req.user);
      return sendSuccess(res, 'Order retrieved successfully', { order }, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get single order by Order Number
   * GET /api/orders/number/:orderNumber
   */
  async getOrderByNumber(req, res, next) {
    try {
      const order = await orderService.getOrderByNumber(req.params.orderNumber, req.user);
      return sendSuccess(res, 'Order retrieved successfully', { order }, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update order status with valid transition check
   * PATCH /api/orders/:id/status
   */
  async updateOrderStatus(req, res, next) {
    try {
      const { status, notes } = req.body;
      const order = await orderService.updateOrderStatus(req.params.id, req.user, status, notes);
      return sendSuccess(res, 'Order status updated successfully', { order }, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Cancel order with reason
   * POST /api/orders/:id/cancel
   */
  async cancelOrder(req, res, next) {
    try {
      const { reason } = req.body;
      const order = await orderService.cancelOrder(req.params.id, req.user, reason);
      return sendSuccess(res, 'Order cancelled successfully', { order }, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get line items for an order
   * GET /api/orders/:id/items
   */
  async getOrderItems(req, res, next) {
    try {
      const items = await orderService.getOrderItems(req.params.id, req.user);
      return sendSuccess(res, 'Order items retrieved successfully', { items }, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get all orders for a customer
   * GET /api/customers/:customerId/orders
   */
  async getCustomerOrders(req, res, next) {
    try {
      const orders = await orderService.getCustomerOrders(req.params.customerId, req.user);
      return sendSuccess(res, 'Customer orders retrieved successfully', { orders }, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get audit log history for an order
   * GET /api/orders/:id/history
   */
  async getOrderHistory(req, res, next) {
    try {
      const history = await orderService.getOrderHistory(req.params.id, req.user);
      return sendSuccess(res, 'Order audit history retrieved successfully', { history }, 200);
    } catch (err) {
      next(err);
    }
  }
}

export const orderController = new OrderController();
