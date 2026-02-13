import { Injectable } from '@nestjs/common';
import { BaseStateMachine } from './base-state-machine';

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Injectable()
export class PaymentStatusMachine extends BaseStateMachine<PaymentStatus> {
  protected entityName = 'Payment';

  protected transitions: Record<PaymentStatus, PaymentStatus[]> = {
    [PaymentStatus.PENDING]: [PaymentStatus.SUCCEEDED, PaymentStatus.FAILED],
    [PaymentStatus.SUCCEEDED]: [PaymentStatus.REFUNDED],
    [PaymentStatus.FAILED]: [], // Terminal state
    [PaymentStatus.REFUNDED]: [], // Terminal state
  };
}
