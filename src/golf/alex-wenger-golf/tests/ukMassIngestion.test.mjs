import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ingestUkChampionshipCluster, UK_CHAMPIONSHIP_COURSES } from '../../../../scripts/ingest_uk_championship_cluster.js';

test('1. UK_CHAMPIONSHIP_COURSES registry contains 16 championship & Open Rota tracks', () => {
  assert.equal(UK_CHAMPIONSHIP_COURSES.length, 16);
  const stAndrews = UK_CHAMPIONSHIP_COURSES.find(c => c.id === 'st_andrews_old');
  assert.ok(stAndrews);
  assert.equal(stAndrews.par, 72);
});

test('2. ingestUkChampionshipCluster ingests, audits, and seeds R2 bundles & Geohash partitions', async () => {
  const result = await ingestUkChampionshipCluster();
  assert.equal(result.status, 'UK_CHAMPIONSHIP_CLUSTER_INGESTED');
  assert.equal(result.totalIngested, 16);
  assert.ok(result.ingestedResults.includes('royal_troon'));
});
