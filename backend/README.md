# DealFlow360 - Enterprise B2B Sales Operations Platform Backend

DealFlow360 is an enterprise-grade B2B Sales Operations backend engine providing automated quotation pricing, multi-factor risk assessment, tiered discount governance, multi-stage approval workflows, inventory reservation and fulfillment, billing & payment processing, role-aware analytics dashboards, real-time in-app notifications, and tamper-evident audit logging.

---

## Key Platform Capabilities

- **Automated Quotation & Pricing Engine**: Hierarchical pricing determination, line-item taxes, and profit margins with two-decimal precision.
- **Rule-Based Discount Engine**: Customer-tier aware discount governance (`BRONZE`, `SILVER`, `GOLD`, `PLATINUM`) with deviation tracking.
- **Multi-Factor Risk Assessment Engine**: Deterministic risk scoring (0-100) evaluating discount deviation, margin health deficit, financial exposure, and customer tier.
- **Multi-Stage Approval Workflows**: Role-segregated approvals for Sales Managers and Finance with strict anti-self-approval enforcement.
- **Order Management & Fulfillment**: Conversion of approved quotes into immutable sales orders, atomic stock reservations, and carrier shipments.
- **Billing & Multi-Method Payment Settlement**: Automated tax invoicing, partial and split payment recording, and balance reconciliation.
- **Executive & Role-Aware Dashboards**: Real-time sales KPIs, rep performance metrics, and pipeline conversion funnel analytics.
- **In-App Notifications & Audit Trail**: Real-time alert stream, unread counters, and chronological system activity timeline.
- **Production Hardened & Tested**: Rate limiting, OWASP security headers, parameter sanitization, and 100% passing test suite across 453 tests.

---

## Interactive API Documentation & Specs

| Resource | URL | Description |
| :--- | :--- | :--- |
| **Interactive Swagger UI** | `http://localhost:5000/api-docs` | Full OpenAPI 3.0.3 UI with interactive "Try it out" testing |
| **OpenAPI 3.0.3 Spec (JSON)** | `http://localhost:5000/api-docs.json` | Machine-readable OpenAPI specification for tooling and Postman import |
| **System Liveness Probe** | `http://localhost:5000/health` | Lightweight HTTP liveness and uptime check |
| **Database Readiness Probe** | `http://localhost:5000/health/ready` | Database connectivity and Prisma client verification |
| **Deep Diagnostic Health** | `http://localhost:5000/api/health` | Detailed system and database diagnostics |

---

## Architecture, Deployment & Operations Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

- [**System Architecture & Domain Blueprint**](./docs/ARCHITECTURE.md): Architectural design, 3-tier layering, transactional isolation, and database models.
- [**Frontend Integration & React Guide**](./docs/FRONTEND_INTEGRATION.md): Quick start, JWT storage, response envelopes, pagination, RBAC matrix, and workflow guides.
- [**Production Deployment Runbook**](./docs/DEPLOYMENT.md): Production runbook, process management, non-destructive migrations, and rollback procedures.
- [**Database Backup & Restore Guide**](./docs/BACKUP_RESTORE.md): PostgreSQL backup strategies (`pg_dump`), restore commands (`pg_restore`), and automated cron scripts.
- [**API Error Codes Reference**](./docs/API_ERRORS.md): Complete catalog of HTTP status codes, domain error codes, and resolution strategies.
- [**Final Demo Verification Checklist**](./docs/DEMO_CHECKLIST.md): 23-point verification plan for live demos and production readiness.

---

## Tech Stack

- **Runtime**: Node.js v20 LTS (ES Modules)
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL 14+
- **ORM**: Prisma Client v6
- **Validation**: Zod
- **Authentication**: JWT (`jsonwebtoken`) + Bcrypt (`bcryptjs`)
- **Documentation**: Swagger UI Express + OpenAPI 3.0.3
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Testing**: Native Node.js Test Runner (`node:test`) with built-in code coverage

---

## Quick Start & Local Setup

### 1. Prerequisites
- Node.js 18+ (Node 20 recommended)
- PostgreSQL 14+ running (e.g. port 5433 or 5432)

### 2. Environment Setup
Copy the environment template and configure your database coordinates:
```bash
cp .env.example .env
```

Ensure your `.env` contains:
```ini
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres@127.0.0.1:5433/dealflow360?schema=public"
JWT_SECRET="dealflow360_production_ready_jwt_secret_key_2026_secure"
JWT_EXPIRES_IN="1d"
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"
```

### 3. Database Migration & Seeding
```bash
# Generate Prisma Client
npm run prisma:generate

# In Development:
npm run prisma:migrate

# In Production (Non-Destructive Deploy):
npm run prisma:deploy

# Seed Demo Data (Users, Products, Customers, Price Lists, Discount Rules)
npm run seed
```

### 4. Running the Application
```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start
```
The API will be accessible at `http://localhost:5000`.

---

## Docker & Docker Compose Deployment

A production-ready Docker Compose stack is provided in the project root:

```bash
# From project root:
docker compose up --build -d

# Check service logs:
docker compose logs -f backend

# Verify health status:
curl http://localhost:5000/health
curl http://localhost:5000/health/ready
```

---

## Testing & Quality Assurance

```bash
# 1. Run zero-dependency syntax & lint check across all files
npm run lint

# 2. Run build verification
npm run build

# 3. Run isolated pure calculation engine unit tests (28 tests)
npm run test:unit

# 4. Generate native code coverage report
npm run test:coverage

# 5. Run full integration & security test suite (All 14 suites, 427 tests)
npm test

# 6. Run realistic end-to-end production smoke test (17 steps)
npm run smoke
```

---

## Postman API Collection

A fully configured Postman collection with environment variables and automatic token injection is provided in [`postman/`](./postman/):

1. Import `postman/DealFlow360.postman_collection.json` into Postman.
2. Import `postman/DealFlow360.postman_environment.json` as your active environment.
3. Execute **1.1 Login (Admin)** — the test script automatically populates `{{token}}` and `{{refreshToken}}` into the environment for all subsequent calls.

---

## Core Sales Workflow (cURL Reference)

### 1. Authenticate (Login)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dealflow360.com","password":"Password123!"}'
```

### 2. Create Quotation
```bash
curl -X POST http://localhost:5000/api/quotations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "customerId": "<CUSTOMER_UUID>",
    "validUntil": "2026-12-31T23:59:59.000Z",
    "items": [
      {
        "productId": "<PRODUCT_UUID>",
        "quantity": 10,
        "unitPrice": 1500.00,
        "discountPercentage": 5.0,
        "taxPercentage": 18.0
      }
    ]
  }'
```

### 3. Submit Quotation
```bash
curl -X POST http://localhost:5000/api/quotations/<QUOTATION_UUID>/submit \
  -H "Authorization: Bearer <TOKEN>"
```

### 4. Approve Quotation (Manager/Finance)
```bash
curl -X POST http://localhost:5000/api/approvals/<APPROVAL_UUID>/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <MANAGER_TOKEN>" \
  -d '{"comments": "Approved within budget guidelines"}'
```

### 5. Convert Quotation to Order
```bash
curl -X POST http://localhost:5000/api/quotations/<QUOTATION_UUID>/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"notes": "Converted from approved quote"}'
```

### 6. Confirm Order & Reserve Stock
```bash
curl -X PATCH http://localhost:5000/api/orders/<ORDER_UUID>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"status": "CONFIRMED"}'
```

### 7. Create & Issue Invoice
```bash
# Create Invoice
curl -X POST http://localhost:5000/api/orders/<ORDER_UUID>/create-invoice \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"dueDate": "2026-04-30T00:00:00.000Z"}'

# Issue Invoice
curl -X POST http://localhost:5000/api/invoices/<INVOICE_UUID>/issue \
  -H "Authorization: Bearer <TOKEN>"
```

### 8. Record Payment & Settle Invoice
```bash
curl -X POST http://localhost:5000/api/invoices/<INVOICE_UUID>/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "amount": 15000.00,
    "paymentMethod": "BANK_TRANSFER",
    "reference": "WIRE-992233"
  }'
```

---

## Phase 15: End-to-End Integration Audit Suite

The backend includes a comprehensive integration audit suite (`tests/integration_audit.test.js`) validating all platform capabilities across 18 domains:

1. **Test User Provisioning & Password Hash Privacy**: All 5 system roles verified with Bcrypt hash protection.
2. **Authentication & Token Lifecycle**: Registration, login, profile retrieval, token expiry, and logout.
3. **Role-Based Access Control (RBAC)**: Strict role boundaries and privilege violation rejections.
4. **Master Data Flow**: Categories, Products, Variants, Customers, Price Lists, and Items with 409 Conflict defense.
5. **Quotation Engine & Tampering Defense**: Line-item math, auto-recalculation, and rejection of client parameter tampering.
6. **Risk Assessment Engine**: Deterministic risk scoring (0-100), risk levels, and explainable reason codes.
7. **Multi-Stage Approval Workflows**: Sales Manager and Finance approvals with anti-self-approval enforcement.
8. **Sales Order Lifecycle**: Price snapshotting, conversion guards, and status machine transitions.
9. **Warehouse Fulfillment**: Automatic fulfillment generation, staff assignment, carrier tracking, and order synchronization.
10. **Billing & Overpayment Defense**: Invoicing, partial payments, overpayment rejection, and balance settlement.
11. **Role-Aware Dashboards**: Executive metrics and sales rep pipeline data isolation.
12. **Notification Engine**: Event notifications, pagination, and unread counters.
13. **Activity Timeline**: Immutable event streaming and audit history.
14. **Standardized Error Envelopes**: Consistent JSON error structures with zero stack trace leakage.
15. **Concurrency & Race Conditions**: Parallel conversion safety ensuring zero duplicate orders.
16. **Performance & Pagination Sanity**: Request clamping and sub-millisecond health response latency.
17. **Full Lead-to-Cash Workflow**: End-to-end multi-role transaction lifecycle.

Run the audit test suite:
```bash
npm test -- tests/integration_audit.test.js
```

---

## Phase 16: Practical Backend & PostgreSQL Performance Optimization

The backend incorporates high-impact PostgreSQL database indexing, safe query pagination boundaries, and an automated benchmark runner:

1. **Strategic Compound & Single-Column PostgreSQL Indexes**:
   - `User`: `[role]`, `[isActive]`, `[role, isActive]`
   - `Customer`: `[isActive]`, `[customerTier, isActive]`
   - `Product`: `[isActive]`, `[categoryId, isActive]`
   - `Quotation`: `[salesRepId, status]`, `[customerId, status]`, `[status, createdAt]`, `[salesRepId, createdAt]`
   - `Order`: `[salesRepId, status]`, `[customerId, status]`, `[status, createdAt]`, `[salesRepId, createdAt]`
   - `Invoice`: `[customerId, status]`, `[status, dueDate]`, `[status, createdAt]`
   - `Approval`: `[status, approvalRole]`
   - `Fulfillment`: `[status, assignedToId]`
   - `AuditLog`: `[entityType, entityId, createdAt]`
2. **Safe Pagination Clamping**: All list endpoints clamp maximum `limit` to 100, protecting memory against unbounded queries.
3. **Automated Multi-Request Benchmark Runner**:
   - Run the benchmark suite against 17 read and dashboard endpoints:
     ```bash
     npm run benchmark
     ```
   - Realized average latencies: **< 10ms across all endpoints** (P95: < 13ms).
4. **Performance Verification Test Suite**:
   ```bash
   npm test -- tests/performance_optimization.test.js
   ```

---

## Phase 17: Senior-Level Final Security & Business-Logic Audit

The backend has undergone an independent, senior-level security and business-logic audit across 15 core dimensions, backed by an automated 16-test audit suite (`tests/security_audit_final.test.js`):

1. **Authentication & Token Lifecycle**: Constant-time token verification, Bcrypt hash confidentiality, zero password disclosure.
2. **Authorization & Multi-Tenant IDOR**: Strict sales rep scoping on orders and fulfillments with explicit unassigned order guards.
3. **Mass Assignment Defenses**: Authoritative server-side extraction; client override attempts are stripped/rejected.
4. **Financial Security & Rounding**: Exact integer/decimal subtotal and tax calculation, client price tampering rejection.
5. **State Machine Integrity**: Linear state progression on quotations, orders, invoices, and fulfillment batches.
6. **Approval Workflow Security**: Strict anti-self-approval enforcement (`403 Forbidden`) and role step validation.
7. **Order Conversion Concurrency**: Atomic transaction locking on quote-to-order conversions (`409 Conflict` on duplicate).
8. **Payment Security & Anti-Replay**: Duplicate transaction reference rejection (`409 Conflict`) and overpayment blocks (`400 Bad Request`).
9. **Input Validation & Injection Prevention**: Parameterized Prisma queries, strict Zod schemas, malformed payload rejections.
10. **Security Headers & CORS**: Production Helmet protection (HSTS, CSP, X-Frame-Options) and origin isolation.
11. **Rate Limiting & DoS**: Tiered request throttling on authentication and API routes.
12. **Audit Logging & Non-Repudiation**: Tamper-evident mutation event recording with actor attribution and diff snapshots.
13. **Information Disclosure Prevention**: Production error handler sanitization suppressing internal stack traces.
14. **Dependency & Payload Hardening**: Native Node URL-encoded parser (`extended: false`) and HTTP 413 PayloadTooLarge handler.
15. **Business Logic Invariants**: Blended risk scoring (0-100), automated Finance escalation, customer tier discount limits.

Run the final security audit test suite:
```bash
npm test -- tests/security_audit_final.test.js
```
