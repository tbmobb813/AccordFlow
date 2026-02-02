import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, createInvoiceDto: CreateInvoiceDto) {
    const invoice = await this.prisma.invoice.create({
      data: {
        ...createInvoiceDto,
        tenantId,
      },
    });

    await this.prisma.activity.create({
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
    const invoice = await this.prisma.invoice.update({
      where: { id, tenantId },
      data: updateInvoiceDto,
    });

    await this.prisma.activity.create({
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
  }

  async remove(tenantId: string, userId: string, id: string) {
    const invoice = await this.prisma.invoice.delete({
      where: { id, tenantId },
    });

    await this.prisma.activity.create({
      data: {
        tenantId,
        userId,
        entityType: 'INVOICE',
        entityId: invoice.id,
        action: 'DELETED',
        metadata: { invoiceNumber: invoice.invoiceNumber },
      },
    });

    return invoice;
  }
}
