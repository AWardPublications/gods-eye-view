import test from 'node:test';
import assert from 'node:assert/strict';
import { PolicyRouter, OPERATING_MODES } from '../../../src/golf/governance/policy-router.js';

test('Claim 2: Deterministic decision logic and supervisory processing pathway routing', async () => {
  const router = new PolicyRouter();

  // 1. Default Pathway in TRAIN mode
  const trainDefault = await router.routeRequest("TRAIN", { athlete_consent: true }, { is_persistent: false });
  assert.equal(trainDefault.status, "AUTHORIZED");
  assert.equal(trainDefault.pathway_type, "DEFAULT");
  assert.equal(trainDefault.pathway, "MECHANICAL_PRACTICE");

  // 2. Supervisory Pathway in TRAIN mode upon persistent deviation
  const trainSupervisory = await router.routeRequest("TRAIN", { athlete_consent: true }, { is_persistent: true });
  assert.equal(trainSupervisory.status, "AUTHORIZED");
  assert.equal(trainSupervisory.pathway_type, "SUPERVISORY");
  assert.equal(trainSupervisory.pathway, "MECHANICAL_PRACTICE_SUPERVISORY");

  // 3. COMPETE Mode without Human Coach -> Blocked
  const competeBlocked = await router.routeRequest("COMPETE", { athlete_consent: true, human_supervision: false }, {});
  assert.equal(competeBlocked.status, "DENIED");
  assert.equal(competeBlocked.reason_code, "SUPERVISION_REQUIRED");

  // 4. COMPETE Mode with Human Coach -> Routes to Supervisory live pacing
  const competeSupervised = await router.routeRequest("COMPETE", { athlete_consent: true, human_supervision: true }, {});
  assert.equal(competeSupervised.status, "AUTHORIZED");
  assert.equal(competeSupervised.pathway_type, "SUPERVISORY");
});
