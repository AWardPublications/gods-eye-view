import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AgentBuildContractEngine } from '../foundry/agentBuildContractEngine.mjs';
import { AgentMaturityScoreEngine } from '../foundry/agentMaturityScoreEngine.mjs';
import { AgentFoundryEngine } from '../foundry/agentFoundryEngine.mjs';

test('45_Agent_Foundry_Sandbox_Isolation: Agent build workspace enforces path boundaries', () => {
  const contractEngine = new AgentBuildContractEngine();
  const contractRes = contractEngine.createMissionContract('INSTITUTIONAL-BRIDGE-001', 'Build IIIF Bridge', 'Construct IIIF Manifest Transformer');
  const contract = contractRes.contract;

  // Valid sandbox action
  const validCheck = contractEngine.validateAction(contract, 'create', 'agent-build-space/missions/INSTITUTIONAL-BRIDGE-001/adapters/iiifAdapter.js');
  assert.equal(validCheck.allowed, true);

  // Invalid path violation
  const invalidCheck = contractEngine.validateAction(contract, 'create', 'src/governance/coreKernel.js');
  assert.equal(invalidCheck.allowed, false);
  assert.equal(invalidCheck.status, 'WORKSPACE_VIOLATION_BLOCKED');
});

test('47_Mission_Contract_Enforcement: Forbidden constitutional modifications fail closed', () => {
  const contractEngine = new AgentBuildContractEngine();
  const contract = contractEngine.createMissionContract('MISSION-001', 'Build Adapter', 'Objective X').contract;

  const forbiddenCheck = contractEngine.validateAction(contract, 'modify_constitutional_kernel', 'agent-build-space/missions/MISSION-001/kernel.js');
  assert.equal(forbiddenCheck.allowed, false);
  assert.equal(forbiddenCheck.status, 'FORBIDDEN_ACTION_BLOCKED');
});

test('46_Agent_Maturity_Scoring: Agent maturity score assigns bounded delegation tier', () => {
  const maturityEngine = new AgentMaturityScoreEngine();
  const scoreRes = maturityEngine.calculateScore({ accuracy: 20, governance: 20, evidence: 15, tests: 15, escalation: 10, intentLineage: 10, failureHandling: 5, humanCollab: 5 });

  assert.equal(scoreRes.totalScore, 100);
  assert.equal(scoreRes.tier, 'HIGH_TRUST_DELEGATED');
  assert.equal(scoreRes.humanAcceptanceAlwaysRequired, true);
});

test('48_Agent_Squad_Orchestration & 49_Autonomous_Promotion_Gate: Governed build loop requires human signoff to promote', () => {
  const foundry = new AgentFoundryEngine();
  const loopRes = foundry.executeMissionFoundryLoop('INSTITUTIONAL-BRIDGE-001', 'Build Governed Institutional Bridge', 'Demonstrate agentic build loop');

  assert.equal(loopRes.status, 'AGENT_FOUNDRY_LOOP_SUCCESSFUL');
  assert.equal(loopRes.promotionRequest.status, 'PROMOTION_REQUESTED_WAITING_HUMAN_ACCEPTANCE');

  // Attempt unauthorized promotion without GPG signature
  const rejected = foundry.promoteToMainSystem(loopRes.promotionRequest, { status: 'APPROVED', gpgKey: 'UNAUTHORIZED_KEY' });
  assert.equal(rejected.promoted, false);

  // Authorized promotion with GPG 0x80D0ADA1
  const promoted = foundry.promoteToMainSystem(loopRes.promotionRequest, { status: 'APPROVED', gpgKey: '0x80D0ADA1' });
  assert.equal(promoted.promoted, true);
  assert.equal(promoted.status, 'PROMOTED_TO_MAIN_SYSTEM');
});
