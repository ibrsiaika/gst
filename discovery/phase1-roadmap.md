# Phase 1 Implementation Roadmap

## Overview
This document outlines the implementation plan for Phase 1: Compliance Automation.

## Timeline: Week 1-2 (10 working days)

### Week 1: Days 1-5

#### Day 1-2: IRP API Adapter (#1)
- Set up IRP module structure
- Implement authentication
- Implement invoice payload transformation
- Add error handling

#### Day 3: E-Way Bill API Adapter (#2)
- Set up E-Way Bill module structure
- Implement authentication
- Implement bill generation
- Add distance calculation

#### Day 4-5: BullMQ Queue Workers (#3)
- Configure BullMQ
- Create IRP submit queue
- Create E-way bill queue
- Add retry logic
- Add monitoring

### Week 2: Days 6-10

#### Day 6-8: GSTR-1 Export (#4)
- Implement B2B section
- Implement B2CL section
- Implement B2CS section
- Implement CDNR section
- Implement EXP section
- Add JSON generation
- Add CSV generation

#### Day 9: GSTR-3B Export (#5)
- Implement summary calculation
- Add JSON generation
- Add CSV generation

#### Day 10: HSN/SAC Master Data (#6)
- Create table
- Import data
- Add API endpoints
- Add validation

## Deliverables

### Code Changes
- `backend/src/modules/irp/` - IRP module
- `backend/src/modules/eway-bill/` - E-Way Bill module
- `backend/src/modules/gstr/` - GSTR export module
- `backend/src/modules/queue/` - Queue workers
- Migration scripts for HSN/SAC data

### Tests
- Unit tests for all modules (>80% coverage)
- Integration tests with sandbox APIs
- E2E tests for complete workflows

### Documentation
- API documentation updates
- Setup guide for IRP/E-Way credentials
- User guide for GSTR export

### Environment Setup
```env
# IRP Configuration
IRP_BASE_URL=https://einv-apisandbox.nic.in
IRP_CLIENT_ID={EINVOICE_API_KEY}
IRP_CLIENT_SECRET={EINVOICE_SECRET}

# E-Way Bill Configuration
EWAY_BASE_URL=https://preprod-api.ewaybillgst.gov.in
EWAY_API_KEY={EWAY_API_KEY}

# Queue Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
QUEUE_CONCURRENCY=10
```

## Success Criteria
- [ ] IRP integration works end-to-end
- [ ] E-Way Bill generation works
- [ ] GSTR-1 JSON/CSV validates against GSTN schema
- [ ] GSTR-3B summary matches invoice data
- [ ] All tests passing
- [ ] No security vulnerabilities
- [ ] Documentation complete

## Risks & Mitigation
| Risk | Mitigation |
|------|------------|
| IRP sandbox unavailable | Use mock responses for testing |
| GST schema changes | Version-based transformers |
| Queue overload | Implement rate limiting |

## Next Steps After Phase 1
- Phase 2: Inventory & Ledger Management
- Phase 3: Bank Reconciliation & Reports
- Phase 4: AI/ML Features
