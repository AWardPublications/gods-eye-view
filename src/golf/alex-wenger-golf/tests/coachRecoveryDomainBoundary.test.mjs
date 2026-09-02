import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CoachRecoveryEngine, MEDICAL_EXCLUSION_RULES } from '../../../agents/coachRecoveryDomainBoundary.mjs';

test('1. Coach.Recovery permits normal physiological recovery (HRR 1-min drop = 22 BPM)', () => {
  const engine = new CoachRecoveryEngine();
  const res = engine.evaluatePhysiologicalRecovery({
    heartRateBpm: 130,
    hrrOneMinDropBpm: 22,
    hrvRmssdMs: 45.0
  });

  assert.equal(res.isBoundaryBreached, false);
  assert.equal(res.action, 'PASSIVE_RECOVERY_GUIDANCE');
  assert.equal(res.breachFlags.length, 0);
  assert.equal(res.escalationPackage, null);
  assert.ok(res.evidenceHash.length === 64);
});

test('2. Coach.Recovery triggers Domain Boundary Breach on abnormal HRR recovery drop (8 BPM < 12 BPM floor)', () => {
  const engine = new CoachRecoveryEngine();
  const res = engine.evaluatePhysiologicalRecovery({
    heartRateBpm: 155,
    hrrOneMinDropBpm: 8,
    hrvRmssdMs: 32.0
  });

  assert.equal(res.isBoundaryBreached, true);
  assert.equal(res.action, 'HALT_AND_ESCALATE_TO_HUMAN_CLINICIAN');
  assert.ok(res.breachFlags.some(f => f.code === 'ABNORMAL_HRR_BOUNDARY_BREACH'));
  assert.equal(res.escalationPackage.status, 'HALTED_AWAITING_HUMAN_REVIEW');
  assert.equal(res.escalationPackage.medicalExclusionGateTriggered, true);
});

test('3. Coach.Recovery triggers Medical Exclusion Gate on clinical diagnostic query', () => {
  const engine = new CoachRecoveryEngine();
  const res = engine.evaluatePhysiologicalRecovery({
    userQueryText: 'I feel dizzy and have chest pain during swings'
  });

  assert.equal(res.isBoundaryBreached, true);
  assert.equal(res.action, 'HALT_AND_ESCALATE_TO_HUMAN_CLINICIAN');
  assert.ok(res.breachFlags.some(f => f.code === 'MEDICAL_QUERY_BOUNDARY_BREACH'));
});
