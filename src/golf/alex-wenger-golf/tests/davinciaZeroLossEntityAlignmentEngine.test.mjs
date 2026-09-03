import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DavinciaZeroLossEntityAlignmentEngine } from '../../../davincia/davinciaZeroLossEntityAlignmentEngine.mjs';

test('1. DavinciaZeroLossEntityAlignmentEngine enforces zero-loss entity separation and machine-readable abilities across BAIS, BAIT, BAIR, AWP', () => {
  const engine = new DavinciaZeroLossEntityAlignmentEngine();
  const res = engine.executeZeroLossEntityAlignment();

  assert.equal(res.status, 'ZERO_LOSS_ENTITY_SEPARATION_AND_GITHUB_ALIGNMENT_EXECUTED');
  assert.equal(res.totalEntitiesSeperated, 4);
  assert.equal(engine.legalEntities.length, 4);
  assert.ok(res.alignmentHash.length === 64);

  for (const ent of engine.legalEntities) {
    assert.ok(ent.abilities.can.length > 0);
    assert.ok(ent.abilities.cannot.length > 0);
    assert.ok(ent.canonicalGitHubRepo.startsWith('https://github.com/AWardPublications'));
  }
});
