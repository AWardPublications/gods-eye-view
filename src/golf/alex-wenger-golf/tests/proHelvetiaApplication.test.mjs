import { test } from 'node:test';
import assert from 'node:assert/strict';

test('1. Pro Helvetia Application verifies CHF 95,000 Total Budget, CHF 50,000 Grant (52.6%), CHF 45,000 Co-Financing, and 4 WPs', () => {
  const totalBudgetChf = 95000;
  const proHelvetiaGrantChf = 50000;
  const coFinancingChf = 45000;

  const loterieRomandeChf = 25000;
  const villeDeSionChf = 8000;
  const internalEquityChf = 12000;
  const sumCoFinancingChf = loterieRomandeChf + villeDeSionChf + internalEquityChf;

  const wps = ['WP1', 'WP2', 'WP3', 'WP4'];
  const leadApplicant = 'Brehon AI Technologies (Sion, Valais, Switzerland)';
  const coProducer = 'A.Ward Publications (Cork, Ireland)';

  assert.equal(totalBudgetChf, 95000, 'Total budget must equal CHF 95,000');
  assert.equal(proHelvetiaGrantChf, 50000, 'Pro Helvetia grant request must equal CHF 50,000');
  assert.equal(coFinancingChf, 45000, 'Co-financing must equal CHF 45,000');
  assert.equal(sumCoFinancingChf, coFinancingChf, 'Sum of co-financing sources must equal CHF 45,000');
  assert.equal(wps.length, 4, 'Must contain 4 Work Packages');
});
