import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateGovernanceDelta } from '../../../src/governance/delta.js';

test('Universal Governance Drift: New action added invalidates conformance', () => {
  const oldManifest = {
    system: "alex-wenger",
    version: "1.0.0",
    actions: ["ANALYSE", "COACH"],
    governance_profile: ["biometric"]
  };

  const newManifest = {
    system: "alex-wenger",
    version: "1.1.0",
    actions: ["ANALYSE", "COACH", "TRAIN_MODEL"], // Added action!
    governance_profile: ["biometric"]
  };

  const delta = calculateGovernanceDelta(oldManifest, newManifest);
  assert.equal(delta.status, "INVALIDATED");
  assert.equal(delta.driftDetected, true);
  assert.deepEqual(delta.delta.added_actions, ["TRAIN_MODEL"]);
  assert.deepEqual(delta.actionsRequired, ["HUMAN_REVIEW", "RETEST"]);
});
