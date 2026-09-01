import { test } from 'node:test';
import assert from 'node:assert/strict';
import { retrieveRulesFact } from '../knowledge/rulesRetrieval.js';
import { createUserGolfMemory, updateUserGolfMemory } from '../core/memory/userMemory.js';
import { DAVID_WARD_PERSONA, generateAlexDavidDialogue } from '../core/conversation/davidWardBanter.js';
import { detectIntent, processAlexWengerRequest, INTENT_TYPES } from '../core/conversation/intentRouter.js';

test('retrieveRulesFact retrieves canonical evidence and handles missing queries without inventing rulings', () => {
  const obResult = retrieveRulesFact('My drive was hit out of bounds');
  assert.equal(obResult.found, true);
  assert.equal(obResult.rule.rule_number, '18.2');
  assert.ok(obResult.confidence >= 0.90);

  const unknownResult = retrieveRulesFact('What happens if a bird flies away with my hotdog?');
  assert.equal(unknownResult.found, false);
  assert.equal(unknownResult.rule, null);
  assert.equal(unknownResult.confidence, 0.0);
});

test('Rules pathway returns official evidence rendered in Alex personality without raw encyclopedia dumping', () => {
  const response = processAlexWengerRequest({ userQuery: 'What is the penalty for out of bounds?' });
  assert.equal(response.intent, INTENT_TYPES.RULES_QUERY);
  assert.equal(response.rules_pathway, true);
  assert.equal(response.ground_truth_found, true);
  assert.equal(response.rule_number, '18.2');
  assert.ok(response.alex_response.includes('mischievous part of the Rules'));
});

test('Rules pathway refuses to invent a ruling when evidence confidence is insufficient', () => {
  const response = processAlexWengerRequest({ userQuery: 'Can I hit off a solar panel?' });
  assert.equal(response.rules_pathway, true);
  assert.equal(response.ground_truth_found, false);
  assert.ok(response.alex_response.includes('I will not guess a ruling'));
});

test('userMemory creates structured profile and updates user-controlled fields cleanly', () => {
  const initial = createUserGolfMemory({ handicap: 12.0, skill_level: 'intermediate' });
  assert.equal(initial.handicap, 12.0);

  const updated = updateUserGolfMemory(initial, { handicap: 10.5, strengths: ['driver distance'] });
  assert.equal(updated.handicap, 10.5);
  assert.deepEqual(updated.strengths, ['driver distance']);
});

test('generateAlexDavidDialogue renders a multi-turn conversation between Alex and David Ward', () => {
  const script = generateAlexDavidDialogue({ topic: 'bunker rules' });
  assert.equal(script.dialogue.length, 4);
  assert.equal(script.dialogue[0].speaker, 'David Ward');
  assert.equal(script.dialogue[1].speaker, 'Alex Wenger');
  assert.ok(script.dialogue[2].text.includes('Wait a second, Alex'));
});
