import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AltitudeBallisticsEngine } from '../core/physics/altitudeBallisticsSolver.js';
import { executeGovernedIntelligencePipeline } from '../core/architecture/governedIntelligenceSystem.js';

test('1. AltitudeBallisticsEngine computes air density via Tetens formula accurately', () => {
  const engine = new AltitudeBallisticsEngine();
  const rhoSeaLevel = engine.calculateAirDensity(1013.25, 15, 50);
  const rhoAltitude = engine.calculateAirDensity(852.0, 22, 40);

  assert.ok(rhoSeaLevel > 1.20 && rhoSeaLevel < 1.25);
  assert.ok(rhoAltitude > 0.95 && rhoAltitude < 1.05);
  assert.ok(rhoAltitude < rhoSeaLevel);
});

test('2. simulateFlight executes 3-DoF RK4 integration to calculate carry and descent angle', () => {
  const engine = new AltitudeBallisticsEngine();
  const res = engine.simulateFlight({
    launchSpeedMps: 50.0,
    launchAngleDeg: 18.0,
    spinRpm: 7000,
    environment: { pressureHpa: 1013.25, tempC: 15, humidityPct: 50 }
  });

  assert.ok(res.carryYards > 100);
  assert.ok(res.finalDescentAngleDeg > 35);
  assert.equal(res.exclusively_alex_responsibility, true);
});

test('3. calculateAltitudePlaysLike calculates Crans-sur-Sierre 1,480m plays-like yardage reduction', () => {
  const engine = new AltitudeBallisticsEngine();
  const playsLike = engine.calculateAltitudePlaysLike(152, 1480, 22);

  assert.equal(playsLike.rawYards, 152);
  assert.ok(playsLike.playsLikeYards < 145);
  assert.ok(playsLike.densityRatio < 0.85);
});

test('4. Governed 6-state pipeline executes Crans-sur-Sierre 8-iron thin-air voice query', () => {
  const engine = new AltitudeBallisticsEngine();
  const playsLike = engine.calculateAltitudePlaysLike(152, 1480, 22);

  const pipelineRes = executeGovernedIntelligencePipeline({
    userQuery: "Alex, I have 152 to the pin on 7. Normal 8-iron?",
    branchId: 'COURSE_SYSTEM',
    specialistFindingText: `At 1,500m elevation in thin air (${playsLike.densityKgM3} kg/m³), 152 yards plays like ${playsLike.playsLikeYards} yards. Take 9-iron.`
  });

  assert.equal(pipelineRes.judge_verdict.status, 'PASS');
  assert.ok(pipelineRes.integrated_coaching_response.includes('8-iron') || pipelineRes.integrated_coaching_response.includes('9-iron') || pipelineRes.integrated_coaching_response.includes('pin'));
});
