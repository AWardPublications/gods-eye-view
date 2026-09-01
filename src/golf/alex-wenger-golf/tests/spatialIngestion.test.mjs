import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateNDVI,
  decodeTerrainRGB,
  decodeTerrariumRGB,
  calculateReboundVector,
  computeCameraKeyframes,
  calculateWHSHandicap,
  calculateStrokesGained,
  calculate3DoFEffectiveYardage
} from '../core/spatial/spatialIngestionEngine.js';

test('calculateNDVI calculates correct vegetation index', () => {
  const ndvi = calculateNDVI(0.6, 0.2); // NIR 0.6, Red 0.2
  assert.equal(ndvi, 0.5); // (0.6 - 0.2)/(0.6 + 0.2) = 0.4 / 0.8 = 0.5
});

test('decodeTerrainRGB decodes Mapbox Terrain-RGB pixel to meters', () => {
  const z = decodeTerrainRGB(10, 20, 30);
  assert.equal(typeof z, 'number');
  assert.ok(z > -10000);
});

test('decodeTerrariumRGB decodes Mapzen Terrarium pixel to meters', () => {
  const z = decodeTerrariumRGB(128, 0, 0);
  assert.equal(z, 0); // (128 * 256 + 0 + 0) - 32768 = 32768 - 32768 = 0
});

test('calculateReboundVector computes specular reflection vector', () => {
  const rebound = calculateReboundVector([10, -5, 0], [0, 1, 0]);
  assert.deepEqual(rebound, [10, 5, 0]);
});

test('computeCameraKeyframes generates 101 Bézier camera keyframe steps', () => {
  const tee = { lng: -2.803, lat: 56.343, alt: 6 };
  const landing = { lng: -2.801, lat: 56.344, alt: 6 };
  const green = { lng: -2.800, lat: 56.345, alt: 6 };

  const keyframes = computeCameraKeyframes(tee, landing, green, 40.0);
  assert.equal(keyframes.length, 101);
  assert.equal(keyframes[0].timestamp, 0.0);
  assert.equal(keyframes[100].timestamp, 15.0);
  assert.equal(keyframes[0].cameraPosition[2], 46.0); // 6 + 40
});

test('calculateWHSHandicap computes CH and PH according to WHS specs', () => {
  // HI 10.0, Slope 136, CR 75.2, Par 72
  const { courseHandicap, playingHandicap } = calculateWHSHandicap(10.0, 136, 75.2, 72, 0.95);
  // CH = 10.0 * (136/113) + (75.2 - 72) = 12.035 + 3.2 = 15.2
  assert.equal(courseHandicap, 15.2);
  // PH = Round(15.2 * 0.95) = Round(14.44) = 14
  assert.equal(playingHandicap, 14);
});

test('calculateStrokesGained computes SG against baseline expectation', () => {
  // Tee shot expectation: 4.10, End position expectation: 2.80
  // SG = 4.10 - 2.80 - 1 = +0.30
  const sg = calculateStrokesGained(4.10, 2.80);
  assert.equal(sg, 0.30);
});

test('calculate3DoFEffectiveYardage computes plays-like yards with elevation, altitude, and wind', () => {
  // 150 yards, +10 yards uphill, 660m altitude (Puerta de Hierro), 15mph headwind
  const playsLike = calculate3DoFEffectiveYardage(150, 10, 660, 15);
  assert.ok(playsLike > 165);
});
