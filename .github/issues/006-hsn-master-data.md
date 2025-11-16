# [P0] Add HSN/SAC Master Data

**Epic:** Compliance Automation  
**Story Points:** 3  
**Priority:** Critical (P0)  
**Type:** Data  
**Labels:** compliance, master-data

## Description
Add HSN/SAC code master database with GST rates for validation and auto-suggestion.

## Acceptance Criteria
- [ ] Create `hsn_master` table
- [ ] Import HSN codes from government source
- [ ] Import SAC codes from government source
- [ ] Add GST rate mapping
- [ ] Create API endpoint for HSN/SAC lookup
- [ ] Implement auto-suggestion by description
- [ ] Add validation in invoice creation
- [ ] Add migration script
- [ ] Add seed data script

## Database Schema
```sql
CREATE TABLE hsn_master (
  code VARCHAR(8) PRIMARY KEY,
  description TEXT NOT NULL,
  uqc VARCHAR(10),
  gst_rate DECIMAL(5,2),
  cess_rate DECIMAL(5,2),
  type VARCHAR(10), -- 'HSN' or 'SAC'
  effective_from DATE,
  effective_to DATE
);
```

## API Endpoints
```
GET /v1/hsn/search?q={description}
GET /v1/hsn/{code}
```

## Dependencies
- None
