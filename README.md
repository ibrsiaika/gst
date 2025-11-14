# GST Compliance SaaS – Planning Artifacts

This repository contains planning deliverables for the GST SaaS MVP described in the spec:

1. [`docs/openapi-skeleton.md`](docs/openapi-skeleton.md) — endpoint-by-endpoint REST skeleton with request/response examples, auth expectations, and testing hooks so each flow (invoice → IRP, e-way, returns, admin) can be validated end to end.
2. [`docs/erd-and-schema.md`](docs/erd-and-schema.md) — ERD narrative plus PostgreSQL schema (tables, constraints, indexes) covering tenants, invoices, IRP submissions, e-way bills, returns, audit logs, and job queues.
3. [`docs/ui-mockups.md`](docs/ui-mockups.md) — React/Tailwind component list + screen descriptions, accessibility notes, and testing scenarios for dashboard, invoices, returns, counterparty directory, and admin panels.
4. [`docs/postman-collection-outline.md`](docs/postman-collection-outline.md) — structure for an automated Postman/Newman suite touching auth, GSTIN verification, invoices, IRP, e-way bills, returns, subscription billing, and admin endpoints (with sandbox references).

Use these documents as handover material for the engineering team to implement and test the MVP comprehensively, including admin functionality and error-handled flows.
