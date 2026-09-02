import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coupledBallisticsSolver } from '../core/physics/coupledBallisticsSolver.js';

test('1. coupledBallisticsSolver executes full 5-phase simulation (Stance -> Impact -> Flight -> Landing -> Rollout)', () => {
  const result = coupledBallisticsSolver.executeCoupledSimulation({
    stanceFrame: { bladeImmersionDepthMm: 12, moistureSheenPct: 15 },
    rawBlePacket: { device: 'TrackMan 4', ballSpeedMph: 165.0, launchAngleDeg: 10.5, spinRpm: 6800 },
    environment: { pressureHpa: 1013.25, tempC: 20.0, humidityPct: 50.0, windVx: 0, windVy: 0 },
    lidarGrid: { source: 'swisstopo', baseZ: 14.5, slopeGradePct: 2.1, breakAzimuthDeg: 110 }
  });

  assert.equal(result.isValid, true);
  assert.equal(result.phase1_stance_lie.lieKey, 'first_cut');
  assert.equal(result.phase1_stance_lie.k_lie, 0.75);
  assert.equal(result.phase2_impact_telemetry.effectiveSpinRpm, 5100);
  assert.ok(result.phase3_airborne_flight.carryYards > 250);
  assert.equal(result.phase4_lidar_impact.dataset, 'swisstopo');
  assert.ok(result.phase5_final_position.finalRestingYards > result.phase5_final_position.carryYards);
  assert.equal(result.performance.slaMet, true);
  assert.equal(result.governance.davincia_plus_seal, 'APPROVED');
});

test('2. coupledBallisticsSolver correctly models wet rough flier lie spin attenuation', () => {
  const flierResult = coupledBallisticsSolver.executeCoupledSimulation({
    stanceFrame: { bladeImmersionDepthMm: 30, moistureSheenPct: 35 }, // Wet rough flier lie
    rawBlePacket: { device: 'Garmin R10', ballSpeedMph: 165.0, launchAngleDeg: 10.5, spinRpm: 6800 }
  });

  assert.equal(flierResult.isValid, true);
  assert.equal(flierResult.phase1_stance_lie.lieKey, 'wet_rough');
  assert.equal(flierResult.phase1_stance_lie.k_lie, 0.45);
  assert.equal(flierResult.phase2_impact_telemetry.effectiveSpinRpm, 3060);
});

test('3. coupledBallisticsSolver suppresses hardware glitch packet out of physical bounds', () => {
  const glitchResult = coupledBallisticsSolver.executeCoupledSimulation({
    rawBlePacket: { device: 'FlightScope Mevo+', ballSpeedMph: 290.0, spinRpm: 22000 }
  });

  assert.equal(glitchResult.isValid, false);
  assert.ok(glitchResult.rejectionReason.includes('Telemetry anomaly detected'));
});
