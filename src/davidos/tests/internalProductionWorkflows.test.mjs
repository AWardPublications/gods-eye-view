import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HitlDocumentPromotionPipeline } from '../workflows/hitlDocumentPromotionPipeline.mjs';
import { HighThroughputMerkleEpochBatcher } from '../workflows/highThroughputMerkleEpochBatcher.mjs';
import { DecoupledEmergencyVetoEscrow } from '../workflows/decoupledEmergencyVetoEscrow.mjs';

test('95_HITL_Document_Promotion_Pipeline: Promotes document through Gates 1-4 producing WebAuthn FIDO2 attestation & hitl_decision.json', () => {
  const pipeline = new HitlDocumentPromotionPipeline();
  const res = pipeline.executePipeline({
    title: 'AWP Imprint Catalog 2026',
    confidence_score: 0.94
  });

  assert.equal(res.status, 'DOCUMENT_PROMOTED_SUCCESSFULLY');
  assert.equal(res.gates.length, 4);
  assert.ok(res.artifacts.hitl_decision_json.fido2_attestation.length === 64);
  assert.equal(res.artifacts.hitl_decision_json.gpg_signature, '0x80D0ADA1');
});

test('96_High_Throughput_Merkle_Epoch_Batcher: Batches 1,000 user payloads and issues individual O(log N) receipts', () => {
  const batcher = new HighThroughputMerkleEpochBatcher();
  const payloads = Array.from({ length: 1000 }, (_, i) => ({ user_id: `u_${i}`, value: i }));

  const res = batcher.executeEpochBatch(payloads);

  assert.equal(res.status, 'EPOCH_BATCH_COMMITTED_TO_POSTGRES_TRUTH_LAYER');
  assert.equal(res.batch_size, 1000);
  assert.equal(res.receipts.length, 1000);
  assert.equal(res.receipts[0].verified, true);
});

test('97_Decoupled_Emergency_Veto_Escrow: Triggers emergency veto, drops velocity to zero, and logs ZK proof to RM-10', () => {
  const escrow = new DecoupledEmergencyVetoEscrow();
  const state = escrow.triggerEmergencyVeto('tenant_swiss_01', 'Telemetry anomaly in RM-05');

  assert.equal(state.actuator_velocity, 0.0);
  assert.equal(state.status, 'ZONE_LOCKED_PHYSICAL_DIGITAL_DECOUPLED');

  const vetoRes = escrow.castStewardVetoWithZkProof(state, 'ban', 'secret_salt_123', 'ROLE: BOARD_MEMBER');

  assert.equal(vetoRes.status, 'FAIL_CLOSED_VETO_SUCCESSFUL');
  assert.equal(vetoRes.rm10AuditEntry.spatial_room_id, 'RM-10');
  assert.equal(vetoRes.rm10AuditEntry.privacy_preserved, true);
});
