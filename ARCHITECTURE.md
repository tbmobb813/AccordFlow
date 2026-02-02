# AccordFlow Architecture

## System Overview

AccordFlow is a multi-tenant VA CRM system built as a monorepo with separate backend API and frontend web applications.

```
┌─────────────────────────────────────────────────────────────┐
│                    AccordFlow System                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │   Next.js    │  HTTP   │   NestJS     │                  │
│  │   Frontend   │────────▶│   Backend    │                  │
│  │  (Port 3000) │         │  (Port 3001) │                  │
│  └──────────────┘         └──────┬───────┘                  │
│         │                         │                          │
│         │                         ▼                          │
│         │                  ┌──────────────┐                  │
│         │                  │  PostgreSQL  │                  │
│         │                  │  (Port 5432) │                  │
│         │                  └──────────────┘                  │
│         │                         │                          │
│         │                         ▼                          │
│         │                  ┌──────────────┐                  │
│         └─────────────────▶│    Redis     │                  │
│              (Future)       │  (Port 6379) │                  │
│                            └──────────────┘                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Architecture Principles

### 1. Multi-Tenancy
- **Tenant Isolation**: All data is scoped by `tenantId`
- **Shared Database**: Single database with logical separation
- **Tenant Context**: Automatically injected via middleware
- **Data Security**: Row-level security through Prisma queries

### 2. Monorepo Structure
- **Turborepo**: Efficient task running and caching
- **Shared Packages**: Common code (database) shared across apps
- **Independent Deployment**: Apps can be deployed separately
- **Unified Dependencies**: Centralized package management

### 3. Event Sourcing
- **Activity Log**: All mutations create activity records
- **Audit Trail**: Track who did what and when
- **Timeline View**: Chronological view of all events
- **Metadata Storage**: Flexible JSON for event details

## Technology Stack

### Backend (NestJS API)

**Framework**: NestJS 10.x
- Modular architecture
- Dependency injection
- Decorators for clean code
- Built-in validation

**Database**: PostgreSQL 16 + Prisma ORM 5.x
- Type-safe database client
- Migration system
- Schema-first development
- Query optimization

**Authentication**: Clerk SDK
- JWT token validation
- User management
- Social login support
- Session handling

**Caching**: Redis 7 (Optional)
- Session storage
- API response caching
- Rate limiting
- Queue management

### Frontend (Next.js Web)

**Framework**: Next.js 14.x (App Router)
- React 18 Server/Client components
- File-based routing
- Server-side rendering
- Static generation

**Styling**: TailwindCSS 3.x
- Utility-first CSS
- Responsive design
- Custom color palette
- Component classes

**State Management**: TanStack Query 5.x
- Server state caching
- Automatic refetching
- Optimistic updates
- DevTools integration

**Authentication**: Clerk Next.js
- Middleware protection
- Route guards
- User context
- Sign-in/Sign-up components

## Data Model

### Entity Relationship Diagram

```
┌─────────┐
│ Tenant  │
└────┬────┘
     │
     ├──────┬──────┬──────┬──────┬──────┬──────┬──────┐
     │      │      │      │      │      │      │      │
     ▼      ▼      ▼      ▼      ▼      ▼      ▼      ▼
  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
  │User│ │Cont│ │Oppo│ │Prop│ │Agre│ │Invo│ │Paym│ │Acti│
  │    │ │act │ │rtun│ │osal│ │emen│ │ice │ │ent │ │vity│
  └────┘ └──┬─┘ └──┬─┘ └──┬─┘ └──┬─┘ └──┬─┘ └──┬─┘ └────┘
            │       │       │       │       │       │
            └───────┼───────┼───────┼───────┼───────┘
                    │       │       │       │
                    └───────┼───────┼───────┘
                            │       │
                            └───────┘
```

### Workflow State Machines

#### Contact States
```
ACTIVE → QUALIFIED → UNQUALIFIED
  ↓         ↓
INACTIVE  (to Opportunity)
```

#### Opportunity Stages
```
PROSPECTING → QUALIFICATION → PROPOSAL → NEGOTIATION
                                ↓              ↓
                          CLOSED_WON    CLOSED_LOST
```

#### Proposal Status
```
DRAFT → SENT → VIEWED → ACCEPTED
                  ↓         ↓
              REJECTED  EXPIRED
```

#### Agreement Status
```
DRAFT → PENDING_SIGNATURE → SIGNED → ACTIVE
                              ↓         ↓
                          EXPIRED  TERMINATED
```

#### Invoice Status
```
DRAFT → SENT → VIEWED → PARTIAL_PAYMENT → PAID
                  ↓
              OVERDUE → CANCELLED
```

#### Payment Status
```
PENDING → PROCESSING → COMPLETED
            ↓              ↓
         FAILED       REFUNDED
```

## Request Flow

### Typical API Request Flow

```
1. Client (Web)
   ↓
2. Next.js Middleware (Clerk auth check)
   ↓
3. API Request with Bearer token + x-tenant-slug header
   ↓
4. NestJS ClerkAuthGuard
   - Validates JWT token
   - Extracts user info
   ↓
5. NestJS TenantGuard
   - Validates tenant access
   - Loads tenant context
   - Loads user record
   ↓
6. Controller Endpoint
   - Receives request
   - Uses decorators (@TenantId, @CurrentUser)
   ↓
7. Service Layer
   - Business logic
   - Prisma queries with tenantId filter
   - Activity logging
   ↓
8. Database (PostgreSQL)
   - Execute query
   - Return results
   ↓
9. Response to Client
   - JSON data
   - HTTP status codes
```

## Security Architecture

### Authentication Flow

```
1. User visits web app
   ↓
2. Clerk middleware checks session
   ↓
3. If not authenticated → redirect to /sign-in
   ↓
4. User signs in via Clerk
   ↓
5. Clerk issues JWT token
   ↓
6. Frontend stores token
   ↓
7. All API requests include token
   ↓
8. Backend validates token with Clerk
   ↓
9. Grant/deny access
```

### Multi-Tenant Security

**Data Isolation Layers**:
1. **Application Level**: All queries include `tenantId` filter
2. **Middleware Level**: Tenant context validation before controller
3. **Database Level**: Indexes on tenantId for performance
4. **API Level**: Header-based tenant identification

**Security Best Practices**:
- No tenant data leakage (all queries scoped)
- No cross-tenant access (middleware enforcement)
- User-tenant relationship verified
- Audit trail for all mutations

## Module Architecture

### Backend Modules

```
apps/api/src/
├── common/
│   └── prisma.service.ts        # Shared Prisma client
├── decorators/
│   ├── public.decorator.ts      # Mark public routes
│   └── tenant.decorator.ts      # Inject tenant context
├── guards/
│   ├── clerk-auth.guard.ts      # JWT validation
│   └── tenant.guard.ts          # Tenant access control
└── modules/
    ├── contacts/
    │   ├── contacts.module.ts
    │   ├── contacts.controller.ts
    │   ├── contacts.service.ts
    │   └── dto/
    │       └── contact.dto.ts
    ├── opportunities/
    ├── proposals/
    ├── agreements/
    ├── invoices/
    ├── payments/
    └── activities/
```

Each module follows the same pattern:
- **Module**: Dependency injection setup
- **Controller**: HTTP endpoints, route definitions
- **Service**: Business logic, database operations
- **DTOs**: Request/response validation

### Frontend Structure

```
apps/web/src/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Dashboard/home page
│   ├── providers.tsx           # React Query setup
│   ├── globals.css             # Global styles
│   ├── sign-in/                # Auth pages
│   └── sign-up/
├── components/                  # Reusable React components
├── lib/
│   └── api.ts                  # API client & functions
└── middleware.ts               # Clerk route protection
```

## Scalability Considerations

### Horizontal Scaling
- **Stateless API**: Can run multiple instances
- **Load Balancer**: Distribute traffic across instances
- **Redis Sessions**: Shared session state
- **Database Pooling**: Connection management

### Vertical Scaling
- **Database Indexing**: tenantId, foreign keys
- **Query Optimization**: Selective loading, pagination
- **Caching Strategy**: Redis for hot data
- **CDN**: Static assets, Next.js pages

### Multi-Tenancy at Scale
- **Tenant Sharding**: Future consideration for massive scale
- **Resource Quotas**: Per-tenant limits
- **Performance Monitoring**: Per-tenant metrics
- **Cost Allocation**: Track usage per tenant

## Development Patterns

### Backend Patterns

**Service Pattern**:
```typescript
class ContactsService {
  constructor(private prisma: PrismaService) {}
  
  async create(tenantId: string, userId: string, dto: CreateContactDto) {
    // 1. Create entity
    const contact = await this.prisma.contact.create({
      data: { ...dto, tenantId }
    });
    
    // 2. Log activity
    await this.prisma.activity.create({
      data: {
        tenantId, userId,
        entityType: 'CONTACT',
        entityId: contact.id,
        action: 'CREATED',
        metadata: { /* ... */ }
      }
    });
    
    return contact;
  }
}
```

**Controller Pattern**:
```typescript
@Controller('contacts')
class ContactsController {
  @Post()
  create(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateContactDto
  ) {
    return this.service.create(tenantId, user.id, dto);
  }
}
```

### Frontend Patterns

**Data Fetching with React Query**:
```typescript
function ContactsList() {
  const { data, isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => contactsApi.getAll()
  });
  
  // Render UI
}
```

**API Client Pattern**:
```typescript
export const contactsApi = {
  getAll: () => api.get('/contacts'),
  create: (data) => api.post('/contacts', data),
  // ... other methods
};
```

## Deployment Architecture

### Development
- Local Docker Compose for services
- Hot reload for both frontend and backend
- Local Clerk development instance

### Production (Recommended)
- **API**: Deploy to container platform (AWS ECS, Google Cloud Run)
- **Web**: Deploy to Vercel or similar Next.js platform
- **Database**: Managed PostgreSQL (AWS RDS, Supabase, Neon)
- **Redis**: Managed Redis (AWS ElastiCache, Upstash)
- **Monitoring**: Application logs, error tracking, performance monitoring

## Future Enhancements

### Planned Features
1. **Real-time Updates**: WebSockets for live data
2. **Email Integration**: Send proposals/invoices via email
3. **Document Generation**: PDF proposals and invoices
4. **Payment Processing**: Stripe/PayPal integration
5. **Analytics Dashboard**: Business intelligence
6. **Mobile App**: React Native application
7. **API Rate Limiting**: Redis-based rate limiter
8. **Advanced Permissions**: Fine-grained RBAC

### Technical Improvements
1. **Caching Layer**: Implement Redis caching
2. **Background Jobs**: Bull Queue for async tasks
3. **File Storage**: S3 for document uploads
4. **GraphQL API**: Alternative to REST
5. **Testing**: Unit, integration, E2E tests
6. **CI/CD**: Automated deployment pipelines
7. **Monitoring**: Prometheus + Grafana
8. **Logging**: Structured logging with ELK stack

---

This architecture is designed to be:
- **Scalable**: Can grow with your business
- **Maintainable**: Clear separation of concerns
- **Secure**: Multi-layer security approach
- **Extensible**: Easy to add new features
- **Developer-friendly**: Modern tools and patterns
