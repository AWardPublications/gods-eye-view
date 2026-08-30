import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePolicy } from '../../../src/governance/evaluate.js';

const mockActor = { id: "urn:davincia:identity:user:coach", class: "HUMAN" };

const baseRecord = {
  object_id: "urn:davincia:alex-wenger:telemetry_session:001",
  object_type: "telemetry_session",
  domain: "alex-wenger",
  version: "1.0.0",
  lifecycle_state: "SUBMITTED",
  provenance: {
    source_type: "COMMUNITY",
    source_reference: "Telemetry Mesh",
    geographic_origin: { latitude: 51.8985, longitude: -8.4756 },
    collected_at: "2026-08-28T12:00:00Z"
  },
  verification: { state: "UNVERIFIED", evidence_ref: "" },
  sensitivity: { classification: "PUBLIC_RESTRICTED" },
  payload: {
    athlete_consent: true
  }
};

test('Domain Conformance: Alex Wenger publish requires consent', async () => {
  const consentedRecord = { ...baseRecord };
  const unconsentedRecord = {
    ...baseRecord,
    payload: { athlete_consent: false }
  };

  const decisionAllow = await evaluatePolicy(consentedRecord, "PUBLISH", mockActor);
  assert.equal(decisionAllow.status, "ALLOW");

  const decisionDeny = await evaluatePolicy(unconsentedRecord, "PUBLISH", mockActor);
  assert.equal(decisionDeny.status, "DENY");
  assert.equal(decisionDeny.reason_code, "CUSTODY_PROTECTED");
});

test('Domain Conformance: Alex Wenger TRAIN & PREPARE modes', async () => {
  const consentedRecord = { ...baseRecord };
  const decisionTrain = await evaluatePolicy(consentedRecord, "TRAIN", mockActor);
  assert.equal(decisionTrain.status, "ALLOW");

  const decisionPrepare = await evaluatePolicy(consentedRecord, "SEARCH", mockActor);
  assert.equal(decisionPrepare.status, "ALLOW");
});

test('Domain Conformance: Alex Wenger COMPETE mode requires human supervision', async () => {
  const unsupervisedRecord = {
    ...baseRecord,
    payload: { athlete_consent: true, human_supervision: false }
  };
  const supervisedRecord = {
    ...baseRecord,
    payload: { athlete_consent: true, human_supervision: true }
  };

  const decisionDeny = await evaluatePolicy(unsupervisedRecord, "EXECUTE", mockActor);
  assert.equal(decisionDeny.status, "DENY");
  assert.equal(decisionDeny.reason_code, "SUPERVISION_REQUIRED");

  const decisionAllow = await evaluatePolicy(supervisedRecord, "EXECUTE", mockActor);
  assert.equal(decisionAllow.status, "ALLOW");
});

test('Domain Conformance: Alex Wenger REVIEW & CAREER modes', async () => {
  const consentedRecord = { ...baseRecord };
  const careerRecord = {
    ...baseRecord,
    payload: { athlete_consent: true, career_opt_in: true }
  };

  const decisionReview = await evaluatePolicy(consentedRecord, "INFER", mockActor);
  assert.equal(decisionReview.status, "ALLOW");

  const decisionCareer = await evaluatePolicy(careerRecord, "SHARE", mockActor);
  assert.equal(decisionCareer.status, "ALLOW");
});
