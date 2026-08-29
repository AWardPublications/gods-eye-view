import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateEnvelope } from '../src/governance/validate.js';
import { evaluatePolicy } from '../src/governance/evaluate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const recordsPath = path.join(__dirname, '../public/corklan_records.json');

console.log("==================================================");
console.log("DaVinciA+ / CorkLan Ecosystem Governance Gate v1.1");
console.log("==================================================");

if (!fs.existsSync(recordsPath)) {
  console.error(`ERROR: Records database not found at ${recordsPath}`);
  process.exit(1);
}

const records = JSON.parse(fs.readFileSync(recordsPath, 'utf8'));
let invalidCount = 0;

async function runValidationPipeline() {
  console.log(`Ingesting ${records.length} governed records...`);
  const actor = { id: "urn:davincia:identity:system:ci-runner", class: "SYSTEM" };

  for (let i = 0; i < records.length; i++) {
    const envelope = records[i];
    const phrase = envelope.payload?.phrase || "unknown";
    
    // Gate 1: Structural Validation
    const validation = validateEnvelope(envelope);
    if (!validation.valid) {
      invalidCount++;
      console.error(`\n❌ Gate 1 (Structure) FAILED for record #${i + 1} ("${phrase}"):`);
      validation.errors.forEach(err => console.error(`   - ${err}`));
      continue;
    }

    // Gate 2: Policy Evaluation Checks
    const translateDecision = await evaluatePolicy(envelope, "TRANSLATE", actor);
    const publishDecision = await evaluatePolicy(envelope, "PUBLISH", actor);

    // Fail-Closed sanity check for SENSITIVE_HOLD
    if (envelope.sensitivity?.classification === "SENSITIVE_HOLD") {
      if (translateDecision.status !== "DENY" || publishDecision.status !== "DENY") {
        invalidCount++;
        console.error(`\n❌ Gate 2 (Policy) FAILED for record #${i + 1} ("${phrase}"):`);
        console.error(`   - SENSITIVE_HOLD record allowed translation or publication!`);
        continue;
      }
    }

    console.log(`✅ Record #${i + 1} ("${phrase}"):`);
    console.log(`   - Object URN: ${envelope.object_id}`);
    console.log(`   - Lifecycle:  ${envelope.lifecycle_state}`);
    console.log(`   - Translation: ${translateDecision.status} (Policy: ${translateDecision.policy_id}, Reason: ${translateDecision.reason_code})`);
    console.log(`   - Publication: ${publishDecision.status} (Policy: ${publishDecision.policy_id}, Reason: ${publishDecision.reason_code})`);
  }

  if (invalidCount > 0) {
    console.error(`\n❌ Validation FAILED: ${invalidCount} of ${records.length} records failed the governance gate.`);
    process.exit(1);
  } else {
    console.log("\n✅ SUCCESS: All records verified by the DaVinciA+ Governance Gate!");
    process.exit(0);
  }
}

runValidationPipeline().catch(err => {
  console.error("Pipeline crash:", err);
  process.exit(1);
});
