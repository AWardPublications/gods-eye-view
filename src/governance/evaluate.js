import { validateEnvelope } from './validate.js';
import { ReasonCodes } from './reasonCodes.js';
import defaultResolver from '../policies/registry.js';

const ALLOWED_ACTIONS = [
  "READ", "DISPLAY", "SEARCH", "TRANSLATE", "SUMMARIZE", 
  "TRANSFORM", "INFER", "EXPORT", "SHARE", "PUBLISH", 
  "TRAIN", "EXECUTE", "DELETE", "ARCHIVE"
];

export async function evaluatePolicy(envelope, action, actor, resolver = defaultResolver) {
  // Gate 1: Structure & validation checks (Fail-Closed)
  const validation = validateEnvelope(envelope);
  if (!validation.valid) {
    return {
      decision_id: `urn:davincia:decision:error-${Date.now()}`,
      object_id: envelope?.object_id || "unknown",
      actor: actor || { id: "unknown", class: "SYSTEM" },
      action,
      status: "DENY",
      reason_code: validation.reason_code,
      policy_id: "DAVINCIA-CORE-001",
      policy_version: "1.0.0",
      evaluated_at: new Date().toISOString()
    };
  }

  // Action Registry validation
  if (!ALLOWED_ACTIONS.includes(action)) {
    return {
      decision_id: `urn:davincia:decision:deny-${Date.now()}`,
      object_id: envelope.object_id,
      actor: actor || { id: "unknown", class: "SYSTEM" },
      action,
      status: "DENY",
      reason_code: ReasonCodes.UNKNOWN_ACTION,
      policy_id: "DAVINCIA-CORE-001",
      policy_version: "1.0.0",
      evaluated_at: new Date().toISOString()
    };
  }

  // Gate 2: Hard-coded Custody checks (Fail-Closed)
  if (envelope.sensitivity?.classification === "SENSITIVE_HOLD") {
    if (action === "TRANSLATE" || action === "PUBLISH") {
      return {
        decision_id: `urn:davincia:decision:deny-${Date.now()}`,
        object_id: envelope.object_id,
        actor: actor || { id: "unknown", class: "SYSTEM" },
        action,
        status: "DENY",
        reason_code: ReasonCodes.CUSTODY_PROTECTED,
        policy_id: "DAVINCIA-CULTURAL-003",
        policy_version: "1.2.0",
        evaluated_at: new Date().toISOString()
      };
    }
  }

  // Resolve applicable policies for the domain
  let policies;
  try {
    policies = await resolver.resolveDomainPolicies(envelope.domain);
  } catch (e) {
    return {
      decision_id: `urn:davincia:decision:fail-${Date.now()}`,
      object_id: envelope.object_id,
      actor: actor || { id: "unknown", class: "SYSTEM" },
      action,
      status: "DENY",
      reason_code: "POLICY_UNAVAILABLE",
      policy_id: "DAVINCIA-CORE-001",
      policy_version: "1.0.0",
      evaluated_at: new Date().toISOString()
    };
  }

  const hasDomainPolicy = policies && policies.some(p => p.domain === envelope.domain);
  if ((!policies || policies.length === 0) || (!hasDomainPolicy && envelope.domain !== "core")) {
    return {
      decision_id: `urn:davincia:decision:deny-${Date.now()}`,
      object_id: envelope.object_id,
      actor: actor || { id: "unknown", class: "SYSTEM" },
      action,
      status: "DENY",
      reason_code: ReasonCodes.UNKNOWN_POLICY,
      policy_id: "DAVINCIA-CORE-001",
      policy_version: "1.0.0",
      evaluated_at: new Date().toISOString()
    };
  }

  // Evaluate composed policy rules
  let decisionStatus = "DENY";
  let reasonCode = ReasonCodes.UNKNOWN_OBJECT_STATE;
  let matchingPolicyId = "DAVINCIA-CORE-001";
  let matchingPolicyVersion = "1.0.0";
  let ruleMatched = false;

  // Evaluate policies sequentially (Core first, then domain-specific)
  for (const policy of policies) {
    for (const rule of policy.rules) {
      // Check target match
      let targetMatches = true;
      if (rule.target) {
        for (const [key, val] of Object.entries(rule.target)) {
          const actualVal = envelope[key] || envelope.payload?.[key] || envelope.verification?.[key] || envelope.provenance?.[key] || envelope.sensitivity?.[key];
          if (actualVal !== val) {
            targetMatches = false;
            break;
          }
        }
      }

      if (!targetMatches) continue;

      // Check action condition match
      if (rule.conditions && rule.conditions.action) {
        if (!rule.conditions.action.includes(action)) continue;
      }

      // Check context attribute conditions if defined
      if (rule.conditions && rule.conditions.context_attributes) {
        let contextMatches = true;
        for (const [ckey, cval] of Object.entries(rule.conditions.context_attributes)) {
          const actualCVal = envelope.payload?.machine_translation_bridge?.[ckey] || envelope.payload?.[ckey];
          if (actualCVal !== cval) {
            contextMatches = false;
            break;
          }
        }
        if (!contextMatches) continue;
      }

      // Rule matches! Apply decision outcome
      decisionStatus = rule.outcome;
      reasonCode = rule.reason_code;
      matchingPolicyId = policy.policy_id;
      matchingPolicyVersion = policy.version;
      ruleMatched = true;
      
      // Strict precedence: DENY outcomes immediately terminate evaluation (fail-closed)
      if (decisionStatus === "DENY") {
        break;
      }
    }
    if (ruleMatched && decisionStatus === "DENY") {
      break;
    }
  }

  return {
    decision_id: `urn:davincia:decision:${Math.random().toString(36).substring(2, 15)}`,
    object_id: envelope.object_id,
    actor: actor || { id: "unknown", class: "SYSTEM" },
    action,
    status: decisionStatus,
    reason_code: reasonCode,
    policy_id: matchingPolicyId,
    policy_version: matchingPolicyVersion,
    evaluated_at: new Date().toISOString()
  };
}
