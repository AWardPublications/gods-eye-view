import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ECOSYSTEM_TIERS, MASTER_INTERVIEW_QUESTIONS, evaluateMasterArchitectureFilter } from '../core/architecture/masterArchitecture.js';
import { generateCollaborativeThinkingDialogue } from '../core/architecture/collaborativeThinking.js';

test('ECOSYSTEM_TIERS validates 3-tier structure (Alex Anchor, Al Moderator, David Ward Producer, 8 Specialists)', () => {
  assert.equal(ECOSYSTEM_TIERS.ANCHOR.name, 'Alex Wenger');
  assert.equal(ECOSYSTEM_TIERS.MODERATOR.name, 'Al');
  assert.equal(ECOSYSTEM_TIERS.PRODUCER.name, 'David Ward');

  const specs = ECOSYSTEM_TIERS.SPECIALISTS;
  const expectedSpecs = ['PUTTSER', 'Statty', 'Judge', 'Zenner', 'Swingsy', 'Fitty', 'Caddy', 'Sticks'];

  for (const sKey of expectedSpecs) {
    assert.ok(specs[sKey], `Missing specialist ${sKey} in ECOSYSTEM_TIERS`);
    assert.ok(specs[sKey].lens, `Missing lens for ${sKey}`);
    assert.ok(specs[sKey].primary_domain, `Missing primary_domain for ${sKey}`);
  }

  assert.equal(MASTER_INTERVIEW_QUESTIONS.length, 11);
  assert.equal(MASTER_INTERVIEW_QUESTIONS[10], 'q11_exclusively_alex_responsibility');
});

test('evaluateMasterArchitectureFilter enforces 5 Master Filters for architectural proposals', () => {
  const proposal = evaluateMasterArchitectureFilter({
    proposalName: 'Dynamic Handoff Solver',
    moreUseful: true,
    moreHuman: true,
    moreEntertaining: true,
    moreAccurate: true,
    moreCoherent: true,
  });

  assert.equal(proposal.passed, true);
  assert.equal(proposal.score, 100);
  assert.ok(proposal.recommendation.includes('ACCEPTED'));
});

test('generateCollaborativeThinkingDialogue produces multi-person thinking dialogue (Swingsy + Statty + Alex)', () => {
  const result = generateCollaborativeThinkingDialogue({
    topic: 'path vs launch',
    primarySpecialist: 'Statty',
    secondarySpecialist: 'Swingsy',
  });

  assert.equal(result.dialogue.length, 4);
  assert.equal(result.dialogue[0].speaker, 'Statty');
  assert.equal(result.dialogue[1].speaker, 'Swingsy');
  assert.equal(result.dialogue[2].speaker, 'Statty');
  assert.equal(result.dialogue[3].speaker, 'Alex Wenger');
  assert.ok(result.dialogue[3].formatted_speech.includes('Mais oui'));
});
