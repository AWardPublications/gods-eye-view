import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { SOUTH_AMERICA_COHORTS, runSouthAmericaIngestion } from '../../../../scripts/ingestSouthAmerica.mjs';

test('1. SOUTH_AMERICA_COHORTS validates all 10 South American national packages', () => {
  assert.equal(SOUTH_AMERICA_COHORTS.length, 10);
  const totalTracks = SOUTH_AMERICA_COHORTS.reduce((acc, c) => acc + c.estCourses, 0);
  assert.equal(totalTracks, 653);
});

test('2. Argentina (~340 tracks) and Brazil (~125 tracks) are primary flagship cohorts', () => {
  const arg = SOUTH_AMERICA_COHORTS.find(c => c.iso === 'AR');
  const bra = SOUTH_AMERICA_COHORTS.find(c => c.iso === 'BR');

  assert.ok(arg && arg.estCourses === 340);
  assert.ok(bra && bra.estCourses === 125);
  assert.equal(arg.flagship, 'Jockey Club (Buenos Aires - Red Course)');
});

test('3. Ballistics Verification at La Paz Golf Club (BO — z = 3,300m) confirms thin-air density reduction', async () => {
  const result = await runSouthAmericaIngestion();

  assert.equal(result.summary.length, 10);
  assert.equal(result.totalTracks, 653);
  assert.ok(result.laPazDensity < 0.90, 'La Paz air density should be below 0.90 kg/m^3');
  assert.ok(result.densityDropPct > 25.0, 'Air density drop should exceed 25%');

  const boManifest = path.resolve('dist/spatial/south_america_cohort/bo_national_cohort.json');
  assert.ok(fs.existsSync(boManifest), 'Bolivia national manifest should exist');
});
