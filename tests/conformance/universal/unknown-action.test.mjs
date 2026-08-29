import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePolicy } from '../../../src/governance/evaluate.js';

test('Universal Unknown Action: Unrecognised actions fail closed', async () => {
  const record = {
    object_id: "urn:davincia:corklan:linguistic_record:dunfaimid",
    object_type: "linguistic_record",
    domain: "corklan",
    version: "1.1.0",
    lifecycle_state: "VERIFIED",
    provenance: {
      source_type: "ACADEMIC",
      source_reference: "Archive",
      geographic_origin: { latitude: 51.8985, longitude: -8.4756 },
      collected_at: "2026-08-28T12:00:00Z"
    },
    verification: {
      state: "VERIFIED",
      reviewer_role: "NATIVE_SPEAKER",
      evidence_ref: "urn:evidence:ref"
    },
    sensitivity: { classification: "PUBLIC" },
    payload: { phrase: "Dunfaimid" }
  };

  const decision = await evaluatePolicy(record, "JUNK_ACTION", { id: "user:david", class: "HUMAN" });
  assert.equal(decision.status, "DENY");
  assert.equal(decision.reason_code, "UNKNOWN_ACTION");
});
