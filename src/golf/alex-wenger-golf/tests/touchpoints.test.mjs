import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TOUCHPOINTS, executeTouchpointOrchestration } from '../core/orchestration/touchpointOrchestrator.js';

test('TOUCHPOINTS registers all 5 golfer and caddy human touchpoints', () => {
  assert.equal(TOUCHPOINTS.EVE_OF_ROUND, 'TOUCHPOINT_1_EVE_OF_ROUND');
  assert.equal(TOUCHPOINTS.WARMUP, 'TOUCHPOINT_2_WARMUP');
  assert.equal(TOUCHPOINTS.LIVE_EXECUTION, 'TOUCHPOINT_3_LIVE_EXECUTION');
  assert.equal(TOUCHPOINTS.WALK_OFF, 'TOUCHPOINT_4_WALK_OFF');
  assert.equal(TOUCHPOINTS.CLUBHOUSE, 'TOUCHPOINT_5_CLUBHOUSE');
});

test('executeTouchpointOrchestration computes spatial telemetry for Touchpoint 3 Live Execution', () => {
  const payload = executeTouchpointOrchestration(TOUCHPOINTS.LIVE_EXECUTION, {
    athleteName: 'Alex',
    courseName: 'Pebble Beach Golf Links',
    rawYards: 165,
    deltaZ: 6,
    altitudeMeters: 120,
    windMph: 14,
  });

  assert.equal(payload.touchpoint_id, 'TOUCHPOINT_3_LIVE_EXECUTION');
  assert.equal(payload.core_engine_dependency, 'Sub-100ms DEM spatial lookup & 3-DoF Ballistics engine');
  assert.ok(payload.spatial_engine_telemetry.plays_like_yards > 165);
});

test('executeTouchpointOrchestration computes WHS and SG telemetry for Touchpoint 4 Walk-Off', () => {
  const payload = executeTouchpointOrchestration(TOUCHPOINTS.WALK_OFF, {
    athleteName: 'David Ward',
    courseName: 'Real Club Valderrama',
    handicapIndex: 4.2,
    slopeRating: 148,
    courseRating: 76.1,
    par: 71,
  });

  assert.equal(payload.touchpoint_id, 'TOUCHPOINT_4_WALK_OFF');
  assert.equal(payload.spatial_engine_telemetry.whs_handicap.playingHandicap, 10);
  assert.equal(payload.spatial_engine_telemetry.strokes_gained_approach, 0.30);
});
