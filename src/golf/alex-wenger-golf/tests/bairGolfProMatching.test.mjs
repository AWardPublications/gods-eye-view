import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';

test('1. evaluate_bair_golf_professionals.py evaluates Callum Montgomery 94.2% match & CHF 28,000 fee', () => {
  const scriptPath = path.resolve('scripts/recruitment/evaluate_bair_golf_professionals.py');
  const output = execSync(`python ${scriptPath}`, { encoding: 'utf8' });

  assert.ok(output.includes('Callum Montgomery, PGA Master Professional'), 'Must evaluate Callum Montgomery');
  assert.ok(output.includes('CHF 28,000.00'), 'Must calculate CHF 28,000 placement fee');
});
