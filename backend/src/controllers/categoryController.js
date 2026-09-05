import { categoryService } from '../services/categoryService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class CategoryController {
  async create(req, res, next) {
    try {
      const category = await categoryService.createCategory(req.body, req.user?.id);
      return sendSuccess(res, 'Product category created successfully', { category }, 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await categoryService.getCategories(req.query);
      return sendSuccess(res, 'Product categories retrieved successfully', result, 200);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const category = await categoryService.getCategoryById(req.params.id);
      return sendSuccess(res, 'Product category details retrieved', { category }, 200);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const category = await categoryService.updateCategory(req.params.id, req.body, req.user?.id);
      return sendSuccess(res, 'Product category updated successfully', { category }, 200);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await categoryService.deleteCategory(req.params.id, req.user?.id);
      return sendSuccess(res, result.message, result, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
