import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, createPaymentDto: CreatePaymentDto) {
    const payment = await this.prisma.payment.create({
      data: {
        ...createPaymentDto,
        tenantId,
      },
    });

    await this.prisma.activity.create({
      data: {
        tenantId,
        userId,
        entityType: 'PAYMENT',
        entityId: payment.id,
        action: 'CREATED',
        metadata: { amount: payment.amount.toString(), status: payment.status },
      },
    });

    return payment;
  }

  async findAll(tenantId: string) {
    return this.prisma.payment.findMany({
      where: { tenantId },
      include: { invoice: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.payment.findFirst({
      where: { id, tenantId },
      include: { invoice: true },
    });
  }

  async update(tenantId: string, userId: string, id: string, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.prisma.payment.update({
      where: { id, tenantId },
      data: updatePaymentDto,
    });

    await this.prisma.activity.create({
      data: {
        tenantId,
        userId,
        entityType: 'PAYMENT',
        entityId: payment.id,
        action: 'UPDATED',
        metadata: updatePaymentDto,
      },
    });

    return payment;
  }

  async remove(tenantId: string, userId: string, id: string) {
    const payment = await this.prisma.payment.delete({
      where: { id, tenantId },
    });

    await this.prisma.activity.create({
      data: {
        tenantId,
        userId,
        entityType: 'PAYMENT',
        entityId: payment.id,
        action: 'DELETED',
        metadata: { amount: payment.amount.toString() },
      },
    });

    return payment;
  }
}
