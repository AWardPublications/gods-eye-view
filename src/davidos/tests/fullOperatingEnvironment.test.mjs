import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AgentFoundryEngine } from '../agentFoundryEngine.mjs';
import { WorkflowFoundryFullEngine } from '../workflowFoundryFullEngine.mjs';
import { TriadicRegistryEngine } from '../triadicRegistryEngine.mjs';
import { WorkflowGapAnalysisEngine } from '../workflowGapAnalysisEngine.mjs';
import { WorkflowCompilerEngine } from '../workflowCompilerEngine.mjs';
import { EmbassyLiveProofEngine } from '../embassyLiveProofEngine.mjs';

test('68_Agent_Foundry_Machine_Readable_Registry: Machine-readable agent registry stores capabilities & risk ceilings', () => {
  const foundry = new AgentFoundryEngine();
  const agent = foundry.getAgent('agent_grant_gedhi_provisioner');

  assert.equal(agent.role, 'Sub-12s European Funding Capture Chair');
  assert.equal(agent.riskClass, 'HIGH');
  assert.equal(agent.financialCeilingEur, 50000);
});

test('69_Workflow_Foundry_Full_Lifecycle: Creates governed workflow specification with evidence requirements', () => {
  const wfFoundry = new WorkflowFoundryFullEngine();
  const spec = wfFoundry.createGovernedWorkflowSpec('Player Assessment', 'Assess player physical baseline', 'Alex Wenger', ['agent_wenger_ballistics'], ['INTAKE', 'SOLVE', 'AUDIT']);

  assert.equal(spec.owner_character, 'Alex Wenger');
  assert.equal(spec.status, 'GOVERNED');
  assert.ok(spec.workflow_hash.length === 64);
});

test('70_Triadic_Registry_Character_Workflow_Agent_Binding: Validates exact triadic binding between character, workflow, and agent', () => {
  const triadic = new TriadicRegistryEngine();
  const res = triadic.validateTriadicBinding('Alex Wenger', 'Swing Analysis', 'agent_wenger_ballistics');

  assert.equal(res.valid, true);
  assert.ok(res.bindingHash.length === 64);
});

test('71_Workflow_Gap_Analysis_Self_Expansion: Gap analysis identifies missing workflows and proposes expansions', () => {
  const gapEngine = new WorkflowGapAnalysisEngine();
  const gaps = gapEngine.analyzeCharacterGaps('Alex Wenger');

  assert.equal(gaps.character, 'Alex Wenger');
  assert.ok(gaps.identifiedGapsCount > 0);
  assert.equal(gaps.selfExpansionReady, true);
});

test('72_Workflow_Compiler_16_Governed_Primitives: Compiler compiles intent using 16 governed primitives', () => {
  const compiler = new WorkflowCompilerEngine();
  const compiled = compiler.compileMissionToExecutableWorkflow('Audit grant eligibility', 'Grant GEDHI');

  assert.equal(compiled.persona, 'Grant GEDHI');
  assert.ok(compiled.pipeline.length >= 5);
  assert.ok(compiled.primitives_used.includes('AUDIT'));
});

test('73_Embassy_Live_Proof_001_Execution: Executes independent user journey with live proof metrics', () => {
  const proofEngine = new EmbassyLiveProofEngine();
  const proof = proofEngine.executeLiveProof('stranger_user_99', 'Build a cultural archive and book store');

  assert.equal(proof.status, 'EXECUTED_SUCCESSFULLY');
  assert.equal(proof.metrics.taskCompletionRatePercent, 100.0);
  assert.ok(proof.proof_hash.length === 64);
});
