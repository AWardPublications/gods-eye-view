import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { evaluatePolicy } from '../governance/evaluate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Strata paths
const DATA_DIR = path.join(__dirname, '../../data');
const RAW_DIR = path.join(DATA_DIR, 'RAW');
const DERIVED_DIR = path.join(DATA_DIR, 'DERIVED');
const GOVERNED_DIR = path.join(DATA_DIR, 'GOVERNED');

// Ensure directories exist
for (const dir of [RAW_DIR, DERIVED_DIR, GOVERNED_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function runRefinery(rawRecord) {
  const assetId = rawRecord.object_id.replace("urn:davincia:corklan:linguistic_record:", "urn:davincia:knowledge:asset:");
  const timestamp = new Date().toISOString();

  // 1. Write to RAW stratum (Immutable source text)
  const rawPath = path.join(RAW_DIR, `${rawRecord.payload.phrase.toLowerCase().replace(/\s+/g, '-')}.json`);
  fs.writeFileSync(rawPath, JSON.stringify(rawRecord, null, 2), 'utf8');

  // 2. Machine Extraction to DERIVED stratum
  const derivedRecord = {
    asset_id: assetId,
    asset_type: "knowledge_asset",
    title: rawRecord.payload.phrase,
    domain: rawRecord.domain,
    owner: "urn:davincia:identity:organization:brehon_ai",
    creator: "urn:davincia:identity:user:native_speaker_tadhg",
    source: "corklan_records.json",
    provenance: {
      source_urn: rawRecord.object_id,
      checksum: "sha256-mock-checksum",
      extracted_at: timestamp,
      source_type: rawRecord.provenance.source_type || "COMMUNITY",
      collected_at: rawRecord.provenance.collected_at || timestamp,
      geographic_origin: rawRecord.provenance.geographic_origin || { latitude: 51.8985, longitude: -8.4756 }
    },
    verification: {
      state: rawRecord.verification.state,
      reviewer_role: rawRecord.verification.reviewer_role,
      evidence_ref: rawRecord.verification.evidence_ref
    },
    sensitivity: rawRecord.sensitivity,
    payload: {
      claim: `The phrase "${rawRecord.payload.phrase}" means "${rawRecord.payload.cultural_context.meaning}" in ${rawRecord.payload.language_lane}.`,
      details: rawRecord.payload.cultural_context,
      language_lane: rawRecord.payload.language_lane,
      machine_translation_bridge: rawRecord.payload.machine_translation_bridge
    },
    licensing: {
      commercial_available: true,
      pricing: {
        model: "USAGE_BASED",
        price: 0.05,
        currency: "USD"
      },
      permitted_actions: ["DISCOVER", "VIEW", "QUERY", "TRANSLATE", "DOWNLOAD", "COMMERCIAL_USE", "AGENT_USE"],
      prohibited_actions: ["TRANSFORM", "PUBLISH"]
    },
    version: rawRecord.version,
    lifecycle_state: "PROFILED"
  };

  const derivedPath = path.join(DERIVED_DIR, `${rawRecord.payload.phrase.toLowerCase().replace(/\s+/g, '-')}.json`);
  fs.writeFileSync(derivedPath, JSON.stringify(derivedRecord, null, 2), 'utf8');

  return {
    rawPath,
    derivedPath,
    derivedRecord
  };
}

export async function promoteToGoverned(derivedRecord, actor) {
  // Call governance evaluate to verify this candidate
  // We mock the envelope structure for evaluatePolicy
  const envelope = {
    object_id: derivedRecord.asset_id,
    object_type: "knowledge_asset",
    domain: derivedRecord.domain,
    version: derivedRecord.version,
    lifecycle_state: "VERIFIED",
    provenance: {
      source_type: "COMMUNITY",
      source_reference: derivedRecord.source,
      geographic_origin: { latitude: 51.8985, longitude: -8.4756 },
      collected_at: new Date().toISOString()
    },
    verification: derivedRecord.verification,
    sensitivity: derivedRecord.sensitivity,
    payload: derivedRecord.payload
  };

  // Evaluate default actions
  const decision = await evaluatePolicy(envelope, "TRANSLATE", actor);

  const isAllowed = decision.status === "ALLOW" || decision.status === "ALLOW_WITH_CONSTRAINTS";

  const governedRecord = {
    ...derivedRecord,
    lifecycle_state: isAllowed ? "AUTHORIZED" : "SUSPENDED",
    governance_passport: {
      manifest_hash: "sha256-passport-hash",
      authorized_at: new Date().toISOString(),
      decision_ref: decision.decision_id
    }
  };

  const governedPath = path.join(GOVERNED_DIR, `${derivedRecord.title.toLowerCase().replace(/\s+/g, '-')}.json`);
  fs.writeFileSync(governedPath, JSON.stringify(governedRecord, null, 2), 'utf8');

  return {
    governedPath,
    governedRecord,
    decision
  };
}
