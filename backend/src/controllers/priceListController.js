import { priceListService } from '../services/priceListService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class PriceListController {
  async create(req, res, next) {
    try {
      const priceList = await priceListService.createPriceList(req.body, req.user?.id);
      return sendSuccess(res, 'Price list created successfully', { priceList }, 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { page, limit, customerTier, isActive } = req.query;
      const filters = { customerTier, isActive };
      const pagination = { page, limit };

      const result = await priceListService.getPriceLists(filters, pagination);
      return sendSuccess(res, 'Price lists retrieved successfully', result, 200);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const priceList = await priceListService.getPriceListById(req.params.id);
      return sendSuccess(res, 'Price list details retrieved', { priceList }, 200);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const priceList = await priceListService.updatePriceList(req.params.id, req.body, req.user?.id);
      return sendSuccess(res, 'Price list updated successfully', { priceList }, 200);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await priceListService.deactivatePriceList(req.params.id, req.user?.id);
      return sendSuccess(res, result.message, result, 200);
    } catch (error) {
      next(error);
    }
  }

  // Price List Items
  async addItem(req, res, next) {
    try {
      const item = await priceListService.addPriceListItem(
        req.params.priceListId,
        req.body,
        req.user?.id
      );
      return sendSuccess(res, 'Price list item added successfully', { item }, 201);
    } catch (error) {
      next(error);
    }
  }

  async getItems(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await priceListService.getPriceListItems(req.params.priceListId, {
        page,
        limit,
      });
      return sendSuccess(res, 'Price list items retrieved', result, 200);
    } catch (error) {
      next(error);
    }
  }

  async updateItem(req, res, next) {
    try {
      const item = await priceListService.updatePriceListItem(req.params.id, req.body, req.user?.id);
      return sendSuccess(res, 'Price list item updated successfully', { item }, 200);
    } catch (error) {
      next(error);
    }
  }

  async deleteItem(req, res, next) {
    try {
      const result = await priceListService.removePriceListItem(req.params.id, req.user?.id);
      return sendSuccess(res, result.message, null, 200);
    } catch (error) {
      next(error);
    }
  }

  // Price Lookup for Quotation Engine
  async getProductPrice(req, res, next) {
    try {
      const result = await priceListService.getProductPrice(
        req.params.priceListId,
        req.params.productId
      );
      return sendSuccess(res, 'Product price lookup successful', result, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const priceListController = new PriceListController();
