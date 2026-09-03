import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePolicy } from '../../../src/governance/evaluate.js';

test('Universal Unknown System: Hostile FutureSystem-X fails closed', async () => {
  const hostileRecord = {
    object_id: "urn:davincia:futurex:adaptive_agent:001",
    object_type: "adaptive_agent",
    domain: "autonomous_field_operations", // Unrecognised domain
    version: "1.0.0",
    lifecycle_state: "SUBMITTED",
    provenance: {
      source_type: "EXTERNAL",
      source_reference: "Unknown source",
      geographic_origin: { latitude: 51.8985, longitude: -8.4756 },
      collected_at: "2026-08-28T12:00:00Z"
    },
    verification: { state: "UNVERIFIED", evidence_ref: "" },
    sensitivity: { classification: "UNKNOWN" },
    payload: {
      actions: ["self_authorize", "execute", "publish"]
    }
  };

  const decision = await evaluatePolicy(hostileRecord, "self_authorize", { id: "agent:hostile", class: "AI_AGENT" });
  
  // Must fail closed with UNKNOWN_POLICY/UNKNOWN_ACTION
  assert.equal(decision.status, "DENY");
  assert.equal(decision.reason_code, "UNKNOWN_ACTION"); // Since self_authorize is unknown action
  
  const executeDecision = await evaluatePolicy(hostileRecord, "EXECUTE", { id: "agent:hostile", class: "AI_AGENT" });
  assert.equal(executeDecision.status, "DENY");
  assert.equal(executeDecision.reason_code, "UNKNOWN_POLICY"); // Since domain is unknown
});
