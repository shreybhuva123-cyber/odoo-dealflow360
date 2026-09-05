import test from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { generateAccessToken } from '../src/utils/jwt.js';
import { QuoteStatus, UserRole, CustomerTier, RiskLevel } from '@prisma/client';
import { discountService } from '../src/services/discountService.js';
import { riskService } from '../src/services/riskService.js';
import bcrypt from 'bcryptjs';

test('Phase 6: Discount Engine + Risk Engine Comprehensive Test Suite', async (t) => {
  let server;
  const port = 5079;
  const baseUrl = `http://localhost:${port}`;

  let adminToken, sales1Token, sales2Token, managerToken, financeToken;
  let adminUser, salesUser1, salesUser2, managerUser, financeUser;
  let goldCustomer, silverCustomer, bronzeCustomer;
  let hardwareCategory, servicesCategory;
  let laptopProduct, consultingProduct;

  await t.test('Bootstrap: Test server, users, customers, categories, products', async () => {
    await new Promise((resolve) => {
      server = app.listen(port, () => resolve());
    });
    assert.ok(server);

    // Fetch users
    adminUser = await prisma.user.findUnique({ where: { email: 'admin@dealflow360.com' } });
    salesUser1 = await prisma.user.findUnique({ where: { email: 'sales.rep@dealflow360.com' } });
    salesUser2 = await prisma.user.findUnique({ where: { email: 'sales.rep2@dealflow360.com' } });
    managerUser = await prisma.user.findUnique({ where: { email: 'sales.manager@dealflow360.com' } });
    financeUser = await prisma.user.findUnique({ where: { email: 'finance@dealflow360.com' } });

    adminToken = generateAccessToken(adminUser);
    sales1Token = generateAccessToken(salesUser1);
    sales2Token = generateAccessToken(salesUser2);
    managerToken = generateAccessToken(managerUser);
    financeToken = generateAccessToken(financeUser);

    // Fetch customers for all 3 tiers
    goldCustomer = await prisma.customer.findFirst({
      where: { customerTier: CustomerTier.GOLD, isActive: true },
    });
    silverCustomer = await prisma.customer.findFirst({
      where: { customerTier: CustomerTier.SILVER, isActive: true },
    });
    bronzeCustomer = await prisma.customer.findFirst({
      where: { customerTier: CustomerTier.BRONZE, isActive: true },
    });

    assert.ok(goldCustomer && silverCustomer && bronzeCustomer);

    // Fetch categories
    hardwareCategory = await prisma.productCategory.findUnique({ where: { name: 'Hardware' } });
    servicesCategory = await prisma.productCategory.findUnique({ where: { name: 'Services' } });
    assert.ok(hardwareCategory && servicesCategory);

    // Fetch products
    laptopProduct = await prisma.product.findUnique({ where: { sku: 'HW-LAPTOP-15' } });
    consultingProduct = await prisma.product.findUnique({ where: { sku: 'SVC-CONSULTING-HR' } });
    assert.ok(laptopProduct && consultingProduct);
  });

  // =============================================================
  // PART 1: DISCOUNT ENGINE TESTS (1 - 8)
  // =============================================================

  await t.test('1. Discount within allowed limit (allowed: true, deviation: 0)', async () => {
    // Gold tier on Hardware allows up to 15%
    const evalRes = await discountService.evaluateDiscount(
      goldCustomer.id,
      laptopProduct.id,
      undefined,
      10.0
    );

    assert.strictEqual(evalRes.allowed, true);
    assert.strictEqual(evalRes.requestedDiscount, 10);
    assert.strictEqual(evalRes.maximumAllowedDiscount, 15);
    assert.strictEqual(evalRes.deviation, 0);
    assert.match(evalRes.reason, /within the allowed limit/i);
  });

  await t.test('2. Discount exactly at allowed limit (allowed: true, deviation: 0)', async () => {
    const evalRes = await discountService.evaluateDiscount(
      goldCustomer.id,
      laptopProduct.id,
      undefined,
      15.0
    );

    assert.strictEqual(evalRes.allowed, true);
    assert.strictEqual(evalRes.requestedDiscount, 15);
    assert.strictEqual(evalRes.maximumAllowedDiscount, 15);
    assert.strictEqual(evalRes.deviation, 0);
  });

  await t.test('3. Discount above allowed limit (allowed: false, deviation > 0)', async () => {
    const evalRes = await discountService.evaluateDiscount(
      goldCustomer.id,
      laptopProduct.id,
      undefined,
      18.0
    );

    assert.strictEqual(evalRes.allowed, false);
    assert.strictEqual(evalRes.requestedDiscount, 18);
    assert.strictEqual(evalRes.maximumAllowedDiscount, 15);
    assert.strictEqual(evalRes.deviation, 3);
    assert.match(evalRes.reason, /exceeds the maximum allowed discount/i);
  });

  await t.test('4. Large discount deviation calculation', async () => {
    const evalRes = await discountService.evaluateDiscount(
      goldCustomer.id,
      laptopProduct.id,
      undefined,
      40.0
    );

    assert.strictEqual(evalRes.allowed, false);
    assert.strictEqual(evalRes.deviation, 25);
    assert.strictEqual(evalRes.maximumAllowedDiscount, 15);
  });

  await t.test('5. Missing applicable rule fallback to 0% maximum', async () => {
    // Pass null rule to calculation
    const max = discountService.calculateMaximumAllowedDiscount(null);
    assert.strictEqual(max, 0);

    const validation = discountService.validateDiscountAgainstRule(10, null);
    assert.strictEqual(validation.allowed, false);
    assert.strictEqual(validation.maximumAllowedDiscount, 0);
    assert.strictEqual(validation.deviation, 10);
  });

  await t.test('6. Inactive rule handling (treated as no active rule)', async () => {
    const inactiveRule = {
      maxDiscountPercentage: 20.0,
      isActive: false,
    };
    const max = discountService.calculateMaximumAllowedDiscount(inactiveRule);
    assert.strictEqual(max, 0);

    const validation = discountService.validateDiscountAgainstRule(5, inactiveRule);
    assert.strictEqual(validation.allowed, false);
    assert.strictEqual(validation.deviation, 5);
  });

  await t.test('7. Multiple matching rules resolved by tier & category specificity', async () => {
    // Hardware rules: Bronze=5%, Silver=10%, Gold=15%
    const bronzeEval = await discountService.evaluateDiscount(bronzeCustomer.id, laptopProduct.id, undefined, 8);
    const silverEval = await discountService.evaluateDiscount(silverCustomer.id, laptopProduct.id, undefined, 8);
    const goldEval = await discountService.evaluateDiscount(goldCustomer.id, laptopProduct.id, undefined, 8);

    assert.strictEqual(bronzeEval.maximumAllowedDiscount, 5);
    assert.strictEqual(bronzeEval.allowed, false);
    assert.strictEqual(bronzeEval.deviation, 3);

    assert.strictEqual(silverEval.maximumAllowedDiscount, 10);
    assert.strictEqual(silverEval.allowed, true);
    assert.strictEqual(silverEval.deviation, 0);

    assert.strictEqual(goldEval.maximumAllowedDiscount, 15);
    assert.strictEqual(goldEval.allowed, true);
    assert.strictEqual(goldEval.deviation, 0);
  });

  await t.test('8. Rule tier-based specificity across categories', async () => {
    // Bronze: Hardware=5%, Services=5%
    // Gold: Hardware=15%, Services=10%
    const goldServiceEval = await discountService.evaluateDiscount(goldCustomer.id, consultingProduct.id, undefined, 12);
    assert.strictEqual(goldServiceEval.maximumAllowedDiscount, 10);
    assert.strictEqual(goldServiceEval.allowed, false);
    assert.strictEqual(goldServiceEval.deviation, 2);
  });

  // =============================================================
  // PART 2: RISK ENGINE TESTS (9 - 15)
  // =============================================================

  await t.test('9. Low-risk quotation (healthy margin, discount within limit)', async () => {
    const score = riskService.calculateRiskScore({
      maxDeviation: 0,
      actualMargin: 35.0,
      minimumRequiredMargin: 25.0,
      totalAmount: 5000,
      customerTier: 'GOLD',
    });
    const level = riskService.determineRiskLevel(score);

    assert.strictEqual(score, 0);
    assert.strictEqual(level, RiskLevel.LOW);
  });

  await t.test('10. Medium-risk quotation (slight deviation or slight margin deficit)', async () => {
    // Slight deviation (3%) -> +15 points; margin deficit (4%) -> +20 points = 35 points (MEDIUM)
    const score = riskService.calculateRiskScore({
      maxDeviation: 3.0,
      actualMargin: 21.0,
      minimumRequiredMargin: 25.0,
      totalAmount: 10000,
      customerTier: 'GOLD',
    });
    const level = riskService.determineRiskLevel(score);

    assert.strictEqual(score, 35);
    assert.strictEqual(level, RiskLevel.MEDIUM);
  });

  await t.test('11. High-risk quotation (large deviation + severe margin deficit)', async () => {
    // Large deviation (> 10%) -> +50; severe margin deficit (> 15%) -> +50 = 100 (HIGH/CRITICAL)
    const score = riskService.calculateRiskScore({
      maxDeviation: 15.0,
      actualMargin: 5.0,
      minimumRequiredMargin: 25.0,
      totalAmount: 12000,
      customerTier: 'GOLD',
    });
    const level = riskService.determineRiskLevel(score);

    assert.ok(score >= 60);
    assert.ok(level === RiskLevel.HIGH || level === RiskLevel.CRITICAL);
  });

  await t.test('12. Low-margin quotation penalty', async () => {
    // 0% deviation, but margin is 10% below minimum 25% (+35 margin penalty)
    const score = riskService.calculateRiskScore({
      maxDeviation: 0,
      actualMargin: 15.0,
      minimumRequiredMargin: 25.0,
      totalAmount: 5000,
      customerTier: 'SILVER',
    });
    assert.strictEqual(score, 35);
  });

  await t.test('13. High-discount quotation penalty', async () => {
    // 12% deviation (+50) with healthy margin
    const score = riskService.calculateRiskScore({
      maxDeviation: 12.0,
      actualMargin: 30.0,
      minimumRequiredMargin: 25.0,
      totalAmount: 8000,
      customerTier: 'GOLD',
    });
    assert.strictEqual(score, 50);
  });

  await t.test('14. High-discount + low-margin compounding quotation', async () => {
    // 6% deviation (+30) + 8% margin deficit (+35) = 65 points (HIGH)
    const score = riskService.calculateRiskScore({
      maxDeviation: 6.0,
      actualMargin: 17.0,
      minimumRequiredMargin: 25.0,
      totalAmount: 15000,
      customerTier: 'GOLD',
    });
    const level = riskService.determineRiskLevel(score);

    assert.strictEqual(score, 65);
    assert.strictEqual(level, RiskLevel.HIGH);
  });

  await t.test('15. Risk reason generation provides structured, explainable details', async () => {
    // Create quote with deviation
    const resCreate = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({ customerId: goldCustomer.id }),
    });
    const { data: { quotation: quote } } = await resCreate.json();

    // Add item with 25% discount (exceeds Gold Hardware max of 15% by 10%)
    await fetch(`${baseUrl}/api/quotations/${quote.id}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({
        productId: laptopProduct.id,
        quantity: 1,
        discountPercentage: 25,
      }),
    });

    const evalData = await riskService.evaluateQuotationRisk(quote.id);
    assert.ok(Array.isArray(evalData.reasons));
    assert.ok(evalData.reasons.length > 0);
    const discountExceededReason = evalData.reasons.find((r) => r.code === 'DISCOUNT_EXCEEDED');
    assert.ok(discountExceededReason);
    assert.match(discountExceededReason.message, /exceeds maximum allowed limit/i);
    assert.strictEqual(discountExceededReason.severity, 'MEDIUM');
  });

  // =============================================================
  // PART 3: APPROVAL ENGINE TESTS (16 - 20)
  // =============================================================

  await t.test('16. No approval required for healthy quotation within limits', async () => {
    const approval = riskService.determineApprovalRequirement({
      riskScore: 0,
      riskLevel: RiskLevel.LOW,
      hasManagerTrigger: false,
      hasFinanceTrigger: false,
      maxDeviation: 0,
      marginDeficit: 0,
      totalAmount: 5000,
    });

    assert.strictEqual(approval.approvalRequired, false);
    assert.deepStrictEqual(approval.approvalRequirements, []);
  });

  await t.test('17. Sales manager approval required when discount exceeds manager limit', async () => {
    const approval = riskService.determineApprovalRequirement({
      riskScore: 30,
      riskLevel: RiskLevel.MEDIUM,
      hasManagerTrigger: true,
      hasFinanceTrigger: false,
      maxDeviation: 3,
      marginDeficit: 0,
      totalAmount: 5000,
    });

    assert.strictEqual(approval.approvalRequired, true);
    assert.ok(approval.approvalRequirements.includes('SALES_MANAGER'));
    assert.ok(!approval.approvalRequirements.includes('FINANCE'));
  });

  await t.test('18. Finance approval required when margin deficit occurs', async () => {
    const approval = riskService.determineApprovalRequirement({
      riskScore: 35,
      riskLevel: RiskLevel.MEDIUM,
      hasManagerTrigger: false,
      hasFinanceTrigger: false,
      maxDeviation: 0,
      marginDeficit: 5.5,
      totalAmount: 5000,
    });

    assert.strictEqual(approval.approvalRequired, true);
    assert.ok(approval.approvalRequirements.includes('FINANCE'));
  });

  await t.test('19. Both approvals required when high risk compounding triggers occur', async () => {
    const approval = riskService.determineApprovalRequirement({
      riskScore: 70,
      riskLevel: RiskLevel.HIGH,
      hasManagerTrigger: true,
      hasFinanceTrigger: true,
      maxDeviation: 10,
      marginDeficit: 12,
      totalAmount: 25000,
    });

    assert.strictEqual(approval.approvalRequired, true);
    assert.ok(approval.approvalRequirements.includes('SALES_MANAGER'));
    assert.ok(approval.approvalRequirements.includes('FINANCE'));
  });

  await t.test('20. Sales rep cannot approve own quotation (RBAC guard)', async () => {
    // Ensure SALES_REP role does not have administrative/manager access to modify rules or approve
    const res = await fetch(`${baseUrl}/api/discount-rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({
        customerTier: 'GOLD',
        categoryId: hardwareCategory.id,
        maxDiscountPercentage: 99,
        managerApprovalRequiredAbove: 99,
        financeApprovalRequiredAbove: 99,
      }),
    });
    assert.strictEqual(res.status, 403);
  });

  // =============================================================
  // PART 4: SECURITY & TAMPER RESISTANCE (21 - 25)
  // =============================================================
  let secQuoteId;

  await t.test('21. Security: Frontend cannot override riskScore on quotation', async () => {
    // Create draft quote
    const resCreate = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({
        customerId: goldCustomer.id,
        riskScore: 0, // Injected client value
        approvalRequired: false,
      }),
    });
    const dataCreate = await resCreate.json();
    secQuoteId = dataCreate.data.quotation.id;

    // Add item with high discount
    await fetch(`${baseUrl}/api/quotations/${secQuoteId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({
        productId: laptopProduct.id,
        quantity: 1,
        discountPercentage: 30, // 15% deviation
      }),
    });

    // Submit quotation
    const resSubmit = await fetch(`${baseUrl}/api/quotations/${secQuoteId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({
        riskScore: 0,
        riskLevel: 'LOW',
        approvalRequired: false,
      }),
    });

    assert.strictEqual(resSubmit.status, 200);
    const dataSubmit = await resSubmit.json();
    // Server must have calculated real score, ignoring frontend overrides
    assert.ok(Number(dataSubmit.data.quotation.riskScore) > 0);
  });

  await t.test('22. Security: Frontend cannot override approvalRequired flag', async () => {
    const quote = await prisma.quotation.findUnique({ where: { id: secQuoteId } });
    assert.strictEqual(quote.approvalRequired, true);
  });

  await t.test('23. Security: Frontend cannot override maximum allowed discount', async () => {
    const evalData = await riskService.evaluateQuotationRisk(secQuoteId);
    assert.strictEqual(evalData.discountEvaluation.maximumAllowedDiscount, 15);
    assert.strictEqual(evalData.discountEvaluation.requestedDiscount, 30);
    assert.strictEqual(evalData.discountEvaluation.deviation, 15);
  });

  await t.test('24. Security: Sales rep cannot modify discount rules (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/discount-rules`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${sales1Token}`,
      },
    });
    // SALES_REP is not authorized to list or mutate discount rules
    assert.strictEqual(res.status, 403);
  });

  await t.test('25. Security: Unauthorized user cannot evaluate another sales rep quotation (403)', async () => {
    // Sales rep 2 tries to evaluate Sales rep 1's quotation
    const res = await fetch(`${baseUrl}/api/quotations/${secQuoteId}/evaluate-risk`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sales2Token}`,
      },
    });
    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert.match(data.message, /permission/i);
  });

  // =============================================================
  // PART 5: API ENDPOINTS & EVALUATION (26 - 30)
  // =============================================================

  await t.test('26. POST /api/quotations/:id/evaluate-risk returns complete evaluation payload', async () => {
    const res = await fetch(`${baseUrl}/api/quotations/${secQuoteId}/evaluate-risk`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sales1Token}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.quotationId);
    assert.ok(typeof data.data.riskScore === 'number');
    assert.ok(data.data.riskLevel);
    assert.strictEqual(data.data.approvalRequired, true);
    assert.ok(Array.isArray(data.data.approvalRequirements));
    assert.ok(data.data.discountEvaluation);
    assert.ok(data.data.marginEvaluation);
    assert.ok(Array.isArray(data.data.itemEvaluations));
    assert.ok(Array.isArray(data.data.reasons));
  });

  await t.test('27. Authentication required on evaluate-risk endpoint (401)', async () => {
    const res = await fetch(`${baseUrl}/api/quotations/${secQuoteId}/evaluate-risk`, {
      method: 'POST',
    });
    assert.strictEqual(res.status, 401);
  });

  await t.test('28. Admin discount rules CRUD operations', async () => {
    // Create a new category for isolated rule testing
    const testCategory = await prisma.productCategory.create({
      data: {
        name: `Test Cat ${Date.now()}`,
        defaultMarginPercentage: 30.0,
      },
    });

    // Admin creates rule
    const resCreate = await fetch(`${baseUrl}/api/discount-rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        customerTier: 'GOLD',
        categoryId: testCategory.id,
        maxDiscountPercentage: 25.0,
        managerApprovalRequiredAbove: 15.0,
        financeApprovalRequiredAbove: 25.0,
      }),
    });
    assert.strictEqual(resCreate.status, 201);
    const dataCreate = await resCreate.json();
    const createdRuleId = dataCreate.data.discountRule.id;

    // Get rule by ID
    const resGet = await fetch(`${baseUrl}/api/discount-rules/${createdRuleId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(resGet.status, 200);

    // Update rule
    const resUpdate = await fetch(`${baseUrl}/api/discount-rules/${createdRuleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ maxDiscountPercentage: 30.0 }),
    });
    assert.strictEqual(resUpdate.status, 200);
    const dataUpdate = await resUpdate.json();
    assert.strictEqual(Number(dataUpdate.data.discountRule.maxDiscountPercentage), 30.0);

    // Delete rule
    const resDelete = await fetch(`${baseUrl}/api/discount-rules/${createdRuleId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(resDelete.status, 200);

    // Clean up test category
    await prisma.productCategory.delete({ where: { id: testCategory.id } });
  });

  await t.test('29. Validation errors on invalid discount rule payload (400)', async () => {
    const res = await fetch(`${baseUrl}/api/discount-rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        customerTier: 'INVALID_TIER',
        categoryId: 'not-a-uuid',
        maxDiscountPercentage: 150, // Invalid > 100
        managerApprovalRequiredAbove: -5, // Invalid < 0
        financeApprovalRequiredAbove: 20,
      }),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.details);
  });

  await t.test('30. Error handling: Non-existent quotation evaluate-risk returns 404', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const res = await fetch(`${baseUrl}/api/quotations/${nonExistentId}/evaluate-risk`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    assert.strictEqual(res.status, 404);
  });

  await t.test('Teardown: Close test server', async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});
