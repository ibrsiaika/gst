# Postman / Newman Collection Outline

Use this structure to build automated, “tested” API flows against the NIC sandboxes and the SaaS backend. Each folder indicates pre-request scripts, sample payloads, env vars, and success criteria.

## 0. Environments
- **Local Dev:** `baseUrl=http://localhost:4000/api/v1`, `irpBase=https://einv-apisandbox.nic.in`, `ewayBase=https://dev.ewaybillgst.gov.in`.
- **QA Sandbox:** `baseUrl=https://qa.gst-saas.com/api/v1`, plus Razorpay test keys.
- Common variables: `tenantId`, `gstin`, `counterpartyGstin`, `razorpayKey`, `razorpaySecret`, `authToken`, `refreshToken`.
- Pre-request: fetch/refresh JWT if expired.

## 1. Auth & Tenant Bootstrap Folder
1. `POST /auth/login`
   - Tests: response 200, tokens non-empty, subscription active flag.
2. `POST /auth/refresh`
   - Tests: new token != old token.
3. `POST /tenants`
   - Pre-req script to insert random PAN. Assert `201` and `subscription_plan` default.

## 2. Counterparty & GSTIN Verification Folder
1. `POST /counterparties`
   - Body from `counterparty.json`. Tests ensure `verification_status` = `pending`.
2. `POST /gstin/verify`
   - Chained call hitting NIC sandbox `GetGSTINDetails`. Use Postman `pm.sendRequest` to call external API and compare `legalName`.
3. Negative test: invalid GSTIN (expect `422`).

## 3. Invoice to IRP Flow Folder
1. `POST /invoices`
   - Store `invoiceId` as collection variable.
   - Test: totals computed, `irp_status` = `pending`.
2. `POST /invoices/{{invoiceId}}/einvoice`
   - Pre-request: generate `Idempotency-Key` header.
   - Tests: status `success`, `irn` present, `ackNo` numeric, signed JSON download URL.
3. `GET /invoices/{{invoiceId}}/irn`
   - Validate stored metadata equals IRP response.
4. Failure scenario: send duplicate invoice, expect `409` or `IRP_REJECTED` error.

## 4. E-Way Bill Folder
1. `POST /ewaybills`
   - Pre-request: ensure invoice has IRN.
   - Tests: `ewbNo` length 12, `pdfUrl` contains S3 bucket, `status` = `generated`.
2. `GET /ewaybills/{{ewbNo}}`
   - Tests: `validTo` in future.
3. `POST /ewaybills/{{ewbNo}}/cancel`
   - Negative test ensures cancellation allowed only before expiry.

## 5. Returns & Reports Folder
1. `GET /reports/gstr1?period={{period}}`
   - Tests: `sections.B2B.length > 0`, `checksum` exists.
2. `GET /reports/gstr3b?period={{period}}`
   - Verify table 3.1 totals sum invoice data using script.
3. `POST /reports/export`
   - Body selects `gstr1` + `json`. Tests confirm `downloadUrl` returns 200.

## 6. Dashboard & Alerts Folder
1. `GET /dashboard/summary`
   - Test KPI numbers > 0 when invoices exist.
2. `GET /dashboard/due-alerts`
   - Assert at least one due record for open return period.

## 7. Subscription & Billing Folder
1. `GET /subscription`
   - Tests: plan matches environment variable.
2. `POST /subscription/checkout`
   - Ensure Razorpay order ID returned. Save to variable for webhook test.
3. `POST /webhooks/razorpay`
   - Use pre-request script to compute signature (`crypto-js`). Tests confirm subscription status updated.

## 8. Admin Folder
1. `GET /admin/tenants`
   - Tests: only accessible with platform admin token (expect `403` for normal user test case).
2. `POST /admin/tenants/{{tenantId}}/suspend`
   - After call, re-run `GET /auth/me` expecting `tenant.status` = `suspended`.
3. `GET /admin/audit/keys`
   - Validate sensitive fields masked.

## 9. Collection-Level Tests
- Script to ensure no request fails unexpectedly.
- Expose summary (passed/failed) for CI `newman` job. Example CLI: `newman run collection.json -e qa.env.json --reporters cli,junit`.

## Attachments
- Provide sample payload files (`payloads/invoice-basic.json`, etc.).
- Document NIC sandbox credentials mapping in Postman environment secure fields.

Following this outline ensures reproducible, automated verification of the full e-invoice + e-way + returns flow with admin coverage.
