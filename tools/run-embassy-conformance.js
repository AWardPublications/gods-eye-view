import { registerExternalParticipant, verifyExternalPassport } from '../src/governed-commerce/registration.js';
import { discoverAssets } from '../src/governed-commerce/discovery.js';
import { executeGovernedTransaction } from '../src/governed-commerce/transaction.js';
import { verifyEntitlement } from '../src/governed-commerce/entitlement.js';
import { buildPassport, ParticipantTypes, PassportStates } from '../src/platform/passport.js';

console.log("==================================================");
console.log("DaVinciA+ Embassy Conformance Scorecard (v0.7)");
console.log("==================================================");

let extParticipantPass = false;
let passportAdmissionPass = false;
let passportVerificationPass = false;
let assetDiscoveryPass = false;
let provenancePass = false;
let policyPass = false;
let authorizationPass = false;
let entitlementPass = false;
let consumptionPass = false;
let settlementPass = false;
let evidencePass = false;
let failClosedPass = false;
let commerceOrderingPass = false;

try {
  // 1. External Participant & Passport Admission
  const extHuman = registerExternalParticipant({
    id: "urn:id:user:external-research-org",
    name: "External Research Organisation"
  }, "HUMAN");
  extParticipantPass = (extHuman && extHuman.passport_id.includes("external-research-org"));
  passportAdmissionPass = (extHuman.status === PassportStates.AUTHORIZED);

  // 2. Passport Verification
  const ver = verifyExternalPassport(extHuman);
  passportVerificationPass = ver.valid;

  // 3. Asset Discovery
  const catalog = discoverAssets();
  const brehon = catalog.find(a => a.asset_id === "urn:davincia:knowledge:asset:brehon-ip");
  assetDiscoveryPass = (brehon !== undefined && !("facts" in brehon)); // discovery metadata only

  // 4. Provenance, Policy, Authorization, Entitlement, Settlement
  const tx = await executeGovernedTransaction({
    humanPassport: extHuman,
    assetId: "urn:davincia:knowledge:asset:brehon-ip",
    action: "READ"
  });

  provenancePass = (tx.request.assetId === "urn:davincia:knowledge:asset:brehon-ip");
  policyPass = (tx.decision.policy_reference !== null);
  authorizationPass = (tx.decision.decision === "ALLOW");
  entitlementPass = (tx.entitlement !== null && tx.entitlement.status === "ACTIVE");
  settlementPass = (tx.settlement.settlement_status === "SETTLED");

  // 5. Consumption
  consumptionPass = (tx.usage_records.length > 0 && tx.usage_records[0].consumed_units === 1);

  // 6. Evidence
  evidencePass = (tx.evidence !== null && tx.evidence.chain.entitlement_ref === tx.entitlement.entitlement_id);

  // 7. Fail-Closed
  const hpSuspended = buildPassport({ id: "urn:id:user:external-research-org", name: "External Research Organisation" }, ParticipantTypes.HUMAN, ["READ"]);
  hpSuspended.status = PassportStates.SUSPENDED;
  const txFail = await executeGovernedTransaction({
    humanPassport: hpSuspended,
    assetId: "urn:davincia:knowledge:asset:brehon-ip",
    action: "READ"
  });
  failClosedPass = (txFail.status === "FAILED" && txFail.settlement.settlement_status === "FAILED");

  // 8. Commerce Ordering
  // Entitlement and settlement must only exist if decision is evaluated and allowed
  commerceOrderingPass = (tx.decision && tx.entitlement && tx.settlement && tx.status === "SETTLED");

} catch (e) {
  console.error("Embassy Conformance Scorecard Error:", e);
}

const scoreCount = [
  extParticipantPass, passportAdmissionPass, passportVerificationPass,
  assetDiscoveryPass, provenancePass, policyPass, authorizationPass,
  entitlementPass, consumptionPass, settlementPass, evidencePass,
  failClosedPass, commerceOrderingPass
].filter(Boolean).length;

const isConformant = (scoreCount === 13);

console.log("\nDAVINCIA⁺ EMBASSY CONFORMANCE SCORECARD");
console.log("=========================================\n");
console.log(`EXTERNAL PARTICIPANT:       ${extParticipantPass ? "PASS" : "FAIL"}`);
console.log(`PASSPORT ADMISSION:         ${passportAdmissionPass ? "PASS" : "FAIL"}`);
console.log(`PASSPORT VERIFICATION:      ${passportVerificationPass ? "PASS" : "FAIL"}`);
console.log(`ASSET DISCOVERY:            ${assetDiscoveryPass ? "PASS" : "FAIL"}`);
console.log(`PROVENANCE:                 ${provenancePass ? "PASS" : "FAIL"}`);
console.log(`POLICY:                     ${policyPass ? "PASS" : "FAIL"}`);
console.log(`AUTHORIZATION:              ${authorizationPass ? "PASS" : "FAIL"}`);
console.log(`ENTITLEMENT:                ${entitlementPass ? "PASS" : "FAIL"}`);
console.log(`CONSUMPTION:                ${consumptionPass ? "PASS" : "FAIL"}`);
console.log(`SETTLEMENT:                 ${settlementPass ? "PASS" : "FAIL"}`);
console.log(`EVIDENCE:                   ${evidencePass ? "PASS" : "FAIL"}`);
console.log(`FAIL-CLOSED:                ${failClosedPass ? "PASS" : "FAIL"}`);
console.log(`COMMERCE ORDERING:          ${commerceOrderingPass ? "PASS" : "FAIL"}`);
console.log(`\nSCORE: ${scoreCount}/13`);
console.log(`STATUS: ${isConformant ? "CONFORMANT" : "NON-CONFORMANT"}`);
console.log("=========================================\n");

process.exit(isConformant ? 0 : 1);
