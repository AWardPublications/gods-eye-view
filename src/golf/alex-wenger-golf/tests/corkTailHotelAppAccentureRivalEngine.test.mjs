import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CorkTailHotelAppAccentureRivalEngine } from '../../../david_os/corkTailHotelAppAccentureRivalEngine.mjs';

test('1. CorkTailHotelAppAccentureRivalEngine provisions Accenture-rival hotel app into DAVID_OS with €20.0M capital stack', () => {
  const engine = new CorkTailHotelAppAccentureRivalEngine();
  const res = engine.provisionHotelAppInDavidOs();

  assert.equal(res.status, 'CORK_TAIL_HOTEL_APP_PROVISIONED_IN_DAVID_OS');
  assert.equal(res.appName, 'CORK TAIL: Hospitality OS & Guest Experience Engine');
  assert.equal(res.totalSubdirsGenerated, 15);
  assert.equal(res.dnaData.targetCapitalEur, 20000000);
  assert.equal(res.dnaData.keyDifferentiatorsVsAccenture.length, 4);
  assert.ok(res.hash.length === 64);
});
