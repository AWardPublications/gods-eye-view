import { lookupCatalogAsset } from './catalog.js';
import { lookupPricingPlan } from './pricing.js';
import { lookupLicenseTemplate } from './licensing.js';

export function calculateOfferHash(asset, pricingPlan, licenseTemplate) {
  const parts = [
    asset.asset_id,
    asset.provenance_hash || "no-prov",
    asset.governance_policy || "no-policy",
    pricingPlan?.pricing_id || "no-price",
    pricingPlan?.price?.toString() || "0",
    licenseTemplate?.license_id || "no-license"
  ];
  return `sha256-offer-integrity-${parts.join(':').replace(/\s+/g, '-')}`;
}

export function createOffer(assetId) {
  const asset = lookupCatalogAsset(assetId);
  if (!asset) return null;

  const pricePlan = lookupPricingPlan(asset.pricing_plan);
  const license = lookupLicenseTemplate(asset.license_id);
  const hash = calculateOfferHash(asset, pricePlan, license);

  return {
    offer_id: `urn:davincia:offer:${asset.asset_id.split(':').pop()}`,
    asset_id: asset.asset_id,
    owner_id: asset.owner,
    title: asset.title,
    description: asset.description,
    price: pricePlan?.price || 0.00,
    currency: pricePlan?.currency || "USD",
    unit: pricePlan?.unit || "ENTITLEMENT",
    license_id: license?.license_id || "STANDARD_COMMERCIAL",
    duration_days: license?.duration || 30,
    usage_limit: license?.usage_limits || 1000,
    governance_policy: asset.governance_policy,
    status: asset.status === "ACTIVE" ? "AVAILABLE" : "UNAVAILABLE",
    integrity_hash: hash
  };
}

export function verifyOfferIntegrity(offer, currentAsset, currentPricePlan, currentLicense) {
  if (!offer || !currentAsset) {
    return { valid: false, error: "Offer or Asset context missing." };
  }
  const currentHash = calculateOfferHash(currentAsset, currentPricePlan, currentLicense);
  if (offer.integrity_hash !== currentHash) {
    return { valid: false, error: "OFFER_INVALIDATED: integrity mismatch." };
  }
  return { valid: true };
}
