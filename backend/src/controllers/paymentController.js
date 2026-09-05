import { paymentService } from '../services/paymentService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const paymentController = {
  async recordPayment(req, res, next) {
    try {
      const invoiceId = req.params.invoiceId || req.params.id;
      const result = await paymentService.recordPayment(invoiceId, req.user?.id, req.body);
      return sendSuccess(res, 'Payment recorded successfully', result, 201);
    } catch (err) {
      next(err);
    }
  },

  async getPayments(req, res, next) {
    try {
      const invoiceId = req.params.invoiceId || req.params.id;
      const payments = await paymentService.getPayments(invoiceId, req.user);
      return sendSuccess(res, 'Payments retrieved successfully', payments);
    } catch (err) {
      next(err);
    }
  },

  async getPaymentById(req, res, next) {
    try {
      const payment = await paymentService.getPaymentById(req.params.id, req.user);
      return sendSuccess(res, 'Payment retrieved successfully', payment);
    } catch (err) {
      next(err);
    }
  },

  async updatePayment(req, res, next) {
    try {
      const payment = await paymentService.updatePayment(req.params.id, req.user?.id, req.body);
      return sendSuccess(res, 'Payment updated successfully', payment);
    } catch (err) {
      next(err);
    }
  },

  async cancelPayment(req, res, next) {
    try {
      const result = await paymentService.cancelPayment(req.params.id, req.user?.id, req.body?.reason);
      return sendSuccess(res, 'Payment cancelled successfully', result);
    } catch (err) {
      next(err);
    }
  },

  async getInvoicePaymentSummary(req, res, next) {
    try {
      const invoiceId = req.params.invoiceId || req.params.id;
      const summary = await paymentService.getInvoicePaymentSummary(invoiceId, req.user);
      return sendSuccess(res, 'Invoice payment summary retrieved successfully', summary);
    } catch (err) {
      next(err);
    }
  },
};
