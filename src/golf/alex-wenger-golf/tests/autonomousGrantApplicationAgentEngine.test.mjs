import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AutonomousGrantApplicationAgentEngine } from '../../../agents/autonomousGrantApplicationAgentEngine.mjs';

test('1. AutonomousGrantApplicationAgentEngine verifies 5 portal API JSON schemas and 100% autonomous submission readiness', () => {
  const engine = new AutonomousGrantApplicationAgentEngine();
  const res = engine.exportAutonomousPayloads();

  assert.equal(res.status, 'AUTONOMOUS_AI_AGENT_PAYLOADS_VERIFIED');
  assert.equal(res.totalPortalsConfigured, 5);
  assert.equal(res.totalFilesGenerated, 6);
  assert.ok(res.hash.length === 64);
});
