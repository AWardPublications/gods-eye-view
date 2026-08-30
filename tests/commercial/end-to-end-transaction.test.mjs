import test from 'node:test';
import assert from 'node:assert/strict';
import { executeGovernedTransaction } from '../../src/governed-commerce/transaction.js';
import { buildPassport, ParticipantTypes, PassportStates } from '../../src/platform/passport.js';

test('E2E Transaction: 1. Successful transaction matches complete golden path', async () => {
  const hp = buildPassport({ id: "urn:id:user:david", name: "David" }, ParticipantTypes.HUMAN, ["READ"]);

  const request = {
    humanPassport: hp,
    assetId: "urn:davincia:knowledge:asset:brehon-ip",
    action: "READ",
    purpose: "LICENSED_AUDIT_VERIFICATION",
    paymentToken: "GOLDEN_PATH_TOKEN"
  };

  const tx = await executeGovernedTransaction(request);

  assert.equal(tx.status, "SETTLED");
  assert.equal(tx.decision.decision, "ALLOW");
  assert.equal(tx.entitlement.status, "ACTIVE");
  assert.equal(tx.settlement.settlement_status, "SETTLED");
  assert.equal(tx.allocation.reconciled, true);
  assert.equal(tx.settlement.platform_fee, 0.01); // 20% of 0.05
  assert.equal(tx.settlement.owner_amount, 0.04); // 80% of 0.05
});

test('E2E Transaction: 2. Blocked transaction matches complete adversarial path', async () => {
  const hp = buildPassport({ id: "urn:id:user:david", name: "David" }, ParticipantTypes.HUMAN, ["READ"]);
  hp.status = PassportStates.SUSPENDED; // Suspended delegator human passport

  const request = {
    humanPassport: hp,
    assetId: "urn:davincia:knowledge:asset:brehon-ip",
    action: "READ",
    paymentToken: "ADVERSARIAL_TOKEN"
  };

  const tx = await executeGovernedTransaction(request);

  assert.equal(tx.status, "FAILED");
  assert.equal(tx.settlement.settlement_status, "FAILED");
  assert.equal(tx.settlement.price, 0.00); // Pricing zeroed out on fail-closed block
  assert.equal(tx.entitlement, null);
});
