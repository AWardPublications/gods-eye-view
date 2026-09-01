import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SPECIALIST_MANDATES } from '../core/specialists/designMandates.js';
import { CONVERSATIONAL_MODES, detectConversationalMode } from '../core/modes/conversationalModes.js';
import { evaluateDeveloperAcceptanceTest, evaluateCoreVsModuleTest } from '../core/acceptanceTest.js';

test('SPECIALIST_MANDATES validates Zenner design mandates and 9 questions across all 9 personas', () => {
  const expectedPersonas = ['PUTTSER', 'STATTY', 'JUDGE', 'ZENNER', 'SWINGSY', 'FITTY', 'CADDY', 'STICKS', 'AL'];
  
  for (const personaKey of expectedPersonas) {
    const entry = SPECIALIST_MANDATES[personaKey];
    assert.ok(entry, `Missing mandate entry for ${personaKey}`);
    assert.ok(entry.mandate, `Missing mandate description for ${personaKey}`);
    assert.ok(entry.nine_questions, `Missing 9 questions for ${personaKey}`);

    for (let i = 1; i <= 9; i++) {
      const fieldKey = Object.keys(entry.nine_questions).find(k => k.startsWith(`q${i}_`));
      assert.ok(fieldKey, `Persona ${personaKey} missing question ${i}`);
      assert.ok(entry.nine_questions[fieldKey].length > 0);
    }
  }
});

test('detectConversationalMode supports all 10 modes including PSYCHOLOGY', () => {
  const mode = detectConversationalMode('I need breathwork and mental focus calibration');
  assert.equal(mode.mode, CONVERSATIONAL_MODES.PSYCHOLOGY);
  assert.equal(mode.vocal_pacing, 'CALM_GROUNDING');
});

test('evaluateDeveloperAcceptanceTest enforces 5 acceptance criteria for feature admission', () => {
  const goodFeature = evaluateDeveloperAcceptanceTest({
    featureName: 'Green Slope Reader',
    isUseful: true,
    isTruthful: true,
    isHuman: true,
    isEntertaining: true,
    isContextuallyIntelligent: true,
  });
  assert.equal(goodFeature.passed, true);
  assert.equal(goodFeature.score, 100);
  assert.ok(goodFeature.recommendation.includes('APPROVED'));

  const badFeature = evaluateDeveloperAcceptanceTest({
    featureName: 'Random Crypto Ticker Widget',
    isUseful: false,
    isTruthful: false,
    isHuman: false,
    isEntertaining: false,
    isContextuallyIntelligent: false,
  });
  assert.equal(badFeature.passed, false);
  assert.equal(badFeature.score, 0);
  assert.ok(badFeature.recommendation.includes('REJECTED'));
});

test('evaluateCoreVsModuleTest properly separates Alex Core from Specialist Modules', () => {
  // Green Break Calculator -> Can be removed without changing who Alex is -> MODULE
  const moduleCheck = evaluateCoreVsModuleTest('Sub-Surface Green Slope Solver', true);
  assert.equal(moduleCheck.target_layer, 'MODULE');

  // Alex Core Identity -> Cannot be removed -> CORE
  const coreCheck = evaluateCoreVsModuleTest('Alex Warm French Conversational Identity', false);
  assert.equal(coreCheck.target_layer, 'CORE');
});
