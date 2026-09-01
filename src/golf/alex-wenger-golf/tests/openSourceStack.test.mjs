import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  OPEN_SOURCE_STACK_MATRIX,
  calculate3DoFBallistics,
  validatePatentSchema,
} from '../core/architecture/openSourceStack.js';

test('OPEN_SOURCE_STACK_MATRIX registers toolstack across all 5 architectural layers', () => {
  assert.ok(OPEN_SOURCE_STACK_MATRIX.ORCHESTRATION.state_machine.includes('XState'));
  assert.ok(OPEN_SOURCE_STACK_MATRIX.GEOMETRY_PLOTTER.geospatial_math.includes('Turf.js'));
  assert.ok(OPEN_SOURCE_STACK_MATRIX.PHYSICAL_MODELS.ballistics_engine.includes('3-DoF Ballistics'));
  assert.ok(OPEN_SOURCE_STACK_MATRIX.GOVERNANCE_FILTER.schema_verifier.includes('Zod'));
  assert.ok(OPEN_SOURCE_STACK_MATRIX.SPEECH_AUDIO.tts_engine.includes('Piper'));
});

test('calculate3DoFBallistics accurately computes plays-like yards and crosswind drift', () => {
  const ballistics = calculate3DoFBallistics({
    distanceYards: 160,
    headwindMph: 10,
    crosswindMph: 15,
    altitudeFt: 2000,
  });

  assert.equal(ballistics.raw_distance_yds, 160);
  assert.ok(ballistics.plays_like_yds > 160, 'Headwind should increase plays-like distance');
  assert.equal(ballistics.lateral_drift_yds, 12.0);
  assert.equal(ballistics.recommended_aim_offset_yds, -12.0);
});

test('validatePatentSchema verifies WO/2026/150385 compliance rules', () => {
  const validPayload = {
    agent: 'CADDY',
    finding: 'Plays 178 yards into 15mph wind.',
    exclusively_alex_responsibility: 'Decision to commit to target line.',
  };

  const check = validatePatentSchema(validPayload);
  assert.equal(check.valid, true);
  assert.equal(check.governance_patent, 'WO/2026/150385');
});
