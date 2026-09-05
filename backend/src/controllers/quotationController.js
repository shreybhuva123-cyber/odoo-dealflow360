import { quotationService } from '../services/quotationService.js';
import { riskService } from '../services/riskService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class QuotationController {
  /**
   * Create a new draft quotation
   * POST /api/quotations
   */
  async create(req, res, next) {
    try {
      const quotation = await quotationService.createQuotation(req.user.id, req.body);
      return sendSuccess(res, 'Quotation created successfully', { quotation }, 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * List quotations with pagination & filters
   * GET /api/quotations
   */
  async getAll(req, res, next) {
    try {
      const { page, limit, status, customerId, search, sortBy, sortOrder } = req.query;
      const filters = { status, customerId, search, sortBy, sortOrder };
      const data = await quotationService.getQuotations(filters, { page, limit }, req.user);
      return sendSuccess(res, 'Quotations retrieved successfully', data, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get single quotation details
   * GET /api/quotations/:id
   */
  async getById(req, res, next) {
    try {
      const quotation = await quotationService.getQuotationById(req.params.id, req.user);
      return sendSuccess(res, 'Quotation retrieved successfully', { quotation }, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update draft quotation metadata
   * PUT /api/quotations/:id
   */
  async update(req, res, next) {
    try {
      const quotation = await quotationService.updateQuotation(req.params.id, req.user, req.body);
      return sendSuccess(res, 'Quotation updated successfully', { quotation }, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Cancel quotation
   * DELETE /api/quotations/:id
   */
  async cancel(req, res, next) {
    try {
      const quotation = await quotationService.cancelQuotation(req.params.id, req.user);
      return sendSuccess(res, 'Quotation cancelled successfully', { quotation }, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Add line item to quotation
   * POST /api/quotations/:id/items
   */
  async addItem(req, res, next) {
    try {
      const data = await quotationService.addQuotationItem(req.params.id, req.user, req.body);
      return sendSuccess(res, 'Quotation item added successfully', data, 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update quotation line item
   * PUT /api/quotation-items/:itemId
   */
  async updateItem(req, res, next) {
    try {
      const data = await quotationService.updateQuotationItem(req.params.itemId, req.user, req.body);
      return sendSuccess(res, 'Quotation item updated successfully', data, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Remove quotation line item
   * DELETE /api/quotation-items/:itemId
   */
  async removeItem(req, res, next) {
    try {
      const data = await quotationService.removeQuotationItem(req.params.itemId, req.user);
      return sendSuccess(res, data.message, { quotation: data.quotation }, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Recalculate quotation
   * POST /api/quotations/:id/recalculate
   */
  async recalculate(req, res, next) {
    try {
      // First verify quote exists and ownership
      const quote = await quotationService.getQuotationById(req.params.id, req.user);
      quotationService.validateQuotationOwnership(quote, req.user);
      const quotation = await quotationService.recalculateQuotation(req.params.id);
      return sendSuccess(res, 'Quotation recalculated successfully', { quotation }, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Submit quotation for approval
   * POST /api/quotations/:id/submit
   */
  async submit(req, res, next) {
    try {
      const quotation = await quotationService.submitQuotation(req.params.id, req.user);
      return sendSuccess(res, 'Quotation submitted for approval successfully', { quotation }, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Evaluate quotation risk and approval requirements
   * POST /api/quotations/:id/evaluate-risk
   */
  async evaluateRisk(req, res, next) {
    try {
      // Recalculate quotation first to ensure freshest calculations
      await quotationService.recalculateQuotation(req.params.id);
      const evaluation = await riskService.evaluateQuotationRisk(req.params.id, {
        persist: true,
        user: req.user,
      });
      if (evaluation) {
        evaluation.riskAssessment = { ...evaluation };
        evaluation.requiredRoles = evaluation.approvalRequirements || [];
        evaluation.riskReasons = evaluation.reasons || [];
      }
      return sendSuccess(res, 'Quotation risk evaluated successfully', evaluation, 200);
    } catch (err) {
      next(err);
    }
  }
}

export const quotationController = new QuotationController();

