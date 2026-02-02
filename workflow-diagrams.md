# CRM Platform - Workflow & State Diagrams

## Complete Workflow Spine

```mermaid
graph TB
    subgraph "Stage 1: Lead Capture"
        C[Contact<br/>lifecycle_stage: lead]
        I[Inquiry<br/>status: new]
        C --> I
    end
    
    subgraph "Stage 2: Qualification"
        IR[Inquiry<br/>status: in_review]
        IC[Inquiry<br/>status: converted]
        I --> IR
        IR --> IC
    end
    
    subgraph "Stage 3: Sales Pipeline"
        O[Opportunity<br/>status: open]
        M[Meeting<br/>status: scheduled]
        IC --> O
        O -.parallel.-> M
    end
    
    subgraph "Stage 4: Proposal"
        PD[Proposal<br/>status: draft]
        PS[Proposal<br/>status: sent]
        PV[Proposal<br/>status: viewed]
        PA[Proposal<br/>status: accepted]
        O --> PD
        PD --> PS
        PS --> PV
        PV --> PA
    end
    
    subgraph "Stage 5: Agreement"
        AD[Agreement<br/>status: draft]
        AS[Agreement<br/>status: sent]
        AG[Agreement<br/>status: signed]
        PA --> AD
        AD --> AS
        AS --> AG
    end
    
    subgraph "Stage 6: Billing"
        ID[Invoice<br/>status: draft]
        IS[Invoice<br/>status: sent]
        IP[Invoice<br/>status: paid]
        AG --> ID
        ID --> IS
        IS --> IP
    end
    
    subgraph "Stage 7: Payment"
        PM[Payment<br/>status: pending]
        PC[Payment<br/>status: succeeded]
        IS -.triggers.-> PM
        PM --> PC
        PC -.updates.-> IP
    end
    
    style C fill:#e1f5ff
    style IC fill:#c3e6cb
    style PA fill:#c3e6cb
    style AG fill:#c3e6cb
    style IP fill:#c3e6cb
    style PC fill:#c3e6cb
```

## State Machine: Contact Lifecycle

```mermaid
stateDiagram-v2
    [*] --> lead
    lead --> qualified
    qualified --> client
    client --> archived
    archived --> [*]
    
    note right of lead
        Initial state
        Auto-created on contact creation
    end note
    
    note right of client
        Successfully converted
        Active customer
    end note
    
    note right of archived
        Terminal state
        No further transitions
    end note
```

## State Machine: Inquiry

```mermaid
stateDiagram-v2
    [*] --> new
    new --> in_review
    new --> rejected
    in_review --> converted
    in_review --> rejected
    converted --> [*]
    rejected --> [*]
    
    note right of new
        POST /inquiries
        Initial state
    end note
    
    note right of in_review
        PATCH /inquiries/{id}
        Ready for qualification
    end note
    
    note right of converted
        POST /inquiries/{id}/convert
        Creates Opportunity
        Terminal state
    end note
    
    note left of rejected
        Terminal state
        Not qualified
    end note
```

## State Machine: Opportunity

```mermaid
stateDiagram-v2
    [*] --> open
    open --> open: move through stages
    open --> won
    open --> lost
    won --> [*]
    lost --> [*]
    
    note right of open
        Active opportunity
        Can progress through
        pipeline stages
    end note
    
    note right of won
        Terminal state
        Deal closed successfully
    end note
    
    note left of lost
        Terminal state
        Deal failed
    end note
```

## State Machine: Proposal

```mermaid
stateDiagram-v2
    [*] --> draft
    draft --> sent
    sent --> viewed
    sent --> expired
    viewed --> accepted
    viewed --> rejected
    accepted --> [*]
    rejected --> [*]
    expired --> [*]
    
    note right of draft
        POST /opportunities/{id}/proposals
        Editable state
    end note
    
    note right of sent
        POST /proposals/{id}/send
        Idempotent operation
        Email delivered
    end note
    
    note right of viewed
        Auto-transition
        Tracking pixel/link click
    end note
    
    note right of accepted
        Terminal state
        Can create Agreement
    end note
    
    note left of expired
        Auto-transition
        After timeout (e.g., 30 days)
    end note
```

## State Machine: Agreement

```mermaid
stateDiagram-v2
    [*] --> draft
    draft --> sent
    draft --> canceled
    sent --> signed
    sent --> declined
    sent --> canceled
    signed --> [*]
    declined --> [*]
    canceled --> [*]
    
    note right of draft
        POST /proposals/{id}/agreements
        Requires accepted proposal
        Editable state
    end note
    
    note right of sent
        POST /agreements/{id}/send
        Idempotent operation
        DocuSign/HelloSign integration
    end note
    
    note right of signed
        Webhook from e-signature provider
        Terminal state
        Can create Invoice
    end note
    
    note left of canceled
        Admin action only
        Terminal state
    end note
```

## State Machine: Invoice

```mermaid
stateDiagram-v2
    [*] --> draft
    draft --> sent
    draft --> void
    sent --> partially_paid
    sent --> overdue
    sent --> void
    partially_paid --> paid
    overdue --> paid
    paid --> [*]
    void --> [*]
    
    note right of draft
        POST /agreements/{id}/invoices
        Requires signed agreement
        Editable state
    end note
    
    note right of sent
        POST /invoices/{id}/send
        Idempotent operation
        Email with payment link
    end note
    
    note right of overdue
        Auto-transition
        Cron job after due_date
    end note
    
    note right of partially_paid
        Auto-transition
        0 < amount_paid < total_amount
    end note
    
    note right of paid
        Auto-transition
        amount_paid >= total_amount
        Terminal state
    end note
```

## State Machine: Payment

```mermaid
stateDiagram-v2
    [*] --> pending
    pending --> succeeded
    pending --> failed
    succeeded --> refunded
    succeeded --> [*]
    failed --> [*]
    refunded --> [*]
    
    note right of pending
        POST /payments (manual)
        Stripe webhook (initial)
    end note
    
    note right of succeeded
        Stripe webhook
        Updates invoice.amount_paid
        May transition invoice to paid
    end note
    
    note right of refunded
        Stripe webhook
        Reverses invoice payment
        Terminal state
    end note
```

## State Machine: Meeting

```mermaid
stateDiagram-v2
    [*] --> scheduled
    scheduled --> completed
    scheduled --> canceled
    scheduled --> no_show
    completed --> [*]
    canceled --> [*]
    no_show --> [*]
    
    note right of scheduled
        POST /opportunities/{id}/meetings
        Calendar integration
    end note
    
    note right of completed
        PATCH /meetings/{id}
        Terminal state
    end note
    
    note left of no_show
        PATCH /meetings/{id}
        Terminal state
        Tracking metric
    end note
```

## Critical State Transitions & Validation

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API
    participant V as Validator
    participant D as Database
    participant E as Events
    
    C->>A: POST /proposals/{id}/send
    A->>A: Check Idempotency-Key
    
    alt Idempotent request
        A-->>C: Return cached response
    else New request
        A->>D: SELECT proposal
        D-->>A: {status: "draft"}
        
        A->>V: validate(draft → sent)
        
        alt Valid transition
            V-->>A: OK
            
            A->>D: BEGIN TRANSACTION
            A->>D: UPDATE proposals SET status='sent'
            A->>E: INSERT activity_event
            A->>D: COMMIT
            
            D-->>A: {object, event}
            A->>A: Cache response
            A-->>C: 200 {object, event}
        else Invalid transition
            V-->>A: Error
            A-->>C: 409 Conflict
        end
    end
```

## Data Flow: Inquiry → Payment

```mermaid
flowchart LR
    subgraph Input
        F[Web Form]
        M[Manual Entry]
    end
    
    subgraph Qualification
        I[Inquiry]
        Q{Qualified?}
    end
    
    subgraph Sales
        O[Opportunity]
        MT[Meetings]
        ST[Stages]
    end
    
    subgraph Closing
        P[Proposal]
        A[Agreement]
    end
    
    subgraph Revenue
        INV[Invoice]
        PAY[Payment]
    end
    
    F --> I
    M --> I
    I --> Q
    Q -->|Yes| O
    Q -->|No| R[Rejected]
    O --> MT
    O --> ST
    O --> P
    P --> A
    A --> INV
    INV --> PAY
    
    style I fill:#fff3cd
    style O fill:#cfe2ff
    style P fill:#d1e7dd
    style A fill:#d1e7dd
    style INV fill:#f8d7da
    style PAY fill:#d1ecf1
```

## Event Timeline Example

```mermaid
gantt
    title Activity Timeline for Opportunity #123
    dateFormat YYYY-MM-DD
    section Inquiry
    inquiry.created           :milestone, m1, 2024-01-15, 0d
    inquiry.reviewed          :milestone, m2, 2024-01-16, 0d
    inquiry.converted         :milestone, m3, 2024-01-17, 0d
    section Opportunity
    opportunity.created       :milestone, m4, 2024-01-17, 0d
    opportunity.stage_changed :milestone, m5, 2024-01-20, 0d
    opportunity.stage_changed :milestone, m6, 2024-01-25, 0d
    section Meeting
    meeting.scheduled         :milestone, m7, 2024-01-22, 0d
    meeting.completed         :milestone, m8, 2024-01-23, 0d
    section Proposal
    proposal.created          :milestone, m9, 2024-01-28, 0d
    proposal.sent             :milestone, m10, 2024-01-29, 0d
    proposal.viewed           :milestone, m11, 2024-01-30, 0d
    proposal.accepted         :milestone, m12, 2024-02-01, 0d
    section Agreement
    agreement.created         :milestone, m13, 2024-02-01, 0d
    agreement.sent            :milestone, m14, 2024-02-01, 0d
    agreement.signed          :milestone, m15, 2024-02-05, 0d
    section Invoice
    invoice.created           :milestone, m16, 2024-02-05, 0d
    invoice.sent              :milestone, m17, 2024-02-06, 0d
    section Payment
    payment.succeeded         :milestone, m18, 2024-02-15, 0d
    invoice.paid              :milestone, m19, 2024-02-15, 0d
```
