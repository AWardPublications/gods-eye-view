import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BATCH_20, runNext20Ingestion } from '../../../../scripts/batchIngestNext20.mjs';

test('1. BATCH_20 contains 20 micro-nations and high-density island territories', () => {
  assert.equal(BATCH_20.length, 20);

  const totalEstCourses = BATCH_20.reduce((acc, t) => acc + t.estCourses, 0);
  assert.equal(totalEstCourses, 81);
});

test('2. Extreme Topography & Tactical Venues present in Next 20 Ingestion Cohort', () => {
  const containsAndorra = BATCH_20.some(t => t.iso === 'AD' && t.estCourses === 1);
  const containsIceland = BATCH_20.some(t => t.iso === 'IS' && t.estCourses === 18);
  const containsQatar = BATCH_20.some(t => t.iso === 'QA' && t.estCourses === 2);
  const containsMauritius = BATCH_20.some(t => t.iso === 'MU' && t.estCourses === 10);

  assert.ok(containsAndorra, 'Andorra 2,250m altitude track should exist');
  assert.ok(containsIceland, 'Iceland 18 midnight sun tracks should exist');
  assert.ok(containsQatar, 'Qatar desert track should exist');
  assert.ok(containsMauritius, 'Mauritius links tracks should exist');
});

test('3. runNext20Ingestion stages all 20 R2 cohort manifests to dist/spatial/tier2_cohorts', async () => {
  const result = await runNext20Ingestion();
  assert.equal(result.summary.length, 20);
  assert.equal(result.totalTracks, 81);
});
