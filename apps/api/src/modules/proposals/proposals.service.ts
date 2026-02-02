import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateProposalDto, UpdateProposalDto } from './dto/proposal.dto';

@Injectable()
export class ProposalsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, createProposalDto: CreateProposalDto) {
    return this.prisma.$transaction(async (tx) => {
      const proposal = await tx.proposal.create({
        data: {
          ...createProposalDto,
          tenantId,
        },
      });

      await tx.activity.create({
        data: {
          tenantId,
          userId,
          entityType: 'PROPOSAL',
          entityId: proposal.id,
          action: 'CREATED',
          metadata: { title: proposal.title, status: proposal.status },
        },
      });

      return proposal;
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.proposal.findMany({
      where: { tenantId },
      include: { opportunity: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.proposal.findFirst({
      where: { id, tenantId },
      include: { opportunity: true, agreement: true },
    });
  }

  async update(tenantId: string, userId: string, id: string, updateProposalDto: UpdateProposalDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.proposal.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        throw new Error('Proposal not found');
      }

      const proposal = await tx.proposal.update({
        where: { id },
        data: updateProposalDto,
      });

      await tx.activity.create({
        data: {
          tenantId,
          userId,
          entityType: 'PROPOSAL',
          entityId: proposal.id,
          action: 'UPDATED',
          metadata: updateProposalDto as any,
        },
      });

      return proposal;
    });
  }

  async remove(tenantId: string, userId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const proposal = await tx.proposal.findFirst({
        where: { id, tenantId },
      });

      if (!proposal) {
        throw new Error('Proposal not found');
      }

      await tx.activity.create({
        data: {
          tenantId,
          userId,
          entityType: 'PROPOSAL',
          entityId: proposal.id,
          action: 'DELETED',
          metadata: { title: proposal.title },
        },
      });

      await tx.proposal.delete({
        where: { id },
      });

      return proposal;
    });
  }
}
