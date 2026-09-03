import test from 'node:test';
import assert from 'node:assert/strict';
import { AlexWengerSubsystem } from '../../../src/golf/index.js';

test('DNSL Governance Integration: Article 19 engine is subordinate to DaVinciA+ policy verdicts', async () => {
  const subsystem = new AlexWengerSubsystem();

  // 1. Consent Revocation -> Blocked by DNSL Spine
  const unconsented = await subsystem.executeCoachingTurn("Give me mechanical advice.", {
    mode: "TRAIN",
    athlete_consent: false
  });
  assert.equal(unconsented.status, "DENIED");
  assert.equal(unconsented.routing_result.reason_code, "UNKNOWN_OBJECT_STATE");

  // 2. Unsupervised Live Competition -> Blocked by DNSL Spine
  const unsupervisedCompete = await subsystem.executeCoachingTurn("Provide live club recommendation on fairway.", {
    mode: "COMPETE",
    athlete_consent: true,
    human_supervision: false
  });
  assert.equal(unsupervisedCompete.status, "DENIED");
  assert.equal(unsupervisedCompete.routing_result.reason_code, "SUPERVISION_REQUIRED");

  // 3. Supervised Competition -> Authorized by DNSL Spine and executed by Article 19 engine
  const supervisedCompete = await subsystem.executeCoachingTurn("Target is front bunker edge, 155m out.", {
    mode: "COMPETE",
    athlete_consent: true,
    human_supervision: true
  });
  assert.equal(supervisedCompete.status, "SUCCESS");
  assert.equal(supervisedCompete.routing.pathway_type, "SUPERVISORY");
});
