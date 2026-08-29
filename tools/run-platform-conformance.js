import { issuePassport, verifyPassport } from '../src/platform/client.js';

console.log("==================================================");
console.log("DaVinciA+ Platform Foundation Conformance (v0.4)");
console.log("==================================================");

let passportCreationPass = false;
let capabilityCheckPass = false;
let expirationGatePass = false;
let unverifiedBlockPass = false;
let coreEvaluationPass = false;
let passPortabilityPass = false;

try {
  // 1. Passport creation
  const identity = { id: "urn:davincia:identity:system:test", name: "Test System", type: "SYSTEM" };
  const passport = issuePassport(identity, ["READ", "TRANSLATE"]);
  passportCreationPass = (passport.passport_id !== undefined && passport.signature !== undefined);
  passPortabilityPass = (passport.identity.type === "SYSTEM");

  // 2. Capability check
  const actor = { id: "urn:davincia:identity:user:david", class: "HUMAN" };
  const d1 = await verifyPassport(passport, "TRANSLATE", actor);
  coreEvaluationPass = (d1.status !== undefined);

  const d2 = await verifyPassport(passport, "PUBLISH", actor); // PUBLISH is not in capabilities
  capabilityCheckPass = (d2.status === "DENY" && d2.reason_code === "INSUFFICIENT_CAPABILITIES");

  // 3. Expiration Gate
  const expiredPassport = issuePassport(identity, ["READ"]);
  expiredPassport.expires_at = new Date(Date.now() - 5000).toISOString();
  const d3 = await verifyPassport(expiredPassport, "READ", actor);
  expirationGatePass = (d3.status === "DENY" && d3.reason_code === "PASSPORT_EXPIRED");

  // 4. Unverified Block
  const unverifiedPassport = issuePassport(identity, ["READ"], null, "UNVERIFIED");
  const d4 = await verifyPassport(unverifiedPassport, "READ", actor);
  unverifiedBlockPass = (d4.status === "DENY" && d4.reason_code === "UNVERIFIED_PASSPORT");

} catch (e) {
  console.error("Platform conformance check error:", e);
}

const overallPass = passportCreationPass && capabilityCheckPass && expirationGatePass && unverifiedBlockPass && coreEvaluationPass && passPortabilityPass;

console.log("\nDAVINCIA⁺ PLATFORM CONFORMANCE SCORECARD");
console.log("==================================================");
console.log(`PASSPORT CREATION:      ${passportCreationPass ? "PASS" : "FAIL"}`);
console.log(`CAPABILITY CHECK:       ${capabilityCheckPass ? "PASS" : "FAIL"}`);
console.log(`EXPIRATION GATE:        ${expirationGatePass ? "PASS" : "FAIL"}`);
console.log(`UNVERIFIED BLOCK:       ${unverifiedBlockPass ? "PASS" : "FAIL"}`);
console.log(`CORE EVALUATION:        ${coreEvaluationPass ? "PASS" : "FAIL"}`);
console.log(`PASS PORTABILITY:       ${passPortabilityPass ? "PASS" : "FAIL"}`);
console.log("==================================================");
console.log("OVERALL STATUS:");
console.log(overallPass ? "PLATFORM FOUNDATION ENGINEERING PROOF (PASS)" : "NON-CONFORMANT");
console.log("==================================================");

process.exit(overallPass ? 0 : 1);
