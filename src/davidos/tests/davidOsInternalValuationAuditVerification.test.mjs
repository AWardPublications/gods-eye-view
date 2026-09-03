import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DavidOsInternalValuationAuditVerificationEngine } from '../davidOsInternalValuationAuditVerificationEngine.mjs';

test('134_Valuation_Arithmetic_Verification: Confirms exact mathematical alignment for €87.5M Base Floor and 5.5x–8.5x Monopoly Range', () => {
  const engine = new DavidOsInternalValuationAuditVerificationEngine();
  const res = engine.verifyValuationArithmetic({
    arios_l1_spanning_chain: 9500000,
    merkle_forest_batcher: 12500000,
    davincia_governance_stack: 16000000,
    governed_voice_pipeline: 8500000,
    spatial_estate_and_portals: 15000000,
    brand_ip_and_agent_swarm: 26000000
  });

  assert.equal(res.status, 'VALUATION_ARITHMETIC_VERIFIED_EXACT');
  assert.equal(res.evaluated_sum_eur, 87500000);
  assert.equal(res.lower_bound_eur, 481250000);
  assert.equal(res.upper_bound_eur, 743750000);
  assert.equal(res.audit_verified, true);
  assert.ok(res.receipt_hash.length === 64);
});
