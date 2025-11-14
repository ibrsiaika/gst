# Data Model & ERD

```mermaid
erDiagram
    TENANT ||--o{ GST_REGISTRATION : owns
    TENANT ||--o{ USER : has
    TENANT ||--o{ INVOICE : issues
    TENANT ||--o{ EWAY_BILL : generates
    TENANT ||--o{ RETURN_PERIOD : files
    USER ||--o{ AUDIT_LOG : creates
    INVOICE ||--o{ INVOICE_ITEM : contains
    INVOICE ||--|| IRN_METADATA : results_in
    INVOICE ||--o{ EWAY_BILL : triggers
    RETURN_PERIOD ||--o{ GSTR1_SECTION : aggregates

    TENANT {
        uuid id PK
        text name
        text pan
        text plan_code
        timestamptz created_at
    }

    GST_REGISTRATION {
        uuid id PK
        uuid tenant_id FK
        text gstin
        text state_code
        date registration_date
        text status
        boolean is_primary
    }

    USER {
        uuid id PK
        uuid tenant_id FK
        text email
        text role
        boolean two_factor_enabled
        timestamptz last_login_at
    }

    INVOICE {
        uuid id PK
        uuid tenant_id FK
        text invoice_number
        date invoice_date
        text seller_gstin
        text buyer_gstin
        jsonb items_snapshot
        numeric taxable_value
        numeric tax_amount
        numeric total_value
        text irn
        text irp_status
        timestamptz irp_submitted_at
    }

    INVOICE_ITEM {
        uuid id PK
        uuid invoice_id FK
        text description
        text hsn_code
        numeric quantity
        numeric unit_price
        numeric taxable_value
        numeric tax_rate
        numeric tax_amount
    }

    EWAY_BILL {
        uuid id PK
        uuid tenant_id FK
        uuid invoice_id FK
        text ewb_number
        timestamptz valid_from
        timestamptz valid_to
        jsonb transporter_snapshot
        text status
    }

    RETURN_PERIOD {
        uuid id PK
        uuid tenant_id FK
        text period
        jsonb gstr1_summary
        jsonb gstr3b_summary
        boolean locked
        timestamptz submitted_at
    }

    GSTR1_SECTION {
        uuid id PK
        uuid return_period_id FK
        text code
        jsonb payload
    }

    AUDIT_LOG {
        uuid id PK
        uuid tenant_id FK
        uuid user_id FK
        text action
        jsonb payload
        text payload_hash
        timestamptz created_at
    }

    IRN_METADATA {
        uuid id PK
        uuid invoice_id FK
        text irn
        text ack_no
        timestamptz ack_date
        text qr_code_url
        text signed_json_url
    }
```

## Notes
- `jsonb` columns keep the immutable snapshot of the payloads sent to IRP, e-way bill APIs, and return submissions.
- Hashes are stored in `AUDIT_LOG.payload_hash` to make tampering evident.
- `RETURN_PERIOD.locked` becomes immutable once filings are uploaded to the GST portal to mimic upcoming GSTN behaviour.
