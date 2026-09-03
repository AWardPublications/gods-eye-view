import test from 'node:test';
import assert from 'node:assert/strict';
import { issueEntitlement, verifyEntitlement } from '../../src/governed-commerce/entitlement.js';
import { createLicenseAgreement } from '../../src/governed-commerce/licensing.js';
import { buildPassport, ParticipantTypes, PassportStates } from '../../src/platform/passport.js';

test('Entitlement: 1. Generate active commercial entitlement from ALLOW decision', () => {
  const decision = {
    decision_id: "urn:decision:allow-1",
    participant_id: "urn:passport:human:david",
    action: "READ",
    decision: "ALLOW"
  };
  const license = createLicenseAgreement("urn:asset:brehon-ip", "urn:org:brehon_ai", "USAGE_BASED", 0.05);
  const entitlement = issueEntitlement(decision, license);

  assert.equal(entitlement.status, "ACTIVE");
  assert.equal(entitlement.price, 0.05);
  assert.equal(entitlement.currency, "USD");
});

test('Entitlement: 2. Block entitlement issuance on DENY decisions', () => {
  const decision = {
    decision_id: "urn:decision:deny-1",
    participant_id: "urn:passport:human:david",
    action: "READ",
    decision: "DENY"
  };
  const license = createLicenseAgreement("urn:asset:brehon-ip", "urn:org:brehon_ai", "USAGE_BASED", 0.05);
  assert.throws(() => {
    issueEntitlement(decision, license);
  }, /Cannot issue commercial entitlement/);
});

test('Entitlement: 3. Verify active entitlement states', () => {
  const hp = buildPassport({ id: "urn:id:user:david", name: "David" }, ParticipantTypes.HUMAN, ["READ"]);
  const decision = {
    decision_id: "urn:decision:allow-1",
    participant_id: hp.passport_id,
    action: "READ",
    decision: "ALLOW"
  };
  const license = createLicenseAgreement("urn:asset:brehon-ip", "urn:org:brehon_ai", "USAGE_BASED", 0.05);
  const entitlement = issueEntitlement(decision, license);

  const verification = verifyEntitlement(entitlement, hp, null, license.provenance_hash);
  assert.equal(verification.valid, true);
});
