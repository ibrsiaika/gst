# [P0] Implement GSTR-1 Export (JSON/CSV)

**Epic:** Compliance Automation  
**Story Points:** 8  
**Priority:** Critical (P0)  
**Type:** Feature  
**Labels:** compliance, gstr, export

## Description
Generate GSTR-1 return-ready JSON and CSV files following GSTN schema.

## Acceptance Criteria
- [ ] Create `GstrService` in `backend/src/modules/gstr/`
- [ ] Implement B2B section export
- [ ] Implement B2CL section export  
- [ ] Implement B2CS section export
- [ ] Implement CDNR section export (credit/debit notes)
- [ ] Implement EXP section export (exports)
- [ ] Validate against GSTN JSON schema
- [ ] Generate CSV format
- [ ] Add summary totals
- [ ] Add unit tests (80% coverage)
- [ ] Add integration tests

## GSTR-1 Sections
```typescript
interface Gstr1Export {
  gstin: string;
  fp: string; // Financial period MMYYYY
  b2b: B2BInvoice[];
  b2cl: B2CLInvoice[];
  b2cs: B2CSInvoice[];
  cdnr: CreditDebitNote[];
  exp: ExportInvoice[];
}
```

## API Endpoint
```
POST /v1/gstr/gstr1/export
Body: { gstin, fromDate, toDate }
Response: { jsonUrl, csvUrl }
```

## Dependencies
- Depends on: Invoice data
- Blocks: None
