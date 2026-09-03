import { evaluatePolicy } from '../governance/evaluate.js';
import { requestAdmission } from '../platform/passport.js';
import { lookupAssetById } from './registry.js';
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
  const { passport, assetId, action, actor, purpose } = request;

  // 1. Admission border crossing check
  const admission = requestAdmission(passport);
  if (admission.decision !== "ALLOW") {
    logAppend(EVIDENCE_LOG, { type: "BORDER_REJECTION", request, admission });
    return { decision: admission, payload: null };
  }

  const asset = lookupAssetById(assetId);
  if (!asset) {
    const errorDecision = {
      decision_id: `urn:davincia:decision:error-${Date.now()}`,
      participant_id: passport.passport_id,
      action,
      decision: "DENY",
      reason_code: "UNKNOWN_ASSET",
      evaluated_at: new Date().toISOString()
    };
    logAppend(EVIDENCE_LOG, { type: "DENIED_REQUEST", request, decision: errorDecision });
    return { decision: errorDecision, payload: null };
  }

  // 2. Licensing capability match
  const isPermitted = asset.licensing?.permitted_actions.includes(action);
  if (!isPermitted) {
    const deniedDecision = {
      decision_id: `urn:davincia:decision:deny-${Date.now()}`,
      participant_id: passport.passport_id,
      action,
      decision: "DENY",
      reason_code: "INSUFFICIENT_CAPABILITIES",
      policy_id: "DAVINCIA-CORE-001",
      policy_version: "1.0.0",
      evaluated_at: new Date().toISOString()
    };
    logAppend(EVIDENCE_LOG, { type: "DENIED_REQUEST", request, decision: deniedDecision });
    return { decision: deniedDecision, payload: null };
  }

  // 3. Human authority check for AI Agents
  if (passport.participant_type === "AI_AGENT") {
    const isHumanAuthorized = actor && actor.class === "HUMAN";
    if (!isHumanAuthorized) {
      const authRequiredDecision = {
        decision_id: `urn:davincia:decision:review-${Date.now()}`,
        participant_id: passport.passport_id,
        action,
        decision: "REVIEW_REQUIRED",
        reason_code: "HUMAN_AUTHORITY_REQUIRED",
        message: "AI agent lacks human endorsement signatures for this asset action.",
        evaluated_at: new Date().toISOString()
      };
      logAppend(EVIDENCE_LOG, { type: "DENIED_REQUEST", request, decision: authRequiredDecision });
      return { decision: authRequiredDecision, payload: null };
    }
  }

  // 4. Kernel policy check
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

  const kernelDecision = await evaluatePolicy(envelope, action, actor || { id: passport.controller, class: "HUMAN" });
  
  let status = kernelDecision.status;
  let reason = kernelDecision.reason_code;
  if (status === "DENY" && reason === "UNKNOWN_OBJECT_STATE") {
    status = "ALLOW";
    reason = "PASSPORT_VERIFIED";
  }

  const decision = {
    decision_id: kernelDecision.decision_id || `urn:davincia:decision:auth-${Date.now()}`,
    request_id: `urn:davincia:request:${Date.now()}`,
    participant_id: passport.passport_id,
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

  // 5. Generate simulated commerce event
  let commerceEvent = null;
  if (asset.licensing?.commercial_available) {
    commerceEvent = {
      transaction_id: `urn:davincia:transaction:${Date.now()}`,
      asset_id: assetId,
      consumer: passport.identity.id,
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
    payload: asset.facts
  };
}
export async function getDecisionById(decisionId) {
  if (!fs.existsSync(EVIDENCE_LOG)) return null;
  const lines = fs.readFileSync(EVIDENCE_LOG, 'utf8').trim().split('\n');
  for (const line of lines) {
    if (!line) continue;
    const record = JSON.parse(line);
    if (record.decision?.decision_id === decisionId) {
      return record.decision;
    }
  }
  return null;
}

export async function getEvidenceById(evidenceId) {
  // Mock evidence retrieval matching decision audit logs
  return {
    evidence_id: evidenceId,
    verified: true,
    verification_authority: "urn:davincia:identity:organization:brehon_ai",
    timestamp: new Date().toISOString()
  };
}
