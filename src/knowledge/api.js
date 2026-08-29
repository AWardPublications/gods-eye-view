import { evaluatePolicy } from '../governance/evaluate.js';
import { getAssetById } from './registry.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EVIDENCE_LOG = path.join(__dirname, '../../data/evidence-ledger.jsonl');
const COMMERCE_LOG = path.join(__dirname, '../../data/commerce-ledger.jsonl');

function logAppend(filePath, record) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.appendFileSync(filePath, JSON.stringify(record) + '\n', 'utf8');
}

export async function processAccessRequest(request) {
  const { requester, assetId, action, purpose } = request;
  const asset = getAssetById(assetId);

  // Agent Control verification
  if (requester && requester.class === "AI_AGENT") {
    const isAuthorizedAgent = requester.id.includes("authorized-agent");
    if (!isAuthorizedAgent) {
      const agentDenied = {
        decision_id: `urn:davincia:decision:agent-deny-${Date.now()}`,
        asset_id: assetId,
        actor: requester,
        action,
        status: "DENY",
        reason_code: "EXECUTION_DENIED",
        policy_id: "DAVINCIA-CORE-001",
        policy_version: "1.0.0",
        evaluated_at: new Date().toISOString()
      };
      logAppend(EVIDENCE_LOG, { type: "DENIED_REQUEST", request, decision: agentDenied });
      return { decision: agentDenied, payload: null };
    }
  }

  if (!asset) {
    const errorDecision = {
      decision_id: `urn:davincia:decision:error-${Date.now()}`,
      asset_id: assetId,
      actor: requester,
      action,
      status: "DENY",
      reason_code: "UNKNOWN_ASSET",
      evaluated_at: new Date().toISOString()
    };
    logAppend(EVIDENCE_LOG, { type: "DENIED_REQUEST", request, decision: errorDecision });
    return { decision: errorDecision, payload: null };
  }

  // Check if requested action is permitted in licensing manifest
  const isPermitted = asset.licensing?.permitted_actions.includes(action);
  if (!isPermitted) {
    const deniedDecision = {
      decision_id: `urn:davincia:decision:deny-${Date.now()}`,
      asset_id: assetId,
      actor: requester,
      action,
      status: "DENY",
      reason_code: "PROHIBITED_ACTION",
      policy_id: "DAVINCIA-CORE-001",
      policy_version: "1.0.0",
      evaluated_at: new Date().toISOString()
    };
    logAppend(EVIDENCE_LOG, { type: "DENIED_REQUEST", request, decision: deniedDecision });
    return { decision: deniedDecision, payload: null };
  }

  // Construct envelope for core kernel check
  const envelope = {
    object_id: asset.asset_id,
    object_type: asset.asset_type,
    domain: asset.domain,
    version: asset.version,
    lifecycle_state: asset.lifecycle_state === "AUTHORIZED" ? "VERIFIED" : asset.lifecycle_state,
    provenance: asset.provenance,
    verification: asset.verification,
    sensitivity: asset.sensitivity,
    payload: asset.payload
  };

  // Check custom rules
  let decision = await evaluatePolicy(envelope, action, requester);

  const isAllowed = decision.status === "ALLOW" || decision.status === "ALLOW_WITH_CONSTRAINTS";

  // If evaluatePolicy returned ALLOW/ALLOW_WITH_CONSTRAINTS but the system requires human signatures:
  if (isAllowed && asset.verification.state !== "VERIFIED") {
    decision = {
      ...decision,
      status: "DENY",
      reason_code: "EVIDENCE_MISSING"
    };
  }

  if (decision.status !== "ALLOW" && decision.status !== "ALLOW_WITH_CONSTRAINTS") {
    logAppend(EVIDENCE_LOG, { type: "DENIED_REQUEST", request, decision });
    return { decision, payload: null };
  }

  // Generate simulated commercial event
  let commerceEvent = null;
  if (asset.licensing?.commercial_available) {
    commerceEvent = {
      transaction_id: `urn:davincia:transaction:${Date.now()}`,
      asset_id: assetId,
      consumer: requester.id,
      provider: asset.owner,
      requested_action: action,
      authorization_decision: decision.decision_id,
      commercial_purpose: purpose || "GENERAL_API_CONSUMPTION",
      pricing_model: asset.licensing.pricing.model,
      price: asset.licensing.pricing.price,
      currency: asset.licensing.pricing.currency,
      entitlement: "SIMULATION_ONLY",
      timestamp: new Date().toISOString()
    };
    logAppend(COMMERCE_LOG, commerceEvent);
  }

  // Log successful access request evidence
  logAppend(EVIDENCE_LOG, {
    type: "AUTHORIZED_ACCESS",
    request,
    decision,
    commerce_event_id: commerceEvent?.transaction_id || null
  });

  return {
    decision,
    commerce_event: commerceEvent,
    payload: asset.payload
  };
}
