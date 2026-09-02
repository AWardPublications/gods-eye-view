import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TimeSeriesTelemetryPipeline } from '../../../telemetry/timeSeriesTelemetryPipeline.mjs';

test('1. TimeSeriesTelemetryPipeline ingests swing pose kinematics and generates SHA-256 signature', () => {
  const pipeline = new TimeSeriesTelemetryPipeline({ sessionId: 'SESS-TEST-001' });
  const sample = pipeline.ingestSwingPoseSample({
    headZ: 1.75,
    clubheadSpeedMps: 52.8
  });

  assert.equal(sample.type, 'SWING_POSE');
  assert.equal(sample.kinematics.clubheadSpeedMps, 52.8);
  assert.ok(sample.sha256.length === 64);
});

test('2. TimeSeriesTelemetryPipeline ingests biometrics ECG sample and partitions by date', () => {
  const pipeline = new TimeSeriesTelemetryPipeline({ sessionId: 'SESS-TEST-001' });
  pipeline.ingestBiometricSample({ heartRateBpm: 128, hrvRmssdMs: 48.2 });

  const stats = pipeline.getPartitionStats();
  const todayKey = new Date().toISOString().split('T')[0];

  assert.ok(stats[todayKey]);
  assert.equal(stats[todayKey].biometricSamples, 1);
});
