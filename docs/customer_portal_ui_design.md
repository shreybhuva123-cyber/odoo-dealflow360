# DealFlow360 — Customer Portal UI/UX Specification (Phase 2)
**Version:** 1.0.0  
**Domain:** Customer Portal — Enterprise B2B SaaS Experience  
**Design Standard:** Modern High-Trust FinTech / Enterprise B2B (Stripe, Ramp, Ironclad, Carta style)  
**Target Viewports:** Desktop (1440px+ primary, 1024px responsive), Tablet (768px - 1023px), Mobile Responsive (375px+)  

---

## Executive Summary & Design System Foundations

DealFlow360 Customer Portal is designed as a standalone, high-trust external portal for enterprise decision-makers, procurement leads, and CFOs. It avoids standard generic ERP layouts, providing an intentional, polished B2B SaaS deal-closing experience.

### Design System Tokens:
- **Color Palette:**
  - **Brand Primary:** Deep Obsidian Slate (`#0B0F19`), Midnight Blue (`#0F172A`)
  - **Accent / Interactive:** Electric Indigo (`#4F46E5`), Sapphire Glow (`#6366F1`)
  - **Surfaces & Backgrounds:** Canvas Neutral (`#F8FAFC`), Card Surface (`#FFFFFF`), Border Subtle (`#E2E8F0`), Border Active (`#CBD5E1`)
  - **Status Accents:**
    - Published / Active: Brand Indigo (`#4F46E5` / `#EEF2FF`)
    - In Negotiation / Review: Amber Gold (`#D97706` / `#FFFBEB`)
    - Approved / Signed: Emerald Green (`#059669` / `#ECFDF5`)
    - Rejected / Cancelled: Crimson Rose (`#DC2626` / `#FEF2F2`)
    - Expired: Slate Muted (`#64748B` / `#F1F5F9`)
- **Typography:**
  - Font Family: `Inter`, system fallback `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`
  - Numbers / Currency: Tabular figures enabled (`font-variant-numeric: tabular-nums`) for perfect alignment across quote line items.
- **Layout Architecture:**
  - **Global Sidebar:** 260px fixed width (collapsible to 72px icon rail), featuring Company Branding, Deal Navigation, Quotations, Activity Center, and Support.
  - **Sticky Top Bar:** Breadcrumb trail, Global Quote Search (`Cmd + K`), Notification Bell with live unread badge counter, and Customer Profile & Entity Switcher.
  - **Split-Pane & Drawer Paradigm:** Heavy use of non-destructive right-hand side drawers (Slide-overs) for comments, change requests, and diff comparisons to maintain document context.

---

## 1. Screen 1: Customer Login

### 1.1 Route
`/portal/login`

### 1.2 Purpose
Secure entry gate for customer stakeholders. Offers multi-tenant authentication via email/password or passwordless magic link with high security and enterprise branding.

### 1.3 UI Components
- Split-screen layout (Left: Branded customer enterprise testimonial & deal security certifications like SOC2 / ISO27001; Right: Minimalist, clean card login interface).
- DealFlow360 Vector Monogram & Client Organization Name badge.
- Email input field with regex validation and domain auto-suggest.
- Password input field with reveal toggle (`EyeOff` / `Eye` icon).
- "Sign in with Magic Link" alternative tab.
- "Remember this device for 30 days" checkbox.
- "Forgot password?" hyperlink.
- Primary CTA Button: "Access DealFlow Portal" with loading spinner state.
- Security footer: "256-bit TLS encryption • Single Tenant Isolation".

### 1.4 Data Displayed
- Tenant/Deal workspace context if accessed via quote invitation link (e.g., "Sign in to review Quote from Acme Corp").
- Validation helper text and lockout countdowns if rate-limited.

### 1.5 User Actions
- Input credentials and submit.
- Request magic link email.
- Toggle password visibility.
- Navigate to self-service password reset.

### 1.6 API Calls
- `POST /api/v1/portal/auth/login` (Body: `{ "email": "...", "password": "..." }`)

### 1.7 Loading State
Button text swaps to indeterminate SVG spinner; inputs disabled; submit button opacity drops to 0.7.

### 1.8 Empty State
Clean empty form inputs with autofocus on the email input field.

### 1.9 Error State
- Inline input border turns crimson (`#DC2626`).
- Toast notification / Alert callout banner at the top of the form: "Invalid email or password. 4 attempts remaining before temporary lockout."

### 1.10 Success State
Button flashes emerald checkmark, smooth fade transition into `/portal/dashboard` or deep-linked quote URL.

### 1.11 Security Restrictions
- Public route. Redirects to `/portal/dashboard` if valid JWT exists in memory.
- Rate-limited to 5 attempts per 10 minutes per IP/Email.

---

## 2. Screen 2: Customer Dashboard

### 2.1 Route
`/portal/dashboard`

### 2.2 Purpose
Executive overview of the customer company's entire commercial relationship: active quotes requiring action, quotes in negotiation, pending approvals, and historical orders.

### 2.3 UI Components
- **Top Welcome Header:** "Welcome back, Sarah. Cyberdyne Defense Systems commercial overview."
- **KPI Summary Cards (4-Column Grid):**
  1. *Action Required:* Number of quotes in `sent` status awaiting review.
  2. *In Active Negotiation:* Quotes currently under seller or manager review.
  3. *Total Pipeline Value:* Aggregate monetary sum of active deals (USD).
  4. *Approved / Contracts Active:* Executed agreements count.
- **Urgent Action Banner:** Highlights quotes expiring within 48 hours with direct "Review & Sign" CTA.
- **Recent Activity Feed Widget:** Timeline showing seller replies, new revisions published, and status changes.
- **Dedicated Account Executive Card:** Alex Mercer (Photo, Email, Phone, Direct "Message Rep" CTA).
- **Recent Quotations Data Table:** Mini-table displaying the 5 latest quotes with quick preview links.

### 2.4 Data Displayed
- Commercial partner name, user full name, signatory badge (`"Authorized Signatory"`).
- Metrics derived from quote aggregation.
- Sales representative contact card.
- Live timestamp of last account synchronization.

### 2.5 User Actions
- Click KPI cards to navigate directly to filtered quote list (`/portal/quotes?status=...`).
- Click "Review & Act" on expiring quote banner.
- Click "Schedule Call" or "Message" on the Account Rep card.
- Click any recent quote row to open Quote Details.

### 2.6 API Calls
- `GET /api/v1/portal/auth/me`
- `GET /api/v1/portal/quotes?page=1&per_page=5&sort_by=-created_at`
- `GET /api/v1/portal/notifications?unread_only=true`

### 2.7 Loading State
Full skeleton layout: shimmering grey rectangles for KPI cards, table rows, and activity feed cards.

### 2.8 Empty State
If the customer has zero quotes:
- Clean vector illustration of a clean desk.
- Headline: "No Active Proposals Yet".
- Body: "Your account executive Alex Mercer is preparing your initial proposal. You will receive an email as soon as it is published."
- Secondary action: "Email Account Executive".

### 2.9 Error State
- Banner callout: "Unable to load dashboard metrics. [Retry]".
- Cached local state shown with a "Stale data" badge if network drops.

### 2.10 Success State
Smooth presentation of all metrics with animated counter transitions (`0 -> $107,400.00`).

### 2.11 Security Restrictions
- Protected route: Requires valid JWT. Redirects to `/portal/login` on `401`.
- Tenant boundary: Displays strictly company-level (`commercial_partner_id`) quotes.

---

## 3. Screen 3: My Quotations

### 3.1 Route
`/portal/quotes`

### 3.2 Purpose
Comprehensive, filterable, and searchable list of all commercial quotes, proposals, and contracts associated with the customer's organization.

### 3.3 UI Components
- **Filter Tabs (Pills):** "All (8)", "Action Required (2)", "In Negotiation (1)", "Approved (4)", "Archived / Expired (1)".
- **Search & Filter Bar:**
  - Search input: Filter by Quote ID (`QUO-2026-0048`), Title, or Sales Rep name.
  - Date range picker.
  - Min/Max Amount filter.
  - Sort dropdown: "Newest first", "Expiring soonest", "Amount: High to Low".
- **Quotes Data Grid / Table:**
  - Columns: Quote #, Proposal Title, Version/Revision, Total Amount, Issue Date, Expiration, Status Badge, Assigned Rep, Quick Action Button.
- **Pagination Bar:** Page numbers, per-page selector (10, 25, 50), total items count indicator.

### 3.4 Data Displayed
- Quote ID, title, revision number, status badge (`sent`, `in_negotiation`, `approved`, etc.).
- Formatted financial totals (e.g. `$107,400.00 USD`).
- Relative expiration label (e.g. `"Expires in 3 days"` highlighted in amber).

### 3.5 User Actions
- Filter by status pill.
- Type in search input (debounced by 300ms).
- Click quote row to navigate to `/portal/quotes/{quote_id}`.
- Click table row 3-dots action menu: "Download PDF", "View Revisions", "Copy Link".
- Change pagination page or page size.

### 3.6 API Calls
- `GET /api/v1/portal/quotes?status={status}&search={search}&page={page}&per_page={per_page}&sort_by={sort}`

### 3.7 Loading State
Table shows 8 pulsing shimmer skeleton rows with identical column dimensions.

### 3.8 Empty State
- When no quotes match filter: "No quotes found matching 'Cloud Migration'. [Clear Filters]".
- When account has no quotes at all: Friendly onboarding illustration and rep contact info.

### 3.9 Error State
- Table body replaced with error state container: "Failed to retrieve quotations. [Retry Connection]".
- Inline alert with error code (`QUOTE_FETCH_FAILED`).

### 3.10 Success State
Interactive grid renders with status color badges and hover row highlights.

### 3.11 Security Restrictions
- Protected route. Restricts all rows to the authenticated user's company account.

---

## 4. Screen 4: Quotation Details

### 4.1 Route
`/portal/quotes/{quote_id}`

### 4.2 Purpose
The central commercial document review screen where customer executives examine line items, technical deliverables, pricing schedules, discounts, legal terms, and take direct action (Accept, Negotiate, or Decline).

### 4.3 UI Components
- **Top Command Bar:**
  - Back to Quotes button (`← All Quotes`).
  - Quote Reference (`QUO-2026-0048 • Rev 1`).
  - Status Tag (`Awaiting Your Review`).
  - Secondary Actions: "Download PDF", "View History (1)", "Discussion (3)".
  - Primary Action Cluster:
    - "Decline Quote" (Destructive outline button).
    - "Negotiate / Request Changes" (Secondary Indigo button).
    - "Accept & Sign Quote" (Primary Emerald CTA with lock/signature icon).
- **Document Header Card:** Deal title, Issued Date, Expiration Date, Buyer Entity, Seller Entity, Lead Account Executive.
- **Line Items Table:**
  - Product/Service name, detailed specification, Quantity, UoM, Unit Price, Tax %, Subtotal.
- **Terms & Pricing Summary Card (Split Column):**
  - Left: Payment Terms, Delivery Schedule, SLA Tiers, Special Stipulations.
  - Right: Subtotal, Line Discounts, Global Counter-Discounts, Taxes, **Total Contract Value**.
- **Collapsible Activity & Clarification Sidebar:** Slides out to view comment stream without obscuring line items.

### 4.4 Data Displayed
- Complete quote breakdown matching Section 6.6 of the API contract.
- Authorized signatory indicator on "Accept & Sign" button (disabled with tooltip if `can_sign_quotes: false`).

### 4.5 User Actions
- Inspect individual line item descriptions.
- Click "Download PDF" to trigger direct binary download (`GET /pdf`).
- Click "Accept & Sign Quote" to open Screen 10 (Confirmation & E-Sign Modal).
- Click "Negotiate / Request Changes" to open Screen 5 (Negotiation Workspace).
- Click "Decline Quote" to open Rejection reason dialog.
- Open Discussion drawer to post inline questions to the sales rep.

### 4.6 API Calls
- `GET /api/v1/portal/quotes/{quote_id}`
- `GET /api/v1/portal/quotes/{quote_id}/pdf`

### 4.7 Loading State
Structured document skeleton: top bar skeleton, metadata card placeholder, multi-row table shimmer, pricing box shimmer.

### 4.8 Empty State
N/A (If quote not found, redirects to Screen 12: Error/Expired Quote).

### 4.9 Error State
- If ID does not exist or unauthorized: Renders Screen 12 or Screen 13 with clean back navigation.
- If network error: Toast error "Failed to sync quotation details. [Retry]".

### 4.10 Success State
Full high-fidelity document rendered with crisp typography and clear visual hierarchy.

### 4.11 Security Restrictions
- Multi-tenant boundary check: If `quote.commercial_partner_id != current_user.commercial_partner_id`, returns `404 Not Found`.
- Signatory Guard: "Accept & Sign" button is enabled only if `user.can_sign_quotes === true`. If false, displays: "Read-only: Contact Sarah Connor to execute agreement."

---

## 5. Screen 5: Negotiation Workspace

### 5.1 Route
`/portal/quotes/{quote_id}/negotiate` (or Modal/Split-View on Desktop)

### 5.2 Purpose
Dedicated collaborative workspace allowing the customer to construct a structured counter-proposal (combining scope changes, line item quantity adjustments, and commercial counter-discounts) without losing sight of the active quote.

### 5.3 UI Components
- **Split-Screen Layout:**
  - **Left Pane (55%):** "Active Proposal Reference" — View-only current quote line items and pricing summary.
  - **Right Pane (45%):** "Your Proposed Terms" — Interactive negotiation builder.
- **Negotiation Mode Selector (Tabs):**
  1. *Commercial Counter-Discount:* Propose overall percentage or lump-sum budget target.
  2. *Scope / Line Item Adjustments:* Adjust quantities, remove non-essential line items.
  3. *Terms & Delivery:* Request changes to Net 30, warranty, or implementation milestones.
- **Projected Financial Impact Widget:** Live calculator showing Original Total (`$107,400.00`), Proposed Total (`$96,660.00`), Delta (`-$10,740.00 / -10.0%`).
- **Customer Executive Justification Box:** Textarea for business rationale ("Executive spend cap", "Timeline compression").
- **Action Footer:** "Cancel & Discard", "Save Draft", "Submit Counter-Proposal to Sales Team".

### 5.4 Data Displayed
- Baseline quote numbers alongside dynamically computed counter-offer numbers.
- Escalation indicator: "Proposals with discounts > 15% require 2-tier internal executive sign-off (est. 24h turnaround)."

### 5.5 User Actions
- Toggle between Counter-Discount and Scope Change modes.
- Enter target budget amount or percentage slider.
- Modify line item quantities.
- Type justification notes.
- Submit the negotiation package.

### 5.6 API Calls
- `GET /api/v1/portal/quotes/{quote_id}`
- `POST /api/v1/portal/quotes/{quote_id}/negotiation/counter-discount`
- `POST /api/v1/portal/quotes/{quote_id}/negotiation/change-request`

### 5.7 Loading State
Calculation widgets display subtle pulse animation while recalculating taxes and subtotals.

### 5.8 Empty State
Clean form inputs pre-populated with active quote baseline numbers.

### 5.9 Error State
- Validation errors: "Requested discount cannot exceed 90%", "Quantity must be greater than or equal to 0".
- Backend conflict error (`409 NEGOTIATION_ALREADY_ACTIVE`): Banner alert informing user a proposal is already pending review.

### 5.10 Success State
Submission triggers Screen 12 / Negotiation Active Banner, redirects to Quote Details with badge updated to `In Negotiation`.

### 5.11 Security Restrictions
- Only active quotes (`status === 'sent'`) can enter negotiation. Expired, approved, or rejected quotes have negotiation disabled.

---

## 6. Screen 6: Line-Level Discussion

### 6.1 Route
`/portal/quotes/{quote_id}/discussion` (or Slide-Over Drawer on `/portal/quotes/{quote_id}`)

### 6.2 Purpose
Threaded contextual discussion drawer allowing customer stakeholders to ask technical, commercial, and delivery questions directly to the assigned account team without switching to email.

### 6.3 UI Components
- **Slide-Over Header:** "Quote Discussion • QUO-2026-0048", Active participants avatars (Sarah Connor, Alex Mercer).
- **Line Item Context Pill:** Optional badge linking a comment to a specific line item (e.g. `Regarding: On-Site Training Workshop`).
- **Threaded Message Stream:**
  - Customer messages (Right-aligned, Brand Indigo background, user avatar, timestamp).
  - Sales team messages (Left-aligned, Light Slate background, verified account executive badge).
  - System messages (Centered, subtle grey text: "Revision #2 published", "Counter-discount submitted").
- **Attachment Preview Chips:** File icon, filename, size, download button.
- **Rich Message Composer:**
  - Expanding textarea with markdown support (bold, bullets, links).
  - Attachment upload button (`Paperclip` icon).
  - Line item selector dropdown ("Tag a specific line item").
  - Primary "Send Message" button (`Cmd + Enter` shortcut).

### 6.4 Data Displayed
- Chronological comment threads matching Section 6.15 of the API contract.
- File attachment metadata (name, MIME type, size).
- Sales rep online/response status ("Alex Mercer typically replies in under 1 hour").

### 6.5 User Actions
- Type and send comment.
- Tag a line item for targeted feedback.
- Drag-and-drop or browse files (PDF, PNG, DOCX up to 25MB).
- Download attachments.
- Reply directly to a specific comment thread.

### 6.6 API Calls
- `GET /api/v1/portal/quotes/{quote_id}/comments`
- `POST /api/v1/portal/quotes/{quote_id}/comments`
- `POST /api/v1/portal/quotes/{quote_id}/attachments`

### 6.7 Loading State
Shimmering message bubbles with alternating left and right alignments.

### 6.8 Empty State
- Illustration of a chat bubble with a pencil.
- Headline: "No comments yet".
- Body: "Have a question about deliverables, SLA, or pricing? Post a message here to start a direct thread with your account executive."

### 6.9 Error State
- Red exclamation mark next to unsent message: "Failed to deliver. [Retry]".
- File upload error: "File exceeds 25MB limit" or "Unsupported file format".

### 6.10 Success State
New message appends with smooth scroll-to-bottom animation and subtle delivery checkmark.

### 6.11 Security Restrictions
- Only authenticated contacts belonging to the deal's commercial partner can view or post comments.
- Internal seller chatter is strictly filtered out at the API level (zero leak).

---

## 7. Screen 7: Change Request

### 7.1 Route
`/portal/quotes/{quote_id}/change-request` (Slide-over drawer or standalone modal)

### 7.2 Purpose
Focused interface for requesting specific alterations to technical line items, quantities, deliverables, or payment milestones.

### 7.3 UI Components
- **Header:** "Submit Scope Change Request — QUO-2026-0048".
- **Editable Line Items Grid:**
  - Product / Line description.
  - Current Quantity (read-only reference).
  - Requested Quantity (numeric stepper or input).
  - Reason per item (e.g., "Scaling down initial rollout", "Phased implementation").
- **Contract Terms Adjustments Section:**
  - Dropdown: "Payment Terms", "Delivery Schedule", "Warranty Period".
  - Textarea: Requested modification.
- **Impact Summary Box:**
  - Real-time delta estimation: Current subtotal vs. Estimated new subtotal.
- **Justification Note Input:** Textarea required for executive approval review.
- **Action Buttons:** "Cancel", "Submit Change Request".

### 7.4 Data Displayed
- Current line items, unit prices, and quantities from the active quote revision.
- Projected subtotal calculations.

### 7.5 User Actions
- Change line quantities with increment/decrement stepper.
- Delete optional line item (sets quantity to 0).
- Enter specific reason for change.
- Submit change request to seller.

### 7.6 API Calls
- `POST /api/v1/portal/quotes/{quote_id}/negotiation/change-request`

### 7.7 Loading State
Submit button displays progress spinner; inputs temporarily disabled to prevent duplicate submissions.

### 7.8 Empty State
Line items default to the currently published quote values.

### 7.9 Error State
- Field validation: "Please enter a reason for modifying training workshops".
- API Error (`422`): "Mandatory base license line item cannot be removed".

### 7.10 Success State
Drawer closes; quote detail page displays amber alert banner: "Scope Change Request Submitted — Under Review by Alex Mercer".

### 7.11 Security Restrictions
- Available only on `sent` quotes with no other pending negotiations active.

---

## 8. Screen 8: Counter Discount

### 8.1 Route
`/portal/quotes/{quote_id}/counter-discount` (Modal Dialog / Drawer)

### 8.2 Purpose
Dedicated commercial counter-pricing modal where customer procurement leads submit formal price discount proposals or target spend limits.

### 8.3 UI Components
- **Modal Header:** "Propose Commercial Counter-Offer".
- **Current Financial Snapshot Card:** Current Total: `$107,400.00 USD`.
- **Proposal Input Mode Toggle:**
  - Option A: *Percentage Discount* (e.g. `10.0%`).
  - Option B: *Target Lump-Sum Price* (e.g. `$96,660.00`).
- **Interactive Discount Slider & Number Input:** Dual-bound slider (0% to 30%) with currency input.
- **Projected Savings Display:** Highlights customer savings (`Save $10,740.00`).
- **Budget Justification Textarea:** "Please explain your budget constraint or rationale".
- **Concession / Compromise Checkboxes:**
  - "Willing to commit to multi-year term"
  - "Willing to accept accelerated payment terms (Net 15)"
  - "Ready to sign immediately if approved"
- **Action Buttons:** "Cancel", "Submit Counter-Offer".

### 8.4 Data Displayed
- Real-time projected price, tax recalculations, and total contract value.
- Turnaround estimation badge: "Typically reviewed within 24 hours".

### 8.5 User Actions
- Drag slider or enter exact percentage or dollar amount.
- Select compromise checkboxes.
- Input budget justification notes.
- Submit offer.

### 8.6 API Calls
- `POST /api/v1/portal/quotes/{quote_id}/negotiation/counter-discount`

### 8.7 Loading State
Recalculation loading spinner inside savings badge; submit button in loading state upon click.

### 8.8 Empty State
Form initialized with 0% discount and current quote total.

### 8.9 Error State
- Client validation: "Discount cannot be 0% or negative", "Discount cannot exceed 50% without executive sponsor pre-clearance".
- API Error (`409`): "Active counter-discount already awaiting seller response".

### 8.10 Success State
Modal transitions into a success screen: "Counter-offer submitted to Alex Mercer. Track approval status on the quote details page."

### 8.11 Security Restrictions
- Restricted to users with active portal sessions on quotes in `sent` status.

---

## 9. Screen 9: Quote Revision History

### 9.1 Route
`/portal/quotes/{quote_id}/revisions`

### 9.2 Purpose
Audit trail and version comparison screen allowing customers to review previous iterations of the quote, inspect price changes, and run side-by-side diff comparisons.

### 9.3 UI Components
- **Header:** "Revision History • QUO-2026-0048".
- **Timeline Rail (Left Column):**
  - Revision cards ordered descending (Revision #2 [Current], Revision #1 [Initial]).
  - Attributes on each card: Published Date, Author, Change Summary, Total Value.
  - "Compare" radio selectors to select two revisions for diff analysis.
- **Side-by-Side Diff View (Right Column / Modal):**
  - **Financial Summary Diff:** Base Revision Total vs. Target Revision Total with green/red variance pill (`-$7,500.00 (-7.0%)`).
  - **Line Items Diff Table:**
    - Highlighted rows: Green background for added items, Red strikethrough for removed items, Amber for quantity/price adjustments.
  - **Terms & Deliverables Diff:** Side-by-side text difference for modified payment terms or milestones.
- **Action Buttons:** "Download Historical PDF", "Set as Comparison Base", "Return to Current Revision".

### 9.4 Data Displayed
- Revision number, author, creation timestamp, summary of changes.
- Exact line-by-line additions, deletions, and adjustments matching Section 6.14 of the API contract.

### 9.5 User Actions
- Click a revision card to view historical snapshot.
- Select two revisions and click "Compare Revisions".
- Download PDF of historical revision.

### 9.6 API Calls
- `GET /api/v1/portal/quotes/{quote_id}/revisions`
- `GET /api/v1/portal/quotes/{quote_id}/revisions/{revision_id}/diff?base_revision_id={base_id}`

### 9.7 Loading State
Timeline rail displays grey placeholder nodes; diff view displays skeleton comparison tables.

### 9.8 Empty State
If quote is Revision #1 (no prior revisions):
- Informational card: "Original Revision. No prior versions exist for this quotation."

### 9.9 Error State
- Banner: "Unable to load revision comparison. [Retry]".

### 9.10 Success State
Interactive side-by-side diff clearly highlights every numerical and textual variance.

### 9.11 Security Restrictions
- Partner isolation applies; only historical revisions of authorized quotes are viewable.

---

## 10. Screen 10: Confirmation Screen (E-Signature Modal)

### 10.1 Route
`/portal/quotes/{quote_id}/accept` (Full-Screen Modal Overlay)

### 10.2 Purpose
The formal legal acceptance screen where authorized customer executives review final binding terms, provide purchase order numbers, execute their digital signature, and confirm agreement.

### 10.3 UI Components
- **Modal Container:** Centered high-trust dialog with backdrop blur (`backdrop-filter: blur(8px)`).
- **Executive Contract Summary:**
  - Quote Number, Organization, Total Binding Amount (`$107,400.00 USD`).
  - Payment Terms (`Net 30`), Delivery Milestones.
- **Purchase Order (PO) Number Field:** Optional text input (`PO-CYBER-9910`) for corporate accounting matching.
- **Legal Signer Information Fields:**
  - Signatory Full Name (pre-filled from profile, editable).
  - Corporate Title (e.g., "Chief Technology Officer").
  - Corporate Email (read-only verification).
- **Interactive Signature Pad:**
  - Tab 1: *Draw Signature* (Smooth HTML5 Canvas with clear button).
  - Tab 2: *Type Signature* (Stylized script font rendering).
  - Tab 3: *Upload Signature Image* (PNG/JPG signature file dropzone).
- **Legal Compliance Checkbox:**
  - Mandatory checkbox: "I confirm that I am authorized to bind Cyberdyne Defense Systems and accept the Master Services Agreement and terms outlined herein."
- **Audit Footprint Notice:** "Your IP address (198.51.100.42) and UTC timestamp will be cryptographically logged with this signature."
- **Action Buttons:** "Review Quote Again (Cancel)", "Confirm & Legally Execute Agreement" (Primary Emerald CTA with lock icon).

### 10.4 Data Displayed
- Quote summary, total price, pre-filled user contact info, client IP address, and legal agreement text.

### 10.5 User Actions
- Draw or type signature on canvas.
- Input title and PO number.
- Check legal compliance box.
- Click "Confirm & Legally Execute Agreement".

### 10.6 API Calls
- `POST /api/v1/portal/quotes/{quote_id}/accept`
  - Header: `Idempotency-Key: <UUIDv4>`
  - Body: `{ signer_name, signer_title, signature_type, signature_data, accepted_terms, purchase_order_number }`

### 10.7 Loading State
Button displays "Sealing Agreement & Generating Sales Order..."; spinner active; modal backdrop locked.

### 10.8 Empty State
Signature canvas cleared; checkbox unchecked; submit button disabled until valid signature + checkbox provided.

### 10.9 Error State
- Inline alerts: "Signature is required", "You must accept the terms to proceed".
- Backend conflict error (`409`): "Quote has expired or was already signed by another party".

### 10.10 Success State
Transitions seamlessly into Screen 11 (Confirmation Success).

### 10.11 Security Restrictions
- Strict Signatory Guard: Evaluates `user.can_sign_quotes`. If `false`, access to this screen is blocked with Screen 13 (Access Denied).
- Idempotency key required to prevent accidental double-billing or duplicate sales order creation.

---

## 11. Screen 11: Confirmation Success

### 11.1 Route
`/portal/quotes/{quote_id}/confirmed`

### 11.2 Purpose
Celebratory, high-trust confirmation screen acknowledging contract execution, providing the sales order reference, downloading signed documents, and outlining next onboarding steps.

### 11.3 UI Components
- **Celebratory Status Badge:** Animated emerald checkmark icon with subtle celebration confetti particle effect.
- **Headline:** "Agreement Successfully Executed!"
- **Subtitle:** "Quote QUO-2026-0048 has been converted into confirmed Sales Order **SO-2026-1184**."
- **Execution Receipt Card:**
  - Executed by: Sarah Connor (CTO, Cyberdyne Defense Systems)
  - Date/Time: September 5, 2026 • 10:42 UTC
  - Total Contract Value: `$107,400.00 USD`
  - Purchase Order Reference: `PO-CYBER-9910`
  - Audit Trail ID: `cnf_381902`
- **Immediate Deliverables Action Box:**
  - Primary Button: "Download Counter-Signed Agreement (PDF)" (`GET /pdf?version=final_signed`).
  - Button: "Add Delivery Milestones to Calendar (.ics)".
- **Next Steps Roadmap:**
  - Step 1: Automated confirmation email dispatched to sarah.connor@cyberdyne-defense.com (Completed).
  - Step 2: Implementation kickoff meeting scheduling by Alex Mercer (Within 1 business day).
  - Step 3: Enterprise license provisioning & access credentials email (Within 2 business days).
- **Navigation Footer:** "Go to Customer Dashboard", "View All Quotes".

### 11.4 Data Displayed
- Confirmation receipt data returned from `POST /accept` API response matching Section 5.7.

### 11.5 User Actions
- Download finalized signed contract PDF.
- Copy confirmation number to clipboard.
- Navigate to dashboard or orders list.

### 11.6 API Calls
- `GET /api/v1/portal/quotes/{quote_id}/pdf?version=final_signed`

### 11.7 Loading State
N/A (Rendered directly with data passed from successful acceptance action).

### 11.8 Empty State
N/A

### 11.9 Error State
If user directly navigates to this URL on an unsigned quote: Redirects to `/portal/quotes/{quote_id}`.

### 11.10 Success State
Permanent confirmation state viewable anytime by visiting the executed quote.

### 11.11 Security Restrictions
- Partner isolation enforced. Only authorized signatories and company users can view contract receipts.

---

## 12. Screen 12: Error / Expired Quote

### 12.1 Route
`/portal/quotes/{quote_id}/expired` (or Error State inside `/portal/quotes/{quote_id}`)

### 12.2 Purpose
Informative and actionable screen displayed when a customer opens a quote that has passed its validity date, been cancelled, or voided. Prevents dead-ends by providing a 1-click re-activation request.

### 12.3 UI Components
- **Status Header Card:**
  - Slate/Amber shield icon with clock indicator.
  - Headline: "This Quotation Has Expired".
  - Subtitle: "Quote QUO-2026-0048 expired on August 31, 2026. Pricing and scheduled deliverables are no longer binding."
- **Quote Summary (Watermarked):**
  - Read-only summary of the original line items and total with a diagonal semi-transparent "EXPIRED" watermark badge.
- **Action Box ("Request Quote Re-activation"):**
  - Body: "Market conditions and pricing schedules may require review. Click below to request an extension or updated revision from your account team."
  - Textarea: "Add optional note to Alex Mercer (e.g. 'Ready to approve if price is held')".
  - Primary CTA: "Request Re-activation & Extension".
- **Direct Rep Contact Card:** Photo, email, and direct phone number of Alex Mercer.
- **Navigation Action:** "← Back to Active Quotations".

### 12.4 Data Displayed
- Original quote details, expiration timestamp, elapsed days count, sales rep details.

### 12.5 User Actions
- Type note and submit re-activation request comment.
- Call or email sales rep directly.
- Navigate back to dashboard.

### 12.6 API Calls
- `POST /api/v1/portal/quotes/{quote_id}/comments` (Auto-submits re-activation request message).

### 12.7 Loading State
Standard page skeleton while verifying quote state.

### 12.8 Empty State
N/A

### 12.9 Error State
If quote does not exist at all, renders standard 404 "Quote Not Found" screen.

### 12.10 Success State
Submitting re-activation displays green confirmation banner: "Extension request sent to Alex Mercer. You will be notified once reviewed."

### 12.11 Security Restrictions
- Partner boundary enforced.

---

## 13. Screen 13: Access Denied

### 13.1 Route
`/portal/403` or inline route guard interstitial

### 13.2 Purpose
Polite, secure rejection screen explaining why a user cannot access a specific quote or execute an action (e.g. non-signatory attempting to sign, or multi-tenant authorization boundary).

### 13.3 UI Components
- **Shield Lock Illustration:** Clean vector lock with muted indigo accent.
- **Headline:** "Signatory Authorization Required" or "Access Restricted".
- **Dynamic Context Explanation:**
  - *Scenario A (Signatory Missing):* "Your account (`sarah.connor@cyberdyne-defense.com`) is authenticated as a Team Member with read access, but does not have legal signatory privileges for Cyberdyne Defense Systems."
  - *Scenario B (Entity Boundary):* "You do not have permission to view this deal record. Please verify that you are logged into the correct organization account."
- **Helpful Resolution Steps:**
  - Step 1: "Contact your account administrator or Sarah Connor to authorize agreement execution."
  - Step 2: "Request signatory permission upgrade."
- **Primary Actions:**
  - Primary Button: "Request Signatory Access" (Dispatches notification to organization admin).
  - Secondary Button: "Return to Dashboard".
  - Tertiary Button: "Switch Account / Sign Out".

### 13.4 Data Displayed
- Current logged-in user email, company name, assigned permissions.

### 13.5 User Actions
- Click "Request Signatory Access".
- Switch active accounts.
- Return to safe dashboard.

### 13.6 API Calls
- `POST /api/v1/portal/auth/request-permission` (or notification trigger).

### 13.7 Loading State
Minimal spinner on request access button.

### 13.8 Empty State
N/A

### 13.9 Error State
Toast alert if permission request notification fails.

### 13.10 Success State
Toast alert: "Signatory upgrade request sent to company administrator."

### 13.11 Security Restrictions
- No sensitive internal deal details or existence confirmation leaked.

---

## 14. Screen 14: Global Loading, Skeleton & Empty States

### 14.1 Purpose
Standardized design patterns across all customer portal views to eliminate layout shift (CLS), avoid jarring blank screens, and provide informative zero-data feedback.

### 14.2 UI Components & Patterns

#### A. Skeleton Loaders (Layout-Aware Shimmers):
- **Card Skeleton:** Light grey rounded box (`#F1F5F9`) with 1.5s linear infinite shimmer gradient (`rgba(255,255,255,0.6)`).
- **Table Skeleton:** Header row + 5 content rows with simulated text pills matching actual table column widths.
- **Document Detail Skeleton:** Simulates top command bar, split pricing summary, and line items grid.

#### B. Micro-Spinners & Button States:
- Small 16px SVG circular spinner embedded inside CTA buttons during async operations.
- Buttons maintain constant width when transitioning to loading state to prevent UI jumping.

#### C. Enterprise Empty State Blueprint:
Every empty state adheres to a 4-part structure:
1. *Visual Anchor:* Monochrome 48px SVG line icon with subtle colored circle backdrop.
2. *Clear Headline:* Concise explanation of why the view is empty ("No Active Proposals").
3. *Empathetic Explanatory Copy:* What causes this state and what to expect ("Your account executive is currently drafting your initial quote.").
4. *Direct Action CTA:* One primary action to guide the user ("Contact Account Executive", "Clear Filters", or "Refresh").

#### D. Offline & Network Error Interstitial:
- Floating bottom pill: "Connection lost. Reconnecting in 5s... [Retry Now]".

---

## Summary Matrix: Screen-to-API Mapping

| # | Screen Name | Route | Primary API Endpoint | HTTP Method |
|---|---|---|---|---|
| 1 | Customer Login | `/portal/login` | `/api/v1/portal/auth/login` | POST |
| 2 | Customer Dashboard | `/portal/dashboard` | `/api/v1/portal/quotes` + `/auth/me` | GET |
| 3 | My Quotations | `/portal/quotes` | `/api/v1/portal/quotes` | GET |
| 4 | Quotation Details | `/portal/quotes/{quote_id}` | `/api/v1/portal/quotes/{quote_id}` | GET |
| 5 | Negotiation Workspace | `/portal/quotes/{quote_id}/negotiate` | `/quotes/{id}/negotiation/counter-discount` | POST |
| 6 | Line-Level Discussion | `/portal/quotes/{quote_id}/discussion` | `/quotes/{id}/comments` | GET, POST |
| 7 | Change Request | `/portal/quotes/{quote_id}/change-request`| `/quotes/{id}/negotiation/change-request` | POST |
| 8 | Counter Discount | `/portal/quotes/{quote_id}/counter-discount`| `/quotes/{id}/negotiation/counter-discount` | POST |
| 9 | Quote Revision History | `/portal/quotes/{quote_id}/revisions` | `/quotes/{id}/revisions` + `/diff` | GET |
| 10| Confirmation Screen | `/portal/quotes/{quote_id}/accept` | `/quotes/{quote_id}/accept` | POST |
| 11| Confirmation Success | `/portal/quotes/{quote_id}/confirmed` | `/quotes/{quote_id}/pdf` | GET |
| 12| Error / Expired Quote | `/portal/quotes/{quote_id}/expired` | `/quotes/{quote_id}/comments` | POST |
| 13| Access Denied | `/portal/403` | `/auth/me` | GET |
| 14| Global Loading / Empty | Shared across routes | Component-level states | — |

---
*End of Phase 2 Customer Portal UI/UX Specification — DealFlow360*
