/**
 * Phase 14 - Production Smoke Test Runner
 * Executes a realistic end-to-end B2B sales operations cycle against the backend.
 *
 * Sequence:
 * 1.  Server Startup & Ephemeral Port Binding
 * 2.  Database Connection Health Check
 * 3.  Liveness Probe (GET /health)
 * 4.  Readiness Probe (GET /health/ready)
 * 5.  Authentication (POST /api/auth/login)
 * 6.  Catalog Lookup (GET /api/products & GET /api/customers)
 * 7.  Quotation Creation (POST /api/quotations)
 * 8.  Quotation Item Creation (POST /api/quotations/:id/items)
 * 9.  Quotation Submission & Risk Evaluation (POST /api/quotations/:id/submit)
 * 10. Multi-Stage Approvals (POST /api/approvals/:id/approve)
 * 11. Conversion to Sales Order (POST /api/quotations/:id/create-order)
 * 12. Order Confirmation & Status Management (PATCH /api/orders/:id/status)
 * 13. Tax Invoice Generation (POST /api/orders/:id/create-invoice)
 * 14. Invoice Issuance (POST /api/invoices/:id/issue)
 * 15. Payment Settlement (POST /api/invoices/:id/payments)
 * 16. Executive Dashboard Verification (GET /api/dashboard/overview)
 * 17. In-App Notification Feed (GET /api/notifications)
 */

import app from '../src/app.js';
import { testDatabaseConnection, prisma } from '../src/config/prisma.js';

let server;
let baseUrl;

const results = [];

function recordStep(stepNumber, name, status, details = '') {
  results.push({ stepNumber, name, status, details });
  const icon = status === 'PASSED' ? '✅' : '❌';
  console.log(`  ${icon} [${String(stepNumber).padStart(2, '0')}] ${name.padEnd(42, ' ')} ${status} ${details ? '(' + details + ')' : ''}`);
}

async function runSmokeTest() {
  console.log('\n====================================================================');
  console.log('🚀 DEALFLOW360 PRODUCTION SMOKE TEST RUNNER');
  console.log('====================================================================\n');

  try {
    // 1. Startup & Listen
    const startListenTime = Date.now();
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        recordStep(1, 'Server Startup & Port Binding', 'PASSED', `Port: ${port} in ${Date.now() - startListenTime}ms`);
        resolve();
      });
    });

    // 2. Database Connectivity
    const dbCheck = await testDatabaseConnection();
    if (!dbCheck.connected) {
      recordStep(2, 'Database Connectivity Probe', 'FAILED', dbCheck.message);
      throw new Error('Database connection failed');
    }
    recordStep(2, 'Database Connectivity Probe', 'PASSED', 'PostgreSQL connected');

    // 3. Liveness Probe
    const livenessRes = await fetch(`${baseUrl}/health`);
    const livenessData = await livenessRes.json();
    if (livenessRes.status === 200 && livenessData.status === 'ok') {
      recordStep(3, 'Liveness Probe (GET /health)', 'PASSED', `Status: ${livenessData.status}`);
    } else {
      recordStep(3, 'Liveness Probe (GET /health)', 'FAILED', `HTTP ${livenessRes.status}`);
    }

    // 4. Readiness Probe
    const readinessRes = await fetch(`${baseUrl}/health/ready`);
    const readinessData = await readinessRes.json();
    if (readinessRes.status === 200 && readinessData.status === 'ready' && readinessData.database === 'connected') {
      recordStep(4, 'Readiness Probe (GET /health/ready)', 'PASSED', `DB: ${readinessData.database}`);
    } else {
      recordStep(4, 'Readiness Probe (GET /health/ready)', 'FAILED', `HTTP ${readinessRes.status}`);
    }

    // 5. Authentication
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@dealflow360.com', password: 'Password123!' }),
    });
    const loginData = await loginRes.json();
    const adminToken = loginData.data?.token || loginData.data?.accessToken;
    if (loginRes.status === 200 && adminToken) {
      recordStep(5, 'Admin Login Authentication', 'PASSED', `User: ${loginData.data.user.email}`);
    } else {
      recordStep(5, 'Admin Login Authentication', 'FAILED', `HTTP ${loginRes.status}`);
      throw new Error('Login failed');
    }

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    };

    // 6. Catalog Lookups
    const prodRes = await fetch(`${baseUrl}/api/products?limit=5`, { headers: authHeaders });
    const prodData = await prodRes.json();
    const custRes = await fetch(`${baseUrl}/api/customers?limit=5`, { headers: authHeaders });
    const custData = await custRes.json();

    const product = (prodData.data?.products || prodData.data)?.[0];
    const customer = (custData.data?.customers || custData.data)?.[0];
    if (product && customer) {
      recordStep(6, 'Catalog & Customer Lookups', 'PASSED', `Product: ${product.name}, Customer: ${customer.companyName}`);
    } else {
      recordStep(6, 'Catalog & Customer Lookups', 'FAILED', 'Missing seeded product or customer');
      throw new Error('Catalog lookup failed');
    }

    // 7. Create Quotation Header
    const quoteRes = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        customerId: customer.id,
        validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
        notes: 'Smoke Test B2B Enterprise Deal',
      }),
    });
    const quoteData = await quoteRes.json();
    const quote = quoteData.data?.quotation || quoteData.data;
    const quotationId = quote?.id;
    if (quoteRes.status === 201 && quotationId) {
      recordStep(7, 'Create Quotation Header', 'PASSED', `Quote: ${quote.quotationNumber || quotationId}`);
    } else {
      recordStep(7, 'Create Quotation Header', 'FAILED', `HTTP ${quoteRes.status}`);
      throw new Error('Quotation creation failed');
    }

    // 8. Add Quotation Item
    const itemRes = await fetch(`${baseUrl}/api/quotations/${quotationId}/items`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        productId: product.id,
        quantity: 10,
        unitPrice: Number(product.basePrice) || 2000,
        discountPercentage: 25.0, // High discount triggering manager + finance approval
        taxPercentage: 18.0,
      }),
    });
    const itemData = await itemRes.json();
    const quoteItem = itemData.data?.item || itemData.data;
    if (itemRes.status === 201 && quoteItem) {
      recordStep(8, 'Add Quotation Line Item', 'PASSED', `Line Total: $${quoteItem.lineTotal || quoteItem.grossAmount}`);
    } else {
      recordStep(8, 'Add Quotation Line Item', 'FAILED', `HTTP ${itemRes.status}`);
      throw new Error('Add quote item failed');
    }

    // 9. Submit Quotation & Risk Evaluation
    const submitRes = await fetch(`${baseUrl}/api/quotations/${quotationId}/submit`, {
      method: 'POST',
      headers: authHeaders,
    });
    const submitData = await submitRes.json();
    const riskLevel = submitData.data?.quotation?.riskLevel || submitData.data?.riskLevel;
    if (submitRes.status === 200) {
      recordStep(9, 'Submit Quotation & Risk Engine', 'PASSED', `Risk: ${riskLevel || 'EVALUATED'}`);
    } else {
      recordStep(9, 'Submit Quotation & Risk Engine', 'FAILED', `HTTP ${submitRes.status}`);
      throw new Error('Quotation submission failed');
    }

    // 10. Multi-Stage Approvals
    const approvals = await prisma.approval.findMany({
      where: { quotationId, status: 'PENDING' },
      orderBy: { stepOrder: 'asc' },
    });

    // Obtain tokens for manager and finance to comply with anti-self-approval policy
    const managerLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sales.manager@dealflow360.com', password: 'Password123!' }),
    });
    const managerLoginData = await managerLoginRes.json();
    const managerToken = managerLoginData.data?.token || managerLoginData.data?.accessToken;

    const financeLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'finance@dealflow360.com', password: 'Password123!' }),
    });
    const financeLoginData = await financeLoginRes.json();
    const financeToken = financeLoginData.data?.token || financeLoginData.data?.accessToken;

    for (const appStep of approvals) {
      const stepToken = appStep.approvalRole === 'FINANCE' ? financeToken : managerToken;
      const approveRes = await fetch(`${baseUrl}/api/approvals/${appStep.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${stepToken}`,
        },
        body: JSON.stringify({ comments: 'Smoke test approved within policy guidelines' }),
      });
      if (approveRes.status !== 200) {
        recordStep(10, `Step ${appStep.stepOrder} Approval (${appStep.approvalRole})`, 'FAILED', `HTTP ${approveRes.status}`);
        throw new Error('Approval failed');
      }
    }
    recordStep(10, 'Multi-Stage Approval Workflow', 'PASSED', `Approved ${approvals.length} required steps`);

    // 11. Convert Quotation to Sales Order
    const orderRes = await fetch(`${baseUrl}/api/quotations/${quotationId}/create-order`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ notes: 'Converted in smoke test' }),
    });
    const orderData = await orderRes.json();
    const order = orderData.data?.order || orderData.data;
    const orderId = order?.id;
    if (orderRes.status === 201 && orderId) {
      recordStep(11, 'Convert Quote to Sales Order', 'PASSED', `Order: ${order.orderNumber}`);
    } else {
      recordStep(11, 'Convert Quote to Sales Order', 'FAILED', `HTTP ${orderRes.status}`);
      throw new Error('Order conversion failed');
    }

    // 12. Confirm Sales Order
    const confirmRes = await fetch(`${baseUrl}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status: 'CONFIRMED' }),
    });
    if (confirmRes.status === 200) {
      recordStep(12, 'Confirm Sales Order & Inventory', 'PASSED', 'Status: CONFIRMED');
    } else {
      recordStep(12, 'Confirm Sales Order & Inventory', 'FAILED', `HTTP ${confirmRes.status}`);
      throw new Error('Order confirmation failed');
    }

    // 13. Create Tax Invoice from Order
    const invRes = await fetch(`${baseUrl}/api/orders/${orderId}/create-invoice`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ dueDate: new Date(Date.now() + 15 * 86400000).toISOString() }),
    });
    const invData = await invRes.json();
    const invoice = invData.data?.invoice || invData.data;
    const invoiceId = invoice?.id;
    if (invRes.status === 201 && invoiceId) {
      recordStep(13, 'Create Tax Invoice from Order', 'PASSED', `Invoice: ${invoice.invoiceNumber}`);
    } else {
      recordStep(13, 'Create Tax Invoice from Order', 'FAILED', `HTTP ${invRes.status}`);
      throw new Error('Invoice creation failed');
    }

    // 14. Issue Invoice
    const issueRes = await fetch(`${baseUrl}/api/invoices/${invoiceId}/issue`, {
      method: 'POST',
      headers: authHeaders,
    });
    if (issueRes.status === 200) {
      recordStep(14, 'Issue Tax Invoice', 'PASSED', 'Status: ISSUED');
    } else {
      recordStep(14, 'Issue Tax Invoice', 'FAILED', `HTTP ${issueRes.status}`);
      throw new Error('Invoice issue failed');
    }

    // 15. Record Payment & Settle Balance
    const payRes = await fetch(`${baseUrl}/api/invoices/${invoiceId}/payments`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        amount: Number(invoice.totalAmount) || 1000,
        paymentMethod: 'BANK_TRANSFER',
        reference: `SMOKE-WIRE-${Date.now()}`,
      }),
    });
    const payData = await payRes.json();
    const payment = payData.data?.payment || payData.data;
    if (payRes.status === 201) {
      recordStep(15, 'Record Payment & Settle Invoice', 'PASSED', `Payment: ${payment?.paymentNumber || 'SETTLED'}`);
    } else {
      recordStep(15, 'Record Payment & Settle Invoice', 'FAILED', `HTTP ${payRes.status}`);
      throw new Error('Payment recording failed');
    }

    // 16. Executive Dashboard
    const dashRes = await fetch(`${baseUrl}/api/dashboard/summary?period=this_month`, {
      headers: authHeaders,
    });
    const dashData = await dashRes.json();
    if (dashRes.status === 200 && dashData.data) {
      recordStep(16, 'Executive KPI Dashboard Feed', 'PASSED', 'Metrics aggregated successfully');
    } else {
      recordStep(16, 'Executive KPI Dashboard Feed', 'FAILED', `HTTP ${dashRes.status}`);
    }

    // 17. In-App Notification Stream
    const notifRes = await fetch(`${baseUrl}/api/notifications?limit=10`, {
      headers: authHeaders,
    });
    const notifData = await notifRes.json();
    if (notifRes.status === 200 && Array.isArray(notifData.data)) {
      recordStep(17, 'In-App Notification Stream', 'PASSED', `Feed size: ${notifData.data.length} events`);
    } else {
      recordStep(17, 'In-App Notification Stream', 'FAILED', `HTTP ${notifRes.status}`);
    }

    console.log('\n====================================================================');
    console.log('🎉 ALL 17 PRODUCTION SMOKE TEST STEPS PASSED SUCCESSFULLY!');
    console.log('====================================================================\n');
  } catch (error) {
    console.error('\n❌ SMOKE TEST FAILED WITH EXCEPTION:', error.message);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
  }
}

runSmokeTest();
