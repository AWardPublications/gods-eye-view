import { PassportStates } from '../platform/passport.js';

export function issueEntitlement(decisionObject, licenseTerms, durationSecs = 3600) {
  if (!decisionObject || decisionObject.decision !== "ALLOW") {
    throw new Error("Cannot issue commercial entitlement without a valid ALLOW decision.");
  }

  const entitlementId = `urn:davincia:entitlement:${Math.random().toString(36).substring(2, 10)}`;
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + durationSecs * 1000);

  return {
    entitlement_id: entitlementId,
    asset_id: licenseTerms.asset_id,
    buyer_id: decisionObject.participant_id,
    decision_id: decisionObject.decision_id,
    licence_id: licenseTerms.license_id || `urn:davincia:license:auth-${Date.now()}`,
    scope: decisionObject.action || "READ",
    purpose: licenseTerms.purpose || "COMMERCIAL_USE",
    usage_limit: licenseTerms.usage_limit || 100, // max operations
    usage_count: 0,
    price: licenseTerms.pricing?.price || 0.05,
    currency: licenseTerms.pricing?.currency || "USD",
    issued_at: issuedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    status: "ACTIVE",
    revocation_state: "NONE",
    provenance_hash: licenseTerms.provenance_hash || `prov-sig-${Date.now()}`,
    policy_hash: decisionObject.policy_reference || "DAVINCIA-CORE-001",
    decision_hash: decisionObject.decision_id
  };
}

export function verifyEntitlement(entitlement, humanPassport, agentPassport, assetProvenanceHash) {
  if (!entitlement || entitlement.status !== "ACTIVE" || entitlement.revocation_state !== "NONE") {
    return { valid: false, error: "Commercial entitlement is missing, inactive, or revoked." };
  }

  if (new Date(entitlement.expires_at) < new Date()) {
    return { valid: false, error: "Commercial entitlement has expired." };
  }

  if (entitlement.usage_count >= entitlement.usage_limit) {
    return { valid: false, error: "Commercial entitlement usage limit has been exhausted." };
  }

  // Ensure human passport is active and not suspended
  if (humanPassport) {
    if (humanPassport.status === PassportStates.SUSPENDED) {
      return { valid: false, error: "Supervisor human passport is suspended." };
    }
    if (new Date(humanPassport.expires_at) < new Date()) {
      return { valid: false, error: "Supervisor human passport has expired." };
    }
  }

  // Ensure agent passport is active and not suspended
  if (agentPassport) {
    if (agentPassport.status === PassportStates.SUSPENDED) {
      return { valid: false, error: "Agent passport is suspended." };
    }
  }

  // Provenance drift check: if asset provenance hash changed since entitlement, suspend access
  if (assetProvenanceHash && entitlement.provenance_hash !== assetProvenanceHash) {
    entitlement.status = "SUSPENDED";
    entitlement.revocation_state = "PROVENANCE_DRIFTED";
    return { valid: false, error: "Provenance signature mismatch: asset has drifted since entitlement authorization." };
  }

  return { valid: true };
}
