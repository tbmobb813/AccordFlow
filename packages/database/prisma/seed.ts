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
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      companyName: 'Acme Corp',
      lifecycleStage: 'QUALIFIED',
    },
  });

  console.log('✅ Created contact:', contact.email);

  // Create demo opportunity
  // create a pipeline and a stage so opportunity can reference them
  const pipeline = await prisma.pipeline.create({
    data: {
      tenantId: tenant.id,
      name: 'Default Pipeline',
      isDefault: true,
    },
  });

  const stage = await prisma.stage.create({
    data: {
      pipelineId: pipeline.id,
      name: 'Prospecting',
      position: 1,
      probability: 20,
    },
  });

  const opportunity = await prisma.opportunity.create({
    data: {
      tenantId: tenant.id,
      contactId: contact.id,
      pipelineId: pipeline.id,
      stageId: stage.id,
      name: 'Virtual Assistant Services',
      valueEstimate: 5000.0,
      currency: 'USD',
      status: 'OPEN',
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  console.log('✅ Created opportunity:', opportunity.name);

  // Create activity
  await prisma.activity.create({
    data: {
      tenantId: tenant.id,
      userId: user.id,
      entityType: 'OPPORTUNITY',
      entityId: opportunity.id,
      action: 'CREATED',
      metadata: {
        name: opportunity.name,
        valueEstimate: opportunity.valueEstimate?.toString(),
        stageId: opportunity.stageId,
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
