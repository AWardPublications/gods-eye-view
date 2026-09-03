import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TriUniverseCharacterHitlEngine } from '../../../davidos/triUniverseCharacterHitlEngine.mjs';

test('1. TriUniverseCharacterHitlEngine pauses low-confidence actions for HITL approval', () => {
  const engine = new TriUniverseCharacterHitlEngine();
  
  // High confidence action -> Approved
  const res1 = engine.evaluateAgentAction('char_dav_01', 'Evaluate pitch deck', 0.95, 5000);
  assert.equal(res1.gateStatus, 'AUTONOMOUS_EXECUTION_APPROVED');
  assert.equal(res1.requiresHitl, false);

  // Low confidence action -> Paused for HITL
  const res2 = engine.evaluateAgentAction('char_alex_01', 'Modify RK4 aerodynamics model', 0.72, 1000);
  assert.equal(res2.gateStatus, 'PAUSED_FOR_HITL_AUTHORISATION');
  assert.equal(res2.requiresHitl, true);
  assert.equal(res2.hitlRole, 'Golf Resort Director');
});
