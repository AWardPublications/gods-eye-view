import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TrajectoryOrchestrator } from '../core/physics/rungeKutta3DoFWithLidar.js';
import { MicroElevationLidarEngine } from '../core/spatial/microElevationLidarEngine.js';

test('1. TrajectoryOrchestrator.simulateShot executes full 3-DoF flight & LiDAR bounce/rollout integration', () => {
  const buffer = new Float32Array(16).fill(10.0); // 4x4 flat grid at 10m
  const meta = { crs: 'EPSG:2056', resolutionMeters: 1.0, originX: 0, originY: 0, width: 4, height: 4, tileId: 'SWISSTOPO_0.5M_HOLE18' };
  const lidar = new MicroElevationLidarEngine(buffer, meta);

  const telemetry = {
    kinematics: {
      ballSpeedMph: 167.4,
      launchAngleDeg: 10.8,
      launchAzimuthDeg: -1.2,
      totalSpinRpm: 2420,
      spinAxisDeg: -3.5,
      clubHeadSpeedMph: 114.2
    },
    provenance: {
      rawPayloadHashSha256: 'a1b2c3d4e5f678901234567890abcdefa1b2c3d4e5f678901234567890abcdef',
      device: 'TrackMan 4 BLE'
    }
  };

  const env = {
    airDensityKgM3: 1.205,
    windVelocityMps: [-2.1, -4.5, 0.0],
    greenStimpRating: 11.5
  };

  const result = TrajectoryOrchestrator.simulateShot(telemetry, lidar, env);
  console.log("SimulateShot Result:", result);

  assert.ok(result.carryDistanceMeters > 100, 'Carry distance should exceed 100 meters');
  assert.ok(result.totalDistanceMeters >= result.carryDistanceMeters, 'Total distance should equal or exceed carry');
  assert.ok(result.flightTimeSec > 4.0, 'Flight time should exceed 4 seconds');
  assert.ok(result.bounces >= 1, 'Bounce count should be at least 1');
  assert.equal(result.ledgerProofSha256.length, 64, 'SHA-256 ledger proof should be 64 hex characters');
});
