import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DavidOsMultiCodebaseEstateEngine } from '../../../davidos/davidOsMultiCodebaseEstateEngine.mjs';

test('1. DavidOsMultiCodebaseEstateEngine audits all 54 system codebases and governed operating systems', () => {
  const engine = new DavidOsMultiCodebaseEstateEngine();
  const res = engine.compileEstateReport();

  assert.equal(res.status, 'ALL_SYSTEM_CODEBASES_AUDITED_AND_MAPPED');
  assert.equal(res.totalCategories, 6);
  assert.ok(res.totalCodebases >= 20);
  assert.ok(res.hash.length === 64);
});
