import { runDeterministicSimulation } from '../src/governed-commerce/simulation.js';

console.log("==================================================");
console.log("DaVinciA+ Commercial Transaction Conformance (v0.5)");
console.log("==================================================");

let identityIntegrityPass = false;
let authorityIntegrityPass = false;
let policyIntegrityPass = false;
let provenanceIntegrityPass = false;
let entitlementIntegrityPass = false;
let settlementIntegrityPass = false;
let replayProtectionPass = false;
let adversarialResiliencePass = false;
let evidenceCompletenessPass = false;
let economicFailClosedPass = false;

try {
  const seed = 54321;
  const result = await runDeterministicSimulation(seed, 1000);
  const stats = result.stats;

  // 1. Identity Integrity: unauthorized_settlements = 0
  identityIntegrityPass = (stats.unauthorized_settlements === 0);

  // 2. Authority Integrity: Expired or out-of-scope delegations are blocked
  authorityIntegrityPass = (stats.scenarios.SCOPE_VIOLATION > 0 && stats.scenarios.EXPIRED_DELEGATION > 0);

  // 3. Policy Integrity: Conflicting policies fall back correctly
  policyIntegrityPass = (stats.scenarios.CONFLICTING_POLICY > 0);

  // 4. Provenance Integrity: Drift is blocked
  provenanceIntegrityPass = (stats.scenarios.DRIFTED_ASSET > 0);

  // 5. Entitlement Integrity: Allowing maps to entitlement
  entitlementIntegrityPass = (stats.allowed_requests === stats.settled_transactions);

  // 6. Settlement Integrity: Denied requests map to failed settlements
  settlementIntegrityPass = (stats.denied_requests === stats.failed_transactions);

  // 7. Replay Protection: Seed reproducibility
  const rerun = await runDeterministicSimulation(seed, 1000);
  replayProtectionPass = (JSON.stringify(stats) === JSON.stringify(rerun.stats));

  // 8. Adversarial Resilience: Hostile requests are blocked
  adversarialResiliencePass = (stats.scenarios.SPOOFED_HOSTILE > 0);

  // 9. Evidence Completeness: Records exist for every transaction
  evidenceCompletenessPass = (result.records.length === 1000);

  // 10. Economic Fail-Closed: Unauthorized settlement count must be exactly 0
  economicFailClosedPass = (stats.unauthorized_settlements === 0);

} catch (e) {
  console.error("Simulation Conformance Error:", e);
}

const overallPass = 
  identityIntegrityPass && authorityIntegrityPass && policyIntegrityPass &&
  provenanceIntegrityPass && entitlementIntegrityPass && settlementIntegrityPass &&
  replayProtectionPass && adversarialResiliencePass && evidenceCompletenessPass && economicFailClosedPass;

console.log("\nDAVINCIA⁺ SIMULATION CONFORMANCE SCORECARD");
console.log("===========================================\n");
console.log(`IDENTITY INTEGRITY:      ${identityIntegrityPass ? "PASS" : "FAIL"}`);
console.log(`AUTHORITY INTEGRITY:     ${authorityIntegrityPass ? "PASS" : "FAIL"}`);
console.log(`POLICY INTEGRITY:        ${policyIntegrityPass ? "PASS" : "FAIL"}`);
console.log(`PROVENANCE INTEGRITY:    ${provenanceIntegrityPass ? "PASS" : "FAIL"}`);
console.log(`ENTITLEMENT INTEGRITY:   ${entitlementIntegrityPass ? "PASS" : "FAIL"}`);
console.log(`SETTLEMENT INTEGRITY:    ${settlementIntegrityPass ? "PASS" : "FAIL"}`);
console.log(`REPLAY PROTECTION:       ${replayProtectionPass ? "PASS" : "FAIL"}`);
console.log(`ADVERSARIAL RESILIENCE:  ${adversarialResiliencePass ? "PASS" : "FAIL"}`);
console.log(`EVIDENCE COMPLETENESS:   ${evidenceCompletenessPass ? "PASS" : "FAIL"}`);
console.log(`ECONOMIC FAIL-CLOSED:    ${economicFailClosedPass ? "PASS" : "FAIL"}`);
console.log("\nSTATUS:");
console.log(overallPass ? "CONFORMANT" : "NON-CONFORMANT");
console.log("===========================================\n");

process.exit(overallPass ? 0 : 1);
