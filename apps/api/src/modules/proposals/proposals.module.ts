import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ProposalsController } from './proposals.controller';
import { ProposalsService } from './proposals.service';

@Module({
  controllers: [ProposalsController],
  providers: [ProposalsService, PrismaService],
  exports: [ProposalsService],
})
export class ProposalsModule {}
