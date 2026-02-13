import { StateTransitionError } from '../errors/state-transition.error';

export abstract class BaseStateMachine<TState extends string> {
  protected abstract transitions: Record<TState, TState[]>;
  protected abstract entityName: string;

  /**
   * Validates if a state transition is allowed
   * @throws StateTransitionError if transition is not allowed
   */
  validate(from: TState, to: TState): void {
    const allowed = this.transitions[from] || [];

    if (!allowed.includes(to)) {
      throw new StateTransitionError({
        currentState: from,
        requestedState: to,
        allowedTransitions: allowed,
        entity: this.entityName,
      });
    }
  }

  /**
   * Checks if a state is terminal (no further transitions allowed)
   */
  isTerminal(state: TState): boolean {
    const allowed = this.transitions[state];
    return !allowed || allowed.length === 0;
  }

  /**
   * Gets all allowed transitions from a given state
   */
  getAllowedTransitions(from: TState): TState[] {
    return this.transitions[from] || [];
  }

  /**
   * Checks if a transition is allowed (without throwing)
   */
  canTransition(from: TState, to: TState): boolean {
    const allowed = this.transitions[from] || [];
    return allowed.includes(to);
  }
}
