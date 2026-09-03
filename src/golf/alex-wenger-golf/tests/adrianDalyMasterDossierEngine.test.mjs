import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AdrianDalyMasterDossierEngine } from '../../../publishing/adrianDalyMasterDossierEngine.mjs';

test('1. AdrianDalyMasterDossierEngine compiles master record for Adrian Daly (The Messenger Seat)', () => {
  const engine = new AdrianDalyMasterDossierEngine();
  const res = engine.compileMasterRecord();

  assert.equal(res.status, 'ADRIAN_DALY_MASTER_RECORD_VERIFIED_AND_COMPILED');
  assert.equal(res.canonicalName, 'Adrian Daly');
  assert.equal(res.gpgKey, '0x80D0ADA1');
  assert.equal(res.principalId, 'adrian-fcs-001');
  assert.equal(res.mediaAssetsCount, 3);
  assert.equal(res.writtenWorksCount, 3);
  assert.ok(res.hash.length === 64);
});
