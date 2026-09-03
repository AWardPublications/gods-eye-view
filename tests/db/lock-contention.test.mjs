import test from 'node:test';
import assert from 'node:assert/strict';
import { PostgresGovernanceAdapter } from '../../src/db/postgres-adapter.js';
import { WasabiReplicationManager } from '../../src/db/wasabi-s3-replication.js';

test('Concurrency: 50 Concurrent Multi-Worker Race on Single Transaction Settlement', async () => {
  const adapter = new PostgresGovernanceAdapter({ forceMemory: true });

  const tx = await adapter.recordTransaction({
    transaction_id: 'tx-race-50-workers',
    amount_cents: 7500,
    asset_code: 'AWP-CRD-001-TCG'
  });

  const workerCount = 50;
  const settlementPromises = [];

  for (let i = 0; i < workerCount; i++) {
    settlementPromises.push(
      adapter.settleTransactionWithRetry('tx-race-50-workers')
        .then(res => ({ success: true, worker: i, res }))
        .catch(err => ({ success: false, worker: i, error: err.message }))
    );
  }

  const results = await Promise.all(settlementPromises);

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  // Invariant: Exactly ONE worker clears the settlement. All other 49 must fail gracefully.
  assert.equal(successCount, 1, "Exactly one worker must successfully settle the transaction.");
  assert.equal(failCount, 49, "49 competing workers must be rejected to prevent double-settlement.");

  const finalTx = await adapter.getTransaction('tx-race-50-workers');
  assert.equal(finalTx.status, 'SETTLED');
  assert.ok(finalTx.settled_at);
});

test('Concurrency: Dispute Freeze Preemption (FAIL-CLOSED)', async () => {
  const adapter = new PostgresGovernanceAdapter({ forceMemory: true });

  await adapter.recordTransaction({
    transaction_id: 'tx-contested-race',
    amount_cents: 9900,
    asset_code: 'AWP-PST-001-ART'
  });

  // Freeze the transaction
  await adapter.freezeTransaction('tx-contested-race', 'ANOMALY_DETECTED');

  // Attempting concurrent settlements must strictly fail closed
  await assert.rejects(
    async () => {
      await adapter.settleTransactionWithRetry('tx-contested-race');
    },
    /SETTLEMENT_BLOCKED/
  );
});

test('Infrastructure: Wasabi S3 WORM Object Lock Replication & Parity', async () => {
  const replicator = new WasabiReplicationManager();

  const mockEvidencePackages = [
    { evidence_urn: "urn:davincia:evidence:pkg-001", evidence_hash: "sha256-aaa" },
    { evidence_urn: "urn:davincia:evidence:pkg-002", evidence_hash: "sha256-bbb" },
    { evidence_urn: "urn:davincia:evidence:pkg-003", evidence_hash: "sha256-ccc" }
  ];

  for (const pkg of mockEvidencePackages) {
    const receipt = await replicator.replicatePackage(pkg);
    assert.equal(receipt.replicated, true);
    assert.equal(receipt.object_lock_legal_hold, "ON");
    assert.ok(receipt.worm_retention_until);
  }

  const parity = replicator.verifyParity(mockEvidencePackages);
  assert.equal(parity.parity_ok, true);
  assert.equal(parity.matched_remote, 3);
  assert.equal(parity.missing_remote, 0);
});
