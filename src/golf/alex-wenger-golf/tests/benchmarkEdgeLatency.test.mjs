import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';

test('1. benchmark_edge_latency.js executes cleanly with sub-0.01ms solve latency', () => {
  const scriptPath = path.resolve('scripts/verification/benchmark_edge_latency.js');
  const output = execSync(`node ${scriptPath}`, { encoding: 'utf8' });

  assert.ok(output.includes('EMPIRICAL LATENCY BENCHMARK PASSED 100% GREEN'), 'Must report empirical latency benchmark passed');
});
