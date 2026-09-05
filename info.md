# Project Info & Documentation

## 1. Problem Statement
**Odoo DealFlow 360** is designed to streamline and manage the end-to-end deal flow lifecycle. It helps investment teams, advisors, and business managers track deal opportunities, evaluate stages, manage communications, and maintain complete visibility into their investment pipeline.

The **Customer Portal** is a high-trust, standalone external B2B experience (separate from internal Odoo backend views) allowing enterprise clients, CFOs, and procurement leads to review proposals, inspect line items, negotiate terms and counter-discounts, compare revision diffs, post comments, and legally execute binding e-signatures.

## 2. Tech Stack
- **Python** – The primary programming language powering Odoo modules and backend logic.
- **Odoo framework** – Open-source ERP and business application platform providing ORM, MVC architecture, views, and workflows.
- **PostgreSQL** – Relational database management system used by Odoo to store models, deal flow records, and system data.
- **XML / QWeb** – Template and view definition languages used to construct Odoo user interfaces, forms, and kanban boards.
- **RESTful JSON API (RFC 8259)** – Standardized web API protocol connecting the external Customer Portal frontend with Odoo controllers.
- **Dual-Token JWT (RFC 7519)** – Bearer token authentication (15-min access token + 7-day secure HttpOnly refresh token) powering customer portal sessions.
- **RFC 7807 Problem Details** – Consistent machine-readable error responses for all HTTP `4xx` and `5xx` API failures.
- **Python `unittest` & `http.server`** – Zero-dependency test harness and mock server validating the contract end-to-end.
- **Modern B2B Design System** – Inter font with tabular numerals (`tabular-nums`), Obsidian/Indigo palette (`#0F172A`, `#4F46E5`), slide-over drawers, and non-destructive comparison workspaces.
- **HTML5 Canvas E-Signature** – Cryptographic client-side signature capture pad with drawn and typed modes.
- **OWASP Top 10 Anti-IDOR Architecture** – Row-level multi-tenant commercial partner boundaries with 404-masking defense against object enumeration.

## 3. Project Structure
```text
odoo-dealflow360/
├── docs/
│   ├── customer_portal_api_contract.md    # Phase 1: Complete Customer Portal & Backend API Contract
│   ├── customer_portal_ui_design.md       # Phase 2: Complete 14-Screen B2B Customer Portal UI/UX Design
│   ├── customer_portal_auth_security.md   # Phase 3: Authentication, Multi-Tenant Air-Gap & Anti-IDOR Security Architecture
│   ├── customer_portal_frontend_integration.md # Phase 9: Frontend Integration Layer Architecture & 9-Stage Data Flow Specification
│   ├── customer_portal_realtime_updates.md # Real-Time Customer Portal Updates Architecture (SSE vs WS vs Polling)
│   ├── customer_portal_security_audit.md  # Complete Security Audit, Threat Defense & Adversary Verification Matrix
│   ├── customer_portal_e2e_integration_test.md # Phase 11: End-to-End Integration Test Specification (22-Step Commercial Lifecycle)
│   └── customer_portal_ux_review_wow_moment.md # Phase 12: Senior SaaS UX Review, Polish Checklist & "WOW MOMENT" Live Demo Choreography
├── mock_server/
│   └── portal_mock_api.py                 # Standalone mock API & web server serving API, static assets, and Portal SPA
├── portal_ui/
│   ├── css/
│   │   └── portal-foundation.css          # Core tokens, typography, CSS variables, and shimmer animations
│   ├── js/
│   │   ├── api/                           # Core transport, storage & error primitives
│   │   │   ├── PortalApiError.js          # RFC 7807 problem details normalized error model
│   │   │   ├── TokenStore.js              # Session & JWT token manager with pub/sub lifecycle
│   │   │   ├── QueryCache.js              # In-memory TTL cache with selective invalidation & rollback
│   │   │   └── ApiClient.js               # Universal transport, Bearer JWT, 401 refresh & retry engine
│   │   ├── services/                      # Headless domain data-access services (Zero DOM coupling)
│   │   │   ├── AuthService.js             # Session login, magic links, token refresh & logout
│   │   │   ├── QuoteService.js            # Quotation listings, query serialization & KPI metrics
│   │   │   ├── QuoteDetailService.js      # Granular quote details & PDF contract download
│   │   │   ├── NegotiationService.js      # Status tracking, counter-discounts & change requests
│   │   │   ├── CommentService.js          # Line discussions, optimistic messaging & read receipts
│   │   │   ├── RevisionService.js         # Version timelines, frozen snapshots & semantic diffs
│   │   │   ├── ConfirmationService.js     # Pre-confirmation review & authoritative e-signatures
│   │   │   ├── NotificationService.js     # Alert notifications & optimistic read receipt tracking
│   │   │   ├── StatusService.js           # Polling coordinator & live negotiation event bus
│   │   │   └── index.js                   # Consolidated services registry & createPortalClient factory
│   │   ├── components/                    # Pure presentational UI primitives (Zero business logic)
│   │   │   ├── badges/                    # QuoteStatusBadge, NegotiationStatusBadge
│   │   │   ├── feedback/                  # ToastSystem, LoadingSkeleton, ErrorView, EmptyStateView
│   │   │   ├── layout/                    # PortalLayout, PortalHeader, CustomerIdentity, MainContentArea
│   │   │   ├── navigation/                # BreadcrumbTrail
│   │   │   ├── overlays/                  # ModalDialog, SlideOverDrawer, ConfirmationDialog
│   │   │   ├── quotes/                    # QuoteFilterBar, QuoteTable, QuoteCard, QuotePagination, QuoteListContainer
│   │   │   ├── detail/                    # QuoteDetailHeader, QuoteNegotiationBanner, QuoteLineItemsTable, QuotePricingSummary, QuoteCommercialTerms, QuoteSalesRepCard, QuoteDetailContainer
│   │   │   ├── comments/                  # LineCommentBadge, CommentMessageBubble, CommentComposer, LineDiscussionDrawer
│   │   │   └── index.js                   # Consolidated component registry & export
│   │   └── types/
│   │       └── portal-components.d.ts     # TypeScript prop interfaces and type contracts
│   └── index.html                         # Complete 14-screen interactive Customer Portal Single-Page App
├── tests/
│   ├── test_portal_api_contract.py        # Automated contract test suite (22 unit tests)
│   ├── test_portal_ui_screens.py          # Automated UI screen & routing test suite (16 unit tests)
│   ├── test_portal_security_auth.py       # Automated security, auth & anti-IDOR test suite (18 unit tests)
│   ├── test_portal_foundation_components.py # Automated foundation components & static asset suite (16 unit tests)
│   ├── test_portal_quote_listing.py       # Automated quotation listing, search, sort, filter & zero-leak suite (14 unit tests)
│   ├── test_portal_quote_detail.py        # Automated quotation detail, line items, terms & e-sign suite (12 unit tests)
│   ├── test_portal_line_comments.py       # Automated line-level commenting, zero-leak & anti-IDOR suite (13 unit tests)
│   ├── test_portal_integration_layer.py   # Automated frontend integration layer & domain services suite (19 unit tests)
│   └── test_portal_e2e_integration.py     # Automated end-to-end lifecycle integration test suite (23 unit tests)
├── info.md                                # Living project documentation maintained across sessions
```

## 4. Features Implemented
- **Phase 1 Customer Portal & Backend Integration Contract:**
  - 20 complete REST API endpoints across Authentication, Quotes, Negotiations, Revisions, Comments, Attachments, and Notifications.
  - Multi-tenant partner boundary isolation and zero-leak security rules (cost prices, internal chatter, and margin data strictly masked).
  - Explicit enum specifications for Quote Status (`quote_status`), Negotiation Status (`negotiation_status`), and Approval Status (`approval_status`).
  - Standardized JSON schemas for Quote Revisions, Line Item Change Requests, Counter-Discounts, Confirmation Receipts, and Notifications.
- **Runnable Mock API Server & Automated Verification Suite:**
  - `mock_server/portal_mock_api.py`: Standalone mock server implementing all 20 contract endpoints with CORS, authentication checks, binary PDF delivery, and RFC 7807 error envelopes.
  - `tests/test_portal_api_contract.py`: 22 automated test cases verifying all 20 endpoints plus unauthorized and 404 security guards. 100% passing (22/22).
- **Phase 2 Customer Portal UI/UX Design System (14 Screens):**
  - Designed complete enterprise customer-facing interface across all 14 screens: Login, Dashboard, My Quotations, Quotation Details, Negotiation Workspace, Line-Level Discussion, Change Request, Counter Discount, Revision History, Confirmation Screen, Confirmation Success, Error/Expired Quote, Access Denied, and Global Loading/Empty States.
  - Implemented interactive Single-Page Application in `portal_ui/index.html` served directly at `http://127.0.0.1:8080/portal`.
  - `tests/test_portal_ui_screens.py`: 16 automated test cases verifying all 14 screen components, routing engines, and UI state handlers. 100% passing (16/16).
  - Combined test suite: **38 automated unit tests passing in 1.45s**.
- **Phase 3 Customer Portal Authentication & Anti-IDOR Security System:**
  - Air-gapped external customer authentication (`share=True`) from internal employee ERP logins (`base.group_user`).
  - Designed stateless signed JWT architecture embedding `partner_id` and `commercial_partner_id`.
  - Implemented 3-tier Zero-Trust Anti-IDOR defense: Client route guard, Backend controller dual-predicate query, and 404-masking against enumeration.
  - Designed 1-click cryptographic magic link onboarding for frictionless hackathon demonstrations.
  - Specified 7 attack scenarios and concrete security test cases (tampering, forgery, employee bypass, signatory impersonation, replay attacks).
  - `tests/test_portal_security_auth.py`: 13 automated security test cases verifying anti-IDOR isolation, PDF export protection, counter-offer/change-request/e-sign ownership guards, signatory privileges, employee portal bypass, magic link verification/expiration, token tampering, and zero-leak data redaction. 100% passing (13/13).
  - Complete combined test suite: **51 automated unit tests passing across all suites in 1.16s**.
- **Phase 4 Customer Portal Frontend Foundation Architecture:**
  - Designed clean presentation/logic decoupled component hierarchy (App Shell, Layout, Header, Identity Area, Badges, Overlays, Toasts, Skeletons, Error/Empty States).
  - Specified deterministic UI primitives with explicit props, ARIA accessibility bindings, and zero embedded business logic.
  - Architected responsive 4-tier breakpoint system (Mobile Phone `<640px`, Tablet `640-1023px`, Desktop `1024-1279px`, High-Res Procurement `≥1280px`).
  - Standardized RFC 7807 problem details mapping for error boundaries and stacked toast alerts.
  - `tests/test_portal_foundation_components.py`: 16 automated unit tests verifying all 14 presentation primitives, ARIA dialog accessibility, RFC 7807 toast/error formatting, layout slots, and mock server static delivery. 100% passing (16/16).
  - Complete combined test suite: **67 automated unit tests passing across all 4 suites in 3.40s**.
- **Phase 5 Customer Portal Quotation Listing Architecture:**
  - Designed strict commercial partner multi-tenant query isolation (`commercial_partner_id == token.commercial_partner_id`), guaranteeing Customer A cannot search, browse, or paginate into Customer B's records.
  - Specified zero-leak data redaction matrix: internal margins, cost prices, risk ratings, approval desk notes, and minimum discount floors are expunged at the controller serialization boundary.
  - Architected 5-step API integration lifecycle: Frontend request with query params (`search`, `status`, `has_negotiation`, `sort_by`, `sort_dir`, `page`, `per_page`), Backend JWT authorization, Sanitized response schema, UI transformation pipeline (tabular numerals, relative timestamps, negotiation attention badges), and RFC 7807 error handling.
  - Designed responsive presentation components: `QuoteFilterBar`, `QuoteTable` (desktop), `QuoteCard` (mobile), and `QuotePagination`.
  - `tests/test_portal_quote_listing.py`: 14 automated unit tests verifying multi-tenant isolation, status filtering, active negotiation toggling, substring search, multi-criteria sorting, pagination, zero-leak scrubbing, and component rendering. 100% passing (14/14).
  - Complete combined test suite: **81 automated unit tests passing across all 5 test suites in 3.95s**.
- **Phase 6 Customer Quotation Detail Page Architecture:**
  - Designed enterprise 2-column commercial review layout (70% deliverables and contractual terms / 30% sticky pricing and actions).
  - Defined comprehensive quotation view: quote number, status, created/expiry dates, product/service lines (UoM, unit price, customer discount, tax, subtotal, line total), one-time vs recurring charges, billing/shipping address, and contractual commitments.
  - Specified live negotiation banner with multi-stage approval tracker (Stage 1: Commercial Review -> Stage 2: Deal Desk Signoff), estimated resolution, and seller comments.
  - Enforced signatory permission rules: Signatories can execute binding e-signatures (`Accept & Sign Quote`); Viewers receive read-only review permissions with signatory requirement advisories.
  - Designed zero-leak redaction boundary permanently expunging internal cost prices, profit margins, sales commissions, and internal risk scores.
  - Implemented 7 reusable presentation components: `QuoteDetailHeader`, `QuoteNegotiationBanner`, `QuoteLineItemsTable`, `QuotePricingSummary`, `QuoteCommercialTerms`, `QuoteSalesRepCard`, and `QuoteDetailContainer`.
  - `tests/test_portal_quote_detail.py`: 12 automated unit tests verifying data completeness, zero-leak scrubbing, anti-IDOR 404-masking, signatory privilege enforcement, negotiation status retrieval, and component rendering in Node.js. 100% passing (12/12).
  - Complete combined test suite: **93 automated unit tests passing across all 6 test suites in 5.14s**.
- **Phase 8 Line-Level Commenting System Architecture:**
  - Designed and implemented contextual discussion drawer anchored to individual deliverables and service rows in `QuoteLineItemsTable`.
  - Architected multi-revision thread continuity model utilizing `stable_line_key` preserving discussion history across quote revisions with revision context tags ("Quote Rev #1").
  - Formulated and verified strict zero-leak internal visibility air-gap: internal employee comments (`visibility = 'internal'`) are hard-filtered in database queries (`WHERE visibility = 'customer'`) and permanently excluded from portal serialization.
  - Implemented mock API endpoints in `mock_server/portal_mock_api.py`: `GET /quotes/{id}/lines/{line_id}/comments`, `POST /quotes/{id}/lines/{line_id}/comments`, `PATCH .../read`, and `GET .../comments/summary`.
  - Created reusable frontend presentation components under `portal_ui/js/components/comments/`: `LineDiscussionDrawer`, `CommentMessageBubble` (customer vs sales rep styling, historical revision badge), `CommentComposer` (quick prompts, file attachment, keyboard shortcuts), and `LineCommentBadge` (total count, amber unread pill).
  - Wired `LineCommentBadge` directly into `QuoteLineItemsTable` rows while preserving action delegation.
  - `tests/test_portal_line_comments.py`: 13 automated unit tests verifying line comment retrieval, author typing, timestamps, stable keys, zero-leak boundary redaction of internal deal desk notes, anti-IDOR cross-tenant 404-masking, comment posting, validation, read-receipt updates, and component rendering in Node.js. 100% passing (13/13).
  - Complete combined test suite: **106 automated unit tests passing across all 7 test suites in 7.22s**.
- **Phase 9 Customer Portal Frontend Integration Layer Architecture:**
  - Designed and implemented clean headless service/data-access layer under `portal_ui/js/api/` and `portal_ui/js/services/` strictly decoupling UI presentation from network protocols.
  - Implemented core transport & state primitives: `PortalApiError` (RFC 7807 problem details error model, network error factory, user-friendly toast/alert mapper), `TokenStore` (JWT session storage, pub/sub state events), `QueryCache` (in-memory TTL caching, deterministic key generation, prefix invalidation, and optimistic updates with rollback), and `ApiClient` (universal HTTP transport, Bearer JWT injection, 401 silent refresh interceptor, exponential backoff retry on idempotent requests).
  - Built 9 headless domain services: `AuthService`, `QuoteService`, `QuoteDetailService`, `NegotiationService`, `CommentService`, `RevisionService`, `ConfirmationService`, `NotificationService`, `StatusService`, and unified factory `createPortalClient` in `portal_ui/js/services/index.js`.
  - Linked all API and service scripts into `portal_ui/index.html`.
  - `tests/test_portal_integration_layer.py`: 19 automated unit & integration tests verifying static asset delivery, RFC 7807 error normalization, token session storage, query caching, 401 silent refresh, and all 9 domain services against live mock server. 100% passing (19/19).
  - Complete combined test suite: **125 automated unit tests passing across all 8 test suites in 8.65s**.
- **Real-Time Customer Portal Updates Architecture (SSE vs WS vs Polling):**
  - Compared Polling, WebSockets (RFC 6455), and Server-Sent Events (SSE / W3C); recommended SSE with Smart Adaptive Polling fallback as the optimal hackathon and enterprise solution.
  - Specified 10 customer-safe real-time event types: `quote.updated`, `comment.sales_replied`, `negotiation.status_changed`, `negotiation.approved`, `negotiation.rejected`, `quote.revised`, `quote.confirmed`, `order.fulfillment_updated`, `invoice.generated`, and `payment.status_updated`.
  - Engineered zero-leak security boundaries ensuring internal deal desk chatter, margin impacts, and approval risk scores are never emitted to customer channels.
  - Designed ephemeral ticket handshake (`POST /realtime/ticket`) to authenticate browser `EventSource` without exposing credentials in query strings.
  - Architected gapless reconnection via `Last-Event-ID` server replay and battery-efficient Page Visibility API pause/resume.
- **Complete Security Audit & Threat Defense Specification (OWASP API Top 10):**
  - Formulated adversarial threat model and defensive engineering specification in `docs/customer_portal_security_audit.md`.
  - Systematically evaluated all 18 attack vectors: Quote ID IDOR, customer ID forgery, cross-tenant PDF/attachment access, direct API invocation, mass assignment/over-posting tampering, discount manipulation, unapproved quote confirmation, cross-tenant confirmation, internal approval leakage, internal margin/cost price leakage, internal comments air-gap leakage, direct status mutation, confirmation replay attacks, expired sessions, invalid/tampered tokens, stored XSS in comments, injection in negotiation notes, and unauthenticated endpoint invocation.
  - Formulated 5 core defensive paradigms: 404-masking defense, whitelist-only serialization, cryptographic claims extraction, database row-level concurrency locks (`SELECT ... FOR UPDATE`), and context-aware escaping.
  - Expanded `tests/test_portal_security_auth.py` from 13 to 18 unit tests; verified full test suite: **130/130 tests passing across all 8 test suites in 7.13s**.
- **Phase 11 Customer Portal End-to-End Integration Test Architecture & Verification:**
  - Formulated exhaustive 22-step integration test specification in `docs/customer_portal_e2e_integration_test.md` detailing API call, expected request, expected response, database changes, frontend states, expected UI, and failure scenarios for every step.
  - Verified the complete commercial sequence: Sales Rep creation -> Hardware line -> Subscription line -> 5% discount -> Baseline approval -> Customer magic link invitation -> Customer review -> Hardware line discussion -> Quantity change request (2 -> 4 units) -> Counter-discount proposal (5% -> 15%) -> Authoritative pricing recalculation -> Blended risk scoring (score 41.5, Tier 2 escalation) -> Customer "Pending Approval" locked banner -> Commercial Director concession approval -> Revision #2 diff inspection -> Legal e-signature execution -> Confirmed Sales Order (`SO-2026-1184`) -> Warehouse/cloud fulfillment -> Accounting invoice (`INV-2026-0891`) -> Payment recording and ledger reconciliation.
  - Extended `mock_server/portal_mock_api.py` with internal quotation, approval, fulfillment, billing, and payment endpoints; added socket drainage in `do_GET` to eliminate Windows Winsock 10053 TCP RST issues.
  - Created automated test suite `tests/test_portal_e2e_integration.py` (23 unit tests); verified repository regression across all 9 test suites: **153/153 automated unit tests passing in 9.44s**.
- **Customer Counter-Discount Negotiation System Architecture:**
  - Designed authoritative backend discount governance engine and server-side quote recalculation pipeline with zero hardcoded client-side discount caps or approvals.
  - Architected multi-variable Blended Risk Score formula factoring margin compression ($R_{\text{margin}}$, 40%), partner creditworthiness ($R_{\text{credit}}$, 25%), deal volume velocity ($R_{\text{velocity}}$, 20%), and delivery scope ($R_{\text{scope}}$, 15%).
  - Specified 4-tier approval routing matrix (Tier 1: Sales Manager, Tier 2: Commercial Director, Tier 3: VP Worldwide Sales, Tier 4: CFO / Deal Approval Board).
  - Defined zero-leak API request/response contracts stripping internal risk ratings, margin impact metrics, and deal desk notes from portal consumers.
  - Architected three revision resolution pathways (seller acceptance -> Quote Revision #2, seller compromise counter-offer -> Quote Revision #2 diff, seller decline -> Quote Revision #1 retained).
- **Quotation Negotiation & Multi-Revision Living Document System Architecture:**
  - Architected living document multi-revision data model (Quote v1 -> v2 -> v3) preserving full bilateral negotiation audit trails rather than treating quotes as static PDFs.
  - Designed immutable revision snapshot schema across `dealflow_quote_revision` and `dealflow_quote_revision_line` with cryptographic SHA-256 content hashing (`content_hash`).
  - Defined comprehensive revision metadata: revision number, state (`published`, `superseded`), author identity (`customer` vs `sales_agent`), change summary, business rationale, and timestamps.
  - Specified automated diff engine matching line items on `stable_line_key` to classify additions, removals, and modifications with strikethrough visual cues.
  - Defined REST API endpoints for revision retrieval: `GET /quotes/{id}` (current live revision), `GET /quotes/{id}/revisions` (chronological history), `GET /quotes/{id}/revisions/{rev_id}` (historical archive snapshot), and `GET .../diff` (semantic comparisons).
- **Customer Portal → Discount Engine → Approval Engine Integration:**
  - Designed complete 11-step closed-loop lifecycle from initial sales creation through counter-discount submission, server recalculation, automatic approval re-routing, in-flight confirmation lock, revision publication, and customer execution.
  - Formulated 5-dimensional state synchronization matrix tracking `quote.status`, `quote.negotiation_status`, `revision.state`, `approval.state`, and sanitized customer-visible UI state.
  - Specified asynchronous domain event bus architecture: `dealflow.counter_discount.submitted`, `dealflow.approval.required`, `dealflow.approval.granted`, `dealflow.quote.revision_published`, and `dealflow.quote.accepted`.
  - Engineered strict race-condition defenses: UUID v4 `Idempotency-Key` + database row locks against double submissions, HTTP `409 Conflict` (`QUOTE_IN_NEGOTIATION_LOCKED`) against premature e-signs, revision content hash checks against stale accepts, and automatic expiration clock pausing during active review.
- **Final Customer Confirmation & Legal Execution Architecture:**
  - Designed comprehensive pre-confirmation review UI (`QuoteConfirmationModal.js`) rendering final revision badge, itemized deliverables, one-time vs recurring charges, transparent discounts, taxes, TCV, contractual terms, and HTML5 canvas signature pad.
  - Engineered authoritative 7-check backend transaction pipeline executed with row-level locks (`SELECT ... FOR UPDATE`): ownership, signatory privilege, quote status, negotiation state, expiration timestamp, revision currency/content hash, and idempotency key.
  - Defined deterministic RFC 7807 error-recovery contracts for all edge cases: changed since page load (`409 SUPERSEDED_REVISION_ERROR`), expired (`410 QUOTE_EXPIRED_ERROR`), approval pending (`409 QUOTE_IN_NEGOTIATION_LOCKED`), quote rejected (`409 QUOTE_REJECTED_ERROR`), and duplicate/already confirmed quotes (`409 ALREADY_CONFIRMED_QUOTE` / cached replay).
  - Specified asynchronous downstream workflow orchestration on `dealflow.quote.accepted`: cloud tenant provisioning, Odoo deposit invoice generation, CRM win tracking, and immutable WORM PDF contract archiving.
- **Frontend Integration Layer & Headless Data-Access Architecture:**
  - Designed clean presentation/data-access separation: UI components strictly contain zero direct network calls, delegating all operations to domain services.
  - Built core transport infrastructure: `ApiClient` with timeout abort controllers, automatic Bearer JWT injection, transparent 401 silent token refresh interceptor, and RFC 7807 `PortalApiError` normalization.
  - Engineered exponential backoff retry engine for idempotent requests (GET/HEAD on 502/503/504) and strict mutation idempotency safeguards.
  - Implemented `QueryCache` with TTL management, safe optimistic UI updates with automatic rollback, and selective query invalidation.
- **Phase 12 Senior SaaS UX Review, Enterprise Polish Checklist & "WOW MOMENT" Demo Architecture:**
  - Evaluated the DealFlow360 Customer Portal as a Senior SaaS Product Designer & Hackathon Judge across 12 critical enterprise UX pillars: Visual hierarchy, Quote readability, Status communication, Negotiation experience, Customer confidence & audit integrity, Error messages (RFC 7807 humanization), Content-aware loading states, Proactive empty states, Confirmation & e-signature flow, Mobile responsiveness, Accessibility (WCAG 2.1 AA), and Micro-interactions.
  - Formulated prioritized P0/P1/P2 Polish Checklist focusing on high-trust enterprise B2B deal execution (pre-flight checklist, "who holds the ball" status telemetry, dual-pane diff highlighting, connected commerce fulfillment ribbon).
  - Designed split-screen, gimmick-free "WOW MOMENT" live demo choreography illustrating the closed-loop commercial lifecycle across 5 stages (Initial Review -> Intelligent Negotiation & Real-Time Recalculation -> Governance Engine & Automatic Approval Lock -> Real-Time Sync & Side-by-Side Revision Diff -> Binding E-Sign & Connected Commerce Execution).
  - Published comprehensive specification in `docs/customer_portal_ux_review_wow_moment.md`.

## 5. How Things Work (Function-Level Flow)

### Customer Authentication & Anti-IDOR Ownership Validation Flow
> When an external customer authenticates and accesses a quotation:
> 1. Client authenticates via password or magic link invitation at `/api/v1/portal/auth/login`.
> 2. Backend confirms `share: true` (strictly external customer) and generates a signed HMAC-SHA256 JWT containing `partner_id` and `commercial_partner_id`.
> 3. For any protected quotation endpoint (e.g. `GET /quotes/{quote_id}`), the backend middleware extracts the JWT claims.
> 4. Backend SQL query enforces a strict dual-predicate: `quote.id == quote_id AND quote.commercial_partner_id == token.commercial_partner_id`.
> 5. If an attacker attempts to substitute another customer's `quote_id`, the query returns 0 rows and the backend responds with `404 Not Found` (anti-enumeration mask).
> 6. If the customer attempts to execute an agreement without signatory rights (`can_sign_quotes == false`), backend rejects with `403 Forbidden`.

### Customer Portal Frontend Testing & Verification Flow
> When testing the Customer Portal frontend:
> 1. Running `python -m unittest discover tests` spins up test servers on isolated ports.
> 2. `test_portal_ui_screens.py` requests `/portal`, asserting valid HTML structure, responsive Tailwind/Inter assets, and zero layout shift shimmers.
> 3. Inspects DOM elements across all 14 screens, ensuring buttons, steppers, canvas pads, and drawers have corresponding event handlers.
> 4. Validates client-side hash router (`#/dashboard`, `#/quotes`, `#/quotes/:id`, `#/negotiate`, `#/confirmed`, etc.).
> 5. Confirms all UI tests pass with 0 errors.

### Security & Multi-Tenant Anti-IDOR Test Verification Flow
> When running the Phase 3 Security & Authentication automated test suite:
> 1. `setUpClass()` in `tests/test_portal_security_auth.py` spins up the isolated mock test server on `http://127.0.0.1:8998`.
> 2. Prepares authenticated tokens for Customer A (`Apex Global`, `partner_id: 1042`), Customer B (`Starlight Health`, `partner_id: 2099`), Non-Signatory Viewer (`David Kim`), and an Internal Sales Rep.
> 3. `test_01` to `test_05` attempt IDOR attacks where Customer A requests Customer B's quote, attempts PDF export, posts counter-discounts, submits change requests, and attempts e-signing. Asserting that all 5 vectors strictly return `404 Not Found` with code `QUOTE_NOT_FOUND` (404-masking defense).
> 4. `test_06` verifies legitimate access: Customer B requesting their own quote receives `200 OK`.
> 5. `test_07` tests signatory privilege enforcement: Non-signatory attempting to sign receives `403 Forbidden` (`FORBIDDEN_SIGNATORY_REQUIRED`).
> 6. `test_08` tests internal employee portal bypass: Internal sales login receives `403 Forbidden` (`EMPLOYEE_PORTAL_BYPASS`).
> 7. `test_09` to `test_11` test magic link verification, rejection of expired links (`LINK_EXPIRED`), and rejection of tampered tokens (`401 Unauthorized`).
> 8. `test_12` asserts zero-leak data redaction: internal keys (`_internal_cost_price`, `_internal_margin_pct`, `_internal_sales_notes`) are never exposed in portal API responses.
> 9. `test_13` verifies quote list multi-tenant isolation: Customer A sees only their quotes, Customer B sees only theirs.

### Customer Portal Route Guard & Screen Transition Flow
> When a customer navigates through the portal:
> 1. Customer enters a route (e.g. `/portal/quotes/quo_8819ab2`).
> 2. Client-side router checks in-memory JWT token. If expired/absent, triggers silent refresh via `POST /auth/refresh`.
> 3. If unauthenticated, user is redirected to Screen 1 (`/portal/login`) with redirect query param.
> 4. If authenticated, router checks user permissions (`can_sign_quotes`).
> 5. If user attempts to execute an agreement without signatory rights, Screen 13 (`Access Denied / 403`) is displayed with an option to request permission upgrade.
> 6. On accessing Screen 4 (`Quotation Details`), skeleton loaders render while `GET /quotes/{quote_id}` fetches data.
> 7. If quote has expired (`status === 'expired'`), view routes immediately to Screen 12 (`Error / Expired Quote`), rendering an "Expired" watermark and a 1-click re-activation request drawer.

### Quote Review & E-Sign Acceptance Flow
> When the customer reviews and accepts a quote on the portal:
> 1. Customer reviews line items and clicks "Accept & Sign Quote" on Screen 4.
> 2. Screen 10 (`Confirmation & E-Sign Modal`) opens with contract summary and HTML5 signature pad.
> 3. Customer draws or types signature, enters PO number, and checks the mandatory authorization box.
> 4. Portal submits `POST /api/v1/portal/quotes/{quote_id}/accept` with `Idempotency-Key` header.
> 5. Backend validates quote state and signatory rights, saves signature, and creates Sales Order (`SO-xxxx`).
> 6. Frontend transitions into Screen 11 (`Confirmation Success`), presenting the executed receipt and immediate contract PDF download.

### Counter-Discount Negotiation & Authoritative Governance Flow
> When the customer requests a price discount:
> 1. Customer clicks "Propose Counter-Offer" on Quotation Detail, opening `CounterDiscountModal`.
> 2. Customer adjusts the requested discount percentage (e.g., from 8% to 12%) or specifies target ceiling budget ($95,000.00). Frontend computes an estimated projection preview only without deciding acceptability.
> 3. Submitting sends `POST /api/v1/portal/quotes/{quote_id}/negotiation/counter-discount` with `Idempotency-Key` header.
> 4. Backend verifies ownership (`commercial_partner_id`) and locks quote record.
> 5. Financial Recalculation Engine recomputes deliverables, discounts, and taxes.
> 6. Discount Governance Engine checks account tier and product category limits.
> 7. Blended Risk Engine computes composite risk score (margin erosion 40%, credit 25%, TCV 20%, scope 15%).
> 8. Approval Routing assigns review tier (AE -> Commercial Director -> VP Sales -> CFO).
> 9. Quote transitions to `status: 'in_negotiation'`, `negotiation_status: 'pending_seller_review'`.
> 10. Sanitized response (without internal risk scores or margins) returns 201 Created with public stage name and estimated resolution time.
> 11. Customer UI refreshes to display the live amber negotiation banner with approval progress tracker.

### Line Item Change Request Flow
> When the customer modifies deliverables or quantities:
> 1. Customer opens Screen 7 (`Change Request Drawer`) from the quote details screen.
> 2. Customer alters line item quantities (e.g., reducing training days from 5 to 3).
> 3. Submitting sends `POST /api/v1/portal/quotes/{quote_id}/negotiation/change-request`.
> 4. Backend registers requested changes and notifies the account executive.
> 5. Quote displays pending change badge until seller publishes a new revision.

### End-to-End Quotation Lifecycle Flow (Sales Rep to Payment Settlement)
> In the complete 22-step integration test lifecycle:
> 1. **Quotation Initialization:** Sales Rep initializes deal quotation (`POST /internal/quotes`) for Cyberdyne Defense Systems (`partner_id: 4821`, `commercial_partner_id: 1205`), creating quote in `draft` state with Revision #1.
> 2. **Deliverables Assembly:** Sales Rep attaches one-time hardware Edge Gateways (`line_e2e_01`, Qty 2, $10,000) and recurring Cloud Threat Defense annual subscription (`line_e2e_02`, Qty 100, $60,000/yr). Gross subtotal reaches $70,000.00 ($75,180.00 with tax).
> 3. **Concession & Release:** Sales Rep applies 5% introductory discount (`PATCH /internal/quotes/{id}/discount`), reducing subtotal to $66,500.00 ($71,421.00 TCV). Commercial Director baseline signoff (`POST .../baseline-approve`) publishes Revision #1 with status `sent`.
> 4. **Customer Onboarding & Review:** Customer Signatory (Sarah Connor) receives invitation notification, exchanges magic link (`POST /auth/magic-verify`), and inspects deliverables and Net 30 commercial terms.
> 5. **Bilateral Line Discussion:** Customer opens slide-over drawer on hardware line and posts a question regarding rack mount and redundant power supplies (`POST .../comments`). Discussion thread is preserved on `stable_line_key`.
> 6. **Bilateral Negotiation:** Customer requests scaling hardware from 2 to 4 units (`POST .../negotiation/change-request`) and proposes a 15% volume counter-discount (`POST .../counter-discount`). Quote transitions to `in_negotiation` (`pending_seller_review`).
> 7. **Authoritative Governance & Escalation:** Backend pricing engine recalculates model (Gross: $80k, Discount: $12k, Net: $68k, Tax: $5,032, TCV: $73,032). Blended Risk Engine computes score of 41.5 (exceeding Tier 1 threshold of 40), automatically locking customer confirmation and escalating to Tier 2 (Commercial Director).
> 8. **Concession Signoff & Revision Diff:** Commercial Director reviews risk profile and approves concession (`POST .../manager-approve`), publishing Revision #2. Customer inspects side-by-side diff comparing deliverables and price drops.
> 9. **Legal Execution (E-Sign):** Customer checks terms acceptance, draws e-signature, and submits `POST .../accept` with `Idempotency-Key`. Database locks record (`FOR UPDATE`), sets state to `sale`, and creates confirmed Sales Order `SO-2026-1184`.
> 10. **Downstream Execution & Settlement:** Operations initiates warehouse picking and cloud provisioning (`POST .../fulfill`, FedEx DEF-99182), Finance issues posted invoice (`POST .../invoice`, `INV-2026-0891`), and customer wire payment of $73,032.00 is recorded (`POST .../pay`), reconciling ledger accounts in full.

### Contract Verification & Mock API Execution Flow
> When running the contract verification test suite:
> 1. Developer or CI/CD executes `python -m unittest tests/test_portal_api_contract.py`.
> 2. `setUpClass()` initializes `PortalMockHandler` on `http://127.0.0.1:8999` in a background daemon thread.
> 3. Each test method dispatches an HTTP request via `urllib.request` simulating customer portal client interactions.
> 4. `_check_auth()` intercepts requests to ensure valid Bearer token headers are present for protected resources.
> 5. Assertions validate HTTP status codes (`200 OK`, `201 Created`, `401 Unauthorized`, `404 Not Found`), payload structures, and RFC 7807 error envelopes.
> 6. `tearDownClass()` shuts down the mock server socket cleanly upon test suite completion.
### Reusable Component Presentation & Decoupling Flow
> In the Phase 4 Frontend Foundation Architecture:
> 1. Screens and containers subscribe to data from headless API services or state stores.
> 2. Presentational primitives (`PortalLayout`, `PortalHeader`, `CustomerIdentityArea`, `QuoteStatusBadge`, `NegotiationStatusBadge`, `ModalDialog`, `SlideOverDrawer`, `ConfirmationDialog`, `ToastSystem`, `LoadingSkeleton`, `ErrorState`, `EmptyState`) receive clean props and emit raw user intent events via callback props.
> 3. Zero business logic, validation rules, or direct `fetch()` calls occur within UI components.
> 4. Error responses adhering to RFC 7807 problem details are automatically mapped to accessible ErrorView components and stacked toast notifications.
> 5. Responsive layout adapts via a 4-tier breakpoint matrix (mobile stacked cards to ultra-wide procurement split screens).

### Quotation Listing Multi-Tenant Data Retrieval & Zero-Leak Lifecycle Flow
> In the Phase 5 Quotation Listing Architecture:
> 1. Frontend `QuoteListContainer` coordinates query state (`search`, `status`, `sort_by`, `sort_dir`, `page`, `per_page`) with 300ms debouncing on text search.
> 2. `QuoteService` dispatches authenticated `GET /api/v1/portal/quotes` with Bearer JWT token.
> 3. Backend verifies customer token, asserts `share == True`, and constructs query domain strictly anchored to `commercial_partner_id == token.commercial_partner_id`.
> 4. Backend serialization pipeline strips all internal intelligence (`_internal_cost_price`, `_internal_margin_pct`, `_internal_approval_notes`, `_internal_risk_rating`) before returning customer-safe payload.
> 5. View model normalizer maps raw financials to localized currency strings with tabular numerals, relative timestamps, and active negotiation alert indicators.
> 6. Viewport switches automatically between desktop `QuoteTable` and mobile `QuoteCard` list, rendering `SkeletonTable` during loading, `EmptyStateView` when zero matches exist, and `ErrorView` upon network failure.

### Quotation Detail Review, Commercial Inspection & E-Sign Flow
> In the Phase 6 Quotation Detail Architecture:
> 1. Frontend requests `GET /api/v1/portal/quotes/{quote_id}` with Bearer token.
> 2. Backend enforces Anti-IDOR ownership check (`quote.commercial_partner_id == user.commercial_partner_id`), returning `404 Not Found` if mismatched.
> 3. Redaction pipeline removes confidential internal costs, margins, and commissions before returning the quote detail.
> 4. `QuoteDetailContainer` renders top breadcrumbs, `QuoteDetailHeader` with revision indicator, line items breakdown (one-time vs recurring charges), customer-facing discounts, taxes, and contractual terms.
> 5. When `status == 'in_negotiation'`, `QuoteNegotiationBanner` renders a multi-stage approval progress tracker and estimated resolution time.
> 6. Signatories (`can_sign_quotes == true`) can trigger e-signing via the "Accept & Sign Quote" button; Viewers receive informational tooltips regarding signatory authorization requirements.
> 7. Customer can open line item discussion drawer with real-time unread comment badge, export PDF contract, or propose counter-discounts.

### Line-Level Commenting & Revision Preservation Flow
> In the Phase 8 Line-Level Commenting Architecture:
> 1. Customer clicks the comment icon on any deliverables line in `QuoteLineItemsTable`.
> 2. `LineDiscussionDrawer` opens, triggering `GET /api/v1/portal/quotes/{quote_id}/lines/{line_id}/comments`.
> 3. Backend verifies ownership (`quote.commercial_partner_id == current_user.commercial_partner_id`), returning `404 Not Found` if unauthorized.
> 4. SQL query enforces visibility air-gap: `WHERE quote_id = :qid AND (quote_line_id = :lid OR stable_line_key = :slk) AND visibility = 'customer'`.
> 5. Comments from earlier revisions are returned with revision tags (`revision_number`, `is_from_earlier_revision: true`).
> 6. Opening the drawer automatically issues `PATCH .../read`, clearing the unread badge for that line item.
> 7. Customer submits a message via `CommentComposer`; client optimistically appends the bubble with a sending indicator, swapping with the server record on `201 Created`.

### Multi-Revision Living Document & Superseded Revision Protection Flow
> In the Multi-Revision Quotation Negotiation Architecture:
> 1. Each published revision (Rev 1, Rev 2, Rev 3) represents an immutable frozen snapshot with cryptographic SHA-256 content hash.
> 2. Customer navigates to Revision History (`#/quotes/:id/revisions`), viewing chronological stepper, financial variances, and semantic line diffs.
> 3. When viewing any historical revision (e.g. Rev 1 when Rev 2 is active), the UI applies a `SUPERSEDED` watermark and removes all acceptance/counter action buttons.
> 4. If a stale client attempts to execute legal e-signature on an obsolete revision (`POST .../accept` with stale `revision_id`), backend acquires a row lock on `dealflow_quote` and detects `payload.revision_id != quote.current_revision_id`.
> 5. Backend immediately terminates the transaction and rejects the request with HTTP `409 Conflict` (`SUPERSEDED_REVISION_ERROR`), returning metadata pointing the customer to the active revision.
> 6. Once the customer reviews and signs the active revision (`rev_002`), the revision status updates to `accepted` and a binding Sales Order (`SO-xxxx`) is generated.

### Closed-Loop Discount & Approval Integration Lifecycle Flow
> In the Closed-Loop Discount and Approval Integration:
> 1. Quote starts `sent` on `rev_001` with customer viewing enabled "Accept & Sign Quote" button.
> 2. Customer submits counter-discount (e.g., 14%) via `POST .../negotiation/counter-discount`.
> 3. Financial Recalculation Engine recomputes taxes and totals; Discount Governance Engine determines 14% exceeds rep limit (10%); Blended Risk Engine computes risk score (58.4) requiring Tier 2 Commercial Director approval.
> 4. Backend creates internal approval ticket, transitions quote to `status: 'in_negotiation'`, `negotiation_status: 'pending_seller_review'`, and locks customer actions (`can_accept: false`).
> 5. Immediate 201 response returns public progress stage ("Commercial Management Review (1 of 2)") with resolution ETA.
> 6. Premature signature attempts during review are rejected with HTTP 409 (`QUOTE_IN_NEGOTIATION_LOCKED`).
> 7. Commercial Director approves in Odoo; Quote Revision Engine supersedes `rev_001` and publishes `rev_002` with 14% discount; domain event emits notification.
> 8. Portal UI updates to active `rev_002`, displaying emerald approval banner, semantic delta (-$6,491.20), and re-enabled e-signature button.
> 9. Customer signs Revision #2; backend confirms cryptographic hash match and generates Sales Order.

### Authoritative Final Customer Confirmation & Legal Order Execution Flow
> In the Final Customer Confirmation Architecture:
> 1. Customer clicks "Confirm Quotation", triggering `QuoteConfirmationModal` which renders a full review: deliverables itemization, one-time vs recurring charges, transparent discounts, taxes, TCV, Net 15 terms, and HTML5 canvas signature pad.
> 2. Customer inputs legal signatory designation, optional PO number, draws or types signature, checks legal affirmation, and submits with a unique `Idempotency-Key` header.
> 3. Backend begins a database transaction and acquires an exclusive row lock (`SELECT ... FOR UPDATE`).
> 4. Backend enforces 7 sequential checks: ownership match, signatory authorization, status == 'sent', negotiation_status == 'none', unexpired validity, revision ID & content hash match, and idempotency replay.
> 5. If any check fails, an RFC 7807 problem details response is returned (`409 SUPERSEDED_REVISION_ERROR`, `410 QUOTE_EXPIRED_ERROR`, `409 QUOTE_IN_NEGOTIATION_LOCKED`, etc.).
> 6. If all checks pass, quote status updates to `approved`, active revision updates to `accepted`, and Odoo Sales Order (`SO-xxxx`) is generated with countersigned PDF attached.
> 7. Transaction commits, emitting `dealflow.quote.accepted` to trigger automated cloud provisioning and invoice scheduling.
> 8. Frontend receives `200 OK` and transitions to Confirmation Success (Screen 11) with sales order reference and direct contract PDF download.

### Complete Round-Trip Data Access & Service Layer Flow
> The frontend follows a strict 9-stage data lifecycle:
> 1. **UI**: User interacts with a presentational component (e.g. clicks send in `CommentComposer`).
> 2. **Hook/Service**: Event handler invokes domain service (`CommentService.postLineComment`), which applies a safe optimistic update to `QueryCache`.
> 3. **API Client**: `ApiClient` wraps request, injects Bearer JWT from `TokenStore`, generates `Idempotency-Key`, and sets 15s timeout.
> 4. **Backend Gateway**: Intercepts request, performs anti-IDOR authentication, and verifies commercial partner tenant boundaries.
> 5. **Business Logic**: Evaluates governance engines, recalculates pricing/taxes, assesses Blended Risk, triggers approval routing.
> 6. **Database**: Executes atomic PostgreSQL transaction with row-level locks.
> 7. **Response**: Emits zero-leak scrubbed JSON envelope (or RFC 7807 Problem Details on error).
> 8. **State Store**: `ApiClient` normalizes response; `QueryCache` reconciles optimistic records, caches result with TTL, and invalidates dependent queries.
> 9. **UI**: Components observing the cache update smoothly re-render with verified timestamps and confirmed status badges.

### Real-Time Update Stream & Gapless Reconnection Flow
> In the Real-Time Updates Architecture (SSE with Smart Polling fallback):
> 1. Customer logs into portal; client requests ephemeral stream ticket (`POST /realtime/ticket` with Bearer JWT).
> 2. Client initializes `EventSource('/stream?ticket=stk_xxxx')`, binding to `commercial_partner_id` channel.
> 3. Account Executive publishes Revision #2 in Odoo; `dealflow_quote` triggers internal event bus.
> 4. Event publisher filters confidential deal desk data, attaches monotonic `event_id` (e.g. `evt_99106`), and broadcasts `quote.revised` SSE chunk.
> 5. Browser receives chunk, parses payload; `RealtimeService` invalidates `['quote', quoteId]` in `QueryCache` and fires UI event listener.
> 6. `QuoteDetailContainer` updates banner with emerald highlight, displays delta (-$7,500.00), and renders revised line items.
> 7. If network drops during handover, browser automatically reconnects with `Last-Event-ID: evt_99106`; server replays any missed frames.
> 8. If 3 consecutive reconnects fail, client seamlessly activates `StatusService` adaptive polling (every 10s) as graceful degradation.

### Split-Screen Enterprise "WOW MOMENT" Demo Choreography Flow
> In the closed-loop DealFlow360 live demonstration:
> 1. **Initial Review:** Customer opens live quotation (`QUO-2026-0105`, Rev 1) in a Stripe/Ramp-grade procurement workspace displaying categorized deliverables (hardware capex vs SaaS opex), Net 30 terms, and active "Accept & Sign Quote" CTA ($71,421.00 TCV).
> 2. **Intelligent Negotiation:** Customer adds line-level question, increases Edge Gateways from 2 to 4 units, and proposes a 15% volume counter-discount; frontend calculates real-time projection preview ($73,032.00 TCV) and submits proposal.
> 3. **Authoritative Governance & Lock:** Backend pricing engine recalculates model; Blended Risk Engine computes risk score (41.5), automatically locking the customer's e-sign button and escalating to Commercial Director in Odoo with SLA timer ("Estimated turnaround: 4 hours").
> 4. **Concession Approval & Real-Time Sync:** Commercial Director signs off concession in Odoo; without page refresh, customer portal pulses to `Approved by Seller (Rev 2)`, unlocks e-signature, and renders a side-by-side revision diff highlighting quantity/discount deltas in green.
> 5. **E-Sign & Connected Commerce Execution:** Customer verifies 3 pre-flight checks, executes signature on HTML5 canvas; backend locks transaction (`SELECT ... FOR UPDATE`), creates confirmed Sales Order (`SO-2026-1184`), and renders the Connected Commerce Ribbon tracking immediate warehouse fulfillment dispatch (FedEx tracking) and accounting invoice generation (`INV-2026-0891`).

## 6. Data Flow / State Management (if applicable)
1. **Authentication Token Flow:** Portal client authenticates via `/auth/login`, receives a 15-minute JWT in memory and an `HttpOnly` refresh cookie. `ApiClient` 401 silent refresh interceptor calls `/auth/refresh` automatically upon encountering a `401 Unauthorized`, updating `TokenStore` and seamlessly replaying failed requests without user disruption.
2. **Customer Isolation Data Guard:** All SQL queries in portal controllers enforce `commercial_partner_id == current_user.commercial_partner_id`. Requests targeting unauthorized quotes trigger a `404 Not Found` response to eliminate ID enumeration vulnerabilities.
3. **Data Redaction Pipeline:** Serialization layers explicitly whitelist customer-facing fields. Internal margin, sales cost, internal notes, and staff commission data are scrubbed before JSON output.
4. **Client-Side State & Query Caching:** In-memory `QueryCache` caches GET query results with deterministic composite keys and TTL expiration. Mutations invalidate prefix keys (e.g., `invalidate(['quotes'])`). Low-risk interactions (comments, read receipts) use safe optimistic mutations with automatic rollback on error; high-risk operations (e-signatures, counter-discounts) remain strictly authoritative with zero optimistic assumptions.

## 7. Known Limitations / Things to Improve
- *Controller Implementation Pending:* The API contract is comprehensively defined in `docs/customer_portal_api_contract.md`; actual Odoo Python controller classes and models remain to be built in upcoming phases.
- *Real-Time Updates:* Complete Real-Time Updates Architecture specified with Server-Sent Events (SSE) and Smart Adaptive Polling fallback in `docs/customer_portal_realtime_updates.md`.

## 8. Suggestions & Alternative Approaches
- **WebSocket vs. REST Polling:** For fast-paced quote negotiations, adding an SSE (Server-Sent Events) stream (`GET /quotes/{quote_id}/live-stream`) can push comment and status changes instantly without client-side polling.
- **Odoo Session Cookies vs. JWT:** Standard Odoo uses session cookies (`session_id`). Using JWT for the portal API provides clean decoupling for modern headless frontend frameworks (Next.js, Vue, React Native) while remaining compatible with Odoo backends via custom auth controllers.

## 9. Changelog (Session-wise Updates)

### [Update - 2026-09-05 / Session 26]
- Executed exhaustive automated regression testing across all 9 test suites in the DealFlow360 Customer Portal repository:
  - 1. [`tests/test_portal_api_contract.py`](file:///d:/odoo%20deal%20flow/odoo-dealflow360/tests/test_portal_api_contract.py): 22/22 tests passing (0.754s)
  - 2. [`tests/test_portal_ui_screens.py`](file:///d:/odoo%20deal%20flow/odoo-dealflow360/tests/test_portal_ui_screens.py): 16/16 tests passing (0.720s)
  - 3. [`tests/test_portal_security_auth.py`](file:///d:/odoo%20deal%20flow/odoo-dealflow360/tests/test_portal_security_auth.py): 18/18 tests passing (0.759s)
  - 4. [`tests/test_portal_foundation_components.py`](file:///d:/odoo%20deal%20flow/odoo-dealflow360/tests/test_portal_foundation_components.py): 16/16 tests passing (1.932s)
  - 5. [`tests/test_portal_quote_listing.py`](file:///d:/odoo%20deal%20flow/odoo-dealflow360/tests/test_portal_quote_listing.py): 14/14 tests passing (1.035s)
  - 6. [`tests/test_portal_quote_detail.py`](file:///d:/odoo%20deal%20flow/odoo-dealflow360/tests/test_portal_quote_detail.py): 12/12 tests passing (1.047s)
  - 7. [`tests/test_portal_line_comments.py`](file:///d:/odoo%20deal%20flow/odoo-dealflow360/tests/test_portal_line_comments.py): 13/13 tests passing (1.052s)
  - 8. [`tests/test_portal_integration_layer.py`](file:///d:/odoo%20deal%20flow/odoo-dealflow360/tests/test_portal_integration_layer.py): 19/19 tests passing (2.091s)
  - 9. [`tests/test_portal_e2e_integration.py`](file:///d:/odoo%20deal%20flow/odoo-dealflow360/tests/test_portal_e2e_integration.py): 23/23 tests passing (0.912s)
- Total global suite verification: **153/153 automated tests passing in 9.913s (100% PASS)**.
- Verified standing invariant: 0 git commits created; auto-maintained `info.md`.

### [Update - 2026-09-05 / Session 25]
- Acted as a Senior SaaS UX Designer and Hackathon Judge to conduct a comprehensive product evaluation of the DealFlow360 Customer Portal, benchmarking against enterprise SaaS standards (Stripe Invoicing, Ramp, Ironclad, Carta).
- Published the complete specification in [docs/customer_portal_ux_review_wow_moment.md](file:///d:/odoo%20deal%20flow/odoo-dealflow360/docs/customer_portal_ux_review_wow_moment.md) covering:
  - Executive Judge Assessment & Scorecard across B2B trust, visual hierarchy, negotiation UX, status telemetry, and post-sign execution.
  - Deep-dive critique across 12 critical enterprise UX pillars: Visual hierarchy, Quote readability, Status communication ("Who holds the ball?"), Negotiation experience, Customer confidence & audit integrity, Error messages (RFC 7807 humanization), Content-aware loading states, Proactive empty states, Confirmation & e-signature flow, Mobile responsiveness, Accessibility (WCAG 2.1 AA), and Micro-interactions.
  - Prioritized Polish Checklist across Priority P0 (Must-Have for Hackathon), Priority P1 (High-Impact), and Priority P2 (Refinements).
  - Split-screen, gimmick-free "WOW MOMENT" live demo choreography structured across 5 chronological stages (0:00 to 3:00) highlighting the live transition from customer negotiation to backend governance lock, concession signoff, real-time sync, and downstream connected commerce.
- Documented the Split-Screen Enterprise "WOW MOMENT" Demo Choreography Flow in Section 5 of `info.md`.
- Maintained standing rules: 0 git commits created; auto-maintained `info.md`.

### [Update - 2026-09-05 / Session 24]
- Formulated and published the complete **Phase 11: End-to-End Customer Portal Integration Test Specification** in [docs/customer_portal_e2e_integration_test.md](file:///d:/odoo%20deal%20flow/odoo-dealflow360/docs/customer_portal_e2e_integration_test.md) detailing the full 22-step commercial lifecycle:
  - 1. Sales Rep quotation creation draft -> 2. Hardware line addition -> 3. Recurring subscription line addition -> 4. Initial 5% discount application -> 5. Baseline approval & publication (Rev 1).
  - 6. Customer notification -> 7. Customer magic-link authentication -> 8. Quotation details inspection -> 9. Hardware line discussion drawer -> 10. Threaded line question.
  - 11. Quantity change request (2 -> 4 Edge Gateways) -> 12. Counter-discount proposal (5% -> 15%).
  - 13. Backend financial recalculation ($73,032.00 TCV) -> 14. Blended risk scoring (score 41.5, Tier 2 escalation) -> 15. Customer "Pending Approval" locked banner (confirmation disabled) -> 16. Commercial Director concession approval (Rev 2 published).
  - 17. Customer updated quote & revision diff inspection -> 18. Customer legal e-signature confirmation (atomic row lock).
  - 19. Confirmed Sales Order created (`SO-2026-1184`) -> 20. Warehouse fulfillment & cloud provisioning workflow dispatched (FedEx DEF-99182) -> 21. Accounting invoice posted (`INV-2026-0891`) -> 22. Payment recorded and ledger reconciled in full.
  - Detailed for each step: API call, expected request, expected response, database changes, frontend states, expected UI, failure scenarios, and verifiable assertion criteria.
- Extended [mock_server/portal_mock_api.py](file:///d:/odoo%20deal%20flow/odoo-dealflow360/mock_server/portal_mock_api.py):
  - Added internal user credentials: Sales Rep (`Alex Mercer`), Commercial Director (`Marcus Vance`), Operations (`Logistics Dispatch`), and Finance (`Financial Controller`).
  - Added `MOCK_ORDERS`, `MOCK_INVOICES`, and `MOCK_PAYMENTS` state stores.
  - Implemented internal POST endpoints: `POST /internal/quotes`, `POST /internal/quotes/{id}/lines`, `POST /internal/quotes/{id}/baseline-approve`, `POST /internal/quotes/{id}/manager-approve`, `POST /internal/orders/{id}/fulfill`, `POST /internal/orders/{id}/invoice`, `POST /internal/invoices/{id}/pay`.
  - Implemented internal PATCH endpoint: `PATCH /internal/quotes/{id}/discount`.
  - Added order lookup endpoint: `GET /portal/orders/{order_number}` and dynamic diff for `quo_e2e_8819`.
  - Bulletproofed socket drainage in `do_GET` to permanently eliminate Windows Winsock TCP RST (`WinError 10053`).
- Created automated test suite [tests/test_portal_e2e_integration.py](file:///d:/odoo%20deal%20flow/odoo-dealflow360/tests/test_portal_e2e_integration.py) with 23 unit and integration tests (individual step assertions + unbroken continuous sequence); ran test suite: **23/23 tests passing in 0.34s**.
- Executed repository-wide regression testing across all 9 test suites: **153/153 automated tests passing in 9.44s**.
- Maintained standing rules: 0 git commits created; auto-maintained `info.md`.

### [Update - 2026-09-05 / Session 23]
- Conducted exhaustive **DealFlow360 Customer Portal Adversarial Security Audit** across 18 attack vectors assuming an active, malicious authenticated customer.
- Formulated and published the comprehensive specification in [docs/customer_portal_security_audit.md](file:///d:/odoo%20deal%20flow/odoo-dealflow360/docs/customer_portal_security_audit.md) covering:
  - 5 core defense paradigms: 404-masking defense, whitelist-only serialization, cryptographic claims extraction, row-level concurrency locks (`SELECT ... FOR UPDATE`), and context-aware escaping.
  - Complete 5-category Security Checklist (Auth & Access Control, Financial & State Integrity, Zero-Leak Data Redaction, Input Validation & Injection, Operational & Concurrency).
  - Authoritative Backend Authorization & Invariant Enforcement Requirements.
  - Client-Side Frontend Defense-in-Depth Requirements.
  - Complete Attack Scenarios, Expected Secure Behaviors (RFC 7807 error envelopes), and Mitigations across all 18 threat vectors.
- Expanded [tests/test_portal_security_auth.py](file:///d:/odoo%20deal%20flow/odoo-dealflow360/tests/test_portal_security_auth.py) with `setUp`/`tearDown` deepcopy isolation and added 5 new automated security test cases (18 total):
  - `test_14_confirm_without_accepted_terms_rejected` (Vector 7: precondition guard)
  - `test_15_mass_assignment_tampering_ignored` (Vector 5: parameter over-posting defense)
  - `test_16_invalid_discount_range_boundary_enforced` (Vector 6: discount boundary verification)
  - `test_17_xss_injection_in_comments_stored_safely` (Vectors 16/17: XSS/injection payload defense)
  - `test_18_unauthenticated_api_calls_rejected` (Vector 18: unauthenticated access barrier across 5 endpoints)
- Verified [tests/test_portal_security_auth.py](file:///d:/odoo%20deal%20flow/odoo-dealflow360/tests/test_portal_security_auth.py): **18/18 tests passing in 0.75s**.
- Executed repository-wide regression testing across all 8 test suites: **130/130 automated tests passing in 7.13s**.
- Maintained standing rules: 0 git commits created; auto-maintained `info.md`.

### [Update - 2026-09-05 / Session 22]
- Architected and published the **DealFlow360 Customer Portal Real-Time Updates Architecture** in [docs/customer_portal_realtime_updates.md](file:///d:/odoo%20deal%20flow/odoo-dealflow360/docs/customer_portal_realtime_updates.md).
- Evaluated technical tradeoffs between Short/Adaptive Polling, WebSockets (RFC 6455), and Server-Sent Events (SSE / W3C); recommended SSE with Smart Adaptive Polling fallback as the optimal hackathon and enterprise solution.
- Defined 10 customer-safe real-time event types: `quote.updated`, `comment.sales_replied`, `negotiation.status_changed`, `negotiation.approved`, `negotiation.rejected`, `quote.revised`, `quote.confirmed`, `order.fulfillment_updated`, `invoice.generated`, and `payment.status_updated`.
- Established zero-leak privacy boundary strictly isolating internal deal desk notes, profit margins, and risk scores from external event broadcasts.
- Specified single-use ephemeral ticket handshake (`POST /realtime/ticket`) to authenticate browser `EventSource` without exposing credentials in query logs.
- Engineered multi-tenant channel isolation (`channel:commercial_partner_{id}`) with Anti-IDOR enforcement.
- Designed gapless event recovery using browser `Last-Event-ID` server replay and battery-saving Page Visibility API lifecycle hooks.
- Specified `RealtimeService.js` client integration with automatic `QueryCache` invalidation and 3-stage visual connectivity indicators.
- Maintained standing rules: 0 git commits created; auto-maintained `info.md`.

### [Update - 2026-09-05 / Session 21]
- Implemented and verified the complete **Customer Portal Frontend Integration Layer** under `portal_ui/js/api/` and `portal_ui/js/services/`.
- Built core transport & state primitives:
  - [PortalApiError.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/api/PortalApiError.js): RFC 7807 problem details normalized error model, `status: 0` network error factory, and user-facing alert mapper.
  - [TokenStore.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/api/TokenStore.js): In-memory JWT access & refresh token management, optional `localStorage` hydration, and lifecycle event subscriptions.
  - [QueryCache.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/api/QueryCache.js): In-memory TTL caching, deterministic key serialization, prefix-based query invalidation, and optimistic updates with automatic rollback.
  - [ApiClient.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/api/ApiClient.js): Central HTTP transport, Bearer JWT injection, 15s `AbortController` timeout, 401 silent refresh interceptor replaying queued requests, and exponential backoff retry engine for idempotent GET/HEAD requests.
- Built 9 headless domain service modules:
  - [AuthService.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/services/AuthService.js): Password login, magic link verification, token refresh, and session logout.
  - [QuoteService.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/services/QuoteService.js): Quotation listings, query serialization, and KPI summary aggregates (`fetchSummary`).
  - [QuoteDetailService.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/services/QuoteDetailService.js): Granular quotation detail retrieval and PDF blob export.
  - [NegotiationService.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/services/NegotiationService.js): Negotiation status tracking, counter-discounts with UUID idempotency, and deliverables change requests.
  - [CommentService.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/services/CommentService.js): Line-level threaded discussions, unread summaries, optimistic messaging with rollback, and read receipts.
  - [RevisionService.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/services/RevisionService.js): Quotation revision lists, frozen snapshots, and semantic diff deltas.
  - [ConfirmationService.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/services/ConfirmationService.js): Pre-confirmation review data and authoritative legal e-signature submission (zero optimistic assumptions).
  - [NotificationService.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/services/NotificationService.js): Alert listings and optimistic read receipt updates.
  - [StatusService.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/services/StatusService.js): Negotiation status polling coordinator and event broadcaster.
  - [index.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/services/index.js): Master registry and `createPortalClient` suite factory.
- Linked all API and service scripts into [portal_ui/index.html](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/index.html).
- Created [tests/test_portal_integration_layer.py](file:///d:/odoo%20deal%20flow/odoo-dealflow360/tests/test_portal_integration_layer.py) (19 unit & integration tests); verified full regression across all 8 test suites: **125/125 tests passing in 8.65s**.
- Maintained standing rules: 0 git commits created; auto-maintained `info.md`.

### [Update - 2026-09-05 / Session 20]
- Designed and formulated the **Customer Portal Frontend Integration & Service Layer Architecture** in `implementation_plan.md`.
- Established strict layer separation: presentation components operate purely as view layers without direct network or API logic.
- Engineered core HTTP infrastructure: `ApiClient.js` (with 15s `AbortController` timeout, Bearer JWT binding, and transparent 401 silent token refresh interceptor), `PortalApiError.js` (RFC 7807 problem details normalization), and exponential backoff retry engine for idempotent requests.
- Designed `TokenStore.js` for secure session management and `QueryCache.js` for TTL caching, selective query invalidation, and safe optimistic UI updates with automatic rollback.
- Architected 9 dedicated domain service modules (`AuthService`, `QuoteService`, `QuoteDetailService`, `NegotiationService`, `CommentService`, `RevisionService`, `ConfirmationService`, `NotificationService`, `StatusService`) unified under `portal_ui/js/services/index.js`.
- Documented the complete 9-stage round-trip data flow lifecycle: `UI → Hook/Service → API → Backend → Business logic → Database → Response → State → UI`.
- Updated Section 4, Section 5, and Section 9 of `info.md`.

### [Update - 2026-09-05 / Session 19]
- Designed and specified the **Final DealFlow360 Customer Confirmation Flow Architecture** in `implementation_plan.md`.
- Formulated the pre-confirmation review UI (`QuoteConfirmationModal.js`) itemizing final revision number, deliverables, one-time vs recurring charges, transparent discounts, applicable taxes, TCV ($92,948.80), Net 15 terms, and HTML5 canvas signature pad.
- Established core architectural invariant: the frontend portal must never assume confirmation succeeded; backend database transactions remain strictly authoritative.
- Engineered authoritative 7-check backend transaction pipeline executed with row-level locks (`SELECT ... FOR UPDATE`): anti-IDOR ownership, signatory authorization, quote status (`sent`), negotiation lock (`none`), expiration timestamp, revision currency & content hash match, and idempotency key replay.
- Defined deterministic RFC 7807 error-recovery contracts for all edge cases: changed since page load (`409 SUPERSEDED_REVISION_ERROR`), expired (`410 QUOTE_EXPIRED_ERROR`), approval pending (`409 QUOTE_IN_NEGOTIATION_LOCKED`), quote rejected (`409 QUOTE_REJECTED_ERROR`), duplicate/already confirmed quotes (`409 ALREADY_CONFIRMED_QUOTE` / cached replay), and network retry safety.
- Specified asynchronous downstream fulfillment & billing orchestration on `dealflow.quote.accepted` (cloud provisioning, Odoo invoice scheduling, CRM won update, and WORM PDF archiving).
- Updated Section 4, Section 5, and Section 9 of `info.md`.

### [Update - 2026-09-05 / Session 18]
- Designed and specified the **Customer Portal → Discount Engine → Approval Engine Integration Architecture** in `implementation_plan.md`.
- Formulated the complete 11-step event-driven lifecycle: initial quote creation -> internal baseline approval -> customer review -> counter-discount submission -> backend financial recalculation -> governance & risk score computation (triggering Tier 2 approval) -> automatic return to approval -> customer in-flight lock -> concession signoff in Odoo -> Quote Revision #2 publication -> customer confirmation.
- Formulated the 5-dimensional state matrix synchronizing `quote.status`, `quote.negotiation_status`, `revision.state`, `approval.state`, and sanitized customer-visible state.
- Defined asynchronous domain event bus architecture with event topics: `dealflow.counter_discount.submitted`, `dealflow.approval.required`, `dealflow.approval.granted`, `dealflow.quote.revision_published`, and `dealflow.quote.accepted`.
- Identified and specified mitigations for 4 core race conditions: double submission (UUID v4 `Idempotency-Key` + DB row lock), stale confirmation race (`409 Conflict`), simultaneous quote editing, and quote expiration pause.
- Updated Section 4, Section 5, and Section 9 of `info.md`.

### [Update - 2026-09-05 / Session 17]
- Designed and specified the **Quotation Negotiation & Multi-Revision Living Document System Architecture** in `implementation_plan.md`.
- Modeled the quotation as a living, multi-version document ($Quote\ v1 \rightarrow v2 \rightarrow v3$) preserving complete bilateral negotiation history with cryptographic SHA-256 content hashes.
- Defined relational snapshot schema across `dealflow_quote`, `dealflow_quote_revision`, and `dealflow_quote_revision_line`.
- Architected the semantic Revision Diff Engine comparing financial deltas, commercial payment terms, and deliverables lines matched by `stable_line_key`.
- Specified Customer Portal retrieval endpoints (`GET /quotes/{id}`, `GET /quotes/{id}/revisions`, `GET /quotes/{id}/revisions/{rev_id}`, `GET .../diff`).
- Engineered 4-tier Anti-Accidental Confirmation Defense preventing superseded revisions from being accepted: UI watermarking, payload revision ID/hash binding, database row-level locking, and HTTP `409 Conflict` (`SUPERSEDED_REVISION_ERROR`).
- Updated Section 4, Section 5, and Section 9 of `info.md`.

### [Update - 2026-09-05 / Session 16]
- Designed and specified the **Customer Counter-Discount Negotiation System Architecture** in `implementation_plan.md`.
- Established core architectural invariant: the customer portal frontend must never decide discount acceptability nor contain hardcoded approval ceilings.
- Designed `CounterDiscountModal` with bidirectional percentage-to-target-amount slider inputs, business justification text areas, and disclaimer notices.
- Formulated the authoritative 6-step backend processing pipeline: multi-tenant ownership check, financial quote recalculation, discount governance policy evaluation, blended risk score computation, approval chain routing, and shadow revision state transition.
- Engineered multi-factor Blended Risk Score formula factoring margin compression (40%), partner creditworthiness (25%), deal volume velocity (20%), and custom scope delivery ratio (15%).
- Defined 4-tier approval routing matrix (AE/Manager -> Commercial Director -> VP Sales -> CFO/Board) with SLA targets.
- Specified zero-leak API request/response contracts (`POST /api/v1/portal/quotes/{id}/negotiation/counter-discount`) scrubbing internal risk scores and margins.
- Documented three quote revision resolution pathways: seller acceptance (Quote Revision #2 published), seller compromise counter-offer (Revision #2 with diff), and seller decline (reversion to active Revision #1).
- Updated Section 4, Section 5, and Section 9 of `info.md`.

### [Update - 2026-09-05 / Session 15]
- Fully implemented and verified **Phase 8 Line-Level Commenting System Architecture** across backend mock API, frontend presentation components, and automated test suite.
- Enhanced `portal_ui/js/components/detail/QuoteLineItemsTable.js` integrating `LineCommentBadge` directly into line item table rows with dynamic unread and total comment counters.
- Built reusable presentational components under `portal_ui/js/components/comments/`:
  - `LineCommentBadge.js`: Table action button with comment count and amber unread pill.
  - `CommentMessageBubble.js`: Contextual chat bubble with customer vs sales styling and historical revision pill (`Quote Rev #X`).
  - `CommentComposer.js`: Rich message composer with quick question pills and keyboard shortcut (`Ctrl+Enter`).
  - `LineDiscussionDrawer.js`: Slide-over drawer with loading skeleton, empty guidance, thread stream, and "Mark all read" trigger.
- Created comprehensive automated test suite `tests/test_portal_line_comments.py` with 13 unit tests:
  - Validated zero-leak redaction boundary: internal deal desk notes (`visibility: 'internal'`) are strictly excluded from all customer API endpoints.
  - Validated anti-IDOR multi-tenant authorization: cross-tenant comment requests return `404 Not Found` (masking quote existence).
  - Validated comment creation, schema metadata, author type enforcement, validation on empty bodies, and read receipts (`PATCH .../read`).
  - Validated Node.js component rendering and table integration.
- Executed repository-wide regression testing across all 7 test suites: **106/106 automated unit tests passing in 7.22s**.

### [Update - 2026-09-05 / Session 14]
- Architected and formulated the Phase 8 **Line-Level Commenting System Architecture** in `implementation_plan.md`.
- Designed contextual slide-over discussion drawer anchored to individual line items in `QuoteLineItemsTable`.
- Formulated multi-revision thread continuity model utilizing `stable_line_key` preserving discussion history across quote revisions with revision context tags ("Posted in Rev 1").
- Architected strict zero-leak visibility air-gap: internal employee comments (`visibility = 'internal'`) are hard-filtered in database queries (`WHERE visibility = 'customer'`) and permanently excluded from portal serialization.
- Defined relational database schema across `dealflow_quote_comment`, `dealflow_comment_attachment`, and `dealflow_comment_read_state`.
- Defined REST API endpoints: `GET /quotes/{id}/lines/{line_id}/comments`, `POST /quotes/{id}/lines/{line_id}/comments`, `PATCH .../read`, and `GET .../comments/summary`.
- Designed reusable frontend presentation components: `LineDiscussionDrawer`, `CommentMessageBubble`, `CommentComposer`, and `LineCommentBadge`.
- Documented Line-Level Commenting & Revision Preservation Flow in Section 5 of `info.md`.

### [Update - 2026-09-05 / Session 13]
- Implemented and verified the complete Phase 6 **Customer Quotation Detail Page Architecture**.
- Enhanced [mock_server/portal_mock_api.py](file:///d:/odoo%20deal%20flow/odoo-dealflow360/mock_server/portal_mock_api.py) with itemized `line_items` (charge types, customer discounts, UoMs), recurring vs one-time pricing breakdown (`one_time_total`, `recurring_total`, `recurring_interval`), and recursive zero-leak sanitization.
- Created 7 reusable presentation components under `portal_ui/js/components/detail/`:
  - [QuoteDetailHeader.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/components/detail/QuoteDetailHeader.js): Hero header with breadcrumb navigation, quote number, status badge, revision indicator, and document action cluster.
  - [QuoteNegotiationBanner.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/components/detail/QuoteNegotiationBanner.js): Contextual banner with multi-stage approval tracker, resolution ETA, executed order badges, and expiration warnings.
  - [QuoteLineItemsTable.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/components/detail/QuoteLineItemsTable.js): Deliverables table with recurring vs one-time pills, customer discounts, taxes, and line comments.
  - [QuotePricingSummary.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/components/detail/QuotePricingSummary.js): Sticky financial breakdown and role-based action triggers (Signatory e-sign vs Viewer read-only modes).
  - [QuoteCommercialTerms.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/components/detail/QuoteCommercialTerms.js): Billing entity, destination addresses, Net 30 payment schedule, and SLA commitments.
  - [QuoteSalesRepCard.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/components/detail/QuoteSalesRepCard.js): Dedicated account executive card with avatar, contact info, and messaging trigger.
  - [QuoteDetailContainer.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/components/detail/QuoteDetailContainer.js): Master orchestrator managing loading skeletons, error views, and 2-column layout.
- Exported all components in [portal_ui/js/components/index.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/components/index.js), updated [portal_ui/js/types/portal-components.d.ts](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/types/portal-components.d.ts), and integrated into [portal_ui/index.html](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/index.html).
- Created automated test suite [tests/test_portal_quote_detail.py](file:///d:/odoo%20deal%20flow/odoo-dealflow360/tests/test_portal_quote_detail.py) (12 unit tests).
- Verified full test regression: **93/93 tests passing across all 6 test suites in 5.14s**.

### [Update - 2026-09-05 / Session 12]
- Architected and formulated the Phase 6 **Customer Quotation Detail Page Architecture** in `implementation_plan.md`.
- Designed B2B enterprise 2-column layout (70% deliverables and contractual terms / 30% sticky pricing and actions).
- Defined complete commercial proposal view: quote number, status, created/expiry dates, product/service lines (UoM, unit price, customer discount, tax, subtotal, line total), one-time vs recurring charges, billing/shipping address, and contractual commitments.
- Specified live negotiation banner with multi-stage approval tracker (Stage 1: Commercial Review -> Stage 2: Deal Desk Signoff), estimated resolution, and seller comments.
- Specified signatory permission rules: Signatories can execute binding e-signatures (`Accept & Sign Quote`); Viewers receive read-only review permissions with signatory requirement advisories.
- Enforced zero-leak redaction boundary permanently expunging internal cost prices, profit margins, sales commissions, and internal risk scores.
- Documented Quotation Detail Review, Commercial Inspection & E-Sign Flow in Section 5 of `info.md`.

### [Update - 2026-09-05 / Session 11]
- Implemented and verified the complete Phase 5 **Customer Portal Quotation Listing Architecture**.
- Enhanced [mock_server/portal_mock_api.py](file:///d:/odoo%20deal%20flow/odoo-dealflow360/mock_server/portal_mock_api.py) `GET /quotes` endpoint with multi-tenant row-level boundary (`commercial_partner_id`), substring search, status filters, negotiation flags, multi-criteria sorting, dynamic pagination, and zero-leak redaction.
- Created reusable quotation presentation components: [QuoteFilterBar.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/components/quotes/QuoteFilterBar.js), [QuoteTable.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/components/quotes/QuoteTable.js), [QuoteCard.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/components/quotes/QuoteCard.js), [QuotePagination.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/components/quotes/QuotePagination.js), and [QuoteListContainer.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/components/quotes/QuoteListContainer.js).
- Built headless API client [portal_ui/js/services/QuoteService.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/services/QuoteService.js) managing query serialization and JWT header injection.
- Created [tests/test_portal_quote_listing.py](file:///d:/odoo%20deal%20flow/odoo-dealflow360/tests/test_portal_quote_listing.py) (14 unit tests); ran full global test suite: **81/81 tests passing across all 5 test suites in 3.95s**.

### [Update - 2026-09-05 / Session 10]
- Architected and formulated the Phase 5 **Customer Portal Quotation Listing Architecture** in `implementation_plan.md`.
- Specified multi-tenant row-level authorization query guaranteeing Customer A cannot discover or paginate into Customer B quotes.
- Formulated zero-leak data redaction matrix scrubbing internal margins, cost prices, risk ratings, executive approval desk notes, and minimum discount thresholds.
- Defined 5-step API integration lifecycle: Frontend request query params, Backend JWT multi-tenant domain authorization, Sanitized response schema, UI view model transformation pipeline, and RFC 7807 error recovery.
- Designed reusable quotation listing presentation components (`QuoteFilterBar`, `QuoteTable`, `QuoteCard`, `QuotePagination`, `QuoteListContainer`).
- Documented Quotation Listing Multi-Tenant Data Retrieval & Zero-Leak Lifecycle Flow in Section 5 of `info.md`.

### [Update - 2026-09-05 / Session 9]
- Implemented and verified Phase 4 **Customer Portal Frontend Foundation Architecture** with 14 pure presentational UI primitives (zero business logic).
- Created [portal_ui/css/portal-foundation.css](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/css/portal-foundation.css) providing theme tokens, tabular numerals (`tabular-nums`), shimmer animations (`df-shimmer`), and drawer/toast layouts.
- Created [portal_ui/js/types/portal-components.d.ts](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/types/portal-components.d.ts) defining strict TypeScript prop contracts and event signatures.
- Created complete presentation components across Badges, Overlays, Layout, Feedback, Navigation, and consolidated master export in [portal_ui/js/components/index.js](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/js/components/index.js).
- Enhanced [mock_server/portal_mock_api.py](file:///d:/odoo%20deal%20flow/odoo-dealflow360/mock_server/portal_mock_api.py) to serve static `/css/*` and `/js/*` assets, and linked modules into [portal_ui/index.html](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/index.html).
- Created [tests/test_portal_foundation_components.py](file:///d:/odoo%20deal%20flow/odoo-dealflow360/tests/test_portal_foundation_components.py) with 16 unit tests; verified full test suite: **67/67 tests passing across all 4 test suites in 3.40s**.

### [Update - 2026-09-05 / Session 8]
- Formulated and published Phase 4 implementation plan for the **DealFlow360 Customer Portal Frontend Foundation** in `implementation_plan.md`.
- Specified 14 reusable, zero-business-logic UI component primitives across 4 functional categories (Shell & Layout, Badges & Indicators, Modals & Overlays, Feedback & Skeletons).
- Defined responsive layout scaling across 4 breakpoint tiers, accessible ARIA dialog bindings, RFC 7807 toast/error visualizers, and modular folder structure.
- Documented Reusable Component Presentation & Decoupling Flow in Section 5 of `info.md`.

### [Update - 2026-09-05 / Session 7]
- Built and executed automated Phase 3 security & anti-IDOR test suite in [tests/test_portal_security_auth.py](file:///d:/odoo%20deal%20flow/odoo-dealflow360/tests/test_portal_security_auth.py) covering 13 comprehensive test scenarios.
- Verified strict anti-IDOR protection: Customer A cannot view, export PDF, counter-discount, change-request, or e-sign Customer B's quotes (404-masking defense).
- Verified signatory privilege checks, employee portal bypass guards, magic link token verification/expiration, token tampering rejection, and zero-leak margin/cost scrubbing.
- Resolved Windows Winsock TCP RST (`WinError 10053`) in [mock_server/portal_mock_api.py](file:///d:/odoo%20deal%20flow/odoo-dealflow360/mock_server/portal_mock_api.py) by ensuring socket body is consistently drained and parsed JSON is cached on POST/PATCH requests.
- Ran full test suite across all 3 suites (API contract, UI screens, security/auth): **51/51 tests passing in 1.16s**.

### [Update - 2026-09-05 / Session 6]
- Architected and published Phase 3 **Customer Portal Authentication & Security Architecture** in [docs/customer_portal_auth_security.md](file:///d:/odoo%20deal%20flow/odoo-dealflow360/docs/customer_portal_auth_security.md).
- Designed multi-tenant air-gap between external portal customers (`share=True`) and internal employees (`base.group_user`).
- Specified 3-tier Zero-Trust Anti-IDOR ownership validation (`commercial_partner_id` query binding + 404-masking defense).
- Designed frictionless 1-click magic link authentication for hackathon evaluation.
- Documented Customer Authentication & Anti-IDOR Ownership Validation Flow in Section 5 of `info.md`.

### [Update - 2026-09-05 / Session 5]
- Created the interactive single-page Customer Portal application in [portal_ui/index.html](file:///d:/odoo%20deal%20flow/odoo-dealflow360/portal_ui/index.html) implementing all 14 screens.
- Upgraded [mock_server/portal_mock_api.py](file:///d:/odoo%20deal%20flow/odoo-dealflow360/mock_server/portal_mock_api.py) to serve the portal frontend on `/portal` and root `/`.
- Created [tests/test_portal_ui_screens.py](file:///d:/odoo%20deal%20flow/odoo-dealflow360/tests/test_portal_ui_screens.py) test suite verifying all 14 screens, components, and routing rules (16 unit tests).
- Ran full test suite across both API contract and UI screens: **38/38 tests passing in 1.45s**.

### [Update - 2026-09-05 / Session 4]
- Architected and published Phase 2 **Customer Portal UI/UX Design Specification** in [docs/customer_portal_ui_design.md](file:///d:/odoo%20deal%20flow/odoo-dealflow360/docs/customer_portal_ui_design.md).
- Designed all 14 screens for an enterprise B2B SaaS experience: Login, Dashboard, My Quotations, Quotation Details, Negotiation Workspace, Line-Level Discussion, Change Request, Counter Discount, Quote Revision History, Confirmation Screen (E-Sign), Confirmation Success, Error/Expired Quote, Access Denied, and Global Loading/Empty States.
- Defined Routes, Purpose, UI Components, Data Displayed, User Actions, API Calls, Loading/Empty/Error/Success states, and Security Restrictions for each screen.
- Documented Customer Portal Route Guard & Screen Transition Flow in Section 5 of `info.md`.

### [Update - 2026-09-05 / Session 3]
- Built [mock_server/portal_mock_api.py](file:///d:/odoo%20deal%20flow/odoo-dealflow360/mock_server/portal_mock_api.py) implementing all 20 contract endpoints with zero external dependencies.
- Created [tests/test_portal_api_contract.py](file:///d:/odoo%20deal%20flow/odoo-dealflow360/tests/test_portal_api_contract.py) automated test suite.
- Executed verification tests across all 20 endpoints plus security/error guards: 22/22 tests passed in 0.24s.

### [Update - 2026-09-05 / Session 2]
- Architected and published Phase 1 **Customer Portal & Backend Integration Contract** in [docs/customer_portal_api_contract.md](file:///d:/odoo%20deal%20flow/odoo-dealflow360/docs/customer_portal_api_contract.md).
- Defined 20 REST API endpoints with HTTP methods, URL paths, headers, JSON request/response schemas, and failure modes.
- Established security architecture: dual-token JWT auth, signatory authorization rules, RFC 7807 error format, and multi-tenant partner isolation.
- Standardized data structures for Quote Status, Negotiation Status, Revisions, Diff Comparison, Comments, Change Requests, Counter-Discounts, and Notifications.
- Documented step-by-step function-level flows for Quote E-Sign, Counter-Discount, and Change Request in Section 5 of `info.md`.

### [Update - 2026-09-05 / Session 1]
- Initialized `info.md` with the required 9-section documentation structure.
- Documented initial tech stack, structure, and baseline project info.
- Configured standing instruction for auto-maintaining `info.md` without committing to Git.
