import { ReasonCodes } from './reasonCodes.js';

export function validateEnvelope(envelope) {
  const errors = [];
  
  if (!envelope || typeof envelope !== 'object') {
    return {
      valid: false,
      reason_code: ReasonCodes.MISSING_ENVELOPE,
      errors: ["Record is null, undefined, or not a JSON object"]
    };
  }

  // Required envelope fields
  const requiredFields = ["object_id", "object_type", "domain", "version", "lifecycle_state", "provenance", "verification", "sensitivity", "payload"];
  for (const f of requiredFields) {
    if (!(f in envelope)) {
      errors.push(`Missing envelope field: '${f}'`);
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      reason_code: ReasonCodes.MISSING_ENVELOPE,
      errors
    };
  }

  // Provenance Checks
  const prov = envelope.provenance;
  if (!prov || typeof prov !== 'object') {
    errors.push("provenance block must be an object");
  } else {
    const reqProv = ["source_type", "collected_at", "geographic_origin"];
    for (const rp of reqProv) {
      if (!(rp in prov)) {
        errors.push(`provenance missing field: '${rp}'`);
      }
    }
    if (prov.geographic_origin && (typeof prov.geographic_origin.latitude !== 'number' || typeof prov.geographic_origin.longitude !== 'number')) {
      errors.push("provenance.geographic_origin coordinates must be numbers");
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      reason_code: ReasonCodes.MISSING_PROVENANCE,
      errors
    };
  }

  // Verification checks (Gate 1 & Gate 3 hard rules)
  const ver = envelope.verification;
  const isVerified = envelope.lifecycle_state === 'VERIFIED';
  
  if (isVerified) {
    if (!ver || typeof ver !== 'object') {
      return {
        valid: false,
        reason_code: ReasonCodes.EVIDENCE_MISSING,
        errors: ["Record is VERIFIED but verification block is missing or invalid"]
      };
    }
    if (!ver.evidence_ref || typeof ver.evidence_ref !== 'string' || ver.evidence_ref.trim() === "") {
      return {
        valid: false,
        reason_code: ReasonCodes.INVALID_EVIDENCE_REF,
        errors: ["Record is VERIFIED but evidence_ref is empty or missing"]
      };
    }
    if (!ver.reviewer_role || typeof ver.reviewer_role !== 'string' || ver.reviewer_role.trim() === "") {
      return {
        valid: false,
        reason_code: ReasonCodes.EVIDENCE_MISSING,
        errors: ["Record is VERIFIED but reviewer_role is empty or missing"]
      };
    }
  }

  return {
    valid: true,
    reason_code: ReasonCodes.APPROVED,
    errors: []
  };
}
