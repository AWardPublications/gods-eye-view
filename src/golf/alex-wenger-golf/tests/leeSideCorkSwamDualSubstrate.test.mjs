import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LeeSideCorkSwamDualSubstrate } from '../../../corkonian/leeSideCorkSwamDualSubstrate.mjs';

test('1. LeeSideCorkSwamDualSubstrate verifies Alpine-Atlantic dual tutelary figures and symbols', () => {
  const engine = new LeeSideCorkSwamDualSubstrate();
  const res = engine.generateDualAxisSynthesis();

  assert.equal(res.alpineAxis.name, 'Lee Side');
  assert.equal(res.alpineAxis.axis, 'Alpine / Terrestrial (Sion, Valais)');
  assert.ok(res.alpineAxis.symbols.includes('River Lee'));

  assert.equal(res.atlanticAxis.name, 'CorkSwam');
  assert.equal(res.atlanticAxis.axis, 'Atlantic / Estuary (Cork / Cobh)');
  assert.ok(res.atlanticAxis.symbols.includes('Lifebuoy'));

  assert.equal(res.status, 'VERIFIED_DUAL_ARCHETYPE_AXIS');
});
