# DealFlow360 Final Live Demo Verification Checklist

This 23-step checklist verifies the entire B2B sales lifecycle and system health for client presentations and production release testing.

---

## Part 1: System Readiness & Health Probes
- [x] **Step 1: Database Running**: PostgreSQL daemon active on port 5433 (or configured port).
- [x] **Step 2: Liveness Probe**: `GET /health` returns `200 OK` with `status: "ok"` and server uptime.
- [x] **Step 3: Deep Health Check**: `GET /api/health` verifies PostgreSQL connection and Prisma client readiness.
- [x] **Step 4: Interactive API Docs**: `GET /api-docs` renders Swagger UI documentation without CSP errors.
- [x] **Step 5: OpenAPI Spec JSON**: `GET /api-docs.json` returns full OpenAPI 3.0.3 specification.

---

## Part 2: Authentication & RBAC Verification
- [x] **Step 6: Admin Login**: `POST /api/auth/login` with `admin@dealflow360.com` returns JWT tokens.
- [x] **Step 7: Sales Rep Login**: Login as `rep@dealflow360.com` to verify role assignment.
- [x] **Step 8: Profile Verification**: `GET /api/auth/me` verifies authenticated claims and strips password hash.
- [x] **Step 9: RBAC Enforcement**: Verify Sales Rep cannot access Finance or Admin-only endpoints (`403 Forbidden`).

---

## Part 3: Quotation, Pricing & Margin Calculations
- [x] **Step 10: Product & Customer Catalog**: Verify `GET /api/products` and `GET /api/customers` return paginated records.
- [x] **Step 11: Create Draft Quotation**: Create quotation with multiple line items; verify automated calculation of gross, net, tax, total, and profit margins.
- [x] **Step 12: Discount Rule Compliance**: Verify discount within customer tier limit evaluates to zero deviation.
- [x] **Step 13: High Discount Submission**: Submit quote with excessive discount (e.g. 25%); verify Risk Engine calculates penalty score, sets `HIGH` risk, and triggers Manager and Finance approvals.
- [x] **Step 14: Anti-Self-Approval**: Verify sales rep submitting the quote is rejected if attempting self-approval.

---

## Part 4: Approval Workflow
- [x] **Step 15: Manager Approval**: Login as `manager@dealflow360.com`, review pending ticket, and execute approval.
- [x] **Step 16: Finance Approval**: Login as `finance@dealflow360.com`, execute final step approval. Verify quotation status becomes `APPROVED`.

---

## Part 5: Sales Order & Fulfillment
- [x] **Step 17: Convert to Order**: Execute `POST /api/quotations/{id}/convert-to-order`; verify immutable order creation.
- [x] **Step 18: Order Confirmation**: Confirm order; verify inventory reservation.
- [x] **Step 19: Shipment & Delivery**: Create shipment, dispatch delivery (deducts stock), and mark delivered.

---

## Part 6: Invoicing, Payments & Settlement
- [x] **Step 20: Invoice Generation**: Generate invoice from order; verify subtotal, tax, and balance match order totals.
- [x] **Step 21: Issue & Settle Payment**: Issue invoice; record payment via `POST /api/payments`. Verify invoice transitions to `PAID`.

---

## Part 7: Analytics & Notifications
- [x] **Step 22: Role-Aware Dashboard**: `GET /api/dashboard/overview` reflects newly closed revenue and pipeline metrics.
- [x] **Step 23: In-App Notifications & Audit Trail**: `GET /api/notifications` shows real-time alert feed; `GET /api/activity` displays full chronological audit trail.
