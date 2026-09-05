/**
 * DealFlow360 OpenAPI 3.0.3 Specification
 * Phase 13 API Documentation
 */
export const swaggerSpec = {
  "openapi": "3.0.3",
  "info": {
    "title": "DealFlow360 B2B Sales Operations Platform API",
    "version": "1.0.0",
    "description": "DealFlow360 is an enterprise-grade B2B Sales Operations backend engine providing automated quotation calculation, multi-factor risk assessment, tiered discount rules, multi-stage approval workflows, inventory fulfillment, billing & payments, role-aware analytics dashboards, real-time in-app notifications, and audit logging.\n\n### Authentication\nMost API endpoints require a valid JWT Bearer token in the `Authorization` header:\n`Authorization: Bearer <your_access_token>`",
    "contact": {
      "name": "DealFlow360 Engineering Team",
      "email": "engineering@dealflow360.internal"
    }
  },
  "servers": [
    {
      "url": "http://localhost:5000",
      "description": "Local Development Server"
    }
  ],
  "tags": [
    {
      "name": "Auth",
      "description": "Authentication & Session Management"
    },
    {
      "name": "Products",
      "description": "Product Catalog & Variant Operations"
    },
    {
      "name": "Customers",
      "description": "B2B Customer Management & Credit Limits"
    },
    {
      "name": "PriceLists",
      "description": "Tiered B2B Price Lists & Pricing Rules"
    },
    {
      "name": "Quotations",
      "description": "Quotation Engine, Pricing Calculations & Lifecycle"
    },
    {
      "name": "Approvals",
      "description": "Multi-Stage Manager & Finance Approval Workflow"
    },
    {
      "name": "Orders",
      "description": "Sales Order Creation, Confirmations & Cancellation"
    },
    {
      "name": "Fulfillment",
      "description": "Inventory Tracking, Allocations & Deliveries"
    },
    {
      "name": "Invoices",
      "description": "Billing Engine, Tax Invoices & Overdue Tracking"
    },
    {
      "name": "Payments",
      "description": "Payment Processing, Receipts & Allocation"
    },
    {
      "name": "Dashboard",
      "description": "Role-Aware Analytics, KPI Metrics & Conversion Funnel"
    },
    {
      "name": "Notifications",
      "description": "In-App Alerts, Unread Counters & Status Updates"
    },
    {
      "name": "Activity",
      "description": "System Timeline, Audit Logs & Event Streams"
    },
    {
      "name": "System",
      "description": "Health Checks & Service Status"
    }
  ],
  "components": {
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "Enter your JWT Bearer token in the format: Bearer <token>"
      }
    },
    "schemas": {
      "ApiResponse": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "example": true
          },
          "message": {
            "type": "string",
            "example": "Operation completed successfully"
          },
          "data": {
            "type": "object"
          }
        }
      },
      "ApiError": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "example": false
          },
          "message": {
            "type": "string",
            "example": "Invalid input parameters"
          },
          "code": {
            "type": "string",
            "example": "VALIDATION_ERROR"
          },
          "errors": {
            "type": "array",
            "items": {
              "type": "object"
            }
          }
        }
      },
      "Pagination": {
        "type": "object",
        "properties": {
          "page": {
            "type": "integer",
            "example": 1
          },
          "limit": {
            "type": "integer",
            "example": 20
          },
          "totalItems": {
            "type": "integer",
            "example": 100
          },
          "totalPages": {
            "type": "integer",
            "example": 5
          },
          "hasNextPage": {
            "type": "boolean",
            "example": true
          },
          "hasPrevPage": {
            "type": "boolean",
            "example": false
          }
        }
      },
      "LoginRequest": {
        "type": "object",
        "required": [
          "email",
          "password"
        ],
        "properties": {
          "email": {
            "type": "string",
            "format": "email",
            "example": "admin@dealflow360.com"
          },
          "password": {
            "type": "string",
            "example": "Admin@12345"
          }
        }
      },
      "RegisterRequest": {
        "type": "object",
        "required": [
          "name",
          "email",
          "password",
          "role"
        ],
        "properties": {
          "name": {
            "type": "string",
            "example": "Jane Doe"
          },
          "email": {
            "type": "string",
            "format": "email",
            "example": "jane@dealflow360.com"
          },
          "password": {
            "type": "string",
            "example": "StrongPassword#2026"
          },
          "role": {
            "type": "string",
            "enum": [
              "ADMIN",
              "SALES_REP",
              "SALES_MANAGER",
              "FINANCE",
              "OPERATIONS"
            ],
            "example": "SALES_REP"
          }
        }
      },
      "QuotationCreateRequest": {
        "type": "object",
        "required": [
          "customerId",
          "items"
        ],
        "properties": {
          "customerId": {
            "type": "string",
            "format": "uuid"
          },
          "priceListId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "validUntil": {
            "type": "string",
            "format": "date-time"
          },
          "notes": {
            "type": "string"
          },
          "terms": {
            "type": "string"
          },
          "items": {
            "type": "array",
            "items": {
              "type": "object",
              "required": [
                "productId",
                "quantity"
              ],
              "properties": {
                "productId": {
                  "type": "string",
                  "format": "uuid"
                },
                "quantity": {
                  "type": "number",
                  "minimum": 1,
                  "example": 10
                },
                "unitPrice": {
                  "type": "number",
                  "example": 150
                },
                "discountPercentage": {
                  "type": "number",
                  "example": 5
                },
                "taxPercentage": {
                  "type": "number",
                  "example": 18
                }
              }
            }
          }
        }
      },
      "ApprovalDecisionRequest": {
        "type": "object",
        "properties": {
          "comments": {
            "type": "string",
            "example": "Approved within budget limits."
          }
        }
      },
      "RejectionDecisionRequest": {
        "type": "object",
        "required": [
          "comments"
        ],
        "properties": {
          "comments": {
            "type": "string",
            "example": "Discount exceeds margin threshold."
          }
        }
      },
      "OrderCreateFromQuotationRequest": {
        "type": "object",
        "required": [
          "quotationId"
        ],
        "properties": {
          "quotationId": {
            "type": "string",
            "format": "uuid"
          },
          "notes": {
            "type": "string"
          }
        }
      },
      "PaymentRecordRequest": {
        "type": "object",
        "required": [
          "invoiceId",
          "amount",
          "method"
        ],
        "properties": {
          "invoiceId": {
            "type": "string",
            "format": "uuid"
          },
          "amount": {
            "type": "number",
            "minimum": 0.01,
            "example": 5000
          },
          "method": {
            "type": "string",
            "enum": [
              "BANK_TRANSFER",
              "CREDIT_CARD",
              "CASH",
              "CHEQUE",
              "OTHER"
            ],
            "example": "BANK_TRANSFER"
          },
          "reference": {
            "type": "string",
            "example": "TXN-998231"
          },
          "notes": {
            "type": "string"
          }
        }
      }
    }
  },
  "paths": {
    "/health": {
      "get": {
        "tags": [
          "System"
        ],
        "summary": "Server Health & Liveness Probe",
        "responses": {
          "200": {
            "description": "Server is healthy",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/health": {
      "get": {
        "tags": [
          "System"
        ],
        "summary": "Deep System Health & Database Diagnostics",
        "responses": {
          "200": {
            "description": "System components healthy",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/register": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Register New User (Admin or Self-Registration)",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/RegisterRequest"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "User successfully registered"
          },
          "400": {
            "description": "Validation failed"
          },
          "409": {
            "description": "Email already exists"
          }
        }
      }
    },
    "/api/auth/login": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Authenticate User & Issue Tokens",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/LoginRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Authenticated successfully with tokens"
          },
          "401": {
            "description": "Invalid credentials"
          },
          "429": {
            "description": "Too many login attempts"
          }
        }
      }
    },
    "/api/auth/refresh": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Refresh Access Token using Refresh Token",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "refreshToken"
                ],
                "properties": {
                  "refreshToken": {
                    "type": "string"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "New access token issued"
          },
          "401": {
            "description": "Invalid or expired refresh token"
          }
        }
      }
    },
    "/api/auth/logout": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Logout & Invalidate Session Token",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "Logged out successfully"
          }
        }
      }
    },
    "/api/auth/me": {
      "get": {
        "tags": [
          "Auth"
        ],
        "summary": "Get Authenticated User Profile",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "Current user profile data"
          },
          "401": {
            "description": "Unauthorized"
          }
        }
      }
    },
    "/api/products": {
      "get": {
        "tags": [
          "Products"
        ],
        "summary": "List Products with Filtering & Pagination",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "page",
            "in": "query",
            "schema": {
              "type": "integer",
              "default": 1
            }
          },
          {
            "name": "limit",
            "in": "query",
            "schema": {
              "type": "integer",
              "default": 20
            }
          },
          {
            "name": "search",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "categoryId",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "isActive",
            "in": "query",
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Paginated list of products"
          }
        }
      },
      "post": {
        "tags": [
          "Products"
        ],
        "summary": "Create Product (Admin/Operations)",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "201": {
            "description": "Product created"
          }
        }
      }
    },
    "/api/products/{id}": {
      "get": {
        "tags": [
          "Products"
        ],
        "summary": "Get Product Details",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Product details"
          },
          "404": {
            "description": "Product not found"
          }
        }
      },
      "put": {
        "tags": [
          "Products"
        ],
        "summary": "Update Product",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Product updated"
          }
        }
      }
    },
    "/api/customers": {
      "get": {
        "tags": [
          "Customers"
        ],
        "summary": "List B2B Customers with Search & Pagination",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "page",
            "in": "query",
            "schema": {
              "type": "integer",
              "default": 1
            }
          },
          {
            "name": "limit",
            "in": "query",
            "schema": {
              "type": "integer",
              "default": 20
            }
          },
          {
            "name": "search",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "status",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Paginated customer records"
          }
        }
      },
      "post": {
        "tags": [
          "Customers"
        ],
        "summary": "Create Customer",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "201": {
            "description": "Customer created"
          }
        }
      }
    },
    "/api/customers/{id}": {
      "get": {
        "tags": [
          "Customers"
        ],
        "summary": "Get Customer Details",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Customer details"
          },
          "404": {
            "description": "Customer not found"
          }
        }
      },
      "put": {
        "tags": [
          "Customers"
        ],
        "summary": "Update Customer Profile or Credit Limit",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Customer updated"
          }
        }
      }
    },
    "/api/price-lists": {
      "get": {
        "tags": [
          "PriceLists"
        ],
        "summary": "List Price Lists",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "Price lists returned"
          }
        }
      },
      "post": {
        "tags": [
          "PriceLists"
        ],
        "summary": "Create Custom Price List",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "201": {
            "description": "Price list created"
          }
        }
      }
    },
    "/api/quotations": {
      "get": {
        "tags": [
          "Quotations"
        ],
        "summary": "List Quotations (Role-Filtered)",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "page",
            "in": "query",
            "schema": {
              "type": "integer",
              "default": 1
            }
          },
          {
            "name": "limit",
            "in": "query",
            "schema": {
              "type": "integer",
              "default": 20
            }
          },
          {
            "name": "status",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "customerId",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "List of quotations"
          }
        }
      },
      "post": {
        "tags": [
          "Quotations"
        ],
        "summary": "Create Quotation with Auto-Calculated Pricing & Margins",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/QuotationCreateRequest"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Quotation created in DRAFT status"
          }
        }
      }
    },
    "/api/quotations/{id}": {
      "get": {
        "tags": [
          "Quotations"
        ],
        "summary": "Get Quotation Details with Items & Approval Info",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Quotation complete details"
          },
          "404": {
            "description": "Quotation not found"
          }
        }
      },
      "put": {
        "tags": [
          "Quotations"
        ],
        "summary": "Update Draft Quotation Items & Header",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Quotation updated"
          }
        }
      },
      "delete": {
        "tags": [
          "Quotations"
        ],
        "summary": "Delete Draft Quotation",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Quotation deleted"
          }
        }
      }
    },
    "/api/quotations/{id}/submit": {
      "post": {
        "tags": [
          "Quotations"
        ],
        "summary": "Submit Quotation (Triggers Risk Evaluation & Approval Workflow)",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Quotation submitted; moves to PENDING_APPROVAL or APPROVED"
          }
        }
      }
    },
    "/api/quotations/{id}/convert-to-order": {
      "post": {
        "tags": [
          "Quotations"
        ],
        "summary": "Convert Approved Quotation to Sales Order",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "201": {
            "description": "Sales Order generated from quotation"
          }
        }
      }
    },
    "/api/approvals": {
      "get": {
        "tags": [
          "Approvals"
        ],
        "summary": "List Pending Approvals (Manager/Finance/Admin)",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "status",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "PENDING",
                "APPROVED",
                "REJECTED"
              ]
            }
          },
          {
            "name": "stepRole",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Approval queue items"
          }
        }
      }
    },
    "/api/approvals/{id}/approve": {
      "post": {
        "tags": [
          "Approvals"
        ],
        "summary": "Approve Quotation Workflow Step",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ApprovalDecisionRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Step approved; advances workflow or marks quotation APPROVED"
          }
        }
      }
    },
    "/api/approvals/{id}/reject": {
      "post": {
        "tags": [
          "Approvals"
        ],
        "summary": "Reject Quotation Workflow Step (Requires Reason)",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/RejectionDecisionRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Workflow step rejected; marks quotation REJECTED"
          }
        }
      }
    },
    "/api/orders": {
      "get": {
        "tags": [
          "Orders"
        ],
        "summary": "List Sales Orders",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "page",
            "in": "query",
            "schema": {
              "type": "integer",
              "default": 1
            }
          },
          {
            "name": "limit",
            "in": "query",
            "schema": {
              "type": "integer",
              "default": 20
            }
          },
          {
            "name": "status",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "customerId",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Paginated sales orders"
          }
        }
      },
      "post": {
        "tags": [
          "Orders"
        ],
        "summary": "Create Order directly or from Quotation",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/OrderCreateFromQuotationRequest"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Order created"
          }
        }
      }
    },
    "/api/orders/{id}": {
      "get": {
        "tags": [
          "Orders"
        ],
        "summary": "Get Sales Order Details",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Order details"
          }
        }
      }
    },
    "/api/orders/{id}/confirm": {
      "post": {
        "tags": [
          "Orders"
        ],
        "summary": "Confirm Sales Order & Reserve Inventory",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Order confirmed and inventory allocated"
          }
        }
      }
    },
    "/api/orders/{id}/cancel": {
      "post": {
        "tags": [
          "Orders"
        ],
        "summary": "Cancel Sales Order & Release Inventory Reservations",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Order cancelled"
          }
        }
      }
    },
    "/api/fulfillment": {
      "get": {
        "tags": [
          "Fulfillment"
        ],
        "summary": "List Deliveries / Shipments",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "status",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "orderId",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Deliveries retrieved"
          }
        }
      },
      "post": {
        "tags": [
          "Fulfillment"
        ],
        "summary": "Create Shipment / Delivery for Order",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "201": {
            "description": "Delivery created"
          }
        }
      }
    },
    "/api/fulfillment/{id}/ship": {
      "post": {
        "tags": [
          "Fulfillment"
        ],
        "summary": "Ship Delivery (Dispatches Items & Deducts Physical Stock)",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Delivery marked SHIPPED"
          }
        }
      }
    },
    "/api/fulfillment/{id}/deliver": {
      "post": {
        "tags": [
          "Fulfillment"
        ],
        "summary": "Complete Delivery (Marks DELIVERED)",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Delivery completed"
          }
        }
      }
    },
    "/api/invoices": {
      "get": {
        "tags": [
          "Invoices"
        ],
        "summary": "List Invoices with Financial Filters",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "status",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "paymentStatus",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "customerId",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Paginated invoices"
          }
        }
      },
      "post": {
        "tags": [
          "Invoices"
        ],
        "summary": "Create Invoice from Sales Order",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "201": {
            "description": "Invoice created"
          }
        }
      }
    },
    "/api/invoices/{id}": {
      "get": {
        "tags": [
          "Invoices"
        ],
        "summary": "Get Invoice Details with Payments & Balances",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Invoice details"
          }
        }
      }
    },
    "/api/invoices/{id}/issue": {
      "post": {
        "tags": [
          "Invoices"
        ],
        "summary": "Issue Draft Invoice (Finalizes invoice, sets ISSUED)",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Invoice issued"
          }
        }
      }
    },
    "/api/invoices/{id}/cancel": {
      "post": {
        "tags": [
          "Invoices"
        ],
        "summary": "Cancel Invoice (If unpaid)",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Invoice cancelled"
          }
        }
      }
    },
    "/api/payments": {
      "get": {
        "tags": [
          "Payments"
        ],
        "summary": "List Recorded Payments",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "invoiceId",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "customerId",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Payment records"
          }
        }
      },
      "post": {
        "tags": [
          "Payments"
        ],
        "summary": "Record Payment against Invoice",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PaymentRecordRequest"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Payment recorded and invoice balance updated"
          }
        }
      }
    },
    "/api/dashboard/overview": {
      "get": {
        "tags": [
          "Dashboard"
        ],
        "summary": "Executive & Role-Aware Dashboard Overview",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "startDate",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "date"
            }
          },
          {
            "name": "endDate",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "date"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Dashboard metrics & financial totals"
          }
        }
      }
    },
    "/api/dashboard/sales-rep": {
      "get": {
        "tags": [
          "Dashboard"
        ],
        "summary": "Sales Representative Individual Performance Metrics",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "Rep quotation conversions & commission metrics"
          }
        }
      }
    },
    "/api/dashboard/funnel": {
      "get": {
        "tags": [
          "Dashboard"
        ],
        "summary": "Sales Pipeline Conversion Funnel",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "Funnel stages and drop-off analytics"
          }
        }
      }
    },
    "/api/notifications": {
      "get": {
        "tags": [
          "Notifications"
        ],
        "summary": "List User In-App Notifications",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "unreadOnly",
            "in": "query",
            "schema": {
              "type": "boolean"
            }
          },
          {
            "name": "limit",
            "in": "query",
            "schema": {
              "type": "integer",
              "default": 20
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Notifications list"
          }
        }
      }
    },
    "/api/notifications/{id}/read": {
      "patch": {
        "tags": [
          "Notifications"
        ],
        "summary": "Mark Specific Notification as Read",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Marked read"
          }
        }
      }
    },
    "/api/notifications/read-all": {
      "patch": {
        "tags": [
          "Notifications"
        ],
        "summary": "Mark All Notifications as Read",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "All marked read"
          }
        }
      }
    },
    "/api/notifications/unread-count": {
      "get": {
        "tags": [
          "Notifications"
        ],
        "summary": "Get Unread Notification Count Badge",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "Unread badge counter"
          }
        }
      }
    },
    "/api/activity": {
      "get": {
        "tags": [
          "Activity"
        ],
        "summary": "System Activity Timeline Stream",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "entityType",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "entityId",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "limit",
            "in": "query",
            "schema": {
              "type": "integer",
              "default": 20
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Activity event timeline"
          }
        }
      }
    }
  }
};
export default swaggerSpec;
