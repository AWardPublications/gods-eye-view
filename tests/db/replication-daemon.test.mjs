import test from 'node:test';
import assert from 'node:assert/strict';
import { ReplicationDaemon } from '../../scripts/replicate-ledger-daemon.mjs';

test('Replication Daemon: Continuous Sync Cycle & Idempotent Tracking', async () => {
  const daemon = new ReplicationDaemon();

  // First sync cycle
  const cycle1 = await daemon.runSyncCycle();
  assert.equal(cycle1.status, "SYNC_COMPLETE");
  assert.ok(cycle1.total_tracked > 50, `Expected >50 packages synced, got ${cycle1.total_tracked}`);
  assert.equal(cycle1.synced_this_cycle, cycle1.total_tracked);

  // Second sync cycle (idempotent: no new packages)
  const cycle2 = await daemon.runSyncCycle();
  assert.equal(cycle2.status, "SYNC_COMPLETE");
  assert.equal(cycle2.synced_this_cycle, 0);
  assert.equal(cycle2.total_tracked, cycle1.total_tracked);
});
