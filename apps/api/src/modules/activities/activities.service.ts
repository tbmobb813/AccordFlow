import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { EntityType } from '@prisma/client';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, entityType?: string, entityId?: string) {
    let validatedEntityType: EntityType | undefined;
    if (entityType) {
      const values = Object.values(EntityType) as string[];
      if (!values.includes(entityType)) {
        throw new BadRequestException(`Invalid entityType: ${entityType}`);
      }
      validatedEntityType = entityType as EntityType;
    }

    return this.prisma.activity.findMany({
      where: {
        tenantId,
        ...(validatedEntityType && { entityType: validatedEntityType }),
        ...(entityId && { entityId }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.activity.findFirst({
      where: { id, tenantId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }
}
