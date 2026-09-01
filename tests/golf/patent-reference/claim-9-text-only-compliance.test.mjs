import test from 'node:test';
import assert from 'node:assert/strict';
import { RuleBasedComplianceClassifier } from '../../../src/golf/article19/compliance-classifier.js';

test('Claim 9: Sensorless natural-language compliance classifier scoring task adherence vs. avoidance', () => {
  const classifier = new RuleBasedComplianceClassifier();

  // 1. High Adherence
  const res1 = classifier.classify("Completed all 20 reps of putting drill, strictly held line.");
  assert.equal(res1.classification, "HIGH_COMPLIANCE");
  assert.equal(res1.score, 1.0);
  assert.ok(res1.confidence >= 0.90);
  assert.equal(res1.failure_state, null);

  // 2. Avoidance / Non-Compliance
  const res2 = classifier.classify("I skipped the drill and gave up because it was too frustrating.");
  assert.equal(res2.classification, "NON_COMPLIANT_AVOIDANCE");
  assert.equal(res2.score, 0.2);
  assert.ok(res2.confidence >= 0.90);

  // 3. Ambiguous / Empty text -> Failover safety
  const res3 = classifier.classify("");
  assert.equal(res3.classification, "AMBIGUOUS");
  assert.equal(res3.failure_state, "NO_INPUT_TEXT");
});
