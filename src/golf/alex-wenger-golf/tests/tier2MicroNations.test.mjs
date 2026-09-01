import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TIER2_MICRONATION_CLUSTERS, executeTier2BatchIngestion } from '../core/data/tier2MicroNationIngestor.js';

test('1. TIER2_MICRONATION_CLUSTERS includes all 7 micro-nation territories', () => {
  assert.equal(TIER2_MICRONATION_CLUSTERS.length, 7);
  const territories = TIER2_MICRONATION_CLUSTERS.map(c => c.territory);
  assert.ok(territories.includes('Singapore'));
  assert.ok(territories.includes('Bermuda'));
  assert.ok(territories.includes('Luxembourg'));
  assert.ok(territories.includes('UAE'));
});

test('2. executeTier2BatchIngestion ingests micro-nation tracks and builds spatial index', async () => {
  const batchRes = await executeTier2BatchIngestion();
  assert.equal(batchRes.status, 'TIER2_COMPLETE');
  assert.equal(batchRes.totalTerritories, 7);
  assert.ok(batchRes.totalTracksIngested >= 50);
  assert.equal(batchRes.results.length, 7);
});
