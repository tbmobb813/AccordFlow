# AccordFlow

AccordFlow makes your client lifecycle inevitable — from first contact to signed agreement to paid invoice.

## 🚀 Overview

A **multi-tenant VA CRM monorepo** built with modern technologies to manage the complete client lifecycle workflow:

**Contact → Opportunity → Proposal → Agreement → Invoice → Payment**

### Tech Stack

- **Monorepo**: Turborepo
- **Backend**: NestJS + PostgreSQL + Prisma ORM + Redis
- **Frontend**: Next.js 15.2+ (App Router) + React 19 + TailwindCSS
- **Authentication**: Clerk (v6+)
- **State Management**: TanStack Query (React Query)
- **Infrastructure**: Docker Compose

> **Security Note**: This project uses Next.js 15.2.3+ which includes critical security patches for DoS vulnerabilities, authorization bypass, and SSRF issues. Always keep dependencies updated.

## 📁 Project Structure

```
accordflow/
├── apps/
│   ├── api/              # NestJS API application
│   │   └── src/
│   │       ├── common/   # Shared services (Prisma)
│   │       ├── guards/   # Authentication & authorization guards
│   │       ├── decorators/ # Custom decorators
│   │       └── modules/  # Feature modules (contacts, opportunities, etc.)
│   └── web/              # Next.js frontend application
│       └── src/
│           ├── app/      # Next.js App Router pages
│           ├── components/ # React components
│           └── lib/      # Utilities and API clients
├── packages/
│   └── database/         # Shared Prisma schema & client
│       ├── prisma/
│       │   ├── schema.prisma  # Multi-tenant database schema
│       │   └── seed.ts        # Database seeding
│       └── src/
└── docker-compose.yml    # PostgreSQL + Redis services
```

## 🎯 Features

### Multi-Tenancy
- **Tenant Isolation**: All data is scoped to tenants via `tenantId`
- **Tenant Middleware**: Automatic tenant resolution from headers/query params
- **User Management**: Per-tenant users with role-based access control

### Workflow State Machines
Complete lifecycle tracking with state transitions:
1. **Contacts** (ACTIVE → QUALIFIED)
2. **Opportunities** (PROSPECTING → CLOSED_WON)
3. **Proposals** (DRAFT → ACCEPTED)
4. **Agreements** (DRAFT → SIGNED → ACTIVE)
5. **Invoices** (DRAFT → SENT → PAID)
6. **Payments** (PENDING → COMPLETED)

### Activity Timeline (Event Sourcing)
- Tracks all actions across entities
- Audit log for compliance
- User attribution
- JSON metadata for flexible data

### Authentication & Authorization
- **Clerk Authentication**: Social login, email/password
- **JWT Token Validation**: Secure API access
- **Tenant-scoped Access**: Users can only access their tenant's data
- **Role-based Permissions**: ADMIN, USER, VIEWER roles

### API Features
- RESTful endpoints for all entities
- Swagger/OpenAPI documentation
- Input validation with class-validator
- Automatic activity logging
- Relationship preloading

## 🛠️ Getting Started

### Prerequisites

- Node.js >= 18
- Docker & Docker Compose
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/tbmobb813/AccordFlow.git
cd AccordFlow
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Update the `.env` file with your credentials:

```env
# Database
DATABASE_URL="postgresql://accordflow:accordflow_dev_pass@localhost:5432/accordflow"

# Redis
REDIS_URL="redis://localhost:6379"

# Clerk Authentication (get from https://clerk.com)
CLERK_SECRET_KEY="your_clerk_secret_key_here"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key_here"

# API Configuration
API_PORT=3001
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 4. Start Infrastructure Services

Start PostgreSQL and Redis:

```bash
docker-compose up -d
```

### 5. Database Setup

Generate Prisma client and run migrations:

```bash
cd packages/database
npm run db:generate
npm run db:push
npm run db:seed
```

### 6. Start Development Servers

From the root directory:

```bash
# Start all apps in development mode
npm run dev
```

This will start:
- **API**: http://localhost:3001
- **Web**: http://localhost:3000
- **API Docs**: http://localhost:3001/api/docs

## 📚 API Documentation

Once the API is running, visit the Swagger documentation:

```
http://localhost:3001/api/docs
```

### API Endpoints

All endpoints require authentication via Clerk and tenant identification.

#### Authentication Headers
```
Authorization: Bearer <clerk_token>
x-tenant-slug: <tenant_slug>
```

#### Contacts
- `GET /contacts` - List all contacts
- `POST /contacts` - Create a contact
- `GET /contacts/:id` - Get contact details
- `PATCH /contacts/:id` - Update contact
- `DELETE /contacts/:id` - Delete contact

#### Opportunities
- `GET /opportunities` - List all opportunities
- `POST /opportunities` - Create an opportunity
- `GET /opportunities/:id` - Get opportunity details
- `PATCH /opportunities/:id` - Update opportunity
- `DELETE /opportunities/:id` - Delete opportunity

#### Proposals
- `GET /proposals` - List all proposals
- `POST /proposals` - Create a proposal
- `GET /proposals/:id` - Get proposal details
- `PATCH /proposals/:id` - Update proposal
- `DELETE /proposals/:id` - Delete proposal

#### Agreements
- `GET /agreements` - List all agreements
- `POST /agreements` - Create an agreement
- `GET /agreements/:id` - Get agreement details
- `PATCH /agreements/:id` - Update agreement
- `DELETE /agreements/:id` - Delete agreement

#### Invoices
- `GET /invoices` - List all invoices
- `POST /invoices` - Create an invoice
- `GET /invoices/:id` - Get invoice details
- `PATCH /invoices/:id` - Update invoice
- `DELETE /invoices/:id` - Delete invoice

#### Payments
- `GET /payments` - List all payments
- `POST /payments` - Create a payment
- `GET /payments/:id` - Get payment details
- `PATCH /payments/:id` - Update payment
- `DELETE /payments/:id` - Delete payment

#### Activities (Timeline)
- `GET /activities` - Get activity timeline
- `GET /activities?entityType=CONTACT&entityId=<id>` - Get entity activities
- `GET /activities/:id` - Get activity details

## 🗄️ Database Schema

### Core Entities

1. **Tenant** - Organization/company
2. **User** - Tenant users with roles
3. **Contact** - Client contacts
4. **Opportunity** - Sales opportunities
5. **Proposal** - Business proposals
6. **Agreement** - Signed contracts
7. **Invoice** - Billing invoices
8. **Payment** - Payment records
9. **Activity** - Event sourcing/audit log

### Multi-Tenancy Implementation

All entities include `tenantId` field for data isolation:

```prisma
model Contact {
  id       String @id @default(cuid())
  tenantId String
  tenant   Tenant @relation(fields: [tenantId], references: [id])
  // ... other fields
}
```

## 🔒 Security

- **Authentication**: Clerk handles user authentication
- **Authorization**: Tenant-scoped data access via middleware
- **Input Validation**: DTOs with class-validator
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **CORS**: Configurable CORS policies
- **Environment Variables**: Secrets in .env (never committed)

## 🧪 Development

### Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Create a migration
npm run db:migrate

# Seed the database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

### Build & Production

```bash
# Build all packages
npm run build

# Start production API
cd apps/api
npm run start:prod

# Start production web
cd apps/web
npm run start
```

## 📦 Packages

### @accordflow/database
Shared Prisma schema and client for database access across applications.

### @accordflow/api
NestJS API with:
- Multi-tenant architecture
- Clerk authentication
- CRUD operations
- Activity logging
- Swagger documentation

### @accordflow/web
Next.js 15.2+ frontend with:
- App Router
- Server/Client components
- TailwindCSS styling
- TanStack Query for data fetching
- Clerk authentication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- NestJS for the excellent backend framework
- Next.js team for the modern React framework
- Prisma for the amazing ORM
- Clerk for authentication services
- Turborepo for monorepo management
