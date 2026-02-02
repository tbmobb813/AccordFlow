import { Injectable } from '@nestjs/common';
import { BaseStateMachine } from './base-state-machine';

export enum ContactLifecycleStage {
  LEAD = 'LEAD',
  QUALIFIED = 'QUALIFIED',
  CLIENT = 'CLIENT',
  ARCHIVED = 'ARCHIVED',
}

@Injectable()
export class ContactLifecycleMachine extends BaseStateMachine<ContactLifecycleStage> {
  protected entityName = 'Contact';

  protected transitions: Record<ContactLifecycleStage, ContactLifecycleStage[]> = {
    [ContactLifecycleStage.LEAD]: [ContactLifecycleStage.QUALIFIED],
    [ContactLifecycleStage.QUALIFIED]: [ContactLifecycleStage.CLIENT],
    [ContactLifecycleStage.CLIENT]: [ContactLifecycleStage.ARCHIVED],
    [ContactLifecycleStage.ARCHIVED]: [], // Terminal state
  };
}
