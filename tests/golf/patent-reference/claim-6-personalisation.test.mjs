import test from 'node:test';
import assert from 'node:assert/strict';
import { OutputControlModule } from '../../../src/golf/article19/output-control.js';

test('Claim 6: Personalized NLP adaptation modifying pacing, instructional complexity, and framing', () => {
  const outputCtrl = new OutputControlModule();

  // Test across all 4 modulated operational profiles
  const profiles = ["BASELINE", "MODULATED", "RECOVERING", "DECAYED"];
  const results = profiles.map(p => outputCtrl.generateAdaptiveResponse("Focus on wrist hinge at apex.", p));

  assert.equal(results[0].pacing_units, 1.0);
  assert.equal(results[1].pacing_units, 0.5);
  assert.equal(results[2].pacing_units, 0.8);
  assert.equal(results[3].pacing_units, 0.2);

  assert.equal(results[0].instructional_complexity, "DETAILED");
  assert.equal(results[1].instructional_complexity, "SIMPLIFIED");
  assert.equal(results[2].instructional_complexity, "MODERATE");
  assert.equal(results[3].instructional_complexity, "MINIMAL");
});
