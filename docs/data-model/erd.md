# Data Model & ERD

```mermaid
erDiagram
    TENANT ||--o{ GST_REGISTRATION : owns
    TENANT ||--o{ USER : has
    TENANT ||--o{ INVOICE : issues
    TENANT ||--o{ EWAY_BILL : generates
    TENANT ||--o{ RETURN_PERIOD : files
    TENANT ||--o{ ITC_LEDGER : tracks
    USER ||--o{ AUDIT_LOG : creates
    INVOICE ||--o{ INVOICE_ITEM : contains
    INVOICE ||--|| IRN_METADATA : results_in
    INVOICE ||--o{ EWAY_BILL : triggers
    RETURN_PERIOD ||--o{ GSTR1_SECTION : aggregates
    HSN_MASTER ||--o{ INVOICE_ITEM : validates
    STATE_CODES ||--o{ INVOICE : validates_place_of_supply

    TENANT {
        uuid id PK
        text name
        char pan "10 chars - PAN number"
        text plan_code
        timestamptz created_at
    }

    GST_REGISTRATION {
        uuid id PK
        uuid tenant_id FK
        char gstin "15 chars - format validated"
        char state_code "2 digits"
        date registration_date
        text status "ACTIVE/CANCELLED/SUSPENDED"
        boolean is_primary
    }

    USER {
        uuid id PK
        uuid tenant_id FK
        text email
        text role "admin/accountant/viewer"
        boolean two_factor_enabled
        timestamptz last_login_at
    }

    INVOICE {
        uuid id PK
        uuid tenant_id FK
        text invoice_number
        date invoice_date
        text invoice_type "B2B/B2C/EXPORT/SEZ"
        text document_type "INV/CRN/DBN"
        char seller_gstin "15 chars with regex"
        text seller_legal_name
        text seller_trade_name
        jsonb seller_address
        text buyer_gstin "15 chars or URP"
        text buyer_legal_name
        jsonb buyer_address
        char place_of_supply "2 digit state code"
        text supply_type "INTRA_STATE/INTER_STATE"
        boolean reverse_charge
        numeric taxable_value
        numeric total_cgst
        numeric total_sgst
        numeric total_igst
        numeric total_cess
        numeric tax_amount
        numeric total_value
        text irn "Unique IRN from IRP"
        text ack_no
        timestamptz ack_date
        text irp_status "pending/queued/success/failed"
        timestamptz irp_submitted_at
        text irp_error_message
        jsonb export_details
    }

    INVOICE_ITEM {
        uuid id PK
        uuid invoice_id FK
        text description
        varchar hsn_code "4-8 digits HSN/SAC"
        varchar unit "NOS/KGS/MTR etc"
        numeric quantity
        numeric unit_price
        numeric discount
        numeric taxable_value
        numeric tax_rate "0,0.1,0.25,3,5,12,18,28"
        numeric cgst_amount
        numeric sgst_amount
        numeric igst_amount
        numeric cess_amount
        numeric tax_amount
        numeric item_total
    }

    EWAY_BILL {
        uuid id PK
        uuid tenant_id FK
        uuid invoice_id FK
        text ewb_number
        timestamptz valid_from
        timestamptz valid_to
        jsonb transporter_snapshot
        text status "ACTIVE/CANCELLED/EXPIRED"
    }

    RETURN_PERIOD {
        uuid id PK
        uuid tenant_id FK
        char period "MMYYYY - e.g. 052024"
        jsonb gstr1_summary
        jsonb gstr3b_summary
        boolean locked
        timestamptz submitted_at
    }

    GSTR1_SECTION {
        uuid id PK
        uuid return_period_id FK
        text code "B2B/B2CL/B2CS/CDNR/EXP"
        jsonb payload
    }

    AUDIT_LOG {
        uuid id PK
        uuid tenant_id FK
        uuid user_id FK
        text action
        jsonb payload
        text payload_hash "SHA256 for immutability"
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

    HSN_MASTER {
        varchar hsn_code PK "4-8 digit HSN/SAC"
        text description
        text uqc "Unit Quantity Code"
        numeric gst_rate "Default GST rate %"
        numeric cess_rate "Cess rate %"
        date effective_from
        date effective_to
    }

    ITC_LEDGER {
        uuid id PK
        uuid tenant_id FK
        char gstin "15 chars"
        char period "MMYYYY"
        text document_type "PURCHASE_INVOICE/CREDIT_NOTE/ISD/TDS_TCS"
        char supplier_gstin "15 chars"
        text document_number
        date document_date
        numeric taxable_value
        numeric igst_amount
        numeric cgst_amount
        numeric sgst_amount
        numeric cess_amount
        boolean itc_claimed
        boolean itc_reversed
        text reversal_reason
        boolean gstr2a_matched
        text reconciliation_status "MATCHED/MISMATCHED/MISSING_IN_2A"
    }

    STATE_CODES {
        char state_code PK "2 digits"
        text state_name
        boolean ut_flag "Union Territory flag"
    }
```

## Notes
- **GSTIN validation**: All GSTIN fields enforce the 15-character format: `^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$`
- **Tax split logic**: For intra-state supplies, CGST + SGST; for inter-state, only IGST. Check constraint ensures `(cgst + sgst = 0) OR (igst = 0)`.
- **HSN codes**: 4-digit (chapter level) to 8-digit (item level). Services use SAC (Service Accounting Code), same structure.
- **ITC ledger**: Tracks Input Tax Credit from purchases. GSTR-2A auto-populated by suppliers' GSTR-1. Reconciliation status tracks matching.
- **Return periods**: GSTR-1 (outward supplies) and GSTR-3B (monthly return with tax payment) summaries stored as JSONB for flexibility.
- **Immutability**: `AUDIT_LOG.payload_hash` uses SHA-256. `RETURN_PERIOD.locked` prevents modifications post-filing.
- **State codes**: Full list of Indian states/UTs with 2-digit codes (01-38, 97, 99). Used for place of supply validation and tax jurisdiction determination.
