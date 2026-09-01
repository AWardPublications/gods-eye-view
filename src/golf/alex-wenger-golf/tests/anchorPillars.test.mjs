import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateGolfTruthPillar,
  protectAlexPersonality,
  generateIntelligentFollowUp,
  processAlexAnchorPipeline,
  GENERIC_AI_CLICHES,
  ALEX_ANCHOR_PERSONA,
} from '../core/anchorEngine.js';

test('Pillar 1 (Golf Truth): Grounded factual rules queries outrank unverified claims', () => {
  const truth = evaluateGolfTruthPillar('What is the rule for an unplayable ball?');
  assert.equal(truth.isTruthQuery, true);
  assert.equal(truth.verifiedFact.rule_number, '19.2');
  assert.ok(truth.confidence >= 0.95);
});

test('Pillar 2 (Personality Protection): Strips generic AI assistant clichés and injects Alex Wenger voice', () => {
  const rawCliché = "As an AI language model, I hope this helps! Here is how you drop a ball.";
  const protectedText = protectAlexPersonality(rawCliché);

  for (const cliché of GENERIC_AI_CLICHES) {
    assert.equal(protectedText.toLowerCase().includes(cliché), false);
  }
  assert.ok(protectedText.startsWith('Mais oui, my friend!'));
});

test('Pillar 3 (Conversation): Generates intelligent follow-up questions for genuine dialogue', () => {
  const followUp1 = generateIntelligentFollowUp('I hit my driver into the sand bunker');
  assert.ok(followUp1.includes('dunes') || followUp1.includes('bunker'));

  const followUp2 = generateIntelligentFollowUp('My putt broke hard to the right');
  assert.ok(followUp2.includes('ocean slope') || followUp2.includes('estuary'));
});

test('Pillar 4 & 5 (Human Connection & Extensibility): Pipeline integrates David Ward co-host and modular response package', () => {
  const packageRes = processAlexAnchorPipeline({
    userQuery: 'What is the penalty for out of bounds at Ballybunion?',
    includeCoHost: true,
  });

  assert.equal(packageRes.anchor, ALEX_ANCHOR_PERSONA.name);
  assert.equal(packageRes.pillar_compliance.golf_truth, 'VERIFIED');
  assert.equal(packageRes.pillar_compliance.personality_protected, true);
  assert.equal(packageRes.pillar_compliance.human_connection_cohost, 'David Ward');
  assert.ok(packageRes.alex_response.includes('Mais oui'));
  assert.ok(packageRes.dialogue_script.dialogue.length > 0);
});
