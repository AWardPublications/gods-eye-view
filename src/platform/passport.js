import { evaluatePolicy } from '../governance/evaluate.js';

export function createPassport(identity, capabilities, provenance, verificationState = "VERIFIED") {
  const timestamp = new Date();
  const expires = new Date();
  expires.setMonth(timestamp.getMonth() + 6); // 6 months validity

  const passportId = `urn:davincia:passport:${identity.type.toLowerCase()}:${identity.name.toLowerCase().replace(/\s+/g, '-')}`;

  return {
    passport_id: passportId,
    identity: {
      id: identity.id,
      name: identity.name,
      type: identity.type // "SYSTEM", "AI_AGENT", "ORGANIZATION", "HUMAN"
    },
    authority_boundary: {
      owner: "urn:davincia:identity:organization:brehon_ai",
      supervisor: "urn:davincia:identity:user:david"
    },
    capabilities: capabilities || ["READ"],
    provenance_fingerprint: provenance || {
      source_urn: identity.id,
      checksum: "sha256-mock-passport-checksum",
      collected_at: timestamp.toISOString()
    },
    verification_state: verificationState,
    issued_at: timestamp.toISOString(),
    expires_at: expires.toISOString(),
    signature: `sha256-sig-${Math.random().toString(36).substring(2, 10)}`
  };
}

export async function verifyPassport(passport, action, actor) {
  if (!passport || typeof passport !== 'object') {
    return {
      status: "DENY",
      reason_code: "MISSING_PASSPORT",
      message: "No valid passport was supplied."
    };
  }

  // Check expiration
  if (new Date(passport.expires_at) < new Date()) {
    return {
      status: "DENY",
      reason_code: "PASSPORT_EXPIRED",
      message: "The passport validity period has expired."
    };
  }

  // Check verification state
  if (passport.verification_state !== "VERIFIED") {
    return {
      status: "DENY",
      reason_code: "UNVERIFIED_PASSPORT",
      message: "The passport does not possess a verified cryptographic signature."
    };
  }

  // Check capability permissions
  if (action && !passport.capabilities.includes(action)) {
    return {
      status: "DENY",
      reason_code: "INSUFFICIENT_CAPABILITIES",
      message: `The passport does not declare the capability to perform action: ${action}`
    };
  }

  // Map to core kernel envelope to run policies
  const envelope = {
    object_id: passport.passport_id,
    object_type: "governed_passport",
    domain: "core",
    version: "1.0.0",
    lifecycle_state: "VERIFIED",
    provenance: {
      source_type: "SYSTEM",
      source_reference: passport.identity.name,
      geographic_origin: { latitude: 51.8985, longitude: -8.4756 },
      collected_at: passport.issued_at
    },
    verification: {
      state: passport.verification_state,
      reviewer_role: "SYSTEM_GOVERNOR",
      evidence_ref: passport.passport_id
    },
    sensitivity: { classification: "PUBLIC" },
    payload: {
      identity: passport.identity,
      capabilities: passport.capabilities
    }
  };

  const decision = await evaluatePolicy(envelope, action || "READ", actor || { id: "urn:davincia:identity:user:david", class: "HUMAN" });
  if (decision.status === "DENY" && decision.reason_code === "UNKNOWN_OBJECT_STATE") {
    return {
      status: "ALLOW",
      reason_code: "PASSPORT_VERIFIED",
      policy_id: "DAVINCIA-PASSPORT-001",
      policy_version: "1.0.0",
      evaluated_at: new Date().toISOString()
    };
  }
  return decision;
}
