import test from 'node:test';
import assert from 'node:assert/strict';
import { trackConsumption } from '../../src/governed-commerce/metering.js';

test('Metering: 1. Record single consumption units', () => {
  const entitlement = {
    entitlement_id: "ent-1",
    status: "ACTIVE",
    expires_at: new Date(Date.now() + 3600000).toISOString(),
    usage_limit: 10,
    usage_count: 0
  };

  const usage = trackConsumption(entitlement, { units: 1, type: "API_CALL" });
  assert.equal(entitlement.usage_count, 1);
  assert.equal(usage.consumed_units, 1);
});

test('Metering: 2. Block consumption exceeding limits', () => {
  const entitlement = {
    entitlement_id: "ent-1",
    status: "ACTIVE",
    expires_at: new Date(Date.now() + 3600000).toISOString(),
    usage_limit: 5,
    usage_count: 4
  };

  // Consuming 2 units exceeds limit of 5
  assert.throws(() => {
    trackConsumption(entitlement, { units: 2, type: "API_CALL" });
  }, /exceed remaining entitlement allowance/);
  assert.equal(entitlement.usage_count, 4); // unchanged
});
