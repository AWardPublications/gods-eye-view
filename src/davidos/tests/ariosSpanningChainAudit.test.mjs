import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AriosSpanningChainAuditEngine } from '../ariosSpanningChainAuditEngine.mjs';

test('121_ARIOS_Spanning_Chain_Audit_Perfect_Integrity: Audits intact hash chain with 0.00% link rot', () => {
  const engine = new AriosSpanningChainAuditEngine();
  const rows = [
    { entry_id: 1, prev_hash: '0000000000000000000000000000000000000000000000000000000000000000', entry_hash: 'a'.repeat(64), code_version: 'v1.0.0', policy_version: 'v1' },
    { entry_id: 2, prev_hash: 'a'.repeat(64), entry_hash: 'b'.repeat(64), code_version: 'v1.0.0', policy_version: 'v1' }
  ];

  const res = engine.auditSpanningChain(rows);

  assert.equal(res.status, 'SPANNING_CHAIN_PERFECT_INTEGRITY');
  assert.equal(res.broken_rows_count, 0);
  assert.equal(res.link_rot_percentage, 0.0);
});

test('122_ARIOS_Spanning_Chain_Audit_Detects_Broken_Parent_Hash: Flags broken parent hash chain link rot down to exact row', () => {
  const engine = new AriosSpanningChainAuditEngine();
  const rows = [
    { entry_id: 1, prev_hash: '0000000000000000000000000000000000000000000000000000000000000000', entry_hash: 'a'.repeat(64), code_version: 'v1.0.0', policy_version: 'v1' },
    { entry_id: 2, prev_hash: 'f'.repeat(64), entry_hash: 'b'.repeat(64), code_version: 'v1.0.0', policy_version: 'v1' } // BROKEN HASH!
  ];

  const res = engine.auditSpanningChain(rows);

  assert.equal(res.status, 'LINK_ROT_DETECTED');
  assert.equal(res.broken_rows_count, 1);
  assert.equal(res.link_rot_percentage, 50.0);
  assert.equal(res.diagnostics[1].status, 'LINK_ROT_BROKEN_PARENT_HASH');
});
