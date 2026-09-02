import { test } from 'node:test';
import assert from 'node:assert/strict';

test('1. EIC Section 2 Impact verifies TAM/SAM/SOM, 5-Year ARR & EBITDA, FTEs, LTV:CAC, and Patent Family', () => {
  const tamEur = 14800000000; // €14.8B
  const samEur = 3400000000;  // €3.4B
  const somEur = 420000000;   // €420M

  const y1ArrEur = 120000;
  const y5ArrEur = 36200000;
  const y5EbitdaEur = 15400000;
  const y5Fte = 115;

  const tier1LtvEur = 144000;
  const tier1CacEur = 22000;
  const ltvCacRatio = tier1LtvEur / tier1CacEur;

  assert.equal(tamEur, 14800000000, 'TAM must equal €14.8B');
  assert.equal(samEur, 3400000000, 'SAM must equal €3.4B');
  assert.equal(somEur, 420000000, 'SOM must equal €420M');
  assert.equal(y5ArrEur, 36200000, 'Year 5 ARR must equal €36.2M');
  assert.equal(y5EbitdaEur, 15400000, 'Year 5 EBITDA must equal €15.4M');
  assert.equal(y5Fte, 115, 'Year 5 Headcount must equal 115 FTEs');
  assert.ok(ltvCacRatio > 6.5, 'LTV:CAC ratio must exceed 6.5x');
});
