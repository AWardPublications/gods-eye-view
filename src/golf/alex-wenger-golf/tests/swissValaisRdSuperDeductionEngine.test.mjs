import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SwissValaisRdSuperDeductionEngine } from '../../../tax/swissValaisRdSuperDeductionEngine.mjs';

test('1. SwissValaisRdSuperDeductionEngine verifies 35% surcharge, 150% super-deduction, and 70% cantonal relief cap', () => {
  const engine = new SwissValaisRdSuperDeductionEngine();
  
  // CHF 100,000 Spend -> Base 135,000 -> Tax Deduction 202,500
  const res = engine.calculateSuperDeduction(100000, 300000);

  assert.equal(res.qualifyingExpenseBaseChf, 135000, 'Qualifying expense base must be CHF 135,000 (135%)');
  assert.equal(res.taxDeductionBaseChf, 202500, 'Tax deduction base must be CHF 202,500 (150% on qualifying base)');
  assert.equal(res.extraSuperDeductionBenefitChf, 102500, 'Extra write-off benefit must be CHF 102,500');
  assert.equal(res.effectiveDeductionChf, 202500, 'Effective deduction must equal CHF 202,500 when under cap');
  assert.equal(res.cantonalReliefCapApplied, false);
  assert.ok(res.auditHash.length === 64);
});
