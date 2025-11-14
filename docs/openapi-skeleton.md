# GST SaaS API Specification (MVP Skeleton)

This OpenAPI-style skeleton documents the REST endpoints required to power the GST SaaS MVP. Each section includes request/response bodies, validation highlights, auth expectations, success/error schemas, and testing notes to ensure “end-to-end” verifiability.

> **Versioning:** Base path `/api/v1`. Use semantic versioning for the API description itself (`1.0.0-mvp`).
> **Auth:** All endpoints require Bearer JWT issued after tenant + subscription checks unless stated.

## 1. Authentication & Tenant Bootstrap

### `POST /api/v1/auth/login`
- **Description:** Authenticate user with email/password + optional OTP (2FA) challenge.
- **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "hunter2",
  "otp": "123456" // optional if 2FA enabled
}
```
- **Responses:**
  - `200 OK`
  ```json
  {
    "accessToken": "jwt...",
    "refreshToken": "jwt...",
    "expiresIn": 3600,
    "mfaRequired": false,
    "tenant": {
      "id": "ten_123",
      "name": "Acme Retail Pvt Ltd",
      "pan": "AAECS1234A",
      "subscriptionPlan": "growth"
    }
  }
  ```
  - `401 Unauthorized`: invalid credentials or OTP.
- **Testing:** Integration tests verify locked users, expired subscriptions, and OTP failure flows.

### `POST /api/v1/auth/refresh`
- Rotates access token; reject if subscription expired or tenant disabled.

### `POST /api/v1/tenants`
- Provision tenant + first admin via invite. Requires platform admin token.
- Enforces unique PAN, stores GSTIN array.

## 2. User & Org Management

### `GET /api/v1/users`
- List tenant users with pagination and filter by role/status.

### `POST /api/v1/users`
```json
{
  "email": "accountant@example.com",
  "role": "accountant",
  "phone": "+91XXXXXXXXXX",
  "gstinAccess": ["29ABCDE1234F1Z5"]
}
```
- Response includes invite link expiry metadata.

### `PATCH /api/v1/users/{id}`
- Update roles, enable/disable, force 2FA reset. Audit logged.

### `GET /api/v1/audit-logs`
- Query immutable logs filtered by action/entity/time.

## 3. Counterparty Directory & GSTIN Verification

### `POST /api/v1/counterparties`
- Saves customer/supplier with GSTIN + contact details.
- On create/update, system triggers GSTIN verification job.

### `POST /api/v1/gstin/verify`
- **Request:** `{ "gstin": "29ABCDE1234F1Z5" }`
- **Response:**
```json
{
  "gstin": "29ABCDE1234F1Z5",
  "legalName": "XYZ Distributors",
  "tradeName": "XYZ",
  "status": "Active",
  "registrationDate": "2019-04-01",
  "lastVerifiedAt": "2024-05-10T10:45:00Z",
  "source": "NIC_SANDBOX"
}
```
- **Errors:** `422` invalid GSTIN format; `424` upstream verification failure.
- **Testing:** Mock NIC sandbox responses, capture invalid/inactive cases.

## 4. Invoice Lifecycle & IRP Submission

### `POST /api/v1/invoices`
- Validates line items, GSTINs, invoice numbering per GST rules.
- **Request:**
```json
{
  "tenantGstin": "29ABCDE1234F1Z5",
  "counterpartyId": "cp_001",
  "invoiceNumber": "INV-24-0001",
  "invoiceDate": "2024-05-28",
  "supplyType": "B2B",
  "placeOfSupply": "29",
  "items": [
    {"description": "Widget", "hsn": "8471", "quantity": 5, "unitPrice": 1000, "cgstRate": 9, "sgstRate": 9}
  ],
  "transport": {"needsEWay": true, "distanceKm": 120},
  "additionalInfo": {"poNumber": "PO-7788"}
}
```
- **Response 201:** Created invoice with IRP status `PENDING`.

### `GET /api/v1/invoices?status=PENDING_IRP`
- Filtering & pagination.

### `POST /api/v1/invoices/{id}/einvoice`
- Idempotent IRP submission; header `Idempotency-Key` required.
- **Request:** optional override for IRP credentials.
- **Response:**
```json
{
  "invoiceId": "inv_123",
  "irn": "08fbb4...",
  "signedInvoice": "base64JSON",
  "signedQrCode": "base64PNG",
  "ackNo": "241234567890123",
  "ackDate": "2024-05-28T11:15:00Z",
  "status": "SUCCESS"
}
```
- **Error Schema (`4xx/5xx`):** `{ "code": "IRP_REJECTED", "message": "Duplicate invoice", "details": {...}, "retryAt": "2024-05-28T11:45:00Z" }`
- **Testing:** Unit tests for JSON schema mapping; integration hitting NIC sandbox with mock certificate.

### `GET /api/v1/invoices/{id}/irn`
- Returns persisted IRN metadata + download links for signed artifacts (S3 URLs).

### `POST /api/v1/invoices/{id}/cancel`
- Cancels within GST allowed window; also cancels e-way bill if linked.

## 5. E-Way Bill Flow

### `POST /api/v1/ewaybills`
```json
{
  "invoiceId": "inv_123",
  "reason": "Outward supply",
  "vehicleType": "Regular",
  "vehicleNumber": "KA01AB1234",
  "transporterId": "29ABCDE1234F1Z5",
  "distanceKm": 350
}
```
- **Response:**
```json
{
  "ewbNo": "631234567890",
  "validFrom": "2024-05-28T12:00:00Z",
  "validTo": "2024-06-01T23:59:00Z",
  "status": "ACTIVE",
  "pdfUrl": "https://s3.../ewb/631234567890.pdf"
}
```
- Handles auto-cancellation, extension, update vehicle endpoints.

### `GET /api/v1/ewaybills/{ewbNo}`
- Fetches latest status from cache or refreshes from GSTN API.

## 6. Returns & Reporting

### `GET /api/v1/reports/gstr1?period=2024-04`
- Produces JSON structure aligned to GSTR-1 sections (B2B, B2CS, CDN, etc.).
- Response includes `checksum` for audit.

### `GET /api/v1/reports/gstr3b?period=2024-04`
- Summaries for Tables 3.1, 3.2, 4, 5. Auto-lock read-only fields.

### `POST /api/v1/reports/export`
- Accepts payload specifying `type` (`gstr1`, `gstr3b`, `invoiceLedger`, etc.) & `format` (`json`, `csv`, `pdf`). Returns download link + audit record.

## 7. Dashboard & Alerts

### `GET /api/v1/dashboard/summary?period=2024-04`
- KPIs: total taxable value, tax liability, pending IRNs/EWBs, filing countdown.

### `GET /api/v1/dashboard/due-alerts`
- Lists filings/payments due. Feeds notification center + email jobs.

## 8. Subscription & Billing

### `GET /api/v1/subscription`
- Current plan, invoice usage, add-ons, Razorpay subscription ID.

### `POST /api/v1/subscription/checkout`
- Creates Razorpay order + returns `orderId`, `paymentLink`.

### `POST /api/v1/webhooks/razorpay`
- Validates signature, updates payment status, adjusts entitlements.

## 9. Admin Console Endpoints

- `GET /api/v1/admin/tenants` — filter by status/compliance risk.
- `POST /api/v1/admin/tenants/{id}/suspend` — blocks API access.
- `GET /api/v1/admin/audit/keys` — retrieve masked IRP/e-way credentials status.

## 10. Error Model (Global)

```json
{
  "timestamp": "2024-05-28T11:20:00Z",
  "path": "/api/v1/invoices",
  "requestId": "req_abc123",
  "code": "VALIDATION_ERROR",
  "message": "GSTIN must be 15 characters",
  "details": [
    {"field": "tenantGstin", "issue": "INVALID_FORMAT"}
  ]
}
```

## 11. Testing & Quality Hooks
- **Contract tests:** Postman/newman suite hitting sandbox endpoints for auth, invoice → IRP, invoice → EWB, reporting exports.
- **Retry/Audit tests:** Simulate IRP downtime to verify BullMQ retry/backoff + audit log entries.
- **Security tests:** JWT tampering, RBAC, tenant isolation.

This skeleton should be converted into a full OpenAPI YAML/JSON for tooling (Swagger, Stoplight). Include component schemas, enums, and referenced error objects when formalizing.
