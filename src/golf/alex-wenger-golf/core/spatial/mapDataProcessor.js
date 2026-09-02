/**
 * Alex Wenger Master Golf Intelligence Ecosystem — Map Data Processor & GIS Ingestion Pipeline
 * Governance Standard: Patent WO/2026/150385
 *
 * Transforms raw GIS map sources (OpenStreetMap Overpass vectors, GeoJSON boundaries, 
 * Terrain-RGB DEM elevation tiles, and Satellite spectral imagery) into interactive 
 * 2D MapLibre vector layers and 3D God's Eye flight decks.
 *
 * @module alex-wenger-golf/core/spatial/mapDataProcessor
 */

import { decodeTerrainRGB, decodeTerrariumRGB, calculateNDVI } from './spatialIngestionEngine.js';

export class MapDataProcessor {
  constructor(options = {}) {
    this.supportedFormats = ['GEOJSON', 'OSM_OVERPASS', 'TERRAIN_RGB', 'TERRARIUM_DEM', 'SATELLITE_NDVI'];
  }

  /**
   * 1. Ingests and normalizes raw GeoJSON feature collection into structured course topography layers
   * @param {object} geojson - Raw GeoJSON FeatureCollection
   * @returns {object} Layer-separated map dataset
   */
  processGeoJSONCourseMap(geojson) {
    if (!geojson || !Array.isArray(geojson.features)) {
      throw new Error('Invalid GeoJSON input: FeatureCollection with features array required');
    }

    const layers = {
      tees: [],
      fairways: [],
      greens: [],
      bunkers: [],
      water_hazards: [],
      out_of_bounds: [],
      canopy_trees: [],
      metadata: {
        totalFeatures: geojson.features.length,
        processedAt: new Date().toISOString()
      }
    };

    for (const feature of geojson.features) {
      const subsystem = feature.properties?.subsystem || feature.properties?.golf || 'fairway';
      const hole = feature.properties?.hole || feature.properties?.ref || '1';

      const normalizedFeature = {
        type: 'Feature',
        properties: {
          ...feature.properties,
          subsystem,
          hole: String(hole),
          frictionMu: this.getDefaultFrictionForSubsystem(subsystem),
          stimpBase: subsystem === 'main_green' || subsystem === 'green' ? 12.0 : null
        },
        geometry: feature.geometry
      };

      switch (subsystem) {
        case 'tee':
          layers.tees.push(normalizedFeature);
          break;
        case 'main_green':
        case 'green':
          layers.greens.push(normalizedFeature);
          break;
        case 'fairway':
          layers.fairways.push(normalizedFeature);
          break;
        case 'bunker':
        case 'sand_bunker':
          layers.bunkers.push(normalizedFeature);
          break;
        case 'water_hazard':
        case 'water':
        case 'lateral_water':
          layers.water_hazards.push(normalizedFeature);
          break;
        case 'out_of_bounds':
        case 'ob':
          layers.out_of_bounds.push(normalizedFeature);
          break;
        case 'tree_canopy':
        case 'forest':
          layers.canopy_trees.push(normalizedFeature);
          break;
        default:
          layers.fairways.push(normalizedFeature);
      }
    }

    return layers;
  }

  /**
   * Helper: Provides default surface friction coefficient (mu) per subsystem
   */
  getDefaultFrictionForSubsystem(subsystem) {
    switch (subsystem) {
      case 'main_green':
      case 'green':
        return 0.85; // Fast green friction
      case 'fairway':
        return 0.72;
      case 'bunker':
      case 'sand_bunker':
        return 0.95; // Soft sand resistance
      case 'rough':
        return 0.60;
      default:
        return 0.70;
    }
  }

  /**
   * 2. Decodes elevation profile along a shot trajectory line from DEM RGB tiles
   * @param {Array<number[]>} pathCoords - Array of [lng, lat] coordinates along flight path
   * @param {Function} demPixelSampler - Function returning [r, g, b] for given [lng, lat]
   * @param {string} demEncoding - 'TERRAIN_RGB' | 'TERRARIUM'
   * @returns {Array<object>} Elevation profile array with distance and elevation z
   */
  decodeElevationProfile(pathCoords, demPixelSampler, demEncoding = 'TERRAIN_RGB') {
    if (!Array.isArray(pathCoords) || typeof demPixelSampler !== 'function') {
      return [];
    }

    return pathCoords.map((coord, index) => {
      const [r, g, b] = demPixelSampler(coord) || [0, 0, 0];
      const zMeters = demEncoding === 'TERRARIUM'
        ? decodeTerrariumRGB(r, g, b)
        : decodeTerrainRGB(r, g, b);

      return {
        step: index,
        coord,
        elevationMeters: Number(zMeters.toFixed(2))
      };
    });
  }

  /**
   * 3. Calculates Satellite Spectral Health (NDVI) and adjusts turf friction coefficient
   * @param {number} nirReflectance - Band 8 Near Infrared
   * @param {number} redReflectance - Band 4 Red
   * @returns {object} { ndvi, healthStatus, adjustedFrictionMu }
   */
  processTurfSpectralHealth(nirReflectance = 0.6, redReflectance = 0.1) {
    const ndvi = calculateNDVI(nirReflectance, redReflectance);

    let healthStatus = 'OPTIMAL_HEALTHY_TURF';
    let adjustedFrictionMu = 0.85; // Standard baseline

    if (ndvi > 0.6) {
      healthStatus = 'LUSH_DENSE_TURF';
      adjustedFrictionMu = 0.78; // Softer, more grabby damp turf
    } else if (ndvi < 0.3) {
      healthStatus = 'FIRM_DRY_TURF';
      adjustedFrictionMu = 0.92; // Dry, fast-rolling turf
    }

    return {
      ndvi,
      healthStatus,
      adjustedFrictionMu
    };
  }

  /**
   * 4. Assembles MapLibre GL JS vector source and layer configurations
   * @param {object} processedLayers - Output from processGeoJSONCourseMap
   * @returns {object} MapLibre GL layer specification array
   */
  buildMapLibreLayerSpec(processedLayers) {
    return [
      {
        id: 'fairway-fill',
        type: 'fill',
        source: 'course-geojson',
        filter: ['==', ['get', 'subsystem'], 'fairway'],
        paint: {
          'fill-color': '#2e7d32',
          'fill-opacity': 0.85
        }
      },
      {
        id: 'green-fill',
        type: 'fill',
        source: 'course-geojson',
        filter: ['in', ['get', 'subsystem'], ['literal', ['main_green', 'green']]],
        paint: {
          'fill-color': '#4caf50',
          'fill-opacity': 0.95
        }
      },
      {
        id: 'bunker-fill',
        type: 'fill',
        source: 'course-geojson',
        filter: ['in', ['get', 'subsystem'], ['literal', ['bunker', 'sand_bunker']]],
        paint: {
          'fill-color': '#fbc02d',
          'fill-opacity': 0.90
        }
      },
      {
        id: 'water-fill',
        type: 'fill',
        source: 'course-geojson',
        filter: ['in', ['get', 'subsystem'], ['literal', ['water_hazard', 'water']]],
        paint: {
          'fill-color': '#0288d1',
          'fill-opacity': 0.85
        }
      }
    ];
  }
}
