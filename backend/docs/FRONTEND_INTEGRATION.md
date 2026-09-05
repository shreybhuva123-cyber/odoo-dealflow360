# DealFlow360 Frontend Integration & React Developer Guide

## 1. Quick Start & Server Coordinates

| Environment | Base URL | Swagger UI Documentation | Raw OpenAPI JSON |
| :--- | :--- | :--- | :--- |
| **Local Development** | `http://localhost:5000` | `http://localhost:5000/api-docs` | `http://localhost:5000/api-docs.json` |

---

## 2. Authentication & Token Management

### 2.1 Login & Storage
Authenticate by posting credentials to `/api/auth/login`.

```javascript
// Example Axios Login
const response = await axios.post('http://localhost:5000/api/auth/login', {
  email: 'admin@dealflow360.com',
  password: 'Password@123',
});

const { accessToken, refreshToken, user } = response.data.data;

// Recommended token storage:
// Store accessToken in memory or secure session storage
// Store refreshToken in secure storage for background refresh
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);
```

### 2.2 Authenticated Requests
Include the token in all subsequent requests via the `Authorization` header:
```javascript
axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
```

### 2.3 Token Refresh Flow
When an API call returns `401 Unauthorized` with `TOKEN_EXPIRED`, automatically call `/api/auth/refresh`:
```javascript
const refreshRes = await axios.post('http://localhost:5000/api/auth/refresh', {
  refreshToken: localStorage.getItem('refreshToken'),
});
const newAccessToken = refreshRes.data.data.accessToken;
localStorage.setItem('accessToken', newAccessToken);
```

---

## 3. Standard API Response Envelopes

### 3.1 Successful Response
```json
{
  "success": true,
  "message": "Quotation created successfully",
  "data": {
    "id": "c16198f3-e51c-43f9-aa2b-658b16c11dbb",
    "quotationNumber": "QT-2026-000001",
    "status": "DRAFT",
    "totalAmount": 1062.00
  }
}
```

### 3.2 Paginated Response
```json
{
  "success": true,
  "message": "Quotations retrieved successfully",
  "data": [ /* array of records */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### 3.3 Standard Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "items.0.quantity",
      "message": "Quantity must be at least 1"
    }
  ]
}
```

---

## 4. Role-Based Access Control (RBAC) UI Matrix

| Role | Quotations | Approvals | Orders | Fulfillment | Invoices | Payments | Dashboard View |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | Full CRUD + Submit | Full Access | Full CRUD | Full Access | Full CRUD | Full CRUD | Executive Overview |
| **SALES_REP** | Own Quotes (CRUD + Submit) | Read Only | View Own | Read Only | View Own | Read Only | Rep Performance |
| **SALES_MANAGER** | Team Quotes + Review | Approve/Reject Step 1 | View Team | View Shipments | View Team | Read Only | Pipeline Funnel |
| **FINANCE** | View All | Approve/Reject Step 2 | View Orders | Read Only | Full CRUD | Full CRUD | Financial Overview |
| **OPERATIONS** | Read Only | Read Only | View Confirmed | Allocate, Ship, Deliver | Read Only | Read Only | Operational Funnel |

---

## 5. End-to-End Workflow Integration Guide

### Step 1: Browse Catalog & Select Customer
1. Call `GET /api/customers` to render the customer dropdown.
2. Call `GET /api/products` to display product catalog and pricing.

### Step 2: Build & Create Quotation
1. Construct the payload with `customerId`, optional `validUntil`, and `items` array.
2. Call `POST /api/quotations`.
3. The server automatically calculates subtotals, margins, and taxes.

### Step 3: Submit Quotation
1. Call `POST /api/quotations/{id}/submit`.
2. The Risk Engine assesses the discount and margin.
3. If no approval is required, status immediately advances to `APPROVED`.
4. If approvals are required, status advances to `PENDING_APPROVAL` and approval tickets are spawned.

### Step 4: Manager / Finance Approval
1. Manager calls `GET /api/approvals?status=PENDING`.
2. Call `POST /api/approvals/{id}/approve` with optional comments.
3. Once all required steps are approved, quotation status updates to `APPROVED`.

### Step 5: Convert to Sales Order
1. Call `POST /api/quotations/{id}/convert-to-order`.
2. Order is created in `DRAFT` status.
3. Call `POST /api/orders/{id}/confirm` to confirm and allocate stock.

### Step 6: Fulfillment & Delivery
1. Call `POST /api/fulfillment` to create a delivery package.
2. Call `POST /api/fulfillment/{id}/ship` when carrier picks up goods (deducts warehouse inventory).
3. Call `POST /api/fulfillment/{id}/deliver` upon confirmed arrival.

### Step 7: Invoicing & Payment
1. Call `POST /api/invoices` with `orderId` to generate the tax invoice.
2. Call `POST /api/invoices/{id}/issue` to release the invoice.
3. Call `POST /api/payments` to record payments received. Invoice status updates automatically.
