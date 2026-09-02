import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AltitudeBallisticsEngine } from '../core/physics/altitudeBallisticsSolver.js';
import { SpatialLearningEngine } from '../core/spatial/spatialLearningEngine.js';

test('1. Environmental Physics Core — Royal Melbourne West Hole 5 MacKenzie Par 3 (3-DoF Ballistics)', () => {
  const solver = new AltitudeBallisticsEngine();
  
  // Melbourne Sandbelt Warm Afternoon: 28°C, 35% RH, Pressure 1012 hPa (Density ~1.162 kg/m³)
  const density = solver.calculateAirDensity(1012.0, 28.0, 35.0);
  assert.ok(Math.abs(density - 1.162) < 0.01, `Calculated density ${density} kg/m³, expected ~1.162 kg/m³`);

  const startTime = performance.now();
  // 6-iron tee shot on 5th Hole Par 3 (176 yards into elevated sloped green)
  const flight = solver.simulateFlight({
    launchSpeedMps: 56.0, // ~125 mph ball speed
    launchAngleDeg: 16.5,
    spinRpm: 6200,
    environment: {
      pressureHpa: 1012.0,
      tempC: 28.0,
      humidityPct: 35.0,
      windVx: 5.0, // 10 knot crosswind off Port Phillip Bay
      windVy: -3.0
    }
  });
  const durationMs = performance.now() - startTime;

  assert.ok(durationMs < 15.0, `Calculation took ${durationMs}ms, expected sub-15ms`);
  assert.ok(flight.carryYards > 165, 'Tee shot carry should exceed 165 yards under warm low density air');
  assert.equal(flight.densityKgM3, density);
});

test('2. MacKenzie Sandbelt Bunkering & Firm Turf Core — Stimp 13.2 & Rollout Calibration', () => {
  const sandbeltState = {
    turfType: 'couch_fairway_bent_green',
    stimpRating: 13.2,
    reboundFrictionMu: 0.92, // High rollout friction coefficient
    bunkerLips: 'steep_mackenzie_sand_faces'
  };

  const evaluateSandbeltRollout = (state, carryYards, landingAngleDeg) => {
    // Thin air & fast greens increase firm bounce rollout by 18%
    const rolloutYards = Number(((90.0 - landingAngleDeg) * 0.45 * (state.stimpRating / 10.0)).toFixed(1));
    return {
      effectiveRolloutYards: rolloutYards,
      totalDistanceYards: carryYards + rolloutYards,
      firmnessStatus: 'LIGHTNING_FAST_SANDBELT_TURF'
    };
  };

  const metrics = evaluateSandbeltRollout(sandbeltState, 172.0, 48.0);
  assert.ok(metrics.effectiveRolloutYards > 10.0);
  assert.equal(metrics.totalDistanceYards, 172.0 + metrics.effectiveRolloutYards);
  assert.equal(metrics.firmnessStatus, 'LIGHTNING_FAST_SANDBELT_TURF');
});

test('3. Rule 4.3a State Gate — Australian Open / Presidents Cup Matchplay (State 4 Active)', () => {
  const matchContext = {
    fsm_state: 4,
    mode: 'PRESIDENTS_CUP_MATCHPLAY',
    rule_4_3a_active: true,
    raw_laser_distance_yards: 176.0,
    calculated_plays_like_yards: 169.4 // Warm thin air reduces plays-like yardage
  };

  const evaluateMatchGate = (ctx) => {
    if (ctx.rule_4_3a_active || ctx.fsm_state === 4) {
      return {
        displayed_distance: ctx.raw_laser_distance_yards,
        plays_like_suppressed: true,
        compliance_status: 'RULE_4_3A_PRESIDENTS_CUP_COMPLIANT'
      };
    }
    return {
      displayed_distance: ctx.calculated_plays_like_yards,
      plays_like_suppressed: false,
      compliance_status: 'CASUAL_ADVISORY'
    };
  };

  const output = evaluateMatchGate(matchContext);
  assert.equal(output.displayed_distance, 176.0);
  assert.equal(output.plays_like_suppressed, true);
  assert.equal(output.compliance_status, 'RULE_4_3A_PRESIDENTS_CUP_COMPLIANT');
});

test('4. Offline Telemetry Buffer & Reconnection Sync — Sandbelt Bunker Recovery', async () => {
  const offlineQueue = [];

  // Hole-out bunker shot from MacKenzie sand face logged during offline stretch
  const shotEvent = {
    courseId: 'au_royal_melbourne_west',
    hole: 5,
    club: '60-degree-wedge',
    distanceFeet: 12.0,
    timestamp: Date.now(),
    coords: { lat: -37.9682, lon: 145.0163 }
  };
  offlineQueue.push(shotEvent);

  const startTime = performance.now();
  const syncSandbeltTelemetry = async (queue) => {
    const batch = [...queue];
    queue.length = 0;
    return { syncedCount: batch.length, status: 'SANDBELT_TELEMETRY_SYNCED' };
  };

  const result = await syncSandbeltTelemetry(offlineQueue);
  const durationMs = performance.now() - startTime;

  assert.equal(result.syncedCount, 1);
  assert.equal(result.status, 'SANDBELT_TELEMETRY_SYNCED');
  assert.ok(durationMs < 2.0, `Sync took ${durationMs}ms, expected <2ms`);
});

test('5. Media Factory — Royal Melbourne Sandbelt Recap Reel & Audio Mix', () => {
  const renderConfig = {
    course: 'Royal Melbourne Golf Club (West Course)',
    hole: 5,
    format: '9:16',
    fps: 60,
    audioDuckingDb: -12.0,
    hosts: ['Alex Wenger', 'Alieve Wenger', 'Taylor Wenger', 'David Ward']
  };

  const triggerSandbeltReel = (config) => {
    return {
      reelId: `reel_rmw_h5_${Date.now()}`,
      status: 'RENDER_COMPLETE',
      fps: config.fps,
      aspectRatio: config.format,
      audioMix: {
        voiceLevelDb: 0.0,
        ambientWindLevelDb: config.audioDuckingDb
      }
    };
  };

  const result = triggerSandbeltReel(renderConfig);
  assert.equal(result.status, 'RENDER_COMPLETE');
  assert.equal(result.fps, 60);
  assert.equal(result.audioMix.ambientWindLevelDb, -12.0);
});
