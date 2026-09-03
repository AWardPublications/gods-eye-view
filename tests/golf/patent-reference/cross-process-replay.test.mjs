import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { AlexWengerSubsystem } from '../../../src/golf/index.js';
import { replayEvidencePackage } from '../../../scripts/replay-session.mjs';

test('Remediation Verification: Cross-process persistence, cryptographic evidence ledger & replay', async () => {
  const testStorage = path.resolve(process.cwd(), 'data', 'test_athlete_sessions.jsonl');
  if (existsSync(testStorage)) unlinkSync(testStorage);

  // 1. Process A Execution
  let processA = new AlexWengerSubsystem({ storageFilePath: testStorage });
  const pId = "urn:davincia:athlete:test_player";

  await processA.executeCoachingTurn("Completed 20 reps of alignment drill.", {
    player_id: pId,
    session_id: "procA-sess-1",
    run_id: "test-run-1"
  });
  await processA.executeCoachingTurn("Dialed in my irons today, solid tempo.", {
    player_id: pId,
    session_id: "procA-sess-2",
    run_id: "test-run-2"
  });
  await processA.executeCoachingTurn("Great practice on greens, pure roll.", {
    player_id: pId,
    session_id: "procA-sess-3",
    run_id: "test-run-3"
  });

  // Verify file exists on disk
  assert.equal(existsSync(testStorage), true);

  // 2. Kill Process A
  processA = null;

  // 3. Process B Spawn & Verification of Longitudinal Baseline from Disk
  const processB = new AlexWengerSubsystem({ storageFilePath: testStorage });
  const loadedSessions = processB.memory.getSessionsByPlayer(pId);
  assert.equal(loadedSessions.length, 3);

  const baseline = processB.memory.calculatePlayerBaseline(pId);
  assert.ok(baseline.avg_sentiment > 0);
  assert.equal(baseline.total_sessions_analyzed, 3);

  // 4. Process B executes Session 4 (Divergence / Frustration)
  const res4 = await processB.executeCoachingTurn("I skipped the drill and gave up because I was hooking everything.", {
    player_id: pId,
    session_id: "procB-sess-4",
    run_id: "test-run-4"
  });
  assert.equal(res4.status, "SUCCESS");
  assert.equal(res4.tone_state, "MODULATED");

  // 5. Verify Individual Evidence Package on Disk
  const evidencePkgPath = path.resolve(process.cwd(), 'data', 'evidence-packages', 'test-run-4.json');
  assert.equal(existsSync(evidencePkgPath), true);

  // 6. Replay from Evidence Package Alone
  const replayedState = replayEvidencePackage(evidencePkgPath);
  assert.equal(replayedState.verified, true);
  assert.equal(replayedState.run_id, "test-run-4");
  assert.equal(replayedState.tone_state.current_state, "MODULATED");
  assert.equal(replayedState.output.delivery_modality, "AUDIO_PRIMARY_SUMMARY");
  assert.ok(replayedState.evidence_hash.startsWith("sha256-"));

  // Clean up test file
  if (existsSync(testStorage)) unlinkSync(testStorage);
  if (existsSync(evidencePkgPath)) unlinkSync(evidencePkgPath);
});
