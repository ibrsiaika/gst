# Minimal Bill of Materials (BoM)

| Layer | Component | Purpose | Notes |
| --- | --- | --- | --- |
| Frontend | Next.js 14 + React + Tailwind | Tenant and admin UI | Deploy on Vercel/AWS Amplify; env vars for API URL + Razorpay key. Use `next-intl` for English/Hindi localization. |
| Backend | NestJS (Node 20) | REST/GraphQL services for invoices, returns, subscriptions | Use Swagger module to expose `/docs`. Implement queue-based IRP/e-way submission with retry logic. |
| Auth | Keycloak 22 or Auth0 | Multi-tenant RBAC, SSO, OTP | Configure realms per tenant; integrate 2FA via SMS (MSG91/Twilio) or authenticator apps. Support GSTIN-based auto-provisioning. |
| Database | PostgreSQL 15 + TimescaleDB extension | Transactional storage & time-series reporting | Enable logical replication for read replicas. Use partitioning for `invoices` table by month. Enforce row-level security for multi-tenancy. |
| Cache/Queue | Redis 7 + BullMQ | IRP/e-way retry queue, rate limiting, session store | Configure separate queues: `irp-submit`, `eway-generate`, `gstin-verify`, `gstr-reconcile`. Use Redis Cluster for HA. |
| Object Storage | MinIO or AWS S3 | Signed IRP JSON, QR images, PDFs, GSTR exports | Server-side encryption using KMS-managed keys. Lifecycle policy: move to Glacier after 6 years per GST retention rules. |
| Secrets | HashiCorp Vault / AWS Secrets Manager | Store government API credentials per tenant | Scope tokens by tenant GSTIN. Rotate credentials quarterly. Audit all secret access. |
| Observability | Prometheus + Grafana + Loki, Sentry | Metrics, logs, tracing | Collect IRP latency, queue lag, API failure rate, GSTR filing deadlines. Alert on IRP failures > 5% or queue depth > 1000. |
| CI/CD | GitHub Actions + Terraform Cloud | Build/test/deploy & infra-as-code | Run integration tests against NIC sandbox nightly. Blue-green deployment for zero-downtime updates. |
| Payments | Razorpay Subscription APIs | Plan enforcement & billing | Webhook consumer updates `subscription_events`. Support UPI, cards, net banking. Comply with RBI auto-debit regulations. |
| PDF Generation | Puppeteer or WeasyPrint | Generate tax invoices, e-way bills, GSTR PDFs | Template-based rendering with digital signature support. Use Ghostscript for PDF/A compliance. |
| GSTIN Validator | Custom service + NIC API | Real-time GSTIN verification | Cache results for 24h. Fallback to regex validation if API unavailable. Rate limit: 100 req/min per tenant. |
| IRP/E-Way Adapter | NestJS modules | Integrate with NIC e-Invoice and e-Way Bill portals | Implement exponential backoff (1s, 2s, 4s, 8s, 16s). Dead-letter queue for persistent failures. Store IRN/EWB numbers immutably. |
| Compliance Archive | PostgreSQL + S3 | 6-year retention per GST Act | Automated backup to S3 Glacier. WORM (Write Once Read Many) for audit trail. Encrypt at rest with tenant-specific keys. |

## Environment-specific considerations

### Sandbox Environment
- **IRP endpoint**: `https://einv-apisandbox.nic.in/einv/v1.03/Invoice/Generate`
- **E-Way Bill endpoint**: `https://preprod-api.ewaybillgst.gov.in/ewaybillapi/EwayBillV1.03/Generate`
- **GSTIN verification**: `https://einv-apisandbox.nic.in/version1.03/get-gstin-details`
- Use demo credentials from NIC portal (register at `https://einv-apisandbox.nic.in`)
- Test GSTINs: `29AABCT1332L1Z5` (Karnataka), `27AAHCS2781A1ZP` (Maharashtra)
- Mock Razorpay with test keys: `rzp_test_*`

### Production Environment
- **Dedicated VPC**: Private subnets for backend + DB, public subnets for ALB. NAT gateways for outbound IRP calls.
- **WAF rules**: Attach AWS WAF to ingress ALB. Block common OWASP Top 10 attacks. Rate limit: 1000 req/min per IP.
- **Database**: RDS PostgreSQL Multi-AZ with automated backups (7 days). Cross-region replica in Chennai (ap-south-2) for DR.
- **Redis**: ElastiCache Redis Cluster mode with 3 shards, 2 replicas per shard.
- **Secrets rotation**: Auto-rotate DB passwords, API keys every 90 days via AWS Secrets Manager.
- **Compliance**: Enable CloudTrail, Config, GuardDuty. Export logs to S3 for 6-year retention.
- **IRP/E-Way production endpoints**: Provided by GSTN after go-live approval. Requires GSP (GST Suvidha Provider) onboarding if transaction volume > 10K/month.

### Data Residency
- **Primary region**: AWS ap-south-1 (Mumbai) or Azure Central India per data localization mandates.
- **Backup region**: ap-south-2 (Chennai) or Azure South India for disaster recovery.
- **Latency target**: < 200ms for 95th percentile API requests within India.
- **Network**: Use AWS Direct Connect or Azure ExpressRoute for dedicated connectivity to GSTN if handling sensitive data.

## Deployment Steps

1. **Provision infrastructure** via Terraform modules (VPC, subnets, RDS, ElastiCache, EKS/ECS or App Service).
   ```bash
   terraform init
   terraform plan -var-file=production.tfvars
   terraform apply
   ```

2. **Deploy Keycloak** + configure identity providers:
   - Email OTP via AWS SES or SendGrid (verify sender domain per SPF/DKIM)
   - SMS OTP via MSG91 (register sender ID "GSTCOM") or AWS SNS
   - Support Google/Microsoft SSO for enterprise tenants

3. **Ship backend containers** with environment variables:
   - `DATABASE_URL`: PostgreSQL connection string (from Secrets Manager)
   - `REDIS_URL`: Redis cluster endpoint
   - `IRP_BASE_URL`, `EWAY_BASE_URL`: NIC API endpoints
   - `VAULT_ADDR`: HashiCorp Vault address
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`: Payment gateway credentials
   - `SENTRY_DSN`: Error tracking endpoint

4. **Sync API schema** with Postman collection:
   ```bash
   npx @openapitools/openapi-generator-cli generate -i docs/api/openapi.yaml -g postman-collection -o postman/
   ```
   Share with QA and external partners.

5. **Run smoke tests**:
   - Create tenant with primary GSTIN
   - Create B2B invoice (inter-state, IGST 18%)
   - Submit to IRP sandbox → verify IRN, QR code, signed JSON
   - Generate e-way bill → verify EWB number, validity (72h for 450 km)
   - Export GSTR-1 JSON → validate against GSTN offline tool
   - Subscription checkout → Razorpay test payment → webhook callback
   - 2FA flow → SMS OTP → verify login

6. **Load testing**:
   - Use k6 or Gatling to simulate 1000 concurrent users
   - Target: 500 invoices/sec, < 500ms p95 latency
   - Verify queue drains < 5 min under peak load

7. **Security scan**:
   - OWASP ZAP for API vulnerabilities
   - `npm audit` / `pip-audit` for dependency CVEs
   - SonarQube for code quality (target: A rating)
   - Trivy for container image scanning

## India-specific Compliance Notes

- **GST Act Section 16(4)**: ITC claims require invoice details within prescribed time limits. Ensure `itc_ledger` tracks claim dates.
- **E-Invoice mandate**: Mandatory for businesses with turnover > ₹5 crore (FY 2023-24 onwards). Penalty for non-compliance: ₹10,000.
- **E-Way Bill**: Required for goods movement > ₹50,000. Validity: 1 day per 100 km (extendable). Penalty: 100% of tax + ₹10,000.
- **GSTR-1 due date**: 11th of next month. Late filing fee: ₹50/day (CGST) + ₹50/day (SGST).
- **GSTR-3B due date**: 20th of next month (monthly filers). Interest: 18% p.a. on tax payable.
- **Data retention**: 6 years from end of relevant financial year per GST Act Section 36(4).
- **Audit trail**: All changes to invoices post-IRN generation must be logged. Credit/Debit notes for amendments.
- **RBI guidelines**: Auto-debit for subscriptions requires e-mandate registration with NPCI. Notify users 3 days before debit.

## Tech Stack Versions (Production-Ready)

| Package | Version | Notes |
| --- | --- | --- |
| Node.js | 20 LTS | Active LTS until Apr 2026 |
| NestJS | 10.x | Latest stable |
| Next.js | 14.x | App Router recommended |
| PostgreSQL | 15.x | TimescaleDB 2.13+ |
| Redis | 7.2 | Cluster mode for HA |
| Keycloak | 22.x | Security patches applied |
| Terraform | 1.6+ | Use workspaces for env separation |
| Kubernetes | 1.28+ | If using EKS/GKE/AKS |
