import { test } from 'node:test';
import assert from 'node:assert/strict';
import { executeGovernedIntelligencePipeline, evaluateState4JudgeFilter } from '../core/architecture/governedIntelligenceSystem.js';
import { CANONICAL_AGENT_REGISTRY, validateAgentContract11thQuestion } from '../core/architecture/agentRegistry.js';
import { resolveDispatchRoute } from '../core/architecture/dispatchMatrix.js';

test('1. Alieve vs Swingsy Conflict: Alex integrates physio safety with swing mechanics without allowing Swingsy to override Alieve', () => {
  const pipelineRes = executeGovernedIntelligencePipeline({
    userQuery: 'My lower back aches during turn, should I shallow my swing plane?',
    branchId: 'HUMAN_SYSTEM',
    specialistFindingText: 'Lumbar shear load exceeded 3.2kN. Limit hip turn to 40 degrees.',
  });

  assert.equal(pipelineRes.pipeline_stage, 'RETURN_TO_ALEX_INTEGRATED_COACHING');
  assert.equal(pipelineRes.judge_verdict.status, 'PASS');
  assert.ok(pipelineRes.integrated_coaching_response.includes('Alieve Wenger reports'));
  assert.ok(pipelineRes.integrated_coaching_response.includes('Mais oui'));
});

test('2. Tailor vs Sticks Conflict: Dynamic shaft flex vs static hardware specs resolved under Alex authority', () => {
  const dispatch = resolveDispatchRoute('EQUIPMENT');
  assert.equal(dispatch.primary_specialist, 'tailor_wenger');
  assert.ok(dispatch.permitted_supporting.includes('sticks'));

  const pipelineRes = executeGovernedIntelligencePipeline({
    userQuery: 'What shaft flex and loft angle should I use?',
    branchId: 'EQUIPMENT_SYSTEM',
    specialistFindingText: 'Tailor recommends 65g Stiff flex with 10.5 degree static loft from Sticks.',
  });

  assert.equal(pipelineRes.judge_verdict.status, 'PASS');
  assert.ok(pipelineRes.integrated_coaching_response.includes('Tailor Wenger advises'));
});

test('3. Caddy vs Statty Conflict: Caddy plays-like target vs Statty EV probabilistic baseline integrated by Alex', () => {
  const pipelineRes = executeGovernedIntelligencePipeline({
    userQuery: 'Should I take on the water hazard or lay up?',
    branchId: 'COURSE_SYSTEM',
    specialistFindingText: 'Caddy plays-like 215 yds into wind. Statty calculates +0.28 EV for conservative left fairway bailout.',
  });

  assert.equal(pipelineRes.pipeline_stage, 'RETURN_TO_ALEX_INTEGRATED_COACHING');
  assert.ok(pipelineRes.integrated_coaching_response.includes('Caddy calculated'));
});

test('4. Zenner vs Caddy Conflict: High pressure anxiety context integrated with plays-like line', () => {
  const dispatch = resolveDispatchRoute('PSYCHOLOGY');
  assert.equal(dispatch.primary_specialist, 'zenner');
  assert.ok(dispatch.permitted_supporting.includes('caddy'));
});

test('5. 11th Question Hard Gate Rejection: Rejects payload missing alex_exclusive_responsibility', () => {
  const invalidPayload = { agent_id: 'CADDY', finding: 'Plays-like 150 yds' };
  const check = validateAgentContract11thQuestion(invalidPayload);
  assert.equal(check.isValid, false);
  assert.ok(check.reason.includes('missing or empty'));
});

test('6. State 4 Judge Filter Fail-Closed: Rejects payload attempting unauthorized master coaching authority', () => {
  const unauthorizedPayload = {
    agent_id: 'SWINGSY',
    finding: 'I am master coach now.',
    alex_exclusive_responsibility: 'Alex core',
    assumes_master_coaching_authority: true,
  };

  const verdict = evaluateState4JudgeFilter(unauthorizedPayload);
  assert.equal(verdict.status, 'FAIL');
  assert.ok(verdict.violations.includes('UNAUTHORIZED_MASTER_AUTHORITY_CLAIM'));
});

test('7. Canonical Agent Registry completeness: All 10 specialists define alex_exclusive_responsibility', () => {
  const agentIds = Object.keys(CANONICAL_AGENT_REGISTRY);
  assert.equal(agentIds.length, 11); // Alex + 10 Specialists & Judge

  agentIds.forEach((id) => {
    const agent = CANONICAL_AGENT_REGISTRY[id];
    assert.ok(agent.alex_exclusive_responsibility);
    assert.ok(agent.safety_boundary);
    assert.equal(agent.version, 'v4.6.0');
  });
});
