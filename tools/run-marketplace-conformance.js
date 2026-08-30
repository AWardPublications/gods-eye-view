import { discoverAssets, getOffer, requestMarketplaceAccess, acceptOffer } from '../src/marketplace/marketplace.js';
import { registerExternalParticipant, suspendExternalParticipant } from '../src/governed-commerce/registration.js';
import { verifyEntitlement } from '../src/governed-commerce/entitlement.js';
import { trackConsumption } from '../src/governed-commerce/metering.js';
import { buildPassport, ParticipantTypes, PassportStates } from '../src/platform/passport.js';
import { lookupCatalogAsset } from '../src/marketplace/catalog.js';
import { verifyOfferIntegrity } from '../src/marketplace/offers.js';
import { MockPaymentProvider } from '../src/governed-commerce/providers/mock.provider.js';

console.log("==================================================");
console.log("DaVinciA+ Marketplace Conformance Scorecard (v0.8)");
console.log("==================================================");

let catalogIntegrityPass = false;
let pricingIntegrityPass = false;
let licenseIntegrityPass = false;
let offerIntegrityPass = false;
let passportValidationPass = false;
let policyAuthorizationPass = false;
let provenanceValidationPass = false;
let entitlementCreationPass = false;
let consumptionControlPass = false;
let meteringPass = false;
let paymentBoundaryPass = false;
let settlementPass = false;
let allocationPass = false;
let evidencePass = false;
let failClosedCommercePass = false;

let unauthorizedSettlements = 0;

try {
  // 1. Onboard participant
  const buyer = registerExternalParticipant({ id: "urn:id:user:m1", name: "Market Buyer" }, "HUMAN");
  passportValidationPass = (buyer && buyer.passport_id.includes("market-buyer"));

  // 2. Discover Catalog & Verify Integrity
  const catalog = discoverAssets();
  catalogIntegrityPass = (catalog.length === 10);

  // 3. Inspect Brehon Asset
  const brehon = lookupCatalogAsset("urn:davincia:knowledge:asset:brehon-ip");
  provenanceValidationPass = (brehon && brehon.provenance_hash !== undefined);

  // 4. Offer, Pricing, License Integrity
  const offer = getOffer("urn:davincia:knowledge:asset:brehon-ip");
  offerIntegrityPass = (offer && offer.integrity_hash !== undefined);
  pricingIntegrityPass = (offer.price === 0.05);
  licenseIntegrityPass = (offer.license_id.includes("brehon"));

  // 5. Run access transaction & Policy Authorization
  const tx = await requestMarketplaceAccess(buyer, "urn:davincia:knowledge:asset:brehon-ip", "READ");
  policyAuthorizationPass = (tx.decision.decision === "ALLOW");
  entitlementCreationPass = (tx.entitlement !== null && tx.entitlement.status === "ACTIVE");

  // 6. Consumption Control & Metering
  const usage = trackConsumption(tx.entitlement, { units: 1, type: "API_CALL" });
  meteringPass = (usage.consumed_units === 1);
  consumptionControlPass = (tx.entitlement.usage_count === 2); // 1 at transaction, 1 here

  // 7. Payment & Settlement
  const provider = new MockPaymentProvider();
  const paymentRecord = await provider.createSettlement(tx.transaction_id, offer.price);
  paymentBoundaryPass = (paymentRecord.status === "CREATED");
  await provider.authorizeSettlement(paymentRecord.settlement_id);
  await provider.captureSettlement(paymentRecord.settlement_id);
  settlementPass = (paymentRecord.status === "CAPTURED");

  // 8. Allocation Payout
  allocationPass = (tx.allocation.reconciled && tx.settlement.platform_fee === 0.01);

  // 9. Evidence Packaging
  evidencePass = (tx.evidence !== null && tx.evidence.chain.decision_ref !== null);

  // 10. Fail-Closed Commerce (Suspended buyer)
  const suspendedBuyer = registerExternalParticipant({ id: "urn:id:user:m2", name: "Suspended Market Buyer" }, "HUMAN");
  suspendExternalParticipant(suspendedBuyer);
  const txFail = await requestMarketplaceAccess(suspendedBuyer, "urn:davincia:knowledge:asset:brehon-ip", "READ");
  failClosedCommercePass = (txFail.status === "FAILED" && txFail.settlement.settlement_status === "FAILED");
  if (txFail.status === "SETTLED") {
    unauthorizedSettlements++;
  }

} catch (e) {
  console.error("Marketplace Conformance Scorecard Error:", e);
}

const scores = [
  catalogIntegrityPass, pricingIntegrityPass, licenseIntegrityPass,
  offerIntegrityPass, passportValidationPass, policyAuthorizationPass,
  provenanceValidationPass, entitlementCreationPass, consumptionControlPass,
  meteringPass, paymentBoundaryPass, settlementPass, allocationPass,
  evidencePass, failClosedCommercePass
];

const totalScore = scores.filter(Boolean).length;
const overallPass = (totalScore === 15) && (unauthorizedSettlements === 0);

console.log("\nDAVINCIA⁺ MARKETPLACE CONFORMANCE SCORECARD");
console.log("============================================\n");
console.log(`CATALOG INTEGRITY:         ${catalogIntegrityPass ? "PASS" : "FAIL"}`);
console.log(`PRICING INTEGRITY:         ${pricingIntegrityPass ? "PASS" : "FAIL"}`);
console.log(`LICENSE INTEGRITY:         ${licenseIntegrityPass ? "PASS" : "FAIL"}`);
console.log(`OFFER INTEGRITY:           ${offerIntegrityPass ? "PASS" : "FAIL"}`);
console.log(`PASSPORT VALIDATION:       ${passportValidationPass ? "PASS" : "FAIL"}`);
console.log(`POLICY AUTHORIZATION:      ${policyAuthorizationPass ? "PASS" : "FAIL"}`);
console.log(`PROVENANCE VALIDATION:     ${provenanceValidationPass ? "PASS" : "FAIL"}`);
console.log(`ENTITLEMENT CREATION:      ${entitlementCreationPass ? "PASS" : "FAIL"}`);
console.log(`CONSUMPTION CONTROL:       ${consumptionControlPass ? "PASS" : "FAIL"}`);
console.log(`METERING:                  ${meteringPass ? "PASS" : "FAIL"}`);
console.log(`PAYMENT BOUNDARY:          ${paymentBoundaryPass ? "PASS" : "FAIL"}`);
console.log(`SETTLEMENT:                ${settlementPass ? "PASS" : "FAIL"}`);
console.log(`ALLOCATION:                ${allocationPass ? "PASS" : "FAIL"}`);
console.log(`EVIDENCE:                  ${evidencePass ? "PASS" : "FAIL"}`);
console.log(`FAIL-CLOSED COMMERCE:      ${failClosedCommercePass ? "PASS" : "FAIL"}`);
console.log(`\nUNAUTHORIZED SETTLEMENTS:  ${unauthorizedSettlements} REQUIRED (0)`);
console.log(`\nSCORE: ${totalScore}/15`);
console.log(`STATUS: ${overallPass ? "CONFORMANT" : "NON-CONFORMANT"}`);
console.log("============================================\n");

process.exit(overallPass ? 0 : 1);
