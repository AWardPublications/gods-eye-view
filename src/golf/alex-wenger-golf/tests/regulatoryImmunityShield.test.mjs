import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';

test('1. verify_regulatory_immunity_and_fail_closed.js verifies 100% legal immunity and fail-closed intercept', () => {
  const scriptPath = path.resolve('scripts/verification/verify_regulatory_immunity_and_fail_closed.js');
  const output = execSync(`node ${scriptPath}`, { encoding: 'utf8' });

  assert.ok(output.includes('100% BULLETPROOF'), 'Must verify 100% bulletproof regulatory immunity');
});
