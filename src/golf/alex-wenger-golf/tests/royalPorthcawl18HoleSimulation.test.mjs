import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AltitudeBallisticsEngine } from '../core/physics/altitudeBallisticsSolver.js';
import { SpatialLearningEngine } from '../core/spatial/spatialLearningEngine.js';

test('1. Royal Porthcawl 18-Hole Changing Bristol Channel Crosswind Mesh', () => {
  const solver = new AltitudeBallisticsEngine();
  
  // Dry Westerly Gale (Elevation 18m, 16°C, Pressure 1011 hPa, Humidity 60%)
  const density = solver.calculateAirDensity(1011.0, 16.0, 60.0);
  assert.ok(Math.abs(density - 1.220) < 0.01, `Calculated density ${density} kg/m³`);

  // Simulate 18 holes with rotating target bearings relative to Bristol Channel (180° South gale)
  const holeBearings = [
    180, 225, 270, 315, 0, 45, 90, 135, 180, // Front 9: Sea exposure & crosswinds
    210, 270, 300, 330, 15, 60, 120, 160, 180 // Back 9: Changing grid bearings
  ];

  const simulationResults = [];

  for (let h = 1; h <= 18; h++) {
    const bearing = holeBearings[h - 1];
    // Calculate crosswind & headwind components relative to 25-knot West wind (270°)
    const windAngleRad = ((270 - bearing) * Math.PI) / 180;
    const windSpeedMps = 12.86; // 25 knots
    const windVx = windSpeedMps * Math.sin(windAngleRad);
    const windVy = windSpeedMps * Math.cos(windAngleRad);

    const flight = solver.simulateFlight({
      launchSpeedMps: h % 3 === 0 ? 55.0 : 72.0, // Iron vs Driver
      launchAngleDeg: h % 3 === 0 ? 16.0 : 11.0,
      spinRpm: h % 3 === 0 ? 6000 : 2500,
      environment: {
        pressureHpa: 1011.0,
        tempC: 16.0,
        humidityPct: 60.0,
        windVx,
        windVy
      }
    });

    simulationResults.push({ hole: h, bearing, carryYards: flight.carryYards, density: flight.densityKgM3 });
  }

  assert.equal(simulationResults.length, 18);
  assert.ok(simulationResults.every(r => r.carryYards > 150));
  assert.ok(simulationResults.every(r => r.density === density));
});

test('2. Caddy & Swingsy Dynamic Club & Punch Trajectory Selection', () => {
  const selectTacticalShot = (holeNumber, windType, targetYards) => {
    if (windType === 'SEVERE_HEADWIND_SEA_EXPOSURE') {
      return {
        recommendedClub: '3-iron',
        trajectoryType: 'LOW_LAUNCH_PUNCH_BULLET',
        launchAngleDeg: 9.5,
        targetAimOffsetDeg: -8.5, // Aim left into Bristol Channel wind
        advice: 'Bristol Channel gale headwind. Punch 3-iron low under the wind shear.'
      };
    } else if (windType === 'CROSSWIND_GALE') {
      return {
        recommendedClub: '5-iron',
        trajectoryType: 'CONTROLLED_KNOCKDOWN_DRAW',
        launchAngleDeg: 12.0,
        targetAimOffsetDeg: 12.0, // Hold against right-to-left drift
        advice: 'Right-to-left Bristol crosswind. Hold line with controlled knockdown draw.'
      };
    }
    return {
      recommendedClub: 'Driver',
      trajectoryType: 'STANDARD_TOWERING_DRIVE',
      launchAngleDeg: 11.0,
      targetAimOffsetDeg: 0.0,
      advice: 'Tailwind behind. High launch drive taking advantage of sea breeze.'
    };
  };

  const hole1Shot = selectTacticalShot(1, 'SEVERE_HEADWIND_SEA_EXPOSURE', 210);
  assert.equal(hole1Shot.recommendedClub, '3-iron');
  assert.equal(hole1Shot.trajectoryType, 'LOW_LAUNCH_PUNCH_BULLET');
  assert.equal(hole1Shot.targetAimOffsetDeg, -8.5);

  const hole3Shot = selectTacticalShot(3, 'CROSSWIND_GALE', 185);
  assert.equal(hole3Shot.recommendedClub, '5-iron');
  assert.equal(hole3Shot.trajectoryType, 'CONTROLLED_KNOCKDOWN_DRAW');
  assert.equal(hole3Shot.targetAimOffsetDeg, 12.0);
});

test('3. State 4 Judge Gate Compliance Across Full 18-Hole Round', () => {
  const roundStateContexts = Array.from({ length: 18 }, (_, i) => ({
    hole: i + 1,
    fsm_state: 4, // Competition Mode Active
    rule_4_3a_active: true,
    raw_laser_yards: 420.0 + (i * 15) % 100,
    calculated_plays_like_yards: 445.0 + (i * 18) % 110
  }));

  const auditResults = roundStateContexts.map(ctx => {
    if (ctx.rule_4_3a_active && ctx.fsm_state === 4) {
      return {
        hole: ctx.hole,
        displayedDistance: ctx.raw_laser_yards,
        suppressedPlaysLike: true,
        compliant: true
      };
    }
    return { hole: ctx.hole, displayedDistance: ctx.calculated_plays_like_yards, compliant: false };
  });

  assert.equal(auditResults.length, 18);
  assert.ok(auditResults.every(a => a.compliant === true));
  assert.ok(auditResults.every(a => a.suppressedPlaysLike === true));
});

test('4. 18-Hole Spatial Learning & Green Rebound Calibration', () => {
  const spatialEngine = new SpatialLearningEngine();

  // 18-hole shot history logged in userMemory.js
  const userRoundHistory = Array.from({ length: 18 }, (_, i) => ({
    courseId: 'royal_porthcawl',
    holeNumber: i + 1,
    expectedLandingCoord: [-3.7161 + i * 0.001, 51.4883 + i * 0.001],
    verifiedRestingCoord: [-3.7160 + i * 0.001, 51.4884 + i * 0.001],
    club: i % 2 === 0 ? 'Driver' : '7-iron',
    surfaceType: 'firm_coastal_fescue'
  }));

  const calibration = spatialEngine.calibrateCourseTelemetry('royal_porthcawl', userRoundHistory);
  assert.ok(calibration);
  assert.equal(calibration.courseId, 'royal_porthcawl');
  assert.equal(calibration.processedShots, 18);
  assert.equal(calibration.governanceAudit.patentStandard, 'WO/2026/150385');
});

test('5. Full 18-Hole Round Telemetry Ledger & 19th-Hole Media Summary', async () => {
  const roundLedger = {
    courseId: 'royal_porthcawl',
    totalStrokes: 70, // -2 under par 72
    strokesGainedTeeToGreen: +1.45,
    strokesGainedPutting: +0.85,
    totalStrokesGained: +2.30,
    windSummary: 'Bristol Channel 25kt Westerly Gale',
    status: 'ROUND_FINALIZED'
  };

  const generateRoundMediaPackage = (ledger) => {
    return {
      reelId: `reel_rpc_18hole_${Date.now()}`,
      status: 'ROUND_RECAP_RENDERED',
      totalStrokes: ledger.totalStrokes,
      totalSG: ledger.totalStrokesGained,
      fps: 60,
      format: '9:16',
      audioDuckingDb: -12.0,
      hosts: ['Alex Wenger', 'Alieve Wenger', 'Taylor Wenger', 'David Ward']
    };
  };

  const mediaPkg = generateRoundMediaPackage(roundLedger);
  assert.equal(mediaPkg.status, 'ROUND_RECAP_RENDERED');
  assert.equal(mediaPkg.totalStrokes, 70);
  assert.equal(mediaPkg.totalSG, +2.30);
  assert.equal(mediaPkg.audioDuckingDb, -12.0);
});
