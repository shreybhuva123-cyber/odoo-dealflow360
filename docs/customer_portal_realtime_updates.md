# DealFlow360 Customer Portal — Real-Time Updates Architecture

## 1. Architectural Overview & Problem Statement

In enterprise B2B sales cycles, quotations are living negotiation instruments rather than static documents. During active proposal reviews, multiple asynchronous actions occur across departments:
- An Account Executive revises deliverable pricing or answers a customer line inquiry.
- The Deal Desk / Commercial Director grants a concession on a counter-discount request.
- The Customer Executive E-Signs the contract, triggering order generation and provisioning.
- Finance schedules invoicing and confirms receipt of payment.

Forcing enterprise buyers (CFOs, procurement leads) to manually reload the browser page creates friction, causes race conditions (such as signing superseded revisions), and degrades user trust.

This document defines the **Real-Time Customer Portal Update Architecture** for DealFlow360, specifying protocol selection, customer-safe event taxonomy, authentication, multi-tenant air-gap authorization, gapless reconnection, and failure degradation.

---

## 2. Technology Comparison: Polling vs. WebSockets vs. Server-Sent Events

| Criterion | Short / Adaptive Polling | WebSockets (RFC 6455) | Server-Sent Events (SSE / W3C) |
|---|---|---|---|
| **Communication Pattern** | Repeated client-initiated HTTP requests (`GET /status`) | Full-duplex bidirectional TCP stream | Unidirectional server-to-client HTTP streaming |
| **Protocol & Transport** | Standard HTTP/1.1 or HTTP/2 | Custom `ws://` or `wss://` upgraded socket | Standard HTTP/1.1 or HTTP/2 chunked transfer |
| **Server Overhead** | High request/response churn, header overhead, frequent DB hits | Low per message, but requires persistent stateful socket server | Low per message, lightweight persistent connection |
| **Odoo / Python Architecture** | Works natively on standard Odoo WSGI controllers | Requires specialized ASGI / gevent / WebSocket daemon or Redis bridge | Works on standard HTTP streaming / thread workers |
| **Browser Native API** | Custom `setInterval` / `fetch` loop | `new WebSocket(url)` with manual frame parsing | `new EventSource(url)` with built-in event routing |
| **Auto-Reconnection** | Manual implementation | Manual implementation with heartbeat ping/pong | **Native browser support** with automatic exponential backoff |
| **Message Loss Prevention** | Handled by polling latest state snapshot | Requires custom sequence IDs and replay buffers | **Native `Last-Event-ID` header** with automatic server replay |
| **Firewall / Proxy Traversal** | 100% traversal (standard HTTP GET) | Often inspected, throttled, or dropped by corporate proxies | 100% traversal over standard HTTPS port 443 |
| **Client Battery & CPU** | Periodic wakeups drain battery | Efficient when active | Highly efficient; sleeps until chunks arrive |
| **Implementation Complexity** | Low | High (requires separate socket server + auth bridge) | **Very Low to Moderate** |

---

## 3. Recommendation for Hackathon & Production

### **Primary Recommendation: Server-Sent Events (SSE) with Adaptive Polling Fallback**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          REAL-TIME HYBRID ENGINE                            │
│                                                                             │
│               Primary Transport: Server-Sent Events (SSE)                   │
│         [Continuous event stream over standard HTTPS / EventSource]         │
│                                     │                                       │
│                       Automatic Health Check & Fallback                     │
│                                     ▼                                       │
│          Graceful Fallback: Smart Adaptive Polling (10s - 30s)              │
│       [ETag / If-None-Match conditional queries via StatusService]          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Why SSE is the Superior Choice for DealFlow360:
1. **Perfect Match for System Directionality**:
   - Customer-to-server operations (posting comments, proposing counter-discounts, signing contracts) are **already fully built and verified** as REST endpoints with idempotency keys, JWT headers, and RFC 7807 error validation.
   - The portal **only needs server-to-client push** for state changes, revisions, and seller replies. Full-duplex WebSockets introduce needless protocol complexity without added benefit.
2. **Zero External Infrastructure in Odoo**:
   - Standard Odoo deployments run on WSGI HTTP servers. WebSockets require running a secondary ASGI server, setting up Redis pub/sub bridges, or running an external Node/Socket.io sidecar. SSE runs as a standard long-running HTTP streaming endpoint (`Content-Type: text/event-stream`).
3. **Built-in Resiliency**:
   - Browsers provide native `EventSource` with automatic reconnection, event listeners (`addEventListener('quote.revised', ...)`), and automatic transmission of the `Last-Event-ID` header upon reconnecting.
4. **Corporate Network Friendly**:
   - Enterprise procurement buyers often operate behind strict corporate firewalls and TLS inspection proxies that terminate or block WebSocket handshakes. SSE travels cleanly over standard HTTPS port 443.

---

## 4. Customer-Facing Event Taxonomy & Payloads

### Zero-Leak Privacy Air-Gap:
> [!IMPORTANT]
> Internal employee chatter, deal desk discount floors, internal margin impact, credit risk scores, and internal stage names must **NEVER** be emitted to the customer portal event stream.

### Standardized Event Envelope Schema
Every real-time event conforms to a uniform JSON envelope:

```typescript
interface PortalRealtimeEvent<T = any> {
  event_id: string;          // Monotonic sequence identifier, e.g. "evt_20260905_00192"
  event_type: string;        // Dot-notated event name, e.g. "quote.revised"
  quote_id: string;          // Target quotation identifier
  quote_number: string;      // Human-readable quote number, e.g. "QUO-2026-0048"
  revision_number: number;   // Active quotation revision at event time
  timestamp: string;         // ISO-8601 UTC timestamp
  data: T;                   // Customer-safe event-specific payload
}
```

---

### Event Definitions & Payloads

#### 1. `quote.updated`
Emitted when quote metadata, expiration date, or commercial terms are refreshed without a full revision bump.
```json
{
  "event_id": "evt_99101",
  "event_type": "quote.updated",
  "quote_id": "quo_8819ab2",
  "quote_number": "QUO-2026-0048",
  "revision_number": 1,
  "timestamp": "2026-09-05T14:10:00Z",
  "data": {
    "field_updated": "expiration_date",
    "old_value": "2026-09-30T23:59:59Z",
    "new_value": "2026-10-15T23:59:59Z",
    "message": "Quotation validity extended to October 15, 2026."
  }
}
```

#### 2. `comment.sales_replied`
Emitted when an Account Executive or Sales Engineer replies to a deliverable line inquiry.
```json
{
  "event_id": "evt_99102",
  "event_type": "comment.sales_replied",
  "quote_id": "quo_8819ab2",
  "quote_number": "QUO-2026-0048",
  "revision_number": 1,
  "timestamp": "2026-09-05T14:12:30Z",
  "data": {
    "line_id": "line_4020",
    "stable_line_key": "prod_cloud_01_core_lic",
    "comment_id": "cmt_991845",
    "author_name": "Alex Mercer",
    "author_title": "Enterprise Account Executive",
    "snippet": "Yes, Enterprise Tier includes 24/7/365 emergency response...",
    "unread_count": 1
  }
}
```

#### 3. `negotiation.status_changed`
Emitted when a submitted counter-discount or change request transitions in the seller's queue.
```json
{
  "event_id": "evt_99103",
  "event_type": "negotiation.status_changed",
  "quote_id": "quo_8819ab2",
  "quote_number": "QUO-2026-0048",
  "revision_number": 1,
  "timestamp": "2026-09-05T14:15:00Z",
  "data": {
    "quote_status": "in_negotiation",
    "negotiation_status": "in_review",
    "public_stage_name": "Commercial Management Review",
    "stage_number": 1,
    "total_stages": 2,
    "estimated_resolution": "2026-09-06T12:00:00Z"
  }
}
```

#### 4. `negotiation.approved`
Emitted when the seller deal desk approves the customer's proposed counter-discount or terms change.
```json
{
  "event_id": "evt_99104",
  "event_type": "negotiation.approved",
  "quote_id": "quo_8819ab2",
  "quote_number": "QUO-2026-0048",
  "revision_number": 1,
  "timestamp": "2026-09-05T14:20:00Z",
  "data": {
    "negotiation_type": "counter_discount",
    "agreed_discount_percent": 12.0,
    "next_revision_number": 2,
    "message": "Your requested 12% discount has been approved by commercial management. Revision #2 is being published."
  }
}
```

#### 5. `negotiation.rejected`
Emitted when the seller is unable to accommodate a counter-request and provides feedback.
```json
{
  "event_id": "evt_99105",
  "event_type": "negotiation.rejected",
  "quote_id": "quo_8819ab2",
  "quote_number": "QUO-2026-0048",
  "revision_number": 1,
  "timestamp": "2026-09-05T14:22:00Z",
  "data": {
    "quote_status": "sent",
    "negotiation_status": "declined",
    "can_accept": true,
    "seller_feedback": "We are unable to meet a 20% discount on hardware items. We have retained our standard commercial pricing."
  }
}
```

#### 6. `quote.revised`
Emitted when a new formal revision (Quote v2) is published, rendering Quote v1 superseded.
```json
{
  "event_id": "evt_99106",
  "event_type": "quote.revised",
  "quote_id": "quo_8819ab2",
  "quote_number": "QUO-2026-0048",
  "revision_number": 2,
  "timestamp": "2026-09-05T14:25:00Z",
  "data": {
    "previous_revision_number": 1,
    "new_revision_number": 2,
    "revision_summary": "Applied approved 12% commercial discount to recurring licenses.",
    "new_total_amount": 99900.00,
    "difference_amount": -7500.00,
    "currency": "USD",
    "can_accept": true
  }
}
```

#### 7. `quote.confirmed`
Emitted when the quotation is countersigned and finalized, transitioning to a binding contract.
```json
{
  "event_id": "evt_99107",
  "event_type": "quote.confirmed",
  "quote_id": "quo_8819ab2",
  "quote_number": "QUO-2026-0048",
  "revision_number": 2,
  "timestamp": "2026-09-05T14:30:00Z",
  "data": {
    "quote_status": "approved",
    "reference_order_number": "SO-2026-1184",
    "signer_name": "Sarah Connor",
    "confirmed_at": "2026-09-05T14:30:00Z",
    "contract_pdf_url": "/api/v1/portal/quotes/quo_8819ab2/pdf?version=final_signed"
  }
}
```

#### 8. `order.fulfillment_updated`
Emitted as downstream fulfillment or cloud provisioning milestones advance.
```json
{
  "event_id": "evt_99108",
  "event_type": "order.fulfillment_updated",
  "quote_id": "quo_8819ab2",
  "quote_number": "QUO-2026-0048",
  "revision_number": 2,
  "timestamp": "2026-09-05T15:00:00Z",
  "data": {
    "order_number": "SO-2026-1184",
    "milestone_name": "Cloud Tenant Provisioning",
    "milestone_status": "completed",
    "progress_percent": 50,
    "next_step": "Onboarding Engineer Assignment"
  }
}
```

#### 9. `invoice.generated`
Emitted when Odoo generates the customer invoice for the confirmed order.
```json
{
  "event_id": "evt_99109",
  "event_type": "invoice.generated",
  "quote_id": "quo_8819ab2",
  "quote_number": "QUO-2026-0048",
  "revision_number": 2,
  "timestamp": "2026-09-05T15:15:00Z",
  "data": {
    "invoice_number": "INV/2026/0088",
    "amount_due": 99900.00,
    "currency": "USD",
    "due_date": "2026-10-05",
    "payment_terms": "Net 30",
    "invoice_download_url": "/api/v1/portal/invoices/INV-2026-0088/pdf"
  }
}
```

#### 10. `payment.status_updated`
Emitted when payment receipt is confirmed (e.g. ACH / Wire processed in Odoo).
```json
{
  "event_id": "evt_99110",
  "event_type": "payment.status_updated",
  "quote_id": "quo_8819ab2",
  "quote_number": "QUO-2026-0048",
  "revision_number": 2,
  "timestamp": "2026-09-05T16:00:00Z",
  "data": {
    "invoice_number": "INV/2026/0088",
    "payment_status": "paid",
    "amount_paid": 99900.00,
    "balance_remaining": 0.00,
    "receipt_number": "RCPT-90218"
  }
}
```

---

## 5. Authentication & Customer Authorization

### 5.1 The Browser `EventSource` Header Limitation
Standard browser `EventSource` (`new EventSource(url)`) does not support passing custom HTTP request headers (such as `Authorization: Bearer <token>`).

### 5.2 Secure Single-Use Ticket Handshake (Recommended)
To prevent exposing long-lived access tokens in server access logs and browser history:

```
┌──────────────┐                                       ┌────────────────┐
│   Browser    │                                       │ Odoo / Backend │
└──────┬───────┘                                       └───────┬────────┘
       │ 1. POST /api/v1/portal/realtime/ticket                │
       │    Headers: { Authorization: Bearer <access_token> }  │
       │──────────────────────────────────────────────────────>│
       │                                                       │ Verifies JWT &
       │ 2. 200 OK: { ticket: "stk_77192...", expires_in: 30 } │ commercial_partner_id
       │<──────────────────────────────────────────────────────│
       │                                                       │
       │ 3. Connect: GET /api/v1/portal/stream?ticket=stk_77192│
       │    new EventSource(...)                               │
       │──────────────────────────────────────────────────────>│
       │                                                       │ Consumes ticket (1-time)
       │ 4. 200 OK (Content-Type: text/event-stream)           │ Binds connection to
       │<──────────────────────────────────────────────────────│ commercial_partner_id
```

### 5.3 Multi-Tenant Row-Level Channel Authorization
When the SSE connection opens:
1. Backend validates the ticket, extracting `commercial_partner_id` and `user_id`.
2. Connection joins the internal channel: `channel:commercial_partner_{commercial_partner_id}`.
3. When any internal system event fires (e.g., in Odoo `sale.order` write):
   - The publisher verifies that the quotation belongs to `commercial_partner_id`.
   - The publisher scrubs all internal fields.
   - Event is pushed strictly to that partner's channel.
4. **Anti-IDOR Defense**: Customer A never receives frames for Customer B.

---

## 6. Frontend Subscription & State Reconciliation

### 6.1 `RealtimeService.js` Design
The frontend service wraps `EventSource` with lifecycle controls, event dispatching, and cache invalidation:

```javascript
class RealtimeService {
  constructor(client, cache) {
    this.client = client;
    this.cache = cache;
    this.eventSource = null;
    this.lastEventId = null;
    this.listeners = new Map();
    this.retryDelay = 1000;
    this.maxRetryDelay = 30000;
    this.consecutiveFailures = 0;
    this.isFallbackPolling = false;
  }

  async connect() {
    if (this.eventSource) return;

    try {
      // 1. Obtain ephemeral stream ticket
      const ticketRes = await this.client.post('/realtime/ticket', {});
      const ticket = ticketRes.ticket;

      // 2. Open EventSource
      const url = `${this.client.baseUrl}/stream?ticket=${encodeURIComponent(ticket)}` +
                  (this.lastEventId ? `&last_event_id=${encodeURIComponent(this.lastEventId)}` : '');

      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        this.consecutiveFailures = 0;
        this.retryDelay = 1000;
        this.emit('connection_status', { status: 'connected' });
      };

      this.eventSource.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          this._handleEvent(event);
        } catch (err) {}
      };

      this.eventSource.onerror = () => {
        this._handleDisconnect();
      };
    } catch (e) {
      this._handleDisconnect();
    }
  }

  _handleEvent(event) {
    this.lastEventId = event.event_id;

    // 1. Automatic cache invalidation
    if (event.quote_id) {
      this.cache.invalidate(['quote', event.quote_id]);
      this.cache.invalidate(['quotes']);
      this.cache.invalidate(['negotiation_status', event.quote_id]);
    }
    if (event.event_type.startsWith('comment.')) {
      this.cache.invalidate(['comments']);
      this.cache.invalidate(['comments_summary']);
    }

    // 2. Dispatch to registered listeners
    const specificListeners = this.listeners.get(event.event_type) || [];
    const wildcardListeners = this.listeners.get('*') || [];
    [...specificListeners, ...wildcardListeners].forEach(cb => {
      try { cb(event); } catch (e) {}
    });
  }

  _handleDisconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.consecutiveFailures++;

    if (this.consecutiveFailures >= 3 && !this.isFallbackPolling) {
      // Activate Adaptive Polling fallback
      this.emit('connection_status', { status: 'fallback_polling' });
      this._startFallbackPolling();
      return;
    }

    // Exponential backoff reconnect
    this.emit('connection_status', { status: 'reconnecting' });
    setTimeout(() => this.connect(), Math.min(this.retryDelay, this.maxRetryDelay));
    this.retryDelay *= 2;
  }
}
```

---

## 7. Reconnection, Gapless Delivery & Page Visibility

### 7.1 Gapless Event Replay (`Last-Event-ID`)
When an SSE connection drops (e.g. mobile network handover or WiFi reconnect):
1. The browser automatically sends the HTTP header `Last-Event-ID: evt_99105`.
2. The server buffer checks its rolling 24-hour event log for `commercial_partner_id`.
3. All events with `id > evt_99105` are replayed immediately before resuming live stream chunks.

### 7.2 Page Visibility Lifecycle
When users switch browser tabs:
- Browser pauses event rendering to conserve battery and CPU.
- When the tab regains focus (`visibilitychange` $\rightarrow$ `document.hidden === false`), `RealtimeService` sends a lightweight ping or checks for missed events to ensure the quote details screen is up to date.

---

## 8. Failure Fallback: Smart Adaptive Polling

If SSE fails 3 times consecutively (due to proxy blocking or hostile firewall):
1. `RealtimeService` seamlessly degrades to `StatusService.pollNegotiationStatus()` every 10 seconds.
2. The UI renders an unobtrusive status pill in the top header:
   - 🟢 **Live Sync Active** (SSE streaming)
   - 🟡 **Reconnecting...** (Backoff in progress)
   - ⚪ **Periodic Sync (10s)** (Polling fallback active)
3. The customer experience remains fluid with zero broken interactions.
