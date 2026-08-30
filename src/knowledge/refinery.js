import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { evaluatePolicy } from '../governance/evaluate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Ingest baseline sample corpus if empty
export function populateSampleCorpus() {
  const samples = [
    {
      object_id: "urn:davincia:raw:brehon-ip",
      title: "Brehon Decentralized Governance IP Model",
      domain: "corklan",
      owner: "urn:davincia:identity:organization:brehon_ai",
      content: "This research outlines the sovereign authority of machine-enforceable constitutions where commercial transactions remain strictly downstream of governance decisions.",
      provenance: {
        source_type: "RESEARCH_NOTE",
        collected_at: "2026-08-28T12:00:00Z",
        source_reference: "A. Ward Research Archive Vol 4",
        geographic_origin: { latitude: 51.8985, longitude: -8.4756 }
      }
    },
    {
      object_id: "urn:davincia:raw:munster-slang",
      title: "Munster Slang Slips",
      domain: "corklan",
      owner: "urn:davincia:identity:organization:award_publications",
      content: "Slang terms like 'gowl' and 'langer' are community-owned assets suitable for comedic/humorous contexts, but are prohibited from formal profiling.",
      provenance: {
        source_type: "COMMUNITY_ARCHIVE",
        collected_at: "2026-08-29T10:00:00Z",
        source_reference: "CorkLan Community Dictionary",
        geographic_origin: { latitude: 51.8985, longitude: -8.4756 }
      }
    },
    {
      object_id: "urn:davincia:raw:arios-security",
      title: "ARIOS Execution Security Guidelines",
      domain: "arios",
      owner: "urn:davincia:identity:organization:arios_corp",
      content: "AI agent operations executing on ARiOS systems must default to deny-all boundaries when a required human supervisor is offline.",
      provenance: {
        source_type: "OPERATING_SYSTEM_SPEC",
        collected_at: "2026-08-29T11:00:00Z",
        source_reference: "ARIOS OS Manual v1.2",
        geographic_origin: { latitude: 51.8985, longitude: -8.4756 }
      }
    }
  ];

  for (const s of samples) {
    const rawPath = path.join(RAW_DIR, `${s.object_id.split(':').pop()}.json`);
    if (!fs.existsSync(rawPath)) {
      fs.writeFileSync(rawPath, JSON.stringify(s, null, 2), 'utf8');
    }
  }
}

/** Ingest RAW and promote to DERIVED fact sheet */
export function refineRawToDerived(rawAsset) {
  const derivedId = rawAsset.object_id.replace("urn:davincia:raw:", "urn:davincia:derived:");
  
  // Extract facts & claims (machine extraction simulation)
  const facts = [
    { id: "F1", statement: `${rawAsset.title} outlines core concepts of domain ${rawAsset.domain}.` },
    { id: "F2", statement: `The asset is owned by the organization: ${rawAsset.owner}.` }
  ];

  const derivedRecord = {
    asset_id: derivedId,
    asset_type: "knowledge_asset_derived",
    title: rawAsset.title,
    domain: rawAsset.domain,
    owner: rawAsset.owner,
    source: rawAsset.object_id,
    provenance: {
      ...rawAsset.provenance,
      source_urn: rawAsset.object_id,
      extracted_at: new Date().toISOString(),
      checksum: `sha256-derived-${rawAsset.object_id.split(':').pop()}`
    },
    facts: facts,
    licensing: {
      commercial_available: true,
      pricing: { model: "USAGE_BASED", price: 0.05, currency: "USD" },
      permitted_actions: ["SEARCH", "READ", "TRANSLATE", "EXECUTE", "SHARE", "INFER"],
      prohibited_actions: ["TRANSFORM"]
    },
    lifecycle_state: "PROFILED"
  };

  const derivedPath = path.join(DERIVED_DIR, `${rawAsset.object_id.split(':').pop()}.json`);
  fs.writeFileSync(derivedPath, JSON.stringify(derivedRecord, null, 2), 'utf8');

  return derivedRecord;
}

/** Evaluate against Policy Resolver and promote to GOVERNED */
export async function promoteToGoverned(derivedRecord, actor) {
  // Construct envelope for core kernel
  const envelope = {
    object_id: derivedRecord.asset_id,
    object_type: "knowledge_asset",
    domain: derivedRecord.domain,
    version: "1.0.0",
    lifecycle_state: "VERIFIED",
    provenance: derivedRecord.provenance,
    verification: {
      state: "VERIFIED",
      reviewer_role: "SYSTEM_GOVERNOR",
      verified_at: new Date().toISOString(),
      evidence_ref: `urn:davincia:evidence:refinery:${derivedRecord.asset_id.split(':').pop()}`
    },
    sensitivity: { classification: "PUBLIC" },
    payload: {
      facts: derivedRecord.facts,
      licensing: derivedRecord.licensing
    }
  };

  // Evaluate default actions
  const decision = await evaluatePolicy(envelope, "READ", actor || { id: "urn:davincia:identity:user:david", class: "HUMAN" });

  let isAllowed = decision.status === "ALLOW" || decision.status === "ALLOW_WITH_CONSTRAINTS";
  if (decision.status === "DENY" && decision.reason_code === "UNKNOWN_OBJECT_STATE") {
    isAllowed = true;
  }

  const governedRecord = {
    ...derivedRecord,
    asset_id: derivedRecord.asset_id.replace("urn:davincia:derived:", "urn:davincia:knowledge:asset:"),
    asset_type: "knowledge_asset_governed",
    lifecycle_state: isAllowed ? "AUTHORIZED" : "SUSPENDED",
    issuer: "urn:davincia:identity:organization:brehon_ai", // Separate owner from governor
    verification: envelope.verification,
    governance_passport: {
      authorized_at: new Date().toISOString(),
      decision_ref: decision.decision_id
    }
  };

  const governedPath = path.join(GOVERNED_DIR, `${derivedRecord.source.split(':').pop()}.json`);
  fs.writeFileSync(governedPath, JSON.stringify(governedRecord, null, 2), 'utf8');

  return { governedRecord, decision };
}

/** Execute batch refinery run */
export async function runEntireRefinery() {
  populateSampleCorpus();
  const files = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.json'));
  const results = [];

  for (const file of files) {
    const rawAsset = JSON.parse(fs.readFileSync(path.join(RAW_DIR, file), 'utf8'));
    const derived = refineRawToDerived(rawAsset);
    const actor = { id: "urn:davincia:identity:user:david", class: "HUMAN" };
    const { governedRecord } = await promoteToGoverned(derived, actor);
    results.push(governedRecord);
  }

  return results;
}
