import test from 'node:test';
import assert from 'node:assert/strict';
import { runDeterministicSimulation } from './simulation.js';

test('Seeded Simulation: 1. Cohort executes exactly 1000 runs', async () => {
  const result = await runDeterministicSimulation(12345, 1000);
  assert.equal(result.stats.total_processed, 1000);
});

test('Seeded Simulation: 2. Deterministic run is 100% reproducible', async () => {
  const run1 = await runDeterministicSimulation(999, 500);
  const run2 = await runDeterministicSimulation(999, 500);
  assert.deepEqual(run1.stats, run2.stats);
});

test('Seeded Simulation: 3. Unauthorized settlements count is exactly 0', async () => {
  const result = await runDeterministicSimulation(42, 1000);
  assert.equal(result.stats.unauthorized_settlements, 0);
});

test('Seeded Simulation: 4. Denied requests map to FAILED settlements', async () => {
  const result = await runDeterministicSimulation(12345, 1000);
  assert.equal(result.stats.denied_requests, result.stats.failed_transactions);
});

test('Seeded Simulation: 5. Allowed requests map to SETTLED transactions', async () => {
  const result = await runDeterministicSimulation(12345, 1000);
  assert.equal(result.stats.allowed_requests, result.stats.settled_transactions);
});

test('Seeded Simulation: 6. Failed settlements charge exactly 0.00', async () => {
  const result = await runDeterministicSimulation(12345, 100);
  const failedTxRecords = result.records.filter(r => r.settlement_status === "FAILED");
  for (const record of failedTxRecords) {
    assert.equal(record.charged_price, 0.00);
    assert.equal(record.provider_share, 0.00);
    assert.equal(record.governor_share, 0.00);
  }
});
