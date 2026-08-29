import test from 'node:test';
import assert from 'node:assert/strict';
import { issuePassport, verifyPassport } from './client.js';

test('Platform Foundation: Passport generation yields valid properties', () => {
  const identity = {
    id: "urn:davincia:identity:system:fixture-os",
    name: "Fixture OS",
    type: "SYSTEM"
  };
  const capabilities = ["TRANSLATE", "READ"];
  const passport = issuePassport(identity, capabilities);

  assert.equal(passport.identity.name, "Fixture OS");
  assert.equal(passport.identity.type, "SYSTEM");
  assert.deepEqual(passport.capabilities, ["TRANSLATE", "READ"]);
  assert.ok(passport.passport_id.startsWith("urn:davincia:passport:system:"));
  assert.ok(passport.signature);
});

test('Platform Foundation: Valid passport is successfully verified', async () => {
  const identity = {
    id: "urn:davincia:identity:user:david",
    name: "David",
    type: "HUMAN"
  };
  const passport = issuePassport(identity, ["READ", "TRANSLATE"]);
  const actor = { id: "urn:davincia:identity:user:david", class: "HUMAN" };

  const decision = await verifyPassport(passport, "READ", actor);
  assert.equal(decision.status, "ALLOW");
});

test('Platform Foundation: Passport fails closed for expired validity', async () => {
  const identity = {
    id: "urn:davincia:identity:agent:unauthorized-bot",
    name: "Unauthorized Bot",
    type: "AI_AGENT"
  };
  const passport = issuePassport(identity, ["READ"]);
  passport.expires_at = new Date(Date.now() - 10000).toISOString(); // Expired 10s ago

  const actor = { id: "urn:davincia:identity:user:david", class: "HUMAN" };
  const decision = await verifyPassport(passport, "READ", actor);

  assert.equal(decision.status, "DENY");
  assert.equal(decision.reason_code, "PASSPORT_EXPIRED");
});

test('Platform Foundation: Passport fails closed for insufficient capabilities', async () => {
  const identity = {
    id: "urn:davincia:identity:system:fixture-os",
    name: "Fixture OS",
    type: "SYSTEM"
  };
  const passport = issuePassport(identity, ["READ"]); // Declares only READ
  const actor = { id: "urn:davincia:identity:user:david", class: "HUMAN" };

  const decision = await verifyPassport(passport, "TRANSLATE", actor); // Requests TRANSLATE

  assert.equal(decision.status, "DENY");
  assert.equal(decision.reason_code, "INSUFFICIENT_CAPABILITIES");
});

test('Platform Foundation: Passport fails closed on unverified state', async () => {
  const identity = {
    id: "urn:davincia:identity:system:fixture-os",
    name: "Fixture OS",
    type: "SYSTEM"
  };
  const passport = issuePassport(identity, ["READ"], null, "UNVERIFIED");
  const actor = { id: "urn:davincia:identity:user:david", class: "HUMAN" };

  const decision = await verifyPassport(passport, "READ", actor);

  assert.equal(decision.status, "DENY");
  assert.equal(decision.reason_code, "UNVERIFIED_PASSPORT");
});
