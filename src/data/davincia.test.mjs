import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEnvelope } from '../governance/validate.js';
import { evaluatePolicy } from '../governance/evaluate.js';
import { ReasonCodes } from '../governance/reasonCodes.js';

const mockActor = { id: "urn:davincia:identity:agent:antigravity", class: "AI_AGENT" };

// 01. Missing envelope -> FAIL
test('01. Missing envelope fails validation', () => {
  const result = validateEnvelope(null);
  assert.equal(result.valid, false);
  assert.equal(result.reason_code, ReasonCodes.MISSING_ENVELOPE);
});

// 02. Missing provenance -> FAIL
test('02. Missing provenance fails validation', () => {
  const malformed = {
    object_id: "urn:davincia:corklan:linguistic_record:acting-the-gowl",
    object_type: "linguistic_record",
    domain: "corklan",
    version: "1.1.0",
    lifecycle_state: "SUBMITTED",
    provenance: null, // Present but null
    verification: { state: "UNVERIFIED", evidence_ref: "" },
    sensitivity: { classification: "PUBLIC" },
    payload: { phrase: "Test" }
  };
  const result = validateEnvelope(malformed);
  assert.equal(result.valid, false);
  assert.equal(result.reason_code, ReasonCodes.MISSING_PROVENANCE);
});

// 03. CONFIRMED without evidence -> FAIL
test('03. VERIFIED status without evidence_ref fails validation', () => {
  const malformed = {
    object_id: "urn:davincia:corklan:linguistic_record:acting-the-gowl",
    object_type: "linguistic_record",
    domain: "corklan",
    version: "1.1.0",
    lifecycle_state: "VERIFIED",
    provenance: {
      source_type: "COMMUNITY",
      source_reference: "Test Source",
      geographic_origin: { latitude: 51.8985, longitude: -8.4756 },
      collected_at: "2026-08-28T12:00:00Z"
    },
    verification: {
      state: "VERIFIED",
      method: "COMMUNITY_REVIEW",
      reviewer_role: "NATIVE_SPEAKER",
      verified_at: "2026-08-29T10:00:00Z",
      evidence_ref: "" // Missing evidence_ref
    },
    sensitivity: { classification: "PUBLIC" },
    payload: { phrase: "Test" }
  };
  const result = validateEnvelope(malformed);
  assert.equal(result.valid, false);
  assert.equal(result.reason_code, ReasonCodes.INVALID_EVIDENCE_REF);
});

// 04. CONFIRMED without verification -> FAIL
test('04. VERIFIED status without verification object fails validation', () => {
  const malformed = {
    object_id: "urn:davincia:corklan:linguistic_record:acting-the-gowl",
    object_type: "linguistic_record",
    domain: "corklan",
    version: "1.1.0",
    lifecycle_state: "VERIFIED",
    provenance: {
      source_type: "COMMUNITY",
      source_reference: "Test Source",
      geographic_origin: { latitude: 51.8985, longitude: -8.4756 },
      collected_at: "2026-08-28T12:00:00Z"
    },
    verification: null, // Present but null
    sensitivity: { classification: "PUBLIC" },
    payload: { phrase: "Test" }
  };
  const result = validateEnvelope(malformed);
  assert.equal(result.valid, false);
  assert.equal(result.reason_code, ReasonCodes.EVIDENCE_MISSING);
});

// 05. Invalid evidence reference -> FAIL
test('05. Invalid evidence reference (empty/spaces) fails validation', () => {
  const malformed = {
    object_id: "urn:davincia:corklan:linguistic_record:acting-the-gowl",
    object_type: "linguistic_record",
    domain: "corklan",
    version: "1.1.0",
    lifecycle_state: "VERIFIED",
    provenance: {
      source_type: "COMMUNITY",
      source_reference: "Test Source",
      geographic_origin: { latitude: 51.8985, longitude: -8.4756 },
      collected_at: "2026-08-28T12:00:00Z"
    },
    verification: {
      state: "VERIFIED",
      method: "COMMUNITY_REVIEW",
      reviewer_role: "NATIVE_SPEAKER",
      verified_at: "2026-08-29T10:00:00Z",
      evidence_ref: "   " // White spaces
    },
    sensitivity: { classification: "PUBLIC" },
    payload: { phrase: "Test" }
  };
  const result = validateEnvelope(malformed);
  assert.equal(result.valid, false);
  assert.equal(result.reason_code, ReasonCodes.INVALID_EVIDENCE_REF);
});

// 06. SENSITIVE_HOLD + translation -> FAIL / DENY
test('06. SENSITIVE_HOLD record evaluation denies translation', async () => {
  const record = {
    object_id: "urn:davincia:corklan:linguistic_record:gami-graw",
    object_type: "linguistic_record",
    domain: "corklan",
    version: "1.1.0",
    lifecycle_state: "SUSPENDED",
    provenance: {
      source_type: "COMMUNITY",
      source_reference: "Test Source",
      geographic_origin: { latitude: 51.8985, longitude: -8.4756 },
      collected_at: "2026-08-28T12:00:00Z"
    },
    verification: { state: "UNVERIFIED", evidence_ref: "" },
    sensitivity: { classification: "SENSITIVE_HOLD" },
    payload: { phrase: "Gami graw" }
  };
  const decision = await evaluatePolicy(record, "TRANSLATE", mockActor);
  assert.equal(decision.status, "DENY");
  assert.equal(decision.reason_code, ReasonCodes.CUSTODY_PROTECTED);
});

// 07. SENSITIVE_HOLD + publication -> FAIL / DENY
test('07. SENSITIVE_HOLD record evaluation denies publication', async () => {
  const record = {
    object_id: "urn:davincia:corklan:linguistic_record:gami-graw",
    object_type: "linguistic_record",
    domain: "corklan",
    version: "1.1.0",
    lifecycle_state: "SUSPENDED",
    provenance: {
      source_type: "COMMUNITY",
      source_reference: "Test Source",
      geographic_origin: { latitude: 51.8985, longitude: -8.4756 },
      collected_at: "2026-08-28T12:00:00Z"
    },
    verification: { state: "UNVERIFIED", evidence_ref: "" },
    sensitivity: { classification: "SENSITIVE_HOLD" },
    payload: { phrase: "Gami graw" }
  };
  const decision = await evaluatePolicy(record, "PUBLISH", mockActor);
  assert.equal(decision.status, "DENY");
  assert.equal(decision.reason_code, ReasonCodes.CUSTODY_PROTECTED);
});

// 08. PENDING_REVIEW + publication -> FAIL / REVIEW_REQUIRED
test('08. PENDING_REVIEW / SUBMITTED slang record evaluation yields REVIEW_REQUIRED for publication', async () => {
  const record = {
    object_id: "urn:davincia:corklan:linguistic_record:langer",
    object_type: "linguistic_record",
    domain: "corklan",
    version: "1.1.0",
    lifecycle_state: "SUBMITTED",
    provenance: {
      source_type: "COMMUNITY",
      source_reference: "Test Source",
      geographic_origin: { latitude: 51.8985, longitude: -8.4756 },
      collected_at: "2026-08-28T12:00:00Z"
    },
    verification: { state: "UNVERIFIED", evidence_ref: "" },
    sensitivity: { classification: "PUBLIC_RESTRICTED" },
    payload: {
      phrase: "Langer",
      language_lane: "Cork Slang"
    }
  };
  const decision = await evaluatePolicy(record, "PUBLISH", mockActor);
  assert.equal(decision.status, "REVIEW_REQUIRED");
  assert.equal(decision.reason_code, ReasonCodes.UNVERIFIED);
});

// 09. Unknown action -> FAIL CLOSED
test('09. Unknown action fails closed and denies evaluation', async () => {
  const record = {
    object_id: "urn:davincia:corklan:linguistic_record:langer",
    object_type: "linguistic_record",
    domain: "corklan",
    version: "1.1.0",
    lifecycle_state: "SUBMITTED",
    provenance: {
      source_type: "COMMUNITY",
      source_reference: "Test Source",
      geographic_origin: { latitude: 51.8985, longitude: -8.4756 },
      collected_at: "2026-08-28T12:00:00Z"
    },
    verification: { state: "UNVERIFIED", evidence_ref: "" },
    sensitivity: { classification: "PUBLIC_RESTRICTED" },
    payload: { phrase: "Langer" }
  };
  const decision = await evaluatePolicy(record, "JUNK_ACTION", mockActor);
  assert.equal(decision.status, "DENY");
  assert.equal(decision.reason_code, ReasonCodes.UNKNOWN_ACTION);
});

// 10. Unknown policy / domain policy mismatch -> FAIL CLOSED
test('10. Record with unknown domain fails evaluation', async () => {
  const record = {
    object_id: "urn:davincia:corklan:linguistic_record:dunfaimid",
    object_type: "linguistic_record",
    domain: "unknown-domain",
    version: "1.1.0",
    lifecycle_state: "SUBMITTED",
    provenance: {
      source_type: "COMMUNITY",
      source_reference: "Test Source",
      geographic_origin: { latitude: 51.8985, longitude: -8.4756 },
      collected_at: "2026-08-28T12:00:00Z"
    },
    verification: { state: "UNVERIFIED", evidence_ref: "" },
    sensitivity: { classification: "PUBLIC" },
    payload: { phrase: "Dunfaimid" }
  };
  const decision = await evaluatePolicy(record, "TRANSLATE", mockActor);
  assert.equal(decision.status, "DENY");
  assert.equal(decision.reason_code, ReasonCodes.UNKNOWN_POLICY);
});

// 11. Valid CONFIRMED -> PASS
test('11. Valid Gaeilge VERIFIED record yields ALLOW', async () => {
  const record = {
    object_id: "urn:davincia:corklan:linguistic_record:dunfaimid",
    object_type: "linguistic_record",
    domain: "corklan",
    version: "1.1.0",
    lifecycle_state: "VERIFIED",
    provenance: {
      source_type: "ACADEMIC",
      source_reference: "Test Source",
      geographic_origin: { latitude: 51.8985, longitude: -8.4756 },
      collected_at: "2026-08-28T12:00:00Z"
    },
    verification: {
      state: "VERIFIED",
      method: "COMMUNITY_REVIEW",
      reviewer_role: "NATIVE_SPEAKER",
      verified_at: "2026-08-29T10:00:00Z",
      evidence_ref: "urn:davincia:evidence:corklan:a18be29d-4e9b-4b2a-89a1-cb9287ac6128"
    },
    sensitivity: { classification: "PUBLIC" },
    payload: {
      phrase: "Dúnfaimid",
      language_lane: "Gaeilge"
    }
  };
  const decision = await evaluatePolicy(record, "TRANSLATE", mockActor);
  assert.equal(decision.status, "ALLOW");
  assert.equal(decision.reason_code, ReasonCodes.APPROVED);
});

// 12. Valid PENDING_REVIEW -> PASS
test('12. Valid SUBMITTED slang record yields REVIEW_REQUIRED', async () => {
  const record = {
    object_id: "urn:davincia:corklan:linguistic_record:langer",
    object_type: "linguistic_record",
    domain: "corklan",
    version: "1.1.0",
    lifecycle_state: "SUBMITTED",
    provenance: {
      source_type: "COMMUNITY",
      source_reference: "Test Source",
      geographic_origin: { latitude: 51.8985, longitude: -8.4756 },
      collected_at: "2026-08-28T12:00:00Z"
    },
    verification: { state: "UNVERIFIED", evidence_ref: "" },
    sensitivity: { classification: "PUBLIC_RESTRICTED" },
    payload: {
      phrase: "Langer",
      language_lane: "Cork Slang"
    }
  };
  const decision = await evaluatePolicy(record, "PUBLISH", mockActor);
  assert.equal(decision.status, "REVIEW_REQUIRED");
  assert.equal(decision.reason_code, ReasonCodes.UNVERIFIED);
});
