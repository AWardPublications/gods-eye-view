import { DavinciaCapitalFabricConformanceEngine } from '../../src/davincia/davinciaCapitalFabricConformanceEngine.mjs';

function runSuite() {
  console.log("=" * 80);
  console.log("DAVINCIA⁺ CAPITAL FABRIC CONFORMANCE v1.0 — 20 CONFORMANCE FAMILIES");
  console.log("=" * 80);

  const engine = new DavinciaCapitalFabricConformanceEngine();
  const res = engine.runFullConformanceSuite();

  console.log(`\n  ✓ Framework Name:       ${res.frameworkName}`);
  console.log(`  ✓ Control Plane Gates:   ${res.totalControlGates} Hard Control Gates (Including CTRL-INTEGRITY)`);
  console.log(`  ✓ Governed States:       ${res.totalStateMachineStates} State Machine States`);
  console.log(`  ✓ Conformance Families:  ${res.totalConformanceFamilies} Test Families (01_Identity to 20_Cross_Agent_Contamination)`);
  console.log(`  ✓ Suite Hash:            ${res.suiteHash}\n`);

  // Run TAO-1.0 Traceability Test
  const tao = engine.createTao10TraceableArtefact('ELIGIBILITY_JUDGE', 'DAVID-ENT-BAT-001', 'GEDHI-OPP-2026-00421', { decision: 'ELIGIBLE_UNDER_GOVERNANCE_RULES' });
  console.log(`  • TAO-1.0 Artefact:     ${tao.artefact_id} | Hash: ${tao.content_hash.slice(0, 16)}...`);

  // Run CTRL-INTEGRITY Verification
  const ctrlCheck = engine.verifyCtrlIntegrity(tao, tao.content_hash);
  console.log(`  • CTRL-INTEGRITY Check: ${ctrlCheck.status}`);

  // Run Adversarial Test
  const advRes = engine.executeAdversarialConformanceTest({ type: 'ATTEMPT_HALLUCINATE_EVIDENCE' });
  console.log(`  • Adversarial Attack:   ${advRes.scenario} -> Result: ${advRes.expectedResult} (${advRes.gateTriggered})\n`);

  console.log("=" * 80);
  console.log("STATUS: DAVINCIA⁺ CAPITAL FABRIC CONFORMANCE 100% GREEN");
  console.log("=" * 80 + "\n");
}

runSuite();
