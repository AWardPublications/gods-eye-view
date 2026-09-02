import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ingestWalesChampionshipCluster } from '../../../../scripts/ingest_wales_championship_cluster.js';
import { AltitudeBallisticsEngine } from '../core/physics/altitudeBallisticsSolver.js';

test('1. ingestWalesChampionshipCluster ingests, audits, and seeds Royal St David\'s and Royal Porthcawl', async () => {
  const result = await ingestWalesChampionshipCluster();
  assert.equal(result.status, 'WALES_CHAMPIONSHIP_CLUSTER_INGESTED');
  assert.equal(result.totalIngested, 2);
  assert.ok(result.ingestedResults.includes('royal_st_davids'));
  assert.ok(result.ingestedResults.includes('royal_porthcawl'));
});

test('2. Damp Harlech Morning air density matches 3-DoF thermodynamic solver expectations (rho ~ 1.238 kg/m^3)', () => {
  const solver = new AltitudeBallisticsEngine();
  // 1005 hPa, 10C, 85% humidity
  const density = solver.calculateAirDensity(1005.0, 10.0, 85.0);
  assert.ok(density >= 1.230 && density <= 1.245, `Density ${density} expected ~1.238 kg/m^3`);
});
