# [P0] Implement E-Way Bill API Adapter

**Epic:** Compliance Automation  
**Story Points:** 5  
**Priority:** Critical (P0)  
**Type:** Feature  
**Labels:** compliance, eway-bill, backend

## Description
Implement E-Way Bill API integration for automated e-way bill generation for goods movement.

## Acceptance Criteria
- [ ] Create `EwayBillService` in `backend/src/modules/eway-bill/`
- [ ] Implement authentication with E-Way Bill sandbox
- [ ] Support e-way bill generation
- [ ] Support e-way bill update (vehicle, transporter)
- [ ] Support e-way bill cancellation
- [ ] Calculate validity period (1 day per 100 km)
- [ ] Store EWB number and validity dates
- [ ] Add unit tests (80% coverage)
- [ ] Add integration tests with E-Way Bill sandbox

## Technical Requirements
```typescript
interface EwayBillPayload {
  supplyType: string;
  subSupplyType: string;
  docType: string;
  docNo: string;
  docDate: string;
  fromGstin: string;
  toGstin: string;
  transporterId?: string;
  transporterDocNo?: string;
  transportMode: string;
  distance: number;
  vehicleNo?: string;
  itemList: EwayBillItem[];
  totalValue: number;
  cgstValue: number;
  sgstValue: number;
  igstValue: number;
  cessValue: number;
}

interface EwayBillResponse {
  ewayBillNo: string;
  ewayBillDate: string;
  validUpto: string;
}
```

## Environment Variables
```env
EWAY_BASE_URL=https://preprod-api.ewaybillgst.gov.in
EWAY_API_KEY={EWAY_API_KEY}
EWAY_USERNAME={EWAY_USERNAME}
EWAY_PASSWORD={EWAY_PASSWORD}
```

## Dependencies
- None

## Related Issues
- Depends on: None
- Blocks: #4 (GSTR-1 export)
