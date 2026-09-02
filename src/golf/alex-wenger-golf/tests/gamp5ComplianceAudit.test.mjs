import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';

test('1. gamp5_compliance_audit.js script executes cleanly with 12/12 audits green', () => {
  const scriptPath = path.resolve('scripts/verification/gamp5_compliance_audit.js');
  const output = execSync(`node ${scriptPath}`, { encoding: 'utf8' });

  assert.ok(output.includes('12 / 12 AUDITS PASSED 100% GREEN'), 'Must report 12/12 audits passed');
});
