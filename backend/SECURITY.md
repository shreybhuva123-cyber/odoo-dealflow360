# DealFlow360 Security Architecture & Production Hardening

## 1. Security Overview & Threat Model

DealFlow360 is an enterprise B2B sales operations backend handling sensitive commercial data, including customer profiles, pricing rules, approval workflows, invoices, and financial transactions.

The Phase 12 Security Hardening initiative establishes defense-in-depth protection across all architectural layers without introducing brittle external dependencies:

```
Client Request
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Zero-Dependency Security Headers (HSTS, CSP, X-Frame...) │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Parameter Sanitizer & HPP Defense (Null Byte, Array Flat)│
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. In-Memory Sliding-Window Rate Limiter (Auth & General)   │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Route Parameter Guards (UUID format regex validation)    │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. JWT Authentication (HS256 pinned, isActive verification) │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Role-Based Access Control (RBAC middleware)              │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Input Validation & Mass Assignment Guard (Zod .strict()) │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Service-Layer IDOR & Multi-Tenancy Ownership Validation   │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. Parameterized Query Layer (Prisma ORM SQLi Protection)   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication & Token Security

- **Algorithm Hardening**: JWT generation (`jwt.sign`) and verification (`jwt.verify`) explicitly enforce `algorithm: 'HS256'` and `algorithms: ['HS256']`. Tokens using algorithm `none` or unexpected asymmetric keys are rejected immediately with `401 Unauthorized`.
- **Secret Hygiene**: In production, application startup aborts if `JWT_SECRET` is missing or shorter than 32 characters.
- **Deactivated Account Defense**: Every authenticated request verifies the user's `isActive` flag in PostgreSQL; deactivated accounts are denied with `403 Forbidden`.
- **Password Security**: Passwords are hashed using `bcryptjs` with a salt work factor of 10. Passwords and hash digests are never returned in API responses or logged in errors.

---

## 3. Role-Based Access Control (RBAC) Matrix

DealFlow360 enforces 5 distinct roles:
1. `ADMIN`: Global administrative access across all resources.
2. `SALES_MANAGER`: Sales oversight, quotation review, commercial discount approvals, and analytics.
3. `SALES_REP`: Quotation authoring, client relationship management, and order conversion for owned records.
4. `FINANCE`: Margin review, commercial approvals, invoice issuance, and payment reconciliations.
5. `OPERATIONS`: Order status tracking, shipment fulfillment, and logistics dispatch.

| Feature Area | Endpoint / Action | ADMIN | SALES_MANAGER | SALES_REP | FINANCE | OPERATIONS |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Auth / Users** | Create staff users (`POST /api/auth/users`) | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Discount Rules**| Create/Update discount rules | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Quotations** | Create quotation | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Quotations** | Update / Cancel quotation | ✅ | ✅ | ✅ (Own) | ❌ | ❌ |
| **Approvals** | Approve discount (Step 1) | ✅ | ✅ | ❌ (Anti-Self) | ❌ | ❌ |
| **Approvals** | Approve discount (Step 2) | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Orders** | Convert quote to order | ✅ | ✅ | ✅ (Own) | ❌ | ❌ |
| **Orders** | Update fulfillment status | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Invoices** | Create / Issue invoice | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Payments** | Record payment | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Analytics** | View executive dashboards | ✅ | ✅ | ❌ (Scoped) | ✅ | ❌ |
| **Notifications**| Read / delete notifications | ✅ (Own) | ✅ (Own) | ✅ (Own) | ✅ (Own) | ✅ (Own) |

---

## 4. Insecure Direct Object Reference (IDOR) & Tenancy Isolation

1. **Quotation Isolation**: `quotationService` verifies `quotation.salesRepId === user.id` for all read, update, and cancellation operations when requested by `SALES_REP`. Unauthorized attempts throw `403 Forbidden`.
2. **Order Scoping**: Orders inherit ownership from quotations. Sales reps can only view orders assigned to them (`where.salesRepId = user.id`).
3. **Invoice Scoping**: Sales reps can only view invoices whose underlying order matches their user ID (`invoice.order.salesRepId === user.id`).
4. **Notification Ownership**: Notifications strictly belong to the recipient (`notification.userId === user.id`). Cross-user mark-as-read or deletion triggers `403 Forbidden`.

---

## 5. Mass Assignment & Request Tampering Prevention

- **Public Registration Guard**: Public registration via `POST /api/auth/register` hardcodes the user role to `SALES_REP`. Any attempt to pass `role: 'ADMIN'` is overridden.
- **Strict Zod Schemas**: Update schemas (e.g. `updateQuotationSchema`, `updateInvoiceSchema`, `updatePaymentSchema`) use Zod's `.strict()` modifier. Attempting to supply unapproved keys (such as `status`, `totalAmount`, `riskScore`, or `paidAmount`) results in an immediate `400 Bad Request` validation error.
- **Calculated Totals**: Order, Invoice, and Quotation totals are calculated exclusively by deterministic server-side engines. User-supplied totals in request bodies are ignored or rejected.

---

## 6. Input Validation & Injection Defenses

- **Route Parameter UUID Guards**: All UUID route parameters (`:id`, `:orderId`, `:invoiceId`, `:customerId`) are pre-validated against standard RFC4122 regex via Express router parameter handlers. Path traversal strings (e.g. `../../etc/passwd`) and non-UUID inputs return a `400 Bad Request` before invoking controller or database logic.
- **HTTP Parameter Pollution (HPP)**: The custom parameter sanitizer detects repeated query array parameters (e.g. `?search=1&search=2`) and collapses them to the last scalar value.
- **Null Byte Stripping**: All string query parameters are stripped of null bytes (`\0`) to eliminate null-byte truncation attacks.
- **Search Length Bounds**: Search parameters are bounded to 100 characters to prevent regex/string parsing denial-of-service.
- **SQL Injection Defense**: All database queries are executed using Prisma ORM with parameterized SQL queries. Raw SQL string concatenation is strictly prohibited.

---

## 7. Rate Limiting Protection

Implemented via a zero-dependency in-memory sliding-window rate limiter:
- **Authentication Endpoints** (`/api/auth/login`, `/api/auth/register`):
  - 20 requests per 15 minutes per IP.
  - Returns `429 Too Many Requests` with `Retry-After` header and structured JSON error payload.
- **General API Endpoints** (`/api/*`):
  - 500 requests per 15 minutes per IP.
- **Memory Management**: Stale client records are purged automatically every 5 minutes via unref'd timer.

---

## 8. Security Headers

The zero-dependency security headers middleware sets the following protective headers on every response:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 0` (modern standard disabling legacy buggy XSS filters)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` (active when `NODE_ENV === 'production'`)
- `X-Powered-By`: explicitly stripped to hide Express server fingerprinting.

---

## 9. Business Logic & Workflow Safeguards

1. **Anti-Self-Approval**: `approvalService.validateSelfApproval()` guarantees a sales representative cannot approve their own quotation even if they hold elevated roles.
2. **Order Conversion Concurrency & Idempotency**: Quotations can be converted to an order exactly once. Competing concurrent requests yield `409 Conflict`.
3. **Fulfillment State Machine**: Order status transitions follow strict acyclic rules (`CONFIRMED` ➔ `PROCESSING` ➔ `READY_FOR_FULFILLMENT` ➔ `SHIPPED` ➔ `DELIVERED`). Illegal skips return `400 Bad Request`.
4. **Financial Overpayment Guard**: Payment recordings verify that the payment amount does not exceed the remaining outstanding invoice balance. Overpayment attempts return `400 Bad Request`.

---

## 10. Automated Security Test Suite

The security test suite (`tests/security.test.js`) executes 51 automated security verifications covering:
1. Authentication token edge cases (missing, invalid format, expired, malformed, 'none' algorithm, wrong secret, deactivated user).
2. Role-Based Access Control on sensitive routes.
3. IDOR and tenant data isolation across Quotations, Orders, Invoices, and Notifications.
4. Mass assignment and privilege escalation defense.
5. Input boundary and parameter pollution defenses.
6. Workflow state machine and financial balance integrity.
7. Security headers and server fingerprint suppression.
8. Rate limiting under rapid burst traffic.
9. System health endpoints (`/health` and `/api/health`).
10. Full multi-role end-to-end sales workflow.

---

## 11. Vulnerability Reporting & Responsible Disclosure

If you discover a security issue or vulnerability in DealFlow360, please report it responsibly:
- **Email**: security@dealflow360.com
- **Policy**: We ask that you do not publicly disclose details until our team has had an opportunity to address and release a patch.
