import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';

test('1. evaluate_bair_lesson_video.py evaluates Callum Montgomery 93/100 Elite Pro Platinum', () => {
  const scriptPath = path.resolve('scripts/recruitment/evaluate_bair_lesson_video.py');
  const output = execSync(`python ${scriptPath}`, { encoding: 'utf8' });

  assert.ok(output.includes('TOTAL AUDIT SCORE: 93 / 100 Pts'), 'Must score 93/100 on practical video audit');
  assert.ok(output.includes('Elite Pro (Platinum)'), 'Must classify as Elite Pro Platinum');
});
