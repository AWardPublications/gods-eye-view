import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DavidOsSovereignValuationEngine } from '../davidOsSovereignValuationEngine.mjs';

test('126_Sovereign_Valuation_Calculation: Calculates 3-tier valuation model across 5 IP pillars', () => {
  const engine = new DavidOsSovereignValuationEngine();
  const val = engine.calculateValuation(5.0);

  assert.equal(val.status, 'VALUATION_CALCULATED_SOVEREIGN_AUDITED');
  assert.equal(val.base_asset_floor_eur, 75000000);
  assert.equal(val.sovereign_monopoly_value_eur, 375000000);
  assert.equal(val.valuation_range.min_eur, 375000000);
  assert.equal(val.valuation_range.max_eur, 600000000);
});

test('127_Acquirer_Qualification_Approval: Approves compliant enterprise acquirer under CONSTITUTION-v1.0', () => {
  const engine = new DavidOsSovereignValuationEngine();
  const qual = engine.evaluateAcquirerQualification({
    name: 'Haag-Streit / Roche Consortium',
    tier: 'Tier 1',
    accepts_append_only_ledger: true,
    accepts_gpg_sovereignty: true,
    rejects_black_box_automation: true,
    preserves_life_safety_decoupling: true
  });

  assert.equal(qual.qualified, true);
  assert.equal(qual.disposition, 'APPROVED_FOR_FEDERATED_CORE_LICENSING');
  assert.equal(qual.recommended_structure, 'Federated Core Licensing & GAMP 5 Enclave');
});

test('128_Acquirer_Qualification_Redline_Reject: Hard-rejects acquirer attempting black-box un-audited automation', () => {
  const engine = new DavidOsSovereignValuationEngine();
  const qual = engine.evaluateAcquirerQualification({
    name: 'Opaque Black-Box Fund',
    tier: 'Tier 1',
    accepts_append_only_ledger: true,
    accepts_gpg_sovereignty: false, // VIOLATION!
    rejects_black_box_automation: false, // VIOLATION!
    preserves_life_safety_decoupling: true
  });

  assert.equal(qual.qualified, false);
  assert.equal(qual.disposition, 'REJECT_ACQUISITION_GOVERNANCE_REDLINE_VIOLATION');
});
