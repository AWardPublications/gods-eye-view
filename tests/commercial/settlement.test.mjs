import test from 'node:test';
import assert from 'node:assert/strict';
import { clearTransaction } from '../../src/governed-commerce/settlement.js';
import { createLicenseAgreement } from '../../src/governed-commerce/licensing.js';

test('Settlement: 1. Successful clearing from ALLOW decision', () => {
  const license = createLicenseAgreement("urn:asset:brehon-ip", "urn:org:brehon_ai", "USAGE_BASED", 0.05);
  const decision = {
    decision_id: "urn:decision:allow-1",
    participant_id: "urn:passport:human:david",
    action: "READ",
    decision: "ALLOW"
  };
  const tx = clearTransaction(decision, license);
  assert.equal(tx.status, "SETTLED");
  assert.equal(tx.price, 0.05);
});

test('Settlement: 2. Failed clearing and price zeroing downstream of DENY decision', () => {
  const license = createLicenseAgreement("urn:asset:brehon-ip", "urn:org:brehon_ai", "USAGE_BASED", 0.05);
  const decision = {
    decision_id: "urn:decision:deny-1",
    participant_id: "urn:passport:human:david",
    action: "READ",
    decision: "DENY"
  };
  const tx = clearTransaction(decision, license);
  assert.equal(tx.status, "FAILED");
  assert.equal(tx.price, 0.00); // Sovereign price zeroing invariant
  assert.equal(tx.provider_share, 0.00);
});
