import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaService } from './common/prisma.service';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { TenantGuard } from './guards/tenant.guard';
import { ContactsModule } from './modules/contacts/contacts.module';
import { OpportunitiesModule } from './modules/opportunities/opportunities.module';
import { ProposalsModule } from './modules/proposals/proposals.module';
import { AgreementsModule } from './modules/agreements/agreements.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ActivitiesModule } from './modules/activities/activities.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ContactsModule,
    OpportunitiesModule,
    ProposalsModule,
    AgreementsModule,
    InvoicesModule,
    PaymentsModule,
    ActivitiesModule,
  ],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
  ],
})
export class AppModule {}
