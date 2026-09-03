import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AwardPublicationsWiderEnvironmentEngine } from '../../../publishing/awardPublicationsWiderEnvironmentEngine.mjs';

test('1. AwardPublicationsWiderEnvironmentEngine audits A.Ward Publications master catalog and publishing estate', () => {
  const engine = new AwardPublicationsWiderEnvironmentEngine();
  const res = engine.compileEcosystemReport();

  assert.equal(res.status, 'AWARD_PUBLICATIONS_ECOSYSTEM_VERIFIED_AND_COMPILED');
  assert.equal(res.imprintName, 'A.Ward Publications / D&A.Ward Editions Ltd');
  assert.equal(res.catalogCount, 10);
  assert.ok(res.hash.length === 64);
});
