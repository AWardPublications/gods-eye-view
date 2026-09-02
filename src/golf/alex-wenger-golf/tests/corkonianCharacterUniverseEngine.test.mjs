import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CorkonianCharacterUniverseEngine } from '../../../corkonian/corkonianCharacterUniverseEngine.mjs';

test('1. CorkonianCharacterUniverseEngine verifies 7 canonical characters and EU tour destinations', () => {
  const engine = new CorkonianCharacterUniverseEngine();
  const res = engine.generateEuTourManifest();

  assert.equal(res.totalRegistryCharacters, 7, 'Must contain all 7 canonical characters');
  assert.equal(res.totalTourDestinations, 5, 'Must schedule 5 EU tour destinations');

  const corkSwam = engine.canonicalRegistry.find(c => c.name === 'CorkSwam');
  assert.equal(corkSwam.domain, 'Water');
  assert.ok(corkSwam.symbols.includes('Lifebuoy'));

  const frFinbarr = engine.canonicalRegistry.find(c => c.name === 'Fr Finbarr');
  assert.equal(frFinbarr.domain, 'Memory');
  assert.ok(frFinbarr.symbols.includes('Lanterns'));
});
