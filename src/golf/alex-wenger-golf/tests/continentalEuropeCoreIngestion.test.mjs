import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { CONTINENTAL_EUROPE_CORE_COHORTS, runContinentalEuropeCoreSweep } from '../../../../scripts/ingestContinentalEuropeCore.mjs';

test('1. CONTINENTAL_EUROPE_CORE_COHORTS validates all 10 national packages', () => {
  assert.equal(CONTINENTAL_EUROPE_CORE_COHORTS.length, 10);
  const totalTracks = CONTINENTAL_EUROPE_CORE_COHORTS.reduce((acc, c) => acc + c.estCourses, 0);
  assert.equal(totalTracks, 3900);
});

test('2. Germany (~1050), France (~800), Sweden (~480), Spain (~450) are primary flagship cohorts', () => {
  const de = CONTINENTAL_EUROPE_CORE_COHORTS.find(c => c.iso === 'DE');
  const fr = CONTINENTAL_EUROPE_CORE_COHORTS.find(c => c.iso === 'FR');
  const se = CONTINENTAL_EUROPE_CORE_COHORTS.find(c => c.iso === 'SE');
  const es = CONTINENTAL_EUROPE_CORE_COHORTS.find(c => c.iso === 'ES');

  assert.ok(de && de.estCourses === 1050);
  assert.ok(fr && fr.estCourses === 800);
  assert.ok(se && se.estCourses === 480);
  assert.ok(es && es.estCourses === 450);
  assert.equal(es.flagship, 'Real Club Valderrama (Sotogrande)');
});

test('3. runContinentalEuropeCoreSweep executes Phase 2 sweep reaching 7,845 cumulative tracks', async () => {
  const result = await runContinentalEuropeCoreSweep();

  assert.equal(result.summary.length, 10);
  assert.equal(result.totalTracks, 3900);
  assert.equal(result.cumulativeTotal, 7845);

  const deManifest = path.resolve('dist/spatial/continental_europe_cohort/de_national_cohort.json');
  assert.ok(fs.existsSync(deManifest), 'Germany national manifest should exist');
});
