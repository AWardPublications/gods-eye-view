import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OPEN_SOURCE_PRO_COACHING_STACK, validateOpenSourceCoverage } from '../core/architecture/openSourceProCoachingStack.js';

test('1. OPEN_SOURCE_PRO_COACHING_STACK defines all 5 operational architectural stacks', () => {
  assert.ok(OPEN_SOURCE_PRO_COACHING_STACK.hardware !== undefined);
  assert.ok(OPEN_SOURCE_PRO_COACHING_STACK.software_biomechanics !== undefined);
  assert.ok(OPEN_SOURCE_PRO_COACHING_STACK.adapters !== undefined);
  assert.ok(OPEN_SOURCE_PRO_COACHING_STACK.database_storage !== undefined);
  assert.ok(OPEN_SOURCE_PRO_COACHING_STACK.back_office_logistics !== undefined);

  assert.equal(OPEN_SOURCE_PRO_COACHING_STACK.hardware.edge_node, 'Raspberry Pi 5');
  assert.equal(OPEN_SOURCE_PRO_COACHING_STACK.database_storage.immutable_audit_ledger, 'immudb (GAMP-5 & Consent Proofs)');
});

test('2. validateOpenSourceCoverage verifies core open-source components', () => {
  const check1 = validateOpenSourceCoverage('software_biomechanics', 'MediaPipe');
  assert.equal(check1.isCovered, true);

  const check2 = validateOpenSourceCoverage('database_storage', 'immudb');
  assert.equal(check2.isCovered, true);

  const check3 = validateOpenSourceCoverage('back_office_logistics', 'Documenso');
  assert.equal(check3.isCovered, true);
});
