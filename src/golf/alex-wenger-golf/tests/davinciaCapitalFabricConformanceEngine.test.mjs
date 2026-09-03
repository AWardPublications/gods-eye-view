import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DavinciaCapitalFabricConformanceEngine } from '../../../davincia/davinciaCapitalFabricConformanceEngine.mjs';

test('1. DavinciaCapitalFabricConformanceEngine verifies TAO-1.0, 13th CTRL-INTEGRITY gate, adversarial neutralizing, and 20 conformance test families', () => {
  const engine = new DavinciaCapitalFabricConformanceEngine();
  const res = engine.runFullConformanceSuite();

  assert.equal(res.frameworkName, 'DAVINCIA⁺ CAPITAL FABRIC CONFORMANCE v1.0');
  assert.equal(res.totalControlGates, 13);
  assert.equal(res.totalStateMachineStates, 13);
  assert.equal(res.totalConformanceFamilies, 20);

  const tao = engine.createTao10TraceableArtefact('ELIGIBILITY_JUDGE', 'ENT-001', 'OPP-001', { decision: 'ELIGIBLE_UNDER_GOVERNANCE_RULES' });
  assert.equal(tao.schema_version, 'TAO-1.0');
  assert.ok(tao.content_hash.length === 64);

  const ctrlCheck = engine.verifyCtrlIntegrity(tao, tao.content_hash);
  assert.equal(ctrlCheck.status, 'CTRL_INTEGRITY_VERIFIED_CHAIN_VALID');

  const staleCheck = engine.verifyCtrlIntegrity(tao, 'INVALID_TAMPERED_HASH');
  assert.equal(staleCheck.status, 'CTRL_INTEGRITY_STALE_OR_ALTERED_OBJECT_DETECTED');

  const advRes = engine.executeAdversarialConformanceTest({ type: 'ATTEMPT_HALLUCINATE_EVIDENCE' });
  assert.equal(advRes.expectedResult, 'BLOCK_AND_AUDIT_AND_ESCALATE');
});
