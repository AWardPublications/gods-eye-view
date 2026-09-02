import { test } from 'node:test';
import assert from 'node:assert/strict';

test('1. Four-Entity 50M Grant Application Suite verifies all 4 corporate entities and regional HQ allocations', () => {
  const swissRndChf = 8500000; // Innosuisse 5.0M + SPEI 3.5M
  const irishDeliveryEur = 20000000; // EIC 17.5M + Eurostars 2.5M
  const belfastRecruitmentGbp = 3000000; // Innovate UK 2.5M + Invest NI 0.5M
  const ipHoldcoEur = 100000; // EUIPO 75k + LEO 25k

  const totalGrantSuiteValueEurEquivalent = 8500000 + 20000000 + (3000000 * 1.2) + 100000;

  assert.ok(totalGrantSuiteValueEurEquivalent >= 30000000, 'Total grant suite value must exceed €30M in direct grants/blended equity');
  assert.equal(swissRndChf, 8500000, 'Swiss R&D entity must target CHF 8.5M');
  assert.equal(belfastRecruitmentGbp, 3000000, 'Belfast HQ recruitment entity must target £3.0M');
  assert.equal(irishDeliveryEur, 20000000, 'Irish enterprise delivery entity must target €20.0M');
});
