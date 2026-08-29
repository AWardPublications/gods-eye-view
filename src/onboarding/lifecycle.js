export const LifecycleStates = {
  DISCOVERED: "DISCOVERED",
  PROFILED: "PROFILED",
  PROPOSED: "PROPOSED",
  CONFORMANCE_PENDING: "CONFORMANCE_PENDING",
  CONFORMANT: "CONFORMANT",
  AUTHORIZED: "AUTHORIZED",
  SUSPENDED: "SUSPENDED",
  DEPRECATED: "DEPRECATED"
};

export class OnboardingStateMachine {
  constructor(systemId) {
    this.systemId = systemId;
    this.state = LifecycleStates.DISCOVERED;
    this.history = [
      { state: this.state, timestamp: new Date().toISOString() }
    ];
  }

  transitionTo(nextState) {
    if (!Object.values(LifecycleStates).includes(nextState)) {
      throw new Error(`Invalid lifecycle state: ${nextState}`);
    }
    this.state = nextState;
    this.history.push({
      state: nextState,
      timestamp: new Date().toISOString()
    });
    return this.state;
  }
}
