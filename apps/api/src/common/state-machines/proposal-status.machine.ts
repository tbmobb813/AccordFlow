import { Injectable } from '@nestjs/common';
import { BaseStateMachine } from './base-state-machine';

export enum ProposalStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

@Injectable()
export class ProposalStatusMachine extends BaseStateMachine<ProposalStatus> {
  protected entityName = 'Proposal';

  protected transitions: Record<ProposalStatus, ProposalStatus[]> = {
    [ProposalStatus.DRAFT]: [ProposalStatus.SENT],
    [ProposalStatus.SENT]: [ProposalStatus.VIEWED, ProposalStatus.EXPIRED],
    [ProposalStatus.VIEWED]: [ProposalStatus.ACCEPTED, ProposalStatus.REJECTED],
    [ProposalStatus.ACCEPTED]: [], // Terminal state
    [ProposalStatus.REJECTED]: [], // Terminal state
    [ProposalStatus.EXPIRED]: [], // Terminal state
  };

  /**
   * Only draft proposals can be edited
   */
  canEdit(status: ProposalStatus): boolean {
    return status === ProposalStatus.DRAFT;
  }

  /**
   * Only draft proposals can be sent
   */
  canSend(status: ProposalStatus): boolean {
    return status === ProposalStatus.DRAFT;
  }
}
