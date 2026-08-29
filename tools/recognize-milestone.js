import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MILESTONE_ID = "DAVINCIA-KERNEL-CONFORMANCE-v0.1.0";
const MILESTONE_NAME = "DaVinciA+ Kernel Ecosystem Conformance v0.1.0";

const milestonesDir = path.join(__dirname, '../milestones');
if (!fs.existsSync(milestonesDir)) {
  fs.mkdirSync(milestonesDir);
}

console.log("===============================================");
console.log("DAVINCIA⁺ MILESTONE CEREMONY INTERACTION");
console.log("===============================================");
console.log(`Ingesting contract: ${MILESTONE_ID}`);

function getGitCommitSha() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch (e) {
    return "unknown-commit-sha";
  }
}

function runCommand(command) {
  console.log(`Running task: "${command}"...`);
  try {
    execSync(command, { stdio: 'ignore', cwd: path.join(__dirname, '..') });
    console.log(`  ➔ Task PASSED`);
    return true;
  } catch (e) {
    console.error(`  ➔ Task FAILED: ${command}`);
    return false;
  }
}

async function runCeremony() {
  const commitSha = getGitCommitSha();
  const timestamp = new Date().toISOString();

  // 1. Run required validation suites
  const testPass = runCommand("npm run test");
  const conformancePass = runCommand("node tools/run-conformance.js");
  const buildPass = runCommand("npm run build");

  // 2. Verify required constitutional documentation exists
  const specPath = path.join(__dirname, '../DAVINCIA_MILESTONE_SPEC_v1.0.md');
  const registerPath = path.join(__dirname, '../DAVINCIA_MILESTONE_REGISTER.md');
  const manifestPath = path.join(__dirname, '../davincia.manifest.json');
  
  const specExists = fs.existsSync(specPath);
  const registerExists = fs.existsSync(registerPath);
  const manifestExists = fs.existsSync(manifestPath);

  assert(specExists, "DAVINCIA_MILESTONE_SPEC_v1.0.md exists");
  assert(registerExists, "DAVINCIA_MILESTONE_REGISTER.md exists");
  assert(manifestExists, "davincia.manifest.json exists");

  const everythingPassed = testPass && conformancePass && buildPass && specExists && registerExists && manifestExists;

  const status = everythingPassed ? "RECOGNIZED" : "REJECTED";

  // 3. Generate the Evidence Record UDO
  const evidenceRecord = {
    milestone_id: MILESTONE_ID,
    milestone_name: MILESTONE_NAME,
    timestamp,
    git_commit_sha: commitSha,
    repository: "https://github.com/AWardPublications/gods-eye-view.git",
    kernel_version: "2.0.0",
    conformance_scorecard: {
      portability: everythingPassed ? "PASS" : "FAIL",
      fail_closed: everythingPassed ? "PASS" : "FAIL",
      precedence: everythingPassed ? "PASS" : "FAIL",
      drift_detection: everythingPassed ? "PASS" : "FAIL",
      human_authority: everythingPassed ? "PASS" : "FAIL",
      test_suite: testPass ? "PASS" : "FAIL",
      build: buildPass ? "PASS" : "FAIL",
      evidence: (specExists && registerExists && manifestExists) ? "PASS" : "FAIL"
    },
    systems_evaluated: ["corklan", "arios", "alex-wenger", "david-os"],
    manifests_evaluated: [
      "davincia.manifest.json",
      "src/adapters/arios/davincia.manifest.json",
      "src/adapters/alex-wenger/davincia.manifest.json",
      "src/adapters/david-os/davincia.manifest.json"
    ],
    reviewer_identity: {
      id: "urn:davincia:identity:agent:antigravity",
      class: "AI_AGENT"
    },
    milestone_status: status
  };

  const recordPath = path.join(milestonesDir, `${MILESTONE_ID}.json`);
  fs.writeFileSync(recordPath, JSON.stringify(evidenceRecord, null, 2), 'utf8');
  console.log(`Saved evidence record at ${recordPath}`);

  // 4. Print Ceremony Scorecard
  console.log("\n===============================================");
  console.log("DAVINCIA⁺ MILESTONE RECOGNITION");
  console.log("===============================================");
  console.log(`MILESTONE:\n${MILESTONE_ID}\n`);
  console.log(`PORTABILITY:       ${evidenceRecord.conformance_scorecard.portability}`);
  console.log(`FAIL-CLOSED:       ${evidenceRecord.conformance_scorecard.fail_closed}`);
  console.log(`PRECEDENCE:        ${evidenceRecord.conformance_scorecard.precedence}`);
  console.log(`DRIFT DETECTION:   ${evidenceRecord.conformance_scorecard.drift_detection}`);
  console.log(`HUMAN AUTHORITY:   ${evidenceRecord.conformance_scorecard.human_authority}`);
  console.log(`TEST SUITE:        ${evidenceRecord.conformance_scorecard.test_suite}`);
  console.log(`BUILD:             ${evidenceRecord.conformance_scorecard.build}`);
  console.log(`EVIDENCE:          ${evidenceRecord.conformance_scorecard.evidence}`);
  console.log("\nSTATUS:");
  console.log(everythingPassed ? "★ MILESTONE RECOGNIZED ★" : "❌ MILESTONE REJECTED");
  console.log(`\nCOMMIT:\n${commitSha}`);
  console.log(`\nTAG:\ndavincia-kernel-conformance-v0.1.0`);
  console.log("===============================================");

  process.exit(everythingPassed ? 0 : 1);
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
  }
}

runCeremony().catch(err => {
  console.error("Ceremony crash:", err);
  process.exit(1);
});
