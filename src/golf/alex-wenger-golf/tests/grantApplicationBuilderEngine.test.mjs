import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GrantApplicationBuilderEngine } from '../../../agents/grantApplicationBuilderEngine.mjs';

test('1. GrantApplicationBuilderEngine generates exactly 52 grant application packages across 4 entities', () => {
  const engine = new GrantApplicationBuilderEngine();
  const res = engine.generateAllGrantPackages();

  assert.equal(res.totalGrantApplicationsCount, 52, 'Must generate exactly 52 grant application packages');
  assert.equal(res.packages.length, 52);

  const swissPkgs = res.packages.filter(p => p.applyingEntity === 'Brehon AI Technologies');
  const irishPkgs = res.packages.filter(p => p.applyingEntity === 'Brehon AI Solutions Ltd');
  const belfastPkgs = res.packages.filter(p => p.applyingEntity === 'Brehon AI Recruitment (Belfast HQ)');
  const holdcoPkgs = res.packages.filter(p => p.applyingEntity === 'A.Ward Publications');

  assert.equal(swissPkgs.length, 14, 'Swiss R&D entity must have 14 grant packages');
  assert.equal(irishPkgs.length, 19, 'Irish operating entity must have 19 grant packages');
  assert.equal(belfastPkgs.length, 11, 'Belfast HQ recruitment entity must have 11 grant packages');
  assert.equal(holdcoPkgs.length, 8, 'Master IP HoldCo entity must have 8 grant packages');
});
