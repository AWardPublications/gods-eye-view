import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runEntireRefinery, promoteToGoverned } from './refinery.js';
import { listRegisteredAssets, lookupAssetById } from './registry.js';
import { processAccessRequest, getDecisionById, getEvidenceById } from './api.js';
import { buildPassport, ParticipantTypes } from '../platform/passport.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RAW_DIR = path.join(__dirname, '../../data/RAW');

// Clear existing corpus logs/files before test to start clean
test('Knowledge Fabric: 1. Ingestion of sample corpus RAW assets', async () => {
  await runEntireRefinery();
  const files = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.json'));
  assert.ok(files.length >= 3);
});

test('Knowledge Fabric: 2. Knowledge extraction yields facts in DERIVED stratum', async () => {
  const assets = listRegisteredAssets();
  assert.ok(assets.length >= 3);
  const brehonAsset = lookupAssetById("urn:davincia:knowledge:asset:brehon-ip");
  assert.equal(brehonAsset.title, "Brehon Decentralized Governance IP Model");
  assert.ok(brehonAsset.facts.length >= 2);
});

test('Knowledge Fabric: 3. Provenance binding contains checksums & sources', async () => {
  const brehonAsset = lookupAssetById("urn:davincia:knowledge:asset:brehon-ip");
  assert.equal(brehonAsset.provenance.source_urn, "urn:davincia:raw:brehon-ip");
  assert.ok(brehonAsset.provenance.checksum.startsWith("sha256-derived-"));
});

test('Knowledge Fabric: 4. Governance wrapping sets authorized lifecycle states', async () => {
  const brehonAsset = lookupAssetById("urn:davincia:knowledge:asset:brehon-ip");
  assert.equal(brehonAsset.lifecycle_state, "AUTHORIZED");
  assert.ok(brehonAsset.governance_passport.authorized_at);
});

test('Knowledge Fabric: 5. Separates knowledge owner from governance issuer', async () => {
  const brehonAsset = lookupAssetById("urn:davincia:knowledge:asset:brehon-ip");
  assert.equal(brehonAsset.owner, "urn:davincia:identity:organization:brehon_ai");
  assert.equal(brehonAsset.issuer, "urn:davincia:identity:organization:brehon_ai");
  
  const slangAsset = lookupAssetById("urn:davincia:knowledge:asset:munster-slang");
  // Owner is A.Ward Publications, but Governance Issuer is Brehon AI
  assert.equal(slangAsset.owner, "urn:davincia:identity:organization:award_publications");
  assert.equal(slangAsset.issuer, "urn:davincia:identity:organization:brehon_ai");
});

test('Knowledge Fabric: 6. Policy-controlled access allows authorized human', async () => {
  const passport = buildPassport(
    { id: "urn:davincia:identity:user:david", name: "David O'Connor" },
    ParticipantTypes.HUMAN,
    ["READ", "SEARCH"]
  );

  const request = {
    passport,
    assetId: "urn:davincia:knowledge:asset:brehon-ip",
    action: "READ",
    actor: { id: "urn:davincia:identity:user:david", class: "HUMAN" }
  };

  const result = await processAccessRequest(request);
  assert.equal(result.decision.decision, "ALLOW");
  assert.ok(result.payload);
});

test('Knowledge Fabric: 7. Licensing metadata blocks prohibited actions', async () => {
  const passport = buildPassport(
    { id: "urn:davincia:identity:user:david", name: "David O'Connor" },
    ParticipantTypes.HUMAN,
    ["READ", "TRANSFORM"]
  );

  const request = {
    passport,
    assetId: "urn:davincia:knowledge:asset:brehon-ip",
    action: "TRANSFORM", // Prohibited action in licensing model
    actor: { id: "urn:davincia:identity:user:david", class: "HUMAN" }
  };

  const result = await processAccessRequest(request);
  assert.equal(result.decision.decision, "DENY");
  assert.equal(result.decision.reason_code, "INSUFFICIENT_CAPABILITIES");
});

test('Knowledge Fabric: 8. Agent consumption blocks unauthorized request', async () => {
  const agentPassport = buildPassport(
    { id: "urn:davincia:identity:agent:unauthorized-bot", name: "Agent Bot" },
    ParticipantTypes.AI_AGENT,
    ["READ"]
  );

  // Requesting without human approval flag -> REVIEW_REQUIRED
  const request = {
    passport: agentPassport,
    assetId: "urn:davincia:knowledge:asset:brehon-ip",
    action: "READ",
    actor: { id: "agent", class: "AI_AGENT" }
  };

  const result = await processAccessRequest(request);
  assert.equal(result.decision.decision, "REVIEW_REQUIRED");
  assert.equal(result.decision.reason_code, "HUMAN_AUTHORITY_REQUIRED");
});

test('Knowledge Fabric: 9. Agent consumption allows human-authorized request', async () => {
  const agentPassport = buildPassport(
    { id: "urn:davincia:identity:agent:authorized-bot", name: "Agent Bot" },
    ParticipantTypes.AI_AGENT,
    ["READ"]
  );

  // Requesting with human supervisor endorsement -> ALLOW
  const request = {
    passport: agentPassport,
    assetId: "urn:davincia:knowledge:asset:brehon-ip",
    action: "READ",
    actor: { id: "david", class: "HUMAN" }
  };

  const result = await processAccessRequest(request);
  assert.equal(result.decision.decision, "ALLOW");
});

test('Knowledge Fabric: 10. Auditability and evidence retrievals', async () => {
  const passport = buildPassport(
    { id: "urn:davincia:identity:user:david", name: "David" },
    ParticipantTypes.HUMAN,
    ["READ"]
  );
  const request = {
    passport,
    assetId: "urn:davincia:knowledge:asset:brehon-ip",
    action: "READ"
  };
  const result = await processAccessRequest(request);
  
  const audit = await getDecisionById(result.decision.decision_id);
  assert.ok(audit);
  assert.equal(audit.decision_id, result.decision.decision_id);
  
  const evidence = await getEvidenceById("urn:davincia:evidence:refinery:brehon-ip");
  assert.ok(evidence.verified);
});
