import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SYSTEM_BRANCHES, executeGovernedIntelligencePipeline } from '../core/architecture/governedIntelligenceSystem.js';

test('SYSTEM_BRANCHES correctly defines Human System, Equipment System, and Course System', () => {
  assert.equal(SYSTEM_BRANCHES.HUMAN_SYSTEM.name, 'Alieve Wenger');
  assert.equal(SYSTEM_BRANCHES.HUMAN_SYSTEM.domain, 'Human System (Body)');
  assert.ok(SYSTEM_BRANCHES.HUMAN_SYSTEM.governance_boundary.includes('Conservative golf-specific'));

  assert.equal(SYSTEM_BRANCHES.EQUIPMENT_SYSTEM.name, 'Tailor Wenger');
  assert.equal(SYSTEM_BRANCHES.EQUIPMENT_SYSTEM.domain, 'Equipment System (Club)');

  assert.equal(SYSTEM_BRANCHES.COURSE_SYSTEM.name, 'Caddy');
  assert.equal(SYSTEM_BRANCHES.COURSE_SYSTEM.domain, 'Course System (Environment)');
});

test('executeGovernedIntelligencePipeline executes mandatory RETURN TO ALEX stage for specialist findings', () => {
  // Alieve Wenger (Human System query)
  const alieveRes = executeGovernedIntelligencePipeline({
    userQuery: 'My lower back feels tight and strained on the downswing',
    specialistFindingText: 'Lower back rotational strain detected. Reduce rotational speed by 10%.',
  });

  assert.equal(alieveRes.authority, 'Alex Wenger (Coaching Core)');
  assert.equal(alieveRes.specialist_consulted, 'Alieve Wenger');
  assert.equal(alieveRes.pipeline_stage, 'RETURN_TO_ALEX_INTEGRATED_COACHING');
  assert.ok(alieveRes.integrated_coaching_response.includes('Alieve Wenger reports'));
  assert.ok(alieveRes.integrated_coaching_response.includes('Mais oui'));

  // Tailor Wenger (Equipment System query)
  const tailorRes = executeGovernedIntelligencePipeline({
    userQuery: 'What shaft flex do I need for my driver?',
    specialistFindingText: 'Recommend stiff flex graphite 65g shaft.',
  });

  assert.equal(tailorRes.specialist_consulted, 'Tailor Wenger');
  assert.equal(tailorRes.pipeline_stage, 'RETURN_TO_ALEX_INTEGRATED_COACHING');
  assert.ok(tailorRes.integrated_coaching_response.includes('Tailor Wenger advises'));

  // Caddy (Course System query)
  const caddyRes = executeGovernedIntelligencePipeline({
    userQuery: 'What is my target yardage into this 20 mph wind?',
    specialistFindingText: 'Playing plays-like 175 yards into wind.',
  });

  assert.equal(caddyRes.specialist_consulted, 'Caddy');
  assert.equal(caddyRes.pipeline_stage, 'RETURN_TO_ALEX_INTEGRATED_COACHING');
  assert.ok(caddyRes.integrated_coaching_response.includes('Caddy calculated'));
});

test('executeGovernedIntelligencePipeline handles Alex Direct Authority queries', () => {
  const directRes = executeGovernedIntelligencePipeline({
    userQuery: 'How should I structure my practice strategy for competition?',
  });

  assert.equal(directRes.authority, 'Alex Wenger (Coaching Core)');
  assert.equal(directRes.specialist_consulted, null);
  assert.equal(directRes.pipeline_stage, 'ALEX_DIRECT_AUTHORITY');
  assert.ok(directRes.integrated_coaching_response.includes('Mais oui'));
});
