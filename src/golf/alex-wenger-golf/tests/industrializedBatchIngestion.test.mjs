import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { runUkIrelandPhase1Sweep } from '../../../../scripts/mass_global_ingestion_orchestrator.js';

test('1. runUkIrelandPhase1Sweep executes Phase 1 batch sweep across UK & Ireland', async () => {
  const result = await runUkIrelandPhase1Sweep();

  assert.equal(result.results.length, 5);
  assert.equal(result.totalTracks, 3100);
  assert.equal(result.cumulativeTotal, 3292);

  const engCohort = path.resolve('dist/spatial/uk_ireland_cohort/gb_eng_national_cohort.json');
  assert.ok(fs.existsSync(engCohort), 'England cohort JSON should exist');
});

test('2. Industrialized Batch Ingestion protocol adheres to Patent WO/2026/150385 Zero Stored Images', async () => {
  const sctCohortPath = path.resolve('dist/spatial/uk_ireland_cohort/gb_sct_national_cohort.json');
  const data = JSON.parse(fs.readFileSync(sctCohortPath, 'utf-8'));

  assert.equal(data.territory, 'GB_SCT');
  assert.equal(data.governance.patent, 'WO/2026/150385');
  assert.equal(data.governance.zero_stored_images, true);
  assert.equal(data.governance.edge_r2_bucket, 'golf-spatial-engine-assets');
});
