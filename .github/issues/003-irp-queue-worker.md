# [P0] Implement BullMQ Queue Workers for IRP

**Epic:** Compliance Automation  
**Story Points:** 5  
**Priority:** Critical (P0)  
**Type:** Feature  
**Labels:** queue, backend, irp

## Description
Implement durable queue workers for async IRP submission with retry logic.

## Acceptance Criteria
- [ ] Create `IrpQueueModule` using BullMQ
- [ ] Implement `irp-submit` queue
- [ ] Create worker to process IRP submissions
- [ ] Implement exponential backoff retry (5 attempts)
- [ ] Handle dead-letter queue for failed submissions
- [ ] Add job progress tracking
- [ ] Implement webhook handler for IRP callbacks
- [ ] Add queue monitoring dashboard endpoint
- [ ] Add unit tests for queue logic
- [ ] Add integration tests

## Queue Configuration
```typescript
const irpQueue = new Queue('irp-submit', {
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: false,
    removeOnFail: false,
  },
});
```

## Workflow
1. Invoice created → Add to `irp-submit` queue
2. Worker picks job → Call IRP API
3. Success → Update invoice with IRN
4. Failure → Retry with backoff
5. Max retries exceeded → Move to dead-letter queue

## Dependencies
- Depends on: #1 (IRP API adapter)
- Blocks: None

## Monitoring
- Queue depth metric
- Processing rate
- Failure rate
- Average processing time
