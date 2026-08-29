import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePolicy } from '../../../src/governance/evaluate.js';

test('Universal Precedence: Ethical Custody overrides lower domain policies', async () => {
  const sensitiveRecord = {
    object_id: "urn:davincia:corklan:linguistic_record:cant-term",
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
    sensitivity: {
      classification: "SENSITIVE_HOLD" // Higher order DENY
    },
    payload: {
      phrase: "Gami graw",
      language_lane: "Cant / Shelta"
    }
  };

  const decision = await evaluatePolicy(sensitiveRecord, "TRANSLATE", { id: "user:david", class: "HUMAN" });
  assert.equal(decision.status, "DENY");
  assert.equal(decision.reason_code, "CUSTODY_PROTECTED");
});
