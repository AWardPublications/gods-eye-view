import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePolicy } from '../../../src/governance/evaluate.js';

const mockActor = { id: "urn:davincia:identity:user:coach", class: "HUMAN" };

test('Domain Conformance: Alex Wenger publish requires consent', async () => {
  const consentedRecord = {
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
      athlete_consent: true,
      metrics: { bpm: 180 }
    }
  };

  const unconsentedRecord = {
    ...consentedRecord,
    payload: {
      athlete_consent: false,
      metrics: { bpm: 180 }
    }
  };

  const decisionAllow = await evaluatePolicy(consentedRecord, "PUBLISH", mockActor);
  assert.equal(decisionAllow.status, "ALLOW");

  const decisionDeny = await evaluatePolicy(unconsentedRecord, "PUBLISH", mockActor);
  assert.equal(decisionDeny.status, "DENY");
  assert.equal(decisionDeny.reason_code, "CUSTODY_PROTECTED");
});
