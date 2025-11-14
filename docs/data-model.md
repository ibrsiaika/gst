# Data Model & SQL Schema

## Entity Relationship Diagram

```mermaid
erDiagram
    TENANT ||--o{ GST_REGISTRATION : owns
    TENANT ||--o{ USER : has
    TENANT ||--o{ INVOICE : issues
    TENANT ||--o{ RETURN_PERIOD : reports
    TENANT ||--o{ SUBSCRIPTION_EVENT : tracks
    USER ||--o{ AUDIT_LOG : creates
    INVOICE ||--o{ EWAY_BILL : generates
    INVOICE ||--o{ INVOICE_ITEM : contains
    RETURN_PERIOD ||--o{ GSTR_SECTION : aggregates

    TENANT {
        uuid id PK
        string name
        string pan
        string plan
        jsonb settings
        timestamptz created_at
    }
    GST_REGISTRATION {
        uuid id PK
        uuid tenant_id FK
        string gstin
        string state_code
        date registration_date
        string status
        boolean is_primary
    }
    USER {
        uuid id PK
        uuid tenant_id FK
        string email
        string role
        string password_hash
        boolean mfa_enabled
        timestamptz last_login_at
    }
    INVOICE {
        uuid id PK
        uuid tenant_id FK
        uuid gst_registration_id FK
        string invoice_number
        date invoice_date
        string counterparty_gstin
        string counterparty_name
        numeric taxable_value
        numeric total_value
        jsonb tax_breakup
        jsonb irp_payload
        jsonb irp_response
        string irn_status
        string irn
        timestamptz ack_date
        boolean locked
    }
    INVOICE_ITEM {
        uuid id PK
        uuid invoice_id FK
        string description
        string hsn_code
        numeric quantity
        numeric unit_price
        numeric taxable_value
        numeric tax_rate
    }
    EWAY_BILL {
        uuid id PK
        uuid invoice_id FK
        string eway_bill_no
        timestamptz valid_from
        timestamptz valid_upto
        jsonb transporter_details
        jsonb payload
        string status
    }
    RETURN_PERIOD {
        uuid id PK
        uuid tenant_id FK
        text period
        jsonb gstr1_summary
        jsonb gstr3b_summary
        string filing_status
        timestamptz locked_at
    }
    GSTR_SECTION {
        uuid id PK
        uuid return_period_id FK
        string section_code
        jsonb data
    }
    AUDIT_LOG {
        uuid id PK
        uuid tenant_id FK
        uuid user_id FK
        string action
        jsonb payload_hashes
        timestamptz created_at
        string source_ip
    }
    SUBSCRIPTION_EVENT {
        uuid id PK
        uuid tenant_id FK
        string plan
        string event_type
        jsonb metadata
        timestamptz occurred_at
    }
```

## PostgreSQL Schema Snippets

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  pan CHAR(10) NOT NULL CHECK (pan ~ '^[A-Z]{5}[0-9]{4}[A-Z]$'),
  plan TEXT NOT NULL CHECK (plan IN ('starter','growth','enterprise')),
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE gst_registrations (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  gstin CHAR(15) NOT NULL,
  state_code CHAR(2) NOT NULL,
  registration_date DATE,
  status TEXT NOT NULL CHECK (status IN ('active','cancelled','suspended','pending')),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (tenant_id, gstin)
);

CREATE TABLE users (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email CITEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','accountant','viewer')),
  password_hash TEXT NOT NULL,
  mfa_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  UNIQUE (tenant_id, email)
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  gst_registration_id UUID NOT NULL REFERENCES gst_registrations(id),
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  counterparty_gstin CHAR(15) NOT NULL,
  counterparty_name TEXT,
  place_of_supply CHAR(2) NOT NULL,
  taxable_value NUMERIC(14,2) NOT NULL,
  total_value NUMERIC(14,2) NOT NULL,
  tax_breakup JSONB NOT NULL,
  irp_payload JSONB,
  irp_response JSONB,
  irn_status TEXT NOT NULL DEFAULT 'pending',
  irn TEXT,
  ack_no TEXT,
  ack_date TIMESTAMPTZ,
  qr_code TEXT,
  signed_invoice TEXT,
  locked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (irn_status IN ('pending','success','failed'))
);

CREATE TABLE invoice_items (
  id UUID PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  hsn_code TEXT NOT NULL,
  quantity NUMERIC(12,3) NOT NULL,
  unit_price NUMERIC(14,2) NOT NULL,
  taxable_value NUMERIC(14,2) NOT NULL,
  tax_rate NUMERIC(5,2) NOT NULL
);

CREATE TABLE eway_bills (
  id UUID PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  eway_bill_no TEXT NOT NULL,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_upto TIMESTAMPTZ NOT NULL,
  transporter_details JSONB NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active','cancelled','expired'))
);

CREATE TABLE return_periods (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  gstr1_summary JSONB NOT NULL,
  gstr3b_summary JSONB NOT NULL,
  filing_status TEXT NOT NULL CHECK (filing_status IN ('draft','locked','filed')),
  locked_at TIMESTAMPTZ,
  UNIQUE (tenant_id, period)
);

CREATE TABLE gstr_sections (
  id UUID PRIMARY KEY,
  return_period_id UUID NOT NULL REFERENCES return_periods(id) ON DELETE CASCADE,
  section_code TEXT NOT NULL,
  data JSONB NOT NULL,
  UNIQUE (return_period_id, section_code)
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  payload_hashes JSONB NOT NULL,
  source_ip INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscription_events (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('trial_started','activated','renewed','suspended','cancelled')),
  metadata JSONB,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```
