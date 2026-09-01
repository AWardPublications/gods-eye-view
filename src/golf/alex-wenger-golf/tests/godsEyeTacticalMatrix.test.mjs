import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GodsEyeTacticalMatrix } from '../core/spatial/godsEyeTacticalMatrix.js';
import { executeGovernedIntelligencePipeline } from '../core/architecture/governedIntelligenceSystem.js';

test('1. GodsEyeTacticalMatrix calculates bivariate dispersion ellipse and hazard overlap', () => {
  const matrix = new GodsEyeTacticalMatrix();
  const ellipse = matrix.calculateDispersionEllipse(12, 170);

  assert.equal(ellipse.use_id, 1);
  assert.ok(ellipse.lateral_deviation_yards > 0);
  assert.ok(ellipse.hazard_overlap_percent > 0);
});

test('2. GodsEyeTacticalMatrix calculates specular rebound vector across dune ridge', () => {
  const matrix = new GodsEyeTacticalMatrix();
  const rebound = matrix.calculateReboundCone([10, -5, 0], [0, 1, 0]);

  assert.equal(rebound.use_id, 3);
  assert.deepEqual(rebound.rebound_velocity, [10, 5, 0]);
});

test('3. GodsEyeTacticalMatrix triggers biomechanical slope warning (>12° incline)', () => {
  const matrix = new GodsEyeTacticalMatrix();
  const slopeWarn = matrix.evaluateStanceSlope(14.5);

  assert.equal(slopeWarn.use_id, 4);
  assert.equal(slopeWarn.lumbar_shear_warning, true);
  assert.equal(slopeWarn.warning_level, 'AMBER_ALERT');
});

test('4. GodsEyeTacticalMatrix adjusts Stimpmeter roll coefficient under solar shadows', () => {
  const matrix = new GodsEyeTacticalMatrix();
  const shadowPace = matrix.calculateTurfMoisturePace(true, 12.0);

  assert.equal(shadowPace.use_id, 6);
  assert.equal(shadowPace.adjusted_stimpmeter, 11.2);
});

test('5. GodsEyeTacticalMatrix classifies pin risk-reward zone (Red/Defend vs Green/Attack)', () => {
  const matrix = new GodsEyeTacticalMatrix();
  const pinRisk = matrix.classifyPinRisk(3.2);

  assert.equal(pinRisk.use_id, 9);
  assert.equal(pinRisk.risk_level, 'RED_DEFEND');
});

test('6. Governed pipeline ingests GodsEyeTacticalMatrix output and passes State 4 Judge audit', () => {
  const matrix = new GodsEyeTacticalMatrix();
  const pinRisk = matrix.classifyPinRisk(3.5);

  const pipelineRes = executeGovernedIntelligencePipeline({
    userQuery: "Alex, what is the pin risk level on Hole 3?",
    branchId: 'COURSE_SYSTEM',
    specialistFindingText: `God's Eye Pin Matrix classified pin as ${pinRisk.risk_level}. ${pinRisk.coaching_directive}`
  });

  assert.equal(pipelineRes.judge_verdict.status, 'PASS');
  assert.ok(pipelineRes.integrated_coaching_response.length > 10);
});
