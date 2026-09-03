import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePolicy } from '../../../src/governance/evaluate.js';

test('Universal Policy Unavailable: Fails closed when resolver fails', async () => {
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

  const brokenResolver = {
    resolveDomainPolicies: async () => {
      throw new Error("Simulated network timeout/outage");
    }
  };

  const decision = await evaluatePolicy(record, "TRANSLATE", { id: "user:david", class: "HUMAN" }, brokenResolver);
  assert.equal(decision.status, "DENY");
  assert.equal(decision.reason_code, "POLICY_UNAVAILABLE");
});
