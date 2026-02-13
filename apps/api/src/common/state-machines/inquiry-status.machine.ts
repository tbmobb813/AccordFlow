import { Injectable } from '@nestjs/common';
import { BaseStateMachine } from './base-state-machine';

export enum InquiryStatus {
  NEW = 'NEW',
  IN_REVIEW = 'IN_REVIEW',
  CONVERTED = 'CONVERTED',
  REJECTED = 'REJECTED',
}

@Injectable()
export class InquiryStatusMachine extends BaseStateMachine<InquiryStatus> {
  protected entityName = 'Inquiry';

  protected transitions: Record<InquiryStatus, InquiryStatus[]> = {
    [InquiryStatus.NEW]: [InquiryStatus.IN_REVIEW, InquiryStatus.REJECTED],
    [InquiryStatus.IN_REVIEW]: [InquiryStatus.CONVERTED, InquiryStatus.REJECTED],
    [InquiryStatus.CONVERTED]: [], // Terminal state
    [InquiryStatus.REJECTED]: [], // Terminal state
  };
}
