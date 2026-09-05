import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';
import { recordAuditLog } from '../utils/auditLogger.js';
import { getPaginationParams, formatPagination } from '../utils/pagination.js';
import {
  UserRole,
  QuoteStatus,
  ApprovalStatus,
  RiskLevel,
} from '@prisma/client';
import { notificationEvents } from './notificationEvents.js';

export class ApprovalService {
  /**
   * Create approval step records for a submitted quotation based on risk evaluation
   * @param {string} quotationId
   * @param {object} riskEvaluation
   * @param {object} [tx] Optional Prisma transaction client
   * @returns {Promise<Array>}
   */
  async createApprovalRequests(quotationId, riskEvaluation, tx) {
    const db = tx || prisma;

    if (!riskEvaluation || !riskEvaluation.approvalRequired) {
      return [];
    }

    const requirements = riskEvaluation.approvalRequirements || [];
    if (requirements.length === 0) {
      return [];
    }

    // Check if approvals already exist to avoid duplicate creation
    const existing = await db.approval.findMany({
      where: { quotationId },
    });
    if (existing.length > 0) {
      return existing;
    }

    // Determine steps to create
    // Workflow rules:
    // If SALES_MANAGER required -> Step 1
    // If FINANCE required:
    //    If SALES_MANAGER also required -> Step 2
    //    If only FINANCE required -> Step 1
    const steps = [];
    const hasSalesManager = requirements.includes(UserRole.SALES_MANAGER);
    const hasFinance = requirements.includes(UserRole.FINANCE);

    if (hasSalesManager) {
      steps.push({
        quotationId,
        approvalRole: UserRole.SALES_MANAGER,
        stepOrder: 1,
        status: ApprovalStatus.PENDING,
      });
    }

    if (hasFinance) {
      steps.push({
        quotationId,
        approvalRole: UserRole.FINANCE,
        stepOrder: hasSalesManager ? 2 : 1,
        status: ApprovalStatus.PENDING,
      });
    }

    const created = [];
    for (const step of steps) {
      const rec = await db.approval.create({
        data: step,
        include: {
          approver: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });
      created.push(rec);
    }

    return created;
  }

  /**
   * Get all approval steps for a specific quotation
   * @param {string} quotationId
   * @param {{ id: string, role: string }} user
   */
  async getApprovalRequests(quotationId, user) {
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        customer: { select: { id: true, companyName: true, email: true, customerTier: true } },
        salesRep: { select: { id: true, name: true, email: true, role: true } },
        approvals: {
          include: {
            approver: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: { stepOrder: 'asc' },
        },
      },
    });

    if (!quotation) {
      throw new AppError('Quotation not found', 404);
    }

    // Sales Rep can only view approvals for their own quotations
    if (user.role === UserRole.SALES_REP && quotation.salesRepId !== user.id) {
      throw new AppError('Access denied. You can only view approvals for your own quotations.', 403);
    }

    return {
      quotation: {
        id: quotation.id,
        quoteNumber: quotation.quoteNumber,
        status: quotation.status,
        riskScore: quotation.riskScore,
        riskLevel: quotation.riskLevel,
        approvalRequired: quotation.approvalRequired,
        totalAmount: quotation.totalAmount,
        customer: quotation.customer,
        salesRep: quotation.salesRep,
      },
      approvals: quotation.approvals,
    };
  }

  /**
   * Get paginated pending approvals dashboard
   * @param {{ id: string, role: string }} user
   * @param {object} filters
   * @param {object} pagination
   */
  async getPendingApprovals(user, filters = {}, pagination = {}) {
    const { page, limit, skip } = getPaginationParams(pagination);

    const where = {
      status: ApprovalStatus.PENDING,
      quotation: {
        status: QuoteStatus.PENDING_APPROVAL,
      },
    };

    // Role-specific constraints & anti-self-approval filtering:
    if (user.role === UserRole.SALES_MANAGER) {
      where.approvalRole = UserRole.SALES_MANAGER;
      // Cannot approve own quotation
      where.quotation.salesRepId = { not: user.id };
    } else if (user.role === UserRole.FINANCE) {
      where.approvalRole = UserRole.FINANCE;
      // Cannot approve own quotation if user was somehow the sales rep
      where.quotation.salesRepId = { not: user.id };
    } else if (user.role === UserRole.ADMIN) {
      if (filters.approvalRole) {
        where.approvalRole = filters.approvalRole;
      }
    } else {
      throw new AppError('Your role does not have access to pending approvals', 403);
    }

    if (filters.riskLevel) {
      where.quotation.riskLevel = filters.riskLevel;
    }

    const [total, pendingApprovals] = await Promise.all([
      prisma.approval.count({ where }),
      prisma.approval.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ quotation: { createdAt: 'asc' } }, { stepOrder: 'asc' }],
        include: {
          quotation: {
            select: {
              id: true,
              quoteNumber: true,
              status: true,
              totalAmount: true,
              marginPercentage: true,
              riskScore: true,
              riskLevel: true,
              createdAt: true,
              customer: {
                select: { id: true, companyName: true, email: true, customerTier: true },
              },
              salesRep: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
          },
          approver: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
    ]);

    return {
      pendingApprovals,
      pagination: formatPagination(total, page, limit),
    };
  }

  /**
   * Get approval by ID with complete context
   * @param {string} approvalId
   * @param {{ id: string, role: string }} user
   */
  async getApprovalById(approvalId, user) {
    const approval = await prisma.approval.findUnique({
      where: { id: approvalId },
      include: {
        quotation: {
          include: {
            customer: true,
            salesRep: { select: { id: true, name: true, email: true, role: true } },
            items: {
              include: {
                product: { select: { id: true, name: true, sku: true } },
                variant: { select: { id: true, attribute: true, value: true } },
              },
            },
            approvals: {
              orderBy: { stepOrder: 'asc' },
              include: {
                approver: { select: { id: true, name: true, email: true, role: true } },
              },
            },
          },
        },
        approver: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (!approval) {
      throw new AppError('Approval not found', 404);
    }

    if (user.role === UserRole.SALES_REP && approval.quotation.salesRepId !== user.id) {
      throw new AppError('Access denied', 403);
    }

    return approval;
  }

  /**
   * Validate that user has permission to approve or reject this approval step
   * @param {object} approval
   * @param {{ id: string, role: string }} user
   */
  validateApproverPermission(approval, user) {
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    if (user.role === UserRole.SALES_MANAGER) {
      if (approval.approvalRole !== UserRole.SALES_MANAGER) {
        throw new AppError(
          `Sales Managers can only approve or reject Sales Manager approval steps (this step is for ${approval.approvalRole})`,
          403
        );
      }
      return true;
    }

    if (user.role === UserRole.FINANCE) {
      if (approval.approvalRole !== UserRole.FINANCE) {
        throw new AppError(
          `Finance users can only approve or reject Finance approval steps (this step is for ${approval.approvalRole})`,
          403
        );
      }
      return true;
    }

    throw new AppError('Your role does not have permission to approve or reject quotations', 403);
  }

  /**
   * Validate approval state transitions
   * @param {object} approval
   */
  validateApprovalState(approval) {
    if (approval.status === ApprovalStatus.APPROVED) {
      throw new AppError('This approval step has already been approved', 400);
    }
    if (approval.status === ApprovalStatus.REJECTED) {
      throw new AppError('This approval step has already been rejected', 400);
    }
    if (approval.status === ApprovalStatus.CANCELLED) {
      throw new AppError('This approval step has been cancelled', 400);
    }
    if (approval.status !== ApprovalStatus.PENDING) {
      throw new AppError(`Approval is not in PENDING state (current: ${approval.status})`, 400);
    }

    if (approval.quotation) {
      if (approval.quotation.status === QuoteStatus.REJECTED) {
        throw new AppError('Quotation has already been rejected and cannot be approved', 400);
      }
      if (approval.quotation.status === QuoteStatus.CANCELLED) {
        throw new AppError('Quotation has been cancelled', 400);
      }
      if (approval.quotation.status === QuoteStatus.APPROVED) {
        throw new AppError('Quotation has already been fully approved', 400);
      }
    }
  }

  /**
   * Prevent sales representative from approving their own quotation
   * @param {object} quotation
   * @param {string} approverId
   */
  validateSelfApproval(quotation, approverId) {
    if (quotation.salesRepId === approverId) {
      throw new AppError(
        'Sales representatives are strictly prohibited from approving their own quotations',
        403
      );
    }
  }

  /**
   * Enforce sequential workflow prerequisite check
   * @param {object} approval
   * @param {object} tx Prisma transaction client
   */
  async checkPrerequisiteStep(approval, tx) {
    const db = tx || prisma;
    if (approval.stepOrder > 1) {
      const priorStep = await db.approval.findFirst({
        where: {
          quotationId: approval.quotationId,
          stepOrder: approval.stepOrder - 1,
        },
      });

      if (priorStep && priorStep.status !== ApprovalStatus.APPROVED) {
        throw new AppError(
          `Prerequisite approval step ${priorStep.stepOrder} (${priorStep.approvalRole}) must be approved before this step can proceed`,
          400
        );
      }
    }
  }

  /**
   * Determine the next pending approval step for a quotation
   * @param {string} quotationId
   * @param {object} [tx] Optional Prisma transaction client
   */
  async determineNextApprovalStep(quotationId, tx) {
    const db = tx || prisma;
    const approvals = await db.approval.findMany({
      where: { quotationId },
      orderBy: { stepOrder: 'asc' },
    });

    const pendingStep = approvals.find((a) => a.status === ApprovalStatus.PENDING);
    return pendingStep || null;
  }

  /**
   * Check if all required approvals for a quotation are completed
   * @param {string} quotationId
   * @param {object} [tx] Optional Prisma transaction client
   */
  async checkAllApprovalsCompleted(quotationId, tx) {
    const db = tx || prisma;
    const approvals = await db.approval.findMany({
      where: { quotationId },
    });

    if (approvals.length === 0) {
      return true;
    }

    return approvals.every((a) => a.status === ApprovalStatus.APPROVED);
  }

  /**
   * Update quotation to APPROVED status after all approvals completed
   * @param {string} quotationId
   * @param {object} [tx] Optional Prisma transaction client
   */
  async updateQuotationAfterApproval(quotationId, tx) {
    const db = tx || prisma;
    return db.quotation.update({
      where: { id: quotationId },
      data: {
        status: QuoteStatus.APPROVED,
      },
    });
  }

  /**
   * Update quotation to REJECTED status
   * @param {string} quotationId
   * @param {string} rejectionReason
   * @param {object} [tx] Optional Prisma transaction client
   */
  async updateQuotationAfterRejection(quotationId, rejectionReason, tx) {
    const db = tx || prisma;
    return db.quotation.update({
      where: { id: quotationId },
      data: {
        status: QuoteStatus.REJECTED,
      },
    });
  }

  /**
   * Cancel remaining pending approvals for a quotation
   * @param {string} quotationId
   * @param {string} excludeApprovalId
   * @param {object} [tx] Optional Prisma transaction client
   */
  async cancelPendingApprovals(quotationId, excludeApprovalId, tx) {
    const db = tx || prisma;
    return db.approval.updateMany({
      where: {
        quotationId,
        status: ApprovalStatus.PENDING,
        id: { not: excludeApprovalId },
      },
      data: {
        status: ApprovalStatus.CANCELLED,
      },
    });
  }

  /**
   * Approve an approval step with concurrency safety and audit trails
   * @param {string} approvalId
   * @param {{ id: string, role: string }} user
   */
  async approveQuotation(approvalId, user) {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch approval with quotation & steps
      const approval = await tx.approval.findUnique({
        where: { id: approvalId },
        include: {
          quotation: {
            include: {
              salesRep: true,
            },
          },
        },
      });

      if (!approval) {
        throw new AppError('Approval not found', 404);
      }

      // 2. Permission check
      this.validateApproverPermission(approval, user);

      // 3. Self-approval guard
      this.validateSelfApproval(approval.quotation, user.id);

      // 4. State check
      this.validateApprovalState(approval);

      // 5. Sequential prerequisite check
      await this.checkPrerequisiteStep(approval, tx);

      // 6. Mark approval as APPROVED
      const updatedApproval = await tx.approval.update({
        where: { id: approvalId },
        data: {
          status: ApprovalStatus.APPROVED,
          approverId: user.id,
          decidedAt: new Date(),
        },
        include: {
          quotation: true,
          approver: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      // 7. Record history in ApprovalActionHistory
      await tx.approvalActionHistory.create({
        data: {
          quotationId: approval.quotationId,
          reviewerId: user.id,
          action: 'APPROVED',
          reason: `Approved ${approval.approvalRole} step (${approval.stepOrder})`,
        },
      });

      // 8. Check if all approvals completed
      const allCompleted = await this.checkAllApprovalsCompleted(approval.quotationId, tx);
      let updatedQuotation = null;

      if (allCompleted) {
        updatedQuotation = await this.updateQuotationAfterApproval(approval.quotationId, tx);
      }

      return {
        approval: updatedApproval,
        allCompleted,
        quotationStatus: updatedQuotation ? updatedQuotation.status : approval.quotation.status,
      };
    });

    // 9. Record audit log outside transaction
    await recordAuditLog({
      userId: user.id,
      entityType: 'APPROVAL',
      entityId: approvalId,
      action: 'APPROVAL_GRANTED',
      newValue: {
        approvalId,
        quotationId: result.approval.quotationId,
        role: result.approval.approvalRole,
        allCompleted: result.allCompleted,
        quotationStatus: result.quotationStatus,
      },
      reason: `Quotation approval granted by ${user.role} (${user.id})`,
    });

    if (result.allCompleted) {
      try {
        await notificationEvents.handleQuotationApproved(
          {
            id: result.approval.quotationId,
            quoteNumber: result.approval.quotation.quoteNumber,
            salesRepId: result.approval.quotation.salesRepId,
          },
          user
        );
      } catch (err) {
        // Non-fatal
      }
    }

    return result;
  }

  /**
   * Reject an approval step with mandatory reason, cancel remaining pending steps
   * @param {string} approvalId
   * @param {string} rejectionReason
   * @param {{ id: string, role: string }} user
   */
  async rejectQuotation(approvalId, rejectionReason, user) {
    if (!rejectionReason || typeof rejectionReason !== 'string' || rejectionReason.trim().length < 3) {
      throw new AppError('Rejection reason must be at least 3 characters', 400);
    }

    const trimmedReason = rejectionReason.trim();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch approval with quotation
      const approval = await tx.approval.findUnique({
        where: { id: approvalId },
        include: {
          quotation: {
            include: {
              salesRep: true,
            },
          },
        },
      });

      if (!approval) {
        throw new AppError('Approval not found', 404);
      }

      // 2. Permission check
      this.validateApproverPermission(approval, user);

      // 3. Self-approval guard
      this.validateSelfApproval(approval.quotation, user.id);

      // 4. State check
      this.validateApprovalState(approval);

      // 5. Prerequisite step check
      await this.checkPrerequisiteStep(approval, tx);

      // 6. Mark approval as REJECTED
      const updatedApproval = await tx.approval.update({
        where: { id: approvalId },
        data: {
          status: ApprovalStatus.REJECTED,
          approverId: user.id,
          rejectionReason: trimmedReason,
          decidedAt: new Date(),
        },
        include: {
          quotation: true,
          approver: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      // 7. Cancel remaining pending approvals
      await this.cancelPendingApprovals(approval.quotationId, approvalId, tx);

      // 8. Update quotation status to REJECTED
      const updatedQuotation = await this.updateQuotationAfterRejection(
        approval.quotationId,
        trimmedReason,
        tx
      );

      // 9. Record history in ApprovalActionHistory
      await tx.approvalActionHistory.create({
        data: {
          quotationId: approval.quotationId,
          reviewerId: user.id,
          action: 'REJECTED',
          reason: trimmedReason,
        },
      });

      return {
        approval: updatedApproval,
        quotation: updatedQuotation,
      };
    });

    // 10. Record audit log outside transaction
    await recordAuditLog({
      userId: user.id,
      entityType: 'APPROVAL',
      entityId: approvalId,
      action: 'APPROVAL_REJECTED',
      newValue: {
        approvalId,
        quotationId: result.approval.quotationId,
        role: result.approval.approvalRole,
        rejectionReason: trimmedReason,
        quotationStatus: result.quotation.status,
      },
      reason: `Quotation approval rejected by ${user.role} (${user.id}): ${trimmedReason}`,
    });

    try {
      await notificationEvents.handleQuotationRejected(
        result.quotation,
        trimmedReason,
        user
      );
    } catch (err) {
      // Non-fatal
    }

    return result;
  }

  /**
   * Get chronological approval history for a quotation
   * @param {string} quotationId
   * @param {{ id: string, role: string }} user
   */
  async getApprovalHistory(quotationId, user) {
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        salesRep: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (!quotation) {
      throw new AppError('Quotation not found', 404);
    }

    if (user.role === UserRole.SALES_REP && quotation.salesRepId !== user.id) {
      throw new AppError('Access denied. You can only view history for your own quotations.', 403);
    }

    const [approvals, actions, auditLogs] = await Promise.all([
      prisma.approval.findMany({
        where: { quotationId },
        include: {
          approver: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { stepOrder: 'asc' },
      }),
      prisma.approvalActionHistory.findMany({
        where: { quotationId },
        include: {
          reviewer: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.findMany({
        where: {
          OR: [
            { entityId: quotationId, entityType: 'QUOTATION' },
            { entityType: 'APPROVAL', newValue: { path: ['quotationId'], equals: quotationId } },
          ],
        },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      quotationId: quotation.id,
      quoteNumber: quotation.quoteNumber,
      status: quotation.status,
      approvals,
      actions,
      auditLogs,
    };
  }
}

export const approvalService = new ApprovalService();
