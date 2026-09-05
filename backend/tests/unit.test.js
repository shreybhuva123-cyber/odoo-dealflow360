/**
 * Phase 13 - Pure Business Calculation & Utility Unit Test Suite
 * Fully isolated unit tests verifying mathematical precision, edge cases,
 * boundary conditions, and business rule evaluation without database dependencies.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Import Utilities
import { hashPassword, comparePassword } from '../src/utils/password.js';
import { generateAccessToken, verifyAccessToken, sanitizeUser } from '../src/utils/jwt.js';
import { parseDashboardDateRange } from '../src/utils/dateRangeHelper.js';
import { getPaginationParams, formatPagination } from '../src/utils/pagination.js';

// Import Services (Instances or Classes)
import { QuotationService } from '../src/services/quotationService.js';
import { DiscountService } from '../src/services/discountService.js';
import { RiskService } from '../src/services/riskService.js';
import { InvoiceService } from '../src/services/invoiceService.js';

const quotationService = new QuotationService();
const discountService = new DiscountService();
const riskService = new RiskService();
const invoiceService = new InvoiceService();

describe('PHASE 13: PURE BUSINESS LOGIC & UNIT TESTS', () => {

  // =========================================================================
  // 1. AUTHENTICATION & TOKEN UTILITIES
  // =========================================================================
  describe('1. Authentication Utilities', () => {
    it('should securely hash passwords and verify matching hashes', async () => {
      const password = 'EnterpriseSecurePassword@2026';
      const hash = await hashPassword(password);

      assert.ok(hash);
      assert.notEqual(hash, password);
      assert.match(hash, /^\$2[aby]\$\d+\$/); // bcrypt format

      const isMatch = await comparePassword(password, hash);
      assert.equal(isMatch, true);

      const isMismatch = await comparePassword('WrongPassword123', hash);
      assert.equal(isMismatch, false);
    });

    it('should reject hashing invalid or empty passwords', async () => {
      await assert.rejects(() => hashPassword(''), /Password must be a non-empty string/);
      await assert.rejects(() => hashPassword(null), /Password must be a non-empty string/);
    });

    it('should generate and verify valid JWT tokens with HS256 algorithm', () => {
      const user = { id: 'usr-test-12345', role: 'SALES_MANAGER' };
      const token = generateAccessToken(user);

      assert.ok(token);
      assert.equal(typeof token, 'string');

      const decoded = verifyAccessToken(token);
      assert.equal(decoded.userId, 'usr-test-12345');
      assert.equal(decoded.role, 'SALES_MANAGER');
    });

    it('should reject JWT generation without required user id and role', () => {
      assert.throws(() => generateAccessToken({}), /user object must have id and role/);
      assert.throws(() => generateAccessToken(null), /user object must have id and role/);
    });

    it('should sanitize user object by stripping sensitive fields', () => {
      const rawUser = {
        id: 'usr-uuid-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'ADMIN',
        passwordHash: '$2a$10$abcdefghijklmnopqrstuv',
      };

      const sanitized = sanitizeUser(rawUser);
      assert.equal(sanitized.passwordHash, undefined);
      assert.equal(sanitized.id, 'usr-uuid-123');
      assert.equal(sanitized.email, 'john@example.com');
      assert.equal(sanitizeUser(null), null);
    });
  });

  // =========================================================================
  // 2. QUOTATION PRICING & MARGIN CALCULATION ENGINE
  // =========================================================================
  describe('2. Quotation Pricing & Margin Engine', () => {
    it('calculateLineSubtotal: should correctly multiply unit price by quantity', () => {
      assert.equal(quotationService.calculateLineSubtotal(100, 5), 500.00);
      assert.equal(quotationService.calculateLineSubtotal(99.99, 3), 299.97);
      assert.equal(quotationService.calculateLineSubtotal('45.50', '2'), 91.00);
      assert.equal(quotationService.calculateLineSubtotal(0, 10), 0.00);
    });

    it('calculateDiscountAmount: should compute percentage discount correctly', () => {
      assert.equal(quotationService.calculateDiscountAmount(500, 10), 50.00);
      assert.equal(quotationService.calculateDiscountAmount(299.97, 15), 45.00);
      assert.equal(quotationService.calculateDiscountAmount(100, 0), 0.00);
      assert.equal(quotationService.calculateDiscountAmount(100, 100), 100.00);
    });

    it('calculateTaxAmount: should compute tax on taxable net amount', () => {
      assert.equal(quotationService.calculateTaxAmount(450, 18), 81.00);
      assert.equal(quotationService.calculateTaxAmount(1000, 5), 50.00);
      assert.equal(quotationService.calculateTaxAmount(500, 0), 0.00);
    });

    it('calculateMarginAmount: should compute net revenue minus total product cost', () => {
      assert.equal(quotationService.calculateMarginAmount(450, 300), 150.00);
      assert.equal(quotationService.calculateMarginAmount(200, 250), -50.00); // Negative margin
      assert.equal(quotationService.calculateMarginAmount(500, 500), 0.00);
    });

    it('calculateMarginPercentage: should compute percentage margin based on net amount', () => {
      assert.equal(quotationService.calculateMarginPercentage(150, 450), 33.33);
      assert.equal(quotationService.calculateMarginPercentage(100, 500), 20.00);
      assert.equal(quotationService.calculateMarginPercentage(0, 500), 0.00);
      assert.equal(quotationService.calculateMarginPercentage(50, 0), 0.00); // division by zero safety
    });

    it('calculateQuotationItem: should calculate full financial lifecycle of a line item', () => {
      const item = quotationService.calculateQuotationItem({
        unitPrice: 200,
        quantity: 5,
        discountPercentage: 10,
        costPrice: 120,
        taxRate: 18,
      });

      // 200 * 5 = 1000 gross
      assert.equal(item.grossAmount, 1000.00);
      // 10% of 1000 = 100 discount
      assert.equal(item.discountAmount, 100.00);
      // 1000 - 100 = 900 net
      assert.equal(item.netAmount, 900.00);
      // 18% of 900 = 162 tax
      assert.equal(item.taxAmount, 162.00);
      // 900 + 162 = 1062 total
      assert.equal(item.lineTotal, 1062.00);
      // 120 * 5 = 600 cost
      assert.equal(item.costAmount, 600.00);
      // 900 - 600 = 300 margin
      assert.equal(item.marginAmount, 300.00);
      // (300 / 900) * 100 = 33.33% margin
      assert.equal(item.marginPercentage, 33.33);
    });
  });

  // =========================================================================
  // 3. DISCOUNT ENGINE
  // =========================================================================
  describe('3. Discount Policy Engine', () => {
    it('calculateMaximumAllowedDiscount: should return max discount from active rule', () => {
      const activeRule = { maxDiscountPercentage: 15.0, isActive: true };
      assert.equal(discountService.calculateMaximumAllowedDiscount(activeRule), 15.0);

      const inactiveRule = { maxDiscountPercentage: 20.0, isActive: false };
      assert.equal(discountService.calculateMaximumAllowedDiscount(inactiveRule), 0.0);

      assert.equal(discountService.calculateMaximumAllowedDiscount(null), 0.0);
    });

    it('calculateDiscountDeviation: should calculate excess discount above maximum threshold', () => {
      // 20% requested vs 15% allowed -> 5% deviation
      assert.equal(discountService.calculateDiscountDeviation(20.0, 15.0), 5.0);
      // 10% requested vs 15% allowed -> 0 deviation
      assert.equal(discountService.calculateDiscountDeviation(10.0, 15.0), 0.0);
      // exact match -> 0 deviation
      assert.equal(discountService.calculateDiscountDeviation(15.0, 15.0), 0.0);
      // edge case: string numbers
      assert.equal(discountService.calculateDiscountDeviation('25.5', '20'), 5.5);
    });

    it('validateDiscountAgainstRule: should evaluate compliance correctly', () => {
      const rule = { maxDiscountPercentage: 10.0, isActive: true };

      const compliant = discountService.validateDiscountAgainstRule(8.0, rule);
      assert.equal(compliant.allowed, true);
      assert.equal(compliant.deviation, 0.0);

      const nonCompliant = discountService.validateDiscountAgainstRule(18.5, rule);
      assert.equal(nonCompliant.allowed, false);
      assert.equal(nonCompliant.deviation, 8.5);
      assert.ok(nonCompliant.reason.includes('exceeds'));
    });
  });

  // =========================================================================
  // 4. RISK ASSESSMENT ENGINE
  // =========================================================================
  describe('4. Multi-Factor Risk Assessment Engine', () => {
    it('calculateRiskScore: should correctly accumulate penalty factors', () => {
      // Clean quotation: 0 deviation, 0 margin deficit, low exposure -> Score 0
      const cleanScore = riskService.calculateRiskScore({
        maxDeviation: 0,
        actualMargin: 25,
        minimumRequiredMargin: 20,
        totalAmount: 5000,
        customerTier: 'PLATINUM',
      });
      assert.equal(cleanScore, 0);

      // High deviation (>10) adds 50
      const highDevScore = riskService.calculateRiskScore({
        maxDeviation: 12,
        actualMargin: 25,
        minimumRequiredMargin: 20,
        totalAmount: 10000,
        customerTier: 'GOLD',
      });
      assert.equal(highDevScore, 50);

      // Margin deficit (>5 and <=15) adds 35
      const marginDeficitScore = riskService.calculateRiskScore({
        maxDeviation: 0,
        actualMargin: 12,
        minimumRequiredMargin: 20, // Deficit = 8
        totalAmount: 10000,
        customerTier: 'SILVER',
      });
      assert.equal(marginDeficitScore, 35);

      // Very high exposure (>100k) adds 20
      const highExposureScore = riskService.calculateRiskScore({
        maxDeviation: 0,
        actualMargin: 25,
        minimumRequiredMargin: 20,
        totalAmount: 150000,
        customerTier: 'GOLD',
      });
      assert.equal(highExposureScore, 20);

      // Bronze tier with deviation adds 5 + slight deviation (+15) = 20
      const bronzePenaltyScore = riskService.calculateRiskScore({
        maxDeviation: 3, // slight deviation (+15)
        actualMargin: 25,
        minimumRequiredMargin: 20,
        totalAmount: 2000,
        customerTier: 'BRONZE', // +5
      });
      assert.equal(bronzePenaltyScore, 20);
    });

    it('determineRiskLevel: should map numeric scores to discrete risk bands', () => {
      assert.equal(riskService.determineRiskLevel(15), 'LOW');
      assert.equal(riskService.determineRiskLevel(45), 'MEDIUM');
      assert.equal(riskService.determineRiskLevel(70), 'HIGH');
      assert.equal(riskService.determineRiskLevel(90), 'CRITICAL');
      assert.equal(riskService.determineRiskLevel(100), 'CRITICAL');
    });

    it('determineApprovalRequirement: should trigger appropriate approval roles', () => {
      // Low risk, no triggers -> No approval required
      const req1 = riskService.determineApprovalRequirement({
        riskScore: 10,
        riskLevel: 'LOW',
        hasManagerTrigger: false,
        hasFinanceTrigger: false,
        maxDeviation: 0,
        marginDeficit: 0,
        totalAmount: 5000,
      });
      assert.equal(req1.approvalRequired, false);
      assert.equal(req1.approvalRequirements.length, 0);

      // Manager trigger or deviation > 0 -> SALES_MANAGER required
      const req2 = riskService.determineApprovalRequirement({
        riskScore: 30,
        riskLevel: 'MEDIUM',
        hasManagerTrigger: true,
        hasFinanceTrigger: false,
        maxDeviation: 5,
        marginDeficit: 0,
        totalAmount: 20000,
      });
      assert.equal(req2.approvalRequired, true);
      assert.ok(req2.approvalRequirements.includes('SALES_MANAGER'));
      assert.equal(req2.approvalRequirements.includes('FINANCE'), false);

      // Finance trigger (margin deficit > 0) -> FINANCE required
      const req3 = riskService.determineApprovalRequirement({
        riskScore: 55,
        riskLevel: 'HIGH',
        hasManagerTrigger: true,
        hasFinanceTrigger: true,
        maxDeviation: 8,
        marginDeficit: 4,
        totalAmount: 50000,
      });
      assert.equal(req3.approvalRequired, true);
      assert.ok(req3.approvalRequirements.includes('SALES_MANAGER'));
      assert.ok(req3.approvalRequirements.includes('FINANCE'));
    });
  });

  // =========================================================================
  // 5. INVOICE & BILLING CALCULATIONS
  // =========================================================================
  describe('5. Invoice & Billing Calculation Engine', () => {
    it('calculateInvoiceItem: should compute line item totals accurately', () => {
      const line = invoiceService.calculateInvoiceItem({
        quantity: 4,
        unitPrice: 250,
        discountPercentage: 10,
        taxAmount: 90,
      });

      assert.equal(line.grossAmount, 1000.00);
      assert.equal(line.discountAmount, 100.00);
      assert.equal(line.taxAmount, 90.00);
      assert.equal(line.lineTotal, 990.00); // (1000 - 100) + 90
    });

    it('calculateInvoiceSubtotal, calculateInvoiceDiscount, calculateInvoiceTax', () => {
      const items = [
        { quantity: 2, unitPrice: 500, discountAmount: 50, taxAmount: 85.5 },
        { quantity: 3, unitPrice: 200, discountAmount: 30, taxAmount: 51.3 },
      ];

      assert.equal(invoiceService.calculateInvoiceSubtotal(items), 1600.00); // 1000 + 600
      assert.equal(invoiceService.calculateInvoiceDiscount(items), 80.00);   // 50 + 30
      assert.equal(invoiceService.calculateInvoiceTax(items), 136.80);        // 85.5 + 51.3
    });

    it('calculateInvoiceTotal: should compute subtotal - discount + tax', () => {
      assert.equal(invoiceService.calculateInvoiceTotal(1600, 80, 136.8), 1656.80);
    });

    it('calculateInvoicePaidAmount & calculateInvoiceOutstandingAmount', () => {
      const payments = [
        { amount: 500, status: 'COMPLETED' },
        { amount: 300, status: 'SUCCESSFUL' },
        { amount: 200, status: 'FAILED' }, // Should be excluded
      ];

      const paid = invoiceService.calculateInvoicePaidAmount(payments);
      assert.equal(paid, 800.00);

      const outstanding = invoiceService.calculateInvoiceOutstandingAmount(1656.80, paid);
      assert.equal(outstanding, 856.80);

      // Overpayment clamp: outstanding cannot be negative
      const overpaidOutstanding = invoiceService.calculateInvoiceOutstandingAmount(500, 600);
      assert.equal(overpaidOutstanding, 0.00);
    });

    it('calculateInvoiceStatus: should derive correct status from payments and dates', () => {
      const futureDate = new Date(Date.now() + 86400000 * 10);
      const pastDate = new Date(Date.now() - 86400000 * 10);

      // Full payment -> PAID
      assert.equal(
        invoiceService.calculateInvoiceStatus({
          status: 'ISSUED',
          totalAmount: 1000,
          paidAmount: 1000,
          dueDate: futureDate,
        }),
        'PAID'
      );

      // Partial payment, not past due -> PARTIALLY_PAID
      assert.equal(
        invoiceService.calculateInvoiceStatus({
          status: 'ISSUED',
          totalAmount: 1000,
          paidAmount: 400,
          dueDate: futureDate,
        }),
        'PARTIALLY_PAID'
      );

      // Partial payment, past due -> OVERDUE
      assert.equal(
        invoiceService.calculateInvoiceStatus({
          status: 'ISSUED',
          totalAmount: 1000,
          paidAmount: 400,
          dueDate: pastDate,
        }),
        'OVERDUE'
      );

      // Zero payment, past due -> OVERDUE
      assert.equal(
        invoiceService.calculateInvoiceStatus({
          status: 'ISSUED',
          totalAmount: 1000,
          paidAmount: 0,
          dueDate: pastDate,
        }),
        'OVERDUE'
      );

      // Cancelled remains CANCELLED
      assert.equal(
        invoiceService.calculateInvoiceStatus({
          status: 'CANCELLED',
          totalAmount: 1000,
          paidAmount: 0,
          dueDate: pastDate,
        }),
        'CANCELLED'
      );
    });

    it('validateInvoiceStatusTransition: should enforce valid state machine transitions', () => {
      // Valid transitions
      assert.doesNotThrow(() => invoiceService.validateInvoiceStatusTransition('DRAFT', 'ISSUED'));
      assert.doesNotThrow(() => invoiceService.validateInvoiceStatusTransition('ISSUED', 'PAID'));
      assert.doesNotThrow(() => invoiceService.validateInvoiceStatusTransition('ISSUED', 'CANCELLED'));

      // Invalid transitions
      assert.throws(
        () => invoiceService.validateInvoiceStatusTransition('DRAFT', 'PAID'),
        /Invalid invoice status transition/
      );
      assert.throws(
        () => invoiceService.validateInvoiceStatusTransition('PAID', 'DRAFT'),
        /Invalid invoice status transition/
      );
    });
  });

  // =========================================================================
  // 6. DATE RANGE PARSER & DASHBOARD AGGREGATION HELPERS
  // =========================================================================
  describe('6. Date Range Parser Utilities', () => {
    it('should parse standard dashboard presets with start and end dates', () => {
      const presets = ['today', 'yesterday', 'this_week', 'this_month', 'this_quarter', 'this_year', 'last_7_days', 'last_30_days'];

      for (const preset of presets) {
        const result = parseDashboardDateRange({ period: preset });
        assert.ok(result.current.startDate instanceof Date);
        assert.ok(result.current.endDate instanceof Date);
        assert.ok(result.previous.startDate instanceof Date);
        assert.ok(result.previous.endDate instanceof Date);
        assert.ok(result.current.startDate <= result.current.endDate);
        assert.ok(result.previous.startDate <= result.previous.endDate);
      }
    });

    it('should parse valid custom date ranges', () => {
      const result = parseDashboardDateRange({
        period: 'custom',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      });

      assert.equal(result.period, 'custom');
      assert.equal(result.current.startDate.toISOString().slice(0, 10), '2026-01-01');
      assert.equal(result.current.endDate.toISOString().slice(0, 10), '2026-01-31');
    });

    it('should reject invalid date range requests', () => {
      // Inverted custom dates (start > end)
      assert.throws(
        () => parseDashboardDateRange({ period: 'custom', startDate: '2026-02-01', endDate: '2026-01-01' }),
        /startDate cannot be after endDate/
      );

      // Unrecognized period
      assert.throws(
        () => parseDashboardDateRange({ period: 'next_decade' }),
        /Unsupported dashboard period/
      );
    });
  });

  // =========================================================================
  // 7. PAGINATION UTILITIES
  // =========================================================================
  describe('7. Pagination Helper Utilities', () => {
    it('getPaginationParams: should normalize query parameters with limits and defaults', () => {
      const p1 = getPaginationParams({ page: '2', limit: '25' });
      assert.equal(p1.page, 2);
      assert.equal(p1.limit, 25);
      assert.equal(p1.skip, 25);

      // Default fallback
      const p2 = getPaginationParams({});
      assert.equal(p2.page, 1);
      assert.equal(p2.limit, 20);
      assert.equal(p2.skip, 0);

      // Upper limit clamping (max 100)
      const p3 = getPaginationParams({ limit: '500' });
      assert.equal(p3.limit, 100);

      // Lower bound clamping (min 1)
      const p4 = getPaginationParams({ page: '-5', limit: '1' });
      assert.equal(p4.page, 1);
      assert.equal(p4.limit, 1);
    });

    it('formatPagination: should construct standard pagination envelope metadata', () => {
      const meta = formatPagination(105, 2, 20);
      assert.equal(meta.total, 105);
      assert.equal(meta.page, 2);
      assert.equal(meta.limit, 20);
      assert.equal(meta.totalPages, 6);

      // First page
      const firstPage = formatPagination(50, 1, 20);
      assert.equal(firstPage.total, 50);
      assert.equal(firstPage.page, 1);
      assert.equal(firstPage.totalPages, 3);

      // Last page
      const lastPage = formatPagination(50, 3, 20);
      assert.equal(lastPage.total, 50);
      assert.equal(lastPage.page, 3);
      assert.equal(lastPage.totalPages, 3);
    });
  });
});
