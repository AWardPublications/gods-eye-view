import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Onboarding Layer: run-governance-conformance executes cleanly', () => {
  const scriptPath = path.join(__dirname, '../../tools/run-governance-conformance.js');
  let success = false;
  try {
    execSync(`node ${scriptPath}`, { stdio: 'ignore' });
    success = true;
  } catch (e) {
    success = false;
  }
  assert.equal(success, true);
});
