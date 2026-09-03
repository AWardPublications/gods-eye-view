export function trackConsumption(entitlement, usageEvent) {
  if (!entitlement || entitlement.status !== "ACTIVE") {
    throw new Error("Cannot consume: Entitlement is inactive or missing.");
  }

  if (new Date(entitlement.expires_at) < new Date()) {
    throw new Error("Cannot consume: Entitlement has expired.");
  }

  if (entitlement.usage_count >= entitlement.usage_limit) {
    throw new Error("Cannot consume: Entitlement usage limits have been exhausted.");
  }

  // Record consumption unit
  const increment = usageEvent.units || 1;
  if (entitlement.usage_count + increment > entitlement.usage_limit) {
    throw new Error("Cannot consume: Requested units exceed remaining entitlement allowance.");
  }

  entitlement.usage_count += increment;

  const usageId = `urn:davincia:usage:record:${Math.random().toString(36).substring(2, 10)}`;

  return {
    usage_id: usageId,
    entitlement_id: entitlement.entitlement_id,
    consumed_units: increment,
    measurement_type: usageEvent.type || "API_CALL",
    timestamp: new Date().toISOString()
  };
}
