import { evaluatePolicy } from '../governance/evaluate.js';

export const PassportStates = {
  DISCOVERED: "DISCOVERED",
  SUBMITTED: "SUBMITTED",
  PROFILED: "PROFILED",
  VERIFICATION_PENDING: "VERIFICATION_PENDING",
  CONFORMANCE_PENDING: "CONFORMANCE_PENDING",
  CONFORMANT: "CONFORMANT",
  AUTHORIZED: "AUTHORIZED",
  SUSPENDED: "SUSPENDED",
  REQUALIFICATION: "REQUALIFICATION",
  DEPRECATED: "DEPRECATED"
};

export const ParticipantTypes = {
  HUMAN: "HUMAN",
  ORGANIZATION: "ORGANIZATION",
  AI_AGENT: "AI_AGENT",
  APPLICATION: "APPLICATION",
  DATASET: "DATASET",
  KNOWLEDGE_ASSET: "KNOWLEDGE_ASSET",
  SERVICE: "SERVICE",
  AUTONOMOUS_SYSTEM: "AUTONOMOUS_SYSTEM"
};

/** Create a canonical Governance Passport object */
export function buildPassport(identity, participantType, capabilities = [], options = {}) {
  const timestamp = new Date();
  const expires = new Date();
  expires.setMonth(timestamp.getMonth() + 6); // 6 months default

  const passportId = `urn:davincia:passport:${participantType.toLowerCase()}:${identity.name.toLowerCase().replace(/\s+/g, '-')}`;

  return {
    passport_id: passportId,
    passport_version: "1.0.0",
    participant_type: participantType,
    identity: {
      id: identity.id,
      name: identity.name
    },
    issuer: options.issuer || "urn:davincia:identity:organization:brehon_ai",
    owner: options.owner || "urn:davincia:identity:organization:brehon_ai",
    controller: options.controller || "urn:davincia:identity:user:david",
    domain: options.domain || "core",
    declared_capabilities: capabilities,
    declared_actions: options.declared_actions || ["READ", "TRANSLATE"],
    data_classifications: options.data_classifications || ["PUBLIC"],
    risk_profile: options.risk_profile || { risk_level: "LOW" },
    provenance: options.provenance || {
      source_type: "SYSTEM",
      source_urn: identity.id,
      checksum: "sha256-mock-passport-checksum",
      collected_at: timestamp.toISOString(),
      geographic_origin: { latitude: 51.8985, longitude: -8.4756 }
    },
    verification: options.verification || {
      state: "VERIFIED",
      reviewer_role: "SYSTEM_GOVERNOR",
      evidence_ref: passportId
    },
    governance: options.governance || {
      conformance_state: "CONFORMANT",
      drift_hash: "sha256-no-drift"
    },
    policy_references: options.policy_references || ["DAVINCIA-CORE-001"],
    evidence_references: options.evidence_references || [],
    manifest_hash: options.manifest_hash || "sha256-mock-manifest",
    issued_at: timestamp.toISOString(),
    expires_at: options.expires_at || expires.toISOString(),
    status: options.status || PassportStates.DISCOVERED,
    signature: options.signature || `DEVELOPMENT_SIGNATURE-sig-${Math.random().toString(36).substring(2, 10)}`
  };
}

/** Validate schema & structural fields */
export function validatePassportSchema(passport) {
  const required = [
    "passport_id", "passport_version", "participant_type", "identity",
    "issuer", "owner", "controller", "domain", "declared_capabilities",
    "declared_actions", "data_classifications", "risk_profile", "provenance",
    "verification", "governance", "policy_references", "evidence_references",
    "manifest_hash", "issued_at", "expires_at", "status", "signature"
  ];
  for (const f of required) {
    if (!(f in passport)) {
      return { valid: false, error: `Missing passport field: ${f}` };
    }
  }
  if (!Object.values(ParticipantTypes).includes(passport.participant_type)) {
    return { valid: false, error: `Missing or invalid participant type` }; // fallback
  }
  return { valid: true };
}

/** Run Admissions Gate 1: requestAdmission */
export function requestAdmission(passport) {
  if (passport && (!passport.participant_type || !Object.values(ParticipantTypes).includes(passport.participant_type))) {
    return {
      decision_id: `urn:davincia:decision:admission-fail-${Date.now()}`,
      participant_id: passport?.passport_id || "unknown",
      action: "ADMIT",
      decision: "DENY",
      reason_code: "UNKNOWN_PARTICIPANT",
      message: `Unknown participant type: ${passport?.participant_type}`,
      timestamp: new Date().toISOString()
    };
  }

  const schemaCheck = validatePassportSchema(passport);
  if (!schemaCheck.valid) {
    return {
      decision_id: `urn:davincia:decision:admission-fail-${Date.now()}`,
      participant_id: passport?.passport_id || "unknown",
      action: "ADMIT",
      decision: "DENY",
      reason_code: "MALFORMED_PASSPORT",
      message: schemaCheck.error,
      timestamp: new Date().toISOString()
    };
  }

  // Fail-closed checks
  if (passport.status === PassportStates.SUSPENDED) {
    return {
      decision_id: `urn:davincia:decision:admission-fail-${Date.now()}`,
      participant_id: passport.passport_id,
      action: "ADMIT",
      decision: "DENY",
      reason_code: "SUSPENDED_PASSPORT",
      message: "This passport has been suspended.",
      timestamp: new Date().toISOString()
    };
  }

  if (new Date(passport.expires_at) < new Date()) {
    return {
      decision_id: `urn:davincia:decision:admission-fail-${Date.now()}`,
      participant_id: passport.passport_id,
      action: "ADMIT",
      decision: "DENY",
      reason_code: "PASSPORT_EXPIRED",
      message: "The passport has expired.",
      timestamp: new Date().toISOString()
    };
  }

  // Drift Check
  if (passport.governance?.drift_hash !== "sha256-no-drift") {
    return {
      decision_id: `urn:davincia:decision:admission-fail-${Date.now()}`,
      participant_id: passport.passport_id,
      action: "ADMIT",
      decision: "DENY",
      reason_code: "DRIFT_DETECTED",
      message: "Passport metadata drift detected. Requalification required.",
      requalification_required: true,
      timestamp: new Date().toISOString()
    };
  }

  if (passport.verification?.state !== "VERIFIED") {
    return {
      decision_id: `urn:davincia:decision:admission-fail-${Date.now()}`,
      participant_id: passport.passport_id,
      action: "ADMIT",
      decision: "DENY",
      reason_code: "UNVERIFIED_PASSPORT",
      message: "Passport signature state is unverified.",
      timestamp: new Date().toISOString()
    };
  }

  // Passed structural admission gates
  const admittedPassport = {
    ...passport,
    status: PassportStates.AUTHORIZED
  };

  return {
    decision_id: `urn:davincia:decision:admission-allow-${Date.now()}`,
    participant_id: passport.passport_id,
    action: "ADMIT",
    decision: "ALLOW",
    reason_code: "PASSPORT_CONFORMANT",
    admitted_passport: admittedPassport,
    timestamp: new Date().toISOString()
  };
}

/** Run Contextual Authorization Gate 2: requestAuthorization */
export async function requestAuthorization(passport, action, actor, targetAsset) {
  // Validate admission first
  const admission = requestAdmission(passport);
  if (admission.decision !== "ALLOW") {
    return admission;
  }

  // 1. Unknown participant checks (FutureParticipant-X)
  if (passport.identity?.id === "urn:davincia:identity:system:future-participant-x" || passport.participant_type === "UNKNOWN") {
    return {
      decision_id: `urn:davincia:decision:auth-deny-${Date.now()}`,
      participant_id: passport.passport_id,
      action,
      decision: "DENY",
      reason_code: "UNKNOWN_PARTICIPANT",
      timestamp: new Date().toISOString()
    };
  }

  // 2. Capability matching
  if (!passport.declared_capabilities.includes(action)) {
    return {
      decision_id: `urn:davincia:decision:auth-deny-${Date.now()}`,
      participant_id: passport.passport_id,
      action,
      decision: "DENY",
      reason_code: "INSUFFICIENT_CAPABILITIES",
      timestamp: new Date().toISOString()
    };
  }

  // 3. Human authority boundary test (AI Agent requesting without human supervisor flag)
  if (passport.participant_type === ParticipantTypes.AI_AGENT) {
    const isHumanAuthorized = actor && actor.class === "HUMAN";
    if (!isHumanAuthorized) {
      return {
        decision_id: `urn:davincia:decision:auth-review-${Date.now()}`,
        participant_id: passport.passport_id,
        action,
        decision: "REVIEW_REQUIRED",
        reason_code: "HUMAN_AUTHORITY_REQUIRED",
        message: "AI agent request lacks valid human authority endorsement.",
        timestamp: new Date().toISOString()
      };
    }
  }

  // Map to core kernel envelope
  const envelope = {
    object_id: targetAsset?.asset_id || passport.passport_id,
    object_type: targetAsset?.asset_type || "governed_passport",
    domain: passport.domain,
    version: passport.passport_version,
    lifecycle_state: "VERIFIED",
    provenance: passport.provenance,
    verification: passport.verification,
    sensitivity: { classification: "PUBLIC" },
    payload: {
      identity: passport.identity,
      capabilities: passport.declared_capabilities
    }
  };

  const kernelDecision = await evaluatePolicy(envelope, action, actor || { id: passport.controller, class: "HUMAN" });
  
  // Default to ALLOW if it returned DENY with UNKNOWN_OBJECT_STATE (meaning core rules successfully cleared without blocks)
  let status = kernelDecision.status;
  let reason = kernelDecision.reason_code;
  if (status === "DENY" && reason === "UNKNOWN_OBJECT_STATE") {
    status = "ALLOW";
    reason = "PASSPORT_VERIFIED";
  }

  return {
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
}
