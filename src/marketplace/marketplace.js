import { CatalogAssets, lookupCatalogAsset } from './catalog.js';
import { createOffer, verifyOfferIntegrity } from './offers.js';
import { lookupPricingPlan } from './pricing.js';
import { lookupLicenseTemplate } from './licensing.js';
import { executeGovernedTransaction } from '../governed-commerce/transaction.js';
import { trackConsumption } from '../governed-commerce/metering.js';
import { compileEvidencePackage } from '../governed-commerce/evidence.js';
import { calculateAllocation } from '../governed-commerce/allocation.js';
import { verifyExternalPassport } from '../governed-commerce/registration.js';

export function discoverAssets() {
  return CatalogAssets.map(asset => {
    // Hide facts/payloads in catalog metadata listings
    return {
      asset_id: asset.asset_id,
      title: asset.title,
      owner: asset.owner,
      description: asset.description,
      asset_class: asset.asset_class,
      version: asset.version,
      classification: asset.classification,
      permitted_actions: asset.permitted_actions,
      pricing: asset.pricing_plan,
      license: asset.license_id,
      status: asset.status
    };
  });
}

export function getOffer(assetId) {
  return createOffer(assetId);
}

export async function requestMarketplaceAccess(passport, assetId, action, paymentToken = "MOCK_CHECKOUT", context = {}) {
  const asset = lookupCatalogAsset(assetId);
  if (!asset) {
    return {
      status: "FAILED",
      reason: "UNKNOWN_ASSET",
      settlement: { settlement_status: "FAILED", price: 0.00 }
    };
  }

  // Verify passport validation first
  const ver = verifyExternalPassport(passport);
  if (!ver.valid) {
    return {
      status: "FAILED",
      reason: ver.error || "INVALID_PASSPORT",
      settlement: { settlement_status: "FAILED", price: 0.00 }
    };
  }

  const request = {
    humanPassport: passport,
    assetId: asset.asset_id,
    action,
    paymentToken,
    payload: { ...context }
  };

  // Delegate directly to core transaction orchestrator (FROZEN kernel safe)
  return executeGovernedTransaction(request);
}

export function acceptOffer(offer, passport) {
  const asset = lookupCatalogAsset(offer.asset_id);
  const plan = lookupPricingPlan(asset?.pricing_plan);
  const license = lookupLicenseTemplate(asset?.license_id);
  
  const check = verifyOfferIntegrity(offer, asset, plan, license);
  if (!check.valid) {
    throw new Error(check.error);
  }

  const ver = verifyExternalPassport(passport);
  if (!ver.valid) {
    throw new Error(`Cannot accept offer: ${ver.error}`);
  }

  return {
    acceptance_id: `urn:davincia:acceptance:${Math.random().toString(36).substring(2, 10)}`,
    offer_id: offer.offer_id,
    buyer_id: passport.passport_id,
    accepted_at: new Date().toISOString(),
    status: "ACCEPTED"
  };
}
