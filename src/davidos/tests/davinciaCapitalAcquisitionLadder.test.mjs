import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DavinciaCapitalAcquisitionLadderEngine } from '../davinciaCapitalAcquisitionLadderEngine.mjs';

test('135_Capital_Acquisition_Seed_Calculation: Calculates €1.5M Seed Round at €22.5M Post-Money Cap (6.67% Investor Ownership)', () => {
  const engine = new DavinciaCapitalAcquisitionLadderEngine();
  const seed = engine.calculateSeedInvestment(1500000, 21000000);

  assert.equal(seed.status, 'SEED_FINANCING_PROPOSITION_CALCULATED');
  assert.equal(seed.post_money_valuation_cap_eur, 22500000);
  assert.equal(seed.investor_ownership_percentage, 6.67);
  assert.equal(seed.founder_ownership_percentage, 93.33);
});

test('136_Investment_Evidence_Room_Freeze: Freezes 16-asset institutional deal room v1.0', () => {
  const engine = new DavinciaCapitalAcquisitionLadderEngine();
  const freeze = engine.freezeInvestmentEvidenceRoom();

  assert.equal(freeze.status, 'INVESTMENT_EVIDENCE_ROOM_FROZEN_SUCCESSFUL');
  assert.equal(freeze.dossier_id, 'DVA-DEALROOM-v1.0');
  assert.equal(freeze.asset_count, 16);
  assert.ok(freeze.freeze_sha256_hash.length === 64);
});
