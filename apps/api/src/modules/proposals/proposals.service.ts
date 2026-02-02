import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateProposalDto, UpdateProposalDto } from './dto/proposal.dto';

@Injectable()
export class ProposalsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, createProposalDto: CreateProposalDto) {
    const proposal = await this.prisma.proposal.create({
      data: {
        ...createProposalDto,
        tenantId,
      },
    });

    await this.prisma.activity.create({
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
      include: { opportunity: true, agreements: true },
    });
  }

  async update(tenantId: string, userId: string, id: string, updateProposalDto: UpdateProposalDto) {
    const proposal = await this.prisma.proposal.update({
      where: { id, tenantId },
      data: updateProposalDto,
    });

    await this.prisma.activity.create({
      data: {
        tenantId,
        userId,
        entityType: 'PROPOSAL',
        entityId: proposal.id,
        action: 'UPDATED',
        metadata: updateProposalDto,
      },
    });

    return proposal;
  }

  async remove(tenantId: string, userId: string, id: string) {
    const proposal = await this.prisma.proposal.delete({
      where: { id, tenantId },
    });

    await this.prisma.activity.create({
      data: {
        tenantId,
        userId,
        entityType: 'PROPOSAL',
        entityId: proposal.id,
        action: 'DELETED',
        metadata: { title: proposal.title },
      },
    });

    return proposal;
  }
}
