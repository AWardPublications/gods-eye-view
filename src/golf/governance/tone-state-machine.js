/**
 * Alex Wenger² Tone State Machine
 * Implements Claim 7 & Claim 8 (Deterministic state transitions: BASELINE, MODULATED, DECAYED, RECOVERING, NEUTRAL)
 */

export const TONE_STATES = {
  BASELINE: "BASELINE",
  MODULATED: "MODULATED",
  DECAYED: "DECAYED",
  RECOVERING: "RECOVERING",
  NEUTRAL: "NEUTRAL"
};

export class ToneStateMachine {
  constructor(initialState = TONE_STATES.BASELINE) {
    this.currentState = initialState;
    this.consecutiveDivergenceCount = 0;
    this.transitionHistory = [];
  }

  transition(thresholdEvaluation, failoverCode = null) {
    const prevState = this.currentState;
    let targetState = prevState;
    let trigger = "NONE";

    // 1. Failover condition overrides to NEUTRAL safe state
    if (failoverCode) {
      targetState = TONE_STATES.NEUTRAL;
      trigger = `FAILOVER:${failoverCode}`;
      this.consecutiveDivergenceCount = 0;
    } 
    // 2. Normal State Transitions driven by Threshold Engine
    else if (thresholdEvaluation.has_divergence) {
      this.consecutiveDivergenceCount++;
      if (thresholdEvaluation.is_persistent || this.consecutiveDivergenceCount >= 3) {
        targetState = TONE_STATES.DECAYED;
        trigger = "THRESHOLD:PERSISTENT_DEVIATION";
      } else {
        targetState = TONE_STATES.MODULATED;
        trigger = "THRESHOLD:SENTIMENT_OR_COMPLIANCE_DROP";
      }
    } else if (thresholdEvaluation.is_recovering) {
      if (prevState === TONE_STATES.MODULATED || prevState === TONE_STATES.DECAYED || prevState === TONE_STATES.NEUTRAL) {
        targetState = TONE_STATES.RECOVERING;
        trigger = "THRESHOLD:RECOVERY_STABILITY";
      } else if (prevState === TONE_STATES.RECOVERING) {
        targetState = TONE_STATES.BASELINE;
        trigger = "RECOVERY_COMPLETE";
      } else {
        targetState = TONE_STATES.BASELINE;
        trigger = "MAINTAIN_BASELINE";
      }
      this.consecutiveDivergenceCount = 0;
    } else {
      // Neutral baseline maintain
      if (prevState === TONE_STATES.RECOVERING) {
        targetState = TONE_STATES.BASELINE;
        trigger = "RECOVERY_NORMALIZED";
      }
      this.consecutiveDivergenceCount = 0;
    }

    this.currentState = targetState;
    const record = {
      from_state: prevState,
      to_state: targetState,
      trigger,
      consecutive_count: this.consecutiveDivergenceCount,
      timestamp: Date.now()
    };
    this.transitionHistory.push(record);

    return {
      current_state: this.currentState,
      transition: record
    };
  }

  reset() {
    this.currentState = TONE_STATES.BASELINE;
    this.consecutiveDivergenceCount = 0;
    this.transitionHistory = [];
  }
}
