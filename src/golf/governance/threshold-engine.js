/**
 * Alex Wenger² Threshold Evaluation Engine
 * Implements Claim 1, Claim 2, Claim 7 (Deterministic configuration-driven threshold evaluations)
 */

import thresholdConfig from './threshold-config.json' with { type: 'json' };

export class ThresholdEngine {
  constructor(config = thresholdConfig) {
    this.config = config;
    this.version = config.version || "1.0.0";
  }

  evaluateThresholds(signals, driftResult, consecutiveCount, context = {}) {
    const evaluations = [];
    const runId = context.run_id || `run-${Date.now()}`;
    const playerId = context.player_id || "urn:davincia:athlete:alex_wenger";
    const timestamp = Date.now();

    const sentimentVal = signals?.sentiment_polarity ?? 0.0;
    const complianceVal = signals?.compliance_score ?? 0.8;
    const baselineSentiment = driftResult?.baseline_metrics?.avg_sentiment ?? 0.0;
    const baselineCompliance = driftResult?.baseline_metrics?.avg_compliance ?? 0.8;

    // 1. Evaluate TH-SENTIMENT-DROP-01
    const thSentiment = this.config.thresholds.find(t => t.id === "TH-SENTIMENT-DROP-01");
    const sentimentDropTriggered = (sentimentVal < thSentiment.critical_value) || 
      (driftResult?.status === "CALCULATED" && (baselineSentiment - sentimentVal) > thSentiment.divergence_delta);
    
    evaluations.push({
      threshold_id: thSentiment.id,
      threshold_version: thSentiment.version,
      claim_ref: thSentiment.claim_ref,
      input_signal: "sentiment_polarity",
      baseline: baselineSentiment,
      computed_value: sentimentVal,
      comparison: `${sentimentVal} < ${thSentiment.critical_value} OR drop > ${thSentiment.divergence_delta}`,
      result: sentimentDropTriggered,
      timestamp,
      run_id: runId,
      player_id: playerId,
      policy_version: "1.0.0"
    });

    // 2. Evaluate TH-COMPLIANCE-MIN-02
    const thCompliance = this.config.thresholds.find(t => t.id === "TH-COMPLIANCE-MIN-02");
    const complianceDropTriggered = complianceVal < thCompliance.critical_value;
    
    evaluations.push({
      threshold_id: thCompliance.id,
      threshold_version: thCompliance.version,
      claim_ref: thCompliance.claim_ref,
      input_signal: "compliance_score",
      baseline: baselineCompliance,
      computed_value: complianceVal,
      comparison: `${complianceVal} < ${thCompliance.critical_value}`,
      result: complianceDropTriggered,
      timestamp,
      run_id: runId,
      player_id: playerId,
      policy_version: "1.0.0"
    });

    // 3. Evaluate TH-PERSISTENT-DEVIATION-03
    const thPersistent = this.config.thresholds.find(t => t.id === "TH-PERSISTENT-DEVIATION-03");
    const persistentTriggered = consecutiveCount >= thPersistent.critical_value;
    
    evaluations.push({
      threshold_id: thPersistent.id,
      threshold_version: thPersistent.version,
      claim_ref: thPersistent.claim_ref,
      input_signal: "consecutive_divergence_count",
      baseline: 0,
      computed_value: consecutiveCount,
      comparison: `${consecutiveCount} >= ${thPersistent.critical_value}`,
      result: persistentTriggered,
      timestamp,
      run_id: runId,
      player_id: playerId,
      policy_version: "1.0.0"
    });

    // 4. Evaluate TH-RECOVERY-STABILITY-04
    const thRecovery = this.config.thresholds.find(t => t.id === "TH-RECOVERY-STABILITY-04");
    const recoveryTriggered = (sentimentVal >= thRecovery.critical_value) && (complianceVal >= 0.70);

    evaluations.push({
      threshold_id: thRecovery.id,
      threshold_version: thRecovery.version,
      claim_ref: thRecovery.claim_ref,
      input_signal: "recovery_stability",
      baseline: baselineSentiment,
      computed_value: sentimentVal,
      comparison: `${sentimentVal} >= ${thRecovery.critical_value} AND compliance >= 0.70`,
      result: recoveryTriggered,
      timestamp,
      run_id: runId,
      player_id: playerId,
      policy_version: "1.0.0"
    });

    return {
      evaluations,
      has_divergence: sentimentDropTriggered || complianceDropTriggered,
      is_persistent: persistentTriggered,
      is_recovering: recoveryTriggered,
      run_id: runId,
      evaluated_at: new Date(timestamp).toISOString()
    };
  }
}
