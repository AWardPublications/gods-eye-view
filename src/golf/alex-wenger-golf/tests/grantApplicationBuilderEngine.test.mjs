import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GrantApplicationBuilderEngine } from '../../../agents/grantApplicationBuilderEngine.mjs';

test('1. GrantApplicationBuilderEngine generates exactly 14 grant application packages across 4 entities', () => {
  const engine = new GrantApplicationBuilderEngine();
  const res = engine.generateAllGrantPackages();

  assert.equal(res.totalGrantApplicationsCount, 14, 'Must generate exactly 14 grant application packages');
  assert.equal(res.packages.length, 14);

  const swissPkgs = res.packages.filter(p => p.applyingEntity === 'Brehon AI Technologies');
  const irishPkgs = res.packages.filter(p => p.applyingEntity === 'Brehon AI Solutions Ltd');
  const belfastPkgs = res.packages.filter(p => p.applyingEntity === 'Brehon AI Recruitment (Belfast HQ)');
  const holdcoPkgs = res.packages.filter(p => p.applyingEntity === 'A.Ward Publications');

  assert.equal(swissPkgs.length, 4, 'Swiss R&D entity must have 4 grant packages');
  assert.equal(irishPkgs.length, 4, 'Irish operating entity must have 4 grant packages');
  assert.equal(belfastPkgs.length, 3, 'Belfast HQ recruitment entity must have 3 grant packages');
  assert.equal(holdcoPkgs.length, 3, 'Master IP HoldCo entity must have 3 grant packages');
});
