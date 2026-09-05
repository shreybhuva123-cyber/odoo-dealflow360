import { customerService } from '../services/customerService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class CustomerController {
  async create(req, res, next) {
    try {
      const customer = await customerService.createCustomer(req.body, req.user?.id);
      return sendSuccess(res, 'Customer created successfully', { customer }, 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { page, limit, search, tier, isActive } = req.query;
      const filters = { search, tier, isActive };
      const pagination = { page, limit };

      const result = await customerService.getCustomers(filters, pagination);
      return sendSuccess(res, 'Customers retrieved successfully', result, 200);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const customer = await customerService.getCustomerById(req.params.id);
      return sendSuccess(res, 'Customer details retrieved', { customer }, 200);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const customer = await customerService.updateCustomer(req.params.id, req.body, req.user?.id);
      return sendSuccess(res, 'Customer updated successfully', { customer }, 200);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await customerService.deactivateCustomer(req.params.id, req.user?.id);
      return sendSuccess(res, result.message, result, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const customerController = new CustomerController();
