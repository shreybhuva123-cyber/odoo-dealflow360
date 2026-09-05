import { approvalService } from '../services/approvalService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class ApprovalController {
  /**
   * Get paginated pending approvals for dashboard
   * GET /api/approvals/pending
   */
  async getPending(req, res, next) {
    try {
      const { page, limit, approvalRole, riskLevel } = req.query;
      const filters = { approvalRole, riskLevel };
      const pagination = { page, limit };
      const data = await approvalService.getPendingApprovals(req.user, filters, pagination);
      return sendSuccess(res, 'Pending approvals retrieved successfully', data, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get single approval by ID
   * GET /api/approvals/:id
   */
  async getById(req, res, next) {
    try {
      const approval = await approvalService.getApprovalById(req.params.id, req.user);
      return sendSuccess(res, 'Approval retrieved successfully', { approval }, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Approve an approval step
   * POST /api/approvals/:id/approve
   */
  async approve(req, res, next) {
    try {
      const result = await approvalService.approveQuotation(req.params.id, req.user);
      return sendSuccess(
        res,
        'Quotation approved successfully',
        {
          approval: result.approval,
          quotation: {
            id: result.approval.quotationId,
            status: result.quotationStatus,
          },
          workflow: {
            completed: result.allCompleted,
          },
        },
        200
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * Reject an approval step with mandatory reason
   * POST /api/approvals/:id/reject
   */
  async reject(req, res, next) {
    try {
      const { rejectionReason } = req.body;
      const result = await approvalService.rejectQuotation(
        req.params.id,
        rejectionReason,
        req.user
      );
      return sendSuccess(
        res,
        'Quotation rejected successfully',
        {
          approval: result.approval,
          quotation: {
            id: result.quotation.id,
            status: result.quotation.status,
          },
        },
        200
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get all approvals for a quotation
   * GET /api/quotations/:quotationId/approvals
   */
  async getByQuotation(req, res, next) {
    try {
      const quotationId = req.params.quotationId || req.params.id;
      const data = await approvalService.getApprovalRequests(quotationId, req.user);
      return sendSuccess(res, 'Quotation approvals retrieved successfully', data, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get chronological approval history for a quotation
   * GET /api/quotations/:quotationId/approval-history
   */
  async getHistoryByQuotation(req, res, next) {
    try {
      const quotationId = req.params.quotationId || req.params.id;
      const data = await approvalService.getApprovalHistory(quotationId, req.user);
      return sendSuccess(res, 'Quotation approval history retrieved successfully', data, 200);
    } catch (err) {
      next(err);
    }
  }
}

export const approvalController = new ApprovalController();
