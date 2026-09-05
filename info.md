# Project Info & Documentation

## 1. Problem Statement
DealFlow360 is an intelligent B2B Sales Operations platform designed to streamline how sales teams create quotes, price products, apply discount rules, manage inventory fulfillment across multiple warehouses, and detect pricing anomalies. It automates quote approvals and multi-tier pricing so sales reps can close deals faster without manual back-and-forth delays or unauthorized discounts.

## 2. Tech Stack
- **Node.js** – A JavaScript runtime environment that lets us run code on the backend server outside of a web browser.
- **Express.js** – A lightweight web application framework for Node.js used to define API routes and handle HTTP requests and responses.
- **PostgreSQL** – A powerful, reliable relational database used to store persistent business data like users, quotes, products, and logs.
- **Prisma ORM** – A modern Object-Relational Mapper that lets Node.js talk to PostgreSQL safely with typed queries and automated database migrations instead of manual SQL scripts.
- **Zod** – A schema declaration and validation library used to ensure incoming request data conforms to expected formats before processing.
- **JWT (jsonwebtoken)** – A token format used to securely transmit identity claims between frontend and backend for authentication.
- **bcryptjs** – A password-hashing library used to securely encrypt user passwords before storing them in the database.
- **CORS** – A security middleware that allows the React frontend on a different port or domain to safely request data from this API.
- **Morgan** – An HTTP request logger middleware that prints incoming API requests and execution times to the server console.
- **Nodemon** – A development utility that automatically restarts the Node server whenever code changes are saved.
- **dotenv** – A module that loads environment variables from a `.env` file into `process.env`.

## 3. Project Structure
```text
odoo-dealflow360/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js            # Central environment variable loading and defaults
│   │   │   ├── prisma.js         # Prisma client instance and database connection test
│   │   │   ├── corsOptions.js    # Dynamic CORS origin validator for React frontend
│   │   │   └── riskConstants.js  # Centralized risk scoring weights, thresholds, and reason codes
│   │   ├── controllers/
│   │   │   ├── authController.js         # Handles registration, login, me, logout, and admin user creation
│   │   │   ├── categoryController.js     # Handles category CRUD and soft-delete safeguards
│   │   │   ├── productController.js      # Handles product CRUD, margin calculations, and variants
│   │   │   ├── customerController.js     # Handles customer CRUD, tier updates, and metrics
│   │   │   ├── priceListController.js    # Handles price list management and price lookup engine
│   │   │   ├── quotationController.js    # Handles quotation lifecycle, items, recalculate, submit, cancel, evaluate-risk
│   │   │   ├── discountRuleController.js # Handles admin discount rule management CRUD
│   │   │   ├── approvalController.js     # Handles approval dashboard, detail, approve, reject, history
│   │   │   ├── orderController.js        # Handles order creation from quote, order CRUD, cancel, status
│   │   │   ├── fulfillmentController.js  # Handles fulfillment tracking, assignment, status transitions
│   │   │   ├── invoiceController.js      # Handles order-to-invoice conversion, invoice CRUD, issue, cancel, recalculate
│   │   │   ├── paymentController.js      # Handles payment recording, cancellation, and payment summary
│   │   │   ├── dashboardController.js    # Handles role-aware dashboard dispatching and KPI metrics
│   │   │   ├── notificationController.js # Handles in-app notifications, preferences, and unread counts
│   │   │   ├── activityController.js     # Handles activity timeline queries and entity activity streams
│   │   │   └── healthController.js       # Handles HTTP request/response for health checks
│   │   ├── routes/
│   │   │   ├── index.js                  # Central router mounting all API sub-routes
│   │   │   ├── authRoutes.js             # Defines authentication endpoints (/api/auth)
│   │   │   ├── categoryRoutes.js         # Defines product category endpoints (/api/categories)
│   │   │   ├── productRoutes.js          # Defines product endpoints (/api/products)
│   │   │   ├── variantRoutes.js          # Defines product variant direct endpoints (/api/variants)
│   │   │   ├── customerRoutes.js         # Defines customer endpoints (/api/customers)
│   │   │   ├── priceListRoutes.js        # Defines price list endpoints (/api/price-lists)
│   │   │   ├── priceListItemRoutes.js    # Defines price list item direct endpoints (/api/price-list-items)
│   │   │   ├── quotationRoutes.js        # Defines quotation endpoints (/api/quotations)
│   │   │   ├── quotationItemRoutes.js    # Defines quotation item endpoints (/api/quotation-items)
│   │   │   ├── discountRuleRoutes.js     # Defines admin discount rule endpoints (/api/discount-rules)
│   │   │   ├── approvalRoutes.js         # Defines approval workflow endpoints (/api/approvals)
│   │   │   ├── orderRoutes.js            # Defines order management endpoints (/api/orders)
│   │   │   ├── fulfillmentRoutes.js      # Defines fulfillment operations endpoints (/api/fulfillments)
│   │   │   ├── invoiceRoutes.js          # Defines invoice endpoints (/api/invoices)
│   │   │   ├── paymentRoutes.js          # Defines payment endpoints (/api/payments)
│   │   │   ├── dashboardRoutes.js        # Defines role-aware dashboard endpoints (/api/dashboard)
│   │   │   ├── notificationRoutes.js     # Defines in-app notification endpoints (/api/notifications)
│   │   │   ├── activityRoutes.js         # Defines activity audit stream endpoints (/api/activity)
│   │   │   ├── healthRoutes.js           # Defines GET /api/health endpoint
│   │   │   └── testRoutes.js             # Development RBAC verification routes (/api/test)
│   │   ├── services/
│   │   │   ├── authService.js            # Business logic for user creation, login, and profile lookup
│   │   │   ├── categoryService.js        # Business logic & DB queries for product categories
│   │   │   ├── productService.js         # Business logic & DB queries for products, variants & margins
│   │   │   ├── customerService.js        # Business logic & DB queries for customers & aggregations
│   │   │   ├── priceListService.js       # Business logic for price lists, quantity breaks & lookup
│   │   │   ├── quotationService.js       # Quotation engine, transactions, margin formulas, submission
│   │   │   ├── discountService.js        # Database-driven discount rule engine, deviation, & admin CRUD
│   │   │   ├── riskService.js            # Deterministic quotation risk engine & approval router
│   │   │   ├── approvalService.js        # Multi-tier approval workflow engine, transactions, anti-tampering
│   │   │   ├── orderService.js           # Order conversion, snapshotting, status machine, concurrency
│   │   │   ├── fulfillmentService.js     # Fulfillment status sync, tracking, operations assignment
│   │   │   ├── invoiceService.js         # Billing engine, financial calculations, invoice lifecycle, overdue job
│   │   │   ├── paymentService.js         # Payment recording, cancellation rollback, overpayment guards
│   │   │   ├── dashboardService.js       # Role-aware dashboard metrics, database aggregations, and AR aging
│   │   │   ├── notificationService.js    # Notification creation, preferences, unread count, pagination
│   │   │   ├── activityService.js        # Activity timeline recording, deduplication, and role filtering
│   │   │   ├── notificationEvents.js     # Domain event hooks (quotes, orders, shipments, invoices, payments)
│   │   │   └── healthService.js          # Business logic for checking system & DB connectivity
│   │   ├── middleware/
│   │   │   ├── authenticateToken.js      # JWT Bearer token verification and active user loading
│   │   │   ├── authorizeRoles.js         # Role-Based Access Control (RBAC) guard middleware
│   │   │   ├── errorHandler.js           # Global centralized error handler (Zod, Prisma, 500)
│   │   │   ├── notFoundHandler.js        # 404 handler for non-existent API routes
│   │   │   └── requestLogger.js          # HTTP request and response time logger (Morgan)
│   │   ├── validators/
│   │   │   ├── index.js                  # Reusable middleware to validate requests against Zod schemas
│   │   │   ├── authValidator.js          # Zod schemas for register, login, and user creation
│   │   │   ├── categoryValidator.js      # Zod schemas for category creation and updates
│   │   │   ├── productValidator.js       # Zod schemas for product and variant validation
│   │   │   ├── customerValidator.js      # Zod schemas for customer creation and updates
│   │   │   ├── priceListValidator.js     # Zod schemas for price list and item validation
│   │   │   ├── quotationValidator.js     # Zod schemas for quotation and item validation
│   │   │   ├── discountRuleValidator.js  # Zod schemas for discount rule creation and updates
│   │   │   ├── approvalValidator.js      # Zod schemas for approval rejection reason and filters
│   │   │   ├── orderValidator.js         # Zod schemas for order status transitions, filters, cancellation
│   │   │   ├── fulfillmentValidator.js   # Zod schemas for fulfillment status, tracking, and assignment
│   │   │   ├── billingValidator.js       # Zod schemas for invoice creation, updates, and payment recording
│   │   │   ├── dashboardValidator.js     # Zod schemas for dashboard period, custom dates, and limit filters
│   │   │   └── notificationValidator.js  # Zod schemas for notifications, preferences, and activity filters
│   │   ├── utils/
│   │   │   ├── apiResponse.js            # Standard JSON success and error response formatters
│   │   │   ├── appError.js               # Operational error class with HTTP status codes
│   │   │   ├── auditLogger.js            # Non-blocking entity audit log recorder
│   │   │   ├── pagination.js             # Database-level pagination helper (skip, take, meta)
│   │   │   ├── dateRangeHelper.js        # Dashboard period calculation and percentage change helper
│   │   │   ├── jwt.js                    # JWT token signing, verification, and user sanitization
│   │   │   ├── password.js               # Bcrypt password hashing and comparison
│   │   │   └── logger.js                 # Structured console logger with timestamps
│   │   ├── app.js                        # Express application configuration and middleware stack
│   │   └── server.js                     # Server startup, port listening, and graceful shutdown
│   ├── prisma/
│   │   ├── schema.prisma             # Complete normalized schema with 33 models & 21 enums
│   │   ├── migrations/               # Automated SQL migration history generated by Prisma
│   │   └── seed.js                   # Idempotent database seed pipeline with realistic demo workflows
│   ├── tests/
│   │   ├── health.test.js            # Unit test for HealthService
│   │   ├── api.test.js               # Integration tests for server, health, 404, and errors
│   │   ├── database.test.js          # Comprehensive relational & constraint verification tests
│   │   ├── auth.test.js              # Authentication, JWT verification, and RBAC test suite
│   │   ├── catalog.test.js           # Product, Category, Variant, Customer & Price List test suite
│   │   ├── quotation.test.js         # Quotation Engine & Item lifecycle test suite (29 tests)
│   │   ├── risk.test.js              # Discount Engine & Risk Scoring test suite (30 tests)
│   │   ├── approval.test.js          # Approval Workflow Engine test suite (41 tests)
│   │   ├── order.test.js             # Order Management & Fulfillment Engine test suite (40 tests)
│   │   ├── billing.test.js           # Billing & Payment Engine test suite (31 tests)
│   │   ├── dashboard.test.js         # Dashboard & Analytics Engine test suite (36 tests)
│   │   └── notification.test.js      # Notification & Activity Engine test suite (31 tests)
│   ├── .env                          # Local environment configuration (ports, secrets, DB URL)
│   ├── .env.example                  # Environment variables template for team members
│   ├── package.json                  # Project dependencies, scripts, and ES Module config
│   └── README.md                     # Setup guide and API documentation
└── info.md                           # Auto-maintained living project documentation
```

## 4. Features Implemented
- **Full Normalized Database Architecture**: 30 interconnected Prisma models with UUID primary keys, foreign keys, and 19 domain enums.
- **Secure Password Hashing**: `bcryptjs` (salt rounds: 10) ensures plaintext passwords are never stored in the database or leaked in API responses.
- **Cryptographic JWT Authentication**: Issues minimal JWT access tokens containing only `{ userId, role }` signed with `JWT_SECRET` and configurable expiration (`JWT_EXPIRES_IN`).
- **Anti-Privilege Escalation Registration**: Public registration (`POST /api/auth/register`) strictly defaults and enforces the `SALES_REP` role. Elevated staff roles (`ADMIN`, `SALES_MANAGER`, `FINANCE`, `OPERATIONS`) can only be provisioned by authenticated administrators via `POST /api/auth/users`.
- **Anti-Enumeration Credential Verification**: Login failures return a unified generic message (`Invalid email or password`) with HTTP 401.
- **Product Categories Management**: Full CRUD for product categories with default margin percentage support and safe deletion protection (automatically falls back to soft deactivation `isActive: false` if products are attached).
- **Product Catalog Management**: Complete product CRUD with SKU uniqueness, category validation, `costPrice < basePrice` checks, and automatic base margin calculation (`marginAmount` and `marginPercentage`).
- **Product Search & Filtering**: Fast multi-field filtering by keyword search (name, SKU, description), category, product type (`PHYSICAL`, `SERVICE`, `SUBSCRIPTION`), and active state.
- **Product Variants**: Nested and direct variant management supporting unique variant SKUs, attribute key-value pairs (JSON), price adjustments, and active toggles.
- **Customer CRM & Tier Management**: Full customer CRUD enforcing business tiers (`BRONZE`, `SILVER`, `GOLD`), unique company emails, multi-field search, and live summary aggregations (counts of quotations, orders, and subscriptions).
- **Price List Engine**: Tiered price list assignment, date validity windows, and custom price list items supporting minimum quantity break tiers and optional target profit margins.
- **Quotation Price Lookup Endpoint**: High-performance price resolution endpoint (`GET /api/price-lists/:priceListId/products/:productId?quantity=X`) that resolves quantity-break tier prices or falls back to base price.
- **B2B Quotation Engine (Phase 5)**:
  - **Quotation Creation**: Automated generation of collision-resistant, human-readable quote numbers (`DFQ-YYYY-000001`), server-derived `salesRepId` from `req.user.id`, initialization of financial fields to `0.00`, and default `DRAFT` status.
  - **Authoritative Price Resolution**: Automatically looks up customer tier and active price list to resolve unit prices and quantity breaks, falling back to base prices and incorporating variant extra charges.
  - **Precise Financial Math**: Calculates line item gross amounts, requested discounts, taxable amounts, tax rates, net selling amounts, cost amounts, and profit margin amounts and percentages.
  - **Atomic Recalculation**: Multi-item quotation totals (`subtotal`, `discountAmount`, `taxAmount`, `totalAmount`, `marginAmount`, `marginPercentage`) are atomically synchronized inside Prisma database transactions (`prisma.$transaction`).
  - **Resource-Level Ownership (RLAC)**: `SALES_REP` users can only view, edit, modify items, and submit their own quotations. `SALES_MANAGER` and `ADMIN` have elevated oversight.
  - **Status State Machine & Locking**: Enforces that only `DRAFT` (or revision) quotations can be modified. Submitting transitions status to `PENDING_APPROVAL` and locks line item mutations.
  - **Soft Cancellation**: Cancellation transitions quotation status to `CANCELLED` and locks the document from further updates while preserving audit history.
  - **Auditing Trail**: Logs non-blocking lifecycle records (`QUOTE_CREATED`, `QUOTE_UPDATED`, `QUOTE_ITEM_ADDED`, `QUOTE_ITEM_UPDATED`, `QUOTE_ITEM_REMOVED`, `QUOTE_SUBMITTED`, `QUOTE_CANCELLED`).
- **Discount Engine & Risk Engine (Phase 6)**:
  - **Database-Driven Discount Policy**: Rules mapped per `(CustomerTier, ProductCategory)` with `maxDiscountPercentage`, `managerApprovalRequiredAbove`, and `financeApprovalRequiredAbove`.
  - **Safe Rule Fallback**: If no active rule matches, maximum allowable discount defaults safely to `0.0%`. Inactive rules are filtered out.
  - **Discount Deviation**: Computes $\max(0, \text{requestedDiscount} - \text{maximumAllowedDiscount})$ with zero-floor guarantee.
  - **Deterministic Quotation Risk Scoring**: Evaluates discount deviations, margin shortfalls against category targets, financial exposure thresholds (> $50k, > $100k), and customer tiers to generate scores ($0 - 100$) and map to `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
  - **Human-Explainable Manager Reasons**: Produces structured reasons array (`DISCOUNT_EXCEEDED`, `LOW_MARGIN`, `HIGH_FINANCIAL_EXPOSURE`, `NEGATIVE_MARGIN`) with severity levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
  - **Approval Requirement Engine**: Intelligently routes quotations requiring approval to `SALES_MANAGER`, `FINANCE`, or both, while exempting safe, low-risk quotes.
  - **Quotation Evaluation Endpoint**: Dedicated `POST /api/quotations/:id/evaluate-risk` allows pre-submission risk audit and preview.
  - **Submission Workflow Integration**: Automatically calculates and persists `riskScore`, `riskLevel`, and `approvalRequired` upon quotation submission (`POST /api/quotations/:id/submit`).
  - **Admin Discount Rule CRUD**: Full administrative API (`POST`, `GET`, `PUT`, `DELETE` at `/api/discount-rules`) guarded by RBAC (`ADMIN` only for mutations).
- **Approval Workflow Engine (Phase 7)**:
  - **Automated Multi-Tier Steps**: Creates sequential approval records (`model Approval`) mapped to required roles (`SALES_MANAGER` = Step 1, `FINANCE` = Step 2) when quotations requiring approval are submitted.
  - **Strict Anti-Self-Approval**: Prevents sales reps from approving their own quotations (`quotation.salesRepId === req.user.id` returns 403 Forbidden).
  - **Sequential Prerequisite Enforcment**: Step 2 (`FINANCE`) is strictly locked until Step 1 (`SALES_MANAGER`) has been completed and approved.
  - **Server-Side Authority**: Approvers and roles are derived exclusively from authenticated JWT sessions (`req.user.id`). Frontend cannot forge `approverId`, `approvalRole`, or `status`.
  - **Rejection & Auto-Cancellation**: Rejection requires a mandatory reason ($\ge 3$ characters), updates quotation status to `REJECTED`, marks all downstream pending sibling approvals as `CANCELLED`, and logs full history.
  - **Auto-Approval Transition**: Automatically transitions quotation from `PENDING_APPROVAL` to `APPROVED` once all required approval steps are completed.
  - **Transactional Concurrency Protection**: Uses `prisma.$transaction` to prevent race conditions and duplicate decisions on simultaneous approval submissions.
  - **Approval Dashboard & History APIs**: Exposes `/api/approvals/pending`, `/api/approvals/:id`, `/api/approvals/:id/approve`, `/api/approvals/:id/reject`, `/api/quotations/:id/approvals`, and `/api/quotations/:id/approval-history`.
- **Order Management & Fulfillment Engine (Phase 8)**:
  - **Quotation-to-Order Conversion**: Converts `APPROVED` quotations into immutable `Order` documents with database-level duplicate prevention (`quotationId @unique`).
  - **Immutable Financial Snapshotting**: Captures product names, SKUs, unit prices, discounts, tax rates, line totals, and cost prices at the exact instant of order creation, shielding historical orders from catalog price changes.
  - **Finite-State Order Transitions**: Enforces valid business state progressions (`DRAFT` -> `CONFIRMED` -> `PROCESSING` -> `READY_FOR_FULFILLMENT` -> `SHIPPED` -> `DELIVERED` -> `CANCELLED`) with strict terminal state locks.
  - **Multi-Warehouse Fulfillment Operations**: Tracks carrier, tracking number, dispatched/delivered timestamps, and operations staff assignment.
  - **Bidirectional State Synchronization**: Automatically marks parent orders as `SHIPPED` or `DELIVERED` upon fulfillment completion.
- **Billing & Payment Engine (Phase 9)**:
  - **Order-to-Invoice Generation**: Converts confirmed orders into snapshot-based invoices with collision-resistant sequence numbers (`INV-YYYY-XXXXXX`) and duplicate conversion guards.
  - **Multi-Payment Ledger & Balance Tracking**: Tracks multiple payments per invoice, maintaining real-time `paidAmount` and `outstandingAmount` with strict non-negative balance guarantees and overpayment prevention.
  - **Invoice State Machine**: Manages lifecycle across `DRAFT`, `ISSUED`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`, and `CANCELLED`.
  - **Payment Cancellation Rollback**: Cancelling a payment restores outstanding balances and automatically regresses invoice status if needed inside a database transaction.
  - **Automated Overdue Detection**: Background batch query identifies unpaid invoices past their due date and transitions status to `OVERDUE`.
- **Dashboard & Analytics Engine (Phase 10)**:
  - **Role-Aware Dashboard Dispatcher**: `GET /api/dashboard` delivers customized, role-specific metrics tailored for `ADMIN`, `SALES_MANAGER`, `SALES_REP`, `FINANCE`, and `OPERATIONS`.
  - **Strict Sales Rep Isolation**: `SALES_REP` dashboard queries enforce `salesRepId: req.user.id`; attempts to pass spoofed `?salesRepId=` query parameters are ignored.
  - **Comprehensive Sales Analytics**: Real-time sales overview, conversion rates, quotation status funnels, revenue time-series bucketing (`day`, `week`, `month`), and rep leaderboards.
  - **Financial AR Aging & Operational Throughput**: Accounts Receivable aging buckets (`current`, `1-30`, `31-60`, `61-90`, `90+` days overdue), fulfillment velocity, and carrier distribution.
  - **Multi-Period Date Range Filter Engine**: Supports 10 preset time windows (`today`, `yesterday`, `this_week`, `this_month`, `this_quarter`, `this_year`, `last_7_days`, `last_30_days`, `last_90_days`, `custom`) with automatic comparison period calculations and zero-division safe percentage changes.
- **Notification & Activity / Communication Engine (Phase 11)**:
  - **In-App Notification Engine**: User-targeted, priority-aware (`LOW`, `NORMAL`, `HIGH`, `URGENT`) in-app notifications with read/unread tracking, timestamping, and pagination.
  - **Strict User Tenancy & RLAC Isolation**: Notifications are strictly tied to `req.user.id`. Query parameter tampering (e.g. `?userId=...`) is ignored; users can never read, modify, or delete another user's notifications.
  - **Idempotency & Duplicate Protection**: Enforces an `idempotencyKey` unique index on `Notification` to prevent duplicated alerts across re-triggered events or concurrent workers.
  - **User Notification Preferences**: Database model `NotificationPreference` with compound unique `[userId, notificationType]` allowing users to toggle in-app and email channels per event type. Disabled preferences cleanly suppress notification generation.
  - **Lifecycle Domain Event Hooks (`notificationEvents.js`)**: Real-time event handlers reacting to core commercial lifecycle transitions:
    - Quotations: `handleQuotationSubmitted`, `handleQuotationApproved`, `handleQuotationRejected`, `handleHighRiskQuotation` (alerts admins and managers for quotes with high risk).
    - Orders: `handleOrderCreated`, `handleOrderStatusChanged`.
    - Fulfillments: `handleFulfillmentAssigned`, `handleOrderShipped`, `handleOrderDelivered`.
    - Billing & Invoicing: `handleInvoiceIssued`, `handleInvoiceOverdue`.
    - Payments: `handlePaymentReceived`, `handlePaymentFailed`, `handleInvoicePaid`.
  - **Periodic / On-Demand Overdue Invoices Engine**: `generateOverdueInvoiceNotifications` scans for unpaid invoices past their due date, notifies finance and assigned sales reps, and uses daily date-stamped idempotency keys (`overdue-invoice-{id}-{YYYY-MM-DD}`) to avoid alert spamming.
  - **Human-Readable Activity Timeline (`activityService.js`)**: Unified audit trail with structured metadata, human-readable action summaries, actor attribution, and dual compound indexes (`[entityType, entityId, createdAt]`, `[actorUserId, createdAt]`).
  - **2-Second Debounce Deduplication**: Rapid repetitive mutations to the same entity within 2 seconds are intelligently deduped to prevent timeline bloat.
  - **Entity Activity Feeds**: Direct endpoints for entity-specific activity histories (`/api/quotations/:id/activity`, `/api/orders/:id/activity`, `/api/invoices/:id/activity`, `/api/customers/:id/activity`) plus global system-wide activity timeline (`/api/activity`).
- **Non-Blocking Audit Logging**: Structured audit trail logging (`auditLogger.js`) capturing entity mutations with actor ID, action type, changes diff, and timestamp without impeding response latency.
- **Automated Multi-Layer Testing**: 348 passing automated tests natively with 0 failures across all 11 phases in ~15.2 seconds.


## 5. How Things Work (Function-Level Flow)

### Login Flow (`POST /api/auth/login`)
> When the user clicks "Login" or submits credentials:
> 1. Request enters `app.js` and is logged by `requestLogger` (in `src/middleware/requestLogger.js`).
> 2. `loginSchema` validator in `src/validators/authValidator.js` validates email format and password presence.
> 3. Route delegates to `authController.login()` (located in `src/controllers/authController.js`).
> 4. `authController.login()` calls `authService.loginUser(email, password)` (in `src/services/authService.js`).
> 5. `authService.loginUser()` queries PostgreSQL via `prisma.user.findUnique()`.
> 6. If user doesn't exist or is inactive, it throws an `AppError(..., 401)`.
> 7. `authService.loginUser()` calls `comparePassword(password, user.passwordHash)` (in `src/utils/password.js`) to verify the bcrypt hash.
> 8. If valid, `authService.loginUser()` calls `generateAccessToken(user)` (in `src/utils/jwt.js`), signing a JWT with `{ userId: user.id, role: user.role }`.
> 9. `authService.loginUser()` sanitizes the user object via `sanitizeUser(user)` (stripping `passwordHash`) and returns `{ user, token }`.
> 10. `authController.login()` wraps the payload in `sendSuccess()` returning HTTP 200 to the client.

### Registration Flow (`POST /api/auth/register`)
> When a new sales user registers:
> 1. Request body is validated against `registerSchema` (in `src/validators/authValidator.js`).
> 2. Route delegates to `authController.register()` in `src/controllers/authController.js`.
> 3. `authController.register()` calls `authService.registerUser(data, isPublic = true)`.
> 4. `authService.registerUser()` checks if the email already exists in PostgreSQL via Prisma. If duplicate, throws `AppError(..., 409)`.
> 5. `authService.registerUser()` enforces `role = UserRole.SALES_REP` (ignoring any escalated role requested in public body).
> 6. It hashes the password using `hashPassword()` (in `src/utils/password.js`).
> 7. It creates the user in PostgreSQL and returns sanitized user data.
> 8. Controller returns HTTP 201 Created.

### Protected Route & RBAC Verification Flow
> When a client requests a protected endpoint (e.g., `GET /api/test/finance`):
> 1. Request enters `authenticateToken()` middleware (in `src/middleware/authenticateToken.js`).
> 2. `authenticateToken()` extracts the Bearer token from `Authorization` header. If missing, responds with HTTP 401.
> 3. It calls `verifyAccessToken(token)` (in `src/utils/jwt.js`). If invalid or expired, responds with HTTP 401.
> 4. It loads the user from PostgreSQL using `decoded.userId` and confirms `user.isActive === true`.
> 5. It attaches the sanitized user to `req.user` and calls `next()`.
> 6. Request enters `authorizeRoles('FINANCE', 'ADMIN')` middleware (in `src/middleware/authorizeRoles.js`).
> 7. If `req.user.role` is NOT in the allowed list, it halts execution and returns HTTP 403 Forbidden with an explanation.
> 8. If authorized, it calls `next()` and the controller processes the business logic.

### Product Creation & Margin Calculation Flow (`POST /api/products`)
> When an Admin creates a new product:
> 1. Request enters `authenticateToken` and `authorizeRoles('ADMIN')`.
> 2. `createProductSchema` validates SKU, name, pricing numbers (`costPrice < basePrice`), and category UUID.
> 3. `productController.create()` calls `productService.createProduct()`.
> 4. `productService.createProduct()` verifies category existence and SKU uniqueness in PostgreSQL.
> 5. It calculates `baseMarginAmount = basePrice - costPrice` and `baseMarginPercentage = (baseMarginAmount / basePrice) * 100`.
> 6. It creates the product in PostgreSQL with Prisma.
> 7. It logs an audit record via `recordAuditLog('PRODUCT', product.id, 'CREATE', null, product, user.id)`.
> 8. Controller returns HTTP 201 Created with product details and computed margin metrics.

### Quotation Price Lookup Flow (`GET /api/price-lists/:priceListId/products/:productId?quantity=X`)
> When a sales workflow or quote builder requests product pricing for a customer's price list:
> 1. Request enters `authenticateToken` and is authorized for internal roles.
> 2. `priceListController.getProductPrice()` extracts `priceListId`, `productId`, and optional `quantity`.
> 3. `priceListService.getProductPrice()` queries the price list and product from PostgreSQL.
> 4. It searches `PriceListItem` for matching `productId` and evaluates `minQuantity <= quantity`.
> 5. If a matching item is found, it calculates the dynamic unit price, discount amount from base price, and profit margin over cost price.
> 6. If no custom item is found, it falls back cleanly to the product's default `basePrice`.
> 7. Controller returns HTTP 200 OK with resolved unit price, source (`CUSTOM_PRICE_LIST` or `BASE_CATALOG`), and profit metrics.

### Customer Details & Aggregations Flow (`GET /api/customers/:id`)
> When viewing a customer 360 profile:
> 1. Request enters `authenticateToken` and is authorized for internal roles.
> 2. `customerController.getById()` calls `customerService.getCustomerById(id)`.
> 3. `customerService.getCustomerById()` fetches the customer record from PostgreSQL and executes concurrent `_count` queries for related quotations, orders, and subscriptions.
> 4. It attaches `metrics: { quotationsCount, ordersCount, subscriptionsCount }` to the customer record.
> 5. Controller returns HTTP 200 OK with complete customer details and relational counts.

### Quotation Lifecycle & Calculation Flow
> When a sales representative creates and builds a quotation:
> 1. **Create Draft Quote (`POST /api/quotations`)**:
>    - Client sends `{ customerId, expiresAt? }`.
>    - `authenticateToken` resolves authenticated `req.user.id`.
>    - `quotationService.createQuotation()` verifies customer exists and is active.
>    - Generates sequential, collision-safe quote number (e.g. `DFQ-2026-000001`).
>    - Initializes status to `DRAFT` and all financial fields to `0.00`.
>    - Emits `QUOTE_CREATED` audit log.
> 2. **Add Line Item (`POST /api/quotations/:id/items`)**:
>    - Client sends `{ productId, variantId?, quantity, discountPercentage? }`.
>    - Verifies quote exists, user owns the quote (or is manager/admin), and status is `DRAFT`.
>    - `getApplicableProductPrice()` fetches product, validates variant, checks customer tier, queries tier price list, and evaluates best quantity-break price.
>    - `calculateQuotationItem()` computes:
>      - `grossAmount = unitPrice * quantity`
>      - `discountAmount = grossAmount * discountPercentage / 100`
>      - `netAmount = grossAmount - discountAmount`
>      - `taxAmount = netAmount * taxRate / 100`
>      - `lineTotal = netAmount + taxAmount`
>      - `costAmount = costPrice * quantity`
>      - `marginAmount = netAmount - costAmount`
>      - `marginPercentage = (marginAmount / netAmount) * 100`
>    - Runs inside `prisma.$transaction`: inserts `QuotationItem`, recalculates quote totals (`subtotal`, `discountAmount`, `taxAmount`, `totalAmount`, `marginAmount`, `marginPercentage`), and updates `Quotation`.
>    - Emits `QUOTE_ITEM_ADDED` audit log.
> 3. **Submit Quotation (`POST /api/quotations/:id/submit`)**:
>    - Verifies ownership, `DRAFT` status, and ensures at least 1 item is present.
>    - Force-recalculates all totals to guarantee absolute freshness.
>    - Evaluates quotation against the database-driven Discount Engine and Risk Engine (`riskService.evaluateQuotationRisk()`).
>    - Updates quotation status to `PENDING_APPROVAL` and persists calculated `riskScore`, `riskLevel`, and `approvalRequired`.
>    - Emits `QUOTE_SUBMITTED` audit log with risk scoring and approval requirements.
> 4. **Evaluate Quotation Risk (`POST /api/quotations/:id/evaluate-risk`)**:
>    - Authenticates user and enforces RLAC ownership (sales rep can evaluate their own quote; managers/admins can evaluate any).
>    - Force-recalculates quotation.
>    - Resolves discount rules per item (`getApplicableDiscountRule`), computes discount deviations, category margin deficits, and exposure.
>    - Calculates deterministic risk score (0–100) and risk level (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
>    - Determines required approval roles (`SALES_MANAGER`, `FINANCE`, or both) and builds explainable reasons array.
>    - Persists evaluation metrics to `Quotation` and emits `RISK_EVALUATED` audit log.
> 5. **Cancel Quotation (`DELETE /api/quotations/:id`)**:
>    - Validates ownership, checks that quote is not already confirmed/cancelled.
>    - Transitions status to `CANCELLED` and locks the record.
>    - Emits `QUOTE_CANCELLED` audit log.
> 6. **Admin Discount Rules (`/api/discount-rules`)**:
>    - Read operations (`GET /`, `GET /:id`) permitted for `ADMIN`, `SALES_MANAGER`, `FINANCE`.
>    - Mutations (`POST /`, `PUT /:id`, `DELETE /:id`) restricted strictly to `ADMIN`.
>    - Enforces uniqueness on `[customerTier, categoryId]` and logs `DISCOUNT_RULE_CREATED`, `DISCOUNT_RULE_UPDATED`, and `DISCOUNT_RULE_DELETED` audit records.
> 7. **Approval Workflow Execution (`/api/approvals`)**:
>    - **Creation**: When a quote requiring approval is submitted, `approvalService.createApprovalRequests()` generates required sequential steps (`model Approval`).
>    - **Dashboard (`GET /api/approvals/pending`)**: Managers/Finance query pending actionable steps. The service automatically filters out quotations where `quotation.salesRepId === req.user.id` to prevent self-approvals.
>    - **Approve (`POST /api/approvals/:id/approve`)**:
>      1. Authenticates session and checks role permission (`SALES_MANAGER` matches manager step, `FINANCE` matches finance step, `ADMIN` has supervisor rights).
>      2. Verifies `quotation.salesRepId !== req.user.id` (returns 403 Forbidden).
>      3. Verifies `approval.status === 'PENDING'`.
>      4. Sequential check: If Step 2, verifies Step 1 is already `APPROVED` (returns 400 Bad Request if not).
>      5. Updates `Approval` status to `APPROVED`, sets `approverId = req.user.id`, `decidedAt = new Date()`.
>      6. Records `ApprovalActionHistory` (action: `APPROVED`) and writes `APPROVAL_GRANTED` audit log.
>      7. Checks if all steps for quotation are completed. If yes, transitions quotation status from `PENDING_APPROVAL` to `APPROVED`.
>    - **Reject (`POST /api/approvals/:id/reject`)**:
>      1. Validates `rejectionReason` ($\ge 3$ characters).
>      2. Validates role permissions and self-approval guards.
>      3. Updates `Approval` status to `REJECTED`, sets `rejectionReason`, `approverId`, `decidedAt`.
>      4. Immediately updates quotation status to `REJECTED`.
>      5. Automatically cancels downstream pending sibling approvals (`CANCELLED`).
>      6. Records `ApprovalActionHistory` (action: `REJECTED`) and writes `APPROVAL_REJECTED` audit log.
>    - **History (`GET /api/quotations/:id/approval-history`)**: Aggregates chronological approval steps, decision records, and audit logs.

## 6. Data Flow / State Management (if applicable)
- Authentication is completely stateless:
  `Client -> Authorization: Bearer <JWT> -> authenticateToken -> authorizeRoles -> Controller -> Service -> Prisma`.
- User identity (`req.user.id`, `req.user.role`) is propagated downstream through the Express request context, enabling future services to check role authorization and resource ownership (e.g. Sales Rep quotation tenancy).
- Pagination follows database-level `skip` and `take` via `getPaginationParams()` and returns standardized metadata (`total`, `page`, `limit`, `totalPages`, `hasNextPage`, `hasPrevPage`).
- Soft-deletion pattern: Master entities with downstream dependencies (e.g. Products with historical lines, Categories with products, Customers with quotations) transition to `isActive: false` rather than hard deletion to ensure financial auditability.

## 7. Known Limitations / Things to Improve
- **Token Invalidation**: Because JWTs are stateless, tokens remain cryptographically valid until their expiration timestamp (`JWT_EXPIRES_IN`). Logout currently relies on client-side token destruction. For high-security environments, a Redis token denylist or database refresh token rotation can be implemented in future iterations.
- **Customer Portal Authentication**: In this phase, internal staff roles (`User`) were implemented. Customer portal users authenticate against the `Customer` table and should be granted scoped portal tokens that never include internal `UserRole` permissions.
- **Tier-based Dynamic Recalculation**: Customer tier transitions currently occur via administrative API updates. In production, a background cron/queue can evaluate trailing 12-month order volume to suggest or promote tier shifts automatically.

## 8. Suggestions & Alternative Approaches
- **HttpOnly Cookies vs Bearer Tokens**: For web-only frontends, storing JWTs in `HttpOnly, Secure, SameSite` cookies provides automatic XSS mitigation. For the hackathon, Bearer headers were chosen to maximize flexibility for the separate React frontend team and simplify Postman testing.

## 9. Changelog (Session-wise Updates)
### [Update - 2026-09-05 / Session #1]
- Initialized `info.md` living documentation scaffold according to system instructions.
- Configured tech stack overview and baseline project structure.

### [Update - 2026-09-05 / Session #2 (Phase 1 Foundation)]
- Created complete backend project inside `backend/` with Node.js ES Modules.
- Configured Express server with JSON/urlencoded body parsing and dynamic CORS middleware.
- Configured Prisma with PostgreSQL datasource and initialized `schema.prisma` and `seed.js`.
- Implemented global error handling middleware (`errorHandler.js`) and 404 router (`notFoundHandler.js`).
- Implemented standard API response format helpers (`apiResponse.js`) and custom `AppError`.
- Implemented `GET /api/health` endpoint following `Route -> Controller -> Service -> Prisma` layered pattern.
- Added graceful shutdown routines for `SIGINT` and `SIGTERM` with clean Prisma client disconnection.
- Created unit and automated integration tests (`health.test.js`, `api.test.js`) verifying all Phase 1 requirements.

### [Update - 2026-09-05 / Session #3 (Phase 2 Database & Seed)]
- Designed and validated complete production Prisma schema (`prisma/schema.prisma`) with 30 normalized models and 19 enums.
- Created and executed initial database migration `20260905060414_init_dealflow360_phase2` against PostgreSQL, creating 33 tables.
- Built modular, idempotent database seed script (`prisma/seed.js`) with 12 specialized seed functions.
- Populated realistic demo datasets: 5 users, 3 tier customers, 7 products, variants, 3 price lists, 9 discount rules, approval chains, 2 warehouses, inventory balances, subscription plans, and an end-to-end commercial transaction.
- Added automated database test suite (`tests/database.test.js`) verifying foreign keys, multi-warehouse splits, backorders, subscriptions, negotiations, and audit logging (24/24 passing tests).

### [Update - 2026-09-05 / Session #4 (Phase 3 Auth & RBAC)]
- Implemented password encryption utilities (`password.js`) using bcrypt with 10 salt rounds.
- Implemented JWT generation, verification, and user sanitization utilities (`jwt.js`).
- Created authentication service (`authService.js`) and controller (`authController.js`) implementing register, login, me, logout, and admin user creation.
- Enforced anti-privilege escalation on public registration (`SALES_REP` only) and administrative staff provisioning (`ADMIN` only).
- Implemented JWT Bearer authentication middleware (`authenticateToken.js`) and RBAC guard middleware (`authorizeRoles.js`).
- Built Zod validation schemas (`authValidator.js`) for registration, login, and user creation.
- Implemented development/testing RBAC verification routes (`/api/test/*`).
- Created comprehensive test suite (`tests/auth.test.js`) covering 30 sub-tests for authentication, token expiration, inactive accounts, and RBAC matrix.
- Updated `backend/README.md` with complete authentication guide, credentials, and API documentation.

### [Update - 2026-09-05 / Session #5 (Phase 4 Product, Customer & Price List REST APIs)]
- Created database-level pagination helper (`src/utils/pagination.js`) and non-blocking audit logging utility (`src/utils/auditLogger.js`).
- Built Zod validation schemas for all Phase 4 entities (`categoryValidator.js`, `productValidator.js`, `customerValidator.js`, `priceListValidator.js`).
- Implemented service layer with business logic, margin calculations, tier validations, and Prisma queries (`categoryService.js`, `productService.js`, `customerService.js`, `priceListService.js`).
- Implemented controllers for HTTP request/response orchestration (`categoryController.js`, `productController.js`, `customerController.js`, `priceListController.js`).
- Created RESTful route modules with layered middleware security (`categoryRoutes.js`, `productRoutes.js`, `variantRoutes.js`, `customerRoutes.js`, `priceListRoutes.js`, `priceListItemRoutes.js`) mounted in `routes/index.js`.
- Implemented product margin calculations (`marginAmount` and `marginPercentage`), SKU uniqueness constraints, and category safe-deletion safeguards (soft-delete if products exist).
- Implemented customer tier management (`BRONZE`, `SILVER`, `GOLD`), multi-field search, and relational aggregations (`quotationsCount`, `ordersCount`, `subscriptionsCount`).
- Implemented price lists, quantity breaks, and price resolution lookup endpoint (`GET /api/price-lists/:priceListId/products/:productId`).
- Created end-to-end automated test suite (`tests/catalog.test.js`) covering all 47 test cases (categories, products, variants, customers, price lists, RBAC).
- Verified full test suite execution: 107/107 tests passing natively across all phases.
- Updated `backend/README.md` with complete Phase 4 API specifications, routing matrix, and test metrics.

### [Update - 2026-09-05 / Session #6 (Phase 5 Quotation Engine)]
- Created Zod validation schemas (`src/validators/quotationValidator.js`) for quotation creation, updates, line items, and query filters.
- Implemented `QuotationService` (`src/services/quotationService.js`) with all 20 required functions: `createQuotation`, `generateQuoteNumber`, `getQuotations`, `getQuotationById`, `updateQuotation`, `addQuotationItem`, `updateQuotationItem`, `removeQuotationItem`, `calculateQuotationItem`, `calculateLineSubtotal`, `calculateDiscountAmount`, `calculateTaxAmount`, `calculateMarginAmount`, `calculateMarginPercentage`, `recalculateQuotation`, `submitQuotation`, `cancelQuotation`, `validateQuotationEditable`, `validateQuotationOwnership`, and `getApplicableProductPrice`.
- Implemented collision-resistant sequential human-readable quote number generator (`DFQ-YYYY-000001`).
- Implemented authoritative pricing resolution integrating customer tiers, price lists, volume quantity breaks, and variant extra charges.
- Implemented exact financial math engine (gross subtotal, requested discounts, taxes, costs, and profit margin amounts and percentages).
- Enforced database transactions (`prisma.$transaction`) for item creation, update, deletion, and quotation recalculation.
- Implemented resource-level authorization (RLAC) ensuring sales representatives can only view and manage their own quotations while managers and admins retain supervisory control.
- Enforced status state transitions: only `DRAFT` quotes can be modified; submission locks modifications and transitions to `PENDING_APPROVAL`; cancellation marks status as `CANCELLED`.
- Wired audit trail recording for all 7 lifecycle actions (`QUOTE_CREATED`, `QUOTE_UPDATED`, `QUOTE_ITEM_ADDED`, `QUOTE_ITEM_UPDATED`, `QUOTE_ITEM_REMOVED`, `QUOTE_SUBMITTED`, `QUOTE_CANCELLED`).
- Created `QuotationController` (`src/controllers/quotationController.js`), `quotationRoutes` mounted at `/api/quotations`, and `quotationItemRoutes` mounted at `/api/quotation-items`.
- Built comprehensive automated test suite (`tests/quotation.test.js`) covering 29 integration scenarios.
- Executed full backend test suite: 136/136 tests passing natively with 0 failures across all phases in under 1.5 seconds.
- Updated `backend/README.md` with Phase 5 endpoints, parameters, and test counts.

### [Update - 2026-09-05 / Session #7 (Phase 6 Discount Engine + Risk Engine)]
- Centralized all risk scoring configuration, thresholds, penalty weights, exposure tiers, and standard reason codes into `src/config/riskConstants.js`.
- Implemented database-driven `DiscountService` (`src/services/discountService.js`) featuring `getApplicableDiscountRule`, `calculateMaximumAllowedDiscount`, `calculateDiscountDeviation`, `validateDiscountAgainstRule`, `evaluateDiscount`, and full admin CRUD (`createDiscountRule`, `getDiscountRules`, `getDiscountRuleById`, `updateDiscountRule`, `deleteDiscountRule`).
- Implemented deterministic `RiskService` (`src/services/riskService.js`) featuring `calculateRiskScore`, `determineRiskLevel` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), `determineApprovalRequirement` (`SALES_MANAGER`, `FINANCE`, or both), and `evaluateQuotationRisk`.
- Created Zod validation schemas (`src/validators/discountRuleValidator.js`) for discount rule creation, modification, and query filtering.
- Implemented `DiscountRuleController` (`src/controllers/discountRuleController.js`) and RESTful routes (`src/routes/discountRuleRoutes.js`) mounted at `/api/discount-rules` with strict RBAC (`ADMIN` only for rule mutations).
- Added `POST /api/quotations/:id/evaluate-risk` route and controller handler in `quotationController.js` and `quotationRoutes.js` for standalone risk evaluation with RLAC ownership verification.
- Integrated `riskService.evaluateQuotationRisk()` into `quotationService.submitQuotation()`, automatically persisting computed `riskScore`, `riskLevel`, and `approvalRequired` to PostgreSQL and recording in audit log.
- Created comprehensive automated test suite (`tests/risk.test.js`) covering 30 exhaustive scenarios across discount rules, deviations, margin thresholds, exposure, approval triggers, security, and API flows.
- Executed full backend test suite: all 169 tests passing natively with 0 failures across all 6 phases.
- Updated `backend/README.md` with Phase 6 discount engine formulas, risk scoring rules, approval triggers, and API endpoints.

### [Update - 2026-09-05 / Session #8 (Phase 7 Approval Workflow Engine)]
- Added `CANCELLED` status to `ApprovalStatus` enum and introduced additive `model Approval` (`approvals` table) with relations to `Quotation` and `User` (`approver`).
- Generated and applied PostgreSQL migration `20260905083051_add_approval_workflow` and updated Prisma client.
- Built Zod validation schemas (`approvalValidator.js`) for rejection reason constraints (min 3 chars) and pending approval dashboard query filters.
- Implemented `ApprovalService` (`src/services/approvalService.js`) with all 15 required business logic functions: `createApprovalRequests`, `getApprovalRequests`, `getPendingApprovals`, `getApprovalById`, `approveQuotation`, `rejectQuotation`, `validateApproverPermission`, `validateApprovalState`, `validateSelfApproval`, `checkPrerequisiteStep`, `determineNextApprovalStep`, `checkAllApprovalsCompleted`, `updateQuotationAfterApproval`, `updateQuotationAfterRejection`, `cancelPendingApprovals`, and `getApprovalHistory`.
- Enforced transactional integrity (`prisma.$transaction`) across all approval mutations, concurrency guards, and status updates.
- Strictly implemented self-approval prevention: sales representatives are blocked from approving their own quotations (`quotation.salesRepId === req.user.id` -> 403 Forbidden).
- Enforced sequential multi-tier approvals: Step 2 (`FINANCE`) requires Step 1 (`SALES_MANAGER`) to be approved first.
- Integrated `approvalService.createApprovalRequests()` into `quotationService.submitQuotation()`.
- Implemented `ApprovalController` (`src/controllers/approvalController.js`) and RESTful routes (`src/routes/approvalRoutes.js`) mounted at `/api/approvals`.
- Extended `quotationRoutes.js` with `GET /:id/approvals` and `GET /:id/approval-history`.
- Created comprehensive automated test suite (`tests/approval.test.js`) covering all 38 test scenarios across authorization, creation, approval flow, rejection flow, status transitions, security/tamper resistance, concurrency, and REST APIs (41 total sub-tests).
- Executed full test suite: **210/210 automated tests pass natively with 0 failures** across all 7 phases in ~2.6 seconds.
- Updated `backend/README.md` with complete Phase 7 workflow details, sequential rules, rejection behaviors, and example API payloads.

### [Update - 2026-09-05 / Session #9 (Phase 8 Order Management + Fulfillment Engine)]
- Implemented complete Order Management + Fulfillment Engine converting `APPROVED` quotations to immutable `Order` records.
- Deployed minimal additive schema migration `20260905090000_add_order_fulfillment_engine`:
  - `OrderStatus` enum: Added `PROCESSING`, `READY_FOR_FULFILLMENT`, `SHIPPED`, `DELIVERED`.
  - `FulfillmentStatus` enum: Added `SHIPPED`, `DELIVERED`.
  - `Order` model: Added `quotationId String? @unique` for database-level duplicate prevention, `salesRepId String?`, `currency String @default("USD")`, `notes String?`, and `salesRep` relation.
  - `OrderItem` model: Added snapshot fields (`variantId`, `productNameSnapshot`, `skuSnapshot`, `discountAmount`, `taxAmount`, `costPrice`) and `variant` relation.
  - `Fulfillment` model: Added `assignedToId String?`, `trackingNumber String?`, `carrier String?`, `notes String?`, `shippedAt DateTime?`, `deliveredAt DateTime?`, and `assignedTo` relation.
- Implemented `OrderService` (`src/services/orderService.js`) with all 14 required functions: `generateOrderNumber`, `createOrderFromQuotation`, `getOrders`, `getOrderById`, `getOrderByNumber`, `updateOrder`, `cancelOrder`, `updateOrderStatus`, `validateOrderStatusTransition`, `validateOrderAccess`, `getOrderItems`, `getCustomerOrders`, `calculateOrderTotals`, and `getOrderHistory`.
- Implemented `FulfillmentService` (`src/services/fulfillmentService.js`) with all 8 required functions: `createFulfillment`, `getFulfillment`, `updateFulfillmentStatus`, `assignFulfillment`, `addTrackingInformation`, `validateFulfillmentTransition`, `markOrderShipped`, and `markOrderDelivered`.
- Enforced strict finite-state machines for `Order` and `Fulfillment` statuses, with bidirectional synchronization on shipping and delivery events.
- Enforced zero-tampering security design preventing frontend clients from modifying financial values (`unitPrice`, `discountAmount`, `taxAmount`, `totalAmount`, `status`) during order creation.
- Implemented Zod validation schemas (`orderValidator.js`, `fulfillmentValidator.js`) and controllers (`orderController.js`, `fulfillmentController.js`).
- Mounted RESTful route modules (`orderRoutes.js`, `fulfillmentRoutes.js`) and extended `quotationRoutes.js` (`POST /:quotationId/create-order`) and `customerRoutes.js` (`GET /:customerId/orders`).
- Created comprehensive automated test suite (`tests/order.test.js`) covering all 37 test scenarios across creation, security, duplicate protection, status state machine, fulfillment, cancellation, access, and regression.
- Executed full test suite: **250/250 automated tests pass natively with 0 failures** across all 8 phases.
- Updated `backend/README.md` with complete Phase 8 specifications, state machines, API tables, and test counts.

### [Update - 2026-09-05 / Session #10 (Phase 9 Billing & Payment Engine)]
- Implemented complete Billing & Payment Engine converting confirmed orders into snapshot-based invoices and tracking multi-payment balances.
- Deployed PostgreSQL migration `20260905093000_add_billing_payment_engine`:
  - `InvoiceStatus` enum: Added `OVERDUE`.
  - `PaymentStatus` enum: Added `COMPLETED` and `CANCELLED`.
  - `Invoice` model: Added `discountAmount`, `paidAmount`, `outstandingAmount`, `currency`, `invoiceDate`, `notes`, `createdById`, and `createdBy` relation.
  - `InvoiceItem` model: Added snapshot fields (`variantId`, `productNameSnapshot`, `skuSnapshot`, `discountPercentage`, `discountAmount`, `taxAmount`, `lineTotal`) and `variant` relation.
  - `Payment` model: Added `paymentNumber @unique`, `transactionReference @unique`, `paymentDate`, `notes`, `createdById`, and `createdBy` relation.
- Implemented `InvoiceService` (`src/services/invoiceService.js`) with all required calculation and lifecycle functions:
  - `generateInvoiceNumber(tx)` (concurrency-safe `INV-YYYY-XXXXXX`)
  - Financial helpers: `calculateInvoiceItem`, `calculateInvoiceSubtotal`, `calculateInvoiceDiscount`, `calculateInvoiceTax`, `calculateInvoiceTotal`, `calculateInvoicePaidAmount`, `calculateInvoiceOutstandingAmount`, `calculateInvoiceStatus`
  - `createInvoiceFromOrder` with line item snapshotting, duplicate prevention (409 Conflict), transaction safety, and audit logging
  - `getInvoices`, `getInvoiceById`, `getInvoiceByNumber`, `updateInvoice`, `issueInvoice`, `cancelInvoice`, `recalculateInvoice`, `getInvoiceHistory`, `getInvoiceItems`, `updateOverdueInvoiceStatuses`, and `getCustomerBillingSummary`
- Implemented `PaymentService` (`src/services/paymentService.js`):
  - `generatePaymentNumber(tx)` (`PAY-YYYY-XXXXXX`)
  - `recordPayment` with overpayment validation, duplicate transaction reference checks, non-negative balance guarantees, automatic status progression (`PARTIALLY_PAID` / `PAID`), and transactional atomic updates
  - `cancelPayment` with transaction rollback, remaining payment recalculation, and status regression
  - `getPayments`, `getPaymentById`, `updatePayment`, and `getInvoicePaymentSummary`
- Implemented Zod validation schemas (`src/validators/billingValidator.js`) and controllers (`invoiceController.js`, `paymentController.js`).
- Mounted route modules (`invoiceRoutes.js`, `paymentRoutes.js`) in `routes/index.js`, added `POST /api/orders/:orderId/create-invoice` in `orderRoutes.js`, and `GET /api/customers/:customerId/billing-summary` in `customerRoutes.js`.
- Built comprehensive automated test suite (`tests/billing.test.js`) covering all 25 specific requirements from Section 29 + end-to-end integration workflow (31 passing subtests).
- Executed full backend test suite: **281/281 automated tests pass natively with 0 failures** across all 9 phases in ~9.3 seconds.
- Updated `backend/README.md` with complete Phase 9 architecture, state transitions, API documentation, and test counts.

### [Update - 2026-09-05 / Session #11 (Phase 10 Dashboard & Analytics Engine)]
- Implemented complete Dashboard & Analytics Engine delivering role-aware, high-performance sales operations intelligence.
- **Date Range Engine (`src/utils/dateRangeHelper.js`)**:
  - `parseDashboardDateRange`: Parses 10 presets (`today`, `yesterday`, `this_week`, `this_month`, `this_quarter`, `this_year`, `last_7_days`, `last_30_days`, `last_90_days`, `custom`) and calculates matching previous periods for comparison.
  - `calculatePercentageChange`: Robust zero-division protected growth calculation (`prev === 0 ? (curr > 0 ? 100 : (curr < 0 ? -100 : 0)) : ((curr - prev) / |prev|) * 100`).
- **Zod Validation (`src/validators/dashboardValidator.js`)**:
  - Validates period enums, ISO-8601 date formats, ensures `startDate <= endDate`, mandates both bounds for `custom`, and validates pagination limits (1 to 100, rejecting out-of-bounds).
- **Core Dashboard Services (`src/services/dashboardService.js`)**:
  - `getRoleDashboard`: Central dispatcher delivering role-specific payloads:
    - `ADMIN`: Executive overview (summary, pipeline, revenue time-series, quotation funnel, sales rep leaderboard, customer rankings, product bestsellers, category performance, finance summary, operations status, alerts).
    - `SALES_MANAGER`: Team pipeline, rep leaderboard, quotation funnel, top customers, bestsellers, pending approvals.
    - `SALES_REP`: Strictly isolated personal metrics (`salesRepId: user.id`), personal conversion rates, personal recent orders, personal quotes awaiting approval. Query tampering via `?salesRepId=` is safely rejected/ignored.
    - `FINANCE`: Invoiced, paid, outstanding balances, Accounts Receivable aging buckets (`current`, `overdue_31_60`, `overdue_61_90`, `overdue_90_plus`), overdue invoice aggregates, payment method distribution, margin analysis.
    - `OPERATIONS`: Orders awaiting fulfillment, fulfillment status pipeline (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `PARTIALLY_FULFILLED`, `FULFILLED`, `CANCELLED`), fulfillment rate, carrier distribution, active shipments in transit.
  - `getDashboardSummary`: Revenue, order volume, quote volume, conversion rate, pending approvals count, fulfillment rate, receivables outstanding, and period comparison.
  - `getSalesOverview`: Quotations by status, pipeline value, won orders count/value, win rate %, average deal size.
  - `getRevenueAnalytics`: Time series bucketing by `day`, `week`, or `month`, gross profit, total cost, and margin %.
  - `getSalesTrend`: Time-series trends of quotations vs orders.
  - `getQuotationAnalytics` & `getQuotationFunnel`: Quotation status breakdown, average quote value, margin %, risk scores, and stage-by-stage funnel progression.
  - `getSalesRepPerformance`: Multi-rep leaderboard ranked by revenue, conversion rates, and quota achievements (`ADMIN` and `SALES_MANAGER` only).
  - `getCustomerAnalytics`: Customer ranking by total spend, orders placed, and unpaid invoice balances.
  - `getProductAnalytics` & `getCategoryPerformance`: Top selling products and category revenue breakdown.
  - `getOrderAnalytics`: Order volume and status distribution.
  - `getFulfillmentAnalytics`: Fulfillment throughput and carrier breakdown.
  - `getDashboardAlerts`: Actionable alerts for high-risk pending quotes (`riskLevel: HIGH/CRITICAL`), overdue invoices, pending approvals, and unfulfilled confirmed orders.
- **Controllers & Routes (`src/controllers/dashboardController.js`, `src/routes/dashboardRoutes.js`)**:
  - Mounted all 11 endpoints under `/api/dashboard` with uniform response envelope (`sendSuccess`).
  - Protected by `authenticateToken` and `authorizeRoles`. Strict RBAC ensures `SALES_REP` cannot access `/sales-reps`, `/finance`, or `/operations`, and `OPERATIONS` cannot access `/finance`. Unauthorized/deactivated accounts receive 403 Forbidden.
- **Automated Testing (`tests/dashboard.test.js`)**:
  - Port 5110 isolated test suite covering all 33 test scenarios including role isolation, date filters, invalid input validation, query limits, zero-division safety, and RBAC guards (36 passing subtests).
- **Full Test Suite Status**:
  - **317/317 automated tests pass natively with 0 failures** across all 10 phases (`npm test` in ~10.7 seconds).
- **Zero Schema Migrations Needed**: Leveraged existing 12 Prisma models and relations with zero breaking changes.

### [Update - 2026-09-05 / Session #12 (Phase 11 Notification & Activity / Communication Engine)]
- Implemented complete Notification & Activity / Communication Engine providing centralized in-app notifications, user preferences, and real-time activity timelines across all commercial operations.
- **Database Schema Migration (`20260905100000_add_notification_activity_engine`)**:
  - Enums:
    - `NotificationType` (15 types: `QUOTATION_SUBMITTED`, `QUOTATION_APPROVED`, `QUOTATION_REJECTED`, `QUOTATION_EXPIRED`, `HIGH_RISK_QUOTATION`, `ORDER_CREATED`, `ORDER_STATUS_CHANGED`, `FULFILLMENT_ASSIGNED`, `ORDER_SHIPPED`, `ORDER_DELIVERED`, `INVOICE_ISSUED`, `INVOICE_OVERDUE`, `PAYMENT_RECEIVED`, `PAYMENT_FAILED`, `SYSTEM_ALERT`).
    - `NotificationPriority` (`LOW`, `NORMAL`, `HIGH`, `URGENT`).
  - Models:
    - `Notification`: In-app notification entity with `userId`, `type`, `title`, `message`, `priority`, `data` (JSON), `isRead`, `readAt`, `link`, and collision-resistant `idempotencyKey` unique index.
    - `NotificationPreference`: Granular user notification settings with `userId`, `notificationType`, `inAppEnabled`, `emailEnabled`, and compound unique index `[userId, notificationType]`.
    - `Activity`: Unified activity trail with `entityType`, `entityId`, `action`, `title`, `description`, `actorUserId`, `metadata` (JSON), and dual compound query indexes `[entityType, entityId, createdAt]` and `[actorUserId, createdAt]`.
- **Core Services (`src/services/`)**:
  - `NotificationService` (`notificationService.js`):
    - Strict user tenancy & data isolation: all notification queries bind directly to `req.user.id`, ignoring external query tampering.
    - Idempotency & duplicate suppression via `idempotencyKey` lookup before insert.
    - Preference checking: automatically suppresses notification generation if user has disabled `inAppEnabled` for the type.
    - Complete management: `createNotification`, `getNotifications`, `getUnreadCount`, `getNotificationById`, `markAsRead`, `markAllAsRead`, `deleteNotification`, `getUserPreferences`, `updatePreference`.
  - `ActivityService` (`activityService.js`):
    - Unified activity logging with 2-second debounce deduplication: consecutive identical actions on the same entity within 2 seconds are dropped to eliminate timeline spam.
    - Role-aware activity feed generation and entity access validation (e.g. sales reps only view activity for their assigned quotes and orders).
    - Dedicated entity history helpers: `getQuotationActivity`, `getOrderActivity`, `getInvoiceActivity`, `getCustomerActivity`, `getEntityActivity`, `getRecentActivity`.
  - `NotificationEvents` (`notificationEvents.js`):
    - Domain event dispatcher connecting commercial lifecycles to notifications and activity logging:
      - Quotations: `handleQuotationSubmitted`, `handleQuotationApproved`, `handleQuotationRejected`, `handleHighRiskQuotation`.
      - Orders: `handleOrderCreated`, `handleOrderStatusChanged`.
      - Fulfillments: `handleFulfillmentAssigned`, `handleOrderShipped`, `handleOrderDelivered`.
      - Invoices: `handleInvoiceIssued`, `handleInvoiceOverdue`, `handleInvoicePaid`.
      - Payments: `handlePaymentReceived`, `handlePaymentFailed`.
    - `generateOverdueInvoiceNotifications`: Scheduled and on-demand batch scanner that detects unpaid invoices past their due date and issues daily idempotency-keyed alerts (`overdue-invoice-{id}-{YYYY-MM-DD}`) to finance and assigned sales reps.
- **Controllers & Routes (`src/controllers/`, `src/routes/`)**:
  - `NotificationController` & `notificationRoutes.js`: Mounted at `/api/notifications` with 8 RESTful endpoints for notification querying, unread counters, reading, deletion, preference management, and overdue triggering.
  - `ActivityController` & `activityRoutes.js`: Mounted at `/api/activity` with 3 RESTful endpoints for system-wide activity feeds, activity detail lookup, and arbitrary entity timelines.
  - Dedicated entity timeline routes: Added `GET /activity` shortcuts across `quotationRoutes.js`, `orderRoutes.js`, `invoiceRoutes.js`, and `customerRoutes.js`.
- **Validation Schemas (`src/validators/notificationValidator.js`)**:
  - Zod schemas validating notification filters, pagination limits, boolean preference updates, and activity query parameters.
- **Lifecycle Service Hooks**:
  - Seamlessly hooked event dispatches into `quotationService.js`, `approvalService.js`, `orderService.js`, `fulfillmentService.js`, `invoiceService.js`, and `paymentService.js`.
- **Automated Testing (`tests/notification.test.js`)**:
  - Port 5120 isolated test suite covering 31 exhaustive integration tests:
    - Real-time event notifications across all 5 lifecycle domains.
    - Strict user tenancy and isolation (preventing query parameter spoofing).
    - Idempotency key duplicate protection.
    - User preference opt-out suppression.
    - 2-second debounce deduplication on activity recording.
    - Direct entity activity timelines (`/quotations/:id/activity`, `/orders/:id/activity`, `/invoices/:id/activity`, `/customers/:id/activity`).
    - Periodic overdue invoice batch alert execution.
- **Full Test Suite Status**:
  - **348/348 automated tests pass natively with 0 failures** across all 11 phases (`npm test` in ~15.2 seconds).


### [Update - 2026-09-05 / Session #13 (Phase 12 Security, Validation & Production Hardening)]
- Completed aggressive security review, validation hardening, and production audit across all backend endpoints and services.
- **Security Headers Middleware (`src/middleware/securityHeaders.js`)**:
  - Implemented zero-dependency HTTP security header enforcement:
    - `X-Content-Type-Options: nosniff`
    - `X-Frame-Options: DENY` (clickjacking mitigation)
    - `X-XSS-Protection: 0` (modern standard)
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'`
    - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (enforced in production)
    - Express fingerprint suppression: `X-Powered-By` is completely stripped.
- **Rate Limiting Engine (`src/middleware/rateLimiter.js`)**:
  - Built-in zero-dependency sliding-window in-memory rate limiter with periodic unref'd garbage collection timer (5-minute interval):
    - `authRateLimiter`: 20 requests / 15 minutes per IP on `/api/auth/login` and `/api/auth/register`.
    - `generalRateLimiter`: 500 requests / 15 minutes per IP on all other `/api/*` routes.
    - Standard response headers: `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
    - Safe test mode: automatically bypasses in test environment unless explicitly invoked with `x-test-rate-limit: true`.
- **Parameter Sanitization & HPP Protection (`src/middleware/parameterSanitizer.js`)**:
  - HTTP Parameter Pollution (HPP) defense: flattens repeated query array parameters to their last scalar value.
  - Strips null bytes (`\0`) from incoming string query parameters.
  - Bounds query strings (e.g. search) to a maximum of 100 characters to prevent regex/memory exhaustion.
- **Route Parameter UUID Guards & Common Validator (`src/validators/commonValidator.js`)**:
  - Standard RFC4122 regex validation on all route ID parameters (`:id`, `:orderId`, `:invoiceId`, `:customerId`) across all route files.
  - Malformed inputs, arbitrary strings, and directory traversal attempts (e.g. `../../etc/passwd`) immediately yield a clean `400 Bad Request` without hitting downstream controllers or the database.
- **JWT Authentication & Algorithm Pinning (`src/utils/jwt.js`, `src/middleware/authenticateToken.js`)**:
  - Pinned algorithm strictly to `HS256` in both `jwt.sign()` and `jwt.verify()`.
  - Blocks algorithm confusion attacks (including algorithm `none` and asymmetric key substitution).
  - Verifies `user.isActive` on every authenticated request; deactivated accounts are denied with `403 Forbidden`.
  - Production assertion in `src/config/env.js`: verifies `JWT_SECRET` length >= 32 and `DATABASE_URL` presence on startup.
- **Mass Assignment & Privilege Escalation Defenses**:
  - Public registration enforces `SALES_REP` role; arbitrary `role: 'ADMIN'` parameters in register payloads are discarded.
  - Zod update schemas (`updateQuotationSchema`, `updateInvoiceSchema`, `updatePaymentSchema`) configure `.strict()`, rejecting payloads containing unapproved or privileged keys (e.g. `status`, `totalAmount`, `riskScore`, `paidAmount`) with `400 Bad Request`.
- **Error Handling & Information Leakage Mitigation (`src/middleware/errorHandler.js`)**:
  - Sanitizes query parameters in error logs to prevent credential leakage.
  - Maps Prisma error codes to clean client responses:
    - `P2023` (Inconsistent column data / malformed UUID) ➔ `400 ValidationError`
    - `P2034` (Transaction conflict / concurrency collision) ➔ `409 ConflictError`
  - Hides internal database stack traces from external clients in production.
- **System Health Checks**:
  - Root `GET /health` endpoint returning lightweight JSON status and server uptime.
  - API `GET /api/health` endpoint returning detailed system and database connection diagnostics.
- **Security Documentation (`backend/SECURITY.md`)**:
  - Authored comprehensive enterprise security architecture document detailing threat modeling, RBAC permission matrix, data isolation rules, rate limits, headers, and responsible vulnerability disclosure policy.
- **Automated Security Testing (`tests/security.test.js`)**:
  - Created isolated test suite on port 5130 executing 51 automated security verifications covering:
    - Authentication token security & edge cases (missing, malformed, expired, algorithm 'none', wrong secret, deactivated user)
    - Role-Based Access Control on administrative, financial, and operational routes
    - IDOR multi-tenancy tenant isolation across Quotations, Orders, Invoices, and Notifications
    - Mass assignment privilege escalation prevention
    - Input validation, path traversal, SQL injection payload escaping, HPP, and parameter truncation
    - Workflow state transitions, anti-self-approval, and financial overpayment prevention
    - Security headers presence and Express fingerprint stripping
    - Sliding-window rate limiting burst testing
    - Multi-role end-to-end sales lifecycle workflow
- **Full Test Suite Status**:
  - **399/399 automated tests pass natively with 0 failures** across all 12 phases (`npm test` in ~17.1 seconds).

### [Update - 2026-09-05 / Session #14 (Phase 13 API Documentation, Testing & Developer Experience)]
- Completed full API documentation, pure business logic unit testing, developer documentation, Postman collection, and developer experience enhancement.
- **Interactive OpenAPI 3.0.3 & Swagger UI (`/api-docs`, `/api-docs.json`)**:
  - Mounted `swagger-ui-express` on `/api-docs` with custom site title and clean topbar.
  - Exposed raw OpenAPI 3.0.3 specification JSON at `/api-docs.json` for automated tooling and Postman import.
  - Comprehensive specification defined in `src/docs/swaggerSpec.js` covering 14 functional tags:
    - Auth, Products, Customers, PriceLists, Quotations, Approvals, Orders, Fulfillment, Invoices, Payments, Dashboard, Notifications, Activity, System.
    - Full request/response component schemas (`ApiResponse`, `ApiError`, `Pagination`, `LoginRequest`, `QuotationCreateRequest`, etc.) and Bearer JWT security scheme.
  - Tailored Content-Security-Policy in `src/middleware/securityHeaders.js` to allow Swagger UI scripts and styles specifically on `/api-docs` while preserving strict CSP across all API endpoints.
- **Pure Business Logic Unit Test Suite (`tests/unit.test.js`)**:
  - Implemented 28 zero-database pure unit tests verifying calculations with exact decimal precision:
    - **Authentication Utilities**: Bcrypt password hashing, verification, error handling on empty inputs, JWT sign/verify with HS256 algorithm enforcement, and user sanitization.
    - **Quotation Pricing & Margin Engine**: Line subtotal (`unitPrice * qty`), discount amount, taxable amount, margin amount (`net - cost`), margin percentage (`(margin / net) * 100`), and complete line item calculation.
    - **Discount Policy Engine**: Max allowed discount by active rule, discount deviation above allowed limit, and discount rule validation.
    - **Risk Assessment Engine**: Deterministic risk score accumulation (+15/+30/+50 discount deviation, +20/+35/+50 margin deficit, +10/+20 exposure, +5 bronze tier), risk level classification (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), and approval requirement triggers.
    - **Invoice & Billing Engine**: Item calculations, subtotal, total discount, tax, grand total, paid amounts from completed payments, outstanding amount with overpayment clamp, status derivation (`DRAFT`, `ISSUED`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`, `CANCELLED`), and state transition validation.
    - **Date Range Parser**: Preset handling ('today', 'yesterday', 'this_week', 'this_month', 'this_quarter', 'this_year', 'last_7_days', 'last_30_days'), custom date ranges, and validation error handling.
    - **Pagination Utilities**: Query parameter parsing, limit bounds clamping (1 to 100), default fallbacks, and standard pagination envelope formatting.
- **Node.js Native Test Coverage**:
  - Added npm scripts:
    - `"test:unit": "node --test tests/unit.test.js"`
    - `"test:coverage": "node --test --experimental-test-coverage tests/unit.test.js"`
  - Utilizes Node v24 built-in test coverage reporting without extra dependencies.
- **Postman Collection & Environment (`backend/postman/`)**:
  - `DealFlow360.postman_collection.json`: 14 categorized folders with 35+ fully pre-configured requests covering all platform endpoints.
  - `DealFlow360.postman_environment.json`: Pre-configured environment variables (`baseUrl`, `token`, `refreshToken`, entity IDs) with automatic token extraction test script on login.
- **Developer Documentation (`backend/docs/`)**:
  - `docs/ARCHITECTURE.md`: Complete architectural blueprint, 3-tier layering, domain engines, database transactions, concurrency, and security architecture.
  - `docs/FRONTEND_INTEGRATION.md`: React developer guide, authentication token storage, response envelopes, pagination, RBAC matrix, and end-to-end sales workflow guide.
  - `docs/API_ERRORS.md`: Reference catalog of HTTP status codes (400, 401, 403, 404, 409, 422, 429, 500) and domain error codes.
  - `docs/DEMO_CHECKLIST.md`: 23-point verification plan covering the full B2B sales lifecycle end-to-end.
- **Environment Templates & README Updates**:
  - Created `.env.example` in both `backend/` and project root `odoo-dealflow360/`.
  - Created root `README.md` detailing project overview, folder structure, and quick start instructions.
  - Updated `backend/README.md` with interactive Swagger links, cURL workflow examples, test runner commands, and developer guide references.
- **Full Test Suite Status**:
  - **427/427 automated tests pass natively with 0 failures** across all 14 test suites (`npm test` in ~17.5 seconds).

### [Update - 2026-09-05 / Session #15 (Phase 14 Production Deployment Readiness & CI/CD)]
- Completed production deployment hardening, containerization, automated CI/CD pipeline, operational runbooks, zero-dependency linting, and automated end-to-end smoke testing.
- **Health & Readiness Endpoints (`/health`, `/health/ready`, `/api/health/ready`)**:
  - `GET /health` (Liveness probe): Returns `200 OK` with system uptime, timestamp, and active environment status (`status: "ok"`).
  - `GET /health/ready` & `GET /api/health/ready` (Readiness probe): Verifies live database connectivity via `testDatabaseConnection()` (`SELECT 1`). Returns `200 OK` (`status: "ready"`, `database: "connected"`) when operational, or `503 Service Unavailable` (`status: "unhealthy"`, `database: "disconnected"`) if the database is unreachable. Completely conceals database credentials and stack traces from probes.
- **Production Configuration & Environment Hardening**:
  - `src/config/env.js`: Enforces production JWT secret entropy (>= 32 characters), valid PostgreSQL connection strings, and warns on insecure configurations in production.
  - `src/config/corsOptions.js`: Configured strict origin matching with production warnings when wildcard (`*`) origins are attempted.
- **Zero-Dependency Linting & Build Verification (`scripts/lint.js`)**:
  - Created recursive syntax and parsing validation script using native Node.js (`node --check`).
  - Validates all 109 JavaScript files across `src/`, `tests/`, and `scripts/` in under 1 second with 0 external dependencies.
  - Added `npm run lint` and `npm run build` commands to `package.json`.
- **Automated 17-Step End-to-End Smoke Test (`scripts/smokeTest.js`)**:
  - Implemented comprehensive, realistic Lead-to-Cash smoke testing script executing 17 sequential business operations against the live API:
    1. Liveness check (`GET /health`)
    2. Readiness check (`GET /health/ready`)
    3. Authentication & JWT token generation (Sales Rep)
    4. Fetch active customer
    5. Fetch active product catalog
    6. Price list resolution for customer tier
    7. Create draft quotation with line items
    8. Calculate pricing, margins, and taxes
    9. Submit quotation for approval
    10. Multi-role authorization & Sales Manager approval
    11. Financial risk assessment & Finance Manager approval
    12. Quotation to sales order conversion
    13. Warehouse fulfillment tracking & assignment
    14. Sales order to invoice generation
    15. Issue invoice & post general ledger status
    16. Record payment against invoice
    17. Role-aware dashboard KPI retrieval (`GET /api/dashboard/summary`)
  - Added `npm run smoke` command to execute the full workflow against any running instance.
- **Docker Containerization & Multi-Stage Builds**:
  - `backend/Dockerfile`: Multi-stage Dockerfile based on `node:20-alpine` for minimal image size and fast cold starts. Runs as non-root user (`node`) for container security. Includes built-in `HEALTHCHECK` probe targeting `/health`.
  - `backend/.dockerignore`: Excludes `node_modules`, `.env`, logs, coverage reports, test artifacts, and Git metadata from Docker build context.
  - `docker-compose.yml`: Root multi-container orchestration configuring:
    - `postgres` service: PostgreSQL 15 Alpine, persistent named volume (`pgdata`), container healthcheck.
    - `backend` service: Node.js API container depending on PostgreSQL health status, configured with environment variables, ports, and automatic restart policy.
- **Automated CI/CD Pipeline (`.github/workflows/ci.yml`)**:
  - Standardized GitHub Actions workflow triggering on pushes and pull requests to `main` and `develop`:
    - Sets up Node.js 20 runtime with npm dependency caching.
    - Starts PostgreSQL service container with health checks.
    - Executes clean dependency install (`npm ci`).
    - Generates Prisma client bindings (`npx prisma generate`).
    - Executes zero-dependency linting (`npm run lint`).
    - Deploys database schema migrations (`npx prisma migrate deploy`).
    - Seeds test database (`npm run prisma:seed`).
    - Runs pure unit test suite (`npm run test:unit`).
    - Executes native test coverage validation (`npm run test:coverage`).
    - Executes full platform test suite (427 tests).
    - Verifies production build syntax check (`npm run build`).
    - Runs security dependency audit (`npm audit --audit-level=high`).
- **Production Operations & Runbook Documentation**:
  - `backend/docs/DEPLOYMENT.md`: Production deployment runbook detailing architecture, pre-deployment checklist, environment setup, PM2 process management, Docker deployment, non-destructive database migrations (`prisma migrate deploy`), rollback procedures, and emergency response.
  - `backend/docs/BACKUP_RESTORE.md`: Disaster recovery and database backup runbook detailing `pg_dump` custom archive backups, `pg_restore` point-in-time recovery, automated daily cron backup script with 30-day retention, backup verification commands, and restoration drills.
- **README Documentation Updates**:
  - Updated root `README.md` and `backend/README.md` with Phase 14 production deployment instructions, Docker Compose startup, health probe endpoints, backup/restore commands, smoke test usage, and CI/CD workflow status.
- **Full Test Suite Status**:
  - **427/427 automated tests pass natively with 0 failures** across all 14 test suites (`npm test` in ~18.2 seconds).
  - **109/109 JavaScript files verified** with `npm run lint` (0 errors).
  - **17/17 smoke test steps verified** with `npm run smoke` (100% success).
