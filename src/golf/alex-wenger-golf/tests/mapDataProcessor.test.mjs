import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MapDataProcessor } from '../core/spatial/mapDataProcessor.js';

test('1. processGeoJSONCourseMap categorizes GIS features into structured layers', () => {
  const processor = new MapDataProcessor();
  const mockGeoJSON = {
    type: 'FeatureCollection',
    features: [
      { properties: { subsystem: 'tee', hole: '1' }, geometry: { type: 'Polygon', coordinates: [] } },
      { properties: { subsystem: 'fairway', hole: '1' }, geometry: { type: 'Polygon', coordinates: [] } },
      { properties: { subsystem: 'main_green', hole: '1' }, geometry: { type: 'Polygon', coordinates: [] } },
      { properties: { subsystem: 'sand_bunker', hole: '1' }, geometry: { type: 'Polygon', coordinates: [] } },
      { properties: { subsystem: 'water_hazard', hole: '1' }, geometry: { type: 'Polygon', coordinates: [] } }
    ]
  };

  const layers = processor.processGeoJSONCourseMap(mockGeoJSON);
  assert.equal(layers.tees.length, 1);
  assert.equal(layers.fairways.length, 1);
  assert.equal(layers.greens.length, 1);
  assert.equal(layers.bunkers.length, 1);
  assert.equal(layers.water_hazards.length, 1);
  assert.equal(layers.greens[0].properties.frictionMu, 0.85);
});

test('2. decodeElevationProfile decodes DEM elevation values along flight path', () => {
  const processor = new MapDataProcessor();
  const pathCoords = [[-2.8025, 56.3438], [-2.8020, 56.3440], [-2.8015, 56.3442]];

  // Mock DEM pixel sampler returning [r, g, b] Mapbox Terrain-RGB values
  const mockDemSampler = (coord) => {
    if (coord[0] === -2.8025) return [1, 137, 100]; // ~69.2m elevation
    if (coord[0] === -2.8020) return [1, 138, 50];  // ~95.3m elevation
    return [1, 139, 10]; // ~120.9m elevation
  };

  const profile = processor.decodeElevationProfile(pathCoords, mockDemSampler, 'TERRAIN_RGB');
  assert.equal(profile.length, 3);
  assert.ok(profile[0].elevationMeters > 0);
  assert.ok(profile[2].elevationMeters > profile[0].elevationMeters);
});

test('3. processTurfSpectralHealth converts satellite NDVI reflectance into surface friction modifiers', () => {
  const processor = new MapDataProcessor();

  // Test dry firm turf (NDVI < 0.3)
  const dryTurf = processor.processTurfSpectralHealth(0.4, 0.3); // NDVI ~0.14
  assert.equal(dryTurf.healthStatus, 'FIRM_DRY_TURF');
  assert.equal(dryTurf.adjustedFrictionMu, 0.92);

  // Test lush damp turf (NDVI > 0.6)
  const lushTurf = processor.processTurfSpectralHealth(0.8, 0.1); // NDVI ~0.77
  assert.equal(lushTurf.healthStatus, 'LUSH_DENSE_TURF');
  assert.equal(lushTurf.adjustedFrictionMu, 0.78);
});

test('4. buildMapLibreLayerSpec generates MapLibre GL layer configuration', () => {
  const processor = new MapDataProcessor();
  const layerSpec = processor.buildMapLibreLayerSpec({});
  assert.ok(Array.isArray(layerSpec));
  assert.equal(layerSpec.length, 4);
  assert.ok(layerSpec.some(l => l.id === 'fairway-fill'));
  assert.ok(layerSpec.some(l => l.id === 'green-fill'));
});
