import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TriUniverseGovernedArchitectureEngine } from '../../../davidos/triUniverseGovernedArchitectureEngine.mjs';

test('1. TriUniverseGovernedArchitectureEngine compiles 3 governed universes (Embassy, Golf Resort, Island) and cross-universe agents', () => {
  const engine = new TriUniverseGovernedArchitectureEngine();
  const res = engine.compileTriUniverseArchitecture();

  assert.equal(res.status, 'TRI_UNIVERSE_GOVERNED_ARCHITECTURE_RATIFIED');
  assert.equal(res.universesCount, 3);
  assert.equal(res.crossUniverseAgentsCount, 2);
  assert.equal(res.universes[0].id, 'DAVID_OS');
  assert.equal(res.universes[1].id, 'ALEX_WENGER_OS');
  assert.equal(res.universes[2].id, 'CORKONIAN_OS');
  assert.ok(res.hash.length === 64);
});
