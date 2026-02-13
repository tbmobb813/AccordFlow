import { Injectable } from '@nestjs/common';
import { BaseStateMachine } from './base-state-machine';

export enum MeetingStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
  NO_SHOW = 'NO_SHOW',
}

@Injectable()
export class MeetingStatusMachine extends BaseStateMachine<MeetingStatus> {
  protected entityName = 'Meeting';

  protected transitions: Record<MeetingStatus, MeetingStatus[]> = {
    [MeetingStatus.SCHEDULED]: [
      MeetingStatus.COMPLETED,
      MeetingStatus.CANCELED,
      MeetingStatus.NO_SHOW,
    ],
    [MeetingStatus.COMPLETED]: [], // Terminal state
    [MeetingStatus.CANCELED]: [], // Terminal state
    [MeetingStatus.NO_SHOW]: [], // Terminal state
  };
}
