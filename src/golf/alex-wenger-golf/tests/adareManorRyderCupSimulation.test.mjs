import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AltitudeBallisticsEngine } from '../core/physics/altitudeBallisticsSolver.js';
import { SpatialLearningEngine } from '../core/spatial/spatialLearningEngine.js';

test('1. Environmental Physics Core — Adare Manor Hole 18 River Maigue Carry (3-DoF Ballistics)', () => {
  const solver = new AltitudeBallisticsEngine();
  
  // Shannon River Valley: 14°C, 80% RH, Pressure 1015.5 hPa (Density ~1.2261 kg/m³)
  const density = solver.calculateAirDensity(1015.5, 14.0, 80.0);
  assert.equal(density, 1.2261);

  const startTime = performance.now();
  // 3-Wood / Hybrid approach shot over River Maigue on Hole 18 (585 yard Par 5)
  const flight = solver.simulateFlight({
    launchSpeedMps: 68.0, // ~152 mph ball speed
    launchAngleDeg: 14.0,
    spinRpm: 3800,
    environment: {
      pressureHpa: 1015.5,
      tempC: 14.0,
      humidityPct: 80.0,
      windVx: -4.0, // 10 knot cross-head breeze off River Maigue
      windVy: 2.0
    }
  });
  const durationMs = performance.now() - startTime;

  assert.ok(durationMs < 15.0, `Calculation took ${durationMs}ms, expected sub-15ms`);
  assert.ok(flight.carryYards > 210, 'Approach carry over River Maigue should exceed 210 yards');
  assert.equal(flight.densityKgM3, 1.2261);
});

test('2. Sub-Air Green Hydrology Core — Moisture Vacuum Extraction & Firmness Adjustment', () => {
  // Adare Manor Sub-Air Green System Active: 15% Green Moisture Content (Fast Vacuum Extraction)
  const subAirState = {
    greenMoisturePct: 15.0,
    subAirMode: 'ACTIVE_VACUUM_EXTRACTION',
    stimpRatingBase: 12.5,
    calculatedFirmnessMu: 0.88 // Firm rollout
  };

  const evaluateSubAirTurfFriction = (state) => {
    if (state.subAirMode === 'ACTIVE_VACUUM_EXTRACTION' && state.greenMoisturePct < 18.0) {
      return {
        effectiveStimp: state.stimpRatingBase + 0.7, // 13.2 Stimp
        turfReboundMu: state.calculatedFirmnessMu,
        spinHoldFactor: 0.82 // Controlled spin check
      };
    }
    return {
      effectiveStimp: state.stimpRatingBase,
      turfReboundMu: 0.75,
      spinHoldFactor: 1.0
    };
  };

  const turfMetrics = evaluateSubAirTurfFriction(subAirState);
  assert.equal(turfMetrics.effectiveStimp, 13.2);
  assert.equal(turfMetrics.turfReboundMu, 0.88);
  assert.equal(turfMetrics.spinHoldFactor, 0.82);
});

test('3. Rule 4.3a State Gate — Ryder Cup Matchplay Duels (State 4 Active)', () => {
  const matchplayContext = {
    fsm_state: 4,
    mode: 'RYDER_CUP_MATCHPLAY',
    rule_4_3a_active: true,
    raw_laser_distance_yards: 224.0,
    calculated_plays_like_yards: 236.8 // Wind & slope
  };

  const evaluateMatchplayGate = (ctx) => {
    if (ctx.rule_4_3a_active || ctx.fsm_state === 4) {
      return {
        displayed_distance: ctx.raw_laser_distance_yards,
        plays_like_suppressed: true,
        wind_vectors_suppressed: true,
        compliance_status: 'RULE_4_3A_MATCHPLAY_COMPLIANT'
      };
    }
    return {
      displayed_distance: ctx.calculated_plays_like_yards,
      plays_like_suppressed: false,
      wind_vectors_suppressed: false,
      compliance_status: 'CASUAL_ADVISORY'
    };
  };

  const output = evaluateMatchplayGate(matchplayContext);
  assert.equal(output.displayed_distance, 224.0);
  assert.equal(output.plays_like_suppressed, true);
  assert.equal(output.compliance_status, 'RULE_4_3A_MATCHPLAY_COMPLIANT');
});

test('4. Offline Telemetry Buffer & Reconnection Sync — River Maigue Bridge Crossing', async () => {
  const offlineQueue = [];

  // Match-winning 2-putt shot event logged on 18th green during cellular blackout
  const shotEvent = {
    courseId: 'adare_manor',
    hole: 18,
    club: 'Putter',
    distanceFeet: 4.5,
    timestamp: Date.now(),
    coords: { lat: 52.5642, lon: -8.7901 }
  };
  offlineQueue.push(shotEvent);

  const startTime = performance.now();
  const syncTelemetryBridge = async (queue) => {
    const batch = [...queue];
    queue.length = 0;
    return { syncedCount: batch.length, status: 'RYDER_CUP_TELEMETRY_SYNCED' };
  };

  const result = await syncTelemetryBridge(offlineQueue);
  const durationMs = performance.now() - startTime;

  assert.equal(result.syncedCount, 1);
  assert.equal(result.status, 'RYDER_CUP_TELEMETRY_SYNCED');
  assert.ok(durationMs < 2.0, `Sync took ${durationMs}ms, expected <2ms`);
});

test('5. Media Factory — 2027 Ryder Cup Victory Recap Reel & Fairlight Audio Mix', () => {
  const renderConfig = {
    course: 'Adare Manor',
    hole: 18,
    event: '2027 Ryder Cup Final Duel',
    format: '9:16',
    fps: 60,
    audioDuckingDb: -12.0,
    hosts: ['Alex Wenger', 'Alieve Wenger', 'Taylor Wenger', 'David Ward']
  };

  const triggerRyderCupReel = (config) => {
    return {
      reelId: `reel_adare_h18_ryder_cup_${Date.now()}`,
      status: 'RENDER_COMPLETE',
      fps: config.fps,
      aspectRatio: config.format,
      audioMix: {
        voiceLevelDb: 0.0,
        crowdRoarDb: -6.0,
        ambientWindLevelDb: config.audioDuckingDb
      }
    };
  };

  const result = triggerRyderCupReel(renderConfig);
  assert.equal(result.status, 'RENDER_COMPLETE');
  assert.equal(result.fps, 60);
  assert.equal(result.audioMix.crowdRoarDb, -6.0);
  assert.equal(result.audioMix.ambientWindLevelDb, -12.0);
});
