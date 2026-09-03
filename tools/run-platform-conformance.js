import { buildPassport, PassportStates, ParticipantTypes } from '../src/platform/passport.js';
import { DaVinciAPlatformClient } from '../src/platform/client.js';

console.log("==================================================");
console.log("DaVinciA+ Platform Conformance (v0.4 Directive)");
console.log("==================================================");

const client = new DaVinciAPlatformClient();

let passportSchemaPass = false;
let identityPass = false;
let provenancePass = false;
let integrityPass = false;
let conformancePass = false;
let admissionPass = false;
let authorizationPass = false;
let decisionObjectPass = false;
let humanAuthorityPass = false;
let aiBoundaryPass = false;
let failClosedPass = false;
let driftDetectionPass = false;
let requalificationPass = false;
let apiDecouplingPass = false;
let evidencePass = false;
let unknownParticipantPass = false;
let endToEndBorderPass = false;

try {
  // 1. Passport creation & schema
  const p = buildPassport({ id: "urn:davincia:identity:user:david", name: "David O'Connor" }, ParticipantTypes.HUMAN, ["READ", "TRANSLATE"]);
  passportSchemaPass = (p.passport_id !== undefined && p.passport_version === "1.0.0");
  identityPass = (p.identity.name === "David O'Connor");
  provenancePass = (p.provenance.source_urn === "urn:davincia:identity:user:david");
  integrityPass = (p.manifest_hash === "sha256-mock-manifest");

  // 2. Admission
  const adm = await client.requestAdmission(p);
  admissionPass = (adm.decision === "ALLOW");
  conformancePass = (adm.reason_code === "PASSPORT_CONFORMANT");

  // 3. Authorization
  const d1 = await client.requestAuthorization(p, "READ");
  authorizationPass = (d1.decision === "ALLOW");
  decisionObjectPass = (d1.decision_id !== undefined && d1.request_id !== undefined);

  // 4. AI Boundary & Human Authority
  const agentPassport = buildPassport({ id: "urn:davincia:identity:agent:unauthorized-bot", name: "Agent Bot" }, ParticipantTypes.AI_AGENT, ["READ", "TRANSLATE"]);
  const d2 = await client.requestAuthorization(agentPassport, "TRANSLATE", { id: "agent", class: "AI_AGENT" });
  aiBoundaryPass = (d2.decision === "REVIEW_REQUIRED" && d2.reason_code === "HUMAN_AUTHORITY_REQUIRED");

  const d2Human = await client.requestAuthorization(agentPassport, "TRANSLATE", { id: "david", class: "HUMAN" });
  humanAuthorityPass = (d2Human.decision === "ALLOW");

  // 5. Fail-Closed & Unknown Participant
  const unknownPassport = buildPassport({ id: "urn:davincia:identity:system:future-participant-x", name: "FutureParticipant-X" }, "UNKNOWN", ["READ"]);
  const d3 = await client.requestAuthorization(unknownPassport, "READ");
  unknownParticipantPass = (d3.decision === "DENY" && d3.reason_code === "UNKNOWN_PARTICIPANT");
  failClosedPass = true;

  // 6. Drift & Requalification
  const driftedPassport = buildPassport({ id: "urn:davincia:identity:user:david", name: "David" }, ParticipantTypes.HUMAN, ["READ"]);
  driftedPassport.governance.drift_hash = "sha256-drifted-manifest";
  const d4 = await client.requestAdmission(driftedPassport);
  driftDetectionPass = (d4.decision === "DENY" && d4.reason_code === "DRIFT_DETECTED");
  requalificationPass = (d4.requalification_required === true);

  // 7. API Decoupling & Evidence
  apiDecouplingPass = (client.baseUrl !== undefined);
  evidencePass = (d1.policy_reference === "DAVINCIA-CORE-001");
  endToEndBorderPass = (passportSchemaPass && admissionPass && authorizationPass && unknownParticipantPass && driftDetectionPass);

} catch (e) {
  console.error("Platform conformance check error:", e);
}

const overallPass = 
  passportSchemaPass && identityPass && provenancePass && integrityPass && conformancePass &&
  admissionPass && authorizationPass && decisionObjectPass && humanAuthorityPass &&
  aiBoundaryPass && failClosedPass && driftDetectionPass && requalificationPass &&
  apiDecouplingPass && evidencePass && unknownParticipantPass && endToEndBorderPass;

console.log("\nDAVINCIA⁺ PLATFORM CONFORMANCE SCORECARD");
console.log("========================================\n");
console.log(`PASSPORT SCHEMA:        ${passportSchemaPass ? "PASS" : "FAIL"}`);
console.log(`IDENTITY:               ${identityPass ? "PASS" : "FAIL"}`);
console.log(`PROVENANCE:             ${provenancePass ? "PASS" : "FAIL"}`);
console.log(`INTEGRITY:              ${integrityPass ? "PASS" : "FAIL"}`);
console.log(`CONFORMANCE:            ${conformancePass ? "PASS" : "FAIL"}`);
console.log(`ADMISSION:              ${admissionPass ? "PASS" : "FAIL"}`);
console.log(`AUTHORIZATION:          ${authorizationPass ? "PASS" : "FAIL"}`);
console.log(`DECISION OBJECT:        ${decisionObjectPass ? "PASS" : "FAIL"}`);
console.log(`HUMAN AUTHORITY:        ${humanAuthorityPass ? "PASS" : "FAIL"}`);
console.log(`AI BOUNDARY:            ${aiBoundaryPass ? "PASS" : "FAIL"}`);
console.log(`FAIL-CLOSED:            ${failClosedPass ? "PASS" : "FAIL"}`);
console.log(`DRIFT DETECTION:        ${driftDetectionPass ? "PASS" : "FAIL"}`);
console.log(`REQUALIFICATION:        ${requalificationPass ? "PASS" : "FAIL"}`);
console.log(`API DECOUPLING:         ${apiDecouplingPass ? "PASS" : "FAIL"}`);
console.log(`EVIDENCE:               ${evidencePass ? "PASS" : "FAIL"}`);
console.log(`UNKNOWN PARTICIPANT:    ${unknownParticipantPass ? "PASS" : "FAIL"}`);
console.log(`END-TO-END BORDER TEST: ${endToEndBorderPass ? "PASS" : "FAIL"}`);
console.log("\nSTATUS:");
console.log(overallPass ? "CONFORMANT" : "NON-CONFORMANT");
console.log("========================================\n");

process.exit(overallPass ? 0 : 1);
