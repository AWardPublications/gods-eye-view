import test from 'node:test';
import assert from 'node:assert/strict';
import { discoverSystem } from '../../src/onboarding/discover.js';
import { profileSystem } from '../../src/onboarding/profile.js';
import { proposePolicies } from '../../src/onboarding/propose.js';
import { runConformanceTests } from '../../src/onboarding/conformance.js';

test('Onboarding Layer: discovery checks properties', () => {
  const manifest = {
    system_id: "urn:davincia:system:fixture-os",
    name: "FixtureOS",
    version: "1.0.0",
    domain: "fixture-os",
    capabilities: ["SCHEDULE"],
    required_controls: ["secretary_signature"]
  };
  const discovery = discoverSystem(manifest);
  assert.equal(discovery.recognized, true);
  assert.equal(discovery.decision, "PROCEED");
});

test('Onboarding Layer: profiling extracts data classes', () => {
  const manifest = {
    system_id: "urn:davincia:system:fixture-os",
    name: "FixtureOS",
    version: "1.0.0",
    domain: "fixture-os",
    capabilities: ["SCHEDULE"],
    data_classes: ["community"],
    risk_profile: { declared: "LOW" },
    required_controls: ["secretary_signature"]
  };
  const profile = profileSystem(manifest);
  assert.equal(profile.domain, "FIXTURE-OS");
  assert.equal(profile.risk_class, "LOW");
});

test('Onboarding Layer: proposing matches domain policies', () => {
  const profile = {
    system_id: "urn:davincia:system:fixture-os",
    domain: "FIXTURE-OS",
    data_classes: ["community"],
    human_oversight_required: false
  };
  const proposed = proposePolicies(profile);
  assert.ok(proposed.proposed_policies.includes("DAVINCIA-SPORTS-005"));
});
