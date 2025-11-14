CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    pan CHAR(10) NOT NULL,
    plan_code TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE gst_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    gstin CHAR(15) NOT NULL,
    state_code CHAR(2) NOT NULL,
    registration_date DATE NOT NULL,
    status TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    UNIQUE (tenant_id, gstin)
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email CITEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin','accountant','viewer')),
    two_factor_enabled BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, email)
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    invoice_date DATE NOT NULL,
    invoice_type TEXT NOT NULL CHECK (invoice_type IN ('B2B','B2C','EXPORT','DEEMED_EXPORT','SEZ_WITH_PAYMENT','SEZ_WITHOUT_PAYMENT')),
    document_type TEXT NOT NULL DEFAULT 'INV' CHECK (document_type IN ('INV','CRN','DBN')),
    seller_gstin CHAR(15) NOT NULL CHECK (seller_gstin ~ '^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$'),
    seller_legal_name TEXT NOT NULL,
    seller_trade_name TEXT,
    seller_address JSONB NOT NULL,
    buyer_gstin TEXT NOT NULL CHECK (buyer_gstin ~ '^(\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}|URP)$'),
    buyer_legal_name TEXT NOT NULL,
    buyer_address JSONB NOT NULL,
    place_of_supply CHAR(2) NOT NULL CHECK (place_of_supply ~ '^\d{2}$'),
    supply_type TEXT NOT NULL CHECK (supply_type IN ('INTRA_STATE','INTER_STATE')),
    reverse_charge BOOLEAN NOT NULL DEFAULT false,
    taxable_value NUMERIC(14,2) NOT NULL CHECK (taxable_value >= 0),
    total_cgst NUMERIC(14,2) DEFAULT 0 CHECK (total_cgst >= 0),
    total_sgst NUMERIC(14,2) DEFAULT 0 CHECK (total_sgst >= 0),
    total_igst NUMERIC(14,2) DEFAULT 0 CHECK (total_igst >= 0),
    total_cess NUMERIC(14,2) DEFAULT 0 CHECK (total_cess >= 0),
    tax_amount NUMERIC(14,2) NOT NULL,
    total_value NUMERIC(14,2) NOT NULL,
    irp_status TEXT NOT NULL DEFAULT 'pending' CHECK (irp_status IN ('pending','queued','submitted','success','failed','cancelled')),
    irn TEXT UNIQUE,
    ack_no TEXT,
    ack_date TIMESTAMPTZ,
    signed_json_url TEXT,
    qr_code_url TEXT,
    irp_submitted_at TIMESTAMPTZ,
    irp_error_message TEXT,
    export_details JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, invoice_number),
    CHECK ((total_cgst + total_sgst = 0) OR (total_igst = 0))
);

CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    hsn_code VARCHAR(8) NOT NULL CHECK (hsn_code ~ '^\d{4,8}$'),
    quantity NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(10) NOT NULL DEFAULT 'NOS',
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    discount NUMERIC(12,2) DEFAULT 0 CHECK (discount >= 0),
    taxable_value NUMERIC(14,2) NOT NULL CHECK (taxable_value >= 0),
    tax_rate NUMERIC(5,2) NOT NULL CHECK (tax_rate IN (0, 0.1, 0.25, 3, 5, 12, 18, 28)),
    cgst_amount NUMERIC(14,2) DEFAULT 0,
    sgst_amount NUMERIC(14,2) DEFAULT 0,
    igst_amount NUMERIC(14,2) DEFAULT 0,
    cess_amount NUMERIC(14,2) DEFAULT 0,
    tax_amount NUMERIC(14,2) NOT NULL,
    item_total NUMERIC(14,2) NOT NULL,
    CHECK ((cgst_amount + sgst_amount = 0) OR (igst_amount = 0))
);

CREATE TABLE eway_bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    ewb_number TEXT NOT NULL,
    transporter_snapshot JSONB NOT NULL,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_to TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL,
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE return_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    period CHAR(7) NOT NULL,
    gstr1_summary JSONB NOT NULL,
    gstr3b_summary JSONB NOT NULL,
    locked BOOLEAN NOT NULL DEFAULT false,
    submitted_at TIMESTAMPTZ,
    UNIQUE (tenant_id, period)
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    payload JSONB NOT NULL,
    payload_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE subscription_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_code TEXT NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('razorpay','stripe')),
    provider_reference TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoices_tenant_period ON invoices (tenant_id, invoice_date);
CREATE INDEX idx_invoices_irp_status ON invoices (irp_status);
CREATE INDEX idx_invoices_seller_gstin ON invoices (seller_gstin);
CREATE INDEX idx_invoices_buyer_gstin ON invoices (buyer_gstin);
CREATE INDEX idx_invoices_irn ON invoices (irn) WHERE irn IS NOT NULL;
CREATE INDEX idx_eway_bills_invoice ON eway_bills (invoice_id);
CREATE INDEX idx_return_periods_locked ON return_periods (locked);
CREATE INDEX idx_audit_logs_tenant_time ON audit_logs (tenant_id, created_at);

-- HSN/SAC master table for validation and reporting
CREATE TABLE hsn_master (
    hsn_code VARCHAR(8) PRIMARY KEY CHECK (hsn_code ~ '^\d{4,8}$'),
    description TEXT NOT NULL,
    uqc TEXT,
    gst_rate NUMERIC(5,2),
    cess_rate NUMERIC(5,2) DEFAULT 0,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Common HSN codes for IT and services
INSERT INTO hsn_master (hsn_code, description, uqc, gst_rate, effective_from) VALUES
('998314', 'Information technology software services', 'NOS', 18, '2017-07-01'),
('9983', 'Information technology services', 'NOS', 18, '2017-07-01'),
('997331', 'Consultancy services (management)', 'NOS', 18, '2017-07-01'),
('996511', 'Advertising services', 'NOS', 18, '2017-07-01'),
('85176290', 'Routers and switches', 'NOS', 18, '2017-07-01'),
('84713020', 'Laptops', 'NOS', 18, '2017-07-01'),
('998599', 'Other professional technical business services', 'NOS', 18, '2017-07-01');

-- ITC ledger for tracking input tax credit
CREATE TABLE itc_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    gstin CHAR(15) NOT NULL,
    period CHAR(7) NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('PURCHASE_INVOICE','CREDIT_NOTE','DEBIT_NOTE','ISD','TDS_TCS')),
    supplier_gstin CHAR(15),
    document_number TEXT NOT NULL,
    document_date DATE NOT NULL,
    taxable_value NUMERIC(14,2) NOT NULL,
    igst_amount NUMERIC(14,2) DEFAULT 0,
    cgst_amount NUMERIC(14,2) DEFAULT 0,
    sgst_amount NUMERIC(14,2) DEFAULT 0,
    cess_amount NUMERIC(14,2) DEFAULT 0,
    itc_claimed BOOLEAN NOT NULL DEFAULT false,
    itc_reversed BOOLEAN NOT NULL DEFAULT false,
    reversal_reason TEXT,
    gstr2a_matched BOOLEAN DEFAULT false,
    reconciliation_status TEXT CHECK (reconciliation_status IN ('MATCHED','MISMATCHED','MISSING_IN_2A','PENDING')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, gstin, document_number, document_date)
);

CREATE INDEX idx_itc_ledger_period ON itc_ledger (tenant_id, gstin, period);
CREATE INDEX idx_itc_ledger_claimed ON itc_ledger (itc_claimed, itc_reversed);

-- State codes master (for validation)
CREATE TABLE state_codes (
    state_code CHAR(2) PRIMARY KEY CHECK (state_code ~ '^\d{2}$'),
    state_name TEXT NOT NULL UNIQUE,
    ut_flag BOOLEAN NOT NULL DEFAULT false
);

INSERT INTO state_codes (state_code, state_name, ut_flag) VALUES
('01', 'Jammu and Kashmir', true),
('02', 'Himachal Pradesh', false),
('03', 'Punjab', false),
('04', 'Chandigarh', true),
('05', 'Uttarakhand', false),
('06', 'Haryana', false),
('07', 'Delhi', true),
('08', 'Rajasthan', false),
('09', 'Uttar Pradesh', false),
('10', 'Bihar', false),
('11', 'Sikkim', false),
('12', 'Arunachal Pradesh', false),
('13', 'Nagaland', false),
('14', 'Manipur', false),
('15', 'Mizoram', false),
('16', 'Tripura', false),
('17', 'Meghalaya', false),
('18', 'Assam', false),
('19', 'West Bengal', false),
('20', 'Jharkhand', false),
('21', 'Odisha', false),
('22', 'Chhattisgarh', false),
('23', 'Madhya Pradesh', false),
('24', 'Gujarat', false),
('25', 'Daman and Diu', true),
('26', 'Dadra and Nagar Haveli', true),
('27', 'Maharashtra', false),
('28', 'Andhra Pradesh', false),
('29', 'Karnataka', false),
('30', 'Goa', false),
('31', 'Lakshadweep', true),
('32', 'Kerala', false),
('33', 'Tamil Nadu', false),
('34', 'Puducherry', true),
('35', 'Andaman and Nicobar Islands', true),
('36', 'Telangana', false),
('37', 'Andhra Pradesh (New)', false),
('38', 'Ladakh', true),
('97', 'Other Territory', false),
('99', 'Centre Jurisdiction', false);
