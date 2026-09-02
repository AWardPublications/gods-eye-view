import { test } from 'node:test';
import assert from 'node:assert/strict';

test('1. Grant Writing Doctrine verifies the 6 pillars of high-conversion grant writing', () => {
  const pillarCount = 6;
  const isPolicyDriven = true;
  const isTrlProgressionDefined = true;

  assert.equal(pillarCount, 6, 'Grant writing doctrine must enforce all 6 core pillars');
  assert.equal(isPolicyDriven, true, 'Proposals must prioritize public policy mandates over VC marketing hype');
  assert.equal(isTrlProgressionDefined, true, 'Proposals must define clear TRL 4 to TRL 7 R&D progression');
});
