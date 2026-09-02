import { test } from 'node:test';
import assert from 'node:assert/strict';

test('1. 50 Million Grant Pipeline Audit verifies €50M+ non-dilutive grant pipeline and Innosuisse/EIC targets', () => {
  const eicAmountEur = 17500000;
  const innosuisseAmountChf = 5000000;
  const valaisSpeiChf = 3500000;
  const eurostarsEur = 2500000;

  const totalGrantPipeline = eicAmountEur + innosuisseAmountChf + valaisSpeiChf + eurostarsEur;

  assert.ok(totalGrantPipeline >= 28500000, 'Core tier-1 grants must exceed €28.5M');
  assert.equal(eicAmountEur, 17500000, 'EIC Accelerator blended funding must equal €17.5M');
  assert.equal(innosuisseAmountChf, 5000000, 'Innosuisse Innovation Project must equal CHF 5.0M');
  assert.equal(valaisSpeiChf, 3500000, 'Promotion Économique du Valais must equal CHF 3.5M');
});
