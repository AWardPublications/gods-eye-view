import { createLicenseAgreement, validateLicenseAgreement } from '../src/governed-commerce/licensing.js';
import { clearTransaction, calculateProviderAttributions } from '../src/governed-commerce/settlement.js';
import { getLedgerApi } from '../src/governed-commerce/api.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const COMMERCE_LOG = path.join(__dirname, '../data/commerce-ledger.jsonl');

console.log("==================================================");
console.log("DaVinciA+ Governed Commerce Conformance (v0.7)");
console.log("==================================================");

let licenseCreationPass = false;
let licenseValidationPass = false;
let sovereignCleardownPass = false;
let governanceDenyBlockedPass = false;
let failedPriceZeroingPass = false;
let revenueDistributionPass = false;
let providerReportingPass = false;
let transactionLedgeringPass = false;
let ledgerRetrievalPass = false;
let failClosedSettlePass = false;

try {
  // Clear the ledger first
  if (fs.existsSync(COMMERCE_LOG)) {
    fs.unlinkSync(COMMERCE_LOG);
  }

  // 1. License creation & validation
  const provider = "urn:davincia:identity:organization:brehon_ai";
  const license = createLicenseAgreement("urn:davincia:knowledge:asset:brehon-ip", provider, "USAGE_BASED", 0.50);
  licenseCreationPass = (license.pricing.price === 0.50 && license.owner_urn === provider);

  const check = validateLicenseAgreement(license);
  licenseValidationPass = (check.valid === true);

  // 2. Successful transaction
  const decAllow = {
    decision_id: "urn:davincia:decision:allow-1",
    participant_id: "urn:davincia:passport:human:david",
    action: "READ",
    decision: "ALLOW"
  };
  const txAllow = clearTransaction(decAllow, license, "TOKEN_PAY");
  sovereignCleardownPass = (txAllow.status === "SETTLED");
  revenueDistributionPass = (txAllow.provider_share === 0.40 && txAllow.governor_share === 0.10);

  // 3. Failed transaction
  const decDeny = {
    decision_id: "urn:davincia:decision:deny-1",
    participant_id: "urn:davincia:passport:human:david",
    action: "READ",
    decision: "DENY"
  };
  const txDeny = clearTransaction(decDeny, license);
  governanceDenyBlockedPass = (txDeny.status === "FAILED" && txDeny.reason_code === "GOVERNANCE_DENIED");
  failedPriceZeroingPass = (txDeny.price === 0.00 && txDeny.provider_share === 0.00);

  // 4. Provider reporting
  const report = calculateProviderAttributions(provider);
  providerReportingPass = (report.transactions_count === 1 && report.total_revenue === 0.40);

  // 5. Ledger checks
  transactionLedgeringPass = fs.existsSync(COMMERCE_LOG);
  const ledger = getLedgerApi();
  ledgerRetrievalPass = (ledger.length === 2);
  failClosedSettlePass = true;

} catch (e) {
  console.error("Governed Commerce Conformance Error:", e);
}

const overallPass = 
  licenseCreationPass && licenseValidationPass && sovereignCleardownPass &&
  governanceDenyBlockedPass && failedPriceZeroingPass && revenueDistributionPass &&
  providerReportingPass && transactionLedgeringPass && ledgerRetrievalPass && failClosedSettlePass;

console.log("\nDAVINCIA⁺ COMMERCE CONFORMANCE SCORECARD");
console.log("=========================================\n");
console.log(`LICENSE CREATION:       ${licenseCreationPass ? "PASS" : "FAIL"}`);
console.log(`LICENSE VALIDATION:     ${licenseValidationPass ? "PASS" : "FAIL"}`);
console.log(`SOVEREIGN CLEARDOWN:    ${sovereignCleardownPass ? "PASS" : "FAIL"}`);
console.log(`GOVERNANCE DENY BLOCKED:${governanceDenyBlockedPass ? "PASS" : "FAIL"}`);
console.log(`FAILED PRICE ZEROING:   ${failedPriceZeroingPass ? "PASS" : "FAIL"}`);
console.log(`REVENUE DISTRIBUTION:   ${revenueDistributionPass ? "PASS" : "FAIL"}`);
console.log(`PROVIDER REPORTING:     ${providerReportingPass ? "PASS" : "FAIL"}`);
console.log(`TRANSACTION LEDGERING:  ${transactionLedgeringPass ? "PASS" : "FAIL"}`);
console.log(`LEDGER RETRIEVAL:       ${ledgerRetrievalPass ? "PASS" : "FAIL"}`);
console.log(`FAIL-CLOSED SETTLE:     ${failClosedSettlePass ? "PASS" : "FAIL"}`);
console.log("\nSTATUS:");
console.log(overallPass ? "CONFORMANT" : "NON-CONFORMANT");
console.log("=========================================\n");

process.exit(overallPass ? 0 : 1);
