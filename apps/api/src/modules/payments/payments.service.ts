import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, createPaymentDto: CreatePaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          tenantId,
          invoiceId: createPaymentDto.invoiceId,
          opportunityId: createPaymentDto.opportunityId,
          provider: createPaymentDto.provider ?? 'MANUAL',
          providerPaymentId: createPaymentDto.providerPaymentId,
          amount: createPaymentDto.amount,
          currency: createPaymentDto.currency ?? 'USD',
          status: createPaymentDto.status,
        },
      });

      await tx.activity.create({
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
    });
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
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.payment.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        throw new Error('Payment not found');
      }

      const payment = await tx.payment.update({
        where: { id },
        data: updatePaymentDto,
      });

      await tx.activity.create({
        data: {
          tenantId,
          userId,
          entityType: 'PAYMENT',
          entityId: payment.id,
          action: 'UPDATED',
          metadata: updatePaymentDto as any,
        },
      });

      return payment;
    });
  }

  async remove(tenantId: string, userId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: { id, tenantId },
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      await tx.activity.create({
        data: {
          tenantId,
          userId,
          entityType: 'PAYMENT',
          entityId: payment.id,
          action: 'DELETED',
          metadata: { amount: payment.amount.toString() },
        },
      });

      await tx.payment.delete({
        where: { id },
      });

      return payment;
    });
  }
}
