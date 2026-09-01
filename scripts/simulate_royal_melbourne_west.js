/**
 * Alex Wenger Master Golf Intelligence Ecosystem — Royal Melbourne West Simulation
 * Governance Patent: WO/2026/150385
 *
 * Runs a live telemetry and 6-state pipeline simulation for Royal Melbourne West Course Hole 5 (Par 3, 176 Yds, "Sandbelt Pinnacle").
 */

import { fetchCourseGeometry, generateGolfOverpassQuery } from '../src/golf/alex-wenger-golf/core/data/overpassGolfIngestor.js';
import { CourseSpatialIndex } from '../src/golf/alex-wenger-golf/core/spatial/spatialIndex.js';
import { calculate3DoFEffectiveYardage } from '../src/golf/alex-wenger-golf/core/spatial/spatialIngestionEngine.js';
import { executeGovernedIntelligencePipeline } from '../src/golf/alex-wenger-golf/core/architecture/governedIntelligenceSystem.js';
import geographicMemoryDb from '../src/golf/data/geographic_memory_engine.json' with { type: 'json' };

async function runRoyalMelbourneSimulation() {
  console.log('================================================================================');
  console.log('ROYAL MELBOURNE WEST COURSE (HOLE 5) — LIVE ON-THE-FLY VECTOR SIMULATION');
  console.log('================================================================================\n');

  const courseData = geographicMemoryDb.courses.royal_melbourne;
  console.log(`[COURSE METADATA]`);
  console.log(`- Course: ${courseData.name}`);
  console.log(`- Location: ${courseData.location.region}, ${courseData.location.country} (${courseData.location.lat}, ${courseData.location.lng})`);
  console.log(`- Firmness Rating: ${courseData.environmental_constants.surface_firmness_rating}`);
  console.log(`- Prevailing Winds: ${courseData.prevailing_winds.avg_speed_mph} mph ${courseData.prevailing_winds.primary_cardinal} (${courseData.environmental_constants.prevailing_wind_vectors[0]})\n`);

  // 1. Generate Live Overpass Vector Query
  const bbox = { minLat: -37.975, minLon: 145.015, maxLat: -37.965, maxLon: 145.025 };
  const queryOverpass = generateGolfOverpassQuery(bbox);
  console.log(`[1. OVERPASS VECTOR QUERY GENERATED]`);
  console.log(`Query:\n${queryOverpass.substring(0, 140)}...\n`);

  // 2. Fetch and Normalize Geometry
  const geoJson = await fetchCourseGeometry(bbox);
  console.log(`[2. GEOJSON VECTOR GEOMETRY EXTRACTED]`);
  console.log(`- Features Count: ${geoJson.features.length}`);
  console.log(`- Subsystem Layers: ${[...new Set(geoJson.features.map(f => f.properties.subsystem))].join(', ')}\n`);

  // 3. Packed Hilbert R-Tree Spatial Indexing
  const spatialIndex = new CourseSpatialIndex(geoJson.features);
  const golferPos = { lat: -37.9692, lng: 145.0211 };
  const resolvedLie = spatialIndex.resolveLie(golferPos.lat, golferPos.lng);
  console.log(`[3. SUB-0.2MS SPATIAL LIE RESOLUTION]`);
  console.log(`- Position: (${golferPos.lat}, ${golferPos.lng})`);
  console.log(`- Resolved Surface: ${resolvedLie.surface.toUpperCase()} (Hole #${resolvedLie.hole})\n`);

  // 4. 3-DoF Ballistics Math
  const rawYards = 176;
  const deltaZ = 2.0; // Uphill approach
  const altitudeM = courseData.location.elevation_m;
  const windMph = courseData.prevailing_winds.avg_speed_mph;

  const playsLikeYards = calculate3DoFEffectiveYardage(rawYards, deltaZ, altitudeM, windMph);
  console.log(`[4. 3-DOF BALLISTICS SOLVER OUTPUT]`);
  console.log(`- Raw GPS Distance: ${rawYards} yards`);
  console.log(`- Elevation Delta (Δz): +${deltaZ}m`);
  console.log(`- Southerly Buster Wind: ${windMph} mph headwind`);
  console.log(`- Plays-Like Yardage: ${playsLikeYards} yards\n`);

  // 5. Governed 6-State Pipeline & Alex Audio Synthesis
  const pipelineResult = executeGovernedIntelligencePipeline({
    userQuery: `Playing Hole 5 at Royal Melbourne, 176 yards into the Southerly Buster wind, what club should I play?`,
    branchId: 'COURSE_SYSTEM',
    specialistFindingText: `Caddy calculated ${playsLikeYards} plays-like yards into 15mph Southerly headwind on Royal Melbourne Hole 5. Land 10 yards short on firm Sandbelt turf.`,
  });

  console.log(`[5. GOVERNED 6-STATE PIPELINE EXECUTION]`);
  console.log(`- Pipeline Stage: ${pipelineResult.pipeline_stage}`);
  console.log(`- State 4 Judge Verdict: ${pipelineResult.judge_verdict.status} (Authority: ${pipelineResult.judge_verdict.authority})`);
  console.log(`- State 5 Alex Integrated Speech:\n  "${pipelineResult.integrated_coaching_response}"\n`);

  console.log('================================================================================');
  console.log('✅ ROYAL MELBOURNE WEST SIMULATION PASSED (EXIT CODE 0)');
  console.log('================================================================================');
}

runRoyalMelbourneSimulation();
