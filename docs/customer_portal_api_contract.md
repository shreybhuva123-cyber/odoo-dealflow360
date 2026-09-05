# DealFlow360 — Customer Portal API Integration Contract
**Version:** 1.0.0  
**Domain:** Customer Portal & Backend Integration  
**Base URL:** `https://api.dealflow360.com/api/v1/portal` (Staging: `https://staging-api.dealflow360.com/api/v1/portal`)  
**Specification Format:** REST / JSON (RFC 8259)  
**Error Standard:** RFC 7807 Problem Details compliant  

---

## Table of Contents
1. [Architecture & Protocol Standards](#1-architecture--protocol-standards)
2. [Authentication & Session Lifecycle](#2-authentication--session-lifecycle)
3. [Customer Authorization & Security Rules](#3-customer-authorization--security-rules)
4. [Standard Enums, Statuses & State Machines](#4-standard-enums-statuses--state-machines)
   - 4.1. [Quote Status (`quote_status`)](#41-quote-status)
   - 4.2. [Negotiation Status (`negotiation_status`)](#42-negotiation-status)
   - 4.3. [Approval Status (`approval_status`)](#43-approval-status)
   - 4.4. [Author Type & Visibility](#44-author-type--visibility)
5. [Core Data Schemas](#5-core-data-schemas)
   - 5.1. [Pagination Envelope](#51-pagination-envelope)
   - 5.2. [Error Response Format (RFC 7807)](#52-error-response-format)
   - 5.3. [Quote Revision Structure](#53-quote-revision-structure)
   - 5.4. [Comment & Message Structure](#54-comment--message-structure)
   - 5.5. [Change Request Structure](#55-change-request-structure)
   - 5.6. [Counter-Discount Structure](#56-counter-discount-structure)
   - 5.7. [Confirmation Response Structure](#57-confirmation-response-structure)
   - 5.8. [Approval Status Structure](#58-approval-status-structure)
   - 5.9. [Notification Structure](#59-notification-structure)
6. [Complete API Specification](#6-complete-api-specification)
   - 6.1. `POST /auth/login` (Customer Authentication)
   - 6.2. `POST /auth/refresh` (Token Refresh)
   - 6.3. `POST /auth/logout` (Session Termination)
   - 6.4. `GET /auth/me` (Profile & Company Context)
   - 6.5. `GET /quotes` (List Customer Quotes)
   - 6.6. `GET /quotes/{quote_id}` (Get Quote Details)
   - 6.7. `GET /quotes/{quote_id}/pdf` (Download Official Quote PDF)
   - 6.8. `POST /quotes/{quote_id}/accept` (Formal Quote Acceptance / Sign)
   - 6.9. `POST /quotes/{quote_id}/reject` (Decline Quote)
   - 6.10. `POST /quotes/{quote_id}/negotiation/change-request` (Submit Scope/Line Change)
   - 6.11. `POST /quotes/{quote_id}/negotiation/counter-discount` (Submit Counter-Discount Offer)
   - 6.12. `GET /quotes/{quote_id}/negotiation/status` (Get Real-Time Negotiation & Approval Status)
   - 6.13. `GET /quotes/{quote_id}/revisions` (Get Quote Revision History)
   - 6.14. `GET /quotes/{quote_id}/revisions/{revision_id}/diff` (Inspect Revision Diff)
   - 6.15. `GET /quotes/{quote_id}/comments` (List Threaded Comments)
   - 6.16. `POST /quotes/{quote_id}/comments` (Post Customer Comment)
   - 6.17. `POST /quotes/{quote_id}/attachments` (Upload File Attachment)
   - 6.18. `GET /notifications` (List Notifications)
   - 6.19. `PATCH /notifications/{notification_id}/read` (Mark Notification as Read)
   - 6.20. `PATCH /notifications/read-all` (Mark All Notifications as Read)
7. [HTTP Status Codes Reference](#7-http-status-codes-reference)

---

## 1. Architecture & Protocol Standards

- **Transport:** HTTPS exclusively (TLS 1.3 required in production).
- **Encoding:** `UTF-8` for all requests and responses.
- **Payload Format:** `application/json` for API requests and responses (except file uploads which use `multipart/form-data` and PDF download which streams `application/pdf`).
- **Date/Time Standard:** ISO-8601 extended format with explicit timezone offsets: `YYYY-MM-DDTHH:mm:ss.sssZ` (e.g., `2026-09-05T10:45:00.000Z`).
- **Currency & Money Representation:** All monetary values are transferred as JSON numeric decimals with two decimal places (e.g., `12450.00`), alongside an explicit 3-letter ISO-4217 currency code (e.g., `"USD"`, `"EUR"`).
- **Idempotency:** State-altering operations (`POST` to accept, reject, submit change, submit discount) accept an optional `Idempotency-Key: <UUIDv4>` header. If re-sent with the same key within 24 hours, the backend returns the cached response without re-executing business logic.

---

## 2. Authentication & Session Lifecycle

### 2.1 Mechanism: Dual-Token Bearer Authentication
- **Access Token:** Short-lived JWT (Lifespan: 15 minutes).
  - Sent via standard HTTP header: `Authorization: Bearer <access_token>`
  - Payload claims:
    ```json
    {
      "sub": "usr_c91f0e4b81",
      "partner_id": 4821,
      "commercial_partner_id": 1205,
      "email": "sarah.connor@cyberdyne-defense.com",
      "role": "portal_customer",
      "company_name": "Cyberdyne Defense Systems",
      "iss": "dealflow360-auth",
      "aud": "dealflow360-portal",
      "iat": 1788605100,
      "exp": 1788606000
    }
    ```
- **Refresh Token:** Long-lived encrypted token (Lifespan: 7 days).
  - Transmitted via an `HttpOnly`, `Secure`, `SameSite=Strict` cookie (`df360_rt`) or returned in response JSON for headless mobile/external clients.

### 2.2 Unauthenticated Handling
If an endpoint requires authentication and the header is missing, malformed, or expired:
- Return `401 Unauthorized` with header `WWW-Authenticate: Bearer error="invalid_token"`.

---

## 3. Customer Authorization & Security Rules

1. **Strict Multi-Tenant / Commercial Partner Boundary:**
   - Every authenticated portal user is bound to a single `commercial_partner_id` (Parent Account) and `partner_id` (Contact ID).
   - A customer can **only** view or interact with quotes where:
     `quote.partner_id == request.user.partner_id` OR `quote.commercial_partner_id == request.user.commercial_partner_id`.
   - Any query or path param requesting a `quote_id` outside the customer's partner domain **must return `404 Not Found`** (not `403`), preventing ID enumeration and existence leakage.

2. **Signatory Authorization:**
   - Accepting or signing a quote (`POST /quotes/{id}/accept`) requires the user to have the `"can_sign_quotes": true` attribute on their contact profile. If false, backend responds with `403 Forbidden` (`FORBIDDEN_SIGNATORY_REQUIRED`).

3. **Data Redaction & Information Isolation (Strict Zero-Leak Guarantee):**
   - Under no circumstances does the backend serializer expose internal Odoo fields to the portal API:
     - ❌ `standard_price` / Cost price / Product Margin
     - ❌ Internal Sales Team Notes (`dealflow.internal_note`)
     - ❌ Commission percentages
     - ❌ Sales rep internal chatter / internal email logs
     - ❌ Specific backend user IDs or internal database primary keys not meant for portal exposure

4. **Rate Limiting:**
   - General Portal endpoints: 120 requests/minute per IP/User.
   - Negotiation & Acceptance endpoints: 10 requests/minute per quote to prevent spamming.
   - Exceeding limits returns `429 Too Many Requests` with `Retry-After: <seconds>` header.

---

## 4. Standard Enums, Statuses & State Machines

### 4.1. Quote Status (`quote_status`)
Represents the lifecycle stage of the quote document:
| Value | Description | Customer Action Allowed |
|---|---|---|
| `draft` | Quote is being prepared internally. Invisible to customer portal. | None (Hidden from portal) |
| `sent` | Quote is published to portal and awaiting customer review. | Accept, Reject, Request Changes, Counter-Discount, Comment |
| `in_negotiation` | A counter-discount or change request is actively being reviewed. | Comment, View Diff, Cancel Request |
| `revision_pending` | Seller has agreed to revise and is compiling a new revision. | Comment, View Details |
| `approved` | Quote has been formally signed and accepted by customer. | View, Download PDF, Comment |
| `rejected` | Quote has been rejected by customer or abandoned by seller. | View historical record only |
| `expired` | Expiration date passed without signature or active negotiation. | Request Re-activation via comment |
| `converted` | Quote converted into a confirmed Sales Order / Contract. | View reference, Download contract |
| `cancelled` | Quote voided by seller due to business withdrawal. | View historical record only |

### 4.2. Negotiation Status (`negotiation_status`)
Represents the active negotiation sub-state on a quote:
| Value | Description |
|---|---|
| `none` | No active negotiation; quote is standard `sent` state. |
| `open` | Customer has submitted a change request or counter-discount; awaiting seller acknowledgement. |
| `pending_seller_review` | Assigned sales agent / account executive is evaluating the customer's terms. |
| `pending_internal_approval` | Counter-discount or scope alteration requires higher management/finance sign-off. |
| `pending_buyer_review` | Seller has countered the customer's proposal; waiting for customer to accept or respond. |
| `accepted` | Negotiation successfully concluded; new revision generated and agreed. |
| `rejected` | Seller formally declined the requested counter-discount or changes. |

### 4.3. Approval Status (`approval_status`)
Reflects seller's internal escalation tiers (visible to portal in high-level sanitized status):
| Value | Description |
|---|---|
| `not_required` | Proposed terms fall within standard delegation of authority limits. |
| `pending_manager` | Requires Sales Director approval (e.g. discount > 15%). |
| `pending_finance` | Requires VP / CFO approval (e.g. discount > 25% or modified payment terms). |
| `approved` | All required internal approval tiers granted. |
| `rejected` | Internal approval denied by management. |

### 4.4. Author Type & Visibility
| Value | Description | Portal Rule |
|---|---|---|
| `customer` | Written by customer contact. | Always visible to customer & sales rep. |
| `sales_agent` | Written by account executive / sales rep. | Always visible to customer. |
| `system` | Automated event (e.g. revision generated, status changed). | Visible if customer-facing flag is true. |
| `internal` | Internal team private chatter. | **Filtered out at SQL level. Never returned.** |

---

## 5. Core Data Schemas

### 5.1. Pagination Envelope
All listing endpoints return pagination metadata in an envelope:
```json
{
  "data": [],
  "meta": {
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_items": 58,
      "total_pages": 3,
      "has_next_page": true,
      "has_prev_page": false
    }
  },
  "links": {
    "self": "/api/v1/portal/quotes?page=1&per_page=20",
    "next": "/api/v1/portal/quotes?page=2&per_page=20",
    "prev": null,
    "first": "/api/v1/portal/quotes?page=1&per_page=20",
    "last": "/api/v1/portal/quotes?page=3&per_page=20"
  }
}
```

### 5.2. Error Response Format (RFC 7807)
Standardized error format returned across all `4xx` and `5xx` responses:
```json
{
  "type": "https://errors.dealflow360.com/quote-expired",
  "title": "Quote Expired",
  "status": 409,
  "code": "QUOTE_ALREADY_EXPIRED",
  "detail": "Quote QUO-2026-0048 expired on 2026-08-31T23:59:59Z and cannot be accepted.",
  "instance": "/api/v1/portal/quotes/quo_8819ab2/accept",
  "invalid_params": [
    {
      "field": "quote_id",
      "reason": "Current status is 'expired'. Acceptance requires active 'sent' status."
    }
  ],
  "timestamp": "2026-09-05T10:45:00.120Z"
}
```

### 5.3. Quote Revision Structure
Represents a snapshot version of a quote:
```json
{
  "revision_id": "rev_002",
  "revision_number": 2,
  "quote_id": "quo_8819ab2",
  "parent_revision_id": "rev_001",
  "created_at": "2026-09-03T14:22:00Z",
  "created_by": {
    "name": "Alex Mercer",
    "role": "Senior Account Executive",
    "type": "sales_agent"
  },
  "change_summary": "Applied 7.5% volume discount as requested and updated delivery milestone.",
  "subtotal_amount": 92500.00,
  "discount_total_amount": 7500.00,
  "tax_total_amount": 7400.00,
  "total_amount": 99900.00,
  "currency": "USD",
  "status": "current"
}
```

### 5.4. Comment & Message Structure
Threaded interaction between customer and sales team:
```json
{
  "comment_id": "cmt_991823",
  "quote_id": "quo_8819ab2",
  "parent_comment_id": null,
  "author": {
    "id": "usr_c91f0e4b81",
    "name": "Sarah Connor",
    "email": "sarah.connor@cyberdyne-defense.com",
    "type": "customer",
    "avatar_url": "https://cdn.dealflow360.com/avatars/usr_c91f0e4b81.png"
  },
  "message": "Could we please clarify if Level-2 support SLA includes 24/7 weekend emergency coverage?",
  "created_at": "2026-09-04T09:15:22Z",
  "attachments": [
    {
      "attachment_id": "att_4410",
      "filename": "SLA_Clarification_Scope.pdf",
      "file_size_bytes": 284102,
      "mime_type": "application/pdf",
      "download_url": "https://api.dealflow360.com/api/v1/portal/quotes/quo_8819ab2/attachments/att_4410"
    }
  ]
}
```

### 5.5. Change Request Structure
Customer requested modifications to line items, quantities, or deliverables:
```json
{
  "change_request_id": "cr_10928",
  "quote_id": "quo_8819ab2",
  "submitted_at": "2026-09-04T11:00:00Z",
  "status": "pending_seller_review",
  "customer_justification": "We need to scale back the initial on-site training sessions from 5 to 3 due to internal team scheduling constraints.",
  "line_item_changes": [
    {
      "line_id": "line_4021",
      "product_name": "On-Site Implementation & Training Workshop",
      "current_quantity": 5,
      "requested_quantity": 3,
      "current_unit_price": 2500.00,
      "requested_unit_price": 2500.00,
      "reason": "Team availability restriction"
    }
  ],
  "terms_changes": [
    {
      "term_type": "delivery_schedule",
      "current_value": "Delivery within 30 days of contract signature",
      "requested_value": "Delivery phased: Phase 1 within 15 days, Phase 2 in 45 days"
    }
  ]
}
```

### 5.6. Counter-Discount Structure
Pricing counter-proposals submitted by the customer:
```json
{
  "counter_discount_id": "cd_7719",
  "quote_id": "quo_8819ab2",
  "submitted_at": "2026-09-04T11:30:00Z",
  "status": "pending_seller_review",
  "discount_type": "percentage",
  "current_quote_total": 107400.00,
  "requested_discount_percent": 10.0,
  "requested_target_price": 96660.00,
  "currency": "USD",
  "customer_budget_notes": "We have an approved fiscal year cap of $98,000 for this initiative. If you can meet us at $96,660, we can execute the contract this week.",
  "scope_compromise_offered": "Willing to extend payment terms from Net 30 to Net 15 in return."
}
```

### 5.7. Confirmation Response Structure
Standardized response acknowledging formal acceptance or cancellation:
```json
{
  "confirmation_id": "cnf_381902",
  "quote_id": "quo_8819ab2",
  "quote_number": "QUO-2026-0048",
  "action_type": "quote_accepted",
  "status": "approved",
  "reference_order_number": "SO-2026-1184",
  "confirmed_at": "2026-09-05T10:42:00Z",
  "signatory": {
    "name": "Sarah Connor",
    "email": "sarah.connor@cyberdyne-defense.com",
    "ip_address": "198.51.100.42"
  },
  "message": "Quote QUO-2026-0048 has been successfully accepted and confirmed. Sales Order SO-2026-1184 has been created.",
  "next_steps": [
    "An email confirmation with the counter-signed contract PDF has been dispatched.",
    "Your dedicated onboarding engineer Alex Mercer will contact you within 1 business day."
  ],
  "contract_download_url": "/api/v1/portal/quotes/quo_8819ab2/pdf?version=final_signed"
}
```

### 5.8. Approval Status Structure
Visibility into internal escalation for negotiation requests:
```json
{
  "quote_id": "quo_8819ab2",
  "negotiation_id": "cd_7719",
  "overall_approval_status": "pending_internal_approval",
  "current_tier": "Tier 2: Regional Sales Director",
  "total_tiers": 2,
  "completed_tiers": 1,
  "escalated_at": "2026-09-04T12:00:00Z",
  "estimated_resolution_time": "2026-09-05T18:00:00Z",
  "public_status_message": "Your counter-proposal requires standard director-level pricing review. Currently with sales leadership."
}
```

### 5.9. Notification Structure
Real-time / inbox notifications for portal users:
```json
{
  "notification_id": "notif_5521",
  "recipient_id": "usr_c91f0e4b81",
  "event_type": "quote_revision_published",
  "title": "New Quote Revision Published",
  "message": "Alex Mercer published Revision #2 for Quote QUO-2026-0048 with updated pricing.",
  "quote_id": "quo_8819ab2",
  "quote_number": "QUO-2026-0048",
  "target_route": "/portal/quotes/quo_8819ab2?revision=2",
  "is_read": false,
  "created_at": "2026-09-04T14:25:00Z"
}
```

---

## 6. Complete API Specification

---

### 6.1. `POST /auth/login` (Customer Authentication)
- **Who calls it?** Customer Portal Frontend SPA (Login Screen).
- **When is it called?** When the customer enters their email and password / magic link token.
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "sarah.connor@cyberdyne-defense.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response Body (`200 OK`):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5c...",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": {
      "id": "usr_c91f0e4b81",
      "name": "Sarah Connor",
      "email": "sarah.connor@cyberdyne-defense.com",
      "partner_id": 4821,
      "commercial_partner_id": 1205,
      "company_name": "Cyberdyne Defense Systems",
      "can_sign_quotes": true
    }
  }
  ```
- **Cookies Set:** `df360_rt=<refresh_token>; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/portal/auth`
- **Failure Cases:**
  - `400 Bad Request`: Email/password missing or format invalid.
  - `401 Unauthorized`: Invalid credentials or account disabled (`INVALID_CREDENTIALS`).
  - `429 Too Many Requests`: Exceeded 5 failed attempts in 10 minutes (`LOGIN_ATTEMPTS_THROTTLED`).

---

### 6.2. `POST /auth/refresh` (Token Refresh)
- **Who calls it?** Customer Portal HTTP Interceptor (e.g. Axios/Fetch interceptor).
- **When is it called?** Silently in the background when the 15-minute access token expires (`401` intercept).
- **Headers:** Empty or `Cookie: df360_rt=<token>` (if browser) / Request body `{ "refresh_token": "..." }` (if mobile).
- **Request Body (Optional if Cookie present):**
  ```json
  {
    "refresh_token": "rt_8a91024bd81f"
  }
  ```
- **Response Body (`200 OK`):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5c_NEW...",
    "token_type": "Bearer",
    "expires_in": 900
  }
  ```
- **Failure Cases:**
  - `401 Unauthorized`: Refresh token expired, revoked, or invalid (`SESSION_EXPIRED`). Frontend immediately redirects user to `/login`.

---

### 6.3. `POST /auth/logout` (Session Termination)
- **Who calls it?** Customer Portal Frontend (Logout Button in Topbar).
- **When is it called?** When user explicitly signs out.
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:** `{}`
- **Response Body (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Logged out successfully. Session invalidated."
  }
  ```
- **Failure Cases:**
  - `401 Unauthorized`: Handled gracefully by frontend by purging local state.

---

### 6.4. `GET /auth/me` (Profile & Company Context)
- **Who calls it?** Customer Portal Frontend App Root / Layout.
- **When is it called?** On initial app load to initialize the global user and permissions context.
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:** None
- **Response Body (`200 OK`):**
  ```json
  {
    "id": "usr_c91f0e4b81",
    "name": "Sarah Connor",
    "email": "sarah.connor@cyberdyne-defense.com",
    "phone": "+1 (555) 019-2834",
    "partner_id": 4821,
    "commercial_partner_id": 1205,
    "company_name": "Cyberdyne Defense Systems",
    "can_sign_quotes": true,
    "unread_notifications_count": 3
  }
  ```
- **Failure Cases:**
  - `401 Unauthorized`: Redirect to login.

---

### 6.5. `GET /quotes` (List Customer Quotes)
- **Who calls it?** Quotes Dashboard / Pipeline Page.
- **When is it called?** When customer navigates to the DealFlow Quotes page or updates filter pills/tabs.
- **Headers:** `Authorization: Bearer <access_token>`
- **Query Parameters:**
  - `status` (optional): Filter by `quote_status` (`sent`, `in_negotiation`, `approved`, `rejected`, `expired`). Multiple comma-separated allowed (e.g. `sent,in_negotiation`).
  - `search` (optional): String query matching quote number, deal title, or sales rep name.
  - `page` (optional, default: `1`): Integer >= 1.
  - `per_page` (optional, default: `10`, max: `50`): Integer.
  - `sort_by` (optional, default: `-created_at`): `created_at`, `total_amount`, `expiration_date` (prefix with `-` for descending).
- **Request Body:** None
- **Response Body (`200 OK`):**
  ```json
  {
    "data": [
      {
        "quote_id": "quo_8819ab2",
        "quote_number": "QUO-2026-0048",
        "title": "Enterprise Cloud Migration & Threat Defense Suite",
        "status": "sent",
        "negotiation_status": "none",
        "revision_number": 1,
        "total_amount": 107400.00,
        "currency": "USD",
        "expiration_date": "2026-09-30T23:59:59Z",
        "created_at": "2026-09-01T08:00:00Z",
        "sales_rep": {
          "name": "Alex Mercer",
          "email": "alex.mercer@dealflow360.com",
          "avatar_url": "https://cdn.dealflow360.com/team/alex.png"
        },
        "has_active_negotiation": false,
        "unread_comments_count": 1
      }
    ],
    "meta": {
      "pagination": {
        "current_page": 1,
        "per_page": 10,
        "total_items": 1,
        "total_pages": 1,
        "has_next_page": false,
        "has_prev_page": false
      }
    },
    "links": {
      "self": "/api/v1/portal/quotes?page=1&per_page=10",
      "next": null,
      "prev": null,
      "first": "/api/v1/portal/quotes?page=1&per_page=10",
      "last": "/api/v1/portal/quotes?page=1&per_page=10"
    }
  }
  ```
- **Failure Cases:**
  - `400 Bad Request`: Invalid query parameters (e.g. invalid status enum or negative page).
  - `401 Unauthorized`: Session expired.

---

### 6.6. `GET /quotes/{quote_id}` (Get Quote Details)
- **Who calls it?** Quote Detail & Review View.
- **When is it called?** When user clicks a quote card to view its full details, line items, pricing, and active status.
- **Headers:** `Authorization: Bearer <access_token>`
- **URL Parameters:** `quote_id` (string, e.g. `quo_8819ab2`)
- **Request Body:** None
- **Response Body (`200 OK`):**
  ```json
  {
    "quote_id": "quo_8819ab2",
    "quote_number": "QUO-2026-0048",
    "title": "Enterprise Cloud Migration & Threat Defense Suite",
    "status": "sent",
    "negotiation_status": "none",
    "revision_number": 1,
    "created_at": "2026-09-01T08:00:00Z",
    "expiration_date": "2026-09-30T23:59:59Z",
    "currency": "USD",
    "pricing_summary": {
      "subtotal": 100000.00,
      "discount_total": 0.00,
      "discount_percentage": 0.0,
      "tax_total": 7400.00,
      "total_amount": 107400.00
    },
    "sales_rep": {
      "name": "Alex Mercer",
      "email": "alex.mercer@dealflow360.com",
      "phone": "+1 (555) 302-8811",
      "avatar_url": "https://cdn.dealflow360.com/team/alex.png"
    },
    "customer": {
      "company_name": "Cyberdyne Defense Systems",
      "contact_name": "Sarah Connor",
      "billing_address": "800 Cyberdyne Blvd, Sunnyvale, CA",
      "shipping_address": "800 Cyberdyne Blvd, Sunnyvale, CA"
    },
    "line_items": [
      {
        "line_id": "line_4020",
        "product_id": "prod_cloud_01",
        "name": "Core Security Infrastructure License",
        "description": "Annual enterprise tier license with automated anomaly detection.",
        "quantity": 1.0,
        "uom": "Units",
        "unit_price": 87500.00,
        "discount_percent": 0.0,
        "subtotal": 87500.00,
        "tax_rate_percent": 7.4,
        "tax_amount": 6475.00,
        "total_amount": 93975.00
      },
      {
        "line_id": "line_4021",
        "product_id": "prod_trg_02",
        "name": "On-Site Implementation & Training Workshop",
        "description": "Comprehensive engineer onboarding, 5 full-day sessions.",
        "quantity": 5.0,
        "uom": "Days",
        "unit_price": 2500.00,
        "discount_percent": 0.0,
        "subtotal": 12500.00,
        "tax_rate_percent": 7.4,
        "tax_amount": 925.00,
        "total_amount": 13425.00
      }
    ],
    "terms_and_conditions": "Payment due Net 30 days from invoice date. Implementation starts within 14 days of signature.",
    "payment_terms": "Immediate (Net 30)",
    "can_accept": true,
    "can_negotiate": true
  }
  ```
- **Failure Cases:**
  - `404 Not Found`: Quote does not exist or does not belong to the user's commercial partner (`QUOTE_NOT_FOUND`).

---

### 6.7. `GET /quotes/{quote_id}/pdf` (Download Official Quote PDF)
- **Who calls it?** Customer Portal (Download / Print PDF button).
- **When is it called?** When user wants an offline, formal copy of the quote or signed contract.
- **Headers:** `Authorization: Bearer <access_token>`
- **Query Parameters:** `revision` (optional, default: current).
- **Request Body:** None
- **Response Body (`200 OK`):**
  - Binary stream: `Content-Type: application/pdf`
  - Header: `Content-Disposition: attachment; filename="DealFlow360_QUO-2026-0048_Rev1.pdf"`
- **Failure Cases:**
  - `404 Not Found`: Quote not found.
  - `500 Internal Server Error`: PDF rendering engine failure (`PDF_GENERATION_FAILED`).

---

### 6.8. `POST /quotes/{quote_id}/accept` (Formal Quote Acceptance / Sign)
- **Who calls it?** Customer Portal Acceptance Modal (E-Sign screen).
- **When is it called?** Customer clicks "Accept & Sign Quote", draws/types their digital signature, confirms acceptance of legal terms, and clicks "Confirm Agreement".
- **Headers:**
  - `Authorization: Bearer <access_token>`
  - `Content-Type: application/json`
  - `Idempotency-Key: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d` (UUIDv4)
- **Request Body:**
  ```json
  {
    "signer_name": "Sarah Connor",
    "signer_title": "Chief Technology Officer",
    "signature_type": "drawn",
    "signature_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "accepted_terms": true,
    "acceptance_ip": "198.51.100.42",
    "client_timestamp": "2026-09-05T10:41:55Z",
    "purchase_order_number": "PO-CYBER-9910"
  }
  ```
- **Response Body (`200 OK` / `201 Created`):**
  ```json
  {
    "confirmation_id": "cnf_381902",
    "quote_id": "quo_8819ab2",
    "quote_number": "QUO-2026-0048",
    "action_type": "quote_accepted",
    "status": "approved",
    "reference_order_number": "SO-2026-1184",
    "confirmed_at": "2026-09-05T10:42:00Z",
    "signatory": {
      "name": "Sarah Connor",
      "email": "sarah.connor@cyberdyne-defense.com",
      "ip_address": "198.51.100.42"
    },
    "message": "Quote QUO-2026-0048 has been successfully accepted and confirmed. Sales Order SO-2026-1184 has been created.",
    "next_steps": [
      "An email confirmation with the counter-signed contract PDF has been dispatched.",
      "Your dedicated onboarding engineer Alex Mercer will contact you within 1 business day."
    ],
    "contract_download_url": "/api/v1/portal/quotes/quo_8819ab2/pdf?version=final_signed"
  }
  ```
- **Failure Cases:**
  - `400 Bad Request`: `accepted_terms` is false, or `signature_data` is missing/corrupt (`TERMS_NOT_ACCEPTED`, `SIGNATURE_REQUIRED`).
  - `403 Forbidden`: Current user is not authorized to sign quotes (`FORBIDDEN_SIGNATORY_REQUIRED`).
  - `409 Conflict`: Quote is already in `approved`, `rejected`, or `expired` status (`QUOTE_INVALID_STATE`).
  - `422 Unprocessable Entity`: Validation failure on PO number or legal attributes.

---

### 6.9. `POST /quotes/{quote_id}/reject` (Decline Quote)
- **Who calls it?** Customer Portal "Decline Quote" Dialog.
- **When is it called?** Customer formally decides not to proceed with the quote.
- **Headers:** `Authorization: Bearer <access_token>`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "rejection_reason_code": "budget_unavailable",
    "rejection_feedback": "Project funding delayed to next calendar year. Will revisit in Q1.",
    "allow_resolicitation": true
  }
  ```
  *(Reason codes: `price_too_high`, `competitor_chosen`, `features_missing`, `budget_unavailable`, `timing_unfit`, `other`)*
- **Response Body (`200 OK`):**
  ```json
  {
    "quote_id": "quo_8819ab2",
    "quote_number": "QUO-2026-0048",
    "status": "rejected",
    "rejected_at": "2026-09-05T10:43:00Z",
    "message": "Quote has been declined. Your feedback has been relayed to the account team."
  }
  ```
- **Failure Cases:**
  - `400 Bad Request`: Invalid reason code.
  - `409 Conflict`: Quote already finalized or expired.

---

### 6.10. `POST /quotes/{quote_id}/negotiation/change-request` (Submit Scope/Line Change)
- **Who calls it?** Customer Portal Negotiation Drawer ("Request Scope Changes").
- **When is it called?** When the customer wants to modify item quantities, remove an item, or alter delivery terms without outright rejecting the quote.
- **Headers:**
  - `Authorization: Bearer <access_token>`
  - `Content-Type: application/json`
  - `Idempotency-Key: <UUIDv4>`
- **Request Body:**
  ```json
  {
    "customer_notes": "We want to start with 3 training workshops instead of 5.",
    "line_item_changes": [
      {
        "line_id": "line_4021",
        "requested_quantity": 3.0,
        "reason": "Team schedule capacity limit"
      }
    ],
    "terms_changes": [
      {
        "term_type": "payment_terms",
        "requested_value": "Net 45"
      }
    ]
  }
  ```
- **Response Body (`201 Created`):**
  ```json
  {
    "change_request_id": "cr_10928",
    "quote_id": "quo_8819ab2",
    "quote_status": "in_negotiation",
    "negotiation_status": "pending_seller_review",
    "submitted_at": "2026-09-05T10:44:00Z",
    "message": "Change request submitted successfully. The sales team has been notified.",
    "line_item_changes": [
      {
        "line_id": "line_4021",
        "product_name": "On-Site Implementation & Training Workshop",
        "current_quantity": 5.0,
        "requested_quantity": 3.0,
        "current_subtotal": 12500.00,
        "estimated_new_subtotal": 7500.00
      }
    ]
  }
  ```
- **Failure Cases:**
  - `400 Bad Request`: `line_id` does not exist on this quote or `requested_quantity` < 0 (`INVALID_LINE_ITEM`).
  - `409 Conflict`: An active change request or counter-discount is already pending review on this quote (`NEGOTIATION_ALREADY_ACTIVE`).
  - `422 Unprocessable Entity`: Cannot request changes on mandatory base package line.

---

### 6.11. `POST /quotes/{quote_id}/negotiation/counter-discount` (Submit Counter-Discount Offer)
- **Who calls it?** Customer Portal Pricing Negotiation Widget ("Propose Counter Offer").
- **When is it called?** Customer asks for a commercial discount or offers a target budget for the overall deal.
- **Headers:**
  - `Authorization: Bearer <access_token>`
  - `Content-Type: application/json`
  - `Idempotency-Key: <UUIDv4>`
- **Request Body:**
  ```json
  {
    "discount_type": "percentage",
    "requested_discount_percent": 10.0,
    "requested_target_price": null,
    "customer_budget_notes": "We have an executive spend ceiling of $97,000 for this project.",
    "scope_compromise_offered": "We are ready to execute immediately if approved."
  }
  ```
- **Response Body (`201 Created`):**
  ```json
  {
    "counter_discount_id": "cd_7719",
    "quote_id": "quo_8819ab2",
    "quote_status": "in_negotiation",
    "negotiation_status": "pending_seller_review",
    "submitted_at": "2026-09-05T10:44:30Z",
    "requested_discount_percent": 10.0,
    "current_quote_total": 107400.00,
    "projected_total": 96660.00,
    "currency": "USD",
    "status": "pending_seller_review",
    "message": "Counter-discount submitted. The account executive and deal approval desk are reviewing your request."
  }
  ```
- **Failure Cases:**
  - `400 Bad Request`: `requested_discount_percent` is <= 0 or > 100 (`INVALID_DISCOUNT_RANGE`).
  - `409 Conflict`: Quote is already locked in negotiation or already finalized (`NEGOTIATION_CONFLICT`).

---

### 6.12. `GET /quotes/{quote_id}/negotiation/status` (Get Real-Time Negotiation & Approval Status)
- **Who calls it?** Customer Portal Active Negotiation Banner.
- **When is it called?** When viewing a quote that is `in_negotiation` to track approval progression.
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:** None
- **Response Body (`200 OK`):**
  ```json
  {
    "quote_id": "quo_8819ab2",
    "quote_status": "in_negotiation",
    "active_negotiation_type": "counter_discount",
    "active_request_id": "cd_7719",
    "negotiation_status": "pending_internal_approval",
    "approval_status": {
      "overall_status": "in_progress",
      "public_stage_name": "Commercial Management Review",
      "stage_number": 1,
      "total_stages": 2,
      "estimated_resolution": "2026-09-06T12:00:00Z"
    },
    "submitted_at": "2026-09-05T10:44:30Z",
    "last_updated_at": "2026-09-05T10:50:00Z",
    "latest_seller_comment": null
  }
  ```
- **Failure Cases:**
  - `404 Not Found`: Quote not found.

---

### 6.13. `GET /quotes/{quote_id}/revisions` (Get Quote Revision History)
- **Who calls it?** Customer Portal "Revision History" Tab / Dropdown.
- **When is it called?** Customer wants to review how the quote progressed across versions.
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:** None
- **Response Body (`200 OK`):**
  ```json
  {
    "quote_id": "quo_8819ab2",
    "current_revision": 2,
    "revisions": [
      {
        "revision_id": "rev_002",
        "revision_number": 2,
        "is_current": true,
        "created_at": "2026-09-05T09:30:00Z",
        "summary": "Revised training line items to 3 workshops and applied 5% special discount.",
        "total_amount": 99900.00,
        "currency": "USD"
      },
      {
        "revision_id": "rev_001",
        "revision_number": 1,
        "is_current": false,
        "created_at": "2026-09-01T08:00:00Z",
        "summary": "Initial quote publication.",
        "total_amount": 107400.00,
        "currency": "USD"
      }
    ]
  }
  ```
- **Failure Cases:**
  - `404 Not Found`: Quote not found.

---

### 6.14. `GET /quotes/{quote_id}/revisions/{revision_id}/diff` (Inspect Revision Diff)
- **Who calls it?** Customer Portal "Compare Revisions" Modal.
- **When is it called?** Customer clicks "Compare with Previous Revision" to inspect line-by-line deltas.
- **Headers:** `Authorization: Bearer <access_token>`
- **Query Parameters:** `base_revision_id` (optional, default: previous revision).
- **Request Body:** None
- **Response Body (`200 OK`):**
  ```json
  {
    "quote_id": "quo_8819ab2",
    "target_revision": {
      "revision_id": "rev_002",
      "revision_number": 2
    },
    "base_revision": {
      "revision_id": "rev_001",
      "revision_number": 1
    },
    "financial_delta": {
      "base_total": 107400.00,
      "target_total": 99900.00,
      "difference_amount": -7500.00,
      "currency": "USD"
    },
    "line_item_deltas": [
      {
        "line_id": "line_4021",
        "product_name": "On-Site Implementation & Training Workshop",
        "change_type": "modified",
        "old_quantity": 5.0,
        "new_quantity": 3.0,
        "old_total": 13425.00,
        "new_total": 8055.00,
        "delta_total": -5370.00
      }
    ],
    "terms_deltas": [
      {
        "term_name": "Payment Terms",
        "old_value": "Net 30",
        "new_value": "Net 15"
      }
    ]
  }
  ```
- **Failure Cases:**
  - `404 Not Found`: Revision or Quote does not exist (`REVISION_NOT_FOUND`).

---

### 6.15. `GET /quotes/{quote_id}/comments` (List Threaded Comments)
- **Who calls it?** Customer Portal Activity & Discussion Sidebar.
- **When is it called?** Automatically loaded when opening a quote to fetch all public messages.
- **Headers:** `Authorization: Bearer <access_token>`
- **Query Parameters:**
  - `page` (optional, default: `1`)
  - `per_page` (optional, default: `25`)
- **Request Body:** None
- **Response Body (`200 OK`):**
  ```json
  {
    "data": [
      {
        "comment_id": "cmt_991823",
        "quote_id": "quo_8819ab2",
        "parent_comment_id": null,
        "author": {
          "id": "usr_c91f0e4b81",
          "name": "Sarah Connor",
          "email": "sarah.connor@cyberdyne-defense.com",
          "type": "customer",
          "avatar_url": "https://cdn.dealflow360.com/avatars/usr_c91f0e4b81.png"
        },
        "message": "Could we please clarify if Level-2 support SLA includes 24/7 weekend emergency coverage?",
        "created_at": "2026-09-04T09:15:22Z",
        "attachments": []
      },
      {
        "comment_id": "cmt_991845",
        "quote_id": "quo_8819ab2",
        "parent_comment_id": "cmt_991823",
        "author": {
          "id": "rep_102",
          "name": "Alex Mercer",
          "email": "alex.mercer@dealflow360.com",
          "type": "sales_agent",
          "avatar_url": "https://cdn.dealflow360.com/team/alex.png"
        },
        "message": "Hi Sarah! Yes, Enterprise Tier includes 24/7/365 emergency response with a guaranteed 30-minute response time.",
        "created_at": "2026-09-04T09:40:11Z",
        "attachments": []
      }
    ],
    "meta": {
      "pagination": {
        "current_page": 1,
        "per_page": 25,
        "total_items": 2,
        "total_pages": 1,
        "has_next_page": false,
        "has_prev_page": false
      }
    }
  }
  ```
- **Failure Cases:**
  - `404 Not Found`: Quote not found.

---

### 6.16. `POST /quotes/{quote_id}/comments` (Post Customer Comment)
- **Who calls it?** Customer Portal Discussion Box.
- **When is it called?** When customer submits a question or note in the discussion thread.
- **Headers:** `Authorization: Bearer <access_token>`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "message": "Thank you for the quick confirmation Alex. Can we proceed with this revised workshop count?",
    "parent_comment_id": "cmt_991845",
    "attachment_ids": ["att_4410"]
  }
  ```
- **Response Body (`201 Created`):**
  ```json
  {
    "comment_id": "cmt_991901",
    "quote_id": "quo_8819ab2",
    "parent_comment_id": "cmt_991845",
    "author": {
      "id": "usr_c91f0e4b81",
      "name": "Sarah Connor",
      "email": "sarah.connor@cyberdyne-defense.com",
      "type": "customer",
      "avatar_url": "https://cdn.dealflow360.com/avatars/usr_c91f0e4b81.png"
    },
    "message": "Thank you for the quick confirmation Alex. Can we proceed with this revised workshop count?",
    "created_at": "2026-09-05T10:46:00Z",
    "attachments": [
      {
        "attachment_id": "att_4410",
        "filename": "SLA_Clarification_Scope.pdf",
        "file_size_bytes": 284102,
        "mime_type": "application/pdf",
        "download_url": "https://api.dealflow360.com/api/v1/portal/quotes/quo_8819ab2/attachments/att_4410"
      }
    ]
  }
  ```
- **Failure Cases:**
  - `400 Bad Request`: Empty message body or non-existent `parent_comment_id`.
  - `403 Forbidden`: Attempting to comment on an archived or cancelled quote.

---

### 6.17. `POST /quotes/{quote_id}/attachments` (Upload File Attachment)
- **Who calls it?** Customer Portal File Upload Component (dropzone).
- **When is it called?** When user attaches an NDA, RFP document, or PO PDF.
- **Headers:**
  - `Authorization: Bearer <access_token>`
  - `Content-Type: multipart/form-data`
- **Form Data:**
  - `file`: (binary file, allowed types: `.pdf`, `.png`, `.jpg`, `.docx`, `.xlsx`, max size: 25MB).
  - `document_category`: `"purchase_order"` | `"specification"` | `"general"`
- **Response Body (`201 Created`):**
  ```json
  {
    "attachment_id": "att_4410",
    "filename": "SLA_Clarification_Scope.pdf",
    "file_size_bytes": 284102,
    "mime_type": "application/pdf",
    "document_category": "specification",
    "uploaded_at": "2026-09-05T10:45:30Z",
    "download_url": "https://api.dealflow360.com/api/v1/portal/quotes/quo_8819ab2/attachments/att_4410"
  }
  ```
- **Failure Cases:**
  - `400 Bad Request`: File type not permitted (e.g. `.exe`, `.sh`).
  - `413 Payload Too Large`: File exceeds 25MB limit (`FILE_TOO_LARGE`).
  - `422 Unprocessable Entity`: Virus scan or mime integrity check failure (`FILE_SECURITY_VIOLATION`).

---

### 6.18. `GET /notifications` (List Notifications)
- **Who calls it?** Customer Portal Notification Center / Bell Icon.
- **When is it called?** On page load or triggered via interval / WebSocket ping.
- **Headers:** `Authorization: Bearer <access_token>`
- **Query Parameters:**
  - `unread_only` (optional, default: `false`): Boolean.
  - `page` (optional, default: `1`)
  - `per_page` (optional, default: `20`)
- **Request Body:** None
- **Response Body (`200 OK`):**
  ```json
  {
    "data": [
      {
        "notification_id": "notif_5521",
        "recipient_id": "usr_c91f0e4b81",
        "event_type": "quote_revision_published",
        "title": "New Quote Revision Published",
        "message": "Alex Mercer published Revision #2 for Quote QUO-2026-0048 with updated pricing.",
        "quote_id": "quo_8819ab2",
        "quote_number": "QUO-2026-0048",
        "target_route": "/portal/quotes/quo_8819ab2?revision=2",
        "is_read": false,
        "created_at": "2026-09-04T14:25:00Z"
      }
    ],
    "meta": {
      "unread_count": 1,
      "pagination": {
        "current_page": 1,
        "per_page": 20,
        "total_items": 1,
        "total_pages": 1,
        "has_next_page": false,
        "has_prev_page": false
      }
    }
  }
  ```
- **Failure Cases:**
  - `401 Unauthorized`: Session expired.

---

### 6.19. `PATCH /notifications/{notification_id}/read` (Mark Notification as Read)
- **Who calls it?** Customer Portal Notification Item Click.
- **When is it called?** When user clicks or marks a specific notification as viewed.
- **Headers:** `Authorization: Bearer <access_token>`, `Content-Type: application/json`
- **Request Body:** `{}`
- **Response Body (`200 OK`):**
  ```json
  {
    "notification_id": "notif_5521",
    "is_read": true,
    "read_at": "2026-09-05T10:47:00Z"
  }
  ```
- **Failure Cases:**
  - `404 Not Found`: Notification does not exist or belongs to another user.

---

### 6.20. `PATCH /notifications/read-all` (Mark All Notifications as Read)
- **Who calls it?** Notification Dropdown ("Mark All as Read" action).
- **When is it called?** User dismisses all unread badges at once.
- **Headers:** `Authorization: Bearer <access_token>`, `Content-Type: application/json`
- **Request Body:** `{}`
- **Response Body (`200 OK`):**
  ```json
  {
    "success": true,
    "marked_read_count": 3,
    "updated_at": "2026-09-05T10:47:15Z"
  }
  ```
- **Failure Cases:**
  - `401 Unauthorized`: Session expired.

---

## 7. HTTP Status Codes Reference

| HTTP Code | Label | Meaning in DealFlow360 Customer Portal |
|---|---|---|
| `200 OK` | Success | Standard response for successful `GET`, `PATCH`, or synchronous non-creation `POST`. |
| `201 Created` | Resource Created | Successfully created a change request, counter-discount, comment, or attachment. |
| `204 No Content` | Void Success | Successful action with no required body returned. |
| `400 Bad Request` | Malformed Request | Syntax errors, missing parameters, invalid discount types or quantities. |
| `401 Unauthorized` | Missing / Invalid Token | Missing, invalid, or expired JWT bearer token. Client must re-authenticate. |
| `403 Forbidden` | Authorization Failure | Action disallowed (e.g. user lacks signatory rights `can_sign_quotes: false`). |
| `404 Not Found` | Not Found | Resource does not exist or partner boundary isolation prevents exposure. |
| `409 Conflict` | Business State Conflict | Action invalid in current state (e.g. signing expired quote, duplicate negotiation). |
| `413 Payload Too Large` | Attachment Over Limit | File upload exceeds 25MB ceiling. |
| `422 Unprocessable Entity` | Semantic Domain Error | Data format valid JSON, but business logic rule violated. |
| `429 Too Many Requests` | Rate Limit Exceeded | Exceeded allowed requests per minute. Client must inspect `Retry-After`. |
| `500 Internal Error` | Server Exception | Unhandled backend exception or Odoo ORM failure. |

---
*End of Customer Portal & Backend Integration Contract — DealFlow360*
