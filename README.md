# GST Compliance SaaS MVP Kit

This repository packages the planning artefacts for the GST compliance MVP requested: API contract, ERD + SQL schema, clickable Tailwind mockups, and a bill-of-materials/Postman outline. Use it as a blueprint to implement the private subscription SaaS for Indian GST-registered businesses.

## Contents

| Deliverable | Location | Highlights |
| --- | --- | --- |
| OpenAPI skeleton | [`docs/api/openapi.yaml`](docs/api/openapi.yaml) | Endpoints for tenants, invoices, IRP submission, e-way bills, GSTIN validation, reporting, subscriptions, and admin audit logs. |
| ERD & schema | [`docs/data-model/erd.md`](docs/data-model/erd.md) / [`schema.sql`](docs/data-model/schema.sql) | Mermaid ERD plus executable PostgreSQL DDL reflecting immutable audit requirements. |
| UI mockups | [`docs/ui-mockups/index.html`](docs/ui-mockups/index.html) | Clickable Tailwind-based wireframes for dashboard, invoices, e-way bills, returns, and admin subscription console. |
| Component checklist | [`docs/ui-mockups/README.md`](docs/ui-mockups/README.md) | React/Tailwind component stubs + testing cues. |
| BoM + Postman | [`docs/postman/bill-of-materials.md`](docs/postman/bill-of-materials.md) / [`postman-outline.json`](docs/postman/postman-outline.json) | Infra stack, deployment guidance, and sandbox API call templates (IRP, e-way, GSTIN). |

## How to use

1. **Review the API contract** and plug it into your NestJS/Express controllers. Extend the schemas for validation and connect them to queue-backed workers (BullMQ) for IRP/e-way calls.
2. **Apply the SQL schema** to PostgreSQL 15+. Enable `uuid-ossp`, `pgcrypto`, and `citext` extensions. Wire up migration tooling (Prisma/TypeORM/Flyway) to track future changes.
3. **Open the mockups** via `docs/ui-mockups/index.html`. Each navigation item reveals a screen showing Tailwind utility suggestions that translate directly to React components.
4. **Set up infra** following the bill-of-materials: Next.js frontend, NestJS backend, PostgreSQL, Redis, S3-compatible storage, Vault, and observability stack.
5. **Import the Postman outline** and replace variables (`{{token}}`, `{{primaryGstin}}`, etc.) to test against both internal APIs and the government sandboxes before going live.

## Next steps

- Flesh out IRP/e-way adapters with retry + dead-letter queues per the acceptance criteria.
- Add integration tests targeting `einv-apisandbox.nic.in` and `preprod-api.ewaybillgst.gov.in`.
- Layer on subscription enforcement (Razorpay webhooks → `subscription_events`) before launching to pilot tenants.
