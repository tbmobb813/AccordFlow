import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo Company',
      slug: 'demo-company',
    },
  });

  console.log('✅ Created tenant:', tenant.name);

  // Create demo user
  const user = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      clerkUserId: 'clerk_demo_user_123',
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User',
      role: UserRole.ADMIN,
    },
  });

  console.log('✅ Created user:', user.email);

  // Create demo contact
  const contact = await prisma.contact.create({
    data: {
      tenantId: tenant.id,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      company: 'Acme Corp',
      status: 'QUALIFIED',
      source: 'Website',
    },
  });

  console.log('✅ Created contact:', contact.email);

  // Create demo opportunity
  const opportunity = await prisma.opportunity.create({
    data: {
      tenantId: tenant.id,
      contactId: contact.id,
      title: 'Virtual Assistant Services',
      description: 'Full-time VA for administrative tasks',
      value: 5000.0,
      stage: 'PROPOSAL',
      probability: 75,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  console.log('✅ Created opportunity:', opportunity.title);

  // Create activity
  await prisma.activity.create({
    data: {
      tenantId: tenant.id,
      userId: user.id,
      entityType: 'OPPORTUNITY',
      entityId: opportunity.id,
      action: 'CREATED',
      metadata: {
        stage: opportunity.stage,
        value: opportunity.value.toString(),
      },
    },
  });

  console.log('✅ Created activity timeline entry');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
