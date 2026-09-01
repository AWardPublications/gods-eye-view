import test from 'node:test';
import assert from 'node:assert/strict';
import { ThresholdEngine } from '../../../src/golf/governance/threshold-engine.js';
import { ToneStateMachine, TONE_STATES } from '../../../src/golf/governance/tone-state-machine.js';

test('Claim 7: Deterministic tone modulation boundary triggers on statistical sentiment/compliance drop', () => {
  const engine = new ThresholdEngine();
  const sm = new ToneStateMachine();

  // 1. Positive Signal -> No trigger (stays in BASELINE)
  const posEval = engine.evaluateThresholds({ sentiment_polarity: 0.5, compliance_score: 0.9 }, { status: "INSUFFICIENT_HISTORY" }, 0);
  assert.equal(posEval.has_divergence, false);
  const posTrans = sm.transition(posEval);
  assert.equal(posTrans.current_state, TONE_STATES.BASELINE);

  // 2. Negative Sentiment (-0.3) -> Crosses TH-SENTIMENT-DROP-01 -> Triggers MODULATED
  const negEval = engine.evaluateThresholds({ sentiment_polarity: -0.3, compliance_score: 0.9 }, { status: "INSUFFICIENT_HISTORY" }, 0);
  assert.equal(negEval.has_divergence, true);
  const negTrans = sm.transition(negEval);
  assert.equal(negTrans.current_state, TONE_STATES.MODULATED);
  assert.equal(negTrans.transition.trigger, "THRESHOLD:SENTIMENT_OR_COMPLIANCE_DROP");

  // 3. Low Compliance (0.4) -> Crosses TH-COMPLIANCE-MIN-02 -> Triggers MODULATED
  const sm2 = new ToneStateMachine();
  const lowCompEval = engine.evaluateThresholds({ sentiment_polarity: 0.1, compliance_score: 0.4 }, { status: "INSUFFICIENT_HISTORY" }, 0);
  assert.equal(lowCompEval.has_divergence, true);
  const lowCompTrans = sm2.transition(lowCompEval);
  assert.equal(lowCompTrans.current_state, TONE_STATES.MODULATED);
});
