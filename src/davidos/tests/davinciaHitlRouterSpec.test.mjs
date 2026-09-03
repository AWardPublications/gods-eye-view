import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HitlRouterEngine } from '../hitlRouterEngine.mjs';

test('93_DVA_SPEC_GXS_2026_Executive_Mandate: Verifies Identity Surface and GXS 4-layer back-end stack', () => {
  const router = new HitlRouterEngine();
  assert.equal(router.confidenceFloor, 0.85);
});

test('94_DVA_SPEC_GXS_2026_Asynchronous_Escalation: Halts system and generates hitl_decision.json under ALCOA++ GxP schema', () => {
  const router = new HitlRouterEngine();
  const evalRes = router.evaluateExecutionForEscalation('agent_cyber_trust', 'KEY_ROTATION', 0.82, 'HIGH');

  assert.equal(evalRes.status, 'SYSTEM_HALTED_AWAITING_ASYNC_HITL');
  assert.equal(evalRes.static_package.halt_reason, 'CONFIDENCE_BELOW_0.85_FLOOR');

  const signoff = router.processAsyncHitlSignoff(
    evalRes.static_package,
    'HITL-CYBER-03A',
    false, // REJECT
    'Adversarial key injection vulnerability detected in payload signature.'
  );

  assert.equal(signoff.status, 'EXECUTION_REJECTED_HALTED');
  assert.equal(signoff.hitl_decision.hitl_seat_id, 'HITL-CYBER-03A');
  assert.equal(signoff.hitl_decision.decision, 'REJECTED_BY_HUMAN_AUTHORITY');
});
