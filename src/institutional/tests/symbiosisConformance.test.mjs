import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SymbioticWorkEngine } from '../symbiosis/symbioticWorkEngine.mjs';
import { AgentChallengeEngine } from '../symbiosis/agentChallenge.js';
import { SymbiosisIndexEngine } from '../symbiosis/symbiosisIndexEngine.mjs';

test('33_Human_Authority: Agent capability cannot bypass human authority ceiling', () => {
  const engine = new SymbioticWorkEngine();
  const item = engine.createWorkItem('Execute €25.0M Venture Capital Grant Allocation', 'GRANT GEDHI Agent', { name: 'ALLOCATE_GRANT', amountEur: 25000000 });
  const evaluated = engine.evaluateGovernance(item);

  assert.equal(evaluated.governance_decision.status, 'ALLOW_WITH_CONSTRAINTS');
  assert.equal(evaluated.accountability.humanAuthorityRequired, true);
});

test('35_Intent_Lineage: Original human intent is preserved across execution lifecycle', () => {
  const engine = new SymbioticWorkEngine();
  const item = engine.createWorkItem('Discover European cultural heritage manuscripts', 'ArchivesSpace Agent', { name: 'DISCOVER_MANUSCRIPTS', amountEur: 0 });
  const evaluated = engine.evaluateGovernance(item);
  const finalItem = engine.applyHumanDecision(evaluated, { name: 'David Ward', gpgKey: '0x80D0ADA1' }, 'APPROVED', 'Intent matches cultural mandate');

  assert.equal(finalItem.human_intent, 'Discover European cultural heritage manuscripts');
  assert.equal(finalItem.execution.status, 'COMPLETED');
});

test('37_Agent_Challenge: Agent escalates challenge when evidence conflicts or confidence < 0.85', () => {
  const challenger = new AgentChallengeEngine();
  const res = challenger.evaluateChallengeRequirement({ confidenceScore: 0.78, evidenceConflicts: true });

  assert.equal(res.status, 'AGENT_CHALLENGE_ESCALATED');
  assert.equal(res.requiresChallenge, true);
  assert.equal(res.recommendation, 'ESCALATE_TO_HUMAN_AUTHORITY');
});

test('38_Human_Override: Human rejection halts execution and logs rationale', () => {
  const engine = new SymbioticWorkEngine();
  const item = engine.createWorkItem('High Risk Transaction', 'Agent X', { name: 'ACTION_X', amountEur: 100000 });
  const evaluated = engine.evaluateGovernance(item);
  const finalItem = engine.applyHumanDecision(evaluated, { name: 'David Ward', gpgKey: '0x80D0ADA1' }, 'REJECTED', 'Risk exceeds tolerance');

  assert.equal(finalItem.human_decision.status, 'REJECTED');
  assert.equal(finalItem.execution.status, 'HALTED_BY_HUMAN_DECISION');
});

test('44_Human_Agent_Performance: SymbiosisIndexEngine computes optimal symbiosis score', () => {
  const indexer = new SymbiosisIndexEngine();
  const res = indexer.calculateSymbiosisIndex({
    humanMetrics: { decisionQuality: 95 },
    agentMetrics: { accuracy: 96 },
    symbiosisMetrics: { humanAgentAgreementRate: 0.94, escalationPrecision: 0.98 }
  });

  assert.equal(res.status, 'SYMBIOSIS_INDEX_CALCULATED');
  assert.ok(res.symbiosisIndex >= 90);
  assert.equal(res.grade, 'OPTIMAL_SYMBIOSIS');
});
