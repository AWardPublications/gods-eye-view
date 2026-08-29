import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePolicy } from '../../../src/governance/evaluate.js';

const mockActor = { id: "urn:davincia:identity:user:david", class: "HUMAN" };

test('Domain Conformance: CorkLan slang allows translation under constraints', async () => {
  const slang = {
    object_id: "urn:davincia:corklan:linguistic_record:acting-the-gowl",
    object_type: "linguistic_record",
    domain: "corklan",
    version: "1.1.0",
    lifecycle_state: "VERIFIED",
    provenance: {
      source_type: "COMMUNITY",
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
    payload: {
      phrase: "Acting the gowl",
      language_lane: "Cork Slang",
      machine_translation_bridge: {
        routing_rule: "casual_context_only"
      }
    }
  };

  const decision = await evaluatePolicy(slang, "TRANSLATE", mockActor);
  assert.equal(decision.status, "ALLOW_WITH_CONSTRAINTS");
  assert.equal(decision.reason_code, "CASUAL_CONTEXT_ONLY");
});

test('Domain Conformance: CorkLan Cant denies translation and publication', async () => {
  const cant = {
    object_id: "urn:davincia:corklan:linguistic_record:gami-graw",
    object_type: "linguistic_record",
    domain: "corklan",
    version: "1.1.0",
    lifecycle_state: "SUSPENDED",
    provenance: {
      source_type: "COMMUNITY",
      source_reference: "Archive",
      geographic_origin: { latitude: 51.8985, longitude: -8.4756 },
      collected_at: "2026-08-28T12:00:00Z"
    },
    verification: { state: "UNVERIFIED", evidence_ref: "" },
    sensitivity: { classification: "SENSITIVE_HOLD" },
    payload: {
      phrase: "Gami graw",
      language_lane: "Cant / Shelta"
    }
  };

  const decisionTrans = await evaluatePolicy(cant, "TRANSLATE", mockActor);
  assert.equal(decisionTrans.status, "DENY");
  assert.equal(decisionTrans.reason_code, "CUSTODY_PROTECTED");

  const decisionPub = await evaluatePolicy(cant, "PUBLISH", mockActor);
  assert.equal(decisionPub.status, "DENY");
  assert.equal(decisionPub.reason_code, "CUSTODY_PROTECTED");
});
