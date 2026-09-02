import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';

test('1. bair_talent_pipeline.js executes cleanly with 100% green verification', () => {
  const scriptPath = path.resolve('scripts/recruitment/bair_talent_pipeline.js');
  const output = execSync(`node ${scriptPath}`, { encoding: 'utf8' });

  assert.ok(output.includes('BAIR TALENT VERIFICATION ENGINE PASSED 100% GREEN'), 'Must report BAIR talent verification passed');
});
