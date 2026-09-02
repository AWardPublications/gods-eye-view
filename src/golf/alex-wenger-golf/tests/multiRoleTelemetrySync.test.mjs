import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';

test('1. test_multi_role_telemetry_sync.js synchronizes Caddie, Spotter, Agent, and HITL 100% green', () => {
  const scriptPath = path.resolve('scripts/verification/test_multi_role_telemetry_sync.js');
  const output = execSync(`node ${scriptPath}`, { encoding: 'utf8' });

  assert.ok(output.includes('100% SYNCHRONIZED ACROSS ALL USERS'), 'Must verify 100% state synchronization across all 4 roles');
});
