import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, createInvoiceDto: CreateInvoiceDto) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          ...createInvoiceDto,
          tenantId,
        },
      });

      await tx.activity.create({
        data: {
          tenantId,
          userId,
          entityType: 'INVOICE',
          entityId: invoice.id,
          action: 'CREATED',
          metadata: { invoiceNumber: invoice.invoiceNumber, amount: invoice.amount.toString() },
        },
      });

      return invoice;
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.invoice.findMany({
      where: { tenantId },
      include: { agreement: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: { agreement: true, payments: true },
    });
  }

  async update(tenantId: string, userId: string, id: string, updateInvoiceDto: UpdateInvoiceDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.invoice.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        throw new Error('Invoice not found');
      }

      const invoice = await tx.invoice.update({
        where: { id },
        data: updateInvoiceDto,
      });

      await tx.activity.create({
        data: {
          tenantId,
          userId,
          entityType: 'INVOICE',
          entityId: invoice.id,
          action: 'UPDATED',
          metadata: updateInvoiceDto,
        },
      });

      return invoice;
    });
  }

  async remove(tenantId: string, userId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findFirst({
        where: { id, tenantId },
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      await tx.activity.create({
        data: {
          tenantId,
          userId,
          entityType: 'INVOICE',
          entityId: invoice.id,
          action: 'DELETED',
          metadata: { invoiceNumber: invoice.invoiceNumber },
        },
      });

      await tx.invoice.delete({
        where: { id },
      });

      return invoice;
    });
  }
}
