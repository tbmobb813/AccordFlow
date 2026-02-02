import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, createContactDto: CreateContactDto) {
    const contact = await this.prisma.contact.create({
      data: {
        ...createContactDto,
        tenantId,
      },
    });

    // Log activity
    await this.prisma.activity.create({
      data: {
        tenantId,
        userId,
        entityType: 'CONTACT',
        entityId: contact.id,
        action: 'CREATED',
        metadata: {
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
        },
      },
    });

    return contact;
  }

  async findAll(tenantId: string) {
    return this.prisma.contact.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.contact.findFirst({
      where: { id, tenantId },
      include: {
        opportunities: true,
      },
    });
  }

  async update(tenantId: string, userId: string, id: string, updateContactDto: UpdateContactDto) {
    const contact = await this.prisma.contact.update({
      where: { id, tenantId },
      data: updateContactDto,
    });

    // Log activity
    await this.prisma.activity.create({
      data: {
        tenantId,
        userId,
        entityType: 'CONTACT',
        entityId: contact.id,
        action: 'UPDATED',
        metadata: updateContactDto,
      },
    });

    return contact;
  }

  async remove(tenantId: string, userId: string, id: string) {
    const contact = await this.prisma.contact.delete({
      where: { id, tenantId },
    });

    // Log activity
    await this.prisma.activity.create({
      data: {
        tenantId,
        userId,
        entityType: 'CONTACT',
        entityId: contact.id,
        action: 'DELETED',
        metadata: {
          firstName: contact.firstName,
          lastName: contact.lastName,
        },
      },
    });

    return contact;
  }
}
