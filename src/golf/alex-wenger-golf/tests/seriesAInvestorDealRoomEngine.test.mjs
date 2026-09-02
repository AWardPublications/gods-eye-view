import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SeriesAInvestorDealRoomEngine } from '../../../investors/seriesAInvestorDealRoomEngine.mjs';

test('1. SeriesAInvestorDealRoomEngine verifies €5.0M Series A raise, €50.0M pre-money valuation, 4 corporate entities, and 5 VC targets', () => {
  const engine = new SeriesAInvestorDealRoomEngine();
  const res = engine.generateDealRoomManifest();

  assert.equal(res.status, 'INVESTOR_DEAL_ROOM_LIVE');
  assert.equal(res.dealTerms.targetRaiseEur, 5000000);
  assert.equal(res.dealTerms.preMoneyValuationEur, 50000000);
  assert.equal(res.dealTerms.postMoneyValuationEur, 55000000);
  assert.equal(res.totalCorporateEntities, 4);
  assert.equal(res.topVcTargetsCount, 5);
  assert.ok(res.dealRoomHash.length === 64);
});
