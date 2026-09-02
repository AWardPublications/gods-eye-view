import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SixVerbsControlEngine } from '../../../governance/sixVerbsControlEngine.mjs';

test('1. SixVerbsControlEngine programmatically asserts Paused -> Reviewed -> Challenged -> Corrected -> Approved -> Reconstructed circuit breaker sequence', () => {
  const engine = new SixVerbsControlEngine();
  const res = engine.assertFullCircuitBreakerSequence('ASSET-TEST-001', 'David Ward');

  assert.equal(res.status, 'GATE_CERTIFIED_PUBLISH_PERMITTED');
  assert.equal(res.auditTrailCount, 6);
  assert.deepEqual(res.statesExecuted, ['PAUSED', 'REVIEWED', 'CHALLENGED', 'CORRECTED', 'APPROVED', 'RECONSTRUCTED']);
  assert.ok(res.masterRunHash.length === 64);
});
