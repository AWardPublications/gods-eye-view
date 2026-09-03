import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPassport, ParticipantTypes, PassportStates } from '../platform/passport.js';
import { issueDelegationToken, verifyDelegationToken } from './delegation.js';
import { calculateTokenCost, enforceRateLimit, clearRateLimits } from './metering.js';
import { processAgentRequest } from './api.js';
import { runEntireRefinery } from '../knowledge/refinery.js';

// Setup sample assets
await runEntireRefinery();

function makeHuman() {
  return buildPassport(
    { id: "urn:davincia:identity:user:david", name: "David O'Connor" },
    ParticipantTypes.HUMAN,
    ["READ", "TRANSLATE"]
  );
}

function makeAgent() {
  return buildPassport(
    { id: "urn:davincia:identity:agent:slang-bot", name: "Slang Bot" },
    ParticipantTypes.AI_AGENT,
    ["READ", "TRANSLATE"]
  );
}

test('Agent Economy: 1. Issue valid delegation token', () => {
  const hp = makeHuman();
  const ap = makeAgent();
  const token = issueDelegationToken(hp, ap, ["READ"], 3600);
  assert.equal(token.status, "ACTIVE");
  assert.equal(token.receiver_id, ap.passport_id);
});

test('Agent Economy: 2. Delegation block outside scopes', () => {
  const hp = makeHuman();
  const ap = makeAgent();
  const token = issueDelegationToken(hp, ap, ["READ"], 3600);
  const ver = verifyDelegationToken(token, "TRANSLATE", ap, hp);
  assert.equal(ver.valid, false);
  assert.ok(ver.error.includes("outside the delegated scopes"));
});

test('Agent Economy: 3. Expiration of delegation token', () => {
  const hp = makeHuman();
  const ap = makeAgent();
  const token = issueDelegationToken(hp, ap, ["READ"], -10); // Expired 10s ago
  const ver = verifyDelegationToken(token, "READ", ap, hp);
  assert.equal(ver.valid, false);
  assert.ok(ver.error.includes("expired"));
});

test('Agent Economy: 4. Suspended delegator human passport blocks execution', () => {
  const hp = makeHuman();
  hp.status = PassportStates.SUSPENDED;
  const ap = makeAgent();
  const token = issueDelegationToken(hp, ap, ["READ"], 3600);
  const ver = verifyDelegationToken(token, "READ", ap, hp);
  assert.equal(ver.valid, false);
  assert.ok(ver.error.includes("suspended"));
});

test('Agent Economy: 5. Receiver agent mismatch block', () => {
  const hp = makeHuman();
  const ap = makeAgent();
  const anotherAgent = buildPassport({ id: "urn:davincia:identity:agent:other", name: "Other Bot" }, ParticipantTypes.AI_AGENT);
  const token = issueDelegationToken(hp, ap, ["READ"], 3600);
  const ver = verifyDelegationToken(token, "READ", anotherAgent, hp);
  assert.equal(ver.valid, false);
  assert.ok(ver.error.includes("not issued to this AI agent"));
});

test('Agent Economy: 6. Enforce dynamic rate-limiting', () => {
  clearRateLimits();
  const agentId = "urn:davincia:identity:agent:slang-bot";
  for (let i = 0; i < 5; i++) {
    const res = enforceRateLimit(agentId, 5);
    assert.equal(res.permitted, true);
  }
  const resBlock = enforceRateLimit(agentId, 5);
  assert.equal(resBlock.permitted, false);
  assert.ok(resBlock.error.includes("Rate limit exceeded"));
});

test('Agent Economy: 7. Reset rate limits', () => {
  clearRateLimits();
  const agentId = "urn:davincia:identity:agent:slang-bot";
  const resBlock = enforceRateLimit(agentId, 0); // Limit of 0 always blocks
  assert.equal(resBlock.permitted, false);
  
  clearRateLimits();
  const resOk = enforceRateLimit(agentId, 5);
  assert.equal(resOk.permitted, true);
});

test('Agent Economy: 8. Standard tier token cost calculation', () => {
  const cost = calculateTokenCost(100000, 200000, "STANDARD");
  // (100k * 15 + 200k * 60) / 1M = (1.5 + 12) = 13.5
  assert.equal(cost, 13.50);
});

test('Agent Economy: 9. Mini tier is significantly cheaper', () => {
  const standardCost = calculateTokenCost(100000, 200000, "STANDARD");
  const miniCost = calculateTokenCost(100000, 200000, "MINI");
  assert.ok(miniCost < standardCost);
  // (100k * 0.15 + 200k * 0.60) / 1M = (0.015 + 0.12) = 0.135
  assert.equal(miniCost, 0.135);
});

test('Agent Economy: 10. End-to-end delegated execution', async () => {
  clearRateLimits();
  const hp = makeHuman();
  const ap = makeAgent();
  const token = issueDelegationToken(hp, ap, ["READ"], 3600);

  const request = {
    agentPassport: ap,
    humanPassport: hp,
    delegationToken: token,
    assetId: "urn:davincia:knowledge:asset:brehon-ip",
    action: "READ",
    purpose: "DELEGATED_COMPUTATION",
    modelTier: "MINI",
    inputTokens: 50000,
    outputTokens: 100000
  };

  const result = await processAgentRequest(request);
  assert.equal(result.decision.decision, "ALLOW");
  assert.equal(result.commerce_event.pricing_model, "TOKEN_METERED");
  assert.equal(result.commerce_event.price, 0.0675); // (50k * 0.15 + 100k * 0.60) / 1M = 0.0675
});
