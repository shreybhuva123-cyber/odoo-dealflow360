import { invoiceService } from '../services/invoiceService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const invoiceController = {
  async createInvoiceFromOrder(req, res, next) {
    try {
      const orderId = req.params.orderId || req.body.orderId;
      const invoice = await invoiceService.createInvoiceFromOrder(orderId, req.user?.id, req.body);
      return sendSuccess(res, 'Invoice created successfully', invoice, 201);
    } catch (err) {
      next(err);
    }
  },

  async getInvoices(req, res, next) {
    try {
      const { page, limit, status, customerId, orderId, search, sortBy, sortOrder, startDate, endDate } = req.query;
      const pagination = {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
      };
      const filters = { status, customerId, orderId, search, sortBy, sortOrder, startDate, endDate };
      const result = await invoiceService.getInvoices(filters, pagination, req.user);
      return sendSuccess(res, 'Invoices retrieved successfully', result.invoices, 200, { meta: result.meta });
    } catch (err) {
      next(err);
    }
  },

  async getInvoiceById(req, res, next) {
    try {
      const invoice = await invoiceService.getInvoiceById(req.params.id, req.user);
      return sendSuccess(res, 'Invoice retrieved successfully', invoice);
    } catch (err) {
      next(err);
    }
  },

  async getInvoiceByNumber(req, res, next) {
    try {
      const invoice = await invoiceService.getInvoiceByNumber(req.params.invoiceNumber, req.user);
      return sendSuccess(res, 'Invoice retrieved successfully', invoice);
    } catch (err) {
      next(err);
    }
  },

  async updateInvoice(req, res, next) {
    try {
      const invoice = await invoiceService.updateInvoice(req.params.id, req.user?.id, req.body);
      return sendSuccess(res, 'Invoice updated successfully', invoice);
    } catch (err) {
      next(err);
    }
  },

  async issueInvoice(req, res, next) {
    try {
      const invoice = await invoiceService.issueInvoice(req.params.id, req.user?.id);
      return sendSuccess(res, 'Invoice issued successfully', invoice);
    } catch (err) {
      next(err);
    }
  },

  async cancelInvoice(req, res, next) {
    try {
      const invoice = await invoiceService.cancelInvoice(req.params.id, req.user?.id, req.body?.reason);
      return sendSuccess(res, 'Invoice cancelled successfully', invoice);
    } catch (err) {
      next(err);
    }
  },

  async recalculateInvoice(req, res, next) {
    try {
      const invoice = await invoiceService.recalculateInvoice(req.params.id, req.user?.id);
      return sendSuccess(res, 'Invoice recalculated successfully', invoice);
    } catch (err) {
      next(err);
    }
  },

  async getInvoiceHistory(req, res, next) {
    try {
      const history = await invoiceService.getInvoiceHistory(req.params.id, req.user);
      return sendSuccess(res, 'Invoice audit history retrieved successfully', history);
    } catch (err) {
      next(err);
    }
  },

  async getInvoiceItems(req, res, next) {
    try {
      const invoiceId = req.params.invoiceId || req.params.id;
      const items = await invoiceService.getInvoiceItems(invoiceId, req.user);
      return sendSuccess(res, 'Invoice items retrieved successfully', items);
    } catch (err) {
      next(err);
    }
  },

  async updateOverdueInvoices(req, res, next) {
    try {
      const result = await invoiceService.updateOverdueInvoiceStatuses();
      return sendSuccess(res, 'Overdue invoices updated successfully', result);
    } catch (err) {
      next(err);
    }
  },

  async getCustomerBillingSummary(req, res, next) {
    try {
      const summary = await invoiceService.getCustomerBillingSummary(req.params.customerId, req.user);
      return sendSuccess(res, 'Customer billing summary retrieved successfully', summary);
    } catch (err) {
      next(err);
    }
  },
};
