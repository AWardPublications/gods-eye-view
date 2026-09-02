import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runMarcoSimoneHole14Simulation } from '../../../../scripts/simulate_marco_simone_14.js';

test('1. runMarcoSimoneHole14Simulation executes 3-DoF trajectory & wind-shielding diagnostic', async () => {
  const result = await runMarcoSimoneHole14Simulation();

  assert.equal(result.rawDistYards, 385);
  assert.equal(result.deltaZ, 14.2);
  assert.ok(result.airDensity < 1.20, 'Warm Italian air density should be below 1.20 kg/m^3');
  assert.equal(result.shieldingFactor, 0.45);
  assert.equal(result.playsLikeYards, 401);
  assert.equal(result.targetWindow.pin_distance, 401);
});
