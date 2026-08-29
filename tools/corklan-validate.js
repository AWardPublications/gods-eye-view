import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const recordsPath = path.join(__dirname, '../public/corklan_records.json');
const schemaPath = path.join(__dirname, '../public/corklan_entry_schema.json');

console.log("--------------------------------------------------");
console.log("DaVinciA+ / CorkLan Schema & Rules Validator Gate");
console.log("--------------------------------------------------");

if (!fs.existsSync(recordsPath)) {
  console.error(`ERROR: Records file not found at ${recordsPath}`);
  process.exit(1);
}

if (!fs.existsSync(schemaPath)) {
  console.error(`ERROR: Schema file not found at ${schemaPath}`);
  process.exit(1);
}

const records = JSON.parse(fs.readFileSync(recordsPath, 'utf8'));
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

let invalidCount = 0;

function customValidate(entry, index) {
  const errors = [];
  
  // Required top-level fields
  const requiredFields = ["phrase", "language_lane", "status", "cultural_context", "machine_translation_bridge", "governance"];
  for (const f of requiredFields) {
    if (!(f in entry)) {
      errors.push(`Missing required top-level field: '${f}'`);
    }
  }
  
  // Check language lane enum
  const allowedLanes = ["Cork Slang", "Gaeilge", "West Cork Dialect", "Cant / Shelta", "Other Celtic"];
  if (entry.language_lane && !allowedLanes.includes(entry.language_lane)) {
    errors.push(`Invalid language_lane: '${entry.language_lane}'. Must be one of ${JSON.stringify(allowedLanes)}`);
  }
  
  // Check status enum
  const allowedStatuses = ["PENDING_REVIEW", "CONFIRMED", "SENSITIVE_HOLD"];
  if (entry.status && !allowedStatuses.includes(entry.status)) {
    errors.push(`Invalid status: '${entry.status}'. Must be one of ${JSON.stringify(allowedStatuses)}`);
  }
  
  // Check cultural_context
  if (entry.cultural_context) {
    const cc = entry.cultural_context;
    const ccReqs = ["meaning", "region", "when_to_use", "when_not_to_use", "cultural_context_required"];
    for (const r of ccReqs) {
      if (!(r in cc)) {
        errors.push(`cultural_context missing required field: '${r}'`);
      }
    }
    if ('cultural_context_required' in cc && typeof cc.cultural_context_required !== 'boolean') {
      errors.push("cultural_context.cultural_context_required must be a boolean");
    }
  }
  
  // Check machine_translation_bridge
  if (entry.machine_translation_bridge) {
    const mtb = entry.machine_translation_bridge;
    const mtbReqs = ["allowed_use", "prohibited_use", "tone", "severity", "behaviour_tag", "routing_rule"];
    for (const r of mtbReqs) {
      if (!(r in mtb)) {
        errors.push(`machine_translation_bridge missing required field: '${r}'`);
      }
    }
    
    const allowedTones = ["neutral", "comic", "sarcastic", "affectionate", "derogatory", "serious"];
    if (mtb.tone && !allowedTones.includes(mtb.tone)) {
      errors.push(`Invalid tone: '${mtb.tone}'. Must be one of ${JSON.stringify(allowedTones)}`);
    }
    
    const allowedSeverities = ["low", "medium", "high", "critical"];
    if (mtb.severity && !allowedSeverities.includes(mtb.severity)) {
      errors.push(`Invalid severity: '${mtb.severity}'. Must be one of ${JSON.stringify(allowedSeverities)}`);
    }
    
    const allowedRoutes = ["casual_context_only", "human_in_the_loop", "unrestricted", "restricted_use"];
    if (mtb.routing_rule && !allowedRoutes.includes(mtb.routing_rule)) {
      errors.push(`Invalid routing_rule: '${mtb.routing_rule}'. Must be one of ${JSON.stringify(allowedRoutes)}`);
    }
  }
  
  // Check governance
  if (entry.governance) {
    const gov = entry.governance;
    const govReqs = ["confidence_score", "audit_chain", "speaker_verified"];
    for (const r of govReqs) {
      if (!(r in gov)) {
        errors.push(`governance missing required field: '${r}'`);
      }
    }
    if ('confidence_score' in gov && typeof gov.confidence_score !== 'number') {
      errors.push("governance.confidence_score must be a number");
    }
    if ('speaker_verified' in gov && typeof gov.speaker_verified !== 'boolean') {
      errors.push("governance.speaker_verified must be a boolean");
    }
  }

  // Check unique constraints & rules
  if (entry.language_lane === "Cant / Shelta") {
    // Traveller Cant must always be SENSITIVE_HOLD or CONFIRMED (never unreviewed)
    if (entry.status === "PENDING_REVIEW") {
      errors.push("Cant / Shelta lane entries cannot remain PENDING_REVIEW; they must be SENSITIVE_HOLD by default or CONFIRMED after native verification.");
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

console.log(`Validating ${records.length} records...`);

records.forEach((record, index) => {
  const result = customValidate(record, index);
  if (!result.valid) {
    invalidCount++;
    console.error(`\n❌ Validation FAILED for record #${index + 1} ("${record.phrase || 'Unknown'}"):`);
    result.errors.forEach(err => console.error(`   - ${err}`));
  }
});

if (invalidCount > 0) {
  console.error(`\nValidation complete. ❌ ${invalidCount} of ${records.length} records failed validation rules.`);
  process.exit(1);
} else {
  console.log("\n✅ SUCCESS: All CorkLan records comply with DaVinciA+ Schema and Custody Doctrine rules!");
  process.exit(0);
}
