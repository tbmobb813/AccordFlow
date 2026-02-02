import { Injectable } from '@nestjs/common';
import { BaseStateMachine } from './base-state-machine';

export enum AgreementSignatureStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  SIGNED = 'SIGNED',
  DECLINED = 'DECLINED',
  CANCELED = 'CANCELED',
}

@Injectable()
export class AgreementSignatureMachine extends BaseStateMachine<AgreementSignatureStatus> {
  protected entityName = 'Agreement';

  protected transitions: Record<AgreementSignatureStatus, AgreementSignatureStatus[]> = {
    [AgreementSignatureStatus.DRAFT]: [
      AgreementSignatureStatus.SENT,
      AgreementSignatureStatus.CANCELED,
    ],
    [AgreementSignatureStatus.SENT]: [
      AgreementSignatureStatus.SIGNED,
      AgreementSignatureStatus.DECLINED,
      AgreementSignatureStatus.CANCELED,
    ],
    [AgreementSignatureStatus.SIGNED]: [], // Terminal state
    [AgreementSignatureStatus.DECLINED]: [], // Terminal state
    [AgreementSignatureStatus.CANCELED]: [], // Terminal state
  };

  /**
   * Only draft agreements can be edited
   */
  canEdit(status: AgreementSignatureStatus): boolean {
    return status === AgreementSignatureStatus.DRAFT;
  }

  /**
   * Only draft agreements can be sent
   */
  canSend(status: AgreementSignatureStatus): boolean {
    return status === AgreementSignatureStatus.DRAFT;
  }
}
