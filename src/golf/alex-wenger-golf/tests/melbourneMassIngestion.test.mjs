import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ingestMelbourneSandbeltCluster, MELBOURNE_SANDBELT_TARGETS } from '../../../../scripts/ingest_melbourne_sandbelt_cluster.js';

test('1. MELBOURNE_SANDBELT_TARGETS contains Royal Melbourne West and Kingston Heath', () => {
  assert.equal(MELBOURNE_SANDBELT_TARGETS.length, 2);
  const rmWest = MELBOURNE_SANDBELT_TARGETS.find(t => t.course_id === 'au_royal_melbourne_west');
  assert.ok(rmWest);
  assert.equal(rmWest.stimp_rating, 13.2);
});

test('2. ingestMelbourneSandbeltCluster ingests, audits, and seeds R2 bundles & Geohash partitions', async () => {
  const result = await ingestMelbourneSandbeltCluster();
  assert.equal(result.status, 'MELBOURNE_SANDBELT_CLUSTER_INGESTED');
  assert.equal(result.totalIngested, 2);
  assert.ok(result.ingestedResults.includes('au_royal_melbourne_west'));
  assert.ok(result.ingestedResults.includes('au_kingston_heath'));
});
