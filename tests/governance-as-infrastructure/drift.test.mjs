import test from 'node:test';
import assert from 'node:assert/strict';
import { requalifySystem } from '../../src/onboarding/requalify.js';

test('Onboarding Layer: drift invalidation triggers suspension', () => {
  const oldManifest = {
    system_id: "urn:davincia:system:fixture-os",
    name: "FixtureOS",
    version: "1.0.0",
    domain: "fixture-os",
    capabilities: ["SCHEDULE"],
    actions: ["SCHEDULE"],
    required_controls: ["secretary_signature"]
  };

  const newManifest = {
    ...oldManifest,
    version: "1.1.0",
    actions: ["SCHEDULE", "TRAIN_MODEL"] // Added action
  };

  const requal = requalifySystem(oldManifest, newManifest);
  assert.equal(requal.status, "SUSPENDED");
  assert.deepEqual(requal.delta.added_actions, ["TRAIN_MODEL"]);
  assert.ok(requal.actionsRequired.includes("RETEST"));
});
