import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TriUniverseSubscriptionEngine } from '../../../davidos/triUniverseSubscriptionEngine.mjs';

test('1. TriUniverseSubscriptionEngine manages subscription tiers and processes tenant billing', () => {
  const engine = new TriUniverseSubscriptionEngine();
  const res = engine.compileSubscriptionModel();

  assert.equal(res.status, 'TRI_UNIVERSE_SUBSCRIPTION_MODEL_RATIFIED');
  assert.equal(res.tiersCount, 4);
  assert.equal(res.tiers[0].priceEurMonthly, 29);
  assert.equal(res.tiers[1].priceEurMonthly, 290);
  assert.equal(res.tiers[2].priceEurMonthly, 2900);
  assert.equal(res.tiers[3].priceEurMonthly, 29000);

  const billing = engine.processSubscriptionBilling('TENANT_EMBASSY_VC', 'TIER_DAVID_EMBASSY', 'tok_card_executive');
  assert.equal(billing.status, 'SUBSCRIPTION_PROVISIONED_AND_BILLED');
  assert.equal(billing.amountEur, 2900);
  assert.ok(billing.transactionId.startsWith('TX_'));
});
