import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ProductionPackShopEngine } from '../productionPackShopEngine.mjs';

test('58_Production_Pack_Generation: Engine creates Production Pack with evidence root for series product', () => {
  const shop = new ProductionPackShopEngine();
  const pack = shop.createProductionPack('SERIES_01_ACTIVE', 'prod_tcg_deck_01', 'sha256_kells_aidy_master_asset');

  assert.equal(pack.series_id, 'SERIES_01_ACTIVE');
  assert.equal(pack.steward_agent, "CorkMan (Aidy O'Dalaigh)");
  assert.equal(pack.evidence_root.gpgSignature, '0x80D0ADA1');
  assert.ok(pack.pack_hash.length === 64);
});

test('59_Agent_Merchant_Stewardship: Governed agent is assigned to physical & digital shop series', () => {
  const shop = new ProductionPackShopEngine();
  const series01 = shop.getSeries('SERIES_01_ACTIVE');
  const series02 = shop.getSeries('SERIES_02_INCOMING');

  assert.equal(series01.steward_agent, "CorkMan (Aidy O'Dalaigh)");
  assert.equal(series02.steward_agent, 'Alex Wenger');
  assert.equal(series01.products.length, 3);
});

test('60_COP_ON_Series_One_Active_Fulfillment: Series One TCG products are active and fulfillable', () => {
  const shop = new ProductionPackShopEngine();
  const series01 = shop.getSeries('SERIES_01_ACTIVE');

  assert.equal(series01.status, 'ACTIVE_SHOP');
  assert.equal(series01.products[0].priceEur, 29.99);
});
