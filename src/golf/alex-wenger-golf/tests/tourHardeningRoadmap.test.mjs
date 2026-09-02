import { test } from 'node:test';
import assert from 'node:assert/strict';
import { microElevationLidarEngine } from '../core/spatial/microElevationLidarEngine.js';
import { webBluetoothTelemetryReceiver } from '../core/hardware/webBluetoothTelemetryReceiver.js';
import { opticalLieClassifierEngine } from '../core/vision/opticalLieClassifierEngine.js';

test('1. Step 1: microElevationLidarEngine interpolates sub-meter 0.5m swisstopo & 1m USGS DEM tiles', () => {
  const swissResult = microElevationLidarEngine.interpolateLidarElevation([8.68, 47.37], { source: 'swisstopo', baseZ: 442.15, slopeGradePct: 3.2, breakAzimuthDeg: 120 });
  const usgsResult = microElevationLidarEngine.interpolateLidarElevation([-121.94, 36.56], { source: 'usgs3dep', baseZ: 14.2, slopeGradePct: 1.8, breakAzimuthDeg: 90 });

  assert.equal(swissResult.resolutionMeters, 0.5);
  assert.equal(swissResult.isMicroLidar, true);
  assert.equal(usgsResult.resolutionMeters, 1.0);
  assert.equal(usgsResult.isMicroLidar, true);
  assert.ok(swissResult.reboundDeflectionVector.normalZ > 0);
});

test('2. Step 2: webBluetoothTelemetryReceiver validates TrackMan packets & suppresses anomalous glitches', () => {
  const validPacket = webBluetoothTelemetryReceiver.ingestHardwarePacket({ device: 'TrackMan 4', ballSpeedMph: 168.5, launchAngleDeg: 11.2, spinRpm: 2550 });
  const glitchPacket = webBluetoothTelemetryReceiver.ingestHardwarePacket({ device: 'Garmin R10', ballSpeedMph: 285.0, spinRpm: 18000 }); // Out of bounds

  assert.equal(validPacket.isValid, true);
  assert.equal(validPacket.initialConditions.ballSpeedMph, 168.5);
  assert.ok(validPacket.latencyMs < 10.0);

  assert.equal(glitchPacket.isValid, false);
  assert.ok(glitchPacket.rejectionReason.includes('Telemetry anomaly detected'));
});

test('3. Step 3: opticalLieClassifierEngine classifies stance-lock lie in <100ms with zero-touch automation', () => {
  const stanceFrame = opticalLieClassifierEngine.classifyStanceLockLie({ bladeImmersionDepthMm: 28, moistureSheenPct: 32 });

  assert.equal(stanceFrame.lieKey, 'wet_rough');
  assert.equal(stanceFrame.k_lie, 0.45);
  assert.equal(stanceFrame.spinDecayPct, 55);
  assert.ok(stanceFrame.executionLatencyMs < 100.0);
  assert.equal(stanceFrame.isZeroTouch, true);
});
