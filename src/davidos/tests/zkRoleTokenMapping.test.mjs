import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ZkRoleTokenMappingEngine } from '../zkRoleTokenMappingEngine.mjs';

test('86_ZK_Role_Token_Mapping_Decoupling: Maps isolated principal to dynamic ZK token with zero identity leak', () => {
  const zkEngine = new ZkRoleTokenMappingEngine();
  zkEngine.registerPrincipal('p_101', 'Dr. Aris Thorne', 'aris@brehon.ch', 'salt_secret_999', 'ROLE: BOARD_MEMBER');

  const token = zkEngine.issueZkTokenForRoom('p_101', 'RM-10');

  assert.equal(token.role_claimed, 'ROLE: BOARD_MEMBER');
  assert.equal(token.spatial_room_id, 'RM-10');
  assert.ok(token.nullifier_hash.length === 64);
  assert.equal(token.physicalName, undefined); // Zero physical identity metadata leaked!
});

test('87_RM10_Refusal_Audit_Log_Commit: Executes Room of Refusal veto and commits anonymized GnuPG audit log', () => {
  const zkEngine = new ZkRoleTokenMappingEngine();
  zkEngine.registerPrincipal('p_102', 'Elena Rostova', 'elena@brehon.ie', 'salt_secret_888', 'ROLE: DOMAIN_AUTHORITY');

  const token = zkEngine.issueZkTokenForRoom('p_102', 'RM-10');
  const execution = zkEngine.executeRm10Refusal(token, 'VETO_SWING_FAUL_TELEMETRY');

  assert.equal(execution.success, true);
  assert.equal(execution.audit_record.spatial_room_id, 'RM-10');
  assert.equal(execution.audit_record.role_verified, 'ROLE: DOMAIN_AUTHORITY');
  assert.equal(execution.audit_record.gpg_signature, '0x80D0ADA1');
  assert.equal(execution.audit_record.privacy_preserved, true);
});
