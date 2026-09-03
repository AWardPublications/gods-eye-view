import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HitlRouterEngine } from '../hitlRouterEngine.mjs';

test('80_HITL_Router_Confidence_Floor: Programmatically halts execution when confidence < 0.85', () => {
  const router = new HitlRouterEngine();
  const res = router.evaluateExecutionForEscalation('agent_wenger', 'SWING_ANALYSIS', 0.81, 'MEDIUM');

  assert.equal(res.status, 'SYSTEM_HALTED_AWAITING_ASYNC_HITL');
  assert.equal(res.requires_escalation, true);
  assert.equal(res.static_package.halt_reason, 'CONFIDENCE_BELOW_0.85_FLOOR');
});

test('81_HITL_Router_Async_Signoff: Processes asynchronous HITL signoff producing decision json and rationale md', () => {
  const router = new HitlRouterEngine();
  const evalRes = router.evaluateExecutionForEscalation('agent_grant_gedhi', 'GRANT_SUBMISSION', 0.90, 'HIGH');

  const signoff = router.processAsyncHitlSignoff(
    evalRes.static_package,
    'SEAT_FINANCE_01',
    true,
    'Verified eligibility evidence against Horizon Europe Work Programme 2026.'
  );

  assert.equal(signoff.status, 'GOVERNED_EXECUTION_RESUMED');
  assert.equal(signoff.hitl_decision.decision, 'APPROVED_BY_HUMAN_AUTHORITY');
  assert.ok(signoff.hitl_rationale.includes('EMBASSY HITL GOVERNED DECISION RATIONALE'));
});
