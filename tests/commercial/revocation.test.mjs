import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyEntitlement } from '../../src/governed-commerce/entitlement.js';
import { buildPassport, ParticipantTypes, PassportStates } from '../../src/platform/passport.js';

test('Revocation: 1. Revoked delegator human passport suspends entitlement verification', () => {
  const hp = buildPassport({ id: "urn:id:user:david", name: "David" }, ParticipantTypes.HUMAN, ["READ"]);
  const entitlement = {
    entitlement_id: "ent-1",
    status: "ACTIVE",
    revocation_state: "NONE",
    expires_at: new Date(Date.now() + 3600000).toISOString(),
    usage_limit: 10,
    usage_count: 0
  };

  // Initially active and valid
  let ver = verifyEntitlement(entitlement, hp, null);
  assert.equal(ver.valid, true);

  // Suspend human delegator
  hp.status = PassportStates.SUSPENDED;
  ver = verifyEntitlement(entitlement, hp, null);
  assert.equal(ver.valid, false);
  assert.ok(ver.error.includes("suspended"));
});

test('Revocation: 2. Revoked/suspended receiver agent passport blocks entitlement validation', () => {
  const hp = buildPassport({ id: "urn:id:user:david", name: "David" }, ParticipantTypes.HUMAN, ["READ"]);
  const ap = buildPassport({ id: "urn:id:agent:slang-bot", name: "Slang Bot" }, ParticipantTypes.AI_AGENT, ["READ"]);
  const entitlement = {
    entitlement_id: "ent-1",
    status: "ACTIVE",
    revocation_state: "NONE",
    expires_at: new Date(Date.now() + 3600000).toISOString(),
    usage_limit: 10,
    usage_count: 0
  };

  // Suspend receiver agent
  ap.status = PassportStates.SUSPENDED;
  const ver = verifyEntitlement(entitlement, hp, ap);
  assert.equal(ver.valid, false);
  assert.ok(ver.error.includes("suspended"));
});
