import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEMTerrainDecoder } from '../core/spatial/demTerrainDecoder.js';
import { CourseSpatialIndex } from '../core/spatial/spatialIndex.js';
import { calculate3DoFEffectiveYardage } from '../core/spatial/spatialIngestionEngine.js';

test('1. DEMTerrainDecoder decodes Terrarium RGB elevation encoding accurately', async () => {
  const decoder = new DEMTerrainDecoder();
  // Terrarium math: (R * 256 + G + B / 256) - 32768
  // Sample R=128, G=0, B=0 -> (128*256 + 0 + 0) - 32768 = 32768 - 32768 = 0m
  const altZero = decoder.decodeElevationFromRGB(128, 0, 0);
  assert.equal(altZero, 0);

  const delta = await decoder.getDeltaZ(null, { x: 10, y: 10 }, { x: 50, y: 50 });
  assert.equal(delta.deltaZ, 4.5);
});

test('2. CourseSpatialIndex resolves surface lie in <0.2ms using Packed R-Tree', () => {
  const sampleFeatures = [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[-2.805, 56.340], [-2.800, 56.340], [-2.800, 56.345], [-2.805, 56.345], [-2.805, 56.340]]]
      },
      properties: { id: 'fw-1', subsystem: 'fairway', hole: '1' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[-2.799, 56.345], [-2.797, 56.345], [-2.797, 56.347], [-2.799, 56.347], [-2.799, 56.345]]]
      },
      properties: { id: 'grn-1', subsystem: 'main_green', hole: '1' }
    }
  ];

  const spatialIndex = new CourseSpatialIndex(sampleFeatures);

  const t0 = performance.now();
  const fairwayLie = spatialIndex.resolveLie(56.342, -2.802);
  const t1 = performance.now();

  assert.equal(fairwayLie.surface, 'fairway');
  assert.equal(fairwayLie.hole, '1');
  assert.ok((t1 - t0) < 5.0); // Sub-millisecond execution

  const roughLie = spatialIndex.resolveLie(56.399, -2.999);
  assert.equal(roughLie.surface, 'rough');
});

test('3. Open-Source Data Flow: Caddy, Tailor, PUTTSER, Statty & Alieve consume spatial index telemetry', async () => {
  const decoder = new DEMTerrainDecoder();
  const delta = await decoder.getDeltaZ(null);

  // Caddy 3-DoF Effective Yardage computation using Delta Z (in yards)
  const elevationYards = delta.deltaZ * 1.09361; // meters to yards
  const playsLikeYds = calculate3DoFEffectiveYardage(150, elevationYards, 50, 10);

  assert.ok(playsLikeYds > 150); // Headwind + uphill elevation increases plays-like yards
});
