# Minimal Bill of Materials (BoM)

| Layer | Component | Purpose | Notes |
| --- | --- | --- | --- |
| Frontend | Next.js 14 + React + Tailwind | Tenant and admin UI | Deploy on Vercel/AWS Amplify; env vars for API URL + Razorpay key. |
| Backend | NestJS (Node 20) | REST/GraphQL services for invoices, returns, subscriptions | Use Swagger module to expose `/docs`. |
| Auth | Keycloak 22 | Multi-tenant RBAC, SSO, OTP | Configure realms per tenant; integrate with Razorpay webhooks. |
| Database | PostgreSQL 15 + Timescale extension | Transactional storage & reporting snapshots | Enable logical replication for analytics. |
| Cache/Queue | Redis 7 + BullMQ | IRP/e-way retry queue, rate limiting | Configure separate queues: `irp-submit`, `eway-generate`, `gstin-verify`. |
| Object Storage | MinIO or AWS S3 | Signed IRP JSON, QR images, PDFs | Server-side encryption using KMS-managed keys. |
| Secrets | HashiCorp Vault / AWS Secrets Manager | Store government API credentials per tenant | Scope tokens by tenant to meet compliance. |
| Observability | Prometheus + Grafana + Loki, Sentry | Metrics, logs, tracing | Collect IRP latency, queue lag, API failure rate. |
| CI/CD | GitHub Actions + Terraform Cloud | Build/test/deploy & infra-as-code | Run integration tests against sandbox nightly. |
| Payments | Razorpay Subscription APIs | Plan enforcement & billing | Webhook consumer updates `subscription_events`. |

## Environment-specific considerations

- **Sandbox**: connect to `einv-apisandbox.nic.in` and `preprod-api.ewaybillgst.gov.in`. Use demo PAN/GSTIN credentials.
- **Production**: dedicated VPC, private subnets for backend + DB, NAT gateways for outbound IRP calls. Attach WAF to ingress.
- **Data residency**: host in Mumbai (ap-south-1) or equivalent region per contract. Enable cross-region backups (Chennai).

## Deployment Steps

1. Provision infrastructure via Terraform modules (network, RDS, Redis, ECS/EKS or GKE).
2. Deploy Keycloak + configure identity providers (email OTP/SMS via AWS SNS or MSG91).
3. Ship backend containers with environment variables for queue DSN, DB URL, and per-tenant credential vault paths.
4. Sync API schema with Postman collection (below) and share with QA.
5. Run smoke tests: invoice creation, IRP sandbox push, e-way bill generation, GSTR exports, subscription checkout (Razorpay test key).
