import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PIPELINE_STATES,
  DOMAIN_RESOLUTIONS,
  MODE_INVOCATION_MATRIX,
  executeV4StatePipeline,
} from '../core/architecture/masterArchitectureV4.js';

test('DOMAIN_RESOLUTIONS eliminates equipment and game system collisions', () => {
  // Tailor vs Sticks
  assert.equal(DOMAIN_RESOLUTIONS.EQUIPMENT_SYSTEM.TAILOR.title, 'Dynamic Swing & Feel Optimizer');
  assert.equal(DOMAIN_RESOLUTIONS.EQUIPMENT_SYSTEM.STICKS.title, 'Static Component & Build Engineer');
  assert.ok(DOMAIN_RESOLUTIONS.EQUIPMENT_SYSTEM.TAILOR.scope.includes('Dynamic shaft bend'));
  assert.ok(DOMAIN_RESOLUTIONS.EQUIPMENT_SYSTEM.STICKS.scope.includes('Static clubhead loft'));

  // Caddy vs Statty
  assert.equal(DOMAIN_RESOLUTIONS.GAME_SYSTEM.CADDY.title, 'Real-Time On-Course Execution Agent');
  assert.equal(DOMAIN_RESOLUTIONS.GAME_SYSTEM.STATTY.title, 'Offline Post-Round & Strategic EV Modeling Agent');
});

test('MODE_INVOCATION_MATRIX maps all 10 conversational modes to invocation boundaries', () => {
  const modes = Object.keys(MODE_INVOCATION_MATRIX);
  assert.equal(modes.length, 10);

  assert.equal(MODE_INVOCATION_MATRIX.Rules.primary, 'JUDGE');
  assert.equal(MODE_INVOCATION_MATRIX.Strategy.primary, 'CADDY');
  assert.equal(MODE_INVOCATION_MATRIX.Psychology.primary, 'ZENNER');
});

test('executeV4StatePipeline runs complete 6-state pipeline from ingestion to return to Alex', () => {
  const trace = executeV4StatePipeline({
    userQuery: 'What is the penalty for out of bounds under Rule 18.2?',
  });

  assert.equal(trace.pipeline_version, 'V4.0.0');
  assert.equal(trace.states.length, 6);
  assert.equal(trace.states[0].state, PIPELINE_STATES.STATE_0_INGESTION);
  assert.equal(trace.states[1].state, PIPELINE_STATES.STATE_1_MODE_SELECTION);
  assert.equal(trace.states[2].state, PIPELINE_STATES.STATE_2_SPECIALIST_DISPATCH);
  assert.equal(trace.states[3].state, PIPELINE_STATES.STATE_3_SPECIALIST_EXECUTION);
  assert.equal(trace.states[4].state, PIPELINE_STATES.STATE_4_JUDGE_FILTER);
  assert.equal(trace.states[5].state, PIPELINE_STATES.STATE_5_RETURN_TO_ALEX);
  assert.ok(trace.final_output.includes('Mais oui'));
});
