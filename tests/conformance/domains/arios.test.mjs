import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePolicy } from '../../../src/governance/evaluate.js';

const mockActor = { id: "urn:davincia:identity:user:auditor", class: "HUMAN" };

test('Domain Conformance: ARIOS denies execute action', async () => {
  const record = {
    object_id: "urn:davincia:arios:regulatory_filing:001",
    object_type: "regulatory_filing",
    domain: "arios",
    version: "1.0.0",
    lifecycle_state: "VERIFIED",
    provenance: {
      source_type: "REGULATORY",
      source_reference: "Registry",
      geographic_origin: { latitude: 51.8985, longitude: -8.4756 },
      collected_at: "2026-08-28T12:00:00Z"
    },
    verification: {
      state: "VERIFIED",
      reviewer_role: "REGULATORY_AUDITOR",
      evidence_ref: "urn:evidence:ref"
    },
    sensitivity: { classification: "SENSITIVE_PROTECTED" },
    payload: { details: "Standard clinical report" }
  };

  const decision = await evaluatePolicy(record, "EXECUTE", mockActor);
  assert.equal(decision.status, "DENY");
  assert.equal(decision.reason_code, "REGULATORY_COMPLIANCE_HOLD");
});

test('Domain Conformance: ARIOS export is allowed if verified, denied if submitted', async () => {
  const verifiedRecord = {
    object_id: "urn:davincia:arios:regulatory_filing:001",
    object_type: "regulatory_filing",
    domain: "arios",
    version: "1.0.0",
    lifecycle_state: "VERIFIED",
    provenance: {
      source_type: "REGULATORY",
      source_reference: "Registry",
      geographic_origin: { latitude: 51.8985, longitude: -8.4756 },
      collected_at: "2026-08-28T12:00:00Z"
    },
    verification: {
      state: "VERIFIED",
      reviewer_role: "REGULATORY_AUDITOR",
      evidence_ref: "urn:evidence:ref"
    },
    sensitivity: { classification: "SENSITIVE_PROTECTED" },
    payload: { details: "Report" }
  };

  const unverifiedRecord = {
    ...verifiedRecord,
    lifecycle_state: "SUBMITTED",
    verification: { state: "UNVERIFIED", evidence_ref: "" }
  };

  const verifiedDecision = await evaluatePolicy(verifiedRecord, "EXPORT", mockActor);
  assert.equal(verifiedDecision.status, "ALLOW");

  const unverifiedDecision = await evaluatePolicy(unverifiedRecord, "EXPORT", mockActor);
  assert.equal(unverifiedDecision.status, "DENY");
  assert.equal(unverifiedDecision.reason_code, "REGULATORY_COMPLIANCE_HOLD");
});
