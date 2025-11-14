# GST Compliance SaaS MVP Kit

This repository packages comprehensive planning artifacts for a production-ready GST compliance SaaS platform for Indian businesses. It includes a complete API contract (OpenAPI 3.0), relational data model (PostgreSQL schema + ERD), interactive UI wireframes (Tailwind CSS), and infrastructure deployment guide with real-world government API integration examples.

## Contents

| Deliverable | Location | Highlights |
| --- | --- | --- |
| OpenAPI 3.0 spec | [`docs/api/openapi.yaml`](docs/api/openapi.yaml) | Complete REST API covering: <br/>• Multi-tenant invoice management (B2B, B2C, Export, SEZ)<br/>• IRP (Invoice Registration Portal) e-invoice submission<br/>• E-Way Bill generation with transport details<br/>• GSTIN verification & validation<br/>• GSTR-1 and GSTR-3B return generation<br/>• Razorpay subscription management<br/>• Immutable audit logs |
| ERD & SQL schema | [`docs/data-model/erd.md`](docs/data-model/erd.md) / [`schema.sql`](docs/data-model/schema.sql) | PostgreSQL DDL with:<br/>• GSTIN format validation (regex constraints)<br/>• Tax split logic (CGST+SGST or IGST check constraints)<br/>• HSN/SAC master data with common IT service codes<br/>• ITC (Input Tax Credit) ledger with GSTR-2A reconciliation<br/>• Indian state codes (01-38, 97, 99)<br/>• Indexes optimized for period-based queries |
| UI mockups | [`docs/ui-mockups/index.html`](docs/ui-mockups/index.html) | Clickable Tailwind-based wireframes:<br/>• Tenant dashboard with KPIs (pending IRN, e-way bills, tax liability)<br/>• Invoice editor with GSTIN validation and IRP submission<br/>• E-way bill generator with transporter details<br/>• GSTR-1 section breakdown (B2B, B2CL, CDNR, EXP)<br/>• GSTR-3B liability calculator with ITC set-off<br/>• Admin subscription panel with Razorpay integration |
| Component checklist | [`docs/ui-mockups/README.md`](docs/ui-mockups/README.md) | React/Tailwind component stubs, accessibility cues, responsive design patterns |
| Postman collection | [`docs/postman/postman-outline.json`](docs/postman/postman-outline.json) | Production-ready request templates:<br/>• Internal APIs (create invoice, submit IRP, generate e-way)<br/>• NIC sandbox endpoints with actual IRP JSON payload<br/>• E-Way Bill API with transport & goods details<br/>• GSTR report exports (JSON, CSV, PDF)<br/>• Environment variables for sandbox/production switching |
| Bill of Materials | [`docs/postman/bill-of-materials.md`](docs/postman/bill-of-materials.md) | Infrastructure stack:<br/>• Next.js 14 frontend (Vercel/AWS Amplify)<br/>• NestJS backend with BullMQ queues<br/>• PostgreSQL 15 + TimescaleDB for time-series reporting<br/>• Redis 7 Cluster for high availability<br/>• India-specific compliance notes (GST Act, RBI guidelines)<br/>• Deployment steps with Terraform and smoke tests |

## How to use

### 1. Review the API contract
- Open [`docs/api/openapi.yaml`](docs/api/openapi.yaml) in Swagger Editor or VS Code with OpenAPI extension
- Note the **realistic GST fields**: `invoiceType` (B2B/B2C/EXPORT), `supplyType` (INTRA_STATE/INTER_STATE), tax splits (CGST+SGST vs IGST), HSN codes (4-8 digits), GSTIN validation patterns
- Implement controllers in NestJS/Express following the schema definitions
- Use `class-validator` decorators to enforce constraints (e.g., `@Matches()` for GSTIN regex, `@IsEnum()` for tax rates)
- Connect IRP/e-way endpoints to BullMQ workers for async processing with retry logic (exponential backoff: 1s, 2s, 4s, 8s, 16s)

### 2. Apply the SQL schema
```bash
# Connect to PostgreSQL 15+
psql -h localhost -U postgres -d gst_saas

# Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

# Run the schema
\i docs/data-model/schema.sql

# Verify tables and constraints
\dt
\d+ invoices
```

- **State codes table** pre-populated with all 38 Indian states/UTs (01=J&K to 38=Ladakh)
- **HSN master** includes common IT service SAC codes (998314, 9983) and hardware HSN (85176290, 84713020)
- **Check constraints** enforce business rules:
  - GSTIN format: `^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$`
  - Tax split: `(cgst + sgst = 0) OR (igst = 0)` (no mixing intra and inter-state taxes)
  - Tax rates: `0, 0.1, 0.25, 3, 5, 12, 18, 28` (valid GST slabs)
- Wire up migration tooling (Prisma, TypeORM, or Flyway) to track schema evolution
- Configure partitioning on `invoices` table by month for performance (100K+ invoices/month)

### 3. Explore UI mockups
```bash
# Open in browser
open docs/ui-mockups/index.html
# Or serve via HTTP
npx serve docs/ui-mockups
```

- Click through navigation: Dashboard → Invoice Editor → E-Way Bills → Returns → Admin
- Each screen shows **Tailwind utility classes** that map directly to React components
- **Real GST scenarios**:
  - Dashboard alerts for GSTR-3B due in 4 days, IRP validation failures
  - Invoice form validates seller/buyer GSTIN on blur (API call)
  - E-way bill shows distance calculation (Google Maps API integration)
  - GSTR-1 sections: B2B (business invoices), B2CL (large B2C > ₹2.5L), CDNR (credit notes)
  - GSTR-3B: Outward supplies, reverse charge, ITC available/reversed, tax payable
- Use the component checklist in `docs/ui-mockups/README.md` to implement React components with Storybook

### 4. Set up infrastructure
Follow the bill of materials ([`docs/postman/bill-of-materials.md`](docs/postman/bill-of-materials.md)):

```bash
# Clone infrastructure repo (example)
git clone https://github.com/your-org/gst-saas-infra.git
cd gst-saas-infra

# Configure Terraform variables
cp terraform.tfvars.example terraform.tfvars
# Edit: AWS region (ap-south-1), VPC CIDR, RDS instance size, etc.

# Deploy to sandbox
terraform workspace select sandbox
terraform apply

# Deploy backend
cd ../gst-saas-backend
docker build -t gst-saas-api:latest .
aws ecr get-login-password | docker login --username AWS --password-stdin <ecr-url>
docker tag gst-saas-api:latest <ecr-url>/gst-saas-api:latest
docker push <ecr-url>/gst-saas-api:latest

# Update ECS task definition with new image
aws ecs update-service --cluster gst-saas --service api --force-new-deployment
```

**Key environment variables**:
- `DATABASE_URL`: `postgresql://user:pass@rds-endpoint:5432/gst_saas`
- `REDIS_URL`: `redis://elasticache-endpoint:6379`
- `IRP_BASE_URL`: `https://einv-apisandbox.nic.in` (sandbox) or production URL
- `EWAY_BASE_URL`: `https://preprod-api.ewaybillgst.gov.in` (sandbox)
- `VAULT_ADDR`: `https://vault.internal:8200` (for tenant API credentials)
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`: Get from Razorpay dashboard

### 5. Import Postman collection
```bash
# Import into Postman
# File → Import → docs/postman/postman-outline.json

# Set environment variables
# Environment → Add
# - baseUrl: https://sandbox.api.gst-saas.local/v1
# - token: (get from /auth/login)
# - primaryGstin: 29AABCT1332L1Z5 (sandbox GSTIN)
```

**Test scenarios**:
1. **Create B2B invoice**: Uses real GSTIN format, inter-state supply (IGST 18%)
2. **Submit to IRP sandbox**: Calls NIC API with proper JSON structure (TranDtls, DocDtls, SellerDtls, BuyerDtls, ItemList, ValDtls)
3. **Generate e-way bill**: Includes transporter GSTIN, vehicle number (KA01AB1234), distance (450 km), reason code (1=Supply)
4. **GSTR-1 export**: Returns JSON with sections (B2B, B2CL, B2CS, CDNR, EXP)
5. **GSTR-3B summary**: Auto-calculates liability with ITC set-off

**Government sandbox setup**:
- Register at `https://einv-apisandbox.nic.in` for IRP credentials
- Get e-way bill sandbox access from `https://preprod-api.ewaybillgst.gov.in`
- Use test GSTINs: `29AABCT1332L1Z5` (Karnataka seller), `27AAHCS2781A1ZP` (Maharashtra buyer)

## Next steps

### Development Phase
1. **Implement IRP adapter** with retry + dead-letter queue:
   ```typescript
   // NestJS queue processor
   @Process('irp-submit')
   async handleIrpSubmit(job: Job<IrpSubmitDto>) {
     try {
       const response = await this.irpClient.generateIrn(job.data);
       await this.invoiceRepo.update(job.data.invoiceId, {
         irn: response.Irn,
         ackNo: response.AckNo,
         ackDate: response.AckDt,
         irpStatus: 'success'
       });
     } catch (error) {
       if (job.attemptsMade < 5) {
         throw error; // Retry with exponential backoff
       } else {
         await this.dlqService.push('irp-failed', job.data);
       }
     }
   }
   ```

2. **Add integration tests** targeting NIC sandbox:
   ```bash
   npm run test:e2e -- --grep "IRP submission"
   # Validates: invoice creation → IRP submit → IRN received → QR code generated
   ```

3. **Implement GSTR reconciliation**:
   - Fetch GSTR-2A from GSTN portal (supplier-uploaded invoices)
   - Match with `itc_ledger` entries
   - Flag mismatches (amount difference, missing invoice, duplicate)
   - Generate reconciliation report for accountants

4. **Layer subscription enforcement**:
   ```typescript
   // Razorpay webhook handler
   @Post('webhooks/razorpay')
   async handleWebhook(@Body() payload: RazorpayWebhook) {
     if (payload.event === 'subscription.charged') {
       await this.subscriptionEventRepo.create({
         tenantId: payload.payload.subscription.notes.tenant_id,
         planCode: payload.payload.subscription.plan_id,
         provider: 'razorpay',
         providerReference: payload.payload.payment.id,
         amount: payload.payload.payment.amount / 100,
         status: 'success'
       });
       await this.tenantRepo.updatePlan(tenantId, planCode);
     }
   }
   ```

### Pre-Production Checklist
- [ ] Load test: 500 invoices/sec, < 500ms p95 latency
- [ ] Security scan: OWASP ZAP, npm audit, Trivy
- [ ] Compliance review: GST Act Section 16(4), 36(4), RBI auto-debit mandate
- [ ] DR test: Failover to Chennai region, RTO < 1 hour
- [ ] Pen test: Engage third-party for API security assessment
- [ ] GSP registration: If transaction volume > 10K/month, onboard as GST Suvidha Provider

### Production Launch
1. **Switch to production endpoints**:
   - IRP: `https://api.einvoice1.gst.gov.in` (requires GSTN approval)
   - E-Way Bill: `https://api.ewaybillgst.gov.in`
   - GSTIN API: `https://commonapi.gst.gov.in`

2. **Enable monitoring**:
   - Grafana dashboard: IRP success rate, queue depth, GSTR filing countdown
   - PagerDuty alerts: IRP failures > 5%, queue lag > 5 min, DB connections > 80%

3. **Launch to pilot tenants**:
   - Start with 10-20 friendly customers (turnover < ₹10 crore)
   - Monitor for 1 month during GSTR filing cycle
   - Collect feedback on UX, performance, edge cases

4. **Scale gradually**:
   - Increase to 100 tenants in Q2
   - Add features: credit note flow, advance receipt, TDS integration
   - Hire domain experts (Chartered Accountants) for support

## Real-world GST Compliance Notes

### E-Invoice (IRN) Requirements
- **Mandatory since**: Oct 2020 for turnover > ₹500 Cr; Apr 2023 for > ₹5 Cr
- **Exemptions**: SEZ supplies to SEZ units, high seas sales, passenger transport
- **Validity**: IRN once generated cannot be edited; use credit/debit notes for corrections
- **Penalty**: ₹10,000 per violation (Section 122 of CGST Act)

### E-Way Bill Rules
- **Threshold**: Mandatory for goods movement > ₹50,000 (inter-state or intra-state)
- **Validity**: 1 day per 100 km (min 1 day for < 100 km; extendable once)
- **Vehicle updates**: Can update vehicle number during transit (Part-B update)
- **Penalty**: 100% of tax amount or ₹10,000 (whichever is higher)

### GSTR Filing Deadlines
- **GSTR-1** (Outward supplies): 11th of next month
- **GSTR-3B** (Summary return with payment): 20th of next month
- **Late fee**: ₹50/day per act (CGST + SGST = ₹100/day); max ₹5,000
- **Interest**: 18% p.a. on tax payable from due date

### ITC Claiming Rules (Section 16)
- **Time limit**: Earlier of (a) Nov 30 of next FY or (b) before filing annual return
- **Conditions**: Invoice details in GSTR-2B (auto-drafted from supplier's GSTR-1), goods/services received, tax paid by supplier
- **Reversal scenarios**: Supplier cancels GSTIN, invoice not found in GSTR-2A, payment not made within 180 days

## License

This kit is provided as-is for internal use or client delivery. Adapt the OpenAPI spec, schema, and mockups to your specific business requirements. For production use, ensure compliance with latest GST notifications from CBIC (Central Board of Indirect Taxes and Customs).
