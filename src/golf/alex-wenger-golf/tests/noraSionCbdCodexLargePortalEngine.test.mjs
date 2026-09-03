import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NoraSionCbdCodexLargePortalEngine } from '../../../publishing/noraSionCbdCodexLargePortalEngine.mjs';

test('1. NoraSionCbdCodexLargePortalEngine generates 5x expanded interactive CBD Codex review portal for Nora in Desktop NORA SION folder', () => {
  const engine = new NoraSionCbdCodexLargePortalEngine();
  const res = engine.buildAndExportLargePortal();

  assert.equal(res.status, 'NORA_SION_LARGE_CBD_CODEX_PORTAL_BUILT_AND_EXPORTED');
  assert.equal(res.reviewer, 'Nora');
  assert.ok(res.portalFilePath.includes('NORA SION'));
  assert.ok(res.hash.length === 64);
});
