# Bill of Materials & Postman Collection Outline

## 1. Bill of Materials (Cloud-agnostic with AWS annotations)

| Layer | Service / Choice | Purpose | Notes |
|-------|------------------|---------|-------|
| Hosting | AWS EKS (or ECS Fargate) | Run containerized frontend + backend | Min 2 nodes (t3.large) with autoscaling |
| CDN / Edge | CloudFront + Route53 | TLS termination, caching SPA assets | Enforce TLS 1.2+, custom domain per tenant |
| Frontend | Next.js 14 + React 18 + Tailwind | Tenant portal + admin UI | Deploy via Vercel or same cluster |
| Backend | NestJS (Node 20, TypeScript) | REST + worker APIs | Monorepo with API + worker packages |
| Database | Amazon RDS for PostgreSQL 15 | Primary relational store | Enable PITR, encryption at rest |
| Cache / Queue | Redis Enterprise / Elasticache | BullMQ job queues, caching verification responses | Multi-AZ, TLS enabled |
| Object Storage | Amazon S3 (ap-south-1) | Signed IRP JSON, PDFs, audit exports | Bucket-level encryption + lifecycle |
| Secrets | AWS Secrets Manager + KMS | Govt API keys, DB creds | Rotate every 90 days |
| Observability | CloudWatch Logs + Prometheus/Grafana + Sentry | Metrics, tracing, error tracking | Ship audit logs to immutable storage (AWS Glacier) |
| Payments | Razorpay Subscriptions API | Plan billing, UPI support | Webhook processor with signature verification |
| Auth | Keycloak (self-hosted) or Auth0 | RBAC, 2FA, SSO | Map roles (admin/accountant/viewer) |
| Compliance APIs | NIC e-Invoice sandbox, e-Way Bill sandbox, GSTIN verification API | Government integrations | Store per-tenant credentials |
| PDF Rendering | AWS Lambda (Chromium) or Microservice with Puppeteer | Generate invoice/e-way PDFs | Triggered via queue |
| Backup | AWS Backup targeting RDS + S3 | Daily snapshots + retention policy | Export monthly to secure vault |

### Capacity Considerations
- **Tenants:** 200 active tenants (Phase-1) with up to 50k invoices/month.
- **Throughput:** 10 IRP submissions/sec bursting to 30 using BullMQ workers + rate-limiter.
- **Storage:** ~200 GB/year for invoices & audit logs with compression.

### Security Controls
- Network segmentation (private subnets for DB/Redis).
- WAF rules for APIs + rate limiters.
- IAM roles per microservice; no long-lived keys.
- Audit log hashing using SHA-256, anchored nightly to immutable store.

## 2. Postman Collection Outline

**Collection Name:** GST SaaS Sandbox

### Folders & Sample Requests

1. **Auth & Setup**
   - `POST /api/auth/login` – obtain JWT.
   - `POST /api/tenants` – create tenant (body template with PAN, plan, GSTIN list).
   - `POST /api/users` – invite accountant user.

2. **Master Data**
   - `POST /api/gstin/verify` – verify GSTIN; tests assert `isValid === true`.
   - `POST /api/customers` – save counterparty with verification metadata.

3. **Invoices & IRP**
   - `POST /api/invoices` – create invoice (Pre-request script generates UUID + invoice number).
   - `POST /api/invoices/:id/einvoice` – trigger IRP submission (tests wait for `jobId`).
   - `GET /api/invoices/:id/irn` – poll for IRN; test ensures `irn` + `qrCode` present.

4. **E-way Bills**
   - `POST /api/eway-bills` – create e-way bill from invoice.
   - `GET /api/eway-bills?status=active` – confirm issuance.

5. **Reports**
   - `GET /api/reports/gstr1?period={{period}}` – verify JSON schema.
   - `GET /api/reports/gstr3b?period={{period}}` – check liability totals.
   - `GET /api/reports/dashboard` – ensure KPIs respond under 200 ms.

6. **Admin & Billing**
   - `GET /api/subscriptions/current` – ensure plan/usage returned.
   - `POST /api/subscriptions/checkout` – Razorpay order creation (tests capture `orderId`).
   - `GET /api/audit` – fetch audit entries, validate immutability hash.

### Environment Variables
- `baseUrl`, `authToken`, `tenantId`, `gstin`, `period`, `razorpayKey`, `govSandboxClientId`, `govSandboxClientSecret`.
- Pre-request scripts inject `Authorization: Bearer {{authToken}}` and compute `x-request-id` header (UUID v4).

### Tests & Automation
- Use Postman test scripts to assert HTTP 2xx responses and expected schema keys (via `pm.expect`).
- Collection runner configured for Sandbox + Production environments.
- Integrate with CI via `newman` to run smoke suite (Auth, Invoice creation, IRP submission mock, Reports) on every deploy.
