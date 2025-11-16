# [P0] Implement IRP (E-Invoice) API Adapter

**Epic:** Compliance Automation  
**Story Points:** 8  
**Priority:** Critical (P0)  
**Type:** Feature  
**Labels:** compliance, e-invoice, backend

## Description
Implement complete IRP (Invoice Registration Portal) API integration for automated e-invoice generation and IRN (Invoice Reference Number) retrieval.

## Acceptance Criteria
- [ ] Create `IrpService` in `backend/src/modules/irp/`
- [ ] Implement authentication with NIC IRP sandbox
- [ ] Support invoice upload to IRP
- [ ] Parse and store IRN, ACK number, signed JSON, QR code
- [ ] Implement retry logic (exponential backoff: 1s, 2s, 4s, 8s, 16s)
- [ ] Handle IRP error responses with proper error codes
- [ ] Implement idempotency (prevent duplicate submissions)
- [ ] Store IRP request/response logs in database
- [ ] Add unit tests (80% coverage)
- [ ] Add integration tests with IRP sandbox

## Technical Requirements
```typescript
interface IrpInvoicePayload {
  Version: string;
  TranDtls: TransactionDetails;
  DocDtls: DocumentDetails;
  SellerDtls: SellerDetails;
  BuyerDtls: BuyerDetails;
  ItemList: InvoiceItem[];
  ValDtls: ValueDetails;
}

interface IrpResponse {
  Irn: string;
  AckNo: string;
  AckDt: string;
  SignedInvoice: string;
  SignedQRCode: string;
  Status: string;
  EwbNo?: string;
}
```

## Environment Variables
```env
IRP_BASE_URL=https://einv-apisandbox.nic.in
IRP_CLIENT_ID={EINVOICE_API_KEY}
IRP_CLIENT_SECRET={EINVOICE_SECRET}
IRP_USERNAME={IRP_USERNAME}
IRP_PASSWORD={IRP_PASSWORD}
```

## API Endpoints
- `POST /einv/v1.03/Invoice/Generate` - Generate IRN
- `GET /einv/v1.03/Invoice/IRN/{irn}` - Get invoice by IRN
- `POST /einv/v1.03/Invoice/Cancel` - Cancel IRN

## Dependencies
- None (foundation module)

## Risks
- IRP API downtime → Mitigate with queue persistence
- Rate limiting → Implement request throttling
- Invalid GSTIN → Validate before submission

## Related Issues
- Depends on: None
- Blocks: #3 (Queue worker), #4 (GSTR-1 export)
