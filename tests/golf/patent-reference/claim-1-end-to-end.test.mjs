import test from 'node:test';
import assert from 'node:assert/strict';
import { AlexWengerSubsystem } from '../../../src/golf/index.js';

test('Claim 1: Sensorless natural-language multi-session coaching end-to-end execution', async () => {
  const subsystem = new AlexWengerSubsystem();

  // Multi-session dialogue sequence with pure natural-language
  const res1 = await subsystem.executeCoachingTurn("Completed all 10 reps of tempo drill, feeling great.", { mode: "TRAIN" });
  assert.equal(res1.status, "SUCCESS");
  assert.equal(res1.signals.intent, "REQUEST_DRILL");
  assert.equal(res1.compliance.classification, "HIGH_COMPLIANCE");
  assert.equal(res1.tone_state, "BASELINE");
  assert.ok(res1.evidence.evidence_hash.startsWith("sha256-"));

  // Verify memory persistence across turns
  const res2 = await subsystem.executeCoachingTurn("Ready to scout the greens and wind on hole 4.", { mode: "PREPARE" });
  assert.equal(res2.status, "SUCCESS");
  assert.equal(res2.signals.intent, "TACTICAL_PLANNING");
  assert.equal(res2.mode, "PREPARE");

  const sessions = subsystem.memory.getSessionsByPlayer("urn:davincia:athlete:alex_wenger");
  assert.equal(sessions.length, 2);
  assert.equal(sessions[0].signal_vector.intent, "REQUEST_DRILL");
  assert.equal(sessions[1].signal_vector.intent, "TACTICAL_PLANNING");
});
