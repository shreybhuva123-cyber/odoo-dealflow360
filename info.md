# Project Info & Documentation

## 1. Problem Statement
DealFlow360 is an intelligent quotation and deal pipeline orchestration system designed for high-velocity enterprise B2B sales teams integrated with Odoo ERP. 

In traditional enterprise sales, sales reps frequently draft quotations with arbitrary discounts that severely erode product margins, trigger delayed manual approvals, create unexpected inventory fulfillment bottlenecks across warehouses, and lead to chaotic email back-and-forth negotiations with customers. 

DealFlow360 solves this by providing:
- Real-time gross margin guarding and automated risk scoring during quotation drafting.
- Multi-step approval workflows enforced by role-based guardrails (Sales Rep, Sales Manager, Finance, Operations, Admin).
- Visual sales pipeline management with Kanban drag-and-drop, probability weighting, and velocity monitoring.
- Real-time stock reservation and fulfillment allocation across multi-region warehouses synced directly with Odoo.
- Milestone and subscription billing schedules (MRR/ARR recognition).
- A dedicated, restricted Customer Deal Portal for digital quote reviews, counter-offers, discussion threads, and legally binding digital signoffs.

## 2. Tech Stack
- **React 18** – JavaScript UI library for component-based reactive rendering. Used here for the modern enterprise single-page application.
- **TypeScript** – Strongly typed superset of JavaScript. Used across all interfaces, data models, and API definitions to prevent runtime type errors.
- **Vite** – Ultra-fast frontend build tool and dev server. Used for bundling, Hot Module Replacement (HMR), and fast compilation.
- **Tailwind CSS** – Utility-first CSS framework. Used with CSS custom properties to implement a compact enterprise dark theme (`#0b0f19` background with blue `#2563eb` accents).
- **@dnd-kit/core & @dnd-kit/utilities** – Modern lightweight drag-and-drop toolkit. Powers smooth pointer-based Kanban card movement with activation constraints and drag overlays.
- **shadcn/ui & Radix UI Patterns** – Reusable, accessible UI component primitives (Button, Input, Select, Dialog, DropdownMenu, Badge, Table, Tabs, Tooltip, Alert, Progress, Avatar, Pagination, Skeleton).
- **React Router v6** – Client-side declarative routing engine. Handles nested layouts, route protection, role-based guards, and separates internal ERP from the external customer portal.
- **TanStack Query (React Query v5)** – Server-state management and caching library. Provides optimistic UI updates, background synchronization, caching, and error rollbacks.
- **Zustand** – Lightweight global client state manager. Manages authentication, user persona switching for hackathon demos, UI drawer states, and quotation drafting workspaces.
- **React Hook Form** – Performant, lightweight form state and uncontrolled input management. Used in Login and Registration flows.
- **Zod** – TypeScript-first schema declaration and validation library. Enforces email, password length, password matching, and role enum constraints via `@hookform/resolvers/zod`.
- **Recharts** – Composable charting library. Used for pipeline stage distribution graphs, margin trend tracking, and deal health scorecards.
- **Lucide React** – Clean enterprise icon set.
- **Axios** – HTTP client with request and response interceptors for Bearer token injection, automatic 401 token refresh queueing, and error handling.

## 3. Project Structure
```
c:/odoo hackathon/
├── odoo-dealflow360/
│   ├── frontend/
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── assets/
│   │   │   ├── components/
│   │   │   │   ├── ui/             # Button, Input, Select, Dialog, Dropdown, Badge, Card, Table, Tabs, Tooltip, Alert, Progress, Avatar, DatePicker, SearchInput, Pagination, Skeleton
│   │   │   │   ├── layout/         # AppShell, TopNavbar, Sidebar, Breadcrumbs, PageHeader, GlobalSearch, NotificationMenu, UserMenu, InternalLayout, CustomerPortalLayout
│   │   │   │   ├── navigation/     # nav-config.ts, ProtectedRoute.tsx, RoleGuard.tsx, PermissionGuard.tsx
│   │   │   │   ├── forms/          # Form components and input builders
│   │   │   │   ├── tables/         # Data tables with sorting and filters
│   │   │   │   ├── cards/          # DealHealthCard, ProductCard, RecommendationCard, WarehouseAllocationCard
│   │   │   │   ├── charts/         # Analytics charts & diagrams
│   │   │   │   ├── feedback/       # PageSkeleton, TableSkeleton, CardSkeleton, EmptyState, ErrorState, UnauthorizedState, NotFoundState
│   │   │   │   ├── dealflow/       # QuotationBuilder, QuotationLineTable, CustomerSelector, ProductSelector, DiscountEditor, MarginIndicator, RiskIndicator, RecommendationPanel, PricingSummary, QuotationStatus, ApprovalStatusBadge
│   │   │   │   └── approvals/      # PriorityRiskBadge, ApprovalStatusBadge, RiskBreakdown, DiscountAnalysisTable, ApprovalTimeline, FinanceReviewSection, AuditTimeline, ApproveModal, RejectModal, ReturnModal, ApprovalActions, ApprovalTable
│   │   │   ├── pages/
│   │   │   │   ├── auth/           # LoginPage (Zod validation + states), SignupPage (Role registration)
│   │   │   │   ├── dashboard/      # DashboardPage (KPI metrics, active quotes, margin benchmarks)
│   │   │   │   ├── quotations/     # QuotationsListPage, QuotationCreatePage, QuotationDetailPage, QuotationApprovalPage, QuotationFulfillmentPage, QuotationBillingPage
│   │   │   │   ├── pipeline/       # PipelinePage (Kanban & Table views), DealDetailPage (Overview, Activity, Quotes, Health)
│   │   │   │   │   └── components/ # DealHealthBadge, ProbabilityIndicator, DealCard, PipelineColumn, PipelineBoard, PipelineStats, PipelineToolbar, PipelineTable, DealOverview, DealHealthSummary, DealActivityTimeline, RelatedQuotes, StageChangeDialog, OwnerSelector, AddNoteDialog, NewDealDialog, PipelineEmptyState
│   │   │   │   ├── approvals/      # ApprovalsPage (Approval Center queue & KPIs), ApprovalDetailPage (Governance review & multi-step workflow)
│   │   │   │   ├── fulfillment/    # FulfillmentPage (Warehouse routing & stock allocation)
│   │   │   │   ├── billing/        # BillingPage (Invoices & payment milestones)
│   │   │   │   ├── subscriptions/  # SubscriptionsPage (MRR / ARR SaaS contracts)
│   │   │   │   ├── customers/      # CustomersPage (Account credit profiles & exposure)
│   │   │   │   ├── products/       # ProductsPage (SKU pricing, margin floors, volume tiers)
│   │   │   │   ├── warehouses/     # WarehousesPage (Regional hubs & lead times)
│   │   │   │   ├── deal-health/    # DealHealthPage (AI margin guard & velocity telemetry)
│   │   │   │   ├── reports/        # ReportsPage (Pipeline conversion, margin trends)
│   │   │   │   ├── admin/          # AdminPage (Discount policy matrix & Odoo sync settings)
│   │   │   │   └── portal/         # CustomerQuotePortalPage (Quote details, negotiation, feedback, signoff)
│   │   │   ├── hooks/              # useAuth, useDebounce, useDisclosure, useQuotations, useApprovals, usePipeline
│   │   │   ├── lib/
│   │   │   │   ├── validations/    # auth.schema.ts (login & signup Zod schemas)
│   │   │   │   └── utils.ts
│   │   │   ├── services/
│   │   │   │   ├── api/            # client.ts, auth.api.ts, users.api.ts, customers.api.ts, products.api.ts, quotations.api.ts, approvals.api.ts, pipeline.api.ts (with localStorage persistence), fulfillment.api.ts, billing.api.ts, subscriptions.api.ts, recommendations.api.ts, dealHealth.api.ts, reports.api.ts
│   │   │   │   ├── auth/
│   │   │   │   └── storage/        # tokenStorage.ts (accessToken, refreshToken, user, sidebar persistence)
│   │   │   ├── stores/             # auth.store.ts, ui.store.ts, workspace.store.ts, toast.store.ts
│   │   │   ├── types/              # auth.types.ts, customer.types.ts, product.types.ts, quotation.types.ts, approval.types.ts, pipeline.types.ts, inventory.types.ts, billing.types.ts, dealHealth.types.ts, api.types.ts, index.ts
│   │   │   ├── utils/              # cn.ts, formatters.ts, permissions.ts
│   │   │   ├── constants/          # roles.ts (with 1-click demo personas), routes.ts
│   │   │   ├── routes/             # route-config.tsx, index.tsx
│   │   │   ├── App.tsx             # TanStack Query Client Provider and Root Router
│   │   │   ├── main.tsx            # React DOM mounting
│   │   │   └── index.css           # Tailwind custom tokens, dark mode palette & scrollbars
│   │   ├── .env                    # Environment endpoints
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── tailwind.config.js
│   └── info.md
├── frontend -> odoo-dealflow360/frontend (Windows directory junction for seamless access)
└── info.md                         # Master living documentation file
```

## 4. Features Implemented
- **Full Phase 1 UI Architecture**: Complete React 18 + TypeScript + Vite + Tailwind CSS foundation configured and building cleanly.
- **Complete Phase 2 Authentication & Application Shell**:
  - **Login Page (`/login`)**: Built with React Hook Form + Zod validation. Supports Default, Loading, Success, Invalid Credentials error banner, Network Error banner, and inline field errors. Includes 1-click quick login buttons for all 5 internal roles plus Customer.
  - **Signup Page (`/signup`)**: Supports Name, Email, Password, Confirm Password, and Demo Role selection with strict Zod schema matching.
  - **Auth Store & Token Storage**: Manages `user`, `accessToken`, `refreshToken`, `isAuthenticated`, and `isLoading`. Persists credentials and sidebar state in `localStorage`.
  - **Automatic 401 Refresh & Retry Interceptor**: Configured in `client.ts` with queue mutex to prevent token race conditions; automatically redirects to `/login` if refresh fails.
  - **Route Security & Guards**:
    - `ProtectedRoute`: Blocks unauthenticated visitors from `/app/*`, redirecting them to `/login` with return history. Automatically routes `CUSTOMER` accounts to their dedicated Customer Portal.
    - `RoleGuard`: Intercepts unauthorized roles and renders the exact required "Access Restricted" screen with `[Go to Dashboard]` and persona switcher.
  - **Enterprise Application Shell (`AppShell`)**:
    - `TopNavbar`: Houses the DealFlow360 brand, global search, notification center, 1-click persona test switcher, theme toggle, and user menu.
    - `Sidebar`: Permission-driven navigation configuration (`Dashboard`, `Quotations`, `Pipeline`, `Approvals`, `Customers`, `Products`, `Fulfillment`, `Billing`, `Subscriptions`, `Deal Health`, `Reports`, `Admin`). Includes `[ < Collapse ]` toggle button with persistent state stored in `localStorage`.
    - `Breadcrumbs`: Dynamic navigational breadcrumb trail matching current route depth.
    - `UserMenu`: Displays active persona's name and role badge (`SALES_MANAGER`, `SALES_REP`, `FINANCE`, `ADMIN`, etc.).
    - `NotificationMenu`: Live dropdown alert center displaying categorized notifications.
    - `GlobalSearch`: Top navbar search bar with real-time categorised dropdown results.
  - **Customer Portal Strict Isolation (`/portal/quote/:token`)**:
    - Strictly separate layout (`CustomerPortalLayout`) without internal sidebars or internal ERP navigation.
    - Zero exposure of internal margins, risk scores, discount matrices, or warehouse logistics.
- **Complete Phase 3 Quotation Management & Smart Quote Builder**:
  - Full search, multi-criteria filtering, sorting, pagination, and tabs across `/quotations`.
  - Interactive multi-step creation wizard at `/quotations/new` (Customer ── Products ── Pricing ── Review).
  - Dynamic `DiscountEditor` with 3 compliance states (Safe, Warning, Violation) enforcing category and customer tier discount ceilings.
  - Live Margin Indicator, Radial Risk Meter with "Why is this deal risky?" breakdown, Context-aware AI recommendations with 1-click upsells, and Real-time Pricing Summary with tax and grand total calculation.
  - Offline-first `localStorage` persistence layer synchronizing quotes across browser reloads.
- **Complete Phase 4 Approval Center & Approval Workflow**:
  - **Approval Center (`/approvals` & `/app/approvals`)**:
    - Executive KPI Cards: Pending Approvals (12), High Risk Deals (4), Avg Approval Time (2.4h), Approved Today (8).
    - Comprehensive filtering toolbar: Text search, Risk Level filter, Status filter, and Sales Rep filter.
    - Full responsive `ApprovalTable` with columns: Quote #, Customer, Sales Rep, Total Amount, Blended Discount %, Margin %, Risk Level (`PriorityRiskBadge`), Stage, Queue Age, Status (`ApprovalStatusBadge`), and direct "Review →" actions.
  - **Approval Detail Workspace (`/approvals/:id`, `/app/approvals/:id`, `/app/quotations/:id/approval`)**:
    - Header with Quote Number, Customer, Priority Risk Badge (🔴 HIGH, 🟠 MEDIUM, 🟢 LOW), Status Badge, and queue age.
    - Financial KPI summary ribbon: Total Quotation Value, Blended Margin %, Discount Applied %, Calculated Risk Index.
    - `RiskBreakdown` panel explaining *Why does this deal need approval?* with radial score meter and commercial impact assessments.
    - `DiscountAnalysisTable` comparing applied discount vs category limit and customer tier ceiling with variance values (`+8.0 pts over`).
    - `FinanceReviewSection` displaying Gross Revenue, COGS, Net Margin ($ / %), Payment Terms requested vs standard, Customer Credit Rating, Credit Limit, and Outstanding Receivables.
    - `ApprovalTimeline` showing sequential sign-off progression (Rep Submission ── Sales Manager Review ── Finance Review ── Final Decision).
    - `AuditTimeline` tracking chronological events, actors, actions, and notes.
    - `ApprovalActions` with role-gated controls and informational read-only mode banner for Sales Reps.
    - Action modals: `ApproveModal`, `RejectModal` (mandatory reason), and `ReturnModal` (mandatory feedback).
- **Complete Phase 5 Pipeline & Deal Management**:
  - **Main Pipeline Workspace (`/pipeline` & `/app/pipeline`)**:
    - Executive Pipeline KPI Cards (`PipelineStats`): Total Deals (124 Deals), Pipeline Value (₹1.24 Cr / $12.4M), Weighted Pipeline (₹68.5 L / $6.85M based on probability), and At Risk (17 Deals).
    - Pipeline Toolbar (`PipelineToolbar`): Real-time search across deal names, customer accounts, and IDs; filter dropdowns for Owner, Stage, Health; View switcher (Kanban vs Table); "+ New Deal" modal trigger.
    - Kanban Board (`PipelineBoard`): Full drag-and-drop orchestration using `@dnd-kit/core` across 6 enterprise stages: `Lead`, `Qualified`, `Proposal`, `Negotiation`, `Won`, and `Lost`.
    - Columns (`PipelineColumn`): Displays stage deal count, total value sum, and droppable highlighting target.
    - Deal Card (`DealCard`): Displays Deal Name, Customer with tier pill, Amount ($ / ₹), Win Probability progress indicator, Expected Close date, Owner avatar/name, Health badge (🟢 Healthy, 🟡 At Risk, 🔴 Critical), Stalled indicator (`⚠ Stalled 8d`, `⚠ Stalled 14d`), and Approval pending badge (`⏳ Approval Pending`).
    - Drag & Drop Optimistic UI: Card movement executes instantly on drag release via `useUpdateDealStage()` with automatic rollback if rejected by governance rules.
    - Table View (`PipelineTable`): Full alternate tabular representation for sales managers supporting multi-column sorting (Name, Customer, Owner, Value, Probability, Date), health indicators, and direct navigation.
    - Empty State (`PipelineEmptyState`): Displays informative graphic with filter reset or "+ Create First Deal" CTA.
    - New Deal Creator (`NewDealDialog`): Modal to quickly generate opportunities with name, customer, value, initial stage, and close date.
  - **Deal Detail Workspace (`/app/pipeline/:dealId` & `/pipeline/:dealId`)**:
    - Breadcrumb navigation (`← Pipeline / {deal.id}`) and Header Bar with Title, Customer, Stage badge, Health badge, and Nominal Value.
    - Header action buttons: "🔀 Change Stage" (opens `StageChangeDialog`), "👤 Change Owner" (opens `OwnerSelector` for managers/admins), "+ Add Note" (opens `AddNoteDialog`), and "View Quotation ↗" (direct link to linked quote).
    - 4-Tab Navigation Workspace:
      - **Overview Tab (`DealOverview`)**: Commercial metrics grid (Deal Value, Win Probability with progress bar, Expected Close date, Owner) and metadata (Lead Source, Sales Region, Industry Sector, Approval Status).
      - **Activity Timeline Tab (`DealActivityTimeline`)**: Chronological event history with category icons (Deal Created, Quote Created, Quote Updated, Customer Viewed, Customer Negotiated, Stage Changed, Owner Changed, Note Added) and inline notes.
      - **Related Quotes Tab (`RelatedQuotes`)**: Linked quotation summaries with quote #, amount, margin %, risk badge, status badge, and 1-click navigation to `/app/quotations/:id`.
      - **Deal Health Tab (`DealHealthSummary`)**: Automated velocity telemetry card detailing reasons for risk, stalled deal warnings, and direct link to `/app/deal-health`.
- **Complete Phase 6 Fulfillment & Warehouse Management**:
  - **Fulfillment Operations Hub (`/fulfillment` & `/app/fulfillment`)**:
    - KPI Metrics Ribbon (`FulfillmentStats`): Pending Allocation (24), In Processing (18), Partial Fulfillment (7), Ready to Ship (12), Completed Dispatches (48), Shortage Alert (5).
    - Advanced multi-filter toolbar (`FulfillmentFilters`): Search, status filter, warehouse selector, priority filter, date range filter.
    - Full responsive order table (`FulfillmentTable`): Order ID, customer, date, allocation progress bar, hub tag, status badge, priority pill, and contextual actions.
  - **Fulfillment Detail Workspace (`/fulfillment/:id` & `/app/fulfillment/:fulfillmentId`)**:
    - Responsive Stepper (`FulfillmentProgress`): Order Created → Stock Allocated → Processing → Shipped → Delivered.
    - Multi-Warehouse Allocation Matrix (`WarehouseAllocation`): Interactive allocation drawer with numeric steppers (- / +) per warehouse with physical stock limits.
    - Live Stock Health Breakdown (`FulfillmentItemsTable`): Line items with stock health indicators (✓ Available, ⚠ Low stock, 🔴 Insufficient, ✕ Out of stock).
    - Allocation Summary (`AllocationSummary`): Real-time allocated vs required, deficit alerts, [Auto-fill Available], [Flag Backorder], and [Confirm Allocation] modal.
    - Carrier Dispatch Logistics (`ShipmentStatus`): Carrier branding (DHL, BlueDart, FedEx), tracking number, dispatch date, estimated arrival, and GPS tracking hub ping.
    - Immutable Chronological Audit Trail (`FulfillmentTimeline`): Real-time milestone events and "+ Add Note" logging modal.
    - Operational Action Controls: Begin Processing, Mark Ready to Ship, Dispatch Carrier, Confirm Delivery, and Generate Invoice.
  - **Warehouse Network Center (`/warehouses` & `/app/warehouses`)**:
    - Facility Network KPI Ribbon (`WarehouseStats`): 5 Warehouses, 5,378 SKUs, 72% Avg Capacity, 45 Low-Stock SKUs, 70 Active Fulfillments.
    - Facility Card Grid (`WarehouseCard`): Facility card displaying utilization gauge, inventory SKU count, low-stock count, active fulfillments, and direct link.
    - Warehouse Detail Workspace (`/warehouses/:id` & `/app/warehouses/:warehouseId`): Facility metadata, manager contact, transit speed, and SKU inventory table with "+ Restock 25" simulation.
- **Complete Phase 7 Billing, Invoicing & Subscriptions**:
  - **Invoices Hub (`/invoices` & `/app/invoices`)**:
    - Aggregate Financial KPI ribbon: Total Invoiced, Outstanding Balance, Overdue Recovery with dunning notice tag, Cash Settled.
    - Comprehensive filtering bar (`InvoiceFilters`): Search by customer/invoice #, status filter, date range, clear action.
    - Full responsive `InvoiceTable` displaying Invoice #, Customer, Issued/Due date, Amount, Status badge, and balance due with overdue day countdown.
    - Action triggers for recording payments (`RecordPaymentDialog`) and dispatching dunning reminders (`SendReminderDialog`).
  - **Invoice Detail Workspace (`/invoices/:id` & `/app/invoices/:invoiceId`)**:
    - Complete financial workspace displaying Bill-To company address, Tax ID (GSTIN), payment terms, and currency.
    - `InvoiceItems`: Itemized line table with SKU, quantity, unit price, tax, and line total.
    - `PaymentStatus`: Visual reconciliation progress bar (% paid) with color transitions.
    - `InvoiceSummary`: Detailed financial arithmetic (Subtotal, Discount, 18% GST, Shipping, Grand Total, Amount Paid, Balance Due).
    - `PaymentHistory`: Immutable audit ledger recording transaction dates, payment method, reference IDs, and recorded-by user.
    - Connected Commercial Flow integration card linking back to Deal, Sales Quotation, and Fulfillment Order.
  - **Billing & Revenue Command Center (`/billing` & `/app/billing`)**:
    - Executive Revenue Realization KPIs: Total Billed, Outstanding, Overdue, Cash Settled, Due Soon, and MRR.
    - Interactive Financial Realization Area Chart (`BillingChart`) powered by Recharts (Cumulative Billed vs Cash Collected).
    - `BillingScheduleTable`: Tracking milestone contracts and recurring schedules with Pause/Resume status toggles.
  - **Subscriptions & Recurring Revenue (`/subscriptions` & `/app/subscriptions`)**:
    - SaaS Run-rate KPIs: Monthly Recurring Revenue (MRR), Annual Run-Rate (ARR), Active Contracts, and 98.4% Retention Rate.
    - Dual Table & Card Grid views (`SubscriptionTable` & `SubscriptionCard`).
    - Status management: Pause, Resume, and Cancel subscription contracts.
  - **Subscription Detail Workspace (`/subscriptions/:id` & `/app/subscriptions/:subscriptionId`)**:
    - Contract specifications, recurring MRR/ARR profile, and auto-renew telemetry.
    - `SubscriptionTimeline`: Chronological milestone tracker for contract provisioning, invoices, and payments.
    - Customer Invoices table listing all billing documents generated under the contract.
    - Churn Risk & Account Health score card (Healthy 98/100).

## 5. How Things Work (Function-Level Flow)

### 1. Login & Form Validation Flow
> When the user navigates to `/login` and fills the sign-in form:
> 1. `LoginPage.tsx` activates React Hook Form configured with `zodResolver(loginSchema)`.
> 2. If email format is invalid or password has fewer than 8 characters, inline validation errors appear directly below the respective inputs without triggering a network request.
> 3. Upon submitting valid inputs, `onSubmit()` triggers `authApi.login()`.
> 4. If credentials match, `login()` in `auth.store.ts` sets `user`, `accessToken`, `refreshToken`, and `isAuthenticated: true`.
> 5. If role is `CUSTOMER`, user is automatically routed to `/portal/quote/portal_apex_1001_secure`. If internal staff, redirected to `/app/dashboard`.

### 2. Automatic 401 Token Refresh & Request Retry Flow
> When an authenticated API call receives a 401 Unauthorized status from the backend:
> 1. Axios response interceptor in `client.ts` intercepts the error.
> 2. It checks `tokenStorage.getRefreshToken()`. If present, it sets `isRefreshing = true` and queues any concurrent requests in `failedQueue`.
> 3. It calls `POST /auth/refresh` to obtain a fresh access token.
> 4. Upon success, `tokenStorage.setTokens()` stores the new token, the failed request's Authorization header is updated with `Bearer <newAccessToken>`, and the request is retried transparently.
> 5. Queued requests are resolved with the new token.
> 6. If refresh fails or no refresh token exists, `tokenStorage.clearAll()` is executed and the user is redirected to `/login`.

### 3. Route Guard & Access Restricted Flow
> When a Sales Rep attempts to navigate to a privileged route such as `/app/admin`:
> 1. React Router matches `/app/admin` wrapped in `<RoleGuard roles={['ADMIN']}>`.
> 2. `RoleGuard` calls `hasRole(['ADMIN'])` on `useAuthStore`.
> 3. The check returns `false`. `RoleGuard` renders `<UnauthorizedState />`.
> 4. The user sees "Access Restricted: You don't have permission to access this page." with a direct `[Go to Dashboard]` button and role switcher helpers.

### 4. Smart Quote Drafting & Margin Guard Flow
> When a sales representative drafts or modifies a quotation:
> 1. `QuotationBuilder.tsx` tracks selected items, quantities, and discounts.
> 2. For each line, `DiscountEditor.tsx` evaluates the discount against `product.category` ceilings and `customer.tier` ceilings. If a ceiling is exceeded, a red alert and variance badge are rendered.
> 3. `MarginIndicator.tsx` calculates blended gross margin (`((subtotal - totalCost) / subtotal) * 100`) and visually reflects healthy (≥25%), moderate (15–24%), or critical (<15%) status.
> 4. When the rep clicks "Submit for Approval", `PricingSummary.tsx` displays the pre-submission confirmation modal. Upon confirmation, `useUpdateQuotation` sets the quotation status to `PENDING_APPROVAL` and automatically routes the user to the Approval Center.

### 5. Multi-Step Approval Chain & Governance Routing Flow
> When a quotation with policy breaches is submitted for governance review:
> 1. In `approvals.api.ts`, DealFlow evaluates discount breaches, margin compression, and credit terms. A deal with high risk (e.g. Q-1042 Acme Corp with 18% service discount and 13.2% margin) is tagged `🔴 HIGH RISK` with risk score 68/100 and placed in the Approval Center queue (`/approvals`).
> 2. The quotation is assigned to Stage 1: Sales Manager Review (`SALES_MANAGER`).
> 3. Maria Chen (Sales Manager) reviews the deal at `/approvals/:id`. `RiskBreakdown.tsx` displays the exact reasons approval is required.
> 4. When the Sales Manager clicks "Approve Deal" in `ApprovalActions.tsx`, `ApproveModal.tsx` opens. The manager submits their approval note.
> 5. `approvalsApi.approve()` marks Step 2 as `APPROVED`, adds an audit trail entry, and advances `currentStepIndex` to Step 3 (`FINANCE`) because high-risk discount breaches require Finance clearance.
> 6. David Park (Finance) opens the approval. `FinanceReviewSection.tsx` presents gross revenue, COGS, net margin ($5,610), tax, and working capital risk from requested Net 60 payment terms.
> 7. Once Finance approves, the approval request status transitions to `APPROVED`, Step 4 (Final Decision) is marked approved, an audit record is logged, and `syncQuotationStatus()` updates the quotation in `dealflow_quotations_v2` to `APPROVED`, enabling fulfillment.

### 6. Pipeline Drag-and-Drop with Optimistic UI & Rollback Flow
> When a user drags a deal between stages on `/app/pipeline`:
> 1. `PipelineBoard.tsx` captures pointer movement via `@dnd-kit/core`'s `PointerSensor` (with a 6px activation constraint to avoid interfering with normal card clicks).
> 2. While dragging, `<DragOverlay>` renders a floating preview card with enhanced elevation.
> 3. On dropping into a valid `PipelineColumn` (e.g. from `Proposal` to `Negotiation`):
>    - `useUpdateDealStage()` executes `onMutate()`: cancels outgoing queries, snapshots current deals, and immediately updates the deal's stage in the TanStack Query cache. The user sees the card settle into the new column instantly.
>    - `pipelineApi.updateDealStage()` processes the change, recalculates target probability, logs a `STAGE_CHANGED` activity entry, and updates `localStorage`.
>    - If the update succeeds, `onSuccess()` invalidates queries and triggers a green success toast (`"✓ Deal moved to Negotiation"`).
>    - If the backend or validation rejects the transition, `onError()` rolls back the cache to the snapshot and shows a red toast: `"Stage update failed. The deal could not be moved."`

### 7. Deal Health Telemetry & Stalled Velocity Remediation Flow
> When viewing a deal on `/app/pipeline` or `/app/pipeline/:dealId`:
> 1. The deal card displays health signals (`🟢 Healthy`, `🟡 At Risk`, `🔴 Critical`) alongside stalled badges (`⚠ Stalled 8d`) and approval indicators.
> 2. On the Deal Detail Page, the `DealHealthSummary` tab explains the exact telemetry reasons (e.g., "No activity for 8 days", "Discount approaching customer limit", "Close date approaching").
> 3. Sales Managers can click "Change Owner" to reassign the deal to another team member or "Add Note" to log remediation actions, resetting the stalled activity clock.
> 4. Users can jump directly into `/app/deal-health` for fleet-wide telemetry analysis.

### 8. Customer Deal Review & Negotiation Flow
> When a customer accesses `/portal/quote/:token`:
> 1. `CustomerPortalLayout` mounts without the ERP sidebar or internal actions.
> 2. `CustomerQuotePortalPage` presents Quote Details with line items, quantities, list prices, and discounts (strictly hiding internal margin percentages and risk scores).
> 3. In the Negotiation tab, the customer enters counter-offer percentages or commercial notes and submits them directly to the assigned sales representative.
> 4. In the Confirmation tab, entering their authorized signatory name and clicking "Sign & Finalize Agreement" transitions the quote into confirmed status and unlocks verified contract download.

### 9. Multi-Warehouse Stock Allocation & Dispatch Flow
> When an approved quotation transitions into fulfillment:
> 1. The order opens at `/app/fulfillment/:fulfillmentId`.
> 2. The operator checks stock across 5 nationwide facilities (`WH-BOM-01`, `WH-DEL-02`, `WH-BLR-03`, etc.).
> 3. Clicking "Allocate Items" opens `WarehouseAllocation.tsx`, allowing steppers (- / +) to allocate units across warehouses with real-time capacity checks.
> 4. If stock is insufficient, shortage warnings trigger with 1-click `[Flag Backorder]`.
> 5. Confirming allocations deducts inventory authoritatively from warehouse records and advances order status to `ALLOCATED`.
> 6. Operators advance the order through packing, carrier dispatch (DHL Express, BlueDart), tracking number generation, and delivery confirmation.

### 10. Commercial Invoicing & Payment Reconciliation Flow
> When an order is fulfilled or a deal won:
> 1. In `FulfillmentDetailPage.tsx`, the operator clicks **"🧾 Generate Invoice"**.
> 2. `useCreateInvoice` transforms order items into an invoice, applies 18% GST, shipping, and payment terms, creates `INV-xxxx`, and redirects to `/app/invoices/:invoiceId`.
> 3. Finance or Sales can click "Record Payment", opening `RecordPaymentDialog.tsx`.
> 4. Entering the collected amount (e.g. ₹1,50,000 via Bank Transfer with UTR reference) decrements `balanceDue`.
> 5. If `balanceDue == 0`, status transitions to `PAID`; if partial, transitions to `PARTIALLY_PAID`.
> 6. The payment is recorded in `PaymentHistory`, and the reconciliation gauge updates instantly.
> 7. If an invoice passes its due date without full settlement, it automatically flags as `OVERDUE`. Clicking "Send Reminder" triggers `SendReminderDialog.tsx` to dispatch a dunning notice.

### 11. Recurring SaaS Subscriptions & Milestone Schedule Management Flow
> When an enterprise software or recurring service contract is provisioned:
> 1. `subscriptions.api.ts` manages active contracts (e.g. `SUB-1024` for Acme Corporation, ₹2.5L/mo MRR, ₹30L ARR).
> 2. On `/app/subscriptions`, users can filter by plan tier, status, or customer name.
> 3. Operators can toggle subscription state between `ACTIVE` and `PAUSED` (e.g. for seasonal store holds) or `CANCELLED`.
> 4. State transitions log an audit event in `SubscriptionTimeline.tsx` and automatically halt or resume recurring invoice generation.
> 5. `BillingChart.tsx` aggregates real-time revenue realization trends across milestone tranches and recurring SaaS cadences.

## 6. Data Flow / State Management
- **Client Global State (Zustand)**:
  - `auth.store.ts`: Holds active user, role, fine-grained permissions, `accessToken`, `refreshToken`, and `isAuthenticated`. Fully synced with `localStorage`.
  - `ui.store.ts`: Handles presentation controls such as sidebar collapse toggle, dark/light theme switching, and modal drawers.
  - `toast.store.ts`: Global reactive toast notification queue with auto-dismissal and custom themes.
- **Server Cache & Async State (TanStack Query)**:
  - `useQuotations.ts`: Queries and mutations for quotations, products, customers, and AI deal recommendations.
  - `useApprovals.ts`: Queries and mutations for approval lists, detail records, KPI statistics, and decisions with cross-query cache invalidation.
  - `usePipeline.ts`: Queries and optimistic mutations for pipeline deals, stats, deal detail, stage transitions, owner reassignments, and notes.
  - LocalStorage persistence engines (`quotations.api.ts`, `approvals.api.ts`, `pipeline.api.ts`) ensure mock data modifications survive page reloads and browser restarts.

## 7. Known Limitations / Things to Improve
- **Mock Data Fallbacks**: All domain services include robust mock fallback data so the entire user lifecycle can be tested offline before Python/Odoo backend activation.
- **Dynamic Chunking**: Main JavaScript bundle is ~1,185 kB due to Recharts, @dnd-kit, Lucide icons, and comprehensive enterprise workspaces; Vite's Rollup `manualChunks` optimization will split vendor libraries into separate cached bundles.

## 8. Suggestions & Alternative Approaches
- **JWT Refresh via HttpOnly Cookies vs LocalStorage**: For maximum security against XSS in production, `refreshToken` should be sent in an `HttpOnly`, `SameSite=Strict` cookie from the backend server rather than `localStorage`.
- **Parallel Multi-Party Approvals**: Current workflow executes sequentially (Rep ──> Manager ──> Finance). An alternative approach for enterprise deals above $250k is parallel multi-signoff where Finance, Legal, and VP Sales approve concurrently.

## 9. Changelog (Session-wise Updates)

### [Update - 2026-09-05 / Session #1]
- Initialized `info.md` living documentation based on the master prompt specification.
- Inspected workspace and repository state (`odoo-dealflow360`).

### [Update - 2026-09-05 / Session #2: Frontend Phase 1 Foundation]
- Installed Node.js (LTS v24.19.0) and configured npm tooling.
- Created `frontend/` application with Vite, React 18, and TypeScript.
- Configured Tailwind CSS with custom enterprise dark mode design tokens and scrollbar styles.
- Created complete modular folder structure (`components/`, `pages/`, `hooks/`, `services/`, `stores/`, `types/`, `utils/`, `constants/`, `routes/`, `lib/`).
- Built dual layout system: `InternalLayout` for staff and `CustomerPortalLayout` for client-facing negotiation and signoff.
- Implemented 16 core UI components and 12 DealFlow-specific components.
- Implemented 7 feedback/state components (`PageSkeleton`, `TableSkeleton`, `CardSkeleton`, `EmptyState`, `ErrorState`, `UnauthorizedState`, `NotFoundState`).
- Established role-based routing and navigation configuration for 5 internal personas plus external customer portal.
- Implemented 12 API service modules with fallback mock data and Axios client with token interceptor.
- Built Zustand stores for `auth`, `ui`, and `workspace` with 1-click persona switching.
- Created 16 complete page views.
- Verified TypeScript compilation and production build (`tsc -b && vite build`) passed with 0 errors.

### [Update - 2026-09-05 / Session #3: Frontend Phase 2 Authentication & App Shell]
- Implemented React Hook Form + Zod validation schemas (`loginSchema`, `signupSchema`) in `src/lib/validations/auth.schema.ts`.
- Rebuilt `LoginPage.tsx` with Default, Loading, Success, Invalid credentials banner, Network error banner, in-field error indicators, and 1-click persona testing buttons.
- Rebuilt `SignupPage.tsx` with Full Name, Email, Password, Confirm Password, and Demo Role selection.
- Enhanced `auth.store.ts` with `user`, `accessToken`, `refreshToken`, `isAuthenticated`, `isLoading`, and `switchRole`.
- Enhanced `tokenStorage.ts` with separate `accessToken`, `refreshToken`, and persistent sidebar collapse preferences.
- Enhanced `client.ts` with automatic 401 response interceptor, refresh token queueing mutex, and auto-logout on refresh failure.
- Strengthened `ProtectedRoute.tsx` to prevent unauthenticated access and automatically reroute `CUSTOMER` users away from internal ERP pages to the customer portal.
- Updated `UnauthorizedState.tsx` to match the exact "Access Restricted" specification with `[Go to Dashboard]` and persona switcher.
- Created modular application shell components: `AppShell.tsx`, `TopNavbar.tsx`, `Sidebar.tsx`, `Breadcrumbs.tsx`, `PageHeader.tsx`, `GlobalSearch.tsx`, `NotificationMenu.tsx`, and `UserMenu.tsx`.
- Implemented collapsible sidebar with `[ < Collapse ]` button and `localStorage` persistence.
- Implemented live notification menu with 3 categorized alerts, unread badge counter, and mark-as-read action.
- Implemented global search bar with instant categorized results for Quotations, Customers, Products, and Invoices.
- Implemented user menu displaying current user role, Profile, Preferences, Help, and Logout.
- Verified all 8 manual test cases: login, invalid credentials, unauthenticated redirect, sales rep admin restriction, admin access, customer redirect, customer portal, and logout.
- Verified production build (`tsc -b && vite build`) passed with 0 errors in 9.46s.

### [Update - 2026-09-05 / Session #4: Complete Alignment with DealFlow360 Mockup & Full Interactive Flows]
- Implemented exact CSS tokens and utility classes matching the provided HTML mockup (`--bg: #0A0F1E`, `--surface: #111827`, `--surface2: #1A2235`, `--accent: #3B82F6`, `--amber: #F59E0B`, `--green: #10B981`, `--red: #EF4444`, `--purple: #8B5CF6`).
- Added global utility classes: `.btn`, `.badge`, `.stat-card`, `.warehouse-row`, `.approval-step`, `.invoice-row`, `.modal-overlay`, `.toast-stack`, `.portal-wrap`, and `.negotiation-box`.
- Built `ToastStack.tsx` mounted globally in `App.tsx`, controlled by Zustand `showToast(msg, type)` with auto-dismissal and 4 alert types.
- Implemented preliminary Approvals, Fulfillment, Invoices, Customer Portal, Deal Health, Products, and Admin views matching the design system.

### [Update - 2026-09-05 / Session #5: Frontend Phase 3 — Quotation Management & Smart Quote Builder]
- **Quotation List Workspace (`QuotationList.tsx` & `QuotationsListPage.tsx`)**: Search, multi-criteria filtering, sorting, pagination, and status tabs.
- **QuotationStatus Badge (`QuotationStatus.tsx`)**: Supporting all 8 lifecycle statuses with dot indicators.
- **Customer Selector Component (`CustomerSelector.tsx`)**: Real-time customer search with tier ceiling indicators.
- **Product Selector Component (`ProductSelector.tsx`)**: Category-filtered search across SKUs with stock indicators.
- **Quotation Line Table (`QuotationLineTable.tsx`)**: Interactive quantity adjustment and line management.
- **Discount Editor Component (`DiscountEditor.tsx`)**: Triple-state governance (Safe, Warning, Violation) enforcing category and customer tier ceilings.
- **Margin Indicator Component (`MarginIndicator.tsx`)**: Real-time margin meter with configurable thresholds.
- **Deal Risk Indicator & Breakdown Panel (`RiskIndicator.tsx`)**: Radial meter (0–100) and clickable breakdown modal.
- **AI Recommendation Panel (`RecommendationPanel.tsx`)**: Context-aware upsell cards with 1-click line addition.
- **Live Pricing Summary (`PricingSummary.tsx`)**: Subtotal, discount, tax, grand total calculation, and submission dialog.
- **Structured Creation Wizard (`QuotationCreatePage.tsx` at `/quotations/new`)**: 4-step wizard workflow.
- **Smart Quote Builder (`QuotationBuilder.tsx` & `QuotationDetailPage.tsx` at `/quotations/:id`)**: Responsive workspace with `localStorage` persistence.
- **Build Verification**: Passed with 0 errors in 7.69s.

### [Update - 2026-09-05 / Session #6: Frontend Phase 4 — Approval Center & Approval Workflow]
- **Approval Data Model & Types (`src/types/approval.types.ts`)**: Expanded `ApprovalStatus`, added `DiscountAnalysisItem`, `RiskFactor`, `ApprovalAuditItem`, `FinanceReviewDetails`, and `ApprovalKpis`.
- **Approval API Service & LocalStorage Persistence (`src/services/api/approvals.api.ts`)**: Offline-first persistence under `dealflow_approvals_v2`, pre-seeded with realistic enterprise deals, and synchronized with `dealflow_quotations_v2`.
- **TanStack Query Hook Integration (`src/hooks/useApprovals.ts`)**: Query hooks with cross-query cache invalidation.
- **Modular Approval Component Suite (`src/components/approvals/`)**: PriorityRiskBadge, ApprovalStatusBadge, RiskBreakdown, DiscountAnalysisTable, FinanceReviewSection, ApprovalTimeline, AuditTimeline, ApproveModal, RejectModal, ReturnModal, ApprovalActions, ApprovalTable.
- **Approval Pages & Route Integration**: ApprovalsPage (`/approvals`) and ApprovalDetailPage (`/approvals/:id`).
- **Build Verification**: Passed with 0 errors in 24.97s.

### [Update - 2026-09-05 / Session #7: Frontend Phase 5 — Pipeline / Deal Management]
- **Installed Drag-and-Drop Tooling**:
  - Integrated `@dnd-kit/core` and `@dnd-kit/utilities` for reliable, accessible HTML5/Pointer drag-and-drop.
- **Pipeline Data Model & Types (`src/types/pipeline.types.ts`)**:
  - Defined `DealStage` (`lead`, `qualified`, `proposal`, `negotiation`, `won`, `lost`), `DealHealth` (`healthy`, `at_risk`, `critical`), and `DealActivityType`.
  - Added models for `Deal`, `DealActivity`, `RelatedQuote`, `PipelineStats`, `PipelineFilterOptions`, and `PIPELINE_STAGES` configuration.
- **Pipeline API Service & LocalStorage Persistence (`src/services/api/pipeline.api.ts`)**:
  - Created offline-first persistence engine under key `dealflow_pipeline_v2`.
  - Populated 12 realistic enterprise deals spanning high-risk stalled accounts (Q-1042 Acme Corp, Q-1036 OmniCorp), active negotiations (Q-1040 Vertex LLC, Q-1001 Apex Logistics), multi-tenant proposals (Q-1037 PeakSoft Ltd), and won contracts (Q-1034 Quantum Dynamics).
  - Built methods: `getPipeline()`, `getPipelineStats()`, `getDeals()`, `getDeal()`, `updateDealStage()`, `updateDealOwner()`, `addDealNote()`, and `createDeal()`.
- **TanStack Query Hook Integration (`src/hooks/usePipeline.ts`)**:
  - Built `usePipeline()`, `usePipelineStats()`, `useDeal()`, `useUpdateDealStage()`, `useUpdateDealOwner()`, `useAddDealNote()`, and `useCreateDeal()`.
  - **Optimistic UI Updates**: `useUpdateDealStage` implements instant card movement on drag release via `onMutate`, with automated snapshot rollback on `onError` and query invalidation on `onSuccess`.
- **Modular Pipeline Component Suite (`src/pages/pipeline/components/`)**:
  - `DealHealthBadge.tsx`: Badges for 🟢 Healthy, 🟡 At Risk, and 🔴 Critical with glowing dot indicator.
  - `ProbabilityIndicator.tsx`: Progress bar showing probability percentage and weighted value contribution.
  - `DealCard.tsx`: Draggable deal card displaying Deal Name, Customer with tier pill, Amount ($ / ₹), Probability meter, Expected close date, Owner avatar/name, Health badge, Stalled indicator (`⚠ Stalled 8d`), Approval pending badge (`⏳ Approval Pending`), and click navigation.
  - `PipelineColumn.tsx`: Droppable column container with stage header, count badge, total value, and card stack.
  - `PipelineBoard.tsx`: 6-column Kanban board with DndContext, pointer sensor constraint (6px), and DragOverlay preview card.
  - `PipelineStats.tsx`: Primary KPI cards: Total Deals (124 Deals), Pipeline Value (₹1.24 Cr / $12.4M), Weighted Pipeline (₹68.5 L / $6.85M based on probability), and At Risk (17 Deals).
  - `PipelineToolbar.tsx`: Search input, Owner dropdown, Stage dropdown, Health dropdown, View switcher (Kanban vs Table), and "+ New Deal" trigger.
  - `PipelineTable.tsx`: Full tabular view for managers with columns: Deal, Customer, Owner, Stage, Value, Probability, Health, Expected Close, Actions, and multi-column sorting.
  - `DealOverview.tsx`: Deal commercial metadata card (Value, Probability, Expected Close, Owner, Customer Tier, Industry, Source).
  - `DealHealthSummary.tsx`: Velocity telemetry card detailing specific risk reasons, stalled warnings, and link to `/app/deal-health`.
  - `DealActivityTimeline.tsx`: Chronological activity timeline with category icons and "+ Add Note" action.
  - `RelatedQuotes.tsx`: Linked quotations table with quote #, amount, margin %, risk badge, status badge, and navigation.
  - `StageChangeDialog.tsx`: Modal for manual stage transitions with optional reasoning.
  - `OwnerSelector.tsx`: Modal allowing sales managers/admins to reassign deal owner.
  - `AddNoteDialog.tsx`: Modal for logging interaction notes.
  - `NewDealDialog.tsx`: Modal for creating fresh opportunities.
  - `PipelineEmptyState.tsx`: Empty state with filter reset and "+ Create Deal" CTA.
  - `index.ts`: Barrel export.
- **Pipeline Pages & Route Integration**:
  - Built `PipelinePage.tsx` at `/pipeline` and `/app/pipeline` supporting both Kanban drag-and-drop and Table views.
  - Built `DealDetailPage.tsx` at `/pipeline/:dealId` and `/app/pipeline/:dealId` with 4-tab workspace (Overview, Activity Timeline, Related Quotes, Deal Health).
  - Configured `route-config.tsx` with root shortcut redirects and routes.
- **Build Verification**:
  - `npm run build` (`tsc -b && vite build`) passed with 0 errors in 7.60s.
  - Dev server running smoothly on `http://127.0.0.1:3000`.

### [Update - 2026-09-05 / Session #8: Frontend Phase 6 — Fulfillment & Warehouse Management]
- **Fulfillment & Warehouse Data Models (`src/types/fulfillment.types.ts` & `src/types/warehouse.types.ts`)**:
  - Defined `FulfillmentStatus` (9 states: `pending`, `allocated`, `processing`, `ready`, `shipped`, `partially_delivered`, `delivered`, `completed`, `cancelled`) and `FulfillmentPriority` (`low`, `normal`, `high`, `critical`).
  - Added models: `Fulfillment`, `FulfillmentItem`, `ShipmentInfo`, `FulfillmentActivity`, `FulfillmentStats`, `FulfillmentFilterOptions`, `Warehouse`, `WarehouseInventoryItem`, `WarehouseStats`, `ProductStockAvailability`.
  - Re-exported via `src/types/index.ts` with backward compatibility for legacy inventory types.
- **Authoritative API Layer & LocalStorage Persistence**:
  - `src/services/api/warehouses.api.ts`: Pre-seeded 5 major distribution facilities across India:
    - Mumbai Central Logistics Hub (`WH-BOM-01`): 82% capacity, 1,248 SKUs, primary hub
    - Delhi NCR Distribution Center (`WH-DEL-02`): 64% capacity, 940 SKUs
    - Bangalore Tech Cargo Hub (`WH-BLR-03`): 75% capacity, 1,120 SKUs
    - Pune Regional Fulfillment Node (`WH-PNQ-04`): 48% capacity, 620 SKUs
    - Chennai Ocean Port Depot (`WH-MAA-05`): 91% capacity, 1,450 SKUs
    - Built methods: `getWarehouses()`, `getWarehouse()`, `getWarehouseStats()`, `getWarehouseInventory()`, `getStockAvailability()`, and `restockInventoryItem()`.
  - `src/services/api/fulfillment.api.ts`: Pre-seeded 6 enterprise orders (`FUL-1024` Acme Corp, `FUL-1023` XYZ Ltd, `FUL-1025` Beta Industries, `FUL-1026` Nexus Dynamics, `FUL-1027` OmniCorp Global, `FUL-1028` Quantum Systems).
    - Built methods: `getFulfillments()`, `getFulfillment()`, `getFulfillmentStats()`, `getFulfillmentItems()`, `getFulfillmentActivity()`, `allocateInventory()`, `updateFulfillmentStatus()`, and `createFulfillment()`.
    - LocalStorage persistence under `dealflow_fulfillment_v2` and `dealflow_warehouses_v2`.
- **TanStack Query Hooks**:
  - `src/hooks/useFulfillment.ts`: Query and mutation hooks (`useFulfillments`, `useFulfillment`, `useFulfillmentStats`, `useAllocateInventory`, `useUpdateFulfillmentStatus`, `useCreateFulfillment`) with automated query invalidation across fulfillment, warehouses, items, and inventory balances.
  - `src/hooks/useWarehouses.ts`: Query hooks (`useWarehouses`, `useWarehouse`, `useWarehouseStats`, `useWarehouseInventory`, `useStockAvailability`, `useRestockInventoryItem`).
- **Modular Component Suites**:
  - **Fulfillment Suite (`src/pages/fulfillment/components/`)**:
    - `FulfillmentStats.tsx`: KPI cards (Pending 24, Processing 18, Partial 7, Ready to Ship 12, Completed 48, Low Stock 5).
    - `FulfillmentFilters.tsx`: Search query, status pills, warehouse selector, priority filter, date range filter, and clear actions.
    - `FulfillmentTable.tsx`: Full table view with allocation progress bar, status badges, priority pills, and role-governed actions.
    - `FulfillmentStatusBadge.tsx`: Badges for all 9 states with icons and enterprise color tokens.
    - `FulfillmentProgress.tsx`: Visual milestone tracker (Created → Stock Allocated → Processing → Shipped → Delivered) with horizontal desktop and vertical mobile responsive modes.
    - `FulfillmentItemsTable.tsx`: Product line items with stock problem indicators (✓ Available, ⚠ Low stock, 🔴 Insufficient, ✕ Out of stock).
    - `WarehouseAllocation.tsx`: Central allocation workspace:
      - `AllocationTable.tsx`: Multi-warehouse allocation matrix with numeric steppers (- / +) and warehouse capacity limits.
      - `AllocationSummary.tsx`: Real-time allocated vs required, deficit warnings, [Auto-fill Available], and [Flag Backorder].
      - `ConfirmAllocationDialog.tsx`: Confirmation modal summarizing physical warehouse breakdown.
    - `ShipmentStatus.tsx`: Carrier logistics card (DHL, BlueDart, FedEx) with tracking number, dispatch date, estimated arrival, and GPS hub checkpoint ping.
    - `FulfillmentTimeline.tsx`: Immutable chronological audit trail with "+ Add Note" modal.
    - `NewFulfillmentDialog.tsx`: Modal to manually create a new fulfillment order.
    - `FulfillmentSkeletons.tsx` & `FulfillmentEmptyState.tsx`.
  - **Warehouse Suite (`src/pages/warehouses/components/`)**:
    - `WarehouseCard.tsx`: Facility card displaying utilization gauge, inventory SKU count, low-stock count, active fulfillments, and direct link.
    - `WarehouseStats.tsx`: Network-wide warehouse KPIs (5 Warehouses, 5,378 SKUs, 72% Avg Capacity, 45 Low-Stock SKUs, 70 Active Fulfillments).
    - `WarehouseFilters.tsx`: Search, category filter (Computing, Displays, Hardware, Accessories, Software), and stock level filter.
    - `WarehouseInventoryTable.tsx`: Table listing SKUs, on-hand available, reserved stock, reorder status, and "+ Restock 25" simulation.
    - `WarehouseSkeletons.tsx` & `WarehouseEmptyState.tsx`.
- **Pages & Route Architecture**:
  - `FulfillmentPage.tsx` at `/fulfillment` and `/app/fulfillment`.
  - `FulfillmentDetailPage.tsx` at `/fulfillment/:id` and `/app/fulfillment/:fulfillmentId`.
  - `WarehousesPage.tsx` at `/warehouses` and `/app/warehouses`.
  - `WarehouseDetailPage.tsx` at `/warehouses/:id` and `/app/warehouses/:warehouseId`.
  - `route-config.tsx`: Configured with root shortcut redirects, detail routes, and role-based permissions (`['ADMIN', 'WAREHOUSE_OPS', 'SALES_MANAGER', 'SALES_REP', 'FINANCE']`).
  - `Sidebar.tsx`: Added Warehouses and updated Fulfillment links under Operations.
- **Cross-Module Integrations**:
  - **Quotation Integration**: In `QuotationBuilder.tsx`, when quotation status is approved or confirmed, added prominent **"Proceed to Fulfillment 📦"** button that initializes a fulfillment order and routes the user directly to the order workspace.
  - **Deal Integration**: In `DealOverview.tsx`, linked fulfillment status banner with direct **"View Fulfillment →"** button.
  - **Quotation Fulfillment Route**: `QuotationFulfillmentPage.tsx` automatically redirects to the authoritative fulfillment order.
- **Build & Dev Server Verification**:
  - `npm run build` (`tsc -b && vite build`) passed with 0 errors in 8.21s.
  - Dev server running smoothly on `http://127.0.0.1:3000`.

### [Update - 2026-09-05 / Session #9: Frontend Phase 7 — Billing, Invoicing & Subscriptions]
- **Billing Data Models & Types (`src/types/billing.types.ts` & `src/types/index.ts`)**:
  - Defined `InvoiceStatus` (`draft`, `pending`, `partially_paid`, `paid`, `overdue`, `cancelled`) and `SubscriptionStatus` (`trial`, `active`, `paused`, `past_due`, `cancelled`, `expired`).
  - Added models: `Invoice`, `InvoiceItem`, `Payment`, `Subscription`, `BillingSchedule`, `Milestone`, `BillingStats`, `InvoiceFilterOptions`, `SubscriptionFilterOptions`.
- **Authoritative API Layer & LocalStorage Persistence (`src/services/api/`)**:
  - `invoices.api.ts`: Pre-seeded 6 enterprise invoices (`INV-1024` Acme Corp, `INV-1023` XYZ Ltd, `INV-1025` Beta Industries, `INV-1026` Nexus Dynamics, `INV-1027` OmniCorp Global, `INV-1028` Quantum Dynamics) under key `dealflow_invoices_v2`. Real-time calculations for subtotal, 18% GST, shipping, balance reconciliation, and dunning logs.
  - `billing.api.ts`: Pre-seeded billing schedules `BS-1024` through `BS-1026` under key `dealflow_billing_schedules_v2` with financial realization statistics.
  - `subscriptions.api.ts`: Pre-seeded SaaS subscriptions `SUB-1024` through `SUB-1026` under key `dealflow_subscriptions_v2` with lifecycle timeline events.
- **TanStack Query Hooks (`src/hooks/`)**:
  - `useInvoices.ts`: `useInvoices()`, `useInvoice()`, `usePayments()`, `useRecordPayment()`, `useCreateInvoice()`, `useSendInvoice()`, `useSendPaymentReminder()`.
  - `useBilling.ts`: `useBillingStats()`, `useBillingSchedules()`, `useBillingSchedule()`, `useUpdateBillingSchedule()`.
  - `useSubscriptions.ts`: `useSubscriptions()`, `useSubscription()`, `usePauseSubscription()`, `useResumeSubscription()`, `useCancelSubscription()`.
- **Modular Component Suites**:
  - **Invoices Suite (`src/pages/invoices/components/`)**:
    - `InvoiceStatusBadge.tsx`: Badges for all 6 states with pulsing indicators and icons.
    - `InvoiceFilters.tsx`: Search, status, date range, and reset.
    - `InvoiceTable.tsx`: Full table with overdue countdowns, balance due, and action triggers.
    - `InvoiceHeader.tsx`: Master invoice metadata and action bar.
    - `InvoiceItems.tsx`: Line-item breakdown table.
    - `InvoiceSummary.tsx`: Subtotal, discount, 18% GST, shipping, and net balance calculation.
    - `PaymentStatus.tsx`: Dynamic reconciliation gauge bar (% paid).
    - `RecordPaymentDialog.tsx`: Modal to record bank transfers, cards, UPI, checks with balance validation.
    - `PaymentHistory.tsx`: Audit ledger of applied payment transactions.
    - `SendReminderDialog.tsx`: Overdue recovery notice dispatch modal.
    - `InvoiceSkeletons.tsx`: Loading skeletons and `InvoiceEmptyState`.
  - **Billing Suite (`src/pages/billing/components/`)**:
    - `BillingStats.tsx`: 6 KPI cards (Total Revenue, Outstanding, Overdue, Settled, Due Soon, MRR).
    - `BillingChart.tsx`: Recharts financial realization area chart (Revenue Billed vs Cash Collected).
    - `BillingScheduleTable.tsx`: Milestone & recurring schedule table with active status controls.
    - `BillingSkeletons.tsx`: Loading skeletons and `BillingEmptyState`.
  - **Subscriptions Suite (`src/pages/subscriptions/components/`)**:
    - `SubscriptionStatusBadge.tsx`: Badges for Active, Trial, Paused, Past Due, Cancelled, Expired.
    - `SubscriptionTable.tsx`: Tabular view with MRR, ARR, cycle, renewal date, and actions dropdown.
    - `SubscriptionCard.tsx`: Grid-mode card view with financial highlights and quick controls.
    - `SubscriptionHeader.tsx`: Detail view header with plan tier, source quote, and action controls.
    - `SubscriptionTimeline.tsx`: Milestone and event history timeline.
    - `SubscriptionSkeletons.tsx`: Loading skeletons and `SubscriptionEmptyState`.
- **Pages & Route Integrations**:
  - `InvoicesPage.tsx` at `/invoices` and `/app/invoices`.
  - `InvoiceDetailPage.tsx` at `/invoices/:id` and `/app/invoices/:invoiceId`.
  - `BillingPage.tsx` at `/billing` and `/app/billing`.
  - `SubscriptionsPage.tsx` at `/subscriptions` and `/app/subscriptions`.
  - `SubscriptionDetailPage.tsx` at `/subscriptions/:id` and `/app/subscriptions/:subscriptionId`.
  - Configured `route-config.tsx` with root shortcut redirects and role-guarded routes.
  - Added Subscriptions to `Sidebar.tsx` under Operations.
- **Cross-Module Integrations**:
  - `FulfillmentDetailPage.tsx`: Added **"🧾 Generate Invoice"** / **"🧾 View Invoice (INV-xxxx)"** action button and Invoice & Billing card in the cross-reference bar.
  - `DealOverview.tsx`: Added Commercial Invoicing card with invoice ID, payment status badge, and **"View Invoice →"** button.
  - `QuotationBillingPage.tsx`: Connected quote breakdown to live invoice and subscription contracts.
- **Build Verification**:
  - `npm run build` (`tsc -b && vite build`) passed with 0 errors in 9.32s.

### [Update - 2026-09-05 / Session #10: Frontend Phase 8 — Customer Portal & Negotiation]
- **Air-Gapped Customer Portal Security**:
  - Enforced strict air-gap between internal ERP and customer-facing portal: customers never see internal margins, COGS, cost prices, risk scores, approval flags, internal notes, warehouse distributions, or other customers' data.
  - Dedicated `CustomerPortalLayout` without internal ERP sidebars, breadcrumbs, or administrative controls.
- **Data Models & Types (`src/types/customerPortal.types.ts` & `src/types/index.ts`)**:
  - Defined `CustomerQuoteStatus` (`awaiting_response`, `viewed`, `negotiation_requested`, `changes_requested`, `accepted`, `rejected`, `expired`, `cancelled`).
  - Added models: `CustomerQuote`, `CustomerQuoteItem`, `CustomerQuoteVersion`, `CustomerQuoteVersionChange`, `NegotiationItemRequest`, `NegotiationRequest`, `CustomerTimelineEvent`.
- **Authoritative API Layer & LocalStorage Persistence (`src/services/api/`)**:
  - `customerPortal.api.ts`: Pre-seeded customer quotes (`portal_acme_1042` Acme Corp ₹12.39L, `portal_apex_1001_secure` Apex Logistics ₹15.22L with Version 2 revised quote, `portal_expired_demo` Legacy Enterprises expired) under key `dealflow_portal_quotes_v2` and activity logs under `dealflow_portal_activity_v2`.
  - Methods: `getCustomerQuote()`, `recordQuoteView()`, `acceptCustomerQuote()`, `rejectCustomerQuote()`, `requestQuoteChanges()`, `getCustomerQuoteActivity()`.
  - `negotiations.api.ts`: Backing for counter-offers under key `dealflow_negotiations_v2`. Methods: `getNegotiation()`, `submitNegotiation()`, `listNegotiations()`.
- **TanStack Query Hooks (`src/hooks/portal/`)**:
  - `useCustomerQuote(token)`, `useCustomerQuoteActivity(token)`, `useNegotiation(token)`.
  - `useRecordQuoteView()`, `useAcceptQuote()`, `useRejectQuote()`, `useSubmitNegotiation()`.
- **Modular Component Suite (`src/pages/portal/components/`)**:
  - `CustomerQuoteStatus.tsx`: Color-coded badges for all 8 customer-safe states with icons.
  - `CustomerQuoteHeader.tsx`: Header with quote number, customer details, validity countdown banner (with urgency notice if <= 5 days), sales rep contact pill, and Print/PDF button.
  - `CustomerQuoteItems.tsx`: Responsive line-items display (desktop table with product badges + mobile card view).
  - `CustomerPricingSummary.tsx`: Gross Subtotal, Volume Savings discount, 18% GST tax, Grand Total, and expandable Terms & Conditions.
  - `QuoteActions.tsx`: Floating action bar with `[ Request Changes / Propose Terms ]`, `[ Accept & Sign Agreement ]`, and `[ Decline ]`.
  - `AcceptQuoteDialog.tsx`: Digital sign-off dialog capturing Signatory Full Name, Corporate Email, Job Title, PO Number, and legally-binding agreement checkbox.
  - `RejectQuoteDialog.tsx`: Dialog requiring decline category selector and optional comments.
  - `NegotiationRequestForm.tsx`: Interactive form with item selection, target quantity & target unit price steppers, item-specific notes, and live calculation of counter-subtotal and delta difference.
  - `NegotiationSummary.tsx`: Summary card showing customer's requested terms and sales executive's response.
  - `CustomerNegotiationTimeline.tsx`: Clean, vertical connected timeline displaying safe commercial milestones.
  - `QuoteComparison.tsx`: Version 1 vs Version 2 diff highlighting price reductions, volume expansions, and net cost savings.
  - `QuoteExpiredState.tsx`: Expired notice screen with sales representative direct mail and phone contacts.
  - `PortalErrorState.tsx`: Secure fallback screen for invalid, truncated, or revoked tokens.
  - `CustomerQuoteSkeleton.tsx`: Pulse loading placeholders.
- **Pages & Route Integrations**:
  - `CustomerQuotePage.tsx` at `/portal/quote/:token`: Primary quote review workspace with auto-view recording, revision comparison, line items, and modal dialogs.
  - `NegotiationPage.tsx` at `/portal/quote/:token/negotiate`: Dedicated counter-offer submission workspace.
  - `QuoteConfirmationPage.tsx` at `/portal/quote/:token/confirmation`: Digital order receipt displaying confirmed totals, signatory confirmation, and 3-step fulfillment roadmap.
  - Configured `src/constants/routes.ts` and `src/routes/route-config.tsx`.
- **Build Verification**:
  - `npm run build` (`tsc -b && vite build`) passed with 0 errors in 8.96s.

### [Update - 2026-09-05 / Session #11: Frontend Phase 9 — Deal Health, Risk & Analytics Dashboard]
- **Key Decisions Made**:
  - Maintained strict backend-authoritative risk architecture: frontend visualizes and filters scores (0-100), health classifications (Healthy, At Risk, Critical), and risk levels (Low, Medium, High) without calculating or inventing scores on the client.
  - Implemented interactive clickable KPI cards allowing instant filtering by deal health status.
  - Built comprehensive cross-module navigation connecting Deal Health directly to Pipeline (`/app/pipeline/:dealId`), Quotations (`/app/quotations/:quotationId`), Approvals (`/app/approvals`), Fulfillment (`/app/fulfillment`), and Invoicing (`/app/invoices`).
- **Data Models & Types (`src/types/dealHealth.types.ts` & `src/types/index.ts`)**:
  - Defined `DealHealthStatus` (`HEALTHY`, `AT_RISK`, `CRITICAL`), `RiskLevel` (`LOW`, `MEDIUM`, `HIGH`), and `RiskType` (`DISCOUNT`, `MARGIN`, `STALLED`, `APPROVAL`, `PROBABILITY`, `FULFILLMENT`, `CUSTOMER_CREDIT`, `CUSTOMER_NEGOTIATION`).
  - Added models: `RiskSignal`, `DealHealthTimelineEvent`, `DealHealthDetail`, `DealHealthDashboardKPIs`, `DealHealthDistributionItem`, `DealHealthTrendPoint`, `PipelineHealthStage`, `MarginErosionDeal`, `DiscountRiskDeal`, `StalledDeal`, `ApprovalBottleneck`, `DealHealthFilterOptions`, `DealHealthDashboardData`.
- **Authoritative API Layer & LocalStorage Persistence (`src/services/api/dealHealth.api.ts`)**:
  - Stored under key `dealflow_deal_health_v2` with pre-seeded realistic enterprise deals (`deal-104` OmniCorp Critical 34/100, `deal-101` Acme At Risk 68/100, `deal-105` HyperScale At Risk 58/100, `deal-107` Nexus Critical 22/100, `deal-102` Vertex Healthy 88/100, `deal-103` PeakSoft Healthy 82/100, `deal-106` Quantum Healthy 96/100, `deal-108` Starlight Healthy 91/100).
  - Endpoints: `getDealHealthDashboard(filters)`, `getDealHealth(dealId)`, `getMetrics(quotationId)`, `getEvents(quotationId)`.
- **TanStack Query Hooks (`src/hooks/useDealHealth.ts`)**:
  - `useDealHealthDashboard(filters)`, `useDealHealthDetail(dealId)`, `useDealHealthMetrics(quotationId)`, `useDealHealthEvents(quotationId)`.
- **Modular Component Suites**:
  - **Primitives (`src/components/deal-health/`)**:
    - `DealHealthScore.tsx`: Radial circular SVG progress gauge with 0-100 score, status pill, and size variants (`sm`, `md`, `lg`).
    - `DealHealthBadge.tsx`: Color-coded pill badge for Healthy, At Risk, and Critical states.
    - `RiskBadge.tsx`: Low, Medium, High risk indicator.
    - `RiskSignal.tsx`: Telemetry signal alert with severity icon, category tag, title, description, detected timestamp, and metric delta indicator.
    - `RiskBreakdown.tsx`: Structured breakdown of active and resolved risk signals.
  - **Dashboard Suite (`src/pages/deal-health/components/`)**:
    - `HealthOverviewCards.tsx`: 8 interactive KPI cards (Total Active Deals, Healthy, At Risk, Critical, Stalled, Pipeline Value, Weighted Value, Average Health Score).
    - `HealthDistributionChart.tsx`: Recharts donut chart with Healthy / At Risk / Critical slices and center score.
    - `HealthTrendChart.tsx`: Recharts time-series area chart tracking health trends with 7D/30D/90D/6M/1Y filters.
    - `PipelineHealthChart.tsx`: Recharts bar chart mapping stages (Lead, Qualified, Proposal, Negotiation, Won, Lost) with deal value and health color; clicking stages navigates to `/app/pipeline`.
    - `MarginErosionChart.tsx`: Recharts bar chart showing original vs current margin drops and affected deals.
    - `DiscountRiskCard.tsx`: Average discount, peak discount, ceiling violations, and high-discount deal list.
    - `StalledDealsCard.tsx`: Dormant deals list (>= 7 days) with days count and "View Deal" CTAs.
    - `ApprovalBottleneckCard.tsx`: Manager & finance pending queues with longest waiting times.
    - `HighRiskDealsTable.tsx`: Full interactive high-risk table with row click navigation to `/app/deal-health/:dealId`.
    - `DealHealthFilters.tsx`: Search, health, risk, stage, owner, and time range toolbar.
    - `DealHealthSummary.tsx`: Summary card combining radial gauge, commercial parameters, and primary risk driver banner.
    - `DealHealthSignals.tsx`: Active telemetry sensor list for single deal inspection.
    - `DealHealthTimeline.tsx`: Chronological timeline of risk escalations, discount changes, and stage shifts.
    - `DealHealthSkeletons.tsx`: Skeleton loading and empty state handlers.
- **Pages & Route Integrations**:
  - `DealHealthPage.tsx` at `/app/deal-health` and shortcut `/deal-health`.
  - `DealHealthDetailPage.tsx` at `/app/deal-health/:dealId` and shortcut `/deal-health/:id`.
  - Upgraded `ReportsPage.tsx` at `/app/reports` and shortcut `/reports`.
  - Registered `ROUTES.APP.DEAL_HEALTH_DETAIL` in `src/constants/routes.ts`.
  - Configured `route-config.tsx` with role guards and redirects.
  - Linked `DealHealthSummary.tsx` in the Pipeline module directly to `/app/deal-health/:dealId`.
- **Current Status**:
  - Frontend Phase 9 fully implemented, verified, and passing build checks.
- **Build Verification**:
  - `npm run build` (`tsc -b && vite build`) passed with 0 errors in 9.87s.

### [Update - 2026-09-05 / Session #12: Frontend Phase 10 — Products, Pricing & Admin Configuration]
- **Key Decisions Made**:
  - Maintained strict backend-authoritative governance: Pricing rules, discount limits, gross margin floors, permissions, and validation rules remain backend-authoritative while the frontend delivers an enterprise-grade administration and configuration cockpit.
  - Built comprehensive product catalog management supporting physical items, SaaS recurring subscriptions, professional services, SKU variants (RAM/Storage/attributes), volume discount brackets, and multi-facility warehouse stock tracking.
  - Implemented interactive 2D Discount Governance Matrix detailing customer tier discount ceilings (Standard 5%, Silver 10%, Gold 15%, Enterprise 20%) alongside category limits (Hardware, Subscription, Service) and automated approval escalation paths.
  - Built full 6-role RBAC permission matrix across all 8 platform modules (`quotations`, `approvals`, `pipeline`, `fulfillment`, `invoicing`, `products`, `pricing`, `admin`) with fine-grained action checkboxes (`view`, `create`, `edit`, `delete`, `approve`, `export`).
  - Integrated full multi-category system settings management (Organization & Financial, Pricing & Approval automation SLAs, Notifications & Webhooks, Security & Sessions).
- **Data Models & Types (`src/types/`)**:
  - `product.types.ts`: Added `ProductStatus` (`ACTIVE`, `INACTIVE`, `ARCHIVED`), multi-warehouse stock map (`Record<string, number>`), lead times, tax rates, currency, and `ProductFilterOptions`.
  - `pricing.types.ts`: Defined `PricingRuleType`, `PricingRuleStatus`, `PricingRule`, `CustomerTierCode`, `PricingCustomerTier`, `DiscountGovernanceEntry`, `PricingOverviewStats`.
  - `admin.types.ts`: Defined `AdminUser`, `UserStatus`, `PermissionAction`, `PermissionModule`, `RolePermissionConfig`, `SystemSettings` (general, pricingAndApprovals, notifications, security), and `AuditActivityItem`.
  - `src/types/index.ts`: Re-exported pricing and admin types.
- **Authoritative API Services with LocalStorage Persistence (`src/services/api/`)**:
  - `products.api.ts`: LocalStorage persistence under `dealflow_products_v2` with 9 pre-seeded production catalog items, CRUD methods, search with multi-attribute filtering, and catalog metrics.
  - `pricing.api.ts`: LocalStorage persistence under `dealflow_pricing_rules_v2` and `dealflow_customer_tiers_v2`, pre-seeded rules (Blanket cap, Manager route, Dual signoff, Margin floor, Low-margin ceiling, Volume accelerator), customer tier configurations, and governance matrix.
  - `admin.api.ts`: LocalStorage persistence under `dealflow_admin_users_v2`, `dealflow_roles_permissions_v2`, `dealflow_system_settings_v2`, and `dealflow_audit_activity_v2` with immutable audit logging.
- **TanStack Query Hooks**:
  - `src/hooks/useProducts.ts`: `useProducts()`, `useProduct()`, `useProductMetrics()`, `useCreateProduct()`, `useUpdateProduct()`, `useDeleteProduct()`.
  - `src/hooks/usePricing.ts`: `usePricingOverview()`, `usePricingRules()`, `usePricingRule()`, `useCreatePricingRule()`, `useUpdatePricingRule()`, `useDeletePricingRule()`, `useTogglePricingRuleStatus()`, `useCustomerTiers()`, `useCustomerTier()`, `useUpdateCustomerTier()`, `useDiscountGovernanceMatrix()`.
  - `src/hooks/useAdmin.ts`: `useAdminUsers()`, `useAdminUser()`, `useCreateAdminUser()`, `useUpdateAdminUser()`, `useToggleUserStatus()`, `useRolePermissions()`, `useUpdateRolePermissions()`, `useSystemSettings()`, `useUpdateSystemSettings()`, `useAdminAuditLog()`.
- **Modular Component Suites**:
  - **Products Suite (`src/pages/products/components/`)**:
    - `ProductStatusBadge.tsx`: Status and type badges with glowing active indicators.
    - `ProductFilters.tsx`: Search input, category dropdown, type dropdown, status dropdown, and Table vs. Grid toggle.
    - `ProductTable.tsx`: Full table view with list price, cost, live gross margin %, discount ceilings, stock availability, and actions.
    - `ProductGrid.tsx`: Visual card catalog view with margin meters, stock units, and quick actions.
    - `ProductBasicInfoForm.tsx`: Product name, SKU, classification, lead time, and tags input.
    - `ProductPricingForm.tsx`: List price, standard cost, floor gross margin %, discount ceiling %, and quantity volume schedules.
    - `ProductVariantsManager.tsx`: Variant authoring modal and table for multi-attribute SKU configurations.
    - `ProductInventoryTab.tsx`: Multi-facility stock distribution across Mumbai Main Center, Kolkata East Depot, and Ahmedabad West Hub.
  - **Pricing Suite (`src/pages/admin/pricing/components/`)**:
    - `PricingOverviewStats.tsx`: 6 KPI metrics (Active Rules, Customer Tiers, Avg Discount %, Margin Compliance %, Pending Exceptions, Governance Mode).
    - `PricingRulesTable.tsx`: Priority-ordered rule table with status toggle and edit/delete actions.
    - `PricingRuleEditorDialog.tsx`: Modal dialog for creating and editing pricing rules.
    - `DiscountGovernanceMatrix.tsx`: 2D matrix displaying tier ceilings, category limits, and automated approval routing paths.
    - `CustomerTierTable.tsx`: Customer tier directory with spend qualifications and category limits.
    - `CustomerTierEditorDialog.tsx`: Modal for modifying tier ceilings and category rates.
  - **Admin Suite (`src/pages/admin/components/`)**:
    - `UsersTable.tsx`: User list with avatar initials, department, contact, last login, and status toggle.
    - `UserRoleEditorDialog.tsx`: Modal to update role, department, phone, and account status.
    - `CreateUserDialog.tsx`: Modal to onboard and provision workspace users.
    - `PermissionMatrix.tsx`: Interactive 6-role RBAC matrix mapping access across 8 platform modules.
    - `SystemSettingsForm.tsx`: Multi-category settings editor for organization, pricing, notifications, and security.
    - `AuditLogTable.tsx`: Immutable event ledger tracking administrative overrides and configuration changes.
- **Pages & Route Integrations**:
  - `ProductsPage.tsx` at `/app/products` and shortcut `/products`.
  - `NewProductPage.tsx` at `/app/products/new` and shortcut `/products/new`.
  - `ProductDetailPage.tsx` at `/app/products/:productId` and shortcut `/products/:id`.
  - `EditProductPage.tsx` at `/app/products/:productId/edit`.
  - `AdminPage.tsx` at `/app/admin` and shortcut `/admin`: Admin Command Center with 4 launch tiles and audit ledger.
  - `PricingPage.tsx` at `/app/admin/pricing` and shortcut `/admin/pricing`.
  - `PricingRulesPage.tsx` at `/app/admin/pricing/rules` and shortcut `/admin/pricing/rules`.
  - `CustomerTiersPage.tsx` at `/app/admin/pricing/customer-tiers` and shortcut `/admin/pricing/customer-tiers`.
  - `UsersPage.tsx` at `/app/admin/users` and shortcut `/admin/users`.
  - `RolesPage.tsx` at `/app/admin/roles` and shortcut `/admin/roles`.
  - `SettingsPage.tsx` at `/app/admin/settings` and shortcut `/admin/settings`.
  - Registered all routes in `src/constants/routes.ts` and `src/routes/route-config.tsx` with role guards.
- **Build Verification**:
  - `npm run build` (`tsc -b && vite build`) passed with 0 errors in 11.06s (2,589 modules transformed).
- **Current Status**:
  - All 10 Phases of DealFlow360 frontend are completely built, integrated, and verified!

### Phase 11 — Notifications, Audit Logs & Advanced UX (COMPLETED)
- **Unified TypeScript Definitions (`src/types/`)**:
  - `src/types/notification.types.ts`: 19 notification types across all lifecycle modules, priority levels (`HIGH`, `MEDIUM`, `LOW`), categories, `NotificationItem`, and dual-channel matrix preferences (`NotificationPreferences`).
  - `src/types/audit.types.ts`: 20 immutable audit action types, `AuditFieldDiff` before/after mutation diff contract, `AuditLogEntry`, and `AuditLogFilterOptions`.
  - `src/types/search.types.ts`: `SearchResultItem` multi-index record schema, `CommandItem` quick action schema.
  - `src/types/index.ts`: Re-exported all new notification, audit, and search contracts.
- **Authoritative API Services with LocalStorage Persistence (`src/services/api/`)**:
  - `notifications.api.ts`: LocalStorage persistence under `dealflow_notifications_v2` and `dealflow_notif_prefs_v2` with 8 realistic pre-seeded notifications, unread count queries, mark-read methods, simulated event dispatching, and preference updates.
  - `audit.api.ts`: LocalStorage persistence under `dealflow_audit_logs_v2` with pre-seeded immutable audit entries, before/after field mutations, search filtering, and append-only recording.
  - `search.api.ts`: Multi-index search engine querying live deals, quotations, products, customers, and invoices, plus recent search history under `dealflow_recent_searches_v2`.
- **Zustand State Stores & TanStack Query Hooks**:
  - `src/stores/notification.store.ts`: Dynamic notification state, unread badge counter, popover state, and simulated alert dispatches with instant toast notifications.
  - `src/stores/search.store.ts`: Command palette modal visibility state.
  - `src/hooks/useNotifications.ts`: TanStack Query hooks for alert feeds, unread count, single & batch read, deletion, and channel preferences.
  - `src/hooks/useAuditLogs.ts`: Query hooks for audit trail queries, single event inspection, and audit recording.
  - `src/hooks/useGlobalSearch.ts`: Debounced search query hook (`useGlobalSearch`) and recent search manager (`useRecentSearches`).
  - `src/hooks/useKeyboardShortcuts.ts`: Global hotkey listener registering `Ctrl+K` / `Cmd+K`, `Esc`, and sequential `G then D/P/Q/A/H/N/L` navigation.
- **Component Suites**:
  - **Notification Center Suite (`src/components/notifications/`)**:
    - `NotificationBell.tsx`: Top navbar bell with reactive unread badge counter (`99+` support), pulsating indicator, and click-outside dismissal.
    - `NotificationDropdown.tsx`: Dropdown drawer displaying top 5 unread alerts, instant "Mark all read" action, "+ Simulate Event" demo trigger, and deep linking.
    - `NotificationFilters.tsx`: Category tabs (`All`, `Unread`, `Approvals`, `Risk`, `Finance`, `Portal`, `Fulfillment`), search input, and priority selector.
    - `NotificationItem.tsx`: Single notification card with priority stripe, context icons, relative time, and deep link.
    - `NotificationPreferencesForm.tsx`: Matrix of Email vs In-App alert toggles with digest frequency selector (`REALTIME`, `DAILY`, `WEEKLY`).
  - **Audit Suite (`src/components/audit/`)**:
    - `AuditLogTable.tsx`: Full audit table with Timestamp, Actor, Action, Entity, Description, IP, and Inspect trigger.
    - `AuditFilters.tsx`: Search, Entity Type filter, Action filter, and JSON audit export trigger.
    - `AuditEventDetailsModal.tsx`: Inspection modal displaying actor metadata, IP, entity reference, and interactive Before vs. After field diff comparisons.
  - **Universal Activity Suite (`src/components/activity/`)**:
    - `ActivityTimeline.tsx`: Universal vertical activity timeline component with icon indicators, actor pills, timestamps, search, and expandable mutation diffs.
  - **Search & Command Palette Suite (`src/components/search/`)**:
    - `CommandPalette.tsx`: Global modal (`Ctrl+K`) with search bar, keyboard navigation (`↑`/`↓`/`Enter`), quick action commands (`+ New Quote`, `+ New Deal`, navigation shortcuts), and grouped entity search results.
    - `RecentSearches.tsx`: Clickable chips for recent search queries with clear trigger.
  - **Feedback & Primitives (`src/components/feedback/`)**:
    - `AttentionCenter.tsx`: Executive triage widget mounted on `/app/dashboard` with actionable queues (Approvals, Critical Deals, Negotiations, Overdue Invoices).
    - `ErrorBoundary.tsx`: Runtime exception containment wrapping application outlet.
    - `ConflictModal.tsx`: 409 concurrent edit conflict resolution.
- **Pages & Route Integrations**:
  - `NotificationsPage.tsx` at `/app/notifications` and redirect shortcut `/notifications`.
  - `AuditLogsPage.tsx` at `/app/audit-logs` and redirect shortcut `/audit-logs`.
  - `TopNavbar.tsx`: Integrated `CommandPalette` trigger (`🔍 Search... Ctrl+K`), `NotificationBell` with dropdown, and global `useKeyboardShortcuts()`.
  - `Sidebar.tsx`: Added `Notifications` with dynamic unread badge counter and `Audit Logs` under Backend.
  - `DashboardPage.tsx`: Mounted `AttentionCenter` triage widget.
  - `InternalLayout.tsx`: Wrapped `<Outlet />` inside `<ErrorBoundary>`.
- **Build Verification**:
  - `npm run build` (`tsc -b && vite build`) passed with 0 errors in 12.28s (2,619 modules transformed).
- **Current Status**:
  - All 11 Phases of DealFlow360 frontend are completely built, integrated, and production-verified!

### Phase 12 — Integration, Testing, Optimization & Final Hackathon Polish (COMPLETED)
- **Centralized Design Tokens (`src/constants/theme.ts`)**:
  - Centralized layout parameters (sidebar width, topbar height, radii), semantic deal health status colors (Healthy, At Risk, Critical), multi-level accessible risk definitions (🔴 Critical, 🟠 High, 🟡 Medium, 🟢 Low), quotation status tags, invoice statuses, and responsive breakpoints.
- **Route-Level Code Splitting & Performance Optimization**:
  - Converted all 28+ static page components in `src/routes/route-config.tsx` to dynamic `React.lazy()` chunks.
  - Wrapped `InternalLayout` and `CustomerPortalLayout` with `<Suspense fallback={<PageSkeleton />}>`.
  - Transformed monolithic JavaScript chunk from 1,766 kB down to a lean 573 kB core shell, loading route-specific chunks (3–30 kB) on-demand.
- **Network Resilience & Offline UX (`src/components/feedback/NetworkStatusBanner.tsx`)**:
  - Real-time online/offline event listener providing non-blocking feedback during connectivity disruptions and automatic reconnection confirmation with Odoo ERP. Mounted globally in `AppShell.tsx`.
- **Interactive Hackathon Golden Path Demo Tour (`src/components/layout/HackathonDemoTour.tsx`)**:
  - Interactive 14-stage guided walkthrough covering the complete golden path (Login → Dashboard → Pipeline → Deal → Quote → Risk → Approval → Customer Portal → Negotiation → Fulfillment → Billing → Deal Health → Notifications → Audit Trail).
  - Each step provides "WHAT happened", "WHY it matters", and "WHAT NEXT" actionable next steps with 1-click screen navigation.
  - Mounted on both `TopNavbar.tsx` (`🏆 Demo Tour`) and `DashboardPage.tsx` (`🏆 Start Hackathon Golden Path Demo`).
- **Executive Dashboard Polish (`src/pages/dashboard/DashboardPage.tsx`)**:
  - Added executive greeting banner (*"Good morning, Sales Operations Team"*), Pipeline Velocity Health vs. AI Deal Health comparison visual strip, Attention Center triage queue, and 1-click demo tour launcher.
- **Customer Portal Security UX Audit**:
  - Verified complete security isolation on `/portal/quote/:token`, `/portal/quote/:token/negotiate`, and `/portal/quote/:token/confirmation` ensuring zero exposure of internal margins, cost prices, risk scores, or internal notes.
- **Build & Verification**:
  - `npm run build` (`tsc -b && vite build`) passed with 0 errors in 9.10s (2,623 modules transformed into optimized split chunks).
- **Current Status**:
  - All 12 Phases of DealFlow360 frontend are 100% complete, fully integrated, and production-ready for the hackathon!






