import { test } from 'node:test';
import assert from 'node:assert/strict';
import { UserWorkspaceEngine } from '../userWorkspaceEngine.mjs';
import { WorkflowFoundryEngine } from '../../institutional/foundry/workflowFoundryEngine.mjs';
import { CharacterRuntimeEngine } from '../characterRuntimeEngine.mjs';
import { WorkflowMarketplaceEngine } from '../workflowMarketplaceEngine.mjs';
import { PersonalAiTeamBuilderEngine } from '../personalAiTeamBuilderEngine.mjs';

test('53_Personal_Mission_Engine: User creates personal mission via shortcut button', () => {
  const workspace = new UserWorkspaceEngine();
  const mission = workspace.createPersonalMission('user_50k_01', 'Apply for European grant funding', 'btn_funding');

  assert.equal(mission.user_id, 'user_50k_01');
  assert.equal(mission.shortcut_used, 'btn_funding');
  assert.equal(mission.status, 'WORKFLOW_ASSEMBLED');
  assert.ok(mission.assigned_team.includes('Grant GEDHI'));
});

test('54_Workflow_Foundry_Construction: Workflow Foundry constructs workflow autonomously from intent', () => {
  const foundry = new WorkflowFoundryEngine();
  const wf = foundry.constructWorkflowFromIntent('Build a marketing campaign for CorkMan TCG', 'corkonian');

  assert.equal(wf.domain, 'corkonian');
  assert.equal(wf.construction_lifecycle.test, 'PASSED_100_PERCENT_GREEN');
  assert.ok(wf.workflow_hash.length === 64);
});

test('55_Character_Runtime_Execution: Character runtime executes character action with evidence', () => {
  const runtime = new CharacterRuntimeEngine();
  const res = runtime.executeCharacterAction('char_alex_wenger', 'wf_golf_01', 'BALLISTICS_AUDIT');

  assert.equal(res.status, 'CHARACTER_ACTION_EXECUTED');
  assert.equal(res.character, 'Alex Wenger');
  assert.ok(res.evidence.actionHash.length === 64);
});

test('56_Workflow_Marketplace_Forking: User installs and forks marketplace workflow', () => {
  const marketplace = new WorkflowMarketplaceEngine();
  const installRes = marketplace.installWorkflow('wf_grant_01', 'user_50k_02');

  assert.equal(installRes.status, 'WORKFLOW_INSTALLED_SUCCESSFULLY');

  const forkedWf = marketplace.forkWorkflow('wf_grant_01', 'user_50k_02', 'My Custom Swiss Grant Workflow');
  assert.equal(forkedWf.name, 'My Custom Swiss Grant Workflow');
  assert.equal(forkedWf.author, 'user_50k_02');
});

test('57_Personal_AI_Team_Builder: System builds custom AI team for user business', () => {
  const teamBuilder = new PersonalAiTeamBuilderEngine();
  const team = teamBuilder.buildCustomTeam('user_50k_03', 'Launch an online publication house');

  assert.equal(team.user_id, 'user_50k_03');
  assert.equal(team.assembled_characters.length, 5);
  assert.equal(team.governance_controls.gpgKey, '0x80D0ADA1');
});
