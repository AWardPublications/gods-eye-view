import test from 'node:test';
import assert from 'node:assert/strict';
import { ThresholdEngine } from '../../../src/golf/governance/threshold-engine.js';
import { ToneStateMachine, TONE_STATES } from '../../../src/golf/governance/tone-state-machine.js';

test('Claim 8: Complete tone lifecycle (BASELINE -> MODULATED -> DECAYED -> RECOVERING -> BASELINE)', () => {
  const engine = new ThresholdEngine();
  const sm = new ToneStateMachine();

  // Turn 1: Normal Baseline
  let evalRes = engine.evaluateThresholds({ sentiment_polarity: 0.5, compliance_score: 0.9 }, {}, sm.consecutiveDivergenceCount);
  sm.transition(evalRes);
  assert.equal(sm.currentState, TONE_STATES.BASELINE);

  // Turn 2: Drop sentiment -> MODULATED
  evalRes = engine.evaluateThresholds({ sentiment_polarity: -0.4, compliance_score: 0.9 }, {}, sm.consecutiveDivergenceCount);
  sm.transition(evalRes);
  assert.equal(sm.currentState, TONE_STATES.MODULATED);

  // Turn 3: 2nd consecutive deviation -> MODULATED (count = 2)
  evalRes = engine.evaluateThresholds({ sentiment_polarity: -0.2, compliance_score: 0.5 }, {}, sm.consecutiveDivergenceCount);
  sm.transition(evalRes);
  assert.equal(sm.currentState, TONE_STATES.MODULATED);

  // Turn 4: 3rd consecutive deviation -> DECAYED (count = 3)
  evalRes = engine.evaluateThresholds({ sentiment_polarity: -0.3, compliance_score: 0.4 }, {}, sm.consecutiveDivergenceCount);
  sm.transition(evalRes);
  assert.equal(sm.currentState, TONE_STATES.DECAYED);

  // Turn 5: Normalization (sentiment = 0.6, compliance = 0.9) -> RECOVERING
  evalRes = engine.evaluateThresholds({ sentiment_polarity: 0.6, compliance_score: 0.9 }, {}, sm.consecutiveDivergenceCount);
  sm.transition(evalRes);
  assert.equal(sm.currentState, TONE_STATES.RECOVERING);

  // Turn 6: Continued normalization -> BASELINE
  evalRes = engine.evaluateThresholds({ sentiment_polarity: 0.7, compliance_score: 1.0 }, {}, sm.consecutiveDivergenceCount);
  sm.transition(evalRes);
  assert.equal(sm.currentState, TONE_STATES.BASELINE);
});
