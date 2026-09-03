import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AwardPublicationsMasterCatalogueEngine } from '../../../publishing/awardPublicationsMasterCatalogueEngine.mjs';

test('1. AwardPublicationsMasterCatalogueEngine verifies Nielsen prefix 978-1-918501, 7 volumes, and 100 ISBN block', () => {
  const engine = new AwardPublicationsMasterCatalogueEngine();
  const res = engine.generateCatalogueRegistry();

  assert.equal(res.status, 'AWARD_PUBLICATIONS_CATALOGUE_REGISTERED');
  assert.equal(res.publisherPrefix, '978-1-918501');
  assert.equal(res.totalIsbnBlockSize, 100);
  assert.equal(res.assignedIsbnsCount, 7);
  assert.equal(res.availableIsbnsCount, 93);

  const vol1 = res.volumes.find(v => v.isbn === '978-1-918501-01-7');
  assert.equal(vol1.leadCharacter, 'CorkSwam');

  const vol2 = res.volumes.find(v => v.isbn === '978-1-918501-02-4');
  assert.equal(vol2.leadCharacter, 'Lee Side');
});
