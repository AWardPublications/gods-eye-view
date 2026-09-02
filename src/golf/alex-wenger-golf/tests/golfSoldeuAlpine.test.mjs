import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runGolfSoldeuAlpineSimulation } from '../../../../scripts/simulate_golf_soldeu_alpine.js';

test('1. runGolfSoldeuAlpineSimulation verifies 2,250m alpine thin-air drag reduction & +10.3% carry boost', async () => {
  const result = await runGolfSoldeuAlpineSimulation();

  assert.equal(result.altitudeMeters, 2250);
  assert.ok(result.airDensityKgM3 < 0.95, 'Air density at 2,250m should be below 0.95 kg/m^3');
  assert.equal(result.densityDropPct, 24.5);
  assert.ok(result.alpineCarryMeters > result.seaLevelCarryMeters, 'Alpine carry distance should exceed sea level carry');
  assert.equal(result.carryBoostPct, 10.3);
  assert.equal(result.playsLikeYards, 129);
});
