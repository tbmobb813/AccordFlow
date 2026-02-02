import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';

@Module({
  controllers: [ContactsController],
  providers: [ContactsService, PrismaService],
  exports: [ContactsService],
})
export class ContactsModule {}
