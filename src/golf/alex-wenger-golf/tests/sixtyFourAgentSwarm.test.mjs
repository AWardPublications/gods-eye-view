import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';

test('1. test_64_agent_swarm_concurrency.js verifies 64-agent swarm division concurrency and dispatch', () => {
  const scriptPath = path.resolve('scripts/verification/test_64_agent_swarm_concurrency.js');
  const output = execSync(`node ${scriptPath}`, { encoding: 'utf8' });

  assert.ok(output.includes('100% OPERATIONAL & CONCURRENT'), 'Must verify 100% 64-agent swarm concurrency');
});
