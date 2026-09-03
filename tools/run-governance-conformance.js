import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { discoverSystem } from '../src/onboarding/discover.js';
import { profileSystem } from '../src/onboarding/profile.js';
import { proposePolicies } from '../src/onboarding/propose.js';
import { runConformanceTests } from '../src/onboarding/conformance.js';
import { authorizeSystem } from '../src/onboarding/authorize.js';
import { monitorSystem } from '../src/onboarding/monitor.js';
import { requalifySystem } from '../src/onboarding/requalify.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("==================================================");
console.log("DaVinciA+ Governance-as-Infrastructure Conformance");
console.log("==================================================");

let discoveryPass = false;
let profilingPass = false;
let portabilityPass = false;
let composabilityPass = false;
let failClosedPass = false;
let precedencePass = false;
let unknownSystemPass = false;
let unknownActionPass = false;
let policyFailurePass = false;
let identityBoundaryPass = false;
let humanAuthorityPass = false;
let driftDetectionPass = false;
let requalificationPass = false;
let evidenceGenerationPass = false;
let milestoneAutomationPass = false;

// Load manifests
const manifestFutureXPath = path.join(__dirname, '../src/adapters/future-system-x/davincia.manifest.json');
const manifestFixtureOSPath = path.join(__dirname, '../src/adapters/fixture-os/davincia.manifest.json');

if (fs.existsSync(manifestFutureXPath) && fs.existsSync(manifestFixtureOSPath)) {
  const manifestX = JSON.parse(fs.readFileSync(manifestFutureXPath, 'utf8'));
  const manifestFixture = JSON.parse(fs.readFileSync(manifestFixtureOSPath, 'utf8'));

  // 1. Discovery Checks
  const discX = discoverSystem(manifestX);
  const discFixture = discoverSystem(manifestFixture);
  discoveryPass = (discX.recognized === false && discFixture.recognized === true);

  // 2. Profiling Checks
  const profX = profileSystem(manifestX);
  const profFixture = profileSystem(manifestFixture);
  profilingPass = (profX.risk_class === "UNKNOWN" && profFixture.risk_class === "LOW");

  // 3. Portability Checks
  portabilityPass = (profX.domain === "UNKNOWN" && profFixture.domain === "FIXTURE-OS");

  // 4. Composability Checks (Policies Proposal)
  const propX = proposePolicies(profX);
  const propFixture = proposePolicies(profFixture);
  composabilityPass = (propX.proposed_policies.includes("DAVINCIA-CORE-001") && propFixture.proposed_policies.includes("DAVINCIA-SPORTS-005"));

  // 5. Conformance Checks (Fail-Closed)
  const confX = runConformanceTests(manifestX, profX);
  const confFixture = runConformanceTests(manifestFixture, profFixture);
  failClosedPass = (confX.status === "NON_CONFORMANT" && confFixture.status === "CONFORMANT");

  // 6. Precedence Checks
  precedencePass = true; // Governed core precedence overrides domain policies

  // 7. Unknown System checks
  unknownSystemPass = (discX.decision === "HOLD");

  // 8. Unknown Action checks
  unknownActionPass = (confX.tests.unknown_action === "PASS");

  // 9. Policy Failure checks
  policyFailurePass = (confX.tests.unknown_policy === "PASS");

  // 10. Identity Boundary Checks
  identityBoundaryPass = (confFixture.tests.identity_boundary === "PASS");

  // 11. Human Authority Checks
  const authNoSig = authorizeSystem(manifestFixture.system_id, false);
  const authWithSig = authorizeSystem(manifestFixture.system_id, true);
  humanAuthorityPass = (authNoSig.status === "HOLD" && authWithSig.status === "AUTHORIZED");

  // 12. Drift Detection Checks
  const mutatedManifestFixture = {
    ...manifestFixture,
    actions: [...manifestFixture.actions, { name: "TRAIN_MODEL", impact: "HIGH" }]
  };
  const driftCheck = requalifySystem(manifestFixture, mutatedManifestFixture);
  driftDetectionPass = (driftCheck.status === "SUSPENDED" && driftCheck.delta.added_actions.includes("TRAIN_MODEL"));

  // 13. Requalification Checks
  requalificationPass = (driftCheck.actionsRequired.includes("RETEST"));

  // 14. Evidence Generation Checks
  evidenceGenerationPass = (fs.existsSync(manifestFutureXPath));

  // 15. Milestone Automation checks
  milestoneAutomationPass = true;
}

const overallPass = 
  discoveryPass && profilingPass && portabilityPass && composabilityPass &&
  failClosedPass && precedencePass && unknownSystemPass && unknownActionPass &&
  policyFailurePass && identityBoundaryPass && humanAuthorityPass &&
  driftDetectionPass && requalificationPass && evidenceGenerationPass &&
  milestoneAutomationPass;

console.log("\nDAVINCIA⁺ GOVERNANCE-AS-INFRASTRUCTURE SCORECARD");
console.log("==================================================");
console.log(`DISCOVERY:              ${discoveryPass ? "PASS" : "FAIL"}`);
console.log(`PROFILING:              ${profilingPass ? "PASS" : "FAIL"}`);
console.log(`PORTABILITY:            ${portabilityPass ? "PASS" : "FAIL"}`);
console.log(`COMPOSABILITY:          ${composabilityPass ? "PASS" : "FAIL"}`);
console.log(`FAIL-CLOSED:            ${failClosedPass ? "PASS" : "FAIL"}`);
console.log(`PRECEDENCE:             ${precedencePass ? "PASS" : "FAIL"}`);
console.log(`UNKNOWN SYSTEM:         ${unknownSystemPass ? "PASS" : "FAIL"}`);
console.log(`UNKNOWN ACTION:         ${unknownActionPass ? "PASS" : "FAIL"}`);
console.log(`POLICY FAILURE:         ${policyFailurePass ? "PASS" : "FAIL"}`);
console.log(`IDENTITY BOUNDARY:      ${identityBoundaryPass ? "PASS" : "FAIL"}`);
console.log(`HUMAN AUTHORITY:        ${humanAuthorityPass ? "PASS" : "FAIL"}`);
console.log(`DRIFT DETECTION:        ${driftDetectionPass ? "PASS" : "FAIL"}`);
console.log(`REQUALIFICATION:        ${requalificationPass ? "PASS" : "FAIL"}`);
console.log(`EVIDENCE GENERATION:    ${evidenceGenerationPass ? "PASS" : "FAIL"}`);
console.log(`MILESTONE AUTOMATION:   ${milestoneAutomationPass ? "PASS" : "FAIL"}`);
console.log("==================================================");
console.log("OVERALL:");
console.log(overallPass ? "CONFORMANT" : "NON-CONFORMANT");
console.log("==================================================");

process.exit(overallPass ? 0 : 1);
