# DealFlow360 System Architecture & Engineering Design

## 1. Executive Overview
DealFlow360 is an enterprise B2B Sales Operations Platform designed to streamline the lead-to-cash lifecycle for medium-to-large business-to-business commerce. It models complex multi-party sales workflows, tiered customer pricing, rule-based discounting, multi-factor risk assessment, sequential multi-stage managerial and financial approval workflows, inventory reservation and fulfillment, tax-compliant invoicing, multi-method payment settlement, role-aware analytics dashboards, real-time in-app notifications, and tamper-evident audit trails.

---

## 2. Layered Architectural Blueprint

DealFlow360 follows a strict, modular **Layered Architecture** (Controller-Service-Data Access) built on Node.js (ESM), Express.js, and Prisma ORM backed by PostgreSQL.

```
                                  +---------------------------------------+
                                  |     React Client / API Consumer       |
                                  +---------------------------------------+
                                                     |  HTTPS / JSON
                                                     v
+---------------------------------------------------------------------------------------------------------+
|                                          EXPRESS API GATEWAY                                            |
|                                                                                                         |
|  [Security Headers]  ->  [CORS]  ->  [Request Logger]  ->  [JSON Limit]  ->  [Parameter Sanitizer]     |
|                                                                                                         |
|  [General Rate Limiter] (100 req/min)  /  [Auth Rate Limiter] (10 req/15min)                             |
|                                                                                                         |
|  [JWT Auth Middleware]  ->  [RBAC Middleware] (ADMIN | SALES_REP | SALES_MANAGER | FINANCE | OPS)        |
+---------------------------------------------------------------------------------------------------------+
                                                     |
                                                     v
+---------------------------------------------------------------------------------------------------------+
|                                           CONTROLLER LAYER                                              |
|  - Request parameter extraction and Zod schema validation                                              |
|  - Delegation to domain services                                                                        |
|  - Uniform response envelope serialization (sendSuccess / sendCreated / sendPaginated)                   |
|  - Centralized global error handling via AppError                                                       |
+---------------------------------------------------------------------------------------------------------+
                                                     |
                                                     v
+---------------------------------------------------------------------------------------------------------+
|                                            SERVICE LAYER                                                |
|                                                                                                         |
|  +--------------------+   +--------------------+   +--------------------+   +--------------------+      |
|  |  Quotation Engine  |-->|  Discount Engine   |-->|    Risk Engine     |-->|  Approval Workflow |      |
|  +--------------------+   +--------------------+   +--------------------+   +--------------------+      |
|            |                                                                              |             |
|            v                                                                              v             |
|  +--------------------+   +--------------------+   +--------------------+   +--------------------+      |
|  |    Order Engine    |-->| Fulfillment Engine |-->|   Billing Engine   |-->|   Payment Engine   |      |
|  +--------------------+   +--------------------+   +--------------------+   +--------------------+      |
|            |                                                                              |             |
|            +------------------------------------------------------------------------------+             |
|                                                     |                                                   |
|                                                     v                                                   |
|                         +---------------------------------------+                                       |
|                         | Notification & Activity Event Engine  |                                       |
|                         +---------------------------------------+                                       |
+---------------------------------------------------------------------------------------------------------+
                                                     |
                                                     v
+---------------------------------------------------------------------------------------------------------+
|                                          DATA ACCESS LAYER                                              |
|  Prisma Client (ORM) with Interactive Database Transactions ($transaction)                              |
|  PostgreSQL 14+ Relational Database Engine                                                             |
|  - 14 Normalized Relational Models                                                                      |
|  - ACID Transaction Guarantees                                                                          |
|  - Optimistic / Pessimistic Concurrency Controls                                                        |
|  - Strict Foreign Keys, Unique Indexes, and Cascade Rules                                               |
+---------------------------------------------------------------------------------------------------------+
```

---

## 3. Core Domain Engines & Business Logic

### 3.1 Quotation & Pricing Engine
- **Hierarchical Price Determination**: Dynamically determines product price based on customer price lists, tier rules, and base prices.
- **Financial Precision**: All calculations use two-decimal rounding (`toFixed(2)`) preventing floating-point drift:
  - `grossAmount = unitPrice * quantity`
  - `discountAmount = (grossAmount * discountPercentage) / 100`
  - `netAmount = grossAmount - discountAmount`
  - `taxAmount = (netAmount * taxRate) / 100`
  - `lineTotal = netAmount + taxAmount`
  - `marginAmount = netAmount - (costPrice * quantity)`
  - `marginPercentage = (marginAmount / netAmount) * 100`

### 3.2 Discount Policy Engine
- Matches customer tiers (`BRONZE`, `SILVER`, `GOLD`, `PLATINUM`) with product category discount limits.
- Evaluates `calculateDiscountDeviation(requested, allowed)`.
- Requests within allowed limits proceed seamlessly; deviations trigger risk penalties and managerial review.

### 3.3 Multi-Factor Risk Assessment Engine
- Calculates deterministic risk score (0 to 100) based on 4 independent factors:
  1. **Discount Deviation**: Slight (+15), Moderate (+30), High (+50)
  2. **Margin Health Deficit**: Deficit below category threshold (+20 to +50); Negative margin automatically incurs +50 severe penalty.
  3. **Financial Exposure**: Quotes > $50,000 (+10); Quotes > $100,000 (+20).
  4. **Tier Risk Factor**: BRONZE tier requesting deviation (+5).
- Maps scores to bands:
  - `0 - 29`: **LOW**
  - `30 - 59`: **MEDIUM**
  - `60 - 84`: **HIGH**
  - `85 - 100`: **CRITICAL**

### 3.4 Multi-Stage Approval Workflow
- Enforces strict role separation:
  - **Step 1**: `SALES_MANAGER` approval required if discount deviation > 0 or manager threshold exceeded.
  - **Step 2**: `FINANCE` approval required if margin deficit > 0, exposure > $100k, or finance threshold exceeded.
- Anti-Self-Approval: Sales representatives cannot approve their own submitted quotations.
- Rejection requires explicit comments and terminates the quotation in `REJECTED` status.

### 3.5 Order Management & Fulfillment Engine
- Transforms approved quotes into immutable Orders inside an atomic transaction.
- **Stock Reservation**: On order confirmation, stock is reserved to prevent overselling.
- **Shipment Deductions**: On shipment dispatch, physical inventory is deducted from available warehouse stock.

### 3.6 Billing & Payment Settlement Engine
- Invoices are issued against sales orders.
- Supports split payments and multiple payment methods (`BANK_TRANSFER`, `CREDIT_CARD`, `CHEQUE`, etc.).
- Balances are updated atomically:
  - `paidAmount = sum(valid_payments)`
  - `outstandingAmount = max(0, totalAmount - paidAmount)`
  - Automatic status transitions: `ISSUED` -> `PARTIALLY_PAID` -> `PAID` (or `OVERDUE` if past due date).

### 3.7 Notification & System Activity Stream
- Decoupled, non-blocking notification dispatch on key business events (quote submitted, approved, rejected, order confirmed, shipment dispatched, payment recorded).
- Unread badge counters, instant read status updates, and audit timeline tracking.

---

## 4. Security & Production Hardening Architecture
- **OWASP-Compliant Security Headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, strict Referrer-Policy, and tailored Content-Security-Policy.
- **Defense in Depth**:
  - Request body size capped at 500KB.
  - Parameter sanitization stripping prototype pollution (`__proto__`, `constructor`, `prototype`) and control characters.
  - Rate limiting separating general API traffic (100 req/min) from sensitive auth routes (10 req/15min).
  - Explicit algorithm locking on JWT tokens (`HS256`).
