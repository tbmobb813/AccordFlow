import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateAgreementDto, UpdateAgreementDto } from './dto/agreement.dto';

@Injectable()
export class AgreementsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, createAgreementDto: CreateAgreementDto) {
    const agreement = await this.prisma.agreement.create({
      data: {
        ...createAgreementDto,
        tenantId,
      },
    });

    await this.prisma.activity.create({
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

  async update(tenantId: string, userId: string, id: string, updateAgreementDto: UpdateAgreementDto) {
    const agreement = await this.prisma.agreement.update({
      where: { id, tenantId },
      data: updateAgreementDto,
    });

    await this.prisma.activity.create({
      data: {
        tenantId,
        userId,
        entityType: 'AGREEMENT',
        entityId: agreement.id,
        action: 'UPDATED',
        metadata: updateAgreementDto,
      },
    });

    return agreement;
  }

  async remove(tenantId: string, userId: string, id: string) {
    const agreement = await this.prisma.agreement.delete({
      where: { id, tenantId },
    });

    await this.prisma.activity.create({
      data: {
        tenantId,
        userId,
        entityType: 'AGREEMENT',
        entityId: agreement.id,
        action: 'DELETED',
        metadata: { title: agreement.title },
      },
    });

    return agreement;
  }
}
