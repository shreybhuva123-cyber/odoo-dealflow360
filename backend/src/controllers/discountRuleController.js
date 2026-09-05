import { discountService } from '../services/discountService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class DiscountRuleController {
  async create(req, res, next) {
    try {
      const discountRule = await discountService.createDiscountRule(req.body, req.user);
      return sendSuccess(res, 'Discount rule created successfully', { discountRule }, 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await discountService.getDiscountRules(req.query, req.query);
      return sendSuccess(res, 'Discount rules retrieved successfully', result, 200);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const discountRule = await discountService.getDiscountRuleById(req.params.id);
      return sendSuccess(res, 'Discount rule retrieved successfully', { discountRule }, 200);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const discountRule = await discountService.updateDiscountRule(req.params.id, req.body, req.user);
      return sendSuccess(res, 'Discount rule updated successfully', { discountRule }, 200);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await discountService.deleteDiscountRule(req.params.id, req.user);
      return sendSuccess(res, result.message, result, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const discountRuleController = new DiscountRuleController();
export default discountRuleController;
