import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TriUniverseSubscriptionEngine } from '../../../davidos/triUniverseSubscriptionEngine.mjs';

test('1. TriUniverseSubscriptionEngine manages subscription tiers and processes tenant billing', () => {
  const engine = new TriUniverseSubscriptionEngine();
  const res = engine.compileSubscriptionModel();

  assert.equal(res.status, 'TRI_UNIVERSE_SUBSCRIPTION_MODEL_RATIFIED');
  assert.equal(res.tiersCount, 4);
  assert.equal(engine.licensingEntity, 'Brehon AI Solutions Ltd (BAIS) — Commercial Licensee');
  assert.equal(engine.ipHoldcoEntity, 'A.Ward Publications / D&A.Ward Editions Ltd — Sovereign IP Holdco');
  assert.equal(res.tiers[1].targetAudience, 'B2B PGA Professional Coaches & Adult Competitors Only (18+ Strict)');

  const billing = engine.processSubscriptionBilling('TENANT_EMBASSY_VC', 'TIER_DAVID_EMBASSY', 'tok_card_executive');
  assert.equal(billing.status, 'SUBSCRIPTION_PROVISIONED_AND_BILLED');
  assert.equal(billing.amountEur, 2900);
  assert.ok(billing.transactionId.startsWith('TX_'));
});

test('2. TriUniverseSubscriptionEngine enforces POL-003 Risk Gate pausing on zero tokens or safety flag', () => {
  const engine = new TriUniverseSubscriptionEngine();

  // Test 1: Zero tokens -> Paused for HITL
  const gate1 = engine.evaluatePol003RiskGate(0, false);
  assert.equal(gate1.gateStatus, 'PAUSED_FOR_HITL_AUTHORISATION');
  assert.equal(gate1.reason, 'ZERO_TOKENS_REMAINING');
  assert.equal(gate1.bypassAllowed, false);

  // Test 2: Active safety flag -> Paused for HITL
  const gate2 = engine.evaluatePol003RiskGate(500, true);
  assert.equal(gate2.gateStatus, 'PAUSED_FOR_HITL_AUTHORISATION');
  assert.equal(gate2.reason, 'SAFETY_FLAG_RAISED');
  assert.equal(gate2.bypassAllowed, false);
});

