import { HttpException, HttpStatus } from '@nestjs/common';

export interface StateTransitionErrorDetails {
  currentState: string;
  requestedState: string;
  allowedTransitions: string[];
  entity?: string;
}

export class StateTransitionError extends HttpException {
  constructor(details: StateTransitionErrorDetails) {
    super(
      {
        code: 'INVALID_STATE_TRANSITION',
        message: `Cannot transition from ${details.currentState} to ${details.requestedState}`,
        details,
      },
      HttpStatus.CONFLICT,
    );
  }
}
