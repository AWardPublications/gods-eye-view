import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';

test('1. test_8_agent_war_council_orchestration.js verifies 8-agent swarm concurrency and synchronization', () => {
  const scriptPath = path.resolve('scripts/verification/test_8_agent_war_council_orchestration.js');
  const output = execSync(`node ${scriptPath}`, { encoding: 'utf8' });

  assert.ok(output.includes('100% CONCURRENT & SYNCHRONIZED'), 'Must verify 100% multi-agent swarm concurrency');
});
