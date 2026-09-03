import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HighThroughputMerkleEpochBatcher } from '../workflows/highThroughputMerkleEpochBatcher.mjs';

test('102_Merkle_Batcher_1000_Payload_Compilation: Compiles 1,000 transactions into epoch root hash and verifies inclusion proof', () => {
  const batcher = new HighThroughputMerkleEpochBatcher();
  const payloads = Array.from({ length: 1000 }, (_, i) => ({
    user_id: `usr_${i}`,
    tenant_id: 'tenant_brehon_01',
    role: 'CLIENT',
    seq: i
  }));

  const res = batcher.executeEpochBatch(payloads);

  assert.equal(res.status, 'EPOCH_BATCH_COMMITTED_TO_POSTGRES_TRUTH_LAYER');
  assert.equal(res.batch_size, 1000);
  assert.ok(res.epoch_root_hash.length === 64);
  assert.equal(res.receipts[500].verified, true);
});

test('103_Merkle_Batcher_Adversarial_Defense_Tamper_Reject: Hard-rejects tampered leaf payload', () => {
  const batcher = new HighThroughputMerkleEpochBatcher();
  const payloads = Array.from({ length: 10 }, (_, i) => ({ user_id: `usr_${i}`, val: i }));
  const res = batcher.executeEpochBatch(payloads);

  // Attempt verification with tampered leaf hash
  const tamperedLeaf = 'f'.repeat(64);
  const proof = res.receipts[0].merkle_proof;
  const isValid = batcher.compiler.verifyProof(tamperedLeaf, proof, res.epoch_root_hash);

  assert.equal(isValid, false);
});
