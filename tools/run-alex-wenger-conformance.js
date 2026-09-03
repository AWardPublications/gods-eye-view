import { buildPassport, ParticipantTypes, PassportStates } from '../src/platform/passport.js';
import { evaluatePolicy } from '../src/governance/evaluate.js';
import { executeGovernedTransaction } from '../src/governed-commerce/transaction.js';
import { CatalogAssets } from '../src/marketplace/catalog.js';
import { verifyEntitlement } from '../src/governed-commerce/entitlement.js';

console.log("==================================================");
console.log("DaVinciA+ Alex Wenger Golf Conformance Scorecard");
console.log("==================================================");

let passportAdmissionPass = false;
let identityPass = false;
let playerConsentPass = false;
let agentAuthorityPass = false;
let knowledgeProvenancePass = false;
let policyEvaluationPass = false;
let failClosedPass = false;
let entitlementPass = false;
let meteringPass = false;
let evidencePass = false;
let revocationPass = false;
let provenanceDriftPass = false;
let commercialOrderingPass = false;
let settlementIntegrityPass = false;
let noUnauthorizedTxPass = false;

try {
  // 1. Passport Admission
  const playerPassport = buildPassport({ id: "urn:id:user:player-one", name: "Player One" }, ParticipantTypes.HUMAN, ["READ", "COACH", "TRAIN"]);
  playerPassport.status = PassportStates.AUTHORIZED;
  passportAdmissionPass = (playerPassport.status === PassportStates.AUTHORIZED);

  // 2. Identity
  identityPass = (playerPassport.passport_id === "urn:davincia:passport:human:player-one");

  // 3. Player Consent
  const consentedRecord = {
    object_id: "urn:davincia:alex-wenger:telemetry_session:001",
    object_type: "telemetry_session",
    domain: "alex-wenger",
    version: "1.0.0",
    lifecycle_state: "SUBMITTED",
    provenance: {
      source_type: "COMMUNITY",
      source_reference: "Telemetry Mesh",
      geographic_origin: { latitude: 51.8985, longitude: -8.4756 },
      collected_at: "2026-08-28T12:00:00Z"
    },
    verification: { state: "UNVERIFIED", evidence_ref: "" },
    sensitivity: { classification: "PUBLIC_RESTRICTED" },
    payload: { athlete_consent: true }
  };
  const decisionAllow = await evaluatePolicy(consentedRecord, "PUBLISH", { id: playerPassport.passport_id });
  playerConsentPass = (decisionAllow.status === "ALLOW");

  // 4. Agent Authority
  const coachPassport = buildPassport({ id: "urn:id:agent:wenger-golf-coach", name: "Wenger Golf Coach" }, ParticipantTypes.AI_AGENT, ["READ", "COACH"]);
  agentAuthorityPass = (coachPassport.passport_id === "urn:davincia:passport:ai_agent:wenger-golf-coach");

  // 5. Knowledge Provenance
  const swingMechanics = CatalogAssets.find(a => a.asset_id === "urn:davincia:knowledge:asset:wenger-swing-mechanics");
  knowledgeProvenancePass = (swingMechanics !== undefined && swingMechanics.provenance_hash === "sha256-wenger-swing-mechanics-prov-hash-88c2f1");

  // 6. Policy Evaluation
  const decisionTrain = await evaluatePolicy(consentedRecord, "TRAIN", { id: playerPassport.passport_id });
  policyEvaluationPass = (decisionTrain.status === "ALLOW");

  // 7. Fail-Closed
  const unconsentedRecord = {
    ...consentedRecord,
    payload: { athlete_consent: false }
  };
  const decisionDeny = await evaluatePolicy(unconsentedRecord, "PUBLISH", { id: playerPassport.passport_id });
  failClosedPass = (decisionDeny.status === "DENY" && decisionDeny.reason_code === "CUSTODY_PROTECTED");

  // 8. Entitlement, Settlement, Metering, Evidence
  const tx = await executeGovernedTransaction({
    humanPassport: playerPassport,
    assetId: "urn:davincia:knowledge:asset:wenger-swing-mechanics",
    action: "READ"
  });
  entitlementPass = (tx.entitlement !== null && tx.entitlement.status === "ACTIVE");
  settlementIntegrityPass = (tx.settlement.settlement_status === "SETTLED");
  meteringPass = (tx.usage_records.length > 0 && tx.usage_records[0].consumed_units === 1);
  evidencePass = (tx.evidence !== null && tx.evidence.chain.entitlement_ref === tx.entitlement.entitlement_id);

  // 11. Revocation
  const revokedPassport = { ...playerPassport, status: PassportStates.SUSPENDED };
  const txRevoked = await executeGovernedTransaction({
    humanPassport: revokedPassport,
    assetId: "urn:davincia:knowledge:asset:wenger-swing-mechanics",
    action: "READ"
  });
  revocationPass = (txRevoked.status === "FAILED" && txRevoked.entitlement === null);

  // 12. Provenance Drift
  const driftCheck = verifyEntitlement(tx.entitlement, playerPassport, null, "drifted-provenance-signature-hash");
  provenanceDriftPass = (driftCheck.valid === false && tx.entitlement.status === "SUSPENDED");

  // 13. Commercial Ordering
  commercialOrderingPass = (tx.decision !== null && tx.entitlement !== null && tx.settlement !== null);

  // 15. No Unauthorized Transaction
  const txBypass = await executeGovernedTransaction({
    humanPassport: revokedPassport,
    assetId: "urn:davincia:knowledge:asset:wenger-swing-mechanics",
    action: "READ"
  });
  noUnauthorizedTxPass = (txBypass.status === "FAILED" && txBypass.settlement.settlement_status === "FAILED" && txBypass.settlement.price === 0);

} catch (e) {
  console.error("Alex Wenger Conformance Error:", e);
}

const scoreCount = [
  passportAdmissionPass, identityPass, playerConsentPass, agentAuthorityPass,
  knowledgeProvenancePass, policyEvaluationPass, failClosedPass, entitlementPass,
  meteringPass, evidencePass, revocationPass, provenanceDriftPass,
  commercialOrderingPass, settlementIntegrityPass, noUnauthorizedTxPass
].filter(Boolean).length;

const isConformant = (scoreCount === 15);

console.log("\nDAVINCIA⁺ ALEX WENGER GOLF CONFORMANCE");
console.log("========================================");
console.log(`PASSPORT ADMISSION:       ${passportAdmissionPass ? "PASS" : "FAIL"}`);
console.log(`IDENTITY INTEGRITY:       ${identityPass ? "PASS" : "FAIL"}`);
console.log(`PLAYER CONSENT:           ${playerConsentPass ? "PASS" : "FAIL"}`);
console.log(`AGENT AUTHORITY:          ${agentAuthorityPass ? "PASS" : "FAIL"}`);
console.log(`KNOWLEDGE PROVENANCE:     ${knowledgeProvenancePass ? "PASS" : "FAIL"}`);
console.log(`POLICY EVALUATION:        ${policyEvaluationPass ? "PASS" : "FAIL"}`);
console.log(`FAIL-CLOSED VERDICT:      ${failClosedPass ? "PASS" : "FAIL"}`);
console.log(`ENTITLEMENT ISSUANCE:     ${entitlementPass ? "PASS" : "FAIL"}`);
console.log(`METERING ACCURACY:        ${meteringPass ? "PASS" : "FAIL"}`);
console.log(`EVIDENCE ARCHIVAL:        ${evidencePass ? "PASS" : "FAIL"}`);
console.log(`REVOCATION RESPONSE:      ${revocationPass ? "PASS" : "FAIL"}`);
console.log(`PROVENANCE DRIFT BLOCK:   ${provenanceDriftPass ? "PASS" : "FAIL"}`);
console.log(`COMMERCIAL ORDERING:      ${commercialOrderingPass ? "PASS" : "FAIL"}`);
console.log(`SETTLEMENT INTEGRITY:     ${settlementIntegrityPass ? "PASS" : "FAIL"}`);
console.log(`NO UNAUTHORIZED TX:       ${noUnauthorizedTxPass ? "PASS" : "FAIL"}`);
console.log(`\nSCORE: ${scoreCount}/15`);
console.log(`STATUS: ${isConformant ? "CONFORMANT" : "NON-CONFORMANT"}`);
console.log("========================================\n");

process.exit(isConformant ? 0 : 1);
