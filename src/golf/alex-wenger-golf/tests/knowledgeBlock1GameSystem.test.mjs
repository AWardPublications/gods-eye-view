import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AltitudeBallisticsEngine } from '../core/physics/altitudeBallisticsSolver.js';
import { PuttserGrainEngine } from '../../../edge/physics/puttserGrainEngine.js';

test('1. Titleist ProV1 Dynamic Cd/Cl Aerodynamic Drag & Lift Parameterization', () => {
  const solver = new AltitudeBallisticsEngine();

  // Test flight under standard sea-level atmosphere (1013.25 hPa, 15°C, 50% RH)
  const density = solver.calculateAirDensity(1013.25, 15.0, 50.0);
  assert.equal(density, 1.2211);

  const flight = solver.simulateFlight({
    launchSpeedMps: 76.0, // ~170 mph ball speed
    launchAngleDeg: 10.5,
    spinRpm: 2400,
    environment: { pressureHpa: 1013.25, tempC: 15.0, humidityPct: 50.0, windVx: 0, windVy: 0 }
  });

  assert.ok(flight.carryYards > 200, 'Driver carry with Titleist ProV1 dimple model should exceed 200 yards');
  assert.equal(flight.densityKgM3, 1.2211);
  assert.equal(flight.exclusively_alex_responsibility, true);
});

test('2. PUTTSER Moisture-Scaled Rolling Friction (mu_r) across Turf Types', () => {
  const puttser = new PuttserGrainEngine();

  // 1. Creeping Bentgrass at 10% GMC vs 25% GMC
  const bentDry = puttser.calculateMoistureRollingFriction('creeping_bentgrass', 10.0);
  const bentWet = puttser.calculateMoistureRollingFriction('creeping_bentgrass', 25.0);
  assert.equal(bentDry, 0.052);
  assert.ok(bentWet > bentDry, 'Higher moisture content should increase rolling friction mu_r');

  // 2. Bermuda TifEagle at 20% GMC
  const bermudaMu = puttser.calculateMoistureRollingFriction('bermuda_tifeagle', 20.0);
  assert.ok(bermudaMu > bentDry, 'Bermuda TifEagle should have higher rolling friction than Bentgrass');

  // 3. Coastal Fescue at 10% GMC (Fast Links Green)
  const fescueMu = puttser.calculateMoistureRollingFriction('coastal_fescue', 10.0);
  assert.equal(fescueMu, 0.044);
});

test('3. PUTTSER Bermuda Grain Steering & Acceleration Vector', () => {
  const puttser = new PuttserGrainEngine();

  // Slow rolling putt (v = 0.5 m/s) on Bermuda green with cross-grain
  const accelBermuda = puttser.calculateRollingAcceleration({
    turfType: 'bermuda_tifeagle',
    gmcPct: 15.0,
    velocityMps: [0.0, 0.5], // Moving straight North
    slopeVector: [0.0, 0.0],
    grainVector: [1.0, 0.0]  // Grain pointing East
  });

  assert.ok(accelBermuda.ax !== 0, 'Lateral grain force should induce non-zero X acceleration');
  assert.equal(accelBermuda.turfType, 'bermuda_tifeagle');

  // Low grain influence on Bentgrass
  const accelBent = puttser.calculateRollingAcceleration({
    turfType: 'creeping_bentgrass',
    gmcPct: 15.0,
    velocityMps: [0.0, 0.5],
    slopeVector: [0.0, 0.0],
    grainVector: [1.0, 0.0]
  });

  assert.ok(Math.abs(accelBermuda.ax) > Math.abs(accelBent.ax), 'Bermuda grain deflection force must exceed Bentgrass');
});

test('4. End-to-End PUTTSER Break Path Rollout Simulation', () => {
  const puttser = new PuttserGrainEngine();

  const puttResult = puttser.simulatePuttBreak({
    initialSpeedMps: 2.8,
    initialBearingDeg: 0.0,
    turfType: 'coastal_fescue',
    gmcPct: 10.0,
    slopeVector: [0.01, 0.0],
    grainVector: [0.0, 1.0]
  });

  assert.ok(puttResult.finalDistanceYards > 5.0, '2.8 m/s putt on dry fescue should roll past 5 yards');
  assert.ok(puttResult.pathStepsCount > 0);
  assert.equal(puttResult.exclusively_alex_responsibility, true);
});
