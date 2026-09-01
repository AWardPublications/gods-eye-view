/**
 * Alex Wenger² Article 19 Reference Implementation Subsystem
 * Downstream of the DNSL Governance Spine
 */

import { SignalExtractor } from './article19/signals.js';
import { RuleBasedComplianceClassifier } from './article19/compliance-classifier.js';
import { EngagementDriftAnalyzer } from './article19/engagement-drift.js';
import { OutputControlModule } from './article19/output-control.js';
import { ThresholdEngine } from './governance/threshold-engine.js';
import { ToneStateMachine } from './governance/tone-state-machine.js';
import { PersistentMemoryArchitecture } from './governance/session-memory-schema.js';
import { PolicyRouter, OPERATING_MODES } from './governance/policy-router.js';
import { FailoverHandler, FAILOVER_CODES } from './governance/failover-catalogue.js';
import { EvidenceReceiptGenerator } from './governance/evidence-receipt.js';

export {
  SignalExtractor,
  RuleBasedComplianceClassifier,
  EngagementDriftAnalyzer,
  OutputControlModule,
  ThresholdEngine,
  ToneStateMachine,
  PersistentMemoryArchitecture,
  PolicyRouter,
  FailoverHandler,
  EvidenceReceiptGenerator,
  OPERATING_MODES,
  FAILOVER_CODES
};

export class AlexWengerSubsystem {
  constructor() {
    this.signalExtractor = new SignalExtractor();
    this.complianceClassifier = new RuleBasedComplianceClassifier();
    this.driftAnalyzer = new EngagementDriftAnalyzer();
    this.thresholdEngine = new ThresholdEngine();
    this.toneStateMachine = new ToneStateMachine();
    this.outputControl = new OutputControlModule();
    this.memory = new PersistentMemoryArchitecture();
    this.router = new PolicyRouter();
  }

  async executeCoachingTurn(rawNaturalLanguageInput, options = {}) {
    const runId = options.run_id || `wenger-run-${Date.now()}`;
    const playerId = options.player_id || "urn:davincia:athlete:alex_wenger";
    const mode = options.mode || "TRAIN";
    const consentState = {
      athlete_consent: options.athlete_consent !== false,
      human_supervision: !!options.human_supervision,
      career_opt_in: !!options.career_opt_in
    };

    // 1. Signal Extraction (Claim 1)
    const signals = this.signalExtractor.extractSignals(rawNaturalLanguageInput);
    if (!signals.valid) {
      const failover = FailoverHandler.handleFailover(FAILOVER_CODES.AMBIGUOUS_INPUT, { input: rawNaturalLanguageInput }, { run_id: runId });
      const failoverResponse = this.outputControl.generateAdaptiveResponse(null, failover.safe_tone_state, mode);
      return {
        status: "FAILOVER",
        run_id: runId,
        failover_event: failover,
        output: failoverResponse
      };
    }

    // 2. Compliance Classification (Claim 9)
    const compliance = this.complianceClassifier.classify(rawNaturalLanguageInput);
    signals.compliance_score = compliance.score;

    // 3. Engagement Drift Analytics (Claim 5)
    const historical = this.memory.getSessionsByPlayer(playerId, 5);
    const driftResult = this.driftAnalyzer.analyzeDrift(signals, historical);

    // 4. Threshold Engine Evaluation (Claim 1, 2, 7)
    const thresholdEval = this.thresholdEngine.evaluateThresholds(
      signals, 
      driftResult, 
      this.toneStateMachine.consecutiveDivergenceCount,
      { run_id: runId, player_id: playerId }
    );

    // 5. Tone State Machine Transition (Claim 7, 8)
    const toneTransition = this.toneStateMachine.transition(thresholdEval);

    // 6. Deterministic Policy Routing (Claim 2 & DNSL Spine)
    const routingResult = await this.router.routeRequest(mode, consentState, thresholdEval, { run_id: runId });

    if (routingResult.status !== "AUTHORIZED") {
      const blockedEnvelope = {
        status: "DENIED",
        run_id: runId,
        player_id: playerId,
        mode,
        routing_result: routingResult,
        output: {
          text: `[GOVERNANCE BLOCKED] ${routingResult.message}`,
          tone_state: "NEUTRAL",
          delivery_modality: "NONE"
        }
      };
      return blockedEnvelope;
    }

    // 7. Adaptive Content Generation (Claim 4, 6)
    const outputResult = this.outputControl.generateAdaptiveResponse(
      options.content_template,
      toneTransition.current_state,
      mode
    );

    // 8. Structured Persistent Memory Append (Claim 1, 3)
    const sessionRecord = this.memory.appendSessionRecord({
      player_id: playerId,
      run_id: runId,
      session_id: options.session_id,
      input_reference: `urn:wenger:input:${signals.timestamp}`,
      signal_vector: signals,
      sentiment_state: signals.sentiment_polarity,
      compliance_score: compliance.score,
      engagement_state: driftResult.drift_detected ? "DRIFT_DETECTED" : "ENGAGED",
      tone_state: toneTransition.current_state,
      threshold_results: thresholdEval.evaluations,
      routing_result: routingResult,
      execution_result: outputResult,
      evidence_reference: `urn:davincia:evidence:wenger:${runId}`
    });

    // 9. Evidence Receipt Generation (Spine ART-001 & AUD-002)
    const evidenceReceipt = EvidenceReceiptGenerator.generateReceipt({
      run_id: runId,
      player_id: playerId,
      mode,
      signals,
      compliance,
      thresholds: thresholdEval.evaluations,
      tone_state: toneTransition,
      routing_result: routingResult,
      output: outputResult
    });

    return {
      status: "SUCCESS",
      run_id: runId,
      player_id: playerId,
      mode,
      signals,
      compliance,
      drift_analysis: driftResult,
      threshold_evaluation: thresholdEval,
      tone_state: toneTransition.current_state,
      routing: routingResult,
      output: outputResult,
      session_entry: sessionRecord,
      evidence: evidenceReceipt
    };
  }
}
