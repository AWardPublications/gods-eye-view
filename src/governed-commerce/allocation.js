export function validateAllocationRules(rules) {
  if (!rules || typeof rules !== 'object') {
    return { valid: false, error: "Allocation rules must be a valid object." };
  }
  const keys = ["platform_share", "owner_share", "partner_share"];
  for (const k of keys) {
    if (typeof rules[k] !== 'number' || rules[k] < 0 || rules[k] > 1) {
      return { valid: false, error: `Invalid rule percentage value for ${k}: ${rules[k]}` };
    }
  }
  const sum = rules.platform_share + rules.owner_share + rules.partner_share;
  if (Math.abs(sum - 1.0) > 0.0001) {
    return { valid: false, error: `Allocation sum must equal 1.0; sum is ${sum}` };
  }
  return { valid: true };
}

export function calculateAllocation(grossAmount, rules) {
  const check = validateAllocationRules(rules);
  if (!check.valid) {
    throw new Error(`Invalid allocation rules: ${check.error}`);
  }

  const platformAmount = Number((grossAmount * rules.platform_share).toFixed(6));
  const ownerAmount = Number((grossAmount * rules.owner_share).toFixed(6));
  const partnerAmount = Number((grossAmount * rules.partner_share).toFixed(6));

  const totalAllocated = Number((platformAmount + ownerAmount + partnerAmount).toFixed(6));
  if (Math.abs(totalAllocated - grossAmount) > 0.0001) {
    throw new Error(`Allocation math mismatch: Gross is ${grossAmount}, but sum is ${totalAllocated}`);
  }

  return {
    gross_amount: grossAmount,
    platform_amount: platformAmount,
    owner_amount: ownerAmount,
    partner_amount: partnerAmount,
    rules_version: rules.version || "1.0.0",
    reconciled: true
  };
}
