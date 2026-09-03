/**
 * Alex Wenger² Failover Catalogue & Recovery Engine
 * Implements Claim 4, 7, 8 failover handling for edge, error, and timeout conditions
 */

export const FAILOVER_CODES = {
  NO_SENTIMENT_SIGNAL: "NO_SENTIMENT_SIGNAL",
  THRESHOLD_COMPUTATION_FAILURE: "THRESHOLD_COMPUTATION_FAILURE",
  COMPLIANCE_CLASSIFIER_FAILURE: "COMPLIANCE_CLASSIFIER_FAILURE",
  CONTRADICTORY_SIGNALS: "CONTRADICTORY_SIGNALS",
  TONE_STATE_TIMEOUT: "TONE_STATE_TIMEOUT",
  LATENCY_TIMEOUT: "LATENCY_TIMEOUT",
  INSUFFICIENT_HISTORY: "INSUFFICIENT_HISTORY",
  AMBIGUOUS_INPUT: "AMBIGUOUS_INPUT"
};

export class FailoverHandler {
  static handleFailover(code, details = {}, context = {}) {
    const runId = context.run_id || `failover-run-${Date.now()}`;
    const timestamp = Date.now();

    let safeToneState = "NEUTRAL";
    let fallbackAction = "FALLBACK_NEUTRAL_PROMPT";
    let message = "Safe governance fallback activated.";

    switch (code) {
      case FAILOVER_CODES.NO_SENTIMENT_SIGNAL:
        message = "Natural language input contained no recognizable sentiment cues. Defaulting to neutral direct coaching.";
        safeToneState = "NEUTRAL";
        break;

      case FAILOVER_CODES.THRESHOLD_COMPUTATION_FAILURE:
        message = "Threshold evaluation engine encountered compute error. Adopting safe conservative neutral bounds.";
        safeToneState = "NEUTRAL";
        break;

      case FAILOVER_CODES.COMPLIANCE_CLASSIFIER_FAILURE:
        message = "Compliance classifier returned low-confidence or unparsable output. Falling back to rule-based baseline assumption.";
        safeToneState = "BASELINE";
        fallbackAction = "RULE_BASED_ASSUMPTION";
        break;

      case FAILOVER_CODES.CONTRADICTORY_SIGNALS:
        message = "Contradictory sentiment and adherence signals detected. Prioritizing safe concise clarification.";
        safeToneState = "MODULATED";
        break;

      case FAILOVER_CODES.INSUFFICIENT_HISTORY:
        message = "Athlete has fewer than minimum required historical sessions. Operating under default baseline without drift penalty.";
        safeToneState = "BASELINE";
        fallbackAction = "DEFAULT_BASELINE_INTAKE";
        break;

      case FAILOVER_CODES.LATENCY_TIMEOUT:
        message = "Processing exceeded maximum latency budget. Defaulting immediately to cached safe summary.";
        safeToneState = "NEUTRAL";
        fallbackAction = "EMIT_CACHED_SUMMARY";
        break;

      case FAILOVER_CODES.AMBIGUOUS_INPUT:
      default:
        message = "Ambiguous natural-language input. Prompting athlete for direct drill feedback.";
        safeToneState = "NEUTRAL";
        break;
    }

    const failoverEvent = {
      event_id: `urn:wenger:failover:${runId}_${code}`,
      run_id: runId,
      failover_code: code,
      safe_tone_state: safeToneState,
      fallback_action: fallbackAction,
      message,
      details,
      timestamp,
      iso_time: new Date(timestamp).toISOString()
    };

    return failoverEvent;
  }
}
