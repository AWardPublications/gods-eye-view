import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AlexWengerKnowledgeEngine } from '../core/knowledge/alexWengerKnowledgeEngine.js';

test('1. AWK-TECH-001 — Deterministic DNSL Spine & Reconstruction Principle', () => {
  const engine = new AlexWengerKnowledgeEngine();

  const techBlock = engine.getBlock('AWK-TECH-001');
  assert.ok(techBlock !== null);
  assert.equal(techBlock.origin, 'NOTEBOOKLM_NOTEBOOK_352D4DCA');
  assert.equal(techBlock.content.spine_nodes_count, 11);
  assert.equal(techBlock.content.entry_node, 'IN-001');
  assert.equal(techBlock.content.replay_node, 'REPLAY-001');
  assert.ok(techBlock.content.reconstruction_principle.includes('Nothing is trusted because it happened'));
});

test('2. AWK-GOV-001 — Prohibited Verbs Hard Block & Vocabulary Gating', () => {
  const engine = new AlexWengerKnowledgeEngine();

  // Test 1: Compliant non-authoritative support statement
  const compliantResult = engine.validateVocabularyGating('Mais oui, my friend! You have 150 yards to the center of the green.');
  assert.equal(compliantResult.isCompliant, true);
  assert.equal(compliantResult.detectedProhibitedTerms.length, 0);

  // Test 2: Non-compliant statement containing prohibited terms 'recommend' and 'best'
  const nonCompliantResult = engine.validateVocabularyGating('I recommend taking your 7-iron for the best outcome.');
  assert.equal(nonCompliantResult.isCompliant, false);
  assert.ok(nonCompliantResult.detectedProhibitedTerms.includes('recommend'));
  assert.ok(nonCompliantResult.detectedProhibitedTerms.includes('best'));

  // Test 3: Sanitization replaces prohibited terms with non-authoritative support language
  assert.ok(!nonCompliantResult.sanitizedText.toLowerCase().includes('recommend'));
  assert.ok(!nonCompliantResult.sanitizedText.toLowerCase().includes('best'));
  assert.ok(nonCompliantResult.sanitizedText.includes('suggest options for'));
  assert.ok(nonCompliantResult.sanitizedText.includes('high-probability'));
});

test('3. AWK-STAT-001 — Mark Broadie Strokes Gained & True Averages Matrix', () => {
  const engine = new AlexWengerKnowledgeEngine();

  const statBlock = engine.getBlock('AWK-STAT-001');
  assert.ok(statBlock !== null);
  assert.equal(statBlock.content.analytics_engine, 'Mark_Broadie_Strokes_Gained');
  assert.equal(statBlock.content.baseline_metric, 'True_Statistical_Average_Distances');
  assert.equal(statBlock.content.prohibited_baseline, 'Historical_Best_Ever_Outings');
});
