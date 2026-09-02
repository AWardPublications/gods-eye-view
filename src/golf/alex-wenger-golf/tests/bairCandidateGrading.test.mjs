import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';

test('1. grade_candidate_wasm_challenge.js evaluates candidate Alastair MacLeod 100/100 green', () => {
  const scriptPath = path.resolve('scripts/recruitment/grade_candidate_wasm_challenge.js');
  const output = execSync(`node ${scriptPath}`, { encoding: 'utf8' });

  assert.ok(output.includes('SCORE: 100/100'), 'Candidate must score 100/100 on RK4 WASM challenge');
});
