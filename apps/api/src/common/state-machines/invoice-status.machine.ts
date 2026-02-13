import { Injectable } from '@nestjs/common';
import { BaseStateMachine } from './base-state-machine';

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  VOID = 'VOID',
}

@Injectable()
export class InvoiceStatusMachine extends BaseStateMachine<InvoiceStatus> {
  protected entityName = 'Invoice';

  protected transitions: Record<InvoiceStatus, InvoiceStatus[]> = {
    [InvoiceStatus.DRAFT]: [InvoiceStatus.SENT, InvoiceStatus.VOID],
    [InvoiceStatus.SENT]: [
      InvoiceStatus.PARTIALLY_PAID,
      InvoiceStatus.OVERDUE,
      InvoiceStatus.VOID,
    ],
    [InvoiceStatus.PARTIALLY_PAID]: [InvoiceStatus.PAID],
    [InvoiceStatus.OVERDUE]: [InvoiceStatus.PAID, InvoiceStatus.PARTIALLY_PAID],
    [InvoiceStatus.PAID]: [], // Terminal state
    [InvoiceStatus.VOID]: [], // Terminal state
  };

  /**
   * Only draft invoices can be edited
   */
  canEdit(status: InvoiceStatus): boolean {
    return status === InvoiceStatus.DRAFT;
  }

  /**
   * Only draft invoices can be sent
   */
  canSend(status: InvoiceStatus): boolean {
    return status === InvoiceStatus.DRAFT;
  }

  /**
   * Cannot void paid invoices
   */
  canVoid(status: InvoiceStatus): boolean {
    return status !== InvoiceStatus.PAID;
  }

  /**
   * Calculate new status based on payment
   */
  calculateStatusAfterPayment(
    totalAmount: number,
    amountPaid: number,
  ): InvoiceStatus {
    if (amountPaid >= totalAmount) {
      return InvoiceStatus.PAID;
    } else if (amountPaid > 0) {
      return InvoiceStatus.PARTIALLY_PAID;
    }
    return InvoiceStatus.SENT;
  }
}
