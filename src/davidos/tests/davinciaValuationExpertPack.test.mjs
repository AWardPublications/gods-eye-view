import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DavinciaValuationExpertPackEngine } from '../davinciaValuationExpertPackEngine.mjs';

test('137_Valuation_Expert_Pack_Replacement_Cost: Calculates €22.2M Base Replacement Floor (€8.97M Direct Labor)', () => {
  const engine = new DavinciaValuationExpertPackEngine();
  const cost = engine.calculateReplacementCost();

  assert.equal(cost.method, 'COST_REPLACEMENT_METHOD');
  assert.equal(cost.labor_cost_eur, 8972500);
  assert.equal(cost.total_base_replacement_eur, 22200000);
  assert.equal(cost.range_eur.base_eur, 22200000);
});

test('138_Valuation_Expert_Pack_Capital_Scenarios: Verifies Scenario C (€1.5M Raise @ €22.5M Cap — 6.67% Dilution) as Recommended', () => {
  const engine = new DavinciaValuationExpertPackEngine();
  const cap = engine.calculateCapitalRaiseScenarios();

  assert.equal(cap.status, 'CAPITAL_RAISE_SCENARIOS_MODELLED');
  assert.equal(cap.scenarios.ScenarioC.raise_eur, 1500000);
  assert.equal(cap.scenarios.ScenarioC.post_money_cap_eur, 22500000);
  assert.equal(cap.scenarios.ScenarioC.dilution_pct, 6.67);
  assert.equal(cap.scenarios.ScenarioC.recommended, true);
});
