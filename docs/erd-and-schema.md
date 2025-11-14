# ERD & Relational Schema (PostgreSQL)

The diagram below (textual description) outlines primary entities, relationships, and compliance-focused fields. Use tools such as dbdiagram.io or DrawSQL to render graphically.

```
[Tenant] 1---* [GSTRegistration]
[Tenant] 1---* [User]
[Tenant] 1---* [SubscriptionInvoice]
[Tenant] 1---* [Invoice] 1---* [InvoiceItem]
[Invoice] 1---0..1 [IRPSubmission]
[Invoice] 1---0..1 [EWayBill]
[Tenant] 1---* [Counterparty]
[Counterparty] 1---* [GSTVerification]
[Tenant] 1---* [ReturnPeriod]
[ReturnPeriod] 1---* [ReturnSummaryLine]
[Tenant] 1---* [AuditLog]
```

## Table Definitions

### 1. `tenants`
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pan CHAR(10) NOT NULL UNIQUE,
  legal_name TEXT NOT NULL,
  brand_name TEXT,
  subscription_plan TEXT NOT NULL CHECK (subscription_plan IN ('starter','growth','enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','trial_expired')),
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tenants_pan ON tenants (pan);
```

### 2. `gst_registrations`
```sql
CREATE TABLE gst_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  gstin CHAR(15) NOT NULL,
  state_code CHAR(2) NOT NULL,
  registration_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  irp_client_id TEXT,
  irp_client_secret TEXT,
  eway_username TEXT,
  eway_password TEXT,
  last_synced_at TIMESTAMPTZ,
  UNIQUE (tenant_id, gstin)
);
CREATE INDEX idx_gst_registrations_status ON gst_registrations (status);
```

### 3. `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email CITEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','accountant','viewer')),
  phone TEXT,
  mfa_enabled BOOLEAN NOT NULL DEFAULT false,
  last_login_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, email)
);
```

### 4. `subscriptions`
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('razorpay','stripe')),
  provider_subscription_id TEXT NOT NULL,
  plan_code TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('trial','active','past_due','cancelled')),
  invoice_quota INT,
  eway_quota INT,
  renews_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 5. `counterparties`
```sql
CREATE TABLE counterparties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('customer','supplier','both')),
  legal_name TEXT NOT NULL,
  gstin CHAR(15),
  state_code CHAR(2),
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address JSONB,
  last_verified_at TIMESTAMPTZ,
  verification_status TEXT CHECK (verification_status IN ('pending','valid','invalid','inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_counterparties_tenant_type ON counterparties (tenant_id, type);
```

### 6. `gst_verifications`
```sql
CREATE TABLE gst_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counterparty_id UUID NOT NULL REFERENCES counterparties(id) ON DELETE CASCADE,
  gstin CHAR(15) NOT NULL,
  legal_name TEXT,
  trade_name TEXT,
  status TEXT,
  registration_date DATE,
  source TEXT,
  response_payload JSONB,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_gst_verifications_gstin ON gst_verifications (gstin);
```

### 7. `invoices`
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  gst_registration_id UUID NOT NULL REFERENCES gst_registrations(id),
  counterparty_id UUID NOT NULL REFERENCES counterparties(id),
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  supply_type TEXT NOT NULL CHECK (supply_type IN ('B2B','B2C','SEZ','DE')),
  place_of_supply CHAR(2) NOT NULL,
  total_taxable_value NUMERIC(14,2) NOT NULL,
  total_tax_amount NUMERIC(14,2) NOT NULL,
  total_invoice_value NUMERIC(14,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  irp_status TEXT NOT NULL DEFAULT 'pending' CHECK (irp_status IN ('pending','success','failed','cancelled')),
  eway_status TEXT NOT NULL DEFAULT 'not_required' CHECK (eway_status IN ('not_required','pending','generated','cancelled')),
  hash BYTEA, -- immutable audit hash
  locked BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, invoice_number)
);
CREATE INDEX idx_invoices_period ON invoices (tenant_id, invoice_date);
```

### 8. `invoice_items`
```sql
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  hsn TEXT,
  quantity NUMERIC(14,3) NOT NULL,
  unit_price NUMERIC(14,2) NOT NULL,
  taxable_value NUMERIC(14,2) NOT NULL,
  cgst_rate NUMERIC(4,2),
  sgst_rate NUMERIC(4,2),
  igst_rate NUMERIC(4,2),
  cess_rate NUMERIC(4,2),
  metadata JSONB
);
```

### 9. `irp_submissions`
```sql
CREATE TABLE irp_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL UNIQUE REFERENCES invoices(id) ON DELETE CASCADE,
  request_payload JSONB NOT NULL,
  response_payload JSONB,
  irn TEXT,
  ack_no TEXT,
  ack_date TIMESTAMPTZ,
  qr_code_base64 TEXT,
  status TEXT NOT NULL CHECK (status IN ('queued','submitted','success','failed','cancelled')),
  error_code TEXT,
  error_message TEXT,
  retries INT NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 10. `eway_bills`
```sql
CREATE TABLE eway_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL UNIQUE REFERENCES invoices(id) ON DELETE CASCADE,
  ewb_no TEXT,
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','generated','expired','cancelled')),
  transporter_name TEXT,
  transporter_id TEXT,
  vehicle_number TEXT,
  distance_km INT,
  pdf_url TEXT,
  response_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 11. `return_periods`
```sql
CREATE TABLE return_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  form TEXT NOT NULL CHECK (form IN ('GSTR1','GSTR3B')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','locked','submitted')),
  checksum TEXT,
  generated_at TIMESTAMPTZ,
  UNIQUE (tenant_id, form, period_start)
);
```

### 12. `return_summary_lines`
```sql
CREATE TABLE return_summary_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_period_id UUID NOT NULL REFERENCES return_periods(id) ON DELETE CASCADE,
  section_code TEXT NOT NULL,
  label TEXT,
  taxable_value NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  metadata JSONB,
  UNIQUE (return_period_id, section_code)
);
```

### 13. `audit_logs`
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  payload JSONB NOT NULL,
  hash BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_entity ON audit_logs (tenant_id, entity_type, entity_id);
```

### 14. `job_queue`
- Recommended to use BullMQ backed by Redis, but for auditability store metadata in Postgres.
```sql
CREATE TABLE job_queue (
  id BIGSERIAL PRIMARY KEY,
  job_type TEXT NOT NULL,
  reference_id UUID,
  payload JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued','processing','succeeded','failed','dead-letter')),
  attempts INT NOT NULL DEFAULT 0,
  last_error TEXT,
  available_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Additional Notes
- Enable row-level security (RLS) per tenant for multi-tenancy.
- Use pgcrypto for encryption of API credentials (stored in `gst_registrations`).
- Partition `invoices`, `audit_logs`, and `return_periods` by month for performance.
- Add materialized views for dashboard KPIs (e.g., `tenant_tax_liability_mv`).
