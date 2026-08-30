import test from 'node:test';
import assert from 'node:assert/strict';
import { registerExternalParticipant, verifyExternalPassport, suspendExternalParticipant } from '../../src/governed-commerce/registration.js';
import { discoverAssets } from '../../src/governed-commerce/discovery.js';
import { executeGovernedTransaction } from '../../src/governed-commerce/transaction.js';
import { verifyEntitlement } from '../../src/governed-commerce/entitlement.js';
import { buildPassport, ParticipantTypes, PassportStates } from '../../src/platform/passport.js';

test('Golden External Journey: 1. Complete end-to-end transaction cycle for external buyer', async () => {
  // 1. Onboard external buyer
  const externalHuman = registerExternalParticipant({
    id: "urn:id:user:external-research-org",
    name: "External Research Organisation"
  }, "HUMAN");

  const ver = verifyExternalPassport(externalHuman);
  assert.equal(ver.valid, true);

  // 2. Discover catalog assets
  const catalog = discoverAssets();
  const brehonAsset = catalog.find(a => a.asset_id === "urn:davincia:knowledge:asset:brehon-ip");
  assert.ok(brehonAsset);
  assert.equal(brehonAsset.pricing_model, "USAGE_BASED");
  assert.equal(brehonAsset.price, 0.05);

  // 3. Request governed access & authorize
  const request = {
    humanPassport: externalHuman,
    assetId: brehonAsset.asset_id,
    action: "READ",
    purpose: "EXTERNAL_RESEARCH_STUDY"
  };

  const tx = await executeGovernedTransaction(request);

  // 4. Verify output object matching golden path requirements
  assert.equal(tx.status, "SETTLED");
  assert.equal(tx.decision.decision, "ALLOW");
  assert.equal(tx.entitlement.status, "ACTIVE");
  assert.equal(tx.settlement.settlement_status, "SETTLED");
  assert.equal(tx.settlement.platform_fee, 0.01);
  assert.equal(tx.settlement.owner_amount, 0.04);
  assert.equal(tx.evidence.chain.entitlement_ref, tx.entitlement.entitlement_id);
});

test('Negative Journeys: 1. Unknown participant is denied', async () => {
  const hostilePassport = {
    passport_id: "urn:davincia:passport:ai_agent:rogue-bot",
    passport_version: "1.0.0",
    participant_type: "AI_AGENT",
    identity: { id: "urn:id:agent:rogue-bot", name: "Rogue Bot" },
    status: PassportStates.ACTIVE
  };

  const tx = await executeGovernedTransaction({
    agentPassport: hostilePassport,
    assetId: "urn:davincia:knowledge:asset:brehon-ip",
    action: "READ"
  });

  assert.equal(tx.status, "FAILED");
  assert.equal(tx.settlement.settlement_status, "FAILED");
  assert.equal(tx.settlement.price, 0.00);
});

test('Negative Journeys: 2. Expired passport is denied', async () => {
  const expiredHuman = buildPassport({ id: "urn:id:user:external-research-org", name: "External Research Organisation" }, ParticipantTypes.HUMAN, ["READ"], {
    expires_at: new Date(Date.now() - 3600000).toISOString()
  });

  const tx = await executeGovernedTransaction({
    humanPassport: expiredHuman,
    assetId: "urn:davincia:knowledge:asset:brehon-ip",
    action: "READ"
  });

  assert.equal(tx.status, "FAILED");
});

test('Negative Journeys: 3. Revoked passport is denied', async () => {
  const externalHuman = registerExternalParticipant({
    id: "urn:id:user:external-research-org",
    name: "External Research Organisation"
  }, "HUMAN");

  suspendExternalParticipant(externalHuman);

  const tx = await executeGovernedTransaction({
    humanPassport: externalHuman,
    assetId: "urn:davincia:knowledge:asset:brehon-ip",
    action: "READ"
  });

  assert.equal(tx.status, "FAILED");
});

test('Negative Journeys: 4. Unauthorized asset action is denied', async () => {
  const externalHuman = registerExternalParticipant({
    id: "urn:id:user:external-research-org",
    name: "External Research Organisation"
  }, "HUMAN");

  const tx = await executeGovernedTransaction({
    humanPassport: externalHuman,
    assetId: "urn:davincia:knowledge:asset:brehon-ip",
    action: "TRANSFORM" // Prohibited action in brehon-ip policy rules
  });

  assert.equal(tx.status, "FAILED");
});

test('Negative Journeys: 5. Asset provenance drift invalidates entitlement', async () => {
  const externalHuman = registerExternalParticipant({
    id: "urn:id:user:external-research-org",
    name: "External Research Organisation"
  }, "HUMAN");

  const tx = await executeGovernedTransaction({
    humanPassport: externalHuman,
    assetId: "urn:davincia:knowledge:asset:brehon-ip",
    action: "READ"
  });

  assert.equal(tx.entitlement.status, "ACTIVE");

  const driftCheck = verifyEntitlement(tx.entitlement, externalHuman, null, "drifted-provenance-signature-hash");
  assert.equal(driftCheck.valid, false);
  assert.equal(tx.entitlement.status, "SUSPENDED");
});

test('Critical Commerce Invariants: 1. Verify ordering and evidence assertions', async () => {
  let commerceBeforeGovCount = 0;
  let unauthorizedSettlementCount = 0;
  let missingEvidenceCount = 0;

  const externalHuman = registerExternalParticipant({
    id: "urn:id:user:external-research-org",
    name: "External Research Organisation"
  }, "HUMAN");

  const tx = await executeGovernedTransaction({
    humanPassport: externalHuman,
    assetId: "urn:davincia:knowledge:asset:brehon-ip",
    action: "READ"
  });

  // Verify ordering: governance decision MUST exist before entitlement is generated
  if (tx.entitlement && !tx.decision) {
    commerceBeforeGovCount++;
  }

  // Verify unauthorized settlements is zero
  if (tx.status === "SETTLED" && tx.decision.decision !== "ALLOW") {
    unauthorizedSettlementCount++;
  }

  // Verify missing evidence is zero
  if (tx.status === "SETTLED" && !tx.evidence) {
    missingEvidenceCount++;
  }

  assert.equal(commerceBeforeGovCount, 0);
  assert.equal(unauthorizedSettlementCount, 0);
  assert.equal(missingEvidenceCount, 0);
});
