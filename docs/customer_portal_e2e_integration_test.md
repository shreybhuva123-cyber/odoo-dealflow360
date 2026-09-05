# DealFlow360 Customer Portal: End-to-End Integration Test Specification

This document provides the definitive, production-grade **End-to-End Integration Test Specification** for the DealFlow360 Customer Portal. It validates the complete 22-step lifecycle across both the internal Odoo enterprise sales/approval/finance environment and the external B2B Customer Portal.

---

## 1. End-to-End Scenario Architecture

```mermaid
flowchart TD
    subgraph RepPhase ["Phase 1: Sales Rep Quotation Creation & Baseline Approval"]
        S1["1. Create Quotation Draft"] --> S2["2. Add Hardware Line (Edge Gateways)"]
        S2 --> S3["3. Add Subscription Line (Cloud Threat Defense)"]
        S3 --> S4["4. Apply Initial 5% Discount"]
        S4 --> S5["5. Baseline Approval Completes (Rev 1 Published)"]
    end

    subgraph CustReview ["Phase 2: Customer Portal Review & Negotiation"]
        S5 --> S6["6. Customer Receives Notification / Magic Link"]
        S6 --> S7["7. Customer Authenticates (Bearer JWT)"]
        S7 --> S8["8. Customer Views Quotation & Commercial Terms"]
        S8 --> S9["9. Opens Hardware Line Details Drawer"]
        S9 --> S10["10. Posts Line-Level Clarification Question"]
        S10 --> S11["11. Requests Hardware Quantity Change (2 -> 4)"]
        S11 --> S12["12. Requests Higher Counter-Discount (5% -> 15%)"]
    end

    subgraph RiskEscalate ["Phase 3: Risk Recalculation & Manager Concession Approval"]
        S12 --> S13["13. Backend Recalculates Pricing & Line Totals"]
        S13 --> S14["14. Blended Risk Score Exceeds Tier 1 Threshold (Score: 68.4)"]
        S14 --> S15["15. Customer Portal Displays 'Pending Approval' Lock Banner"]
        S15 --> S16["16. Commercial Director Approves Concession (Rev 2 Published)"]
    end

    subgraph CustConfirm ["Phase 4: Customer Confirmation & Legal E-Signature"]
        S16 --> S17["17. Customer Views Updated Quote & Inspects Revision Diff"]
        S17 --> S18["18. Customer E-Signs & Accepts Terms (Quote Locked)"]
    end

    subgraph OrderExec ["Phase 5: Downstream Order Execution & Settlement"]
        S18 --> S19["19. Confirmed Sales Order Created (SO-2026-1184)"]
        S19 --> S20["20. Warehouse / Cloud Fulfillment Workflow Starts"]
        S20 --> S21["21. Accounting Invoice Generated (INV-2026-0891)"]
        S21 --> S22["22. Payment Recorded & Ledger Reconciled"]
    end
```

---

## 2. Step-by-Step Integration Test Specification

---

### Step 1: Sales Rep Creates Quotation Draft
- **User / Persona:** Sales Representative (Alex Mercer)
- **Action:** Initializes a new enterprise deal quotation for Cyberdyne Defense Systems.
- **API Call:**
  - `POST /api/v1/internal/quotes`
  - Headers: `Authorization: Bearer <internal_sales_token>`, `Content-Type: application/json`
- **Expected Request:**
  ```json
  {
    "partner_id": 4821,
    "commercial_partner_id": 1205,
    "currency_id": "USD",
    "title": "Enterprise Edge Defense & Threat Intelligence Platform",
    "expiration_date": "2026-09-30T23:59:59Z",
    "payment_term_id": "net_30"
  }
  ```
- **Expected Response:** `HTTP 201 Created`
  ```json
  {
    "quote_id": "quo_e2e_8819",
    "quote_number": "QUO-2026-0105",
    "status": "draft",
    "negotiation_status": "none",
    "revision_number": 1,
    "commercial_partner_id": 1205,
    "pricing_summary": {
      "subtotal": 0.00,
      "discount_total": 0.00,
      "tax_total": 0.00,
      "total_amount": 0.00
    }
  }
  ```
- **Database Change:**
  - Table: `sale_order`
  - Record: Insert `id: 8819`, `name: 'QUO-2026-0105'`, `partner_id: 4821`, `state: 'draft'`, `dealflow_revision_number: 1`, `dealflow_status: 'draft'`, `dealflow_negotiation_status: 'none'`.
- **Frontend State (ERP Sales View):**
  - Form state: `order_status = 'draft'`, `dirty = false`, `quote_id = 'quo_e2e_8819'`.
- **Expected UI (Internal Sales View):**
  - Form view shows Quote Number `QUO-2026-0105` with `Draft` status badge; "Add Product" action enabled; "Send by Email" action disabled until lines exist.
- **Failure Scenario:**
  - Invalid partner ID (`partner_id: 999999`) triggers `HTTP 400 Bad Request` (`code: INVALID_PARTNER_REFERENCE`). Form highlights partner selection in red.

---

### Step 2: Sales Rep Adds Hardware Line (Edge Gateways)
- **User / Persona:** Sales Representative (Alex Mercer)
- **Action:** Adds physical deliverable: 2 units of Enterprise Edge Gateway Appliance at \$5,000.00/unit.
- **API Call:**
  - `POST /api/v1/internal/quotes/quo_e2e_8819/lines`
  - Headers: `Authorization: Bearer <internal_sales_token>`, `Content-Type: application/json`
- **Expected Request:**
  ```json
  {
    "product_id": "prod_hw_gateway_01",
    "name": "Enterprise Edge Gateway Appliance Model X-1",
    "charge_type": "one_time",
    "quantity": 2.0,
    "unit_price": 5000.00,
    "discount_percent": 0.0,
    "uom": "Units"
  }
  ```
- **Expected Response:** `HTTP 201 Created`
  ```json
  {
    "line_id": "line_e2e_01",
    "quote_id": "quo_e2e_8819",
    "product_id": "prod_hw_gateway_01",
    "charge_type": "one_time",
    "quantity": 2.0,
    "unit_price": 5000.00,
    "subtotal": 10000.00,
    "tax_amount": 740.00,
    "total_amount": 10740.00
  }
  ```
- **Database Change:**
  - Table: `sale_order_line`
  - Record: Insert `id: 501`, `order_id: 8819`, `product_id: 101`, `product_uom_qty: 2.0`, `price_unit: 5000.00`, `price_subtotal: 10000.00`, `price_total: 10740.00`, `charge_type: 'one_time'`.
  - Table: `sale_order`: `amount_untaxed: 10000.00`, `amount_tax: 740.00`, `amount_total: 10740.00`.
- **Frontend State (ERP Sales View):**
  - Line items array contains 1 element (`line_e2e_01`); one-time charges total \$10,740.00.
- **Expected UI (Internal Sales View):**
  - Line item table populates row: "Enterprise Edge Gateway Appliance Model X-1", Qty: 2, Unit Price: \$5,000.00, Total: \$10,740.00.
- **Failure Scenario:**
  - Out of stock hardware or invalid negative quantity (`quantity: -1`) triggers `HTTP 400 Bad Request` (`code: INVALID_QUANTITY`).

---

### Step 3: Sales Rep Adds Subscription Line (Cloud Threat Defense)
- **User / Persona:** Sales Representative (Alex Mercer)
- **Action:** Adds recurring SaaS deliverable: 100 user seats of Cloud Threat Defense Platform at \$50.00/seat/month billed annually (\$60,000.00/year).
- **API Call:**
  - `POST /api/v1/internal/quotes/quo_e2e_8819/lines`
  - Headers: `Authorization: Bearer <internal_sales_token>`, `Content-Type: application/json`
- **Expected Request:**
  ```json
  {
    "product_id": "prod_saas_threat_100",
    "name": "Cloud Threat Defense Platform - Enterprise Tier",
    "charge_type": "recurring",
    "recurring_interval": "annual",
    "quantity": 100.0,
    "unit_price": 600.00,
    "discount_percent": 0.0,
    "uom": "Seats"
  }
  ```
- **Expected Response:** `HTTP 201 Created`
  ```json
  {
    "line_id": "line_e2e_02",
    "quote_id": "quo_e2e_8819",
    "product_id": "prod_saas_threat_100",
    "charge_type": "recurring",
    "recurring_interval": "annual",
    "quantity": 100.0,
    "unit_price": 600.00,
    "subtotal": 60000.00,
    "tax_amount": 4440.00,
    "total_amount": 64440.00
  }
  ```
- **Database Change:**
  - Table: `sale_order_line`: Insert `id: 502`, `order_id: 8819`, `product_id: 201`, `product_uom_qty: 100.0`, `price_unit: 600.00`, `price_subtotal: 60000.00`, `price_total: 64440.00`, `charge_type: 'recurring'`.
  - Table: `sale_order`: `amount_untaxed: 70000.00`, `amount_tax: 5180.00`, `amount_total: 75180.00`.
- **Frontend State (ERP Sales View):**
  - Total contract lines: 2 (`line_e2e_01`, `line_e2e_02`); recurring total: \$64,440.00/yr, one-time total: \$10,740.00.
- **Expected UI (Internal Sales View):**
  - Pricing summary displays One-Time: \$10,740.00, Recurring: \$64,440.00/yr, Gross Total: \$75,180.00.
- **Failure Scenario:**
  - Unsupported recurring billing interval (`recurring_interval: "century"`) rejected with `HTTP 400 Bad Request` (`code: INVALID_RECURRING_INTERVAL`).

---

### Step 4: Sales Rep Applies Initial 5% Discount
- **User / Persona:** Sales Representative (Alex Mercer)
- **Action:** Applies standard sales concession (5% discount) across both deliverables lines.
- **API Call:**
  - `PATCH /api/v1/internal/quotes/quo_e2e_8819/discount`
  - Headers: `Authorization: Bearer <internal_sales_token>`, `Content-Type: application/json`
- **Expected Request:**
  ```json
  {
    "discount_percent": 5.0,
    "discount_scope": "all_lines",
    "discount_reason": "Standard competitive introductory discount"
  }
  ```
- **Expected Response:** `HTTP 200 OK`
  ```json
  {
    "quote_id": "quo_e2e_8819",
    "discount_total": 3500.00,
    "pricing_summary": {
      "subtotal": 70000.00,
      "discount_total": 3500.00,
      "net_subtotal": 66500.00,
      "tax_total": 4921.00,
      "total_amount": 71421.00,
      "one_time_total": 10203.00,
      "recurring_total": 61218.00
    }
  }
  ```
- **Database Change:**
  - Table: `sale_order_line`: Update `discount: 5.0` on rows 501 and 502.
  - Table: `sale_order`: `amount_untaxed: 66500.00`, `amount_tax: 4921.00`, `amount_total: 71421.00`.
- **Frontend State (ERP Sales View):**
  - Discount inputs show `5%`; net pricing updated; profit margin computed at 28.5%.
- **Expected UI (Internal Sales View):**
  - Visual strikethrough on original \$75,180.00 price; discount badge `-5% (-$3,500.00)`; new Total Contract Value \$71,421.00.
- **Failure Scenario:**
  - Attempting to exceed AE discretionary discount limit (e.g. 25% without approval) triggers `HTTP 403 Forbidden` (`code: DISCRETIONARY_DISCOUNT_EXCEEDED`).

---

### Step 5: Initial Baseline Approval Completes & Quote Published
- **User / Persona:** Sales Manager / Automated Workflow
- **Action:** Evaluates 5% concession against Tier 1 governance policy; automatically grants baseline approval and publishes Quote Revision #1.
- **API Call:**
  - `POST /api/v1/internal/quotes/quo_e2e_8819/baseline-approve`
  - Headers: `Authorization: Bearer <manager_token>`, `Content-Type: application/json`
- **Expected Request:**
  ```json
  {
    "approval_type": "baseline_commercial",
    "notes": "Introductory 5% discount within AE discretionary quota approved."
  }
  ```
- **Expected Response:** `HTTP 200 OK`
  ```json
  {
    "quote_id": "quo_e2e_8819",
    "quote_number": "QUO-2026-0105",
    "status": "sent",
    "negotiation_status": "none",
    "revision_number": 1,
    "published_at": "2026-09-05T14:15:00Z",
    "invitation_url": "https://portal.dealflow360.com/auth/magic?token=magic_e2e_token_sarah"
  }
  ```
- **Database Change:**
  - Table: `sale_order`: `state: 'sent'`, `dealflow_status: 'sent'`, `dealflow_negotiation_status: 'none'`.
  - Table: `dealflow_quote_revision`: Insert `id: 1`, `quote_id: 8819`, `revision_number: 1`, `state: 'active'`, `content_hash: 'sha256_rev1_8819'`, `summary: 'Initial baseline publication'`.
- **Frontend State (ERP Sales View):**
  - Document status transitions from `Draft` to `Sent`. Revisions dropdown displays `Revision #1 (Active)`.
- **Expected UI (Internal Sales View):**
  - Green banner: "Quote QUO-2026-0105 sent to customer portal. Customer notified."
- **Failure Scenario:**
  - Unapproved quote publication attempt triggers `HTTP 409 Conflict` (`code: APPROVAL_REQUIRED_BEFORE_RELEASE`).

---

### Step 6: Customer Receives Notification / Magic Link
- **User / Persona:** Customer Signatory (Sarah Connor, VP Technology)
- **Action:** External event trigger delivers secure invitation email with 1-click magic access link.
- **API Call:**
  - `GET /api/v1/portal/notifications` (simulated webhook/email payload)
- **Expected Request:** Headers: `Authorization: Bearer mock_jwt_access_token_usr_c91f0e4b81`
- **Expected Response:** `HTTP 200 OK`
  ```json
  {
    "data": [
      {
        "notification_id": "notif_e2e_01",
        "event_type": "quote_published",
        "title": "New Quotation Ready for Review",
        "message": "Alex Mercer published Quote QUO-2026-0105 ($71,421.00) for Cyberdyne Defense Systems.",
        "quote_id": "quo_e2e_8819",
        "quote_number": "QUO-2026-0105",
        "is_read": false
      }
    ]
  }
  ```
- **Database Change:**
  - Table: `dealflow_notification`: Insert `id: 9101`, `recipient_id: 4821`, `quote_id: 8819`, `event_type: 'quote_published'`, `is_read: false`.
- **Frontend State (Customer Portal):**
  - `unread_notifications_count` incremented to 1; notification bell indicator lights up amber.
- **Expected UI (Customer Portal Bell / Drawer):**
  - Notification drawer renders clickable card: "New Quotation Ready for Review: QUO-2026-0105".
- **Failure Scenario:**
  - Expired magic link URL triggers `HTTP 401 Unauthorized` (`code: LINK_EXPIRED`) redirecting user to standard portal login.

---

### Step 7: Customer Logs into Portal
- **User / Persona:** Customer Signatory (Sarah Connor)
- **Action:** Authenticates via secure 1-click magic link token or email/password credentials.
- **API Call:**
  - `POST /api/v1/portal/auth/magic-verify`
  - Headers: `Content-Type: application/json`
- **Expected Request:**
  ```json
  {
    "token": "magic_e2e_token_sarah"
  }
  ```
- **Expected Response:** `HTTP 200 OK`
  ```json
  {
    "access_token": "mock_jwt_access_token_usr_c91f0e4b81",
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
- **Database Change:**
  - Table: `res_partner`: `last_login_portal: '2026-09-05T14:16:00Z'`. Single-use magic token marked consumed.
- **Frontend State (Customer Portal SPA):**
  - `TokenStore.setTokens({ accessToken, expiresIn: 900 })`; `currentUser` hydrated; session state marked `authenticated`.
- **Expected UI (Customer Portal):**
  - Navigation header renders "Cyberdyne Defense Systems" with user avatar "Sarah Connor" and green "Signatory" pill.
- **Failure Scenario:**
  - Invalid signature or tampered token returns `HTTP 401 Unauthorized` (`code: INVALID_TOKEN`). Error toast rendered.

---

### Step 8: Customer Views Quotation Details
- **User / Persona:** Customer Signatory (Sarah Connor)
- **Action:** Navigates to `/portal/quotes/quo_e2e_8819` to review deliverables, pricing breakdown, and terms.
- **API Call:**
  - `GET /api/v1/portal/quotes/quo_e2e_8819`
  - Headers: `Authorization: Bearer mock_jwt_access_token_usr_c91f0e4b81`
- **Expected Request:** None (Route Parameter `quote_id = quo_e2e_8819`)
- **Expected Response:** `HTTP 200 OK`
  ```json
  {
    "quote_id": "quo_e2e_8819",
    "quote_number": "QUO-2026-0105",
    "title": "Enterprise Edge Defense & Threat Intelligence Platform",
    "status": "sent",
    "negotiation_status": "none",
    "revision_number": 1,
    "currency": "USD",
    "pricing_summary": {
      "subtotal": 70000.00,
      "discount_total": 3500.00,
      "tax_total": 4921.00,
      "total_amount": 71421.00,
      "one_time_total": 10203.00,
      "recurring_total": 61218.00,
      "recurring_interval": "annual"
    },
    "sales_rep": {
      "name": "Alex Mercer",
      "email": "alex.mercer@dealflow360.com"
    },
    "line_items": [
      {
        "line_id": "line_e2e_01",
        "product_id": "prod_hw_gateway_01",
        "name": "Enterprise Edge Gateway Appliance Model X-1",
        "charge_type": "one_time",
        "quantity": 2.0,
        "unit_price": 5000.00,
        "discount_percent": 5.0,
        "total_amount": 10203.00
      },
      {
        "line_id": "line_e2e_02",
        "product_id": "prod_saas_threat_100",
        "name": "Cloud Threat Defense Platform - Enterprise Tier",
        "charge_type": "recurring",
        "recurring_interval": "annual",
        "quantity": 100.0,
        "unit_price": 600.00,
        "discount_percent": 5.0,
        "total_amount": 61218.00
      }
    ]
  }
  ```
- **Database Change:** None (Read-only query with row-level tenant boundary).
- **Frontend State (Customer Portal SPA):**
  - `QueryCache.set(['quotes', 'quo_e2e_8819'], data, { ttl: 60000 })`; `activeQuote` set in view model.
- **Expected UI (Customer Portal):**
  - Two-column view: Deliverables list on left with recurring vs one-time badges; sticky pricing card on right (\$71,421.00 TCV); "Accept & Sign Quote" button enabled.
- **Failure Scenario:**
  - Customer attempts to access a quote belonging to another tenant (`quo_wayne_999`). Backend returns `HTTP 404 Not Found` (404-masking defense).

---

### Step 9: Customer Opens Line Details
- **User / Persona:** Customer Signatory (Sarah Connor)
- **Action:** Clicks "Discussion & Details" on the Hardware Line item (`line_e2e_01`).
- **API Call:**
  - `GET /api/v1/portal/quotes/quo_e2e_8819/lines/line_e2e_01/comments`
  - Headers: `Authorization: Bearer mock_jwt_access_token_usr_c91f0e4b81`
- **Expected Request:** None
- **Expected Response:** `HTTP 200 OK`
  ```json
  {
    "data": [],
    "meta": {
      "quote_id": "quo_e2e_8819",
      "line_id": "line_e2e_01",
      "unread_count": 0,
      "total_comments": 0
    }
  }
  ```
- **Database Change:** None.
- **Frontend State (Customer Portal SPA):**
  - `isLineDrawerOpen = true`; `activeLineId = 'line_e2e_01'`.
- **Expected UI (Customer Portal):**
  - Slide-over drawer opens from the right showing "Line Discussion: Enterprise Edge Gateway Appliance Model X-1", empty state placeholder "No messages yet. Ask a question regarding this deliverable."
- **Failure Scenario:**
  - Network timeout during drawer fetch. Component displays error banner with "Retry" action button.

---

### Step 10: Customer Adds Line-Level Question
- **User / Persona:** Customer Signatory (Sarah Connor)
- **Action:** Submits question: "Does the Model X-1 include rack mount hardware and redundant power supplies?"
- **API Call:**
  - `POST /api/v1/portal/quotes/quo_e2e_8819/lines/line_e2e_01/comments`
  - Headers: `Authorization: Bearer mock_jwt_access_token_usr_c91f0e4b81`, `Content-Type: application/json`
- **Expected Request:**
  ```json
  {
    "message": "Does the Model X-1 include rack mount hardware and redundant power supplies?",
    "stable_line_key": "prod_hw_gateway_01"
  }
  ```
- **Expected Response:** `HTTP 201 Created`
  ```json
  {
    "comment_id": "cmt_e2e_501",
    "quote_id": "quo_e2e_8819",
    "line_id": "line_e2e_01",
    "stable_line_key": "prod_hw_gateway_01",
    "revision_number": 1,
    "author": {
      "id": "usr_c91f0e4b81",
      "name": "Sarah Connor",
      "type": "customer"
    },
    "visibility": "customer",
    "message": "Does the Model X-1 include rack mount hardware and redundant power supplies?",
    "created_at": "2026-09-05T14:18:00Z",
    "is_read": true
  }
  ```
- **Database Change:**
  - Table: `dealflow_quote_comment`: Insert `id: 501`, `quote_id: 8819`, `line_id: 501`, `author_id: 4821`, `visibility: 'customer'`, `message: '...'`.
- **Frontend State (Customer Portal SPA):**
  - Optimistic comment reconciled; comment bubble displayed in stream; line comment badge counter increments to `1`.
- **Expected UI (Customer Portal):**
  - Chat bubble renders customer message with avatar and timestamp; comment pill in line item row updates to "1 comment".
- **Failure Scenario:**
  - Empty message payload triggers `HTTP 400 Bad Request` (`code: EMPTY_COMMENT_BODY`).

---

### Step 11: Customer Requests Quantity Change
- **User / Persona:** Customer Signatory (Sarah Connor)
- **Action:** Submits a Change Request to scale hardware appliances from 2 to 4 units for secondary datacenter redundancy.
- **API Call:**
  - `POST /api/v1/portal/quotes/quo_e2e_8819/negotiation/change-request`
  - Headers: `Authorization: Bearer mock_jwt_access_token_usr_c91f0e4b81`, `Content-Type: application/json`
- **Expected Request:**
  ```json
  {
    "justification": "Scaling to 4 edge gateways to support failover datacenter deployment.",
    "line_item_changes": [
      {
        "line_id": "line_e2e_01",
        "product_id": "prod_hw_gateway_01",
        "requested_quantity": 4.0,
        "notes": "Need 4 total appliances instead of 2"
      }
    ]
  }
  ```
- **Expected Response:** `HTTP 201 Created`
  ```json
  {
    "change_request_id": "cr_e2e_101",
    "quote_id": "quo_e2e_8819",
    "quote_status": "in_negotiation",
    "negotiation_status": "pending_seller_review",
    "submitted_at": "2026-09-05T14:19:00Z",
    "message": "Change request submitted successfully. The sales team has been notified."
  }
  ```
- **Database Change:**
  - Table: `sale_order`: `dealflow_status: 'in_negotiation'`, `dealflow_negotiation_status: 'pending_seller_review'`.
  - Table: `dealflow_quote_change_request`: Insert `id: 101`, `quote_id: 8819`, `line_id: 501`, `requested_qty: 4.0`, `status: 'submitted'`.
- **Frontend State (Customer Portal SPA):**
  - `quote.status = 'in_negotiation'`; `quote.negotiation_status = 'pending_seller_review'`.
- **Expected UI (Customer Portal):**
  - Top alert banner: Amber status "Quotation Under Review - Alex Mercer is reviewing your requested quantity adjustment."
- **Failure Scenario:**
  - Submitting changes while quote is already confirmed returns `HTTP 409 Conflict` (`code: QUOTE_LOCKED_FOR_NEGOTIATION`).

---

### Step 12: Customer Requests Higher Counter-Discount
- **User / Persona:** Customer Signatory (Sarah Connor)
- **Action:** Submits counter-discount proposal requesting 15% discount (up from 5%) in exchange for 4-unit commitment.
- **API Call:**
  - `POST /api/v1/portal/quotes/quo_e2e_8819/negotiation/counter-discount`
  - Headers: `Authorization: Bearer mock_jwt_access_token_usr_c91f0e4b81`, `Content-Type: application/json`
- **Expected Request:**
  ```json
  {
    "requested_discount_percent": 15.0,
    "business_justification": "Volume commitment scaled to 4 gateway units plus multi-year enterprise platform adoption."
  }
  ```
- **Expected Response:** `HTTP 201 Created`
  ```json
  {
    "counter_discount_id": "cd_e2e_201",
    "quote_id": "quo_e2e_8819",
    "quote_status": "in_negotiation",
    "negotiation_status": "pending_seller_review",
    "requested_discount_percent": 15.0,
    "current_quote_total": 71421.00,
    "projected_total": 72800.00,
    "status": "pending_seller_review",
    "message": "Counter-discount submitted. The account executive and deal approval desk are reviewing your request."
  }
  ```
- **Database Change:**
  - Table: `dealflow_counter_discount`: Insert `id: 201`, `quote_id: 8819`, `requested_discount: 15.0`, `status: 'submitted'`.
  - Table: `sale_order`: `dealflow_negotiation_status: 'pending_seller_review'`.
- **Frontend State (Customer Portal SPA):**
  - Modal closes; toast shows "Counter-discount submitted"; sticky pricing card updates with "Proposed: 15% ($72,800.00 TCV)".
- **Expected UI (Customer Portal):**
  - Negotiation tracker displays active step: "Deal Desk Evaluation In Progress". "Accept & Sign Quote" button is disabled.
- **Failure Scenario:**
  - Submitting discount outside valid bounds (e.g. 150%) triggers `HTTP 400 Bad Request` (`code: INVALID_DISCOUNT_RANGE`).

---

### Step 13: Backend Recalculates Pricing & Line Totals
- **User / Persona:** DealFlow360 Pricing Engine (Automated)
- **Action:** Recalculates financial model with 4 hardware units (\$20,000) + subscription (\$60,000) at 15% discount.
- **Calculation Details:**
  $$\text{Gross Subtotal} = (4 \times 5000) + 60000 = \$80,000.00$$
  $$\text{Discount Concession (15\%)} = 80000 \times 0.15 = \$12,000.00$$
  $$\text{Net Subtotal} = \$68,000.00$$
  $$\text{Taxes (7.4\%)} = 68000 \times 0.074 = \$5,032.00$$
  $$\text{Total Contract Value (TCV)} = \$73,032.00$$
- **Database Change:**
  - Table: `dealflow_shadow_calculation`: Insert computed totals (`subtotal: 80000.00`, `discount: 12000.00`, `net: 68000.00`, `tax: 5032.00`, `tcv: 73032.00`).
- **Frontend State:** Unchanged (backend asynchronous calculation).
- **Expected UI:** Customer sees loading skeleton or "Recalculating..." indicator if active on page.
- **Failure Scenario:**
  - Database deadlock on row recalculation is automatically retried by the Odoo transaction manager up to 3 times.

---

### Step 14: Discount Risk Triggers Approval Escalation
- **User / Persona:** DealFlow360 Governance & Risk Engine (Automated)
- **Action:** Evaluates proposed 15% concession against multi-factor governance matrix:
  $$\text{Risk Score} = (0.40 \times \text{MarginPenalty}) + (0.25 \times \text{CreditRisk}) + (0.20 \times \text{VolumeBonus}) + (0.15 \times \text{ScopeRisk})$$
  $$\text{Risk Score} = (0.40 \times 75.0) + (0.25 \times 20.0) + (0.20 \times 10.0) + (0.15 \times 30.0) = 41.5$$
  Because proposed discount exceeds AE threshold (10%) and risk score exceeds 40, approval is automatically escalated to Tier 2 (Commercial Director).
- **Database Change:**
  - Table: `dealflow_approval_request`: Insert `id: 801`, `quote_id: 8819`, `tier: 2`, `assigned_to_role: 'commercial_director'`, `state: 'pending'`, `risk_score: 41.5`.
  - Table: `sale_order`: `dealflow_approval_tier: 2`.
- **Frontend State:** Unchanged (Zero-leak: Risk score and internal approval tier are never exposed to the client).
- **Expected UI:** None (Internal ERP chatter records escalation).
- **Failure Scenario:**
  - Missing routing rule for Tier 2 defaults to VP of Sales fallback queue (`code: APPROVAL_ROUTING_FALLBACK`).

---

### Step 15: Customer Sees "Pending Approval" State
- **User / Persona:** Customer Signatory (Sarah Connor)
- **Action:** Portal polls or receives real-time SSE update displaying the locked pending state.
- **API Call:**
  - `GET /api/v1/portal/quotes/quo_e2e_8819`
  - Headers: `Authorization: Bearer mock_jwt_access_token_usr_c91f0e4b81`
- **Expected Request:** None
- **Expected Response:** `HTTP 200 OK`
  ```json
  {
    "quote_id": "quo_e2e_8819",
    "quote_number": "QUO-2026-0105",
    "status": "in_negotiation",
    "negotiation_status": "pending_seller_review",
    "revision_number": 1,
    "pricing_summary": {
      "subtotal": 70000.00,
      "discount_total": 3500.00,
      "total_amount": 71421.00
    }
  }
  ```
- **Database Change:** None.
- **Frontend State (Customer Portal SPA):**
  - `canSignQuote = false`; `isInNegotiation = true`.
- **Expected UI (Customer Portal):**
  - Banner: "Quotation Locked for Deal Desk Review. Confirmation is temporarily disabled while pricing approval is being finalized."
  - "Accept & Sign Quote" button displays padlock icon and tooltip: "Disabled pending seller approval".
- **Failure Scenario:**
  - Customer attempts to force acceptance via direct cURL `POST .../accept`. Server rejects with `HTTP 409 Conflict` (`code: QUOTE_IN_NEGOTIATION_LOCKED`).

---

### Step 16: Manager Approves Concession & Publishes Revision #2
- **User / Persona:** Commercial Director (Marcus Vance)
- **Action:** Reviews deal economics in internal Odoo backend, approves the 15% discount concession, and publishes Quote Revision #2.
- **API Call:**
  - `POST /api/v1/internal/quotes/quo_e2e_8819/manager-approve`
  - Headers: `Authorization: Bearer <commercial_director_token>`, `Content-Type: application/json`
- **Expected Request:**
  ```json
  {
    "approval_request_id": "801",
    "decision": "approved",
    "concession_discount_percent": 15.0,
    "notes": "Approved 15% volume discount for 4 edge gateways and multi-year cloud commitment."
  }
  ```
- **Expected Response:** `HTTP 200 OK`
  ```json
  {
    "quote_id": "quo_e2e_8819",
    "quote_number": "QUO-2026-0105",
    "status": "sent",
    "negotiation_status": "approved",
    "revision_number": 2,
    "published_at": "2026-09-05T14:22:00Z",
    "pricing_summary": {
      "subtotal": 80000.00,
      "discount_total": 12000.00,
      "tax_total": 5032.00,
      "total_amount": 73032.00,
      "one_time_total": 18258.00,
      "recurring_total": 54774.00
    }
  }
  ```
- **Database Change:**
  - Table: `dealflow_approval_request`: Update `state: 'approved'`, `approved_by: 12`, `approved_at: NOW()`.
  - Table: `dealflow_quote_revision`: Archive Revision 1 (`is_current: false`); Insert Revision 2 (`revision_number: 2`, `is_current: true`, `state: 'active'`).
  - Table: `sale_order_line`: Row 501 quantity updated to `4.0`, discount `15.0%`; Row 502 discount updated to `15.0%`.
  - Table: `sale_order`: `state: 'sent'`, `dealflow_status: 'sent'`, `dealflow_negotiation_status: 'approved'`, `dealflow_revision_number: 2`.
- **Frontend State (ERP Sales View):**
  - Revision badge updates to `Revision #2 (Approved)`.
- **Expected UI (Internal Sales View):**
  - Green indicator: "Revision #2 published and available in customer portal."
- **Failure Scenario:**
  - Unauthorized user (e.g. Sales Rep trying to self-approve) triggers `HTTP 403 Forbidden` (`code: INSUFFICIENT_APPROVAL_PRIVILEGE`).

---

### Step 17: Customer Views Updated Quote & Inspects Revision Diff
- **User / Persona:** Customer Signatory (Sarah Connor)
- **Action:** Portal receives real-time update; Sarah navigates to Revision History to inspect side-by-side changes between Rev 1 and Rev 2.
- **API Call:**
  - `GET /api/v1/portal/quotes/quo_e2e_8819/revisions/2/diff?compare_with=1`
  - Headers: `Authorization: Bearer mock_jwt_access_token_usr_c91f0e4b81`
- **Expected Request:** Query param `compare_with=1`
- **Expected Response:** `HTTP 200 OK`
  ```json
  {
    "quote_id": "quo_e2e_8819",
    "base_revision": 1,
    "target_revision": 2,
    "financial_deltas": {
      "old_total": 71421.00,
      "new_total": 73032.00,
      "difference_amount": 1611.00,
      "discount_delta_percent": 10.0
    },
    "line_item_deltas": [
      {
        "line_id": "line_e2e_01",
        "product_name": "Enterprise Edge Gateway Appliance Model X-1",
        "change_type": "modified",
        "old_quantity": 2.0,
        "new_quantity": 4.0,
        "old_discount_percent": 5.0,
        "new_discount_percent": 15.0,
        "old_total": 10203.00,
        "new_total": 18258.00
      },
      {
        "line_id": "line_e2e_02",
        "product_name": "Cloud Threat Defense Platform - Enterprise Tier",
        "change_type": "modified",
        "old_discount_percent": 5.0,
        "new_discount_percent": 15.0,
        "old_total": 61218.00,
        "new_total": 54774.00,
        "delta_total": -6444.00
      }
    ]
  }
  ```
- **Database Change:** None.
- **Frontend State (Customer Portal SPA):**
  - `activeRevision = 2`; `diffModel` loaded; `canSignQuote = true`.
- **Expected UI (Customer Portal):**
  - Revision diff drawer shows visual comparison: Hardware line highlighted green with Qty `2 -> 4`; SaaS subscription highlighted green with price drop `-$6,444.00`; green banner: "Concession Approved: 15% discount applied across all deliverables."
- **Failure Scenario:**
  - Attempting to diff non-existent revision returns `HTTP 404 Not Found` (`code: REVISION_NOT_FOUND`).

---

### Step 18: Customer Confirms & E-Signs Quotation
- **User / Persona:** Customer Signatory (Sarah Connor)
- **Action:** Opens confirmation modal, checks contractual acceptance checkbox, draws cryptographic e-signature, and clicks "Confirm & Sign".
- **API Call:**
  - `POST /api/v1/portal/quotes/quo_e2e_8819/accept`
  - Headers: `Authorization: Bearer mock_jwt_access_token_usr_c91f0e4b81`, `Idempotency-Key: idemp_e2e_confirm_77192`, `Content-Type: application/json`
- **Expected Request:**
  ```json
  {
    "accepted_terms": true,
    "signer_name": "Sarah Connor",
    "signer_title": "VP Technology",
    "signature_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "revision_id": "rev_002"
  }
  ```
- **Expected Response:** `HTTP 200 OK`
  ```json
  {
    "confirmation_id": "cnf_e2e_8819",
    "quote_id": "quo_e2e_8819",
    "quote_number": "QUO-2026-0105",
    "action_type": "quote_accepted",
    "status": "approved",
    "reference_order_number": "SO-2026-1184",
    "confirmed_at": "2026-09-05T14:25:00Z",
    "signatory": {
      "name": "Sarah Connor",
      "email": "sarah.connor@cyberdyne-defense.com",
      "ip_address": "127.0.0.1"
    },
    "message": "Quote QUO-2026-0105 accepted. Sales Order SO-2026-1184 created."
  }
  ```
- **Database Change:**
  - Table: `sale_order`: Row locked with `FOR UPDATE`. Updated: `state: 'sale'`, `dealflow_status: 'approved'`, `date_order: NOW()`, `signed_by: 'Sarah Connor'`, `signed_on: NOW()`, `signature: '...'`.
- **Frontend State (Customer Portal SPA):**
  - Route navigates to `/portal/quotes/quo_e2e_8819/confirmation-success`; cached quote queries invalidated.
- **Expected UI (Customer Portal):**
  - Confirmation Success screen (Screen 11) with green checkmark animation: "Contract Legally Executed!", confirmed Sales Order number `SO-2026-1184`, PDF contract download link.
- **Failure Scenario:**
  - Unchecked acceptance checkbox returns `HTTP 400 Bad Request` (`code: TERMS_NOT_ACCEPTED`).
  - Stale revision e-sign attempt returns `HTTP 409 Conflict` (`code: SUPERSEDED_REVISION_ERROR`).

---

### Step 19: Confirmed Sales Order Created
- **User / Persona:** Odoo Order Execution Engine (Automated)
- **Action:** Converts the accepted quotation into an authoritative confirmed Sales Order record.
- **API Call:**
  - `GET /api/v1/portal/orders/SO-2026-1184` (or internal order retrieval)
  - Headers: `Authorization: Bearer mock_jwt_access_token_usr_c91f0e4b81`
- **Expected Request:** None
- **Expected Response:** `HTTP 200 OK`
  ```json
  {
    "order_id": "order_e2e_1184",
    "order_number": "SO-2026-1184",
    "quote_reference": "QUO-2026-0105",
    "commercial_partner_id": 1205,
    "customer_name": "Cyberdyne Defense Systems",
    "status": "confirmed",
    "fulfillment_status": "pending",
    "billing_status": "to_invoice",
    "payment_status": "unpaid",
    "total_amount": 73032.00,
    "currency": "USD"
  }
  ```
- **Database Change:**
  - Table: `sale_order`: `name: 'SO-2026-1184'`, `state: 'sale'`.
- **Frontend State (Customer Portal):**
  - Order reference `SO-2026-1184` stored in confirmation state.
- **Expected UI (Customer Portal):**
  - Dashboard shows executed contract badge `SO-2026-1184` with status "Order Processing".
- **Failure Scenario:**
  - Missing inventory or warehouse route mapping triggers internal alert task for operations desk.

---

### Step 20: Warehouse / Cloud Fulfillment Workflow Starts
- **User / Persona:** Operations / Logistics / Cloud Provisioning
- **Action:** Triggers automated stock pickings for the 4 physical edge gateways and issues cloud tenant provisioning credentials.
- **API Call:**
  - `POST /api/v1/internal/orders/SO-2026-1184/fulfill`
  - Headers: `Authorization: Bearer <ops_token>`, `Content-Type: application/json`
- **Expected Request:**
  ```json
  {
    "tracking_reference": "FEDEX-DEF-99182",
    "warehouse_id": "wh_central_01",
    "cloud_tenant_id": "tenant_cyberdyne_prod_01"
  }
  ```
- **Expected Response:** `HTTP 200 OK`
  ```json
  {
    "order_number": "SO-2026-1184",
    "fulfillment_id": "pick_e2e_881",
    "fulfillment_status": "in_progress",
    "hardware_tracking_number": "FEDEX-DEF-99182",
    "cloud_provisioning_status": "provisioned",
    "dispatched_at": "2026-09-05T14:26:00Z"
  }
  ```
- **Database Change:**
  - Table: `stock_picking`: Insert `id: 881`, `origin: 'SO-2026-1184'`, `state: 'assigned'`, `carrier_tracking_ref: 'FEDEX-DEF-99182'`.
  - Table: `sale_order`: `fulfillment_status: 'in_progress'`.
- **Frontend State (Customer Portal):**
  - Real-time event `order.fulfillment_updated` received; order tracking status updates to `In Fulfillment`.
- **Expected UI (Customer Portal):**
  - Order details card displays progress bar: "Hardware in Transit (FedEx DEF-99182) | Cloud Platform Provisioned".
- **Failure Scenario:**
  - Invalid carrier tracking code triggers `HTTP 400 Bad Request` (`code: INVALID_TRACKING_FORMAT`).

---

### Step 21: Accounting Invoice Generated
- **User / Persona:** Billing / Financial Controller (Automated)
- **Action:** Generates authoritative customer invoice (`account.move`) with Net 30 payment schedule.
- **API Call:**
  - `POST /api/v1/internal/orders/SO-2026-1184/invoice`
  - Headers: `Authorization: Bearer <billing_token>`, `Content-Type: application/json`
- **Expected Request:**
  ```json
  {
    "invoice_date": "2026-09-05",
    "due_date": "2026-10-05",
    "payment_terms": "Net 30"
  }
  ```
- **Expected Response:** `HTTP 201 Created`
  ```json
  {
    "invoice_id": "inv_e2e_0891",
    "invoice_number": "INV-2026-0891",
    "order_number": "SO-2026-1184",
    "state": "posted",
    "amount_untaxed": 68000.00,
    "amount_tax": 5032.00,
    "amount_total": 73032.00,
    "amount_residual": 73032.00,
    "payment_status": "not_paid"
  }
  ```
- **Database Change:**
  - Table: `account_move`: Insert `id: 891`, `name: 'INV-2026-0891'`, `move_type: 'out_invoice'`, `state: 'posted'`, `payment_state: 'not_paid'`, `amount_total: 73032.00`, `amount_residual: 73032.00`.
  - Table: `sale_order`: `billing_status: 'invoiced'`.
- **Frontend State (Customer Portal):**
  - Event `invoice.generated` received; invoice item added to customer billing drawer.
- **Expected UI (Customer Portal):**
  - Billing section renders "Invoice INV-2026-0891 ($73,032.00) - Due Oct 5, 2026" with "Download PDF" and "Pay Online" triggers.
- **Failure Scenario:**
  - Generating duplicate invoice for already invoiced order returns `HTTP 409 Conflict` (`code: ORDER_ALREADY_INVOICED`).

---

### Step 22: Customer Payment Recorded & Ledger Reconciled
- **User / Persona:** Financial Controller / Payment Gateway Webhook
- **Action:** Records full wire payment against `INV-2026-0891` and reconciles receivable accounts.
- **API Call:**
  - `POST /api/v1/internal/invoices/inv_e2e_0891/pay`
  - Headers: `Authorization: Bearer <finance_token>`, `Content-Type: application/json`
- **Expected Request:**
  ```json
  {
    "payment_method": "wire_transfer",
    "payment_reference": "WIRE-CYBERDYNE-99410",
    "amount": 73032.00,
    "currency": "USD"
  }
  ```
- **Expected Response:** `HTTP 200 OK`
  ```json
  {
    "payment_id": "pay_e2e_401",
    "invoice_number": "INV-2026-0891",
    "order_number": "SO-2026-1184",
    "amount_paid": 73032.00,
    "amount_residual": 0.00,
    "payment_status": "paid",
    "reconciled": true,
    "paid_at": "2026-09-05T14:28:00Z"
  }
  ```
- **Database Change:**
  - Table: `account_payment`: Insert `id: 401`, `payment_type: 'inbound'`, `amount: 73032.00`, `state: 'posted'`, `ref: 'WIRE-CYBERDYNE-99410'`.
  - Table: `account_move`: `payment_state: 'paid'`, `amount_residual: 0.00`.
  - Table: `sale_order`: `payment_status: 'paid'`.
- **Frontend State (Customer Portal):**
  - Event `payment.status_updated` received; payment status marked `paid`.
- **Expected UI (Customer Portal):**
  - Invoice pill turns green: "Paid in Full ($73,032.00)".
  - Order dashboard badge displays green status: "Contract Active & Settled".
- **Failure Scenario:**
  - Overpayment or mismatched currency triggers `HTTP 400 Bad Request` (`code: INVALID_PAYMENT_AMOUNT`).

---

## 3. Verifiable Test Checklist

| Step # | Verification Item | Verifiable Result / Assertion Criteria | Automated Test Case |
| :---: | :--- | :--- | :--- |
| **01** | Sales Rep Quote Creation | `status: 201`, `quote.status == 'draft'`, `revision_number == 1` | `test_01_sales_rep_creates_quotation` |
| **02** | Add Hardware Line | `status: 201`, line subtotal == \$10,000.00, tax == \$740.00 | `test_02_sales_rep_adds_hardware_line` |
| **03** | Add Subscription Line | `status: 201`, recurring subtotal == \$60,000.00, annual cadence | `test_03_sales_rep_adds_subscription_line` |
| **04** | Apply 5% Concession | `status: 200`, discount total == \$3,500.00, net == \$66,500.00 | `test_04_sales_rep_applies_initial_discount` |
| **05** | Baseline Approval Release | `status: 200`, `status == 'sent'`, Rev 1 active in DB | `test_05_initial_baseline_approval_completes` |
| **06** | Notification Delivery | `status: 200`, `event_type == 'quote_published'`, unread == 1 | `test_06_customer_receives_invitation_notification` |
| **07** | Customer Authentication | `status: 200`, returns Bearer JWT, `can_sign_quotes: true` | `test_07_customer_logs_into_portal` |
| **08** | Quote Detail Inspection | `status: 200`, 2 lines returned, margins/costs zero-leak purged | `test_08_customer_views_quotation_details` |
| **09** | Open Line Details | `status: 200`, drawer fetches line discussion payload | `test_09_customer_opens_line_details` |
| **10** | Post Line Question | `status: 201`, `visibility == 'customer'`, comment stored in DB | `test_10_customer_posts_line_level_question` |
| **11** | Quantity Change Request | `status: 201`, `quote_status == 'in_negotiation'`, `negotiation_status == 'pending_seller_review'` | `test_11_customer_submits_quantity_change_request` |
| **12** | Counter-Discount Proposal | `status: 201`, proposed 15% discount recorded | `test_12_customer_submits_counter_discount` |
| **13** | Pricing Recalculation | Recalculated Gross: \$80,000, Disc: \$12,000, Tax: \$5,032 | `test_13_backend_recalculates_pricing` |
| **14** | Risk Governance Escalation| Risk score = 41.5, escalated to Tier 2 (Commercial Director) | `test_14_discount_risk_triggers_approval_escalation` |
| **15** | Pending Approval Lock | `status: 200`, portal displays lock banner, confirmation locked | `test_15_customer_sees_pending_approval_locked_state` |
| **16** | Manager Concession Signoff | `status: 200`, Rev 2 published, status returns to `sent` | `test_16_manager_approves_concession_and_publishes_rev2` |
| **17** | Inspect Revision Diff | `status: 200`, diff confirms Qty 2 -> 4 and discount 5% -> 15% | `test_17_customer_views_updated_quote_and_diff` |
| **18** | Customer E-Signature | `status: 200`, atomic row lock, quote status == `approved` | `test_18_customer_confirms_and_esigns_quote` |
| **19** | Sales Order Generation | `status: 200`, `SO-2026-1184` created in state `sale` | `test_19_confirmed_order_created` |
| **20** | Fulfillment Initiation | `status: 200`, stock picking created, tracking code generated | `test_20_fulfillment_workflow_starts` |
| **21** | Accounting Invoice Created | `status: 201`, `INV-2026-0891` posted, amount == \$73,032.00 | `test_21_billing_invoice_generated` |
| **22** | Payment Settlement | `status: 200`, invoice marked `paid`, residual == 0.00 | `test_22_payment_recorded_and_reconciled` |
