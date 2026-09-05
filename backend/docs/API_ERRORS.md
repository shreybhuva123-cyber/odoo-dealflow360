# DealFlow360 API Error Code & Status Reference

## Standard Error Response Structure
Every error returned by DealFlow360 follows the uniform envelope:
```json
{
  "success": false,
  "message": "Human-readable description of error",
  "code": "ERROR_CODE_IDENTIFIER",
  "errors": []
}
```

---

## HTTP Status Codes & Error Catalog

### 400 Bad Request (`BAD_REQUEST` / `VALIDATION_ERROR`)
- **Causes**: Malformed JSON syntax, invalid schema fields, negative values, missing required fields.
- **Example Payload**:
```json
{
  "success": false,
  "message": "Invalid request payload",
  "code": "VALIDATION_ERROR",
  "errors": [
    { "field": "email", "message": "Invalid email address format" }
  ]
}
```

### 401 Unauthorized (`UNAUTHORIZED` / `TOKEN_EXPIRED` / `INVALID_CREDENTIALS`)
- **Causes**: Missing `Authorization` header, expired JWT token, invalid login credentials.
- **Action**: Direct user to login or trigger token refresh.

### 403 Forbidden (`FORBIDDEN` / `INSUFFICIENT_PERMISSIONS`)
- **Causes**: User role lacks permission for the endpoint, or sales rep attempting to access another rep's private quote, or sales rep attempting self-approval.
- **Action**: Hide or disable corresponding UI actions based on role.

### 404 Not Found (`NOT_FOUND`)
- **Causes**: Entity ID does not exist in the database (Product, Customer, Quotation, Order, Invoice).
- **Action**: Display not found page or alert.

### 409 Conflict (`CONFLICT` / `RESOURCE_EXISTS`)
- **Causes**: Unique constraint violation (e.g. email already registered, duplicate SKU, quotation already converted to order).

### 422 Unprocessable Entity (`UNPROCESSABLE_ENTITY` / `INVALID_STATE_TRANSITION`)
- **Causes**: Business domain rules violated, such as:
  - Attempting to submit a quotation with 0 items.
  - Attempting to confirm an already cancelled order.
  - Attempting to ship a delivery before order confirmation.
  - Attempting to record payment on a cancelled invoice.

### 429 Too Many Requests (`RATE_LIMIT_EXCEEDED`)
- **Causes**: Client exceeded rate limits:
  - General API: > 100 requests per minute.
  - Authentication: > 10 login attempts per 15 minutes.
- **Action**: Check `Retry-After` header and pause client requests.

### 500 Internal Server Error (`INTERNAL_SERVER_ERROR`)
- **Causes**: Unexpected database exception or unhandled runtime error. Detailed stack traces are omitted in production.
