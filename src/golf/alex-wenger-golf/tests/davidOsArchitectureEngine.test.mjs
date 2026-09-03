import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DavidOsArchitectureEngine } from '../../../davidos/davidOsArchitectureEngine.mjs';

test('1. DavidOsArchitectureEngine audits DAVID_OS substrate, layers, and registered entities', () => {
  const engine = new DavidOsArchitectureEngine();
  const res = engine.generateAuditReport();

  assert.equal(res.status, 'DAVID_OS_SUBSTRATE_AUDITED_AND_VERIFIED');
  assert.equal(res.osName, 'DAVID_OS');
  assert.equal(res.layersCount, 4);
  assert.ok(res.activeEntitiesCount >= 6);
  assert.ok(res.hash.length === 64);
});
