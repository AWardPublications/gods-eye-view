import test from 'node:test';
import assert from 'node:assert/strict';
import { FailoverHandler, FAILOVER_CODES } from '../../../src/golf/governance/failover-catalogue.js';

test('Failover Catalogue: Verified handling of all 8 edge and error conditions', () => {
  const codes = Object.values(FAILOVER_CODES);
  assert.equal(codes.length, 8);

  for (const code of codes) {
    const event = FailoverHandler.handleFailover(code, { test: true }, { run_id: "test-run" });
    assert.equal(event.run_id, "test-run");
    assert.equal(event.failover_code, code);
    assert.ok(["BASELINE", "MODULATED", "NEUTRAL"].includes(event.safe_tone_state));
    assert.ok(typeof event.message === "string" && event.message.length > 0);
  }
});
