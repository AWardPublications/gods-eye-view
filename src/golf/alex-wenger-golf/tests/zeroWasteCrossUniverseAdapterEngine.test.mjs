import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ZeroWasteCrossUniverseAdapterEngine } from '../../../davidos/zeroWasteCrossUniverseAdapterEngine.mjs';

test('1. ZeroWasteCrossUniverseAdapterEngine adapts workflows across universes with GPG signing', () => {
  const engine = new ZeroWasteCrossUniverseAdapterEngine();
  const res = engine.adaptWorkflow('ALEX_WENGER_OS', 'CORKONIAN_OS', 'BALLISTICS_SIMULATION_TO_HYDROLOGY', { density: 1.225 });

  assert.equal(res.status, 'WORKFLOW_ADAPTED_ZERO_WASTE');
  assert.equal(res.sourceUniverse, 'ALEX_WENGER_OS');
  assert.equal(res.targetUniverse, 'CORKONIAN_OS');
  assert.equal(res.messenger, 'Adrian Daly (L1 Messenger)');
  assert.equal(res.gpgKey, '0x80D0ADA1');
  assert.ok(res.gpgSignature.length === 64);
});
