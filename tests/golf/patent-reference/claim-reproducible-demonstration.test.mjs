import test from 'node:test';
import assert from 'node:assert/strict';
import { AlexWengerSubsystem } from '../../../src/golf/index.js';

test('Claim Reference Demonstration: Multi-session reproducible cycle with claim-to-code-to-evidence traceability', async () => {
  const subsystem = new AlexWengerSubsystem();
  const playerId = "urn:davincia:athlete:alex_wenger_pro";

  // Step 1 & 2: Session 1 (Intake, Baseline Establishment, High Compliance)
  const s1 = await subsystem.executeCoachingTurn("Completed all 20 reps of 3:1 tempo drill, feeling dialed.", {
    player_id: playerId,
    session_id: "demo-sess-1",
    mode: "TRAIN"
  });
  assert.equal(s1.status, "SUCCESS");
  assert.equal(s1.tone_state, "BASELINE");
  assert.equal(s1.compliance.score, 1.0);
  assert.ok(s1.evidence.evidence_hash.length > 0);

  // Step 3: Session 2 (Baseline Growth)
  const s2 = await subsystem.executeCoachingTurn("Finished putting routine, stroke felt solid.", {
    player_id: playerId,
    session_id: "demo-sess-2",
    mode: "TRAIN"
  });
  assert.equal(s2.status, "SUCCESS");
  assert.equal(s2.tone_state, "BASELINE");

  // Step 4 & 5: Session 3 (Divergence & Drift: Frustration & Missed Practice)
  const s3 = await subsystem.executeCoachingTurn("I skipped the drill and gave up because my driver was hooking wildly.", {
    player_id: playerId,
    session_id: "demo-sess-3",
    mode: "TRAIN"
  });
  assert.equal(s3.status, "SUCCESS");
  assert.equal(s3.compliance.classification, "NON_COMPLIANT_AVOIDANCE");
  assert.equal(s3.tone_state, "MODULATED"); // Claim 7 triggered
  assert.equal(s3.output.delivery_modality, "AUDIO_PRIMARY_SUMMARY"); // Claim 4

  // Step 6 & 7: Session 4 & 5 (Persistent Divergence -> Tone Decay)
  const s4 = await subsystem.executeCoachingTurn("Still frustrated, didn't finish the session.", {
    player_id: playerId,
    session_id: "demo-sess-4",
    mode: "TRAIN"
  });
  assert.equal(s4.tone_state, "MODULATED");

  const s5 = await subsystem.executeCoachingTurn("Terrible putting today, quit early again.", {
    player_id: playerId,
    session_id: "demo-sess-5",
    mode: "TRAIN"
  });
  assert.equal(s5.tone_state, "DECAYED"); // Claim 8 Decay enforced

  // Step 8 & 9: Session 6 (Normalization -> Tone Recovery)
  const s6 = await subsystem.executeCoachingTurn("Completed all reps today, tempo was great and rhythm is back.", {
    player_id: playerId,
    session_id: "demo-sess-6",
    mode: "TRAIN"
  });
  assert.equal(s6.tone_state, "RECOVERING"); // Claim 8 Recovery triggered

  // Step 10: Session 7 (Stable Recovery -> Baseline)
  const s7 = await subsystem.executeCoachingTurn("Ready to scout course strategy for tomorrow.", {
    player_id: playerId,
    session_id: "demo-sess-7",
    mode: "PREPARE"
  });
  assert.equal(s7.tone_state, "BASELINE");

  // Step 11: Longitudinal Replayability & Evidence Reconstruction
  const replayed = subsystem.memory.replaySession("demo-sess-3");
  assert.equal(replayed.reconstructed, true);
  assert.equal(replayed.applied_tone_state, "MODULATED");
  assert.equal(replayed.signal_vector.intent, "REQUEST_DRILL");
});
