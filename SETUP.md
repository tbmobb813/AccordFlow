# AccordFlow Setup Guide

This guide will help you set up and run AccordFlow locally.

## Quick Start

### 1. Prerequisites

Ensure you have the following installed:
- Node.js >= 18.x
- Docker Desktop (or Docker + Docker Compose)
- npm (comes with Node.js)

### 2. Clone and Install

```bash
# Clone the repository
git clone https://github.com/tbmobb813/AccordFlow.git
cd AccordFlow

# Install all dependencies
npm install
```

### 3. Setup Clerk Authentication

1. Go to [Clerk.com](https://clerk.com) and create a free account
2. Create a new application
3. From the dashboard, copy your keys:
   - Secret Key
   - Publishable Key

### 4. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` and update with your Clerk credentials:

```env
# Clerk Authentication
CLERK_SECRET_KEY="sk_test_your_actual_secret_key_here"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_actual_publishable_key_here"
```

Keep the database and other settings as they are for local development.

### 5. Start Infrastructure

Start PostgreSQL and Redis using Docker Compose:

```bash
docker-compose up -d
```

Verify services are running:
```bash
docker-compose ps
```

You should see both `accordflow-postgres` and `accordflow-redis` running.

### 6. Setup Database

```bash
# Navigate to database package
cd packages/database

# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Seed with sample data
npm run db:seed

# Return to root
cd ../..
```

You should see output confirming:
- ✅ Created tenant: Demo Company
- ✅ Created user: demo@example.com
- ✅ Created contact: john.doe@example.com
- ✅ Created opportunity: Virtual Assistant Services
- ✅ Created activity timeline entry

### 7. Start Development Servers

From the root directory:

```bash
npm run dev
```

This starts all applications in development mode:
- 🚀 **API Server**: http://localhost:3001
- 🌐 **Web Application**: http://localhost:3000
- 📚 **API Documentation**: http://localhost:3001/api/docs

## First Time Usage

### Access the Application

1. Open http://localhost:3000 in your browser
2. You'll be redirected to Clerk's sign-in page
3. Create a new account or sign in with an existing one

### Important: Creating Your First User in Database

After signing up with Clerk, you need to create a corresponding user in the database:

**Option 1: Use the demo user (from seed)**
- If you want to use the seeded data, modify the seed script to use your Clerk User ID

**Option 2: Create via API**
- Use the Swagger UI at http://localhost:3001/api/docs
- Or use the database directly via Prisma Studio

**Option 3: Prisma Studio (Recommended for testing)**
```bash
cd packages/database
npm run db:studio
```

This opens Prisma Studio at http://localhost:5555 where you can:
1. Create a new `User` record
2. Set `clerkUserId` to your Clerk user ID (found in Clerk dashboard)
3. Set `tenantId` to the demo tenant's ID
4. Set your email and name

### Using the Application

Once authenticated and linked to a tenant:

1. **Dashboard**: View workflow stages overview
2. **Contacts**: Manage client contacts
3. **Opportunities**: Track sales opportunities
4. **Proposals**: Create and send proposals
5. **Agreements**: Manage signed contracts
6. **Invoices**: Generate invoices
7. **Payments**: Record payments
8. **Activity Timeline**: View all system activities

## Development Workflow

### Working on Backend (API)

```bash
# Navigate to API
cd apps/api

# Start in watch mode
npm run dev

# Run linter
npm run lint
```

### Working on Frontend (Web)

```bash
# Navigate to web
cd apps/web

# Start in development mode
npm run dev

# Run linter
npm run lint
```

### Database Changes

When you modify the Prisma schema:

```bash
cd packages/database

# Push changes to database (development)
npm run db:push

# Or create a migration (production)
npm run db:migrate

# Regenerate Prisma client
npm run db:generate
```

## Troubleshooting

### Database Connection Issues

**Error**: "Can't reach database server"

Solution:
```bash
# Check if Docker containers are running
docker-compose ps

# Restart containers
docker-compose down
docker-compose up -d

# Check logs
docker-compose logs postgres
```

### Port Already in Use

**Error**: "Port 3000 (or 3001) is already in use"

Solution:
```bash
# Find and kill the process using the port
# On macOS/Linux:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Prisma Client Not Generated

**Error**: "Cannot find module '@prisma/client'"

Solution:
```bash
cd packages/database
npm run db:generate
cd ../..
npm install
```

### Clerk Authentication Not Working

**Error**: "Authentication failed" or redirect issues

Solution:
1. Verify your Clerk keys in `.env`
2. Check that NEXT_PUBLIC_ prefix is used for publishable key
3. Ensure your Clerk app URLs match:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/`

### TypeScript Errors

```bash
# Clean build artifacts
npm run clean

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## Testing API with Swagger

1. Start the API: `npm run dev`
2. Open http://localhost:3001/api/docs
3. Click "Authorize" button
4. Enter your Bearer token (get from Clerk)
5. Add tenant-slug header in try-it-out

## Testing API with cURL

```bash
# Get all contacts (replace with your token and tenant)
curl -X GET "http://localhost:3001/contacts" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "x-tenant-slug: demo-company"

# Create a contact
curl -X POST "http://localhost:3001/contacts" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "x-tenant-slug: demo-company" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "company": "Tech Corp"
  }'
```

## Production Deployment

### Build for Production

```bash
# Build all packages
npm run build
```

### Environment Variables for Production

Create a `.env.production` file with production values:
- Use production Clerk keys
- Use production database URL (e.g., managed PostgreSQL)
- Use production Redis URL
- Set NODE_ENV=production

### Database Migrations

For production, use migrations instead of db:push:

```bash
cd packages/database
npx prisma migrate deploy
```

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query)
- [Turborepo Documentation](https://turbo.build/repo/docs)

## Support

For issues and questions:
1. Check this SETUP.md file
2. Review the main README.md
3. Check existing GitHub issues
4. Create a new issue with details

## Next Steps

After setup:
1. Explore the Swagger API documentation
2. Create your first contact
3. Progress through the workflow (Opportunity → Proposal → Agreement → Invoice → Payment)
4. View the activity timeline
5. Customize the schema for your needs
6. Add more features to the frontend

Happy coding! 🚀
