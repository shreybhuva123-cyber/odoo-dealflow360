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
- **Production Hardened & Tested**: Rate limiting, OWASP security headers, parameter sanitization, and 100% passing test suite across 427 tests.

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
