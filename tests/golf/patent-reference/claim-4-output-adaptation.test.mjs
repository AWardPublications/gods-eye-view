import test from 'node:test';
import assert from 'node:assert/strict';
import { OutputControlModule } from '../../../src/golf/article19/output-control.js';

test('Claim 4: Output control dynamically adapts feedback length, supportive tone, and audio modality', () => {
  const outputCtrl = new OutputControlModule();

  // 1. Baseline state -> Full detailed text + audio
  const resBase = outputCtrl.generateAdaptiveResponse("Execute 15 driver swings focusing on hip turn.", "BASELINE");
  assert.equal(resBase.tone_framing, "DIRECT_PROFESSIONAL");
  assert.equal(resBase.instructional_complexity, "DETAILED");
  assert.equal(resBase.delivery_modality, "TEXT_AND_AUDIO");
  assert.equal(resBase.pacing_units, 1.0);

  // 2. Modulated state -> Shortened, supportive framing, audio primary
  const resMod = outputCtrl.generateAdaptiveResponse("Execute 15 driver swings focusing on hip turn.", "MODULATED");
  assert.equal(resMod.tone_framing, "SUPPORTIVE_CONCISE");
  assert.equal(resMod.instructional_complexity, "SIMPLIFIED");
  assert.equal(resMod.delivery_modality, "AUDIO_PRIMARY_SUMMARY");
  assert.ok(resMod.text.includes("[Supportive Pacing]"));
  assert.equal(resMod.pacing_units, 0.5);

  // 3. Decayed state -> Minimal, neutral objective, audio only
  const resDecay = outputCtrl.generateAdaptiveResponse("Execute 15 driver swings focusing on hip turn.", "DECAYED");
  assert.equal(resDecay.tone_framing, "NEUTRAL_OBJECTIVE");
  assert.equal(resDecay.instructional_complexity, "MINIMAL");
  assert.equal(resDecay.delivery_modality, "AUDIO_ONLY_SUMMARY");
  assert.ok(resDecay.text.includes("[Neutral Log]"));
});
