import { Injectable } from '@nestjs/common';
import { BaseStateMachine } from './base-state-machine';

export enum OpportunityStatus {
  OPEN = 'OPEN',
  WON = 'WON',
  LOST = 'LOST',
}

@Injectable()
export class OpportunityStatusMachine extends BaseStateMachine<OpportunityStatus> {
  protected entityName = 'Opportunity';

  protected transitions: Record<OpportunityStatus, OpportunityStatus[]> = {
    [OpportunityStatus.OPEN]: [OpportunityStatus.WON, OpportunityStatus.LOST],
    [OpportunityStatus.WON]: [], // Terminal state
    [OpportunityStatus.LOST]: [], // Terminal state
  };
}
