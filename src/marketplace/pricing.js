export const PricingPlans = [
  {
    pricing_id: "urn:davincia:pricing:brehon-usage-v1",
    version: "1.0.0",
    model: "USAGE",
    price: 0.05,
    currency: "USD",
    unit: "API_CALL",
    effective_from: "2026-08-30T00:00:00Z",
    effective_until: "2027-08-30T00:00:00Z",
    conditions: { min_calls: 1 }
  },
  {
    pricing_id: "urn:davincia:pricing:slang-fixed-v1",
    version: "1.0.0",
    model: "FIXED",
    price: 25.00,
    currency: "EUR",
    unit: "ENTITLEMENT",
    effective_from: "2026-08-30T00:00:00Z",
    effective_until: "2027-08-30T00:00:00Z",
    conditions: {}
  },
  {
    pricing_id: "urn:davincia:pricing:arios-subscription-v1",
    version: "1.0.0",
    model: "SUBSCRIPTION",
    price: 100.00,
    currency: "USD",
    unit: "MONTH",
    effective_from: "2026-08-30T00:00:00Z",
    effective_until: "2027-08-30T00:00:00Z",
    conditions: {}
  },
  {
    pricing_id: "urn:davincia:pricing:refinery-royalty-v1",
    version: "1.0.0",
    model: "ROYALTY",
    price: 0.15, // 15% downstream commercial usage
    currency: "USD",
    unit: "PERCENTAGE",
    effective_from: "2026-08-30T00:00:00Z",
    effective_until: "2027-08-30T00:00:00Z",
    conditions: {}
  },
  {
    pricing_id: "urn:davincia:pricing:free-plan-v1",
    version: "1.0.0",
    model: "FIXED",
    price: 0.00,
    currency: "USD",
    unit: "ENTITLEMENT",
    effective_from: "2026-08-30T00:00:00Z",
    effective_until: "2027-08-30T00:00:00Z",
    conditions: {}
  }
];

export function lookupPricingPlan(pricingId) {
  const plan = PricingPlans.find(p => p.pricing_id === pricingId);
  if (!plan) return null;
  return { ...plan };
}

export function detectPriceMutation(originalPrice, currentPricePlan) {
  if (!currentPricePlan) return true;
  return originalPrice !== currentPricePlan.price;
}
