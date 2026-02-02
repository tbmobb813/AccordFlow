import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { AgreementsController } from './agreements.controller';
import { AgreementsService } from './agreements.service';

@Module({
  controllers: [AgreementsController],
  providers: [AgreementsService, PrismaService],
  exports: [AgreementsService],
})
export class AgreementsModule {}
