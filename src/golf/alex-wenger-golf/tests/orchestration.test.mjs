import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PERSONA_INTERACTION_MATRIX, getInteractionFlow } from '../core/orchestration/interactionMatrix.js';
import { resolveSpeakerOrchestration, enforceDeduplicationGuard } from '../core/orchestration/orchestratorEngine.js';

test('PERSONA_INTERACTION_MATRIX accurately defines primary expertise, needs from, and can contribute to for all 9 personas', () => {
  const expectedPersonas = ['PUTTSER', 'Statty', 'Judge', 'Zenner', 'Swingsy', 'Fitty', 'Caddy', 'Sticks', 'Al'];

  for (const pName of expectedPersonas) {
    const flow = getInteractionFlow(pName);
    assert.ok(flow, `Missing flow for ${pName}`);
    assert.equal(flow.persona, pName);
    assert.ok(Array.isArray(flow.needs_from));
    assert.ok(Array.isArray(flow.can_contribute_to));
    assert.ok(flow.key_question.length > 0);
  }
});

test('resolveSpeakerOrchestration assigns primary claims and triggers 2-person debate for ambiguous queries', () => {
  // Rules query -> Judge owns outright
  const judgeRes = resolveSpeakerOrchestration('What is the rule for an unplayable ball?');
  assert.equal(judgeRes.primarySpeaker, 'Judge');
  assert.equal(judgeRes.supportingSpeaker, null);
  assert.equal(judgeRes.isDebate, false);

  // Swing slice query -> Swingsy + Sticks 2-person debate
  const debateRes = resolveSpeakerOrchestration('Why did I slice my drive so badly?');
  assert.equal(debateRes.primarySpeaker, 'Swingsy');
  assert.equal(debateRes.supportingSpeaker, 'Sticks');
  assert.equal(debateRes.isDebate, true);
});

test('enforceDeduplicationGuard prevents symposium bloat by filtering substantially duplicate advice', () => {
  const input = [
    { speaker: 'Swingsy', contribution: 'Take 1 extra club into the wind and stay smooth.' },
    { speaker: 'Caddy', contribution: 'Take 1 extra club into the wind and stay smooth.' },
  ];

  const filtered = enforceDeduplicationGuard(input);
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].speaker, 'Swingsy');
});
