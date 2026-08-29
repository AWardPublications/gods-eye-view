import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePolicy } from '../../../src/governance/evaluate.js';

test('Universal Fail-Closed: Missing fields fail closed', async () => {
  // Completely empty object
  const record = {};
  const decision = await evaluatePolicy(record, "READ", { id: "user:david", class: "HUMAN" });
  assert.equal(decision.status, "DENY");
});
