import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GodsEyeEngine } from '../core/spatial/godsEyeEngine.js';
import { executeGovernedIntelligencePipeline } from '../core/architecture/governedIntelligenceSystem.js';

test('1. GodsEyeEngine engages Nadir 90° Lock (Pitch: 0°)', () => {
  const engine = new GodsEyeEngine();
  const res = engine.engageNadirLock([2.7601, 41.8542], 17.2);

  assert.equal(res.mode, 'GODS_EYE_NADIR');
  assert.equal(res.pitch, 0);
  assert.equal(res.zoom, 17.2);
});

test('2. GodsEyeEngine engages Tactical 3D Orbit (Pitch: 56°)', () => {
  const engine = new GodsEyeEngine();
  const res = engine.engageTacticalOrbit([2.7601, 41.8542], 45, 56);

  assert.equal(res.mode, 'GODS_EYE_ORBIT');
  assert.equal(res.pitch, 56);
  assert.equal(res.bearing, 45);
});

test('3. GodsEyeEngine calculates ephemeris solar shadow multiplier accurately', () => {
  const engine = new GodsEyeEngine();
  const shadowData = engine.calculateSolarShadowOffset(41.8542, 2.7601, new Date('2026-06-21T12:00:00Z'));

  assert.ok(typeof shadowData.altitudeDegrees === 'number');
  assert.ok(typeof shadowData.shadowMultiplier === 'number');
  assert.ok(shadowData.shadowMultiplier >= 0.2);
  assert.ok(shadowData.shadowMultiplier <= 5.0);
});

test('4. 6-State governed pipeline executes Camiral 11th hole God\'s Eye voice query', () => {
  const engine = new GodsEyeEngine();
  const nadirLock = engine.engageNadirLock([2.7601, 41.8542]);

  const pipelineRes = executeGovernedIntelligencePipeline({
    userQuery: "Alex, give me God's Eye over the 11th hole at Camiral",
    branchId: 'COURSE_SYSTEM',
    specialistFindingText: "Snapping to God's Eye view from 2,000 feet. Trees choke fairway at 235 yards; keep tee shot short of pine shadows on the right."
  });

  assert.equal(nadirLock.mode, 'GODS_EYE_NADIR');
  assert.equal(pipelineRes.judge_verdict.status, 'PASS');
  assert.ok(pipelineRes.integrated_coaching_response.includes('God\'s Eye') || pipelineRes.integrated_coaching_response.includes('Caddy'));
});
