import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SafetyWellbeingFlagger } from '../../../agents/safetyWellbeingFlagger.mjs';

test('1. Safety.Wellbeing.Flagger permits normal cardiac telemetry (HR=125, HRV=48ms)', () => {
  const flagger = new SafetyWellbeingFlagger();
  const res = flagger.evaluateBiometricTelemetry({ heartRateBpm: 125, hrvRmssdMs: 48.0 });

  assert.equal(res.isAnomalous, false);
  assert.equal(res.action, 'ALLOW_TRAINING_CONTINUATION');
  assert.equal(res.flags.length, 0);
  assert.equal(res.recoveryInstruction, null);
  assert.ok(res.evidenceHash.length === 64);
});

test('2. Safety.Wellbeing.Flagger triggers DETERMINISTIC_SAFETY_SHUTOFF on cardiac hyper-exertion (HR=186 BPM)', () => {
  const flagger = new SafetyWellbeingFlagger();
  const res = flagger.evaluateBiometricTelemetry({ heartRateBpm: 186, hrvRmssdMs: 42.0 });

  assert.equal(res.isAnomalous, true);
  assert.equal(res.action, 'DETERMINISTIC_SAFETY_SHUTOFF');
  assert.ok(res.flags.some(f => f.code === 'CARDIAC_HYPEREXERTION'));
  assert.equal(res.recoveryInstruction.handlingAgent, 'Coach.Recovery');
  assert.equal(res.recoveryInstruction.mode, 'PASSIVE_RECOVERY_LOCKOUT');
});

test('3. Safety.Wellbeing.Flagger triggers DETERMINISTIC_SAFETY_SHUTOFF on autonomic fatigue crash (HRV=14ms)', () => {
  const flagger = new SafetyWellbeingFlagger();
  const res = flagger.evaluateBiometricTelemetry({ heartRateBpm: 155, hrvRmssdMs: 14.0 });

  assert.equal(res.isAnomalous, true);
  assert.equal(res.action, 'DETERMINISTIC_SAFETY_SHUTOFF');
  assert.ok(res.flags.some(f => f.code === 'AUTONOMIC_FATIGUE_CRASH'));
  assert.equal(res.recoveryInstruction.handlingAgent, 'Coach.Recovery');
});
