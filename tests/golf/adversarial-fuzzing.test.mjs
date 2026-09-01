import test from 'node:test';
import assert from 'node:assert/strict';
import { AlexWengerSubsystem } from '../../src/golf/index.js';
import { PersistentMemoryArchitecture } from '../../src/golf/governance/session-memory-schema.js';

test('Adversarial Fuzzing: Unicode, Emoji Storms, and Buffer Boundary Stress', async () => {
  const subsystem = new AlexWengerSubsystem();

  const fuzzInputs = [
    "⛳🔥🌪️💣🏌️‍♂️🚨⚠️".repeat(100),
    "'\"; DROP TABLE audit_events; SELECT * FROM credentials; --",
    "\u0000\u0001\u0002\u0003\u0004\u001f\u007f",
    "A".repeat(5000), // 5KB single token string
    "{\"injected_json\": true, \"override_auth\": \"ALLOW\"}"
  ];

  for (const input of fuzzInputs) {
    const result = await subsystem.executeCoachingTurn(input, {
      mode: "PRACTICE",
      athlete_consent: true,
      human_supervision: true,
      career_opt_in: true
    });

    assert.ok(result.status === 'SUCCESS' || result.status === 'BLOCKED');
    assert.ok(result.evidence?.evidence_hash.startsWith('sha256-'));
    assert.ok(typeof result.output.text === 'string');
  }
});

test('Adversarial Fuzzing: Corrupted Baseline Vector & Mathematical Edge Defense', () => {
  const memory = new PersistentMemoryArchitecture();
  const testAthlete = "urn:davincia:athlete:fuzz_target";

  // Feed pathological metrics
  memory.appendSessionRecord({ player_id: testAthlete, sentiment_state: NaN, compliance_score: Infinity });
  memory.appendSessionRecord({ player_id: testAthlete, sentiment_state: -Infinity, compliance_score: -5.0 });

  const baseline = memory.calculatePlayerBaseline(testAthlete, 5);

  // Baseline calculation must never return NaN or crash
  assert.ok(!isNaN(baseline.avg_sentiment));
  assert.ok(!isNaN(baseline.avg_compliance));
  assert.ok(baseline.avg_compliance >= 0.0 && baseline.avg_compliance <= 1.0);
});

test('Adversarial Fuzzing: Malicious Path Traversal Tenant Sanitization', () => {
  const memory = new PersistentMemoryArchitecture();
  const maliciousTenant = "urn:davincia:athlete:../../../../etc/shadow";

  // System should safely record without crashing or performing filesystem escape
  const record = memory.appendSessionRecord({
    player_id: maliciousTenant,
    sentiment_state: 0.5,
    compliance_score: 0.8
  });

  assert.ok(record.session_id);
  assert.ok(record.iso_time);
  const sessions = memory.getSessionsByPlayer(maliciousTenant);
  assert.equal(sessions.length, 1);
});
