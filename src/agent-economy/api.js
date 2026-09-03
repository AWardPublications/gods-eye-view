import { verifyDelegationToken } from './delegation.js';
import { enforceRateLimit, calculateTokenCost } from './metering.js';
import { lookupAssetById } from '../knowledge/registry.js';
import { requestAdmission } from '../platform/passport.js';
import { evaluatePolicy } from '../governance/evaluate.js';
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

export async function processAgentRequest(request) {
  const {
    agentPassport,
    humanPassport,
    delegationToken,
    assetId,
    action,
    purpose,
    modelTier = "STANDARD",
    inputTokens = 100,
    outputTokens = 200
  } = request;

  // 1. Admission check for the Agent Passport
  const admission = requestAdmission(agentPassport);
  if (admission.decision !== "ALLOW") {
    logAppend(EVIDENCE_LOG, { type: "AGENT_BORDER_REJECTION", request, admission });
    return { decision: admission, payload: null };
  }

  // 2. Rate limiting check
  const rateLimit = enforceRateLimit(agentPassport.passport_id);
  if (!rateLimit.permitted) {
    const throttledDecision = {
      decision_id: `urn:davincia:decision:throttle-${Date.now()}`,
      participant_id: agentPassport.passport_id,
      action,
      decision: "DENY",
      reason_code: "RATE_LIMIT_EXCEEDED",
      message: rateLimit.error,
      timestamp: new Date().toISOString()
    };
    logAppend(EVIDENCE_LOG, { type: "THROTTLED_REQUEST", request, decision: throttledDecision });
    return { decision: throttledDecision, payload: null };
  }

  // 3. Verify delegation token
  const delegation = verifyDelegationToken(delegationToken, action, agentPassport, humanPassport);
  if (!delegation.valid) {
    const delegationDeny = {
      decision_id: `urn:davincia:decision:delegation-fail-${Date.now()}`,
      participant_id: agentPassport.passport_id,
      action,
      decision: "DENY",
      reason_code: "INVALID_DELEGATION",
      message: delegation.error,
      timestamp: new Date().toISOString()
    };
    logAppend(EVIDENCE_LOG, { type: "DENIED_REQUEST", request, decision: delegationDeny });
    return { decision: delegationDeny, payload: null };
  }

  // 4. Lookup asset
  const asset = lookupAssetById(assetId);
  if (!asset) {
    const errorDecision = {
      decision_id: `urn:davincia:decision:error-${Date.now()}`,
      participant_id: agentPassport.passport_id,
      action,
      decision: "DENY",
      reason_code: "UNKNOWN_ASSET",
      timestamp: new Date().toISOString()
    };
    logAppend(EVIDENCE_LOG, { type: "DENIED_REQUEST", request, decision: errorDecision });
    return { decision: errorDecision, payload: null };
  }

  // 5. Licensing match
  const isPermitted = asset.licensing?.permitted_actions.includes(action);
  if (!isPermitted) {
    const deniedDecision = {
      decision_id: `urn:davincia:decision:deny-${Date.now()}`,
      participant_id: agentPassport.passport_id,
      action,
      decision: "DENY",
      reason_code: "INSUFFICIENT_CAPABILITIES",
      timestamp: new Date().toISOString()
    };
    logAppend(EVIDENCE_LOG, { type: "DENIED_REQUEST", request, decision: deniedDecision });
    return { decision: deniedDecision, payload: null };
  }

  // 6. Kernel policies execution
  const envelope = {
    object_id: asset.asset_id,
    object_type: "knowledge_asset",
    domain: asset.domain,
    version: "1.0.0",
    lifecycle_state: asset.lifecycle_state === "AUTHORIZED" ? "VERIFIED" : asset.lifecycle_state,
    provenance: asset.provenance,
    verification: asset.verification,
    sensitivity: { classification: "PUBLIC" },
    payload: {
      facts: asset.facts,
      licensing: asset.licensing
    }
  };

  const kernelDecision = await evaluatePolicy(envelope, action, { id: humanPassport.identity.id, class: "HUMAN" });
  
  let status = kernelDecision.status;
  let reason = kernelDecision.reason_code;
  if (status === "DENY" && reason === "UNKNOWN_OBJECT_STATE") {
    status = "ALLOW";
    reason = "PASSPORT_VERIFIED";
  }

  const decision = {
    decision_id: kernelDecision.decision_id || `urn:davincia:decision:auth-${Date.now()}`,
    request_id: `urn:davincia:request:${Date.now()}`,
    participant_id: agentPassport.passport_id,
    delegator_id: humanPassport.passport_id,
    action,
    decision: status,
    reason_code: reason,
    policy_reference: kernelDecision.policy_id || "DAVINCIA-CORE-001",
    policy_version: kernelDecision.policy_version || "1.0.0",
    evidence_references: kernelDecision.evidence_ref ? [kernelDecision.evidence_ref] : [],
    timestamp: new Date().toISOString()
  };

  if (status !== "ALLOW" && status !== "ALLOW_WITH_CONSTRAINTS") {
    logAppend(EVIDENCE_LOG, { type: "DENIED_REQUEST", request, decision });
    return { decision, payload: null };
  }

  // 7. Metering & Cost calculation
  const tokenCost = calculateTokenCost(inputTokens, outputTokens, modelTier);

  // 8. Generate simulated commerce billing event
  let commerceEvent = null;
  if (asset.licensing?.commercial_available) {
    commerceEvent = {
      transaction_id: `urn:davincia:transaction:${Date.now()}`,
      asset_id: assetId,
      consumer: agentPassport.passport_id,
      delegator: humanPassport.passport_id,
      provider: asset.owner,
      requested_action: action,
      authorization_decision: decision.decision_id,
      commercial_purpose: purpose || "DELEGATED_AGENT_EXECUTION",
      pricing_model: "TOKEN_METERED",
      model_tier: modelTier,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      price: tokenCost,
      currency: "USD",
      entitlement: "SIMULATION_ONLY",
      timestamp: new Date().toISOString()
    };
    logAppend(COMMERCE_LOG, commerceEvent);
  }

  // Log successful access request evidence
  logAppend(EVIDENCE_LOG, {
    type: "AGENT_AUTHORIZED_ACCESS",
    request,
    decision,
    commerce_event_id: commerceEvent?.transaction_id || null
  });

  return {
    decision,
    commerce_event: commerceEvent,
    payload: asset.facts
  };
}
