import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TriUniverseCharacterCouncilEngine } from '../../../davidos/triUniverseCharacterCouncilEngine.mjs';

test('1. TriUniverseCharacterCouncilEngine compiles Council Chambers for Cork Gollum, Puttsler & Statsy, and Animal Swarms', () => {
  const engine = new TriUniverseCharacterCouncilEngine();
  const res = engine.compileCouncilAssembly();

  assert.equal(res.status, 'SOVEREIGN_COUNCIL_CHAMBERS_ASSEMBLED');
  assert.equal(res.swarmsCount, 3);
  assert.equal(res.swarmsAndChambers[0].characters[0].name, 'Cork Gollum');
  assert.equal(res.swarmsAndChambers[1].characters[0].name, 'Puttsler');
  assert.equal(res.swarmsAndChambers[1].characters[1].name, 'Statsy');
  assert.equal(res.swarmsAndChambers[2].characters[0].name, 'Lion Executive Chair');
  assert.ok(res.assemblyHash.length === 64);
});
