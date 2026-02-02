# Canonical CRM API - Implementation Guide

## Overview

This guide maps the OpenAPI specification to a production-ready implementation with strict state machines, immutability guarantees, and event-driven architecture.

---

## 1. Complete Workflow Spine

```
Contact (lead)
    ↓
Inquiry (new → in_review → converted)
    ↓
Opportunity (open → stages → won/lost)
    ↓ (parallel)
    ├─→ Meeting (scheduled → completed/canceled/no_show)
    └─→ Proposal (draft → sent → viewed → accepted/rejected/expired)
            ↓
        Agreement (draft → sent → signed/declined/canceled)
            ↓
        Invoice (draft → sent → partially_paid → paid/overdue/void)
            ↓
        Payment (pending → succeeded/failed/refunded)
```

### Key Principles

1. **Immutability**: Terminal states cannot transition further
2. **Idempotency**: All "send" operations use idempotency keys
3. **Event Sourcing**: Every mutation emits an event
4. **Canonical Responses**: All mutations return `{object, event}` pairs

---

## 2. State Machines

### Contact Lifecycle
```
lead → qualified → client → archived

Rules:
- Can only progress forward
- Cannot skip stages
- Archived is terminal
```

### Inquiry Status
```
new → in_review → converted  (terminal)
  ↓                    ↓
rejected           rejected  (both terminal)

Rules:
- new: can only → in_review | rejected
- in_review: can only → converted | rejected
- converted/rejected: terminal states
```

### Opportunity Status
```
open → [stages] → won  (terminal)
                → lost (terminal)

Rules:
- Only "open" opportunities can move through stages
- won/lost are terminal states
- Stage changes must respect pipeline sequence
```

### Proposal Status
```
draft → sent → viewed → accepted  (terminal)
         ↓              ↓
      expired      rejected  (both terminal)

Rules:
- Only drafts can be edited
- Only drafts can be sent
- sent → viewed (automatic when customer opens)
- viewed → accepted | rejected
- Expired after configurable timeout
```

### Agreement Signature Status
```
draft → sent → signed    (terminal)
  ↓      ↓       ↓
canceled  ↓    declined  (all terminal)
       declined

Rules:
- Only drafts can be edited
- Only drafts can be sent
- sent → signed | declined
- draft/sent → canceled (admin action)
```

### Invoice Status
```
draft → sent → partially_paid → paid  (terminal)
  ↓             ↓
void        overdue → paid  (terminal)
             (auto-transition)

Rules:
- Only drafts can be edited
- sent → overdue (automatic after due_date)
- partially_paid when 0 < amount_paid < total_amount
- paid when amount_paid >= total_amount
- Cannot void paid invoices
```

### Payment Status
```
pending → succeeded  (terminal)
   ↓         ↓
failed   refunded  (both terminal)

Rules:
- succeeded → refunded (stripe webhook)
- failed is terminal
```

---

## 3. Database Schema

### Core Tables

```sql
-- Multi-tenant isolation
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- All tables include tenant_id for row-level security
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company_name VARCHAR(255),
  lifecycle_stage VARCHAR(20) NOT NULL DEFAULT 'lead' 
    CHECK (lifecycle_stage IN ('lead', 'qualified', 'client', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, email)
);

CREATE INDEX idx_contacts_tenant_stage 
  ON contacts(tenant_id, lifecycle_stage);

CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  contact_id UUID NOT NULL REFERENCES contacts(id),
  message TEXT NOT NULL,
  source VARCHAR(20) NOT NULL CHECK (source IN ('form', 'manual', 'import', 'api')),
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('web', 'email', 'phone', 'social')),
  status VARCHAR(20) NOT NULL DEFAULT 'new' 
    CHECK (status IN ('new', 'in_review', 'converted', 'rejected')),
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (
    (status = 'converted' AND converted_at IS NOT NULL) OR
    (status != 'converted' AND converted_at IS NULL)
  )
);

CREATE INDEX idx_inquiries_tenant_status 
  ON inquiries(tenant_id, status) WHERE status IN ('new', 'in_review');

CREATE TABLE pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, name)
);

CREATE TABLE stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  position INTEGER NOT NULL,
  probability INTEGER NOT NULL CHECK (probability BETWEEN 0 AND 100),
  UNIQUE(pipeline_id, position)
);

CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  contact_id UUID NOT NULL REFERENCES contacts(id),
  inquiry_id UUID REFERENCES inquiries(id),
  name VARCHAR(255) NOT NULL,
  pipeline_id UUID NOT NULL REFERENCES pipelines(id),
  stage_id UUID NOT NULL REFERENCES stages(id),
  value_estimate DECIMAL(19, 4),
  currency CHAR(3) DEFAULT 'USD',
  status VARCHAR(20) NOT NULL DEFAULT 'open' 
    CHECK (status IN ('open', 'won', 'lost')),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (
    (status IN ('won', 'lost') AND closed_at IS NOT NULL) OR
    (status = 'open' AND closed_at IS NULL)
  ),
  FOREIGN KEY (pipeline_id, stage_id) 
    REFERENCES stages(pipeline_id, id)
);

CREATE INDEX idx_opportunities_tenant_status 
  ON opportunities(tenant_id, status) WHERE status = 'open';

CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id),
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  location_type VARCHAR(20) NOT NULL CHECK (location_type IN ('video', 'phone', 'in_person')),
  location_details TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' 
    CHECK (status IN ('scheduled', 'completed', 'canceled', 'no_show')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (scheduled_end > scheduled_start),
  CHECK (
    (status = 'completed' AND completed_at IS NOT NULL) OR
    (status != 'completed' AND completed_at IS NULL)
  )
);

CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id),
  title VARCHAR(255) NOT NULL,
  total_amount DECIMAL(19, 4) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  status VARCHAR(20) NOT NULL DEFAULT 'draft' 
    CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired')),
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (
    (status != 'draft' AND sent_at IS NOT NULL) OR
    (status = 'draft' AND sent_at IS NULL)
  )
);

CREATE TABLE agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  proposal_id UUID NOT NULL REFERENCES proposals(id),
  title VARCHAR(255) NOT NULL,
  signature_status VARCHAR(20) NOT NULL DEFAULT 'draft' 
    CHECK (signature_status IN ('draft', 'sent', 'signed', 'declined', 'canceled')),
  sent_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  signer_name VARCHAR(255),
  signer_email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (
    (signature_status != 'draft' AND sent_at IS NOT NULL) OR
    (signature_status = 'draft' AND sent_at IS NULL)
  )
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  agreement_id UUID NOT NULL REFERENCES agreements(id),
  number VARCHAR(50) NOT NULL,
  total_amount DECIMAL(19, 4) NOT NULL,
  amount_paid DECIMAL(19, 4) NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  due_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' 
    CHECK (status IN ('draft', 'sent', 'partially_paid', 'paid', 'void', 'overdue')),
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, number),
  CHECK (amount_paid >= 0),
  CHECK (amount_paid <= total_amount)
);

-- Auto-generate invoice numbers
CREATE SEQUENCE invoice_numbers_seq;

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.number IS NULL THEN
    NEW.number := 'INV-' || TO_CHAR(NOW(), 'YYYY') || 
                  '-' || LPAD(nextval('invoice_numbers_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION generate_invoice_number();

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('stripe', 'manual', 'other')),
  provider_payment_id VARCHAR(255),
  amount DECIMAL(19, 4) NOT NULL,
  currency CHAR(3) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  succeeded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (amount > 0)
);

CREATE INDEX idx_payments_provider_id 
  ON payments(provider, provider_payment_id) 
  WHERE provider_payment_id IS NOT NULL;

-- Event log for audit trail
CREATE TABLE activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  event_type VARCHAR(100) NOT NULL,
  object_type VARCHAR(50) NOT NULL,
  object_id UUID NOT NULL,
  actor_id UUID,  -- references users table
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_object 
  ON activity_events(object_type, object_id, created_at DESC);
CREATE INDEX idx_events_tenant 
  ON activity_events(tenant_id, created_at DESC);

-- Idempotency tracking
CREATE TABLE idempotency_keys (
  key UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  endpoint VARCHAR(255) NOT NULL,
  response_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_idempotency_tenant 
  ON idempotency_keys(tenant_id, created_at);

-- Cleanup old keys (24 hour retention)
CREATE INDEX idx_idempotency_cleanup 
  ON idempotency_keys(created_at) 
  WHERE created_at < NOW() - INTERVAL '24 hours';
```

---

## 4. State Transition Validation

### Example: Inquiry State Machine Service

```typescript
class InquiryStateMachine {
  private transitions: Record<string, string[]> = {
    'new': ['in_review', 'rejected'],
    'in_review': ['converted', 'rejected'],
    'converted': [],  // terminal
    'rejected': []     // terminal
  };

  validate(from: string, to: string): void {
    const allowed = this.transitions[from] || [];
    
    if (!allowed.includes(to)) {
      throw new StateTransitionError({
        code: 'INVALID_STATE_TRANSITION',
        message: `Cannot transition inquiry from ${from} to ${to}`,
        details: {
          current_status: from,
          requested_status: to,
          allowed_transitions: allowed
        }
      });
    }
  }

  isTerminal(status: string): boolean {
    return this.transitions[status].length === 0;
  }
}
```

### Example: Proposal Send Validation

```typescript
async function sendProposal(
  proposalId: string, 
  idempotencyKey: string
): Promise<MutationResponse> {
  
  // Check idempotency
  const cached = await checkIdempotency(idempotencyKey, 'proposal.send');
  if (cached) return cached;

  const proposal = await db.proposals.findById(proposalId);
  
  // Validate state
  if (proposal.status !== 'draft') {
    throw new ConflictError({
      code: 'INVALID_STATE_TRANSITION',
      message: 'Can only send draft proposals',
      details: { current_status: proposal.status }
    });
  }

  // Execute in transaction
  const result = await db.transaction(async (trx) => {
    // Update proposal
    const updated = await trx.proposals.update(proposal.id, {
      status: 'sent',
      sent_at: new Date()
    });

    // Create event
    const event = await trx.activity_events.create({
      event_type: 'proposal.sent',
      object_type: 'proposal',
      object_id: proposal.id,
      metadata: { previous_status: 'draft' }
    });

    // Send email (async via queue)
    await emailQueue.enqueue({
      type: 'proposal_sent',
      proposal_id: proposal.id
    });

    return { object: updated, event };
  });

  // Cache response
  await storeIdempotency(idempotencyKey, 'proposal.send', result);

  return result;
}
```

---

## 5. Workflow Enforcement Rules

### Rule 1: Proposal → Agreement Requirement
```sql
-- Constraint: Agreement requires accepted proposal
-- Note: PostgreSQL does not support subqueries in CHECK constraints,
-- so we use a trigger instead
CREATE OR REPLACE FUNCTION check_proposal_accepted()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow NULL proposal_id if the column is nullable
  IF NEW.proposal_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Check if proposal exists
  IF NOT EXISTS (SELECT 1 FROM proposals WHERE id = NEW.proposal_id) THEN
    RAISE EXCEPTION 'Proposal with id % does not exist', NEW.proposal_id;
  END IF;
  
  -- Check if proposal is accepted
  IF NOT EXISTS (
    SELECT 1 FROM proposals 
    WHERE id = NEW.proposal_id 
    AND status = 'accepted'
  ) THEN
    RAISE EXCEPTION 'Agreement requires an accepted proposal (proposal % has status ''%'' instead of ''accepted'')', 
      NEW.proposal_id, 
      (SELECT status FROM proposals WHERE id = NEW.proposal_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_proposal_accepted
  BEFORE INSERT OR UPDATE OF proposal_id ON agreements
  FOR EACH ROW
  EXECUTE FUNCTION check_proposal_accepted();
```

### Rule 2: Agreement → Invoice Requirement
```sql
-- Constraint: Invoice requires signed agreement
-- Note: PostgreSQL does not support subqueries in CHECK constraints,
-- so we use a trigger instead
CREATE OR REPLACE FUNCTION check_agreement_signed()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow NULL agreement_id if the column is nullable
  IF NEW.agreement_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Check if agreement exists
  IF NOT EXISTS (SELECT 1 FROM agreements WHERE id = NEW.agreement_id) THEN
    RAISE EXCEPTION 'Agreement with id % does not exist', NEW.agreement_id;
  END IF;
  
  -- Check if agreement is signed
  IF NOT EXISTS (
    SELECT 1 FROM agreements 
    WHERE id = NEW.agreement_id 
    AND signature_status = 'signed'
  ) THEN
    RAISE EXCEPTION 'Invoice requires a signed agreement (agreement % has signature_status ''%'' instead of ''signed'')', 
      NEW.agreement_id, 
      (SELECT signature_status FROM agreements WHERE id = NEW.agreement_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_agreement_signed
  BEFORE INSERT OR UPDATE OF agreement_id ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION check_agreement_signed();
```

### Rule 3: Invoice Payment Reconciliation
```sql
-- Trigger: Update invoice status on payment
CREATE OR REPLACE FUNCTION update_invoice_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'succeeded' THEN
    UPDATE invoices
    SET 
      amount_paid = amount_paid + NEW.amount,
      status = CASE
        WHEN amount_paid + NEW.amount >= total_amount THEN 'paid'
        WHEN amount_paid + NEW.amount > 0 THEN 'partially_paid'
        ELSE status
      END,
      paid_at = CASE
        WHEN amount_paid + NEW.amount >= total_amount THEN NOW()
        ELSE paid_at
      END,
      updated_at = NOW()
    WHERE id = NEW.invoice_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_updates_invoice
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW
  WHEN (NEW.status = 'succeeded')
  EXECUTE FUNCTION update_invoice_on_payment();
```

### Rule 4: Overdue Invoice Detection
```sql
-- Scheduled job (run daily)
UPDATE invoices
SET status = 'overdue'
WHERE status = 'sent'
  AND due_date < CURRENT_DATE
  AND amount_paid < total_amount;
```

---

## 6. API Response Examples

### Successful Mutation
```json
POST /proposals/550e8400-e29b-41d4-a716-446655440000/send

Response 200:
{
  "object": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "opportunity_id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Q1 Enterprise Package",
    "total_amount": 50000.00,
    "currency": "USD",
    "status": "sent",
    "sent_at": "2024-02-01T15:30:00Z",
    "viewed_at": null,
    "responded_at": null,
    "created_at": "2024-01-28T10:00:00Z",
    "updated_at": "2024-02-01T15:30:00Z"
  },
  "event": {
    "id": "9a8b7c6d-5e4f-3a2b-1c0d-e9f8a7b6c5d4",
    "event_type": "proposal.sent",
    "object_type": "proposal",
    "object_id": "550e8400-e29b-41d4-a716-446655440000",
    "actor_id": "user-123",
    "metadata": {
      "previous_status": "draft",
      "recipient_email": "client@example.com"
    },
    "created_at": "2024-02-01T15:30:00Z"
  }
}
```

### Conflict Error
```json
POST /inquiries/abc123/convert

Response 409:
{
  "code": "INVALID_STATE_TRANSITION",
  "message": "Cannot convert inquiry with status 'new'",
  "details": {
    "current_status": "new",
    "required_status": "in_review",
    "allowed_transitions": ["in_review", "rejected"]
  }
}
```

---

## 7. Implementation Checklist

### Phase 1: Foundation
- [ ] Multi-tenant database schema
- [ ] Row-level security policies
- [ ] State machine validators
- [ ] Idempotency middleware
- [ ] Event logging infrastructure

### Phase 2: Core Entities
- [ ] Contact CRUD + lifecycle
- [ ] Inquiry CRUD + conversion
- [ ] Pipeline/Stage read-only
- [ ] Opportunity CRUD + stage progression

### Phase 3: Sales Workflow
- [ ] Meeting scheduling
- [ ] Proposal creation/send
- [ ] Agreement generation/send
- [ ] Invoice creation/send
- [ ] Payment recording

### Phase 4: Integrations
- [ ] Stripe webhook handler
- [ ] Email delivery service
- [ ] Document generation
- [ ] Activity timeline API

### Phase 5: Polish
- [ ] Pagination cursors
- [ ] Search/filtering
- [ ] Webhook delivery to customers
- [ ] Rate limiting
- [ ] Monitoring/observability

---

## 8. Testing Strategy

### Unit Tests
- State machine transitions (all paths)
- Validation logic
- Business rule enforcement

### Integration Tests
- End-to-end workflow: inquiry → payment
- Idempotency verification
- Concurrent modification handling
- Event emission verification

### Contract Tests
- OpenAPI spec compliance
- Response schema validation
- Error code consistency

---

## 9. Deployment Considerations

### Database
- Use PostgreSQL 14+ for generated columns
- Enable connection pooling (PgBouncer)
- Partition `activity_events` by month
- Archive old idempotency keys

### Application
- Horizontal scaling (stateless)
- Background job processing (Sidekiq, Bull)
- Redis for idempotency cache
- Message queue for events (RabbitMQ, SQS)

### Monitoring
- Track state transition metrics
- Alert on failed state transitions
- Monitor idempotency key usage
- Track payment reconciliation lag

---

This implementation guide ensures your API is production-ready with full workflow enforcement, immutability guarantees, and comprehensive event tracking.
