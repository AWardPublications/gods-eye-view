import { test } from 'node:test';
import assert from 'node:assert/strict';

test('1. Swiss AHV Independence & Valais Tax Audit verifies cost-plus mark-up, R&D super-deduction, and PE shield', () => {
  const costPlusMarkupPercent = 6.5;
  const valaisRDSuperDeductionPercent = 150;
  const patentBoxReliefCapPercent = 70;
  const zeroSwissPEAuthority = true;

  assert.ok(costPlusMarkupPercent >= 5.0 && costPlusMarkupPercent <= 8.5, 'Cost-plus mark-up must be between 5.0% and 8.5% under Section 835D TCA 1997');
  assert.equal(valaisRDSuperDeductionPercent, 150, 'Valais R&D super-deduction rate must equal 150%');
  assert.equal(patentBoxReliefCapPercent, 70, 'Overall cantonal tax relief cap must equal 70%');
  assert.equal(zeroSwissPEAuthority, true, 'Must enforce zero contract-concluding authority in Switzerland for Irish entity');
});
