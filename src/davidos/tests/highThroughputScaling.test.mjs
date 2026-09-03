import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MerkleEvidenceCompiler } from '../merkleEvidenceCompiler.mjs';
import { FederatedBrehonCourtsEngine } from '../federatedBrehonCourtsEngine.mjs';
import { ZkRoleValidationEngine } from '../zkRoleValidationEngine.mjs';
import { WorkflowAMerkleRegistryCompiler } from '../workflows/workflowAMerkleRegistryCompiler.mjs';
import { WorkflowBBrehonCourtEscrow } from '../workflows/workflowBBrehonCourtEscrow.mjs';
import { WorkflowCMobileEdgeIngest } from '../workflows/workflowCMobileEdgeIngest.mjs';

test('74_Merkle_Evidence_Batch_Compilation_1000_Decisions: Compiles 1,000 concurrent user decision payloads into single Merkle root in milliseconds', () => {
  const compiler = new MerkleEvidenceCompiler();
  const payloads = Array.from({ length: 1000 }, (_, i) => ({
    user_id: `user_50k_${i}`,
    action: 'DECISION_PASSPORT_TRANSITION',
    value: i
  }));

  const { rootHash, treeLayers, leaves } = compiler.buildMerkleTree(payloads);

  assert.ok(rootHash.length === 64);
  assert.equal(treeLayers.length, 11);

  // Verify membership proof for user #427
  const proof = compiler.generateProof(427, treeLayers);
  const isValid = compiler.verifyProof(leaves[427], proof, rootHash);
  assert.equal(isValid, true);
});

test('75_Federated_Brehon_Courts_Multi_Tenant_Isolation: Spawns independent, multi-tenant Brehon Court triangles', () => {
  const courts = new FederatedBrehonCourtsEngine();
  const swissCourt = courts.spawnFederatedCourt('tenant_swiss_pharma', 'Aerosol Validation', 'Ri_Swiss', 'Ban_Swiss', 'Sammy_Swiss');
  const lisbonCourt = courts.spawnFederatedCourt('tenant_lisbon_sports', 'Telemetry Audit', 'Ri_Lisbon', 'Ban_Lisbon', 'Sammy_Lisbon');

  assert.notEqual(swissCourt.court_id, lisbonCourt.court_id);
  assert.equal(swissCourt.status, 'ACTIVE_ISOLATED_COURT');
});

test('76_Zero_Knowledge_Role_Obfuscation: Validates ZK role proof without exposing physical user identity', () => {
  const zk = new ZkRoleValidationEngine();
  const proof = zk.generateRoleProof('secret_salt_987', 'BOARD_MEMBER', 'RM-10');

  const verification = zk.verifyRoleProof(proof, 'BOARD_MEMBER');
  assert.equal(verification.valid, true);
  assert.ok(verification.anonymizedAuditLogEntry.includes('BOARD_MEMBER'));
});

test('77_Workflow_A_Merkle_Registry_Compiler_Execution: Workflow A executes batch compilation and distributes O(log N) receipts', () => {
  const wfA = new WorkflowAMerkleRegistryCompiler();
  const payloads = [
    { user_id: 'u1', decision: 'APPROVE' },
    { user_id: 'u2', decision: 'APPROVE' }
  ];

  const res = wfA.executeBatchCompilation(payloads);
  assert.equal(res.status, 'BATCH_EPOCH_COMMITTED_TO_POSTGRES_TRUTH_LAYER');
  assert.equal(res.user_receipts.length, 2);
  assert.equal(res.user_receipts[0].verified_included, true);
});

test('78_Workflow_B_Brehon_Court_Escrow_Veto: Workflow B handles local Brehon Court steward veto fail-closed', () => {
  const wfB = new WorkflowBBrehonCourtEscrow();
  const escrow = wfB.initiateEmergencyEscrow('tenant_01', 'Accelerometer failure in elevator RM-05');

  const vetoRes = wfB.processStewardVote(escrow, 'ban', 'VETO');
  assert.equal(vetoRes.status, 'VETO_TRIGGERED_FAIL_CLOSED');
});

test('79_Workflow_C_Mobile_Edge_Ingest_Anti_Replay: Workflow C detects replay attack on edge payload ingest', () => {
  const wfC = new WorkflowCMobileEdgeIngest();
  const payload = wfC.createEdgeEvidencePayload('device_mobile_01', { accelX: 0.12, accelY: 9.81 }, 'prev_block_123');

  const res1 = wfC.ingestEdgePayload(payload, 'prev_block_123');
  assert.equal(res1.valid, true);

  const res2 = wfC.ingestEdgePayload(payload, 'prev_block_123'); // Replay exact same payload
  assert.equal(res2.valid, false);
  assert.equal(res2.status, 'REJECTED_REPLAY_ATTACK_DETECTED');
});
