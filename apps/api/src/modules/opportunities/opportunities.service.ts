import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateOpportunityDto, UpdateOpportunityDto } from './dto/opportunity.dto';

@Injectable()
export class OpportunitiesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, createOpportunityDto: CreateOpportunityDto) {
    return this.prisma.$transaction(async (tx) => {
      // Verify the contact exists and belongs to the tenant
      const contact = await tx.contact.findFirst({
        where: { id: createOpportunityDto.contactId, tenantId },
      });

      if (!contact) {
        throw new Error('Contact not found or does not belong to this tenant');
      }

      const opportunity = await tx.opportunity.create({
        data: {
          ...createOpportunityDto,
          tenantId,
        },
      });

      await tx.activity.create({
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
    });
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
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.opportunity.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        throw new Error('Opportunity not found');
      }

      // If contactId is being updated, verify it belongs to the tenant
      if (updateOpportunityDto.contactId) {
        const contact = await tx.contact.findFirst({
          where: { id: updateOpportunityDto.contactId, tenantId },
        });

        if (!contact) {
          throw new Error('Contact not found or does not belong to this tenant');
        }
      }

      const opportunity = await tx.opportunity.update({
        where: { id },
        data: updateOpportunityDto,
      });

      await tx.activity.create({
        data: {
          tenantId,
          userId,
          entityType: 'OPPORTUNITY',
          entityId: opportunity.id,
          action: 'UPDATED',
          metadata: updateOpportunityDto as any,
        },
      });

      return opportunity;
    });
  }

  async remove(tenantId: string, userId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const opportunity = await tx.opportunity.findFirst({
        where: { id, tenantId },
      });

      if (!opportunity) {
        throw new Error('Opportunity not found');
      }

      await tx.activity.create({
        data: {
          tenantId,
          userId,
          entityType: 'OPPORTUNITY',
          entityId: opportunity.id,
          action: 'DELETED',
          metadata: { title: opportunity.title },
        },
      });

      await tx.opportunity.delete({
        where: { id },
      });

      return opportunity;
    });
  }
}
