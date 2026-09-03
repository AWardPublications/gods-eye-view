import test from 'node:test';
import assert from 'node:assert/strict';
import { createLicenseAgreement, validateLicenseAgreement } from './licensing.js';
import { clearTransaction, calculateProviderAttributions } from './settlement.js';
import { createAgreementApi, transactApi, getLedgerApi } from './api.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const COMMERCE_LOG = path.join(__dirname, '../../data/commerce-ledger.jsonl');

test('Governed Commerce: 1. Create dynamic license agreement', () => {
  const license = createLicenseAgreement(
    "urn:davincia:knowledge:asset:brehon-ip",
    "urn:davincia:identity:organization:brehon_ai",
    "USAGE_BASED",
    0.05
  );
  assert.equal(license.pricing.type, "USAGE_BASED");
  assert.equal(license.pricing.price, 0.05);
});

test('Governed Commerce: 2. Reject negative price limits', () => {
  assert.throws(() => {
    createLicenseAgreement(
      "urn:davincia:knowledge:asset:brehon-ip",
      "urn:davincia:identity:organization:brehon_ai",
      "USAGE_BASED",
      -0.01
    );
  }, /Price cannot be negative/);
});

test('Governed Commerce: 3. Validate license schema structure', () => {
  const license = createLicenseAgreement(
    "urn:davincia:knowledge:asset:brehon-ip",
    "urn:davincia:identity:organization:brehon_ai",
    "USAGE_BASED",
    0.05
  );
  const check = validateLicenseAgreement(license);
  assert.equal(check.valid, true);
});

test('Governed Commerce: 4. Settle a successful transaction', () => {
  const license = createLicenseAgreement(
    "urn:davincia:knowledge:asset:brehon-ip",
    "urn:davincia:identity:organization:brehon_ai",
    "USAGE_BASED",
    0.05
  );
  const decision = {
    decision_id: "urn:davincia:decision:allow-12345",
    participant_id: "urn:davincia:passport:human:david",
    action: "READ",
    decision: "ALLOW"
  };
  const tx = clearTransaction(decision, license, "TEST_PAYMENT_TOKEN");
  assert.equal(tx.status, "SETTLED");
  assert.equal(tx.price, 0.05);
  assert.equal(tx.payment_token, "TEST_PAYMENT_TOKEN");
});

test('Governed Commerce: 5. Revenue share attribution split (80/20)', () => {
  const license = createLicenseAgreement(
    "urn:davincia:knowledge:asset:brehon-ip",
    "urn:davincia:identity:organization:brehon_ai",
    "USAGE_BASED",
    0.10
  );
  const decision = {
    decision_id: "urn:davincia:decision:allow-12345",
    participant_id: "urn:davincia:passport:human:david",
    action: "READ",
    decision: "ALLOW"
  };
  const tx = clearTransaction(decision, license);
  assert.equal(tx.provider_share, 0.08); // 80% of 0.10
  assert.equal(tx.governor_share, 0.02);  // 20% of 0.10
});

test('Governed Commerce: 6. Block failed transaction downstream of DENY decision', () => {
  const license = createLicenseAgreement(
    "urn:davincia:knowledge:asset:brehon-ip",
    "urn:davincia:identity:organization:brehon_ai",
    "USAGE_BASED",
    0.05
  );
  const decision = {
    decision_id: "urn:davincia:decision:deny-12345",
    participant_id: "urn:davincia:passport:human:david",
    action: "READ",
    decision: "DENY"
  };
  const tx = clearTransaction(decision, license);
  assert.equal(tx.status, "FAILED");
  assert.equal(tx.reason_code, "GOVERNANCE_DENIED");
});

test('Governed Commerce: 7. Governance sovereignty rule: failed transaction price is zero', () => {
  const license = createLicenseAgreement(
    "urn:davincia:knowledge:asset:brehon-ip",
    "urn:davincia:identity:organization:brehon_ai",
    "USAGE_BASED",
    100.00 // Intended price is $100
  );
  const decision = {
    decision_id: "urn:davincia:decision:deny-12345",
    participant_id: "urn:davincia:passport:human:david",
    action: "READ",
    decision: "DENY"
  };
  const tx = clearTransaction(decision, license);
  assert.equal(tx.price, 0.00); // Sovereign rule: charge must be reset to zero on block
  assert.equal(tx.provider_share, 0.00);
});

test('Governed Commerce: 8. Provider revenue share reporting', () => {
  // Clear the ledger first
  if (fs.existsSync(COMMERCE_LOG)) {
    fs.unlinkSync(COMMERCE_LOG);
  }

  const provider = "urn:davincia:identity:organization:brehon_ai";
  const license = createLicenseAgreement(
    "urn:davincia:knowledge:asset:brehon-ip",
    provider,
    "USAGE_BASED",
    0.50
  );
  const decision = {
    decision_id: "urn:davincia:decision:allow-12345",
    participant_id: "urn:davincia:passport:human:david",
    action: "READ",
    decision: "ALLOW"
  };

  // Perform 3 transactions -> total revenue share = 3 * (0.50 * 0.8) = 3 * 0.4 = 1.2
  clearTransaction(decision, license);
  clearTransaction(decision, license);
  clearTransaction(decision, license);

  const report = calculateProviderAttributions(provider);
  assert.equal(report.transactions_count, 3);
  assert.equal(report.total_revenue, 1.20);
});

test('Governed Commerce: 9. Dynamic license creation API wrapper', () => {
  const license = createAgreementApi({
    assetId: "urn:davincia:knowledge:asset:brehon-ip",
    owner: "urn:davincia:identity:organization:brehon_ai",
    pricingType: "USAGE_BASED",
    price: 0.25
  });
  assert.equal(license.pricing.price, 0.25);
  assert.equal(license.owner_urn, "urn:davincia:identity:organization:brehon_ai");
});

test('Governed Commerce: 10. Commerce transaction execution and ledger output API wrappers', () => {
  const license = createLicenseAgreement(
    "urn:davincia:knowledge:asset:brehon-ip",
    "urn:davincia:identity:organization:brehon_ai",
    "USAGE_BASED",
    0.05
  );
  const decision = {
    decision_id: "urn:davincia:decision:allow-54321",
    participant_id: "urn:davincia:passport:human:david",
    action: "READ",
    decision: "ALLOW"
  };

  const tx = transactApi({
    accessDecision: decision,
    licenseAgreement: license,
    paymentToken: "MOCK_GATEWAY_TOKEN"
  });

  assert.equal(tx.status, "SETTLED");
  const ledger = getLedgerApi();
  const found = ledger.some(t => t.transaction_id === tx.transaction_id);
  assert.ok(found);
});
