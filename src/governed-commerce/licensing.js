/** Create a dynamic licensing agreement structure */
export function createLicenseAgreement(assetId, owner, pricingType = "USAGE_BASED", price = 0.05, options = {}) {
  if (!assetId || !owner) {
    throw new Error("Asset ID and Owner are required to construct a license agreement.");
  }

  if (price < 0) {
    throw new Error("Price cannot be negative.");
  }

  const validTypes = ["USAGE_BASED", "SUBSCRIPTION", "FREE"];
  if (!validTypes.includes(pricingType.toUpperCase())) {
    throw new Error(`Invalid pricing type: ${pricingType}`);
  }

  const licenseId = `urn:davincia:license:agreement:${Math.random().toString(36).substring(2, 10)}`;

  return {
    license_id: licenseId,
    license_version: "1.0.0",
    asset_id: assetId,
    owner_urn: owner,
    pricing: {
      type: pricingType.toUpperCase(),
      price: price,
      currency: options.currency || "USD",
      billing_interval: options.billing_interval || "PER_CALL"
    },
    permitted_scopes: options.permitted_scopes || ["READ", "SEARCH"],
    prohibited_scopes: options.prohibited_scopes || ["TRANSFORM", "PUBLISH"],
    attributions: options.attributions || {
      provider_share: 0.80, // 80% to owner
      governor_share: 0.20  // 20% to DaVinciA+ platform fee
    },
    issued_at: new Date().toISOString(),
    status: "ACTIVE"
  };
}

/** Validate agreement structure */
export function validateLicenseAgreement(agreement) {
  const fields = ["license_id", "license_version", "asset_id", "owner_urn", "pricing", "permitted_scopes", "prohibited_scopes", "attributions", "status"];
  for (const f of fields) {
    if (!(f in agreement)) {
      return { valid: false, error: `Missing agreement field: ${f}` };
    }
  }
  return { valid: true };
}
