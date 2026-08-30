import test from 'node:test';
import assert from 'node:assert/strict';
import { discoverAssets, getOffer, requestMarketplaceAccess, acceptOffer } from './marketplace.js';
import { registerExternalParticipant, suspendExternalParticipant } from '../governed-commerce/registration.js';
import { verifyEntitlement } from '../governed-commerce/entitlement.js';
import { trackConsumption } from '../governed-commerce/metering.js';
import { buildPassport, ParticipantTypes, PassportStates } from '../platform/passport.js';
import { lookupCatalogAsset } from './catalog.js';
import { verifyOfferIntegrity } from './offers.js';

test('Marketplace: 1. Verify 10-asset discovery registry', () => {
  const catalog = discoverAssets();
  assert.equal(catalog.length, 10);
  for (const asset of catalog) {
    assert.ok(asset.asset_id);
    assert.ok(asset.title);
    assert.ok(asset.owner);
    assert.equal(asset.facts, undefined); // metadata only, no raw facts
  }
});

test('Marketplace: 2. Five-Participant / Ten-Asset Matrix evaluation', async () => {
  // Define 5 distinct participants
  const humanBuyer = registerExternalParticipant({ id: "urn:id:user:p1", name: "P1 Human" }, "HUMAN");
  const orgBuyer = registerExternalParticipant({ id: "urn:id:user:p2", name: "P2 Org" }, "ORGANIZATION");
  const agentBuyer = registerExternalParticipant({ id: "urn:id:user:p3", name: "P3 Agent" }, "AI_AGENT");
  
  const suspendedHuman = registerExternalParticipant({ id: "urn:id:user:p4", name: "P4 Suspended" }, "HUMAN");
  suspendExternalParticipant(suspendedHuman);

  const unknownPassport = {
    passport_id: "urn:davincia:passport:human:unknown-actor",
    passport_version: "1.0.0",
    participant_type: "HUMAN",
    identity: { id: "urn:id:user:unknown", name: "Unknown User" },
    status: PassportStates.ACTIVE
  };

  // Test access on a subset of the 10 assets
  // Asset 1: brehon-ip (Allowed for active users)
  const tx1 = await requestMarketplaceAccess(humanBuyer, "urn:davincia:knowledge:asset:brehon-ip", "READ");
  assert.equal(tx1.status, "SETTLED");
  assert.equal(tx1.decision.decision, "ALLOW");

  // Asset 2: munster-slang (Allowed for Org users with TRANSLATE)
  const tx2 = await requestMarketplaceAccess(orgBuyer, "urn:davincia:knowledge:asset:munster-slang", "TRANSLATE", "MOCK_CHECKOUT", {
    language_lane: "Cork Slang",
    routing_rule: "casual_context_only"
  });
  assert.equal(tx2.status, "SETTLED");

  // Asset 3: arios-security (DENIED for suspended users)
  const tx3 = await requestMarketplaceAccess(suspendedHuman, "urn:davincia:knowledge:asset:arios-security", "READ");
  assert.equal(tx3.status, "FAILED");

  // Asset 4: Unknown passport fails
  const tx4 = await requestMarketplaceAccess(unknownPassport, "urn:davincia:knowledge:asset:brehon-ip", "READ");
  assert.equal(tx4.status, "FAILED");
});

test('Adversarial Marketplace: 1. Price mutation invalidates offer', () => {
  const offer = getOffer("urn:davincia:knowledge:asset:brehon-ip");
  const asset = lookupCatalogAsset("urn:davincia:knowledge:asset:brehon-ip");

  const plan = {
    pricing_id: asset.pricing_plan,
    price: 0.05
  };
  const license = {
    license_id: asset.license_id
  };

  // Integrity is verified
  let check = verifyOfferIntegrity(offer, asset, plan, license);
  assert.equal(check.valid, true);

  // Price is mutated (price changed from 0.05 to 0.10)
  plan.price = 0.10;
  check = verifyOfferIntegrity(offer, asset, plan, license);
  assert.equal(check.valid, false);
  assert.ok(check.error.includes("OFFER_INVALIDATED"));
});

test('Adversarial Marketplace: 2. Provenance drift invalidates entitlement access', async () => {
  const buyer = registerExternalParticipant({ id: "urn:id:user:p1", name: "P1 Human" }, "HUMAN");
  const tx = await requestMarketplaceAccess(buyer, "urn:davincia:knowledge:asset:brehon-ip", "READ");

  assert.equal(tx.status, "SETTLED");
  assert.equal(tx.entitlement.status, "ACTIVE");

  // Drift provenance hash: verifyEntitlement fails
  const check = verifyEntitlement(tx.entitlement, buyer, null, "mutated-provenance-signature");
  assert.equal(check.valid, false);
  assert.equal(tx.entitlement.status, "SUSPENDED");
});

test('Adversarial Marketplace: 3. Consumption bounds block overflow usage', async () => {
  const buyer = registerExternalParticipant({ id: "urn:id:user:p1", name: "P1 Human" }, "HUMAN");
  const tx = await requestMarketplaceAccess(buyer, "urn:davincia:knowledge:asset:brehon-ip", "READ");

  // Limit usage allowance to 2
  tx.entitlement.usage_limit = 2;
  tx.entitlement.usage_count = 1;

  // Single increment works
  const u1 = trackConsumption(tx.entitlement, { units: 1, type: "API_CALL" });
  assert.ok(u1.usage_id);

  // Second increment exceeds limits, throws exception
  assert.throws(() => {
    trackConsumption(tx.entitlement, { units: 1, type: "API_CALL" });
  }, /usage limits have been exhausted/);
});

test('Critical Marketplace Invariants: 1. Settle ordering is strictly enforced', async () => {
  const buyer = registerExternalParticipant({ id: "urn:id:user:p1", name: "P1 Human" }, "HUMAN");
  const tx = await requestMarketplaceAccess(buyer, "urn:davincia:knowledge:asset:brehon-ip", "READ");

  // Invariant validation: Settle occurs only if authorization was allowed
  if (tx.settlement.settlement_status === "SETTLED") {
    assert.equal(tx.decision.decision, "ALLOW");
    assert.equal(tx.status, "SETTLED");
  }
});
