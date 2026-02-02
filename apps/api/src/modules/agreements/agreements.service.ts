import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateAgreementDto, UpdateAgreementDto } from './dto/agreement.dto';

@Injectable()
export class AgreementsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, createAgreementDto: CreateAgreementDto) {
    return this.prisma.$transaction(async (tx) => {
      const agreement = await tx.agreement.create({
        data: {
          ...createAgreementDto,
          tenantId,
        },
      });

      await tx.activity.create({
        data: {
          tenantId,
          userId,
          entityType: 'AGREEMENT',
          entityId: agreement.id,
          action: 'CREATED',
          metadata: { title: agreement.title, status: agreement.status },
        },
      });

      return agreement;
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.agreement.findMany({
      where: { tenantId },
      include: { proposal: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.agreement.findFirst({
      where: { id, tenantId },
      include: { proposal: true, invoices: true },
    });
  }

  async update(
    tenantId: string,
    userId: string,
    id: string,
    updateAgreementDto: UpdateAgreementDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.agreement.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        throw new Error('Agreement not found');
      }

      const agreement = await tx.agreement.update({
        where: { id },
        data: updateAgreementDto,
      });

      await tx.activity.create({
        data: {
          tenantId,
          userId,
          entityType: 'AGREEMENT',
          entityId: agreement.id,
          action: 'UPDATED',
          metadata: updateAgreementDto as any,
        },
      });

      return agreement;
    });
  }

  async remove(tenantId: string, userId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const agreement = await tx.agreement.findFirst({
        where: { id, tenantId },
      });

      if (!agreement) {
        throw new Error('Agreement not found');
      }

      await tx.activity.create({
        data: {
          tenantId,
          userId,
          entityType: 'AGREEMENT',
          entityId: agreement.id,
          action: 'DELETED',
          metadata: { title: agreement.title },
        },
      });

      await tx.agreement.delete({
        where: { id },
      });

      return agreement;
    });
  }
}
