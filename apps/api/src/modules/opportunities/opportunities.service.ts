import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateOpportunityDto, UpdateOpportunityDto } from './dto/opportunity.dto';

@Injectable()
export class OpportunitiesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, createOpportunityDto: CreateOpportunityDto) {
    const opportunity = await this.prisma.opportunity.create({
      data: {
        ...createOpportunityDto,
        tenantId,
      },
    });

    await this.prisma.activity.create({
      data: {
        tenantId,
        userId,
        entityType: 'OPPORTUNITY',
        entityId: opportunity.id,
        action: 'CREATED',
        metadata: { title: opportunity.title, stage: opportunity.stage },
      },
    });

    return opportunity;
  }

  async findAll(tenantId: string) {
    return this.prisma.opportunity.findMany({
      where: { tenantId },
      include: { contact: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.opportunity.findFirst({
      where: { id, tenantId },
      include: { contact: true, proposals: true },
    });
  }

  async update(
    tenantId: string,
    userId: string,
    id: string,
    updateOpportunityDto: UpdateOpportunityDto,
  ) {
    const opportunity = await this.prisma.opportunity.update({
      where: { id, tenantId },
      data: updateOpportunityDto,
    });

    await this.prisma.activity.create({
      data: {
        tenantId,
        userId,
        entityType: 'OPPORTUNITY',
        entityId: opportunity.id,
        action: 'UPDATED',
        metadata: updateOpportunityDto,
      },
    });

    return opportunity;
  }

  async remove(tenantId: string, userId: string, id: string) {
    const opportunity = await this.prisma.opportunity.delete({
      where: { id, tenantId },
    });

    await this.prisma.activity.create({
      data: {
        tenantId,
        userId,
        entityType: 'OPPORTUNITY',
        entityId: opportunity.id,
        action: 'DELETED',
        metadata: { title: opportunity.title },
      },
    });

    return opportunity;
  }
}
