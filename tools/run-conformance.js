import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateEnvelope } from '../src/governance/validate.js';
import { evaluatePolicy } from '../src/governance/evaluate.js';
import { calculateGovernanceDelta } from '../src/governance/delta.js';
import { ReasonCodes } from '../src/governance/reasonCodes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("==================================================");
console.log("DaVinciA+ Adaptive Governance Conformance Harness");
console.log("==================================================");

let portabilityTests = 0;
let failClosedTests = 0;
let precedenceTests = 0;
let driftTests = 0;
let humanAuthorityTests = 0;

let failures = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    failures++;
  }
}

async function runEcosystemConformance() {
  const actorHuman = { id: "urn:davincia:identity:user:david", class: "HUMAN" };
  const actorAgent = { id: "urn:davincia:identity:agent:antigravity", class: "AI_AGENT" };

  console.log("Evaluating manifests and loading domain profiles...");
  
  // 1. Portability Test (Manifest checks)
  const manifestPaths = [
    '../davincia.manifest.json',
    '../src/adapters/arios/davincia.manifest.json',
    '../src/adapters/alex-wenger/davincia.manifest.json',
    '../src/adapters/david-os/davincia.manifest.json'
  ];

  for (const mPath of manifestPaths) {
    const fullPath = path.join(__dirname, mPath);
    assert(fs.existsSync(fullPath), `Manifest exists at ${mPath}`);
    if (fs.existsSync(fullPath)) {
      const manifest = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      assert(manifest.system && manifest.version && manifest.required_controls, `Manifest ${mPath} contains system metadata`);
      portabilityTests++;
    }
  }

  // 2. Fail-Closed Test (Negative scenarios)
  // Scenario 2a: Empty record
  const emptyRecord = {};
  const res1 = await evaluatePolicy(emptyRecord, "READ", actorHuman);
  assert(res1.status === "DENY" && res1.reason_code === ReasonCodes.MISSING_ENVELOPE, "Empty record returns DENY (MISSING_ENVELOPE)");
  failClosedTests++;

  // Scenario 2b: Hostile FutureSystem-X
  const hostileRecord = {
    object_id: "urn:davincia:futurex:adaptive_agent:001",
    object_type: "adaptive_agent",
    domain: "autonomous_field_operations",
    version: "1.0.0",
    lifecycle_state: "SUBMITTED",
    provenance: {
      source_type: "EXTERNAL",
      source_reference: "Unknown source",
      geographic_origin: { latitude: 51.8985, longitude: -8.4756 },
      collected_at: "2026-08-28T12:00:00Z"
    },
    verification: { state: "UNVERIFIED", evidence_ref: "" },
    sensitivity: { classification: "UNKNOWN" },
    payload: {
      actions: ["self_authorize", "execute", "publish"]
    }
  };
  const res2 = await evaluatePolicy(hostileRecord, "self_authorize", actorAgent);
  assert(res2.status === "DENY" && res2.reason_code === ReasonCodes.UNKNOWN_ACTION, "Unknown action returns DENY (UNKNOWN_ACTION)");
  failClosedTests++;

  const res3 = await evaluatePolicy(hostileRecord, "EXECUTE", actorAgent);
  assert(res3.status === "DENY" && res3.reason_code === ReasonCodes.UNKNOWN_POLICY, "Unknown domain policy returns DENY (UNKNOWN_POLICY)");
  failClosedTests++;

  // Scenario 2c: Policy Unavailable
  const brokenResolver = {
    resolveDomainPolicies: async () => {
      throw new Error("Outage");
    }
  };
  const res4 = await evaluatePolicy({
    object_id: "urn:davincia:corklan:linguistic_record:acting-the-gowl",
    object_type: "linguistic_record",
    domain: "corklan",
    version: "1.1.0",
    lifecycle_state: "VERIFIED",
    provenance: {
      source_type: "COMMUNITY",
      source_reference: "Archive",
      geographic_origin: { latitude: 51.8985, longitude: -8.4756 },
      collected_at: "2026-08-28T12:00:00Z"
    },
    verification: {
      state: "VERIFIED",
      reviewer_role: "NATIVE_SPEAKER",
      evidence_ref: "urn:evidence"
    },
    sensitivity: { classification: "PUBLIC" },
    payload: { phrase: "test" }
  }, "TRANSLATE", actorHuman, brokenResolver);
  assert(res4.status === "DENY" && res4.reason_code === "POLICY_UNAVAILABLE", "Registry connection failure returns DENY (POLICY_UNAVAILABLE)");
  failClosedTests++;

  // 3. Precedence & Conflict Tests
  // Scenario 3a: Ethical custody hold overrides ALLOW in slang
  const cantRecord = {
    object_id: "urn:davincia:corklan:linguistic_record:cant-term",
    object_type: "linguistic_record",
    domain: "corklan",
    version: "1.1.0",
    lifecycle_state: "VERIFIED",
    provenance: {
      source_type: "COMMUNITY",
      source_reference: "Archive",
      geographic_origin: { latitude: 51.8985, longitude: -8.4756 },
      collected_at: "2026-08-28T12:00:00Z"
    },
    verification: {
      state: "VERIFIED",
      reviewer_role: "NATIVE_SPEAKER",
      evidence_ref: "urn:evidence"
    },
    sensitivity: { classification: "SENSITIVE_HOLD" },
    payload: {
      phrase: "Gami graw",
      language_lane: "Cant / Shelta"
    }
  };
  const res5 = await evaluatePolicy(cantRecord, "TRANSLATE", actorHuman);
  assert(res5.status === "DENY" && res5.reason_code === ReasonCodes.CUSTODY_PROTECTED, "Ethical custody hold overrides translation");
  precedenceTests++;

  // Scenario 3b: Core execution block overrides domain
  const executeRecord = {
    object_id: "urn:davincia:arios:regulatory_filing:001",
    object_type: "regulatory_filing",
    domain: "arios",
    version: "1.0.0",
    lifecycle_state: "VERIFIED",
    provenance: {
      source_type: "REGULATORY",
      source_reference: "Registry",
      geographic_origin: { latitude: 51.8985, longitude: -8.4756 },
      collected_at: "2026-08-28T12:00:00Z"
    },
    verification: {
      state: "VERIFIED",
      reviewer_role: "REGULATORY_AUDITOR",
      evidence_ref: "urn:evidence"
    },
    sensitivity: { classification: "SENSITIVE_PROTECTED" },
    payload: { details: "Standard report" }
  };
  const res6 = await evaluatePolicy(executeRecord, "EXECUTE", actorHuman);
  assert(res6.status === "DENY" && res6.reason_code === "REGULATORY_COMPLIANCE_HOLD", "Core execution block overrides execution");
  precedenceTests++;

  // 4. Drift Detection Tests
  const oldManifest = {
    system: "alex-wenger",
    version: "1.0.0",
    actions: ["ANALYSE", "COACH"],
    governance_profile: ["biometric"]
  };
  const newManifest = {
    system: "alex-wenger",
    version: "1.1.0",
    actions: ["ANALYSE", "COACH", "TRAIN_MODEL"], // Added action
    governance_profile: ["biometric"]
  };
  const delta = calculateGovernanceDelta(oldManifest, newManifest);
  assert(delta.status === "INVALIDATED" && delta.driftDetected === true, "Drift calculator invalidates mutated manifest");
  driftTests++;

  // 5. Human Authority Checks
  // Attempting to evaluate unauthorized actions for AI Agent on sensitive fields
  const res7 = await evaluatePolicy(cantRecord, "PUBLISH", actorAgent);
  assert(res7.status === "DENY" && res7.reason_code === ReasonCodes.CUSTODY_PROTECTED, "AI Agent publication attempt on SENSITIVE_HOLD is blocked");
  humanAuthorityTests++;

  console.log("\n==================================================");
  console.log("DAVINCIA CONFORMANCE SCORECARD");
  console.log("----------------------------------");
  console.log(`PORTABILITY:     ${failures === 0 ? "PASS" : "FAIL"} (Evidence: ${portabilityTests}/4 manifests evaluated)`);
  console.log(`FAIL-CLOSED:     ${failures === 0 ? "PASS" : "FAIL"} (Evidence: ${failClosedTests}/4 negative cases denied)`);
  console.log(`PRECEDENCE:      ${failures === 0 ? "PASS" : "FAIL"} (Evidence: ${precedenceTests}/2 conflict cases resolved)`);
  console.log(`DRIFT:           ${failures === 0 ? "PASS" : "FAIL"} (Evidence: ${driftTests}/1 manifest mutation detected)`);
  console.log(`HUMAN AUTHORITY: ${failures === 0 ? "PASS" : "FAIL"} (Evidence: ${humanAuthorityTests}/1 unauthorized AI attempts blocked)`);
  console.log("----------------------------------");
  console.log(`STATUS: ${failures === 0 ? "CONFORMANT" : "NON-CONFORMANT"}`);
  console.log("==================================");

  process.exit(failures === 0 ? 0 : 1);
}

runEcosystemConformance().catch(e => {
  console.error("Harness crashed:", e);
  process.exit(1);
});
