import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, createContactDto: CreateContactDto) {
    return this.prisma.$transaction(async (tx) => {
      const contact = await tx.contact.create({
        data: {
          ...createContactDto,
          tenantId,
        },
      });

      // Log activity
      await tx.activity.create({
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
    });
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
    return this.prisma.$transaction(async (tx) => {
      // Verify the contact belongs to the tenant
      const existing = await tx.contact.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        throw new Error('Contact not found');
      }

      const contact = await tx.contact.update({
        where: { id },
        data: updateContactDto,
      });

      // Log activity
      await tx.activity.create({
        data: {
          tenantId,
          userId,
          entityType: 'CONTACT',
          entityId: contact.id,
          action: 'UPDATED',
          metadata: updateContactDto as any,
        },
      });

      return contact;
    });
  }

  async remove(tenantId: string, userId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      // Fetch the contact first so we can log the deletion before actually deleting it
      const contact = await tx.contact.findFirst({
        where: { id, tenantId },
      });

      if (!contact) {
        throw new Error('Contact not found');
      }

      // Log activity before deletion to avoid foreign key constraint issues
      await tx.activity.create({
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

      // Delete the contact
      await tx.contact.delete({
        where: { id },
      });

      return contact;
    });
  }
}
