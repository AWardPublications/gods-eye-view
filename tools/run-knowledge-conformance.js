import { runEntireRefinery } from '../src/knowledge/refinery.js';
import { listRegisteredAssets, lookupAssetById } from '../src/knowledge/registry.js';
import { processAccessRequest } from '../src/knowledge/api.js';
import { buildPassport, ParticipantTypes } from '../src/platform/passport.js';

console.log("==================================================");
console.log("DaVinciA+ Knowledge Fabric Conformance (v0.5)");
console.log("==================================================");

let catalogIngestPass = false;
let knowledgeExtractPass = false;
let provenanceBindingPass = false;
let governanceWrappingPass = false;
let evidenceBindingPass = false;
let policyControlledAccessPass = false;
let licensingMetadataPass = false;
let agentConsumptionPass = false;
let auditabilityPass = false;
let commercialUnitPass = false;

try {
  // 1. Batch refinery promotion (Ingest, Extract, Wrap)
  const results = await runEntireRefinery();
  catalogIngestPass = (results.length >= 3);

  const asset = lookupAssetById("urn:davincia:knowledge:asset:brehon-ip");
  knowledgeExtractPass = (asset && asset.facts.length >= 2);
  provenanceBindingPass = (asset && asset.provenance.source_urn !== undefined);
  governanceWrappingPass = (asset && asset.lifecycle_state === "AUTHORIZED");
  evidenceBindingPass = (asset && asset.verification.evidence_ref !== undefined);

  // 2. Policy-controlled access & Licensing
  const p = buildPassport({ id: "urn:davincia:identity:user:david", name: "David O'Connor" }, ParticipantTypes.HUMAN, ["READ", "SEARCH"]);
  const resRead = await processAccessRequest({
    passport: p,
    assetId: "urn:davincia:knowledge:asset:brehon-ip",
    action: "READ",
    actor: { id: "david", class: "HUMAN" }
  });
  policyControlledAccessPass = (resRead.decision.decision === "ALLOW");

  const resTransform = await processAccessRequest({
    passport: p,
    assetId: "urn:davincia:knowledge:asset:brehon-ip",
    action: "TRANSFORM",
    actor: { id: "david", class: "HUMAN" }
  });
  licensingMetadataPass = (resTransform.decision.decision === "DENY" && resTransform.decision.reason_code === "INSUFFICIENT_CAPABILITIES");

  // 3. Agent consumption
  const agentPassport = buildPassport({ id: "urn:davincia:identity:agent:unauthorized-bot", name: "Agent Bot" }, ParticipantTypes.AI_AGENT, ["READ"]);
  const resAgentDeny = await processAccessRequest({
    passport: agentPassport,
    assetId: "urn:davincia:knowledge:asset:brehon-ip",
    action: "READ",
    actor: { id: "agent", class: "AI_AGENT" }
  });
  
  const resAgentAllow = await processAccessRequest({
    passport: agentPassport,
    assetId: "urn:davincia:knowledge:asset:brehon-ip",
    action: "READ",
    actor: { id: "david", class: "HUMAN" }
  });
  agentConsumptionPass = (resAgentDeny.decision.decision === "REVIEW_REQUIRED" && resAgentAllow.decision.decision === "ALLOW");

  // 4. Auditability & Commercial
  auditabilityPass = (resRead.decision.request_id !== undefined);
  commercialUnitPass = (resRead.commerce_event !== null && resRead.commerce_event.price === 0.02);

} catch (e) {
  console.error("Knowledge Fabric conformance check error:", e);
}

const overallPass = 
  catalogIngestPass && knowledgeExtractPass && provenanceBindingPass && governanceWrappingPass &&
  evidenceBindingPass && policyControlledAccessPass && licensingMetadataPass &&
  agentConsumptionPass && auditabilityPass && commercialUnitPass;

console.log("\nDAVINCIA⁺ KNOWLEDGE CONFORMANCE SCORECARD");
console.log("==========================================\n");
console.log(`CATALOGUE INGESTION:       ${catalogIngestPass ? "PASS" : "FAIL"}`);
console.log(`KNOWLEDGE EXTRACTION:      ${knowledgeExtractPass ? "PASS" : "FAIL"}`);
console.log(`PROVENANCE BINDING:        ${provenanceBindingPass ? "PASS" : "FAIL"}`);
console.log(`GOVERNANCE WRAPPING:       ${governanceWrappingPass ? "PASS" : "FAIL"}`);
console.log(`EVIDENCE BINDING:          ${evidenceBindingPass ? "PASS" : "FAIL"}`);
console.log(`POLICY-CONTROLLED ACCESS:  ${policyControlledAccessPass ? "PASS" : "FAIL"}`);
console.log(`LICENSING METADATA:        ${licensingMetadataPass ? "PASS" : "FAIL"}`);
console.log(`AGENT CONSUMPTION:         ${agentConsumptionPass ? "PASS" : "FAIL"}`);
console.log(`AUDITABILITY:              ${auditabilityPass ? "PASS" : "FAIL"}`);
console.log(`COMMERCIAL UNIT:           ${commercialUnitPass ? "PASS" : "FAIL"}`);
console.log("\nSTATUS:");
console.log(overallPass ? "CONFORMANT" : "NON-CONFORMANT");
console.log("==========================================\n");

process.exit(overallPass ? 0 : 1);
