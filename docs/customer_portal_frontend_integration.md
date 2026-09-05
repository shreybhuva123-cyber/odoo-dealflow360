# DealFlow360 Customer Portal — Frontend Integration Layer Specification

## 1. Architectural Overview & Design Philosophy

The DealFlow360 Customer Portal frontend integration layer establishes a decoupled, headless data-access architecture separating presentation components from network protocols, token handling, caching, and state synchronization.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             PRESENTATION LAYER                              │
│  (Pure UI Components, Presentational Primitives, Skeletons, Drawers, Forms)  │
│  [QuoteTable, QuoteDetailContainer, LineDiscussionDrawer, ConfirmationModal]│
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ 1. Invokes typed async service methods
                                       │    (Zero `fetch` or network calls in UI)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           HEADLESS DOMAIN SERVICES                          │
│  (Auth, Quotes, QuoteDetail, Negotiation, Comments, Revisions, Conf, Notifs)│
│  - Validates method inputs           - Attaches UUID v4 Idempotency Keys    │
│  - Defines cache invalidation scopes  - Applies safe optimistic updates      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ 2. Delegates to central transport
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          UNIVERSAL TRANSPORT (ApiClient)                    │
│  - Wraps native Fetch & AbortController (15s timeout)                       │
│  - Injects `Authorization: Bearer <token>`, `X-Portal-Client-Version`       │
│  - Silent 401 Refresh Interceptor (queues concurrent requests, replays)     │
│  - Idempotent Retry Engine with Exponential Backoff (2^k * 200ms)           │
│  - Normalized RFC 7807 Problem Details Parser (PortalApiError)              │
└───────────────────┬─────────────────────────────────────┬───────────────────┘
                    │ Reads / Writes                      │ Checks / Invalidates
                    ▼                                     ▼
        ┌───────────────────────┐             ┌───────────────────────┐
        │      TokenStore       │             │      QueryCache       │
        │ - JWT Access Token    │             │ - In-Memory TTL Cache │
        │ - Refresh Token       │             │ - Deterministic Keys  │
        │ - User Identity Model │             │ - Prefix Invalidation │
        │ - Pub/Sub Lifecycle   │             │ - Rollback Callbacks  │
        └───────────────────────┘             └───────────────────────┘
                    │                                     │
                    └──────────────────┬──────────────────┘
                                       │ 3. Transmits over HTTP (REST / JSON)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND GATEWAY & BUSINESS ENGINE                   │
│   (Odoo Controller -> Anti-IDOR Tenant Guard -> Recalculation Engine -> DB) │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Core Invariants:
1. **Zero Network Calls in UI Components**: No UI component or container may invoke `fetch`, `XMLHttpRequest`, or construct raw HTTP requests. All communication is routed through domain service abstractions.
2. **Authoritative Backend Validation**: The frontend never assumes confirmation or negotiation success. Mutations involving legal e-signatures, commercial counters, and terms modifications require authoritative backend database commits before UI state transitions.
3. **Multi-Tenant Token Binding**: All outbound requests automatically carry signed JWT Bearer tokens tied to the tenant's `commercial_partner_id`.
4. **RFC 7807 Normalization**: All errors, whether HTTP 4xx/5xx or network disconnects, are translated into standard `PortalApiError` instances.

---

## 2. Transport Infrastructure & Primitives

### 2.1 Normalized RFC 7807 Error Model (`PortalApiError.js`)
Normalizes raw backend errors and network timeouts into a predictable error class:

```javascript
class PortalApiError extends Error {
  constructor({ status, code, title, detail, instance, type, invalid_params, isNetworkError, rawResponse }) {
    super(detail || title || `API Error (${status})`);
    this.name = 'PortalApiError';
    this.status = (status !== undefined && status !== null) ? status : 500;
    this.code = code || `HTTP_${this.status}`;
    this.title = title || 'Error';
    this.detail = detail || this.message;
    this.instance = instance || '';
    this.type = type || `https://errors.dealflow360.com/${this.code.toLowerCase().replace(/_/g, '-')}`;
    this.invalidParams = invalid_params || [];
    this.timestamp = new Date().toISOString();
    this.isNetworkError = Boolean(isNetworkError);
    this.rawResponse = rawResponse || null;
  }

  getUserMessage() {
    if (this.status === 404) return 'The requested quotation or resource was not found.';
    if (this.status === 401) return 'Your session has expired. Please sign in again.';
    if (this.status === 403) return 'You do not have permission to perform this commercial action.';
    if (this.status === 409) return this.detail || 'This quote is currently locked or has been updated.';
    if (this.isNetworkError) return 'Network failure. Retrying connection...';
    return this.detail || this.title;
  }
}
```

### 2.2 JWT Session & Token Management (`TokenStore.js`)
Manages short-lived access tokens (15 minutes) and refresh tokens (7 days) with optional `localStorage` persistence and pub/sub lifecycle listeners:

```javascript
class TokenStore {
  constructor() {
    this._accessToken = null;
    this._refreshToken = null;
    this._user = null;
    this._subscribers = [];
    this._hydrate();
  }

  getAccessToken() { return this._accessToken; }
  setAccessToken(token) {
    this._accessToken = token;
    this._notify('token_changed', { token });
  }

  getRefreshToken() { return this._refreshToken; }
  setRefreshToken(refreshToken) { this._refreshToken = refreshToken; }

  getUser() { return this._user; }
  setUser(user) {
    this._user = user;
    this._notify('user_changed', { user });
  }

  hasToken() { return Boolean(this._accessToken); }
  clear() {
    this._accessToken = null;
    this._refreshToken = null;
    this._user = null;
    this._notify('session_cleared');
  }

  subscribe(listener) {
    this._subscribers.push(listener);
    return () => { this._subscribers = this._subscribers.filter(l => l !== listener); };
  }
}
```

### 2.3 In-Memory TTL Query Cache (`QueryCache.js`)
Provides high-performance, deterministic caching for GET requests with prefix invalidation and optimistic rollbacks:

```javascript
class QueryCache {
  constructor({ defaultTtlMs = 30000 } = {}) {
    this.defaultTtlMs = defaultTtlMs;
    this._store = new Map();
  }

  generateKey(key) {
    if (typeof key === 'string') return key;
    if (Array.isArray(key)) {
      return key.map(k => (typeof k === 'object' && k !== null ? JSON.stringify(k) : String(k))).join('::');
    }
    return JSON.stringify(key);
  }

  get(key) {
    const k = this.generateKey(key);
    const entry = this._store.get(k);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttlMs) {
      this._store.delete(k);
      return null;
    }
    return entry.data;
  }

  set(key, data, ttlMs) {
    const k = this.generateKey(key);
    this._store.set(k, {
      data,
      timestamp: Date.now(),
      ttlMs: ttlMs !== undefined ? ttlMs : this.defaultTtlMs
    });
  }

  invalidate(prefixOrKey) {
    const prefix = Array.isArray(prefixOrKey) ? prefixOrKey.join('::') : String(prefixOrKey);
    let count = 0;
    for (const k of this._store.keys()) {
      if (k === prefix || k.startsWith(`${prefix}::`) || k.startsWith(prefix)) {
        this._store.delete(k);
        count++;
      }
    }
    return count;
  }

  optimisticUpdate(key, updaterFn) {
    const k = this.generateKey(key);
    const current = this.get(key);
    const updated = updaterFn(current);
    this.set(key, updated);

    return () => {
      if (current === null) this.delete(key);
      else this.set(key, current);
    };
  }
}
```

### 2.4 Central Transport Client (`ApiClient.js`)
Features:
- Request timeout via native `AbortController` (15s default).
- Automatic `Authorization: Bearer <token>` injection.
- Automatic `X-Portal-Client-Version: 2026.1` and `Idempotency-Key` headers.
- **Silent 401 Refresh Interceptor**: intercepts token expirations, queues concurrent requests, calls `/auth/refresh`, updates `TokenStore`, and seamlessly replays failed calls.
- **Idempotent Retry Engine**: exponential backoff ($2^k \times 200\text{ms} + \text{jitter}$) on GET/HEAD requests encountering 502/503/504 or network disconnects.

---

## 3. Headless Domain Services Directory

| Service | Module File | Responsibilities | Safe Optimistic Updates |
|---|---|---|---|
| **Authentication** | `AuthService.js` | Email/password login, 1-click magic links, manual/silent refresh, session logout | No (Authoritative) |
| **Quotations** | `QuoteService.js` | Quotation listing, search/filter/sort params serialization, KPI aggregates (`fetchSummary`) | No (Authoritative) |
| **Quote Details** | `QuoteDetailService.js` | Full quotation payload retrieval, PDF contract export blob download, cache invalidation | No (Authoritative) |
| **Negotiations** | `NegotiationService.js` | Live negotiation status, counter-discounts, deliverables change requests, UUID idempotency | No (Authoritative) |
| **Comments** | `CommentService.js` | Line-level discussions, unread counts, privacy filtering (zero-leak), read receipts | **Yes** (Message bubbles with auto-rollback) |
| **Revisions** | `RevisionService.js` | Revision history timeline, immutable historical snapshots, semantic diff calculation | No (Authoritative) |
| **Confirmation** | `ConfirmationService.js` | Pre-confirmation summary review, legal e-signature submission, signatory authorization | No (Strictly Authoritative) |
| **Notifications** | `NotificationService.js` | User alert listing, unread badge calculation, single & batch mark-read | **Yes** (Unread pills with auto-rollback) |
| **Status Coordinator**| `StatusService.js` | Background negotiation polling coordinator, event emitter (`statusChanged`) | N/A (Observer) |
| **Services Registry** | `index.js` | Master registry, singleton suite, and `createPortalClient({ baseUrl })` factory | N/A (Factory) |

---

## 4. Safe Optimistic Updates vs. Authoritative Invariants

### 4.1 Permitted Optimistic Updates (Low-Risk Social/UI States)
- **Line-Level Comment Bubbles**: Appending a new message to the active thread drawer immediately with an `is_sending: true` indicator. If the server rejects the comment (e.g. empty body or expired session), the rollback restores the exact prior thread state.
- **Notification Read Receipts**: Marking single or all notifications as read immediately turns off badge counters and removes unread background highlights. Rollback reinstates the unread state upon network failure.

### 4.2 Strictly Prohibited Optimistic Updates (Authoritative Financial & Legal Mutations)
- **Legal E-Signatures (`POST /quotes/{id}/accept`)**:
  - The client UI must **never** assume confirmation succeeded.
  - The quote status badge remains unchanged until the backend verifies signatory privileges, asserts active revision validity, enforces `can_accept: true`, records IP/timestamps, creates the Odoo Sales Order (`SO-xxxx`), and returns `200 OK`.
- **Counter-Discount Submissions (`POST .../counter-discount`)**:
  - The client UI must **never** recalculate prices or apply discounts locally.
  - The discount governance engine, blended risk calculator, and approval routing table remain strictly authoritative on the server.
- **Scope Change Requests (`POST .../change-request`)**:
  - Deliverable quantity changes and additions must be validated server-side to calculate margin impact and approval tier requirements.

---

## 5. Complete 9-Stage Data Flow Architecture

The DealFlow360 Customer Portal strictly implements the following unidirectional data flow:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. USER INTERACTION (UI)                                                    │
│    User inputs data into a presentational component (e.g., enters counter   │
│    discount in modal or types comment in LineDiscussionDrawer).             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Calls service method
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. HEADLESS HOOK / SERVICE                                                  │
│    - Validates arguments (e.g., checks valid quoteId and discount range).    │
│    - Attaches UUID v4 `Idempotency-Key` to mutation payloads.               │
│    - If safe: applies optimistic update to QueryCache with rollback hook.   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Delegates to ApiClient
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. API TRANSPORT CLIENT                                                     │
│    - Checks in-memory QueryCache (GET only).                                │
│    - Injects `Authorization: Bearer <token>` from TokenStore.               │
│    - Wraps request in AbortController timeout (15s).                        │
│    - Transmits serialized JSON payload over HTTP.                           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Network dispatch
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. BACKEND GATEWAY & AUTHENTICATION                                         │
│    - Validates dual-token JWT signature and asserts `share == True`.        │
│    - Anti-IDOR Enforcement: verifies commercial_partner_id matches quote.   │
│    - 404-Masking Defense: returns 404 Not Found if unauthorized.            │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Passes to business logic
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. BUSINESS LOGIC & GOVERNANCE ENGINES                                      │
│    - Recalculates line subtotals, customer discounts, taxes, and totals.    │
│    - Evaluates Discount Governance limits and computes Blended Risk Score.  │
│    - Determines whether multi-tier approval is required.                   │
│    - Updates quote state to `in_negotiation` and locks customer actions.    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Persists state
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 6. DATABASE ATOMIC TRANSACTION                                              │
│    - PostgreSQL row-level lock (`SELECT ... FOR UPDATE`).                   │
│    - Inserts negotiation/comment record with `revision_number` and key.      │
│    - Creates audit log and commits transaction.                             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Returns response
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 7. AUTHORITATIVE RESPONSE ENVELOPE                                          │
│    - Strips internal confidential margins, costs, and risk ratings.         │
│    - Returns standardized HTTP 200/201 JSON (or RFC 7807 on error).         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Handled by ApiClient
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 8. CLIENT STATE RECONCILIATION & CACHE INVALIDATION                         │
│    - If 401: Silent Refresh Interceptor calls /auth/refresh & replays call. │
│    - If error: triggers rollback callback to undo optimistic changes.       │
│    - If success: updates QueryCache and invalidates dependent query scopes  │
│      (e.g., invalidates `['quotes']` and `['quote', id]`).                  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Reactive re-render
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 9. UI RE-RENDERING                                                          │
│    Presentational components re-render with verified backend data, updated  │
│    negotiation banners, and active revision indicators.                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Automated Test Verification Results

All 19 tests in `tests/test_portal_integration_layer.py` and all 125 tests across all 8 repository test suites execute with a **100% pass rate**:

```text
Ran 125 tests in 7.124s

OK
```

### Verified Test Suites:
1. `test_portal_api_contract.py` (22 tests) — Contract compliance & zero-leak boundaries.
2. `test_portal_ui_screens.py` (16 tests) — 14-screen UI system and routing.
3. `test_portal_security_auth.py` (13 tests) — Anti-IDOR, JWT auth, and signatory permissions.
4. `test_portal_foundation_components.py` (16 tests) — Reusable UI primitives & layouts.
5. `test_portal_quote_listing.py` (14 tests) — Listing, search, filter, and pagination.
6. `test_portal_quote_detail.py` (12 tests) — Detail views, line deliverables, and terms.
7. `test_portal_line_comments.py` (13 tests) — Line-level discussions and internal air-gap.
8. `test_portal_integration_layer.py` (19 tests) — ApiClient, TokenStore, QueryCache, 401 silent refresh, and all 9 domain services.
