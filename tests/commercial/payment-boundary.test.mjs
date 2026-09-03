import test from 'node:test';
import assert from 'node:assert/strict';
import { MockPaymentProvider } from '../../src/governed-commerce/providers/mock.provider.js';

test('Payment Boundary: 1. Create and capture mock payment clearing status', async () => {
  const provider = new MockPaymentProvider();
  const tx = await provider.createSettlement("tx-1", 0.05, "USD");
  assert.equal(tx.status, "CREATED");
  assert.equal(tx.payout_type, "SIMULATED_SETTLEMENT");

  const auth = await provider.authorizeSettlement(tx.settlement_id);
  assert.equal(auth.status, "AUTHORIZED");

  const capture = await provider.captureSettlement(tx.settlement_id);
  assert.equal(capture.status, "CAPTURED");
});

test('Payment Boundary: 2. Perform payment refund transitions', async () => {
  const provider = new MockPaymentProvider();
  const tx = await provider.createSettlement("tx-2", 0.10, "USD");
  await provider.authorizeSettlement(tx.settlement_id);
  await provider.captureSettlement(tx.settlement_id);

  const refund = await provider.refundSettlement(tx.settlement_id);
  assert.equal(refund.status, "REFUNDED");
});
