import { productService } from '../services/productService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class ProductController {
  async create(req, res, next) {
    try {
      const product = await productService.createProduct(req.body, req.user?.id);
      return sendSuccess(res, 'Product created successfully', { product }, 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { page, limit, search, categoryId, isSubscription, isActive } = req.query;
      const filters = { search, categoryId, isSubscription, isActive };
      const pagination = { page, limit };

      const result = await productService.getProducts(filters, pagination);
      return sendSuccess(res, 'Products retrieved successfully', result, 200);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);
      return sendSuccess(res, 'Product details retrieved', { product }, 200);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body, req.user?.id);
      return sendSuccess(res, 'Product updated successfully', { product }, 200);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await productService.deactivateProduct(req.params.id, req.user?.id);
      return sendSuccess(res, result.message, result, 200);
    } catch (error) {
      next(error);
    }
  }

  // Variants
  async createVariant(req, res, next) {
    try {
      const variant = await productService.createProductVariant(
        req.params.productId,
        req.body,
        req.user?.id
      );
      return sendSuccess(res, 'Product variant created successfully', { variant }, 201);
    } catch (error) {
      next(error);
    }
  }

  async getVariants(req, res, next) {
    try {
      const variants = await productService.getProductVariants(req.params.productId);
      return sendSuccess(res, 'Product variants retrieved', { variants }, 200);
    } catch (error) {
      next(error);
    }
  }

  async updateVariant(req, res, next) {
    try {
      const variant = await productService.updateProductVariant(
        req.params.id,
        req.body,
        req.user?.id
      );
      return sendSuccess(res, 'Product variant updated successfully', { variant }, 200);
    } catch (error) {
      next(error);
    }
  }

  async deleteVariant(req, res, next) {
    try {
      const result = await productService.deactivateProductVariant(req.params.id, req.user?.id);
      return sendSuccess(res, result.message, null, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
