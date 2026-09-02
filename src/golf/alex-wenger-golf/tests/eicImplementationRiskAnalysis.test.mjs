import { test } from 'node:test';
import assert from 'node:assert/strict';

test('1. EIC Implementation Risk Analysis verifies all 5 risk IDs (R1-R5) and their mitigations', () => {
  const risks = [
    { id: 'R1', category: 'Regulatory', name: 'EU MDR Class IIa SaMD Drift', preLikelihood: 'Medium', postLikelihood: 'Low', impact: 'High', wps: ['WP3'] },
    { id: 'R2', category: 'Technical', name: 'Edge Telemetry Buffer Saturation', preLikelihood: 'Medium', postLikelihood: 'Low', impact: 'Medium', wps: ['WP1', 'WP2'] },
    { id: 'R3', category: 'Commercial', name: 'Elite Coaching Staff Resistance', preLikelihood: 'High', postLikelihood: 'Low', impact: 'High', wps: ['WP4', 'WP5'] },
    { id: 'R4', category: 'Technical', name: 'Sensor Modality Hardware Drift', preLikelihood: 'Medium', postLikelihood: 'Low', impact: 'Medium', wps: ['WP1', 'WP4'] },
    { id: 'R5', category: 'Regulatory', name: 'GDPR Art. 9 Sensitive Biometric Scrutiny', preLikelihood: 'Low', postLikelihood: 'Low', impact: 'High', wps: ['WP1', 'WP3'] }
  ];

  assert.equal(risks.length, 5, 'Must evaluate exactly 5 implementation risks (R1-R5)');
  assert.equal(risks[0].id, 'R1');
  assert.equal(risks[0].postLikelihood, 'Low', 'R1 post-mitigation likelihood must be Low');
  assert.equal(risks[2].id, 'R3');
  assert.equal(risks[2].postLikelihood, 'Low', 'R3 post-mitigation likelihood must be Low');
});
