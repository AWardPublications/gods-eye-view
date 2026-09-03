import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePolicy } from '../../../src/governance/evaluate.js';

const mockActor = { id: "urn:davincia:identity:user:david", class: "HUMAN" };

test('Domain Conformance: DAVID_OS execute action requires MFA', async () => {
  const mfaRecord = {
    object_id: "urn:davincia:david-os:system_command:001",
    object_type: "system_command",
    domain: "david-os",
    version: "1.0.0",
    lifecycle_state: "SUBMITTED",
    provenance: {
      source_type: "SYSTEM",
      source_reference: "Local CLI",
      geographic_origin: { latitude: 51.8985, longitude: -8.4756 },
      collected_at: "2026-08-28T12:00:00Z"
    },
    verification: { state: "UNVERIFIED", evidence_ref: "" },
    sensitivity: { classification: "SENSITIVE_PROTECTED" },
    payload: {
      mfa_verified: true,
      command: "git push origin main"
    }
  };

  const noMfaRecord = {
    ...mfaRecord,
    payload: {
      mfa_verified: false,
      command: "git push origin main"
    }
  };

  const decisionAllow = await evaluatePolicy(mfaRecord, "EXECUTE", mockActor);
  assert.equal(decisionAllow.status, "ALLOW");

  const decisionDeny = await evaluatePolicy(noMfaRecord, "EXECUTE", mockActor);
  assert.equal(decisionDeny.status, "DENY");
  assert.equal(decisionDeny.reason_code, "EXECUTION_DENIED");
});

test('Domain Conformance: DAVID_OS delete action is always blocked', async () => {
  const record = {
    object_id: "urn:davincia:david-os:system_command:001",
    object_type: "system_command",
    domain: "david-os",
    version: "1.0.0",
    lifecycle_state: "SUBMITTED",
    provenance: {
      source_type: "SYSTEM",
      source_reference: "Local CLI",
      geographic_origin: { latitude: 51.8985, longitude: -8.4756 },
      collected_at: "2026-08-28T12:00:00Z"
    },
    verification: { state: "UNVERIFIED", evidence_ref: "" },
    sensitivity: { classification: "SENSITIVE_PROTECTED" },
    payload: {
      mfa_verified: true,
      command: "rm -rf /"
    }
  };

  const decision = await evaluatePolicy(record, "DELETE", mockActor);
  assert.equal(decision.status, "DENY");
  assert.equal(decision.reason_code, "EXECUTION_DENIED");
});
