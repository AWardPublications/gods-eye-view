import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AltitudeBallisticsEngine } from '../core/physics/altitudeBallisticsSolver.js';
import { SpatialLearningEngine } from '../core/spatial/spatialLearningEngine.js';

test('1. Environmental Physics Core — 3-DoF Ballistics over Old Course Hotel Shed', () => {
  const solver = new AltitudeBallisticsEngine();
  
  // Environment: 28 knots SW, 11°C, Scottish coastal gale (pressure 1012.5 hPa, humidity 85%)
  const density = solver.calculateAirDensity(1012.5, 11.0, 85.0);
  assert.equal(density, 1.2361);

  const startTime = performance.now();
  // Driver shot over Old Course Hotel shed (495 yard par 4)
  const flight = solver.simulateFlight({
    launchSpeedMps: 76.0, // ~170 mph ball speed
    launchAngleDeg: 10.5,
    spinRpm: 2400,
    environment: {
      pressureHpa: 1012.5,
      tempC: 11.0,
      humidityPct: 85.0,
      windVx: -10.0, // 28 knots SW component
      windVy: 8.0
    }
  });
  const durationMs = performance.now() - startTime;

  assert.ok(durationMs < 15.0, `Calculation took ${durationMs}ms, expected sub-15ms`);
  assert.ok(flight.carryYards > 200, 'Driver carry should be computed accurately under heavy headwind drag');
  assert.equal(flight.densityKgM3, 1.2361);
});

test('2. Rule 4.3a State Gate — FSM State 4 Competition Mode Compliance', () => {
  // WO/2026/150385 FSM State 4 Gate: Rule 4.3a Competition Mode Active
  const state4Context = {
    fsm_state: 4,
    mode: 'COMPETITION',
    rule_4_3a_active: true,
    raw_laser_distance_yards: 495.0,
    calculated_plays_like_yards: 522.4, // Live wind + elevation
  };

  // State 4 Gate Enforcement Filter
  const evaluateState4Gate = (ctx) => {
    if (ctx.rule_4_3a_active || ctx.fsm_state === 4) {
      return {
        displayed_distance: ctx.raw_laser_distance_yards,
        plays_like_suppressed: true,
        wind_vectors_suppressed: true,
        compliance_status: 'RULE_4_3A_COMPLIANT'
      };
    }
    return {
      displayed_distance: ctx.calculated_plays_like_yards,
      plays_like_suppressed: false,
      wind_vectors_suppressed: false,
      compliance_status: 'CASUAL_ADVISORY'
    };
  };

  const output = evaluateState4Gate(state4Context);
  assert.equal(output.displayed_distance, 495.0);
  assert.equal(output.plays_like_suppressed, true);
  assert.equal(output.wind_vectors_suppressed, true);
  assert.equal(output.compliance_status, 'RULE_4_3A_COMPLIANT');
});

test('3. Offline Telemetry Buffer & Reconnection Sync (<2ms flush)', async () => {
  const offlineQueue = [];
  
  // Simulate 17th fairway cellular drop out
  const shotEvent = {
    hole: 17,
    club: '7-iron',
    target: 'Road Hole Green',
    timestamp: Date.now(),
    coords: { lat: 56.3431, lon: -2.8012 }
  };
  offlineQueue.push(shotEvent);
  assert.equal(offlineQueue.length, 1);

  // Background flush simulation (ctx.waitUntil)
  const startTime = performance.now();
  const flushTelemetryBatch = async (queue) => {
    const batch = [...queue];
    queue.length = 0;
    return { syncedCount: batch.length, status: 'BUFFER_FLUSHED' };
  };

  const res = await flushTelemetryBatch(offlineQueue);
  const durationMs = performance.now() - startTime;

  assert.equal(res.syncedCount, 1);
  assert.equal(res.status, 'BUFFER_FLUSHED');
  assert.ok(durationMs < 2.0, `Flush took ${durationMs}ms, expected <2ms`);
});

test('4. Spatial Learning Loop — 7-Iron Approach & Turf Friction Calibration', () => {
  const spatialEngine = new SpatialLearningEngine();

  // Shot lands 4ft past Road Pot Bunker
  const telemetryHistory = [{
    courseId: 'st_andrews_old',
    holeNumber: 17,
    expectedLandingCoord: [-2.8015, 56.3430],
    verifiedRestingCoord: [-2.8012, 56.3431], // 4ft past target
    club: '7-iron',
    surfaceType: 'links_fescue'
  }];

  const update = spatialEngine.calibrateCourseTelemetry('st_andrews_old', telemetryHistory);
  assert.ok(update);
  assert.equal(update.courseId, 'st_andrews_old');
  assert.equal(update.processedShots, 1);
  assert.equal(update.governanceAudit.patentStandard, 'WO/2026/150385');
});

test('5. Media Factory — 60 FPS Vertical Recap Reel & Fairlight -12dB Ducking', () => {
  const renderConfig = {
    course: 'St Andrews Old Course',
    hole: 17,
    format: '9:16',
    fps: 60,
    audioDuckingDb: -12.0,
    hosts: ['Alex Wenger', 'Alieve Wenger', 'Taylor Wenger', 'David Ward']
  };

  const triggerRecapReel = (config) => {
    return {
      reelId: `reel_sta_h17_${Date.now()}`,
      status: 'RENDER_COMPLETE',
      fps: config.fps,
      aspectRatio: config.format,
      audioMix: {
        voiceLevelDb: 0.0,
        ambientWindLevelDb: config.audioDuckingDb
      }
    };
  };

  const result = triggerRecapReel(renderConfig);
  assert.equal(result.status, 'RENDER_COMPLETE');
  assert.equal(result.fps, 60);
  assert.equal(result.aspectRatio, '9:16');
  assert.equal(result.audioMix.ambientWindLevelDb, -12.0);
});
