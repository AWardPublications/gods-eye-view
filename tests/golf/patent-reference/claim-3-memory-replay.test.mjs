import test from 'node:test';
import assert from 'node:assert/strict';
import { PersistentMemoryArchitecture } from '../../../src/golf/governance/session-memory-schema.js';

test('Claim 3: Structured longitudinal memory schema, baseline calculation, and deterministic replay', () => {
  const memory = new PersistentMemoryArchitecture();

  // Record 3 structured sessions
  memory.appendSessionRecord({
    player_id: "urn:davincia:athlete:player1",
    session_id: "sess-001",
    signal_vector: { intent: "REQUEST_DRILL" },
    sentiment_state: 0.8,
    compliance_score: 1.0
  });

  memory.appendSessionRecord({
    player_id: "urn:davincia:athlete:player1",
    session_id: "sess-002",
    signal_vector: { intent: "TACTICAL_PLANNING" },
    sentiment_state: 0.4,
    compliance_score: 0.8
  });

  // Calculate baseline
  const baseline = memory.calculatePlayerBaseline("urn:davincia:athlete:player1");
  assert.equal(baseline.total_sessions_analyzed, 2);
  assert.equal(baseline.avg_sentiment, 0.6);
  assert.equal(baseline.avg_compliance, 0.9);

  // Exact session replay
  const replay = memory.replaySession("sess-001");
  assert.equal(replay.reconstructed, true);
  assert.equal(replay.session_id, "sess-001");
  assert.equal(replay.signal_vector.intent, "REQUEST_DRILL");
});
